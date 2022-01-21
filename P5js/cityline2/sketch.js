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
    "264653,287271,2a9d8f,8ab17d,babb74,e9c46a,efb366,f4a261,ee8959,e76f51"
        .split(",")
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

    xstep = screen_width % numsteps;
    ystep = screen_height % numsteps;
    ystep *= 0.957;
    half_width = screen_width / 2;
    half_height = screen_height / 2;

    half_width = 0;
    half_height = 0;

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
    background(0, 0, 0, 2);
    const t = frameCount * 0.1;
    const m = millis() * 0.001;

    noiseDetail(1, 0.873);

    //beginShape(QUADS);
    for (let x = 0; x < screen_width; x += xstep)
    {
        let lastx = x;

        for (let y = 0; y < screen_height; y += ystep)
        {
            const bx = noise(x + t, y + t) * 100;
            const by = noise(x + m, y + m) * 100;
            const nx = Math.cos(bx) * 50 + xstep / 2;
            const ny = Math.sin(by) * 50 + ystep / 2;

            let c = hexToRgb(colors[Math.ceil(Math.abs(y)) % colors.length]);
            //console.log("color c " + c);
            c.setAlpha(100);
            //stroke(c);
            noStroke();
            fill(c);

            const xx = x - half_width + nx;
            const yy = y - half_height + ny;

            fill(255);
            ellipse(screen_width - 130, screen_height - 180, xx / bx, yy / by);
            fill(c);

            //curveVertex(x, y);
            //curveVertex(xx, yy);
            //curveVertex(lastx, yy);
            rect(xx, yy, x - xx, y - yy);


            //ellipse(x - half_width + nx, y - half_height + ny,
            //        40 * noise(y + t + m, x + t + m));
        }
    }
    //endShape();
    /*
    for (let i = n; i >= 0; i--)
    {
        fill(colors[i % colors.length]);

        const size      = radius + i * inter;
        const k         = kMax * sqrt(i / n);
        const noisiness = maxNoise * noiseProg(i / n);
        blob(size, 0, 0, k, t + i * step, noisiness);
    }
    */
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