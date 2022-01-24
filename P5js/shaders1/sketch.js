
const screen_width = 512;
const screen_height = 512;
const frame_rate = 25;

let xstep, ystep;
let half_width, half_height;

const colors =
    "001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226-d9ed92-b5e48c-99d98c-76c893-52b69a-34a0a4-168aad-1a759f-1e6091-184e77-00296b-003f88-00509d-fdc500-ffd500"
        .split("-")
        .map((a) => "#" + a);

function setup()
{
    createCanvas(screen_width, screen_height, WEBGL);
    angleMode(RADIANS);
    noFill();
    //noStroke();
    // noLoop();
    stroke(120, 200, 200);
    frameRate(frame_rate);
    background(0);
}

function hexToRgb(hex)
{
    hex = hex.replace('#', '');
    let bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return color(r, g, b);
}

function draw()
{

}

