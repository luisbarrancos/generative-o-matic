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

const serverIp   = "127.0.0.1";
const serverPort  = "3000";
const local = true;
let game;

// essential UI parameters
const screen_width  = 512;
const screen_height = 512;
const frame_rate    = 25;
const half_width = screen_width / 2;
const half_height = screen_height / 2;
const two_pi        = 2 * Math.PI;

// enable to debug
const debug = false;
p5.disableFriendlyErrors = (debug == false) ? true : false;

// visuals related
let cymatics;
let num_steps    = 8;
let angle_step   = two_pi / num_steps;
const min_spokes = 6;
const max_spokes = 32;
const realistic = false; // leave it

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
    //blendMode(ADD);
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
        else if (data.type === "emotion_results")
        {
            processEmotions(data);
            // game method to process emotion results for cymatics   
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
    
////////////
// Game
// This simple placeholder game makes use of p5.play
class Game
{
    constructor(w, h)
    {
        this.w          = w;
        this.h          = h;
        this.players	= {};
        this.numPlayers	= 0;
        this.id         = 0;
        this.harmonic   = 1;
        // this.soundwaves = new SoundWaves();
    }
    
    add(id)
    {
        this.players[id] = {};
        this.players[id].id = "p" + this.id;
        this.players[id].color = color(255, 255, 255);

        print(this.players[id].id + " added.");

        // we have this.players[id].emotion | confidence | xcoord | ycoord
        // from earlier processMouseClick() and processEmotions()
        //
        this.players[id].frequency_range = {
            "min_frequency" : this.harmonic * min_frequency,
            "max_frequency" : this.harmonic * max_frequency
        };
        this.players[id].soundwave = new SoundWave();
        this.players[id].soundwave.start();

        // main cymatic, per player
        this.players[id].cymatic = new Cymatic();

        // each player gets an harmonic, player one is the fundamental frequency
        // so add the min, max frequency range, and increase by the harmonic
        //this.soundwaves.add(this.players[id].id);
        // to separate frequencies a bit, add a random seed for a 
        // frequency displacement or offset for each player
        // if it becomes non-melodical we can add a simple
        this.id++;
        this.harmonic++;
        this.numPlayers++;
        // add sound wave for each player
    }

    setColor(id, r, g, b)
    {
        this.players[id].color = color(r, g, b);        
        print(this.players[id].id + " color added.");
    }

    getColor(id)
    {
        return this.players[id].color;
    }
        
    remove(id)
    {
        this.players[id].soundwave.stop();
        delete this.players[id];
        this.numPlayers--;
    }

    checkId(id)
    {
        return (id in this.players) ? true : false;
    }
        
    printPlayerIds(x, y)
    {
        push();
        noStroke();
        let c = color(255, 180);
        fill(c);
        textSize(12);
        text(`# players: ${this.numPlayers}`, x, y);

        y = y + 14;

        for (let id in this.players)
        {
            c = this.players[id].color;
            c.setAlpha(180);
            fill(c);
            text(`player ${this.players[id].id}`, x, y);
            y += 16;
        }
        c = color(255, 180);
        fill(c);
        pop();
    }

    updateSoundWaves(id, frequency, amplitude)
    {
        if (debug)
        {
            console.log(`freq = ${frequency}, amp = ${amplitude}`);
        }
        this.players[id].soundwave.update(frequency, amplitude);
    }

    updateWaveType(id, wavetype, confidence)
    {
        this.players[id].soundwave.change_type(wavetype);
        this.players[id].soundwave.scale_frequency(confidence);
    }

    updateCymatics(id)
    {
        this.players[id].cymatic.update_frequency(
            this.players[id].soundwave.frequency(),
            this.players[id].frequency_range);

        //this.players[id].cymatic.set_color(this.players[id].color);
    }

    draw_cymatic(id)
    {
        /*
        this.players[id].cymatic.update_frequency(
            this.players[id].soundwave.frequency(),
            this.players[id].frequency_range);
            */
        this.players[id].cymatic.set_color(this.getColor(id));
        this.players[id].cymatic.draw(this.players[id].soundwave.waveform());
    }

    draw()
    {
        for (let id in game.players)
        {
            this.draw_cymatic(id);
        }
    }
}

// Group of soundwaves, player soundwaves

// sound wave, create an oscillator if there is no player oscillator running
class SoundWave
{
    constructor()
    {
        this.carrier = new p5.Oscillator();
        this.carrier.freq(220);
        this.carrier.setType("sine");
        this.carrier.amp(0.5);
        this.carrier.start();
        
        this.osc = new p5.Oscillator();
        this.osc.disconnect();
        this.osc.freq(30);
        this.osc.setType("sine");
        this.osc.amp(0.5);

        this.reverb = new p5.Reverb();
        this.delay = new p5.Delay();
        this.delay.disconnect()

        this.playing = false;
        this.samples = fft_samples;
    }

    start()
    {
        if (this.playing == false)
        {
            this.carrier.start();
            this.osc.start();
            this.carrier.freq(this.osc);

            this.delay.connect(this.reverb);
            this.carrier.disconnect();
            this.carrier.connect(this.delay);

            //this.osc.start();
            this.playing = true;
            this.fft = new p5.FFT(0, this.samples);
            this.fft.setInput(this.osc);
        }
    }

    stop()
    {
        if (this.playing == true)
        {
            this.carrier.stop();
            this.osc.stop();
            this.playing = false;
        }
    }

    update(frequency, amplitude)
    {
        if (this.playing == true)
        {
            // Ensure valid ranges, and wave types
            // freq = [10-22050], ampl = [0,1], type = [sine, square, triangle, sawtooth]
            this.osc.freq(frequency);
            this.osc.amp(amplitude);
        }
    }

    change_type(wavetype)
    {
        if (this.playing == true && wavetype != null)
        {
            // Ensure valid ranges, and wave types
            // let freq = [10-22050], ampl = [0,1], type = [sine, square, triangle, sawtooth]
            this.osc.setType(wavetype);
        }
    }

    scale_frequency(scale)
    {
        if (this.playing == true)
        {
            let frequency = this.osc.getFreq();
            this.osc.freq(clamp((scale + 0.1) * frequency, min_frequency, max_frequency));
            this.carrier.freq(map(scale*scale, 0.1, 0.5, 400, 4000));
        }
    }

    frequency()
    {
        if (this.playing == true) return this.osc.getFreq();
    }

    amplitude()
    {
        if (this.playing == true) return this.osc.getAmp();
    }

    waveform()
    {
        if (this.playing == true) return this.fft.waveform();
    }
}

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
