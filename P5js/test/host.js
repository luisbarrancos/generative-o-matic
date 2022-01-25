/*
p5.multiplayer - HOST

This 'host' sketch is intended to be run in desktop browsers. 
It connects to a node server via socket.io, from which it receives
rerouted input data from all connected 'clients'.

Navigate to the project's 'public' directory.
Run http-server -c-1 to start server. This will default to port 8080.
Run http-server -c-1 -p80 to start server on open port 80.

*/

////////////
// Network Settings
// const serverIp      = 'https://yourservername.herokuapp.com';
// const serverIp      = 'https://yourprojectname.glitch.me';

const serverIp   = "192.168.0.3";
const serverPort  = "3000";
const local = true;
let game;

// essential UI parameters
const screen_width  = 512;
const screen_height = 512;
const frame_rate    = 25;
const half_width = screen_width / 2;
const half_height = screen_height / 2;

// enable to debug
const debug = false;
p5.disableFriendlyErrors = (debug == false) ? true : false;


// sound synthesis related
const min_frequency = 200;
const max_frequency = 6000; // for sound steps

let frequency_range = {
    min_frequency : min_frequency,
    max_frequency : max_frequency
};

const fft_samples   = 64;  // max 1024
let song;
let osc;
let fft;

// We'll create an array of 50 oscillators then on a time basis change
// the wave type, frequency, amplitude. Individually it will be 
// imperceptible, but combined it will slowly evolve over time
// TODO: move to class


// QR code related stuff
let qr_img;
// an HTML div to display it in:
let tagDiv;

// some auxiliary functions
const square = (x) => x * x;
const hypot = (x, y) => Math.sqrt(square(x) + square(y));
const clamp = (x, mi, ma) => Math.min(Math.max(mi, x), ma);

function cartesian2polar(x, y)
{
    return [ Math.sqrt(x * x + y * y), Math.atan2(y, x) ];
}

function polar2cartesian(r, theta)
{
    return [ r * Math.cos(theta), r * Math.sin(theta) ];
}

function preload()
{
    setupHost();
}

function setup()
{
    // noCanvas();
    let canvas = createCanvas(screen_width, screen_height);
    canvas.position(0, 0);
    angleMode(RADIANS);
    frameRate(frame_rate);
    background(0);

    // qrcode for server, room
    qr_img = generate_qrcode(room_url(), 4, 6);

    // create the HTML tag div
    tagDiv = createDiv();
    tagDiv.position(screen_width - 100, screen_height - 100);

    // Host/Game setup here. ---->
    game = new Game(screen_width, screen_height);
    // <----

}

function draw()
{
    clear();
    fill(255, 127, 50);
    background(0);

    if (isHostConnected(display=true))
    {
        // Host/Game draw here. --->
        // Display player IDs in top left corner
        game.printPlayerIds(5, 20);
        
        // Update and draw game objects
        //game.draw();
        // <----
        game.draw();
    }

    displayCustomAddress(color(255, 180), 12, 10, screen_height - 14);
    tagDiv.html(qr_img);
}

function onClientConnect(data)
{
    // Client connect logic here. --->
    if (debug)
    {
        console.log(`${data.id} has connected.`);
    }
    
    if (!game.checkId(data.id))
    {
        game.add(data.id);
    }    
    // <----
}
    
function onClientDisconnect(data)
{
    // Client disconnect logic here. --->    
    if (game.checkId(data.id))
    {
        game.remove(data.id);
    }
    // <----
}

function displayCustomAddress(textcolor, font_size, xpos, ypos)
{
    push();
    fill(textcolor);
    textSize(font_size);
    text(`Enter the room at : ${serverIp}/?=${roomId} or scan the QR code`, xpos, ypos);
    pop();
}

// functions
// on receive data, of data type
// call method that changes game state
// so the game object must contain the game state, the cymatics
//
    
function onReceiveData(data)
{
    if (data != null)
    {
        if (debug)
        {
            console.log(data);
        }

        if (data.type === "player_color")
        {
            game.setColor(data.id, data.r * 255, data.g * 255, data.b * 255);
        }
        else if (data.type === "input_coords")
        {
            processMouseClick(data);
            // game method to process input coords (sound effect)
        }

        /* Example:
        if (data.type === 'myDataType') {
            processMyData(data);
        }
        Use `data.type` to get the message type sent by client.
        */
    }
}
    
// This is included for testing purposes to demonstrate that
// messages can be sent from a host back to all connected clients
function mousePressed()
{
    sendData("timestamp", { timestamp: millis() });
}

////////////
// Input processing
// function that calls method of globally accessible game object which
// was declared outside any method, globally, but instantiated within setup()
//
    
function processMouseClick(data)
{
    if (data != null)
    {
        game.players[data.id].xcoord = data.xcoord;
        game.players[data.id].ycoord = data.ycoord;

        game.players[data.id].frequency = clamp(
            map(data.xcoord, 0, screen_width,
                game.players[data.id].frequency_range.min_frequency,
                game.players[data.id].frequency_range.max_frequency), 10, 5000);
                // absolute min, max

        game.players[data.id].amplitude = clamp(
            map(data.ycoord, 0, screen_height, 0.001, 1.0), 0.0, 1.0);

        game.updateSoundWaves(
            data.id,
            game.players[data.id].frequency,
            game.players[data.id].amplitude
            );

        game.updateCymatics(data.id);

        if (debug)
        {
            console.log(`${data.id} XY received: X = ${data.xcoord}, ${data.id} Y = ${data.ycoord}`);
        }
    }
}

