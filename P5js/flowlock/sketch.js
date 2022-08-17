"use strict";

let inc      = 0.1; // 10.1
let incStart = 0.005;
let magInc   = 0.0005;
let start    = 0;
let scl      = 50; // 100
let cols, rows;
let zoff = 0;
let fps;
let particles    = [];
let numParticles = 5000; // 12500;
let flowfield;
let magOff    = 0;
let showField = false;

// play with different colors
const colors3 =
    "19324a,5f8fe8,5c7eed,001219,005f73,0a9396,94d2bd,e9d8a6,ee9b00,ca6702,bb3e03,ae2012,9b2226"
        .split(",")
        .map((a) => { return "#" + a; });

const colors2 =
    "03071e,370617,6a040f,9d0208,d00000,dc2f02,e85d04,f48c06,faa307,ffba08"
        .split(",")
        .map((a) => { return "#" + a; });

const colors = "423a22,967f38,a8a18c,7db3a5,fce190".split(",").map(
    (a) => { return "#" + a; });

function setup()
{
    p5.disableFriendlyErrors = true;

    createCanvas(1280, 720);
    pixelDensity(1);
    background(0);
    frameRate(60);

    cols = floor(width / scl);
    rows = floor(height / scl);
    blendMode(BLEND); // what about adding, accessing the FB and tonemapping it?

    for (let i = 0; i < numParticles; i++)
    {
        particles[i] = new Particle();
    }

    flowfield = new Array(rows * cols);
}

function Particle()
{
    this.pos      = createVector(Math.random() * width, Math.random() * height);
    this.vel      = createVector(0, 0);
    this.acc      = createVector(0, 0);
    this.maxSpeed = 2;

    this.prevPos = this.pos.copy();

    this.update = function() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    };

    this.applyForce = function(force) { this.acc.add(force); };

    this.show = function() {
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.updatePrev();
    };

    this.inverseConstrain = function(pos, key, f, t) {
        if (pos[key] < f)
        {
            pos[key] = t;
            this.updatePrev();
        }
        if (pos[key] > t)
        {
            pos[key] = f;
            this.updatePrev();
        }
    };

    this.updatePrev = function() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    };

    this.edges = function() {
        this.inverseConstrain(this.pos, "x", 0, width);
        this.inverseConstrain(this.pos, "y", 0, height);
    };

    this.follow = function(vectors) {
        let x     = Math.floor(this.pos.x / scl);
        let y     = Math.floor(this.pos.y / scl);
        let index = x + y * cols;
        let force = vectors[index];
        this.applyForce(force);
    };
}

function draw()
{
    background(color(0, 0, 0, 4));

    let yoff = start;

    const tdelta = cos(frameCount * 0.01 * TWO_PI) * 0.5 + 0.5;
    ;
    noiseDetail(2, 150 * tdelta);

    for (let y = 0; y < rows; y++)
    {
        let xoff = start;

        for (let x = 0; x < cols; x++)
        {
            let index = x + y * cols;
            let angle = noise(xoff, yoff, zoff) * TWO_PI;
            let v     = p5.Vector.fromAngle(angle);
            let m     = map(noise(xoff, yoff, magOff), 0, 1, -5, 5);
            v.setMag(m);

            flowfield[index] = v;
            xoff += inc;
        }
        yoff += inc;
    }
    magOff += magInc;
    zoff += incStart;
    start -= magInc;

    for (let i = 0; i < particles.length; i++)
    {
        stroke(colors3[int(i / 50) % colors3.length]);

        particles[i].follow(flowfield);
        particles[i].update();
        particles[i].edges();
        particles[i].show();
    }

    if (Math.random() * 10 > 5 && particles.length < 2500)
    {
        let rnd = Math.floor(noise(zoff) * 20);

        for (let i = 0; i < rnd; i++)
        {
            particles.push(new Particle());
        }
    }
    else if (particles.length > 2000)
    {
        let rnd = Math.floor(Math.random() * 10);

        for (let i = 0; i < rnd; i++)
        {
            particles.shift();
        }
    }
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
