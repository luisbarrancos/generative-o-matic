"use strict";

// TODO
// just move sketch related essentials to static data in a
// globals class.

// essential UI parameters
// display dimensions scale to mobile
var screen_width = 0;
var screen_height = 0;
//
var half_width = screen_width / 2;
var half_height = screen_height / 2;

const frame_rate = 25;

// enable to debug
const debug = false;

// network tests
const serverIp = "192.168.0.3";
const serverPort = "3000";
const local = true;

// player aux functions
let player_color, player_color_dim, background_rgb;
let player_colors;

// motion control
let device_motion_value = 0;
let rotx = 0, roty = 0, rotz = 0;
let accx = 0, accy = 0, accz = 0;
let motion = false;
let ios = false;

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

function set_player_colors() {
  const ndx = Math.floor(Math.random() * 20);
  // ndx from state ramp, and state (palette)
  player_color = Palette.get_rgba_color(ndx, 0);
  player_color_dim = player_color * 0.75;

  return {"active_color" : player_color, "dimmed_color" : player_color_dim};
}

function preload() { setupClient(); }

function setup() {
  if (debug) {
    setuplogger();
    console.log('Initializing...');
  }

  // noCanvas();
  let canvas = createCanvas(windowWidth, windowHeight);
  screen_width = windowWidth;
  screen_height = windowHeight;
  half_width = screen_width / 2;
  half_height = screen_height / 2;

  canvas.position(0, 0);
  // setup player colors and other client variables
  player_colors = set_player_colors()

  background_rgb = color(player_colors.active_color[0] * 255,
                         player_colors.active_color[1] * 255,
                         player_colors.active_color[2] * 255);

  background(background_rgb);
  frameRate(frame_rate);
  angleMode(RADIANS);

  sendData("player_color", {
    r : red(player_colors.active_color),
    g : green(player_colors.active_color),
    b : blue(player_colors.active_color),
    a : alpha(player_colors.active_color),
  });

  // sensors, input configuration
  // shake threshold, default 30, above which, acceleration triggers
  // deviceShake() call
  setShakeThreshold(30);
  // same for motion threshold
  setMoveThreshold(0.5); // default is 0.5
}