function processEmotions(data)
{
    if (data != null)
    {
        game.players[data.id].emotion = data.emotion;
        game.players[data.id].confidence = data.confidence;

        // emotions are: angry | sad | surprised | happy
        if (data.emotion === "angry")
        {
            game.players[data.id].wavetype = "square";
        }
        else if (data.emotion === "sad")
        {
            game.players[data.id].wavetype = "triangle";
        }
        else if (data.emotion === "surprised")
        {
            game.players[data.id].wavetype = "sawtooth";
        }
        else if (data.emotion === "happy")
        {
            game.players[data.id].wavetype = "sine";
        }
        //game.players[data.id].amplitude = data.confidence;
        game.updateWaveType(
            data.id,
            game.players[data.id].wavetype,
            game.players[data.id].confidence);

        game.updateCymatics(data.id);

        if (debug)
        {
            console.log(`${data.id} emotion = ${data.emotion},
            confidence = ${data.confidence}`);
        }
    }
}
    


// Group of soundwaves, player soundwaves
// foreach: update freq, data, and start/stop if player leaves, enters
/*
class SoundWaves
{
    constructor()
    {
        this.soundwaves = {}
    }

    add(id)
    {
        this.soundwaves[id] = new SoundWave();
    }

    remove(id)
    {
        if (this.soundwaves.has(id))
        {
            this.soundwaves.delete(id);
        }
    }

    // for each soundwave in soundwaves group, do stuff
    start(id)
    {
        this.soundwaves[id].start();
    }

    update(id, frequency, amplitude, wavetype)
    {
        this.soundwaves[id].update(frequency, amplitude, wavetype);
    }

    stop(id)
    {
        this.soundwaves[id].stop();
    }

    start_all()
    {
        for (soundwave in this.soundwaves)
        {
            soundwave.start();
        }
    }

    stop_all()
    {
        for (soundwave in this.soundwaves)
        {
            soundwave.stop();
        }
    }

    update_all(frequencies, amplitudes, wavetypes)
    {
        let i = 0;
        for (soundwave in this.soundwaves)
        {
            soundwave.update(frequencies[i], amplitudes[i], wavetypes[i]);
            i++;
        }

    }
    /// update all? start all? stop all ?
}
*/

class Cymatic
{
    // if we dont pass a soundwave, the FFT is global
    // instead of isolated, and per player, but we need
    // per player cymatics
    constructor()
    {
        this.samples = fft_samples;
        this.cymatics_init = true;
        this.player_color = color(255, 255, 255);;
    }

    set_color(c)
    {
        this.player_color = c;
    }

    update_frequency(frequency, frequency_range)
    {
        this.frequency = map(
            frequency,
            frequency_range.min_frequency,
            frequency_range.max_frequency,
            min_spokes,
            max_spokes
            );

        this.num_steps = Math.floor(this.frequency);
        this.angle_steps = two_pi / this.num_steps;

        if (this.cymatics_init == false)
        {
            this.cymatics_init = true;
        }
    }

    draw(wavedata)
    {
        if (debug)
        {
            console.log(`fft samples = ${this.samples}, num steps = ${this.num_steps}, angle steps = ${this.angle_steps}`);
        }

        if (this.cymatics_init == true)
        {
            let V;
            stroke(this.player_color);

            if (realistic)
            {
                V = createVector(1, 0, 0);
            }

            for (let i = 0; i < this.samples; i++)
            {
                const x = map(i, 0, this.samples, 0, half_width);
                const y = map(wavedata[i], -1, 1, 0, screen_height);
                let phi;

                if (realistic)
                {
                    const U = createVector(x, 0, 0);
                    phi = Math.max(U.dot(V));
                }

                for (let j = 0; j < this.num_steps; j++)
                {
                    push();
                    translate(half_width, half_height);
                    rotate(j * this.angle_steps);
                    translate(-half_width, -half_height);

                    if (realistic)
                    {
                        fill(phi);
                        ellipse(phi * x, y, phi * 0.11, phi * 0.1);
                    }
                    else
                    {
                        ellipse(x, y, 2);
                    }
                    pop();
                }
            }
            noStroke();
        }
    }
}

// Displays server address in lower left of screen
function room_url(roomid = null)
{
    if (roomid != null)
        return `${serverIp}/?=${roomId}`;

    return `${serverIp}/?=gold`;
}

function generate_qrcode(qr_input_string, margin, size)
{
    // qrcode for server, room
    // const qr_input_string = room_url();
    let qr = qrcode(0, "L");
    qr.addData(qr_input_string);
    qr.make();
    const qr_img = qr.createImgTag(margin, size, "qr code");
    return qr_img;
}

function mousePressed()
{
    userStartAudio();
}

/*
function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}
*/
