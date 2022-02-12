
const serverIp   = "192.168.0.3";
const serverPort = "3000";
const local      = true;
let game;

// essential UI parameters
const screen_width  = this.windowWidth;
const screen_height = this.windowHeight;

const frame_rate  = 25;
const half_width  = screen_width / 2;
const half_height = screen_height / 2;

// enable to debug
let debug                = "false";
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

function preload()
{
    setupHost();
    // fonts must be loaded and set before drawing text
    // WebGL text()
    // https://github.com/processing/p5.js/wiki/Getting-started-with-WebGL-in-p5
    font = loadFont("assets/RobotoMono-Regular.ttf");
}

function setup()
{
    if (localStorage.getItem("debug") === null)
    {
        debug = false;
        localStorage.setItem("debug", "false");
    }
    else
    {
        debug = localStorage.getItem("debug");
    }

    if (debug === "true")
    {
        p5.disableFriendlyErrors = false;
        setuplogger();
        console.log("Initializing...");
    }
    else
    {
        p5.disableFriendlyErrors                                 = true;
        document.getElementById("loggerbottombar").style.display = "none";
    }

    // main canvas goes to the script GLSL
    // noCanvas();
    // canvas = createCanvas(windowWidth, windowHeight);
    // canvas.position(0, 0);
    angleMode(RADIANS);
    frameRate(frame_rate);
    fill(255, 127, 50);
    background(0);

    // qrcode for server, room
    qr_img = generate_qrcode("http://" + room_url(), 4, 6);

    // create the HTML tag div
    tagDiv = createDiv();
    tagDiv.position(screen_width - 100, screen_height - 100);

    // Host/Game setup here. ---->
    game = new Game(screen_width, screen_height);
    // <----
}

function draw()
{
    if (isHostConnected(display = true))
    {
        // Host/Game draw here. --->
        // Display player IDs in top left corner
        game.printPlayerIds(5, 20);

        // Update and draw game objects
        // game.draw();
        // <----
    }

    // every 2 seconds, randomize one wave from a block of a player
    randomize_wave();
    // normalize times players and number of oscillators
    normalize_all_waves();

    displayCustomAddress(color(255, 180), 12, 10, screen_height - 14)
    if (debug === "true")
    {
        document.getElementById("qrcode").innerHTML = qr_img;
    }
    else { document.getElementById("qrcode_nodebug").innerHTML = qr_img; }
}

function randomize_wave()
{
    if (frameCount % (2 * frame_rate) == 0)
    {
        Object.entries(game.players).forEach(([ key, value ]) => {
            if (Math.random() < 0.333)
            {
                value.oscillators.randomize();
            }
        });
    }
}

function normalize_all_waves()
{
    Object.entries(game.players).forEach(([ key, value ]) => {
        const denom = game.numPlayers * value.oscillators.oscillators.length;
        value.oscillators.normalization = 1.0 / denom;
        value.oscillators.update_all_amplitudes(
            value.oscillators.normalization);
    });
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
    text(
        `Enter the room at : ${serverIp}/?=${roomId} or scan the QR code`,
        xpos,
        ypos);
    pop();
}

// functions
// on receive data, of data type
// call method that changes game state
// so the game object must contain the game state, the cymatics
//

function onReceiveData(data)
{
    if (data == null || data === "undefined")
        return;

    if (debug)
    {
        console.log(`data keys = ${Object.keys(data)}`);
    }

    if (data.type === "player_color")
    {
        let color = {};
        color.r   = data.r;
        color.g   = data.g;
        color.b   = data.b;

        const x  = Math.random();
        const y  = Math.random();
        const dx = 1000 * (Math.random() - 0.5);
        const dy = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);
    }
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
    else if (data.type === "device_sensors")
    {
        // accelerationX|Y|Z, rotationX|Y|Z
        // inclination
        // processDeviceSensors(data);
    }
    // Touch & drag, not yet active
    else if (data.type === "touch_drag")
    {
        processTouchDrag(data);
    }
}

//
// Input processing
// function that calls method of globally accessible game object which
// was declared outside any method, globally, but instantiated within setup()
//

