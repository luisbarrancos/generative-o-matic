// Adapted from original by Roni Kaufman

let kMax;
let step;
const n         = 80;  // number of blobs
const radius    = 0.5; // diameter of the circle
const inter     = 0.5; // difference between the sizes of two blobs
const maxNoise  = 1000;
const angleStep = Math.PI / 8;

const screen_width  = 1024
const screen_height = 1024;
const numsteps      = 40;

let xstep, ystep;
let half_width, half_height;

const colors =
    "001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226-d9ed92-b5e48c-99d98c-76c893-52b69a-34a0a4-168aad-1a759f-1e6091-184e77-00296b-003f88-00509d-fdc500-ffd500"
        .split("-")
        .map((a) => "#" + a);

function setup()
{
    createCanvas(screen_width, screen_height); //, WEBGL);
    angleMode(RADIANS);
    noFill();
    stroke(120, 200, 200);
    background(0);
    frameRate(25);
    pixelDensity(0.25); // lower than 1 pixel density = blur

    xstep       = screen_width % numsteps;
    ystep       = screen_height % numsteps;
    half_width  = screen_width / 2;
    half_height = screen_height / 2;

    half_width  = 0;
    half_height = 0;

    // blendMode(ADD);
}

function hexToRgb(hex)
{
    hex        = hex.replace('#', '');
    var bigint = parseInt(hex, 16);
    var r      = (bigint >> 16) & 255;
    var g      = (bigint >> 8) & 255;
    var b      = bigint & 255;
    return color(r, g, b);
}

function draw()
{
    background(0, 0, 0, 2);
    const t = frameCount * 0.1;
    const m = millis() * 0.001;

    noiseDetail(2, 0.873);

    for (let x = 0; x < screen_width; x += xstep)
    {
        let lastx = x;

        for (let y = 0; y < screen_height; y += ystep)
        {
            const bx = noise(x + t, y + t) * 2 - 1;
            const by = noise(x + m, y + m) * 2 - 1;
            const nx = bx * 100;
            const ny = by * 100;

            let c = hexToRgb(colors[y % colors.length]);
            c.setAlpha(100);
            stroke(c);

            const xx = x - half_width + nx;
            const yy = y - half_height + ny;

            ellipse(
                xx - half_width + nx,
                yy - half_height + ny,
                100 * noise(yy + t + m, xx + t + m));
        }
    }
}

function blob(size, xCenter, yCenter, k, t, noisiness)
{
    beginShape();

    for (let theta = 0; theta <= 2 * (Math.PI + angleStep); theta += angleStep)
    {
        const r1 = Math.cos(theta);
        const r2 = Math.sin(theta);
        const r  = size + noise(k * (r1 + 1), k * (r2 + 1), t) * noisiness;
        const x  = xCenter + r * r1;
        const y  = yCenter + r * r2;
        curveVertex(x, y)
    }

    endShape();
}