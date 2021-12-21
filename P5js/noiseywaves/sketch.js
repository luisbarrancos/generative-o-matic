// Adapted from original by Roni Kaufman

let kMax;
let step;
const n         = 80;   // number of blobs
const radius    = 0.15; // diameter of the circle
const inter     = 0.15; // difference between the sizes of two blobs
const maxNoise  = 1000;
const angleStep = Math.PI / 8;

const colors =
    "001219-005f73-0a9396-94d2bd-e9d8a6-ee9b00-ca6702-bb3e03-ae2012-9b2226-d9ed92-b5e48c-99d98c-76c893-52b69a-34a0a4-168aad-1a759f-1e6091-184e77-00296b-003f88-00509d-fdc500-ffd500"
        .split("-")
        .map((a) => "#" + a);

function noiseProg(x)
{
    return (x);
}

function setup()
{
    createCanvas(1280, 720, WEBGL);
    colorMode(HSB, 1);
    angleMode(RADIANS);
    noFill();
    noStroke();
    // noLoop();

    kMax = 1;
    step = 0.25;
}

function draw()
{
    background(0);
    const t = frameCount * 0.001;

    noiseDetail(6, 0.873);
    kMax = noise(t / 20);

    for (let i = n; i >= 0; i--)
    {
        fill(colors[i % colors.length]);

        const size      = radius + i * inter;
        const k         = kMax * sqrt(i / n);
        const noisiness = maxNoise * noiseProg(i / n);
        blob(size, 0, 0, k, t + i * step, noisiness);
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