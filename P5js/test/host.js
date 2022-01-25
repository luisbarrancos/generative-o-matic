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
const absolute_min_frequency = 20;
const absolute_max_frequency = 20000; // for sound step
const fft_samples = 64;

// We'll create an array of 50 oscillators then on a time basis change
// the wave type, frequency, amplitude. Individually it will be 
// imperceptible, but combined it will slowly evolve over time
// TODO: move to class

// QR code related stuff
let qr_img;
// an HTML div to display it in:
let tagDiv;


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
        //game.draw();
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

        const frequency = clamp(
            map(data.xcoord, 0, screen_width,
                game.players[data.id].frequency_range.min_frequency,
                game.players[data.id].frequency_range.max_frequency),
                absolute_min_frequency, absolute_max_frequency);

        const amplitude = clamp(
            map(data.ycoord, 0, screen_height, 0.001, 1.0),
            0.0, 1.0);

        game.updateSoundWaves(data.id, frequency, amplitude, "sine");

        //game.updateCymatics(data.id);

        if (debug)
        {
            console.log(`${data.id} XY received: X = ${data.xcoord}, ${data.id} Y = ${data.ycoord}`);
        }
    }
}

// process input shake? change wave type
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
        //game.updateWaveType(
        //    data.id,
        //   game.players[data.id].wavetype,
        //    game.players[data.id].confidence);

        //game.updateCymatics(data.id);

        if (debug)
        {
            console.log(`${data.id} emotion = ${data.emotion},
            confidence = ${data.confidence}`);
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
