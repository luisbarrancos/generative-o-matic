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
const serverPort = "3000";
const local      = true;
let game;

// essential UI parameters
const screen_width  = 512;
const screen_height = 512;
const half_width    = screen_width / 2;
const half_height   = screen_height / 2;
const frame_rate    = 25;

// enable to debug
const debug              = true;
p5.disableFriendlyErrors = true;

// sound synthesis related
const absolute_min_frequency = 20;
const absolute_max_frequency = 20000; // for sound step
const fft_samples            = 64;

// We'll create an array of 10 oscillators then on a time basis change
// the wave type, frequency, amplitude. Individually it will be
// imperceptible, but combined it will slowly evolve over time
// TODO: move to class

// QR code related stuff
let qr_img;
// an HTML div to display it in:
let tagDiv;
// font related
let font;

// shaders and glsl related
let shader_base;

function preload()
{
    setupHost();

    shader_base = loadShader(
        "assets/base.vert",
        "assets/base.frag",
    );
    // fonts must be loaded and set before drawing text
    // WebGL text()
    // https://github.com/processing/p5.js/wiki/Getting-started-with-WebGL-in-p5
    font = loadFont("assets/RobotoMono-Regular.ttf");
}

function setup()
{
    if (debug)
    {
        p5.disableFriendlyErrors = false;
        console.log('Initializing...');
        setuplogger();
    }

    // noCanvas();
    let canvas = createCanvas(screen_width, screen_height, WEBGL);
    canvas.position(0, 0);
    angleMode(RADIANS);
    frameRate(frame_rate);

    // blendMode(ADD);
    background(0);

    // qrcode for server, room
    qr_img = generate_qrcode(room_url(), 4, 6);

    // create the HTML tag div
    tagDiv = createDiv();
    tagDiv.position(screen_width - 100, screen_height - 100);

    // Host/Game setup 
    game = new Game(screen_width, screen_height);
}

function draw()
{
    clear();
    fill(255, 127, 50);
    background(0);

    // The shader call must be per frame, and the input only per established
    // connection. After the rectangle binding the GLSL shaders, we need the
    // players information and the QR code. We might need to add these to the
    // actual shader itself since the rectangle ovelays on top of everything.
    //
    shader(shader_base);
    // and the rectangle for them, but the QR code must be sent aftwards
    rect(0, 0, width, height);

    if (isHostConnected(display = true))
    {
        // Display player IDs in top left corner
        game.printPlayerIds(5, 20);
        // Update and draw game objects
        // game.draw();
    }
    // this might need to be moved with the other text into the actual shader
    // if we don't find a way to overlay the image over the rectangle
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

        // Main series of input events from the client
        // Unique player color ID
        //
        if (data.type === "player_color")
        {
            game.setColor(data.id, data.r * 255, data.g * 255, data.b * 255);
        }
        // On mouse click, send X,Y coords, and affect the frequency and
        // amplitude of the soundwave.
        else if (data.type === "input_coords")
        {
            processMouseClick(data);
            // game method to process input coords (sound effect)
        }
        // If the device motion is above a shake threshold, trigger
        else if (data.type === "shaken")
        {
            processDeviceShake(data);
        }
        // If device motion is above a shake threshold, trigger, so that we
        // have a binary state: resting | movement
        else if (data.type === "device_moved")
        {
            // accelerationX|Y|Z, rotationX|Y|Z
            // inclination
            processDeviceSensors(data);
        }
        // Touch & drag, not yet active
        else if (data.type === "touch_drag")
        {
            processTouchDrag(data);
        }
    }
}

//
// Input processing
//
// function that calls method of globally accessible game object which
// was declared outside any method, globally, but instantiated within setup()
//

function processMouseClick(data)
{
    if (data != null)
    {
        game.players[data.id].xcoord = data.xcoord;
        game.players[data.id].ycoord = data.ycoord;

        const frequency = MathUtils.clamp(
            Math.round(
                map(data.xcoord,
                    0,
                    screen_width,
                    game.players[data.id].frequency_range.min_frequency,
                    game.players[data.id].frequency_range.max_frequency)),
            absolute_min_frequency,
            absolute_max_frequency);

        const amplitude = MathUtils.clamp(
            map(data.ycoord, 0, screen_height, 0.001, 1.0), 0.0, 1.0);

        if (debug)
        {
            log(`processMouseClick: Frequency = ${frequency}, amplitude = ${
                amplitude}`);
        }

        game.updateSoundWaves(data.id, frequency, amplitude, "sine");

        // game.updateVisuals(data.id);
        if (debug)
        {
            console.log(`${data.id} XY received: X = ${data.xcoord}, ${
                data.id} Y = ${data.ycoord}`);
        }
    }
}

////////////
// Input processing
// TODO: move to own separate class, this is annoying
function processJoystick(data)
{
    fill(0, 255, 0);
    text("process joystick data", width / 2, height / 2);
}

function processDeviceShake(data)
{
    fill(255, 200, 0);
    text("process device shake");
}

function processDeviceSensors(data)
{
    fill(255, 200, 0);
    text("process device sensors");
}

function processTouchDrag(data)
{
    fill(255, 200, 0);
    text("process touch & drag");
}

// Displays server address in lower left of screen
function room_url(roomid = null)
{
    if (roomid == null || roomId === "undefined")
        return `${serverIp}:${serverPort}/?=sdi4`;

    return `${serverIp}:${serverPort}/?=${roomId}`;
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

function displayCustomAddress(textcolor, font_size, xpos, ypos)
{
    push();
    fill(textcolor);
    textFont(font, font_size);
    text(
        `Enter the room at : ${serverIp}/?=${roomId} or scan the QR code`,
        xpos,
        ypos);
    pop();
}


// This is included for testing purposes to demonstrate that
// messages can be sent from a host back to all connected clients
function mousePressed()
{
    if (debug)
    {
        console.log("Mouse pressed: sending timestamp millis() to client.")
    }
    sendData("timestamp", {timestamp : millis()});
    // audio context
    userStartAudio();
}

/*
function mouseClicked()
{
    userStartAudio();
}
*/

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}
