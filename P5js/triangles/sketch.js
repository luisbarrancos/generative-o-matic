// Adapted from original by Roni Kaufman

let kMax;
let step;
const n         = 80;   // number of blobs
const radius    = 0.15; // diameter of the circle
const inter     = 0.15; // difference between the sizes of two blobs
const maxNoise  = 1000;
const angleStep = Math.PI / 8;


const screen_width = 512;
const screen_height = 512;
const numsteps = 40;

let xstep, ystep;
let half_width, half_height;

const colors =
    "001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226-d9ed92-b5e48c-99d98c-76c893-52b69a-34a0a4-168aad-1a759f-1e6091-184e77-00296b-003f88-00509d-fdc500-ffd500"
        .split("-")
        .map((a) => "#" + a);

function setup()
{
    createCanvas(screen_width, screen_height);//, WEBGL);
    //colorMode(HSB, 1);
    angleMode(RADIANS);
    noFill();
    //noStroke();
    // noLoop();
    stroke(120, 200, 200);
    background(0);
    frameRate(25);

    xstep = width % numsteps;
    ystep = height % numsteps;
    half_width = width / 2;
    half_height = height / 2;
    //blendMode(ADD);
}

function hexToRgb(hex)
{
    hex = hex.replace('#', '');

    var bigint = parseInt(hex, 16);

    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return color(r, g, b);
}

function draw()
{
    background(0, 0, 0, 1);
    const t = frameCount * 0.1;
    const m = millis() * 0.001;

    noiseDetail(1, 0.873);

    beginShape(TRIANGLES);
    for (let x = 0; x < width; x += xstep)
    {
        let lastx = x;

        for (let y = 0; y < height; y += ystep)
        {
            const bx = noise(x + t, y + t) * 100;
            const by = noise(x + m, y + m) * 100;
            const nx = Math.cos(bx) * 50 + xstep / 2;
            const ny = Math.sin(by) * 50 + ystep / 2;

            let c = hexToRgb(
                colors[Math.floor(y * screen_height / (2 * height * colors.length))]);
    
            c.setAlpha(15);
            stroke(c);

            const xx = x + nx;
            const yy = y + ny;
            curveVertex(xx, yy);
        }
    }
    endShape();
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