function draw() {
  background(background_rgb);

  // if (isClientConnected(display = true))
  if (true) // isClientConnected() || connected)
  {
    fill(255);
    textAlign(CENTER, CENTER);
    text("Connected!");

    // smooth transition from [0,180] degrees and back.
    // NOTE: rotationX,Y,Z are in degrees, but we set angle mode to
    //       radians, so convert the input

    let device_motion = {
      "z_motion" : Math.round(width / 5 * Math.abs(radians(rotationZ) - PI)),
      "y_motion" : Math.round(half_height + rotationX * 10),
      "x_motion" : Math.round(half_width + rotationY * 10),
      "x_rotation" : Math.round(rotationX),
      "y_rotation" : Math.round(rotationY),
      "z_rotation" : Math.round(rotationZ),
      "x_accel" : accelerationX,
      "y_accel" : accelerationY,
      "z_accel" : accelerationZ,
    };
    //sendData("device_moved", device_motion);
    //
    // motion affected circle
    circle(device_motion.x_motion, device_motion.y_motion,
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

    if (debug) {
      text(`device - x: ${round(rotationX)}, y: ${round(rotationX)}, z: ${
               round(rotationZ)}`,
           10, 160);

      text(`circle - x: ${device_motion.x_motion}, y: ${
               device_motion.y_motion}, radius: ${device_motion.z_motion}`,
           10, 200);
    }
  } else {
    text("Not connected", screen_width / 2, screen_height / 2);
  }
}

// Messages can be sent from a host to all connected clients
function onReceiveData(data) {
  // Input data processing here. --->
  if (data.type === "timestamp") {
    print(data.timestamp);
  }
}

// called every time the user touches screen or clicks, essentially
// touch & drag - this should be touch & dragging a splat
function touchMoved()
{
  if (debug) {
    console.log(`Touched at X = ${mouseX}, Y = ${mouseY}, cX = ${coordX}, cY = ${coordY}`);
  }
  let coords =
  {
    "xcoord" :  mouseX / windowWidth,
    "ycoord" : 1 - (mouseY / windowHeight),
    // mouse movement since last frame
    //"x_motion" : movedX,
    //"y_motion" : movedY,
    // previous coords
    // "xpcoord" : pmouseX,
    // "ypcoord" : pmouseY,
    "playercolor" : player_colors.active_color,
  }
  sendData("touch_drag", coords);

  // return false to prevent scrolling on mobile ?
  return false;
}

// Shaken... but not stirred... trigger multiple splats
function deviceShaken()
{
  // setShakeThreshold(30); // default, override in setup()
  sendData("shaken", {"shaken" : true});
}

// deviceMoved should define via threshold a state for resting or active/movement
// position.
// default threshold of 0.5 for device motion on X,Y,Z
/*
function deviceMoved() {
  device_motion_value = constrain(device_motion_value + 5, 0, 255);
}
*/

// Touch end defines a start and end point, i.e, shutdown a screen
/*
function touchStarted(event)
{
  if (debug) {
    console.log(`sketch X = ${mouseX}, Y = ${mouseY}`);
  }

  // https://forum.processing.org/two/discussion/12767/index.html#Comment_111133
  const input_coords = {
    "xcoord" : coordX, // mouseX / windowWidth,
    "ycoord" : coordY, // 1 - (mouseY / windowHeight),
    "playercolor" : player_colors.active_color,
  };
  sendData("input_coords", input_coords);
}
*/

// Map rotateY to curl, and rotateX to density and velocity attenuation
//
function deviceMoved(event)
{
  // defined in the script coordX, coordY
  // https://forum.processing.org/two/discussion/12767/index.html#Comment_111133
  if (debug) {
    console.log(`sketch X = ${mouseX}, Y = ${mouseY}`);
  }

  let device_motion = {
    "z_motion" : Math.round(windowWidth / 5 * Math.abs(radians(rotationZ) - PI)),
    "y_motion" : Math.round(half_height + rotationX * 10) / windowHeight,
    "x_motion" : Math.round(half_width + rotationY * 10) / windowWidth,
    "x_rotation" : map(rotationX, -PI, PI, 0.0, windowWidth / 2),
    "y_rotation" : map(rotationY, -PI, PI, 0.0, windowHeight / 2),
    "z_rotation" : map(rotationZ, -PI, PI, 0.0, 1.0),
    "x_accel" : accelerationX / windowWidth,
    "y_accel" : accelerationY / windowWidth,
    "z_accel" : accelerationZ,
    "playercolor" : player_colors.active_color,
  };
  // This sends the mobile phone bubble level orientation as X,Y coords for the
  // splatting - but it rapidly fills the screen.

  sendData("device_sensors", device_motion);
}

// Main mouse click or touchscreen click, triggers a splat
function mouseClicked(event)
{
  if (debug) {
    console.log(`sketch X = ${mouseX}, Y = ${mouseY}`);
  }

  const input_coords = {
    "xcoord" : mouseX / windowWidth / 2,
    "ycoord" : 1 - (mouseY / windowHeight / 2),
    "playercolor" : player_colors.active_color,
  };
  sendData("input_coords", input_coords);
}

/* full screening will change the size of the canvas */
function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
}
window.addEventListener("deviceorientation", function(ev) {
  if (debug) {
    console.info(ev.alpha, ev.beta, ev.gamma);
    console.log(`alpha = ${ev.alpha}, beta = ${ev.beta}, gamma = ${ev.gamma}`);
  }
})

window.addEventListener("devicemotion", (ev) => {
  if (debug) {
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
  if (debug) {
    console.log("X accel = " + x + ", Y = " + y + ", Z = " + z);
  }
})

function mousePressed() { userStartAudio(); }

function mouseMoved(event)
{
  ; // userStartAudio() ?
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling
 * the page.
 */
document.ontouchmove = function(event) {
  event.preventDefault();
};