"use strict";

// TODO
// just move sketch related essentials to static data in a
// globals class.

// essential UI parameters
const screen_width  = 512;
const screen_height = 512;
const half_width    = screen_width / 2;
const half_height   = screen_height / 2;
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

// motion control
let device_motion_value = 0;
let rotx = 0, roty = 0, rotz = 0;
let accx = 0, accy = 0, accz = 0;
let motion = false;
let ios    = false;

/*
// A click is needed for the device to request permission
if (typeof DeviceMotionEvent.requestPermission === 'function')
{
    document.body.addEventListener('click', function() {
        DeviceMotionEvent.requestPermission()
            .then(function() {
                console.log('DeviceMotionEvent enabled');

                motion = true;
                ios    = true;
            })
            .catch(function(error) {
                console.warn('DeviceMotionEvent not enabled', error);
            })
    })
}
else
{
    // we are not on ios13 and above
    // todo
    // add detection for hardware for other devices
    // if(got the hardware) {
    // motion = true;
    // }
}
*/

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
    if (debug)
    {
        console.log("Initializing...");
        setuplogger();
    }
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

    // sensors, input configuration
    // shake threshold, default 30, above which, acceleration triggers
    // deviceShake() call
    setShakeThreshold(30);
    // same for motion threshold
    setMoveThreshold(0.5); // default is 0.5
}

function draw()
{
    background(player_colors["dimmed_color"], 50);

    if (isClientConnected())
    {
        fill(255);
        textAlign(CENTER, CENTER);

        // smooth transition from [0,180] degrees and back.
        // NOTE: rotationX,Y,Z are in degrees, but we set angle mode to
        //       radians, so convert the input

        let device_motion = {
            "z_motion" :
                Math.round(width / 5 * Math.abs(radians(rotationZ) - PI)),
            "y_motion" : Math.round(half_height + rotationX * 10),
            "x_motion" : Math.round(half_width + rotationY * 10),
            "x_rotation" : Math.round(rotationX),
            "y_rotation" : Math.round(rotationY),
            "z_rotation" : Math.round(rotationZ),
            "x_accel" : accelerationX,
            "y_accel" : accelerationY,
            "z_accel" : accelerationZ,
        };
        sendData("device_moved", device_motion);

        //
        // motion affected circle
        circle(
            device_motion.x_motion,
            device_motion.y_motion,
            device_motion.z_motion);

        // reference circle
        stroke(255);
        strokeWeight(3);
        noFill();
        circle(half_width, half_height, screen_width / 1.2);

        // text to provide instructions and
        // document values at the top of the screen
        noStroke();
        textSize(width / 35);

        fill(255, 100, 50);
        text("click to start on iOS", 10, 80);
        text("on a mobile: twist, and tilt your device", 10, 120);
        text(
            `device - x: ${round(rotationX)}, y: ${round(rotationX)}, z: ${
                round(rotationZ)}`,
            10,
            160);

        text(
            `circle - x: ${device_motion.x_motion}, y: ${
                device_motion.y_motion}, radius: ${device_motion.z_motion}`,
            10,
            200);
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
}

// called every time the user touches screen or clicks
function touchMoved()
{
    if (debug)
    {
        console.log(`Touched at X = ${mouseX}, Y = ${mouseY}`);
    }
    let coords = {
        "x_coord" : mouseX,
        "y_coord" : mouseY,
        // previous coords
        "x_pcoord" : pmouseX,
        "y_pcoord" : pmouseY
    };
    sendData("touch_drag", coords);
}

function deviceShake()
{
    // setShakeThreshold(30); // default, override in setup()
    sendData("shaken", {"shaken" : true});
}

// default threshold of 0.5 for device motion on X,Y,Z
function deviceMoved()
{
    device_motion_value = constrain(device_motion_value + 5, 0, 255);
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

window.addEventListener("deviceorientation", function(ev) {
    if (debug)
    {
        console.info(ev.alpha, ev.beta, ev.gamma);
        console.log(
            `alpha = ${ev.alpha}, beta = ${ev.beta}, gamma = ${ev.gamma}`);
    }
})

window.addEventListener("devicemotion", (ev) => {
    if (debug)
    {
        console.info(ev.acceleration.y, ev.rotationRate.gamma);
        console.log(`accel Y = ${ev.acceleration.y}, rotation gamma = ${
            ev.rotationRate.gamma}`);
        console.log(`accel X = ${ev.acceleration.y}, rotation gamma = ${
            ev.rotationRate.gamma}`);
        console.log(`accel Z = ${ev.acceleration.y}, rotation gamma = ${
            ev.rotationRate.gamma}`);
    }
})

// accelerometer Data
window.addEventListener("devicemotion", (e) => {
    // get accelerometer values
    x = parseInt(e.accelerationIncludingGravity.x);
    y = parseInt(e.accelerationIncludingGravity.y);
    z = parseInt(e.accelerationIncludingGravity.z);
    if (debug)
    {
        console.log("X accel = " + x + ", Y = " + y + ", Z = " + z);
    }
});

function mousePressed()
{
    userStartAudio();
}

function mouseMoved(event)
{
    ; // userStartAudio() ?
}