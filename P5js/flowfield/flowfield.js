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
let numParticles = 500; // 12500;
let flowfield;
let magOff    = 0;
let showField = false;

const colors =
    "19324a,5f8fe8,5c7eed,001219,005f73,0a9396,94d2bd,e9d8a6,ee9b00,ca6702,bb3e03,ae2012,9b2226"
        .split(",")
        .map((x) => { return "#" + x; });

function setup()
{
    p5.disableFriendlyErrors = true;

    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.style("display", "block");
    canvas.parent("p5js-container");

    pixelDensity(1);
    background(250);
    frameRate(250);
    blendMode(OVERLAY);

    cols = floor(width / scl);
    rows = floor(height / scl);

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
    background(color(250, 250, 250, 4));

    let yoff = start;

    const tdelta =
        Math.cos(frameCount * 0.01 * TWO_PI) * 0.25 + 0.5; // [0.25,0.50]
    noiseDetail(2, tdelta * 10.0);

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
        stroke(colors[Math.round(i / 50) % colors.length]);

        particles[i].follow(flowfield);
        particles[i].update();
        particles[i].edges();
        particles[i].show();
    }

    if (Math.random() > 0.5 && particles.length < 2500)
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