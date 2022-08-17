// Adapted from original by Roni Kaufman

let kMax;
let step;
const n         = 32;   // number of blobs
const radius    = 0.15; // diameter of the circle
const inter     = 1.15; // difference between the sizes of two blobs
const maxNoise  = 1000;
const angleStep = Math.PI / 64;
let center      = [];

const colors =
    "001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226-d9ed92-b5e48c-99d98c-76c893-52b69a-34a0a4-168aad-1a759f-1e6091-184e77-00296b-003f88-00509d-fdc500-ffd500"
        .split("-")
        .map((a) => "#" + a);

function hexToRGB(hex, opac)
{
    hex        = hex.replace('#', '');
    var bigint = parseInt(hex, 16);
    var r      = (bigint >> 16) & 255;
    var g      = (bigint >> 8) & 255;
    var b      = bigint & 255;
    return color(r, g, b, opac);
}

function noiseProg(x)
{
    return (x);
}

function setup()
{
    createCanvas(1280, 720, /* WEBGL */);
    // colorMode(HSB, 1);
    angleMode(RADIANS);
    noFill();
    noStroke();
    kMax      = 1;
    step      = 0.25;
    center[0] = width / 2;
    center[1] = height / 2;
}

function draw()
{
    background(color(0, 0, 0, 4));
    const t = frameCount * 0.001;

    noiseDetail(6, 0.873);
    kMax = noise(t / 20);

    for (let i = n; i >= 0; i--)
    {
        let c = hexToRGB(colors[i % colors.length]);
        c.setAlpha(50);
        fill(c);

        const size      = radius + i * inter;
        const k         = kMax * sqrt(i / n);
        const noisiness = maxNoise * noiseProg(i / n);

        c = hexToRGB(colors[(i + round(noisiness * 8)) % colors.length]);
        c.setAlpha(130);
        stroke(c);
        strokeWeight(0.0125 * noisiness);

        blob(size, center[0], center[1], k, t + i * step, noisiness);
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
