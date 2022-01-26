"use strict";

// networking and game object
const serverIp   = "192.168.0.3"; // 10.0.0.23
const serverPort = '3000';
const local      = true;
let game;

// global canvas
const screen_width  = 512;
const screen_height = 512;
const half_width    = screen_width / 2;
const half_height   = screen_height / 2;
const frame_rate    = 25;

// enable to debug
const debug              = false;
p5.disableFriendlyErrors = true;

// QR code related stuff
let qr_img;
// an HTML div to display it in:
let tagDiv;
// font related
let font;

// shaders and glsl related
let shader_base;

// some auxiliary functions
const square = (x) => x * x;
const hypot = (x, y) => Math.sqrt(square(x) + square(y));
const clamp = (x, mi, ma) => Math.min(Math.max(mi, x), ma);

function preload()
{
    setupHost();
    shader_base = loadShader(
        "assets/base.vert",
        "assets/base.frag",
    );
    // fonts must be loaded and set before drawing text
    // WebGL text() https://github.com/processing/p5.js/wiki/Getting-started-with-WebGL-in-p5
    font = loadFont("assets/RobotoMono-Regular.ttf");
}

function setup()
{
    const f = (font) => {
        textFont(font, 200);
        text("hello", 0, 0); // no issue, renders
    };

    if (debug)
    {
        p5.disableFriendlyErrors = false;
        console.log('Initializing...');
        setuplogger();
    }
    let canvas = createCanvas(screen_width, screen_height, WEBGL);

    canvas.position(0, 0);

    angleMode(RADIANS);
    frameRate(frame_rate);
    // blendMode(ADD);
    background(0);
    

    // Host/Game setup here. ---->
    game = new Game(screen_width, screen_height, WEBGL);

    // qrcode for server, room
    qr_img = generate_qrcode("http://" + room_url(), 4, 6);
    // create the HTML tag div
    tagDiv = createDiv();
    tagDiv.position(screen_width - 100, screen_height - 100);
}

function draw()
{
    // clear();
    // background(0);

    if (isHostConnected(/* display = true */))
    {
        // draw() method either contains the shader call or
        // just the input processing
        // game.draw()
    }

    // NOTE: game.draw() will get the input data processed to pass to shaders
    shader(shader_base);
    // rect gives us some geometry on the screen
    rect(0, 0, width, height);

    if (isHostConnected(/* display = true */))
    {
        // NOTE: these might have to be moved after the main rect
        game.printPlayerIds(-half_width + 5, -half_height + 20);
    }

    // TODO: this is a problem, the rect overlays on top of everything
    //       to the text would either be rendered in the bottom, its own div/separator
    //       the ideal, or in GLSL (not ideal).
    //       The player IDs, etc.. would need to be rendered in GLSL however.
    //
    // display address and QR code
    displayCustomAddress(color(0, 20, 80, 180), 12, 10 - half_width, half_height - 14);
    tagDiv.html(qr_img);
}

function onClientConnect(data)
{
    // Client connect logic here. --->
    if (debug)
    {
        console.log(data.id + ' has connected.');
    }

    if (!game.checkId(data.id))
    {
        game.add(
            data.id,
            random(0.25 * width, 0.75 * width),
            random(0.25 * height, 0.75 * height),
            60,
            60);
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

// TODO: move to utils together with some lambdas above
//       perhaps networking related, with connection checks above
//
// Displays server address in lower left of screen
function room_url(roomId = null)
{
    if (roomId == null || roomId === "undefined")
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
        `URL : ${serverIp}:${serverPort}/?=${
            roomId} or scan the QR code`,
        xpos,
        ypos);
    pop();
}

function onReceiveData(data)
{
    // Input data processing here. --->
    if (debug)
    {
        console.log(data);
    }

    // acceleration
    // rotationX, Y, Z
    // shaken but not stirred
    // device moved
    // touch & drag
    //
    if (data.type === "joystick")
    {
        processJoystick(data);
    }
    else if (data.type === "shaken")
    {
        processDeviceShake(data);
    }
    else if (data.type === "device_moved")
    {
        // accelerationX|Y|Z, rotationX|Y|Z
        // inclination
        processDeviceSensors(data);
    }
    else if (data.type === "touch_drag")
    {
        processTouchDrag(data);
    }
    else if (data.type === "player_color")
    {
        game.setColor(data.id, data.r * 255, data.g * 255, data.b * 255);
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

function processMouseClick(data)
{
    if (data != null)
    {
        game.players[data.id].xcoord = data.xcoord;
        game.players[data.id].ycoord = data.ycoord;

        if (debug)
        {
            console.log(`${data.id} XY received: X = ${data.xcoord}, ${
                data.id} Y = ${data.ycoord}`);
        }
    }
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
        this.players    = {};
        this.numPlayers = 0;
        this.id         = 0;
    }

    add(id, x, y, w, h)
    {
        this.players[id].id    = "p" + this.id;
        this.players[id].color = color(255, 255, 255);
        print(this.players[id].id + " added.");
        this.id++;
        this.numPlayers++;
    }

    draw() { ; }

    setColor(id, r, g, b)
    {
        this.players[id].color      = color(r, g, b);
        this.players[id].shapeColor = color(r, g, b);

        print(this.players[id].id + " color added.");
    }

    remove(id)
    {
        this.colliders.remove(this.players[id]);
        this.players[id].remove();
        delete this.players[id];
        this.numPlayers--;
    }

    checkId(id) { return (id in this.players) ? true : false; }

    printPlayerIds(x, y)
    {
        push();
        noStroke();
        fill(255);
        textFont(font, 16);
        text("# players: " + this.numPlayers, x, y);

        y = y + 16;
        fill(200);
        for (let id in this.players)
        {
            text(this.players[id].id, x, y);
            y += 16;
        }

        pop();
    }
}

// leave this commented, otherwise the canvas will be resized
// to the entire window on the host/render window.
/*
function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}
*/