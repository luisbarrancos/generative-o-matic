"use strict";

const w = 640, h = 480;
const maxfps = 25;

let leshader = null;

function preload()
{
    leshader = loadShader(
        "assets/shader.vert", "assets/shader.frag",
        );
}

function setup()
{
    p5.disableFriendlyErrors = true;

    createCanvas(w, h, WEBGL);
    frameRate(maxfps);
    noStroke();
}

function draw()
{  
    shader(leshader);
    // for the geometry to fill the screen
    rect(0, 0, width, height);
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed()
{
    // Pressing the "s" key to
    // save the image
    if (key === "s")
    {
        save(`frame_${frameCount}.png`);
    }
}