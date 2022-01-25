"use strict";

// TODO
// just move sketch related essentials to static data in a
// globals class.

// essential UI parameters
const screen_width  = 512;
const screen_height = 512;
const frame_rate    = 25;
// enable to debug
const debug = true;

// network tests
const serverIp   = "192.168.0.3";
const serverPort = "3000";
const local      = true;

// player aux functions
let player_color, player_color_dim;
let player_colors;

function set_player_colors()
{
    let hue = random(0, 360);
    colorMode(HSB);
    player_color     = color(hue, 100, 100);
    player_color_dim = color(hue, 100, 80);
    colorMode(RGB);
    return {"active_color" : player_color, "dimmed_color" : player_color_dim};
}

function preload()
{
    setupClient();
}

function setup()
{
    // noCanvas();
    let canvas = createCanvas(screen_width, screen_height);
    canvas.position(0, 0);
    background(255, 0, 0);
    frameRate(frame_rate);
    angleMode(RADIANS);

    // setup player colors and other client variables
    player_colors = set_player_colors();
    // Send any initial setup data to your host here.
    /*
        Example:
        sendData('myDataType', {
        val1: 0,
        val2: 128,
        val3: true
        });

        Use `type` to classify message types for host.
    */
    sendData("player_color", {
        r : red(player_colors["active_color"]) / 255,
        g : green(player_colors["active_color"]) / 255,
        b : blue(player_colors["active_color"]) / 255
    });
}

function draw()
{
    background(player_colors["dimmed_color"], 50);

    // if (isClientConnected(display = true))
    if (isClientConnected())
    {
        ;
    }
    else
    {
        text("Not connected", screen_width / 2, screen_height / 2);
    }
}

// Messages can be sent from a host to all connected clients
function onReceiveData(data)
{
    // Input data processing here. --->
    if (data.type === "timestamp")
    {
        print(data.timestamp);
    }

    // <----
    /* Example:
       if (data.type === "myDataType") {
         processMyData(data);
       }

       Use "data.type" to get the message type sent by host.
    */
}

function mouseClicked(event)
{
    if (debug)
    {
        console.log(`sketch X = ${mouseX}, Y = ${mouseY}`);
    }

    const input_coords = {
        "xcoord" : mouseX,
        "ycoord" : mouseY,
    };
    sendData("input_coords", input_coords);
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}

function mouseMoved(event)
{
    ;
}

/// Add these lines below sketch to prevent scrolling on mobile
function touchMoved()
{
    // do some stuff
    return false;
}