function processMouseClick(data)
{
    if (data == null || data === "undefined")
        return;

    game.players[data.id].xcoord = data.xcoord;
    game.players[data.id].ycoord = data.ycoord;

    let color = {};
    color.r   = data.playercolor[0];
    color.g   = data.playercolor[1];
    color.b   = data.playercolor[2];
    const x   = data.xcoord;
    const y   = data.ycoord;
    const dx  = 1000 * (Math.random() - 0.5);
    const dy  = 1000 * (Math.random() - 0.5);
    splat(x, y, dx, dy, color);

    const frequency = MathUtils.clamp(
        Math.round(
            map(data.xcoord,
                0,
                this.windowWidth,
                game.players[data.id].frequency_range.min_frequency,
                game.players[data.id].frequency_range.max_frequency)),
        absolute_min_frequency,
        absolute_max_frequency);

    const amplitude = MathUtils.clamp(
        map(data.ycoord, 0, this.windowHeight, 0.001, 1.0), 0.0, 1.0);

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

function processTouchDrag(data)
{
    if (debug)
    {
        fill(255, 200, 0);
        text("Process touch & drag:");
    }

    if (data != null)
    {
        game.players[data.id].xcoord = data.xcoord;
        game.players[data.id].ycoord = data.ycoord;

        let color = {};
        color.r   = data.playercolor[0];
        color.g   = data.playercolor[1];
        color.b   = data.playercolor[2];
        const x   = data.xcoord;
        const y   = data.ycoord;
        const dx  = 1000 * (Math.random() - 0.5);
        const dy  = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);

        // text(`Process touch & drag: x coord = ${data.x_coord}, movedX =
        // ${data.x_motion}`); text(`Process touch & drag: y coord =
        // ${data.y_coord}, movedX = ${data.y_motion}`);
    }
}

//
// Input processing
// TODO: move to own separate class, this is annoying
function processJoystick(data)
{
    fill(0, 255, 0);
    text("process joystick data", width / 2, height / 2);
}

function processDeviceShake(data)
{
    if (data != null && ("shaken" in data) && data.shaken == true)
    {
        // toggle bloom on or off, but also try to shift some random
        // waveform.
        // config.BLOOM = (config.BLOOM == false) ? true : false;
        splatStack.push(parseInt(Math.random() * 20) + 5);
        // now randomize one of the waveforms in the player's
        // stack of oscillators
        game.players[data.id].oscillators.randomize();
    }
}

function processDeviceSensors(data)
{
    if (data == null || data === "undefined")
        return;

    // increase the curl of the CFD
    config.CURL = map(constrain(data.y_motion, 0.2, 0.8), 0.2, 0.8, 10, 100);
    config.DENSITY_DISSIPATION =
        map(constrain(data.x_motion, 0.1, 0.9), 0.1, 0.9, 0.1, 2.0);
    config.DENSITY_DISSIPATION =
        map(constrain(data.x_motion, 0.1, 0.9), 0.1, 0.9, 0.03, 0.3);

    fill(255, 200, 0);
    text("process device sensors");
}

/*
let coordX = 0; // Moving from the left side of the screen
let coordY = window.innerHeight / 2; // Moving in the center

function move() {
    // Move step = 20 pixels
    coordX += 20;
    // Create new mouse event
    let ev = new MouseEvent("mousemove", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: coordX,
        clientY: coordY
    });

    // Send event
    document.querySelector('canvas').dispatchEvent(ev);
    // If the current position of the fake "mouse" is less than the width of the
screen - let's move if (coordX < window.innerWidth) { setTimeout(() => { move();
        }, 10);
    }
}
*/

// Displays server address in lower left of screen
function room_url(roomid = null)
{
    if (roomid != null)
        return `${serverIp}:${serverPort}/?="${roomId}"`;

    return `${serverIp}:${serverPort}/?=sdi4`;
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

// This is included for testing purposes to demonstrate that
// messages can be sent from a host back to all connected clients
function mousePressed()
{
    sendData("timestamp", {timestamp : millis()});
    userStartAudio();
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}
