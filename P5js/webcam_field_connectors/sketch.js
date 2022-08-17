/*
    Webcam video feed interaction w vector field particles p5js sketch
    Copyright (C) 2021 Luis Barrancos

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

//
// Webcam video feed interaction with vector field particles
// https://p5.readthedocs.io/en/latest/tutorials/vector.html
// Particles based on Daniel Shiffman instructional
//

"use strict";

// steps should place more samples on Y or X if the aspect ratio != square
let x_step, x_step_half;
let y_step, y_step_half;
let x_vec, y_vec;

// for particle trails we need a second framebuffer object
// let fb;

let particles = [];
let flow_field;

let cam;
// avoid the hassle and set the color palette
let orange;
let midblu;
let grey;

//
// Adding bells & whistles and this is getting heavier.
// Don't go above 250-350.
const num_particles = 100;
const frame_rate    = 25;

// QHD = 960x540
const w = 800, h = 600;
const ratio = w / h;

// Get mic input to agitate the particles. We feed the AV/cam data, luminance
// optical flow approximation. Shake them with audio feed (above certain
// threshold), connect them if they are within a certain distance, and then we
// sonorize them via FM synthesis and add a bit of effects on top
// it would be interesting to play a sound file in the background, ambience
// then randomly compose some beats.
// A density function plugged to the search radius produces interesting effects,
// so does swapping the mapping in the connector lines - probably best combined
// with chaser and repulsor particles.

let mic;
// pretty standard FM synthesis
// https://p5js.org/examples/sound-frequency-modulation.html
let carrier, modulator;
let modulator_frequency, modulator_amplitude;
let reverb;

//
// TODO: start splitting into functions for the AV capture, audio input
//
function setup()
{
    p5.disableFriendlyErrors = true;

    // we'll be hearing the carrier
    modulator_amplitude = 100;
    modulator_frequency = 200;

    carrier = new p5.Oscillator('sine');
    carrier.amp(0.1);
    carrier.freq(220); // carrier base frequency
    carrier.disconnect();

    // modulated by this modulator
    modulator = new p5.Oscillator('sine');
    modulator.freq(modulator_frequency);
    modulator.amp(modulator_amplitude);
    modulator.disconnect();

    carrier.start();
    modulator.start();
    carrier.freq(modulator);

    // give some depth, Convolve seems heavier though. Try reverb
    // https://p5js.org/reference/#/p5.Reverb
    reverb = new p5.Reverb();
    reverb.drywet(0.7);
    // long delay with a short time gives a nice layered texture
    reverb.process(carrier, 15, 5, 0.1);

    // get audio input/mic to shake particles a bit
    mic = new p5.AudioIn();
    mic.start();

    orange = color("#ffa100");
    midblu = color("#0dade6");
    grey   = color("#575e59");

    frameRate(frame_rate);
    pixelDensity(1); // don't change
    colorMode(HSB);

    let canvas = createCanvas(w, h); // width, height available onwards
    // fb = createGraphics(w, h);

    // create a webcam with specific contraints and hide it
    // minimize data stream
    // https://w3c.github.io/mediacapture-main/getusermedia.html#media-track-constraints
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints#Result
    const constraints = {
        video : {
            width : {min : 640, ideal : min(width, 1280), max : 1280},
            height : {min : 480, ideal : min(height, 720), max : 720},
            frameRate : {min : 25, ideal : 25, max : 60},
            aspectRatio : width / height,
        },
        audio : false
    };
    cam = createCapture(constraints);
    cam.size(constraints["video"]["width"], constraints["video"]["height"]);
    cam.hide();

    // allocate storage for N particles
    for (let i = 0; i < num_particles; i++)
    {
        particles[i] = new Particle();
    }

    // base number of steps, change acceleration. to aspect ratio
    const steps = 20;
    x_step     = steps;
    y_step     = Math.floor(steps * height / width);
    x_step_half = x_step / 2.0;
    y_step_half = y_step / 2.0;

    // divide the canvas into aspect compensated cells
    x_vec = Math.floor(width / x_step);
    y_vec = Math.floor(height / y_step);

    background(midblu);

    frameRate(frame_rate);
    // noLoop();
}

function draw()
{
    // load webcam feed and flip horizontally
    push();
    translate(cam.width, 0);
    scale(-1, 1);
    image(cam, 0, 0, width, height);
    pop();

    // filter(POSTERIZE, 4); // invert, erode, dilate, blur, grey, posterize,
    // threshold
    loadPixels();
    // clear it from view, or comment to debug the video feed
    background(midblu);

    // AUDIO: get the mic feed
    const level = map(mic.getLevel(), 0.0, 0.5, 0.0, 1.0);
    // console.log(level);

    // initialize the flow field
    FlowField();

    // search radius for particle connectors. Constant for now, but
    // a density function can also produce interesting results.
    const radius = 100.0;

    for (let k = 0; k < particles.length; k++)
    {
        particles[k].show();
        particles[k].update();
        particles[k].edge();
        particles[k].follow(flow_field);

        // check distance and connect, the distance will drive the sound
        // FM synthesis params.
        particles[k].connect(particles.slice(k), radius);

        // shake things a bit if mic goes above a threshold, a "refresh"
        // of sorts to randomize things a bit.
        if (level > 0.1)
        {
            particles[k].agitate(level);
        }

        // comparing modulus of frame count vs time in a times array can
        // introduce a rythm (todo).
        // if (int(frameCount % 25) == 0)
        particles[k].sonorize(radius);
    }
    // 2nd framebuffer object for trails
    // image(fb, 0, 0);
}

// ITU-R BT.709 relative luminance Y
function luminance(r, g, b)
{
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function FlowField()
{
    // create an array corresponding to the number of grid entries
    flow_field = new Array(x_vec * y_vec);

    // traverse each vertical and horizontal grid unit
    for (let y = 0; y < height; y += y_step)
    {
        for (let x = 0; x < width; x += x_step)
        {
            // for each grid position at which we calculate the optical flow
            // hack
            const x_cell = x / x_step;
            const y_cell = y / y_step;

            // 4 number of channels, RGBA, so the index iterates over each RGBA
            // tuple
            const i = (x + (y * width)) * 4;

            // and get the R, G, B channels value
            const r = pixels[i + 0];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // compute the relative luminance Y (from ITU-R BT.709 RGB primaries
            //  D65 white point), CIE (1931) XYZ->RGB matrix
            // DEBUG w random
            const lum = map(luminance(r, g, b), 0, 255, 0, 1);
            // const lum = random();

            // create an index for a linear 1D array from the horizontal
            // vertical grid unit counters
            const index = x_cell + (y_cell * x_vec);

            // create a vector V0 corresponding to each grid unit/cell
            const v0 = createVector(x_cell, y_cell);

            // and another that rotates 2 PI radians based on the relative
            // luminance Y this isn't really optical flow, but a crude
            // approximation to interact with webcam pixel values. For proper
            // optical flow one would need to compute the image gradient, which
            // would imply two framebuffers, one for previous time t_(n-1) and
            // another for present time t_n
            //
            // xcell * cos(2PI xi), xcell * sin(2PI xi)
            /* equiv to Vector.fromAngle(lum * TWO_PI) which is faster
            const v1 = createVector(
                Math.cos(lum * TWO_PI),
                Math.sin(lum * TWO_PI));
            */
            const v1 = p5.Vector.fromAngle(lum * TWO_PI);

            // measure the angle between them in radians
            const vecDirect = v0.angleBetween(v1);

            // and create a new vector from this angle
            let dir = p5.Vector.fromAngle(vecDirect);

            // if it stabilizes with no input (static feed), randomize a bit
            if (dir.mag() < 0.1)
            {
                dir.add(createVector(
                    Math.random() * x, /* noise(x) */
                    Math.random() * y  /* noise(y) */
                ));
            }

            // push the new vector into the array and set its magnitude
            // NOTE: some magnitude randomization can be interesting, and
            //       setting split components for dir x, y, z can also be
            //       interesting.
            flow_field[index] = dir;
            dir.setMag(4);

            // comment to simplify, debug, but notice the last two shapes
            // are part of the 3d system

            // Debug the "motion vectors" with hue mode nad lines
            // HSB mode, change alpha
            // stroke(lum * 255, 255, 255);

            push();
            translate(x, y);
            rotate(dir.heading());
            // line(0, 0, y_step, 0); // debug lines

            // primary rotating squares
            noStroke();
            fill(0, 0, 40, 0.4);
            rotate(frameCount * 0.03);
            const xlum = lum * x_step_half;
            const ylum = lum * y_step_half;
            const maglum = lum * dir.mag();

            square(xlum, ylum, maglum * 5);

            // secondary rotating squares
            noFill()
            stroke(0, 0, 255, 0.6);
            rotate(frameCount * 0.05);
            square(xlum, ylum, maglum * 7);
            pop();
        }
    }
    // Done with the main canvas/sketch
}

//
// TODO: Move to own file, add repulsor method, chaser method, clean things a
// bit
//

class Particle
{
    constructor()
    {
        // initialize to a random position on the canvas
        this.x              = Math.random() * width;
        this.y              = Math.random() * height;
        this.position       = createVector(this.x, this.y);
        this.velocity       = createVector(0, 0); // dPdt
        this.acceleration   = createVector(0, 0); // dP^2/d^2t
        this.r              = 2.0;
        this.max_speed      = 5;
        this.previous_point = this.position.copy();
    }

    update()
    {
        this.position.add(this.velocity);     // add dPdt
        this.velocity.add(this.acceleration); // add dP^2/d^2t
        this.acceleration.mult(0);
        this.velocity.limit(this.max_speed);
    }

    updatePreviousPosition()
    {
        this.previous_point.x = this.position.x;
        this.previous_point.y = this.position.y;
    }

    follow(vectors)
    {
        const x = Math.floor(this.position.x / x_step); // init at randomized x cell
        const y = Math.floor(this.position.y / y_step); // init at randomized y cell
        const index = x + y * x_vec;               // linear 1d array indexing
        const force = vectors[index]; // access the force computed earlier
        this.applyForce(force);       // and apply it
    }

    applyForce(force)
    {
        this.acceleration.add(force); // add jolt to acceleration
    }

    show()
    {
        // display dots
        fill(orange);
        noStroke();
        ellipse(this.position.x, this.position.y, 6, 6);

        // and rotating squares
        push();

        noFill();
        stroke(190, 90, 130, 10);
        strokeWeight(0.5);
        translate(this.position.x, this.position.y);
        rotate(frameCount * this.previous_point.y * 0.0001);
        square(0, 0, 16);

        pop();

        this.updatePreviousPosition();
    }

    edge()
    {
        // restrict the particles to the canvas, check the edges
        if (this.position.x < -this.r)
        {
            this.position.x = width + this.r;
            this.updatePreviousPosition();
        }
        if (this.position.y < -this.r)
        {
            this.position.y = height + this.r;
            this.updatePreviousPosition();
        }
        if (this.position.x > width + this.r)
        {
            this.position.x = -this.r;
            this.updatePreviousPosition();
        }
        if (this.position.y > height + this.r)
        {
            this.position.y = -this.r;
            this.updatePreviousPosition();
        }
    }

    // Search for neighbours within a given radius, the bigger the radius,
    // and the number of particles, the heavier.
    // Perhaps adding other data structures would be of interest, but time
    // would be best invested on OpenFrameWorks in that case.
    // Note to self: how much is Javascript contributing to global warming?
    //
    connect(particles, radius)
    {
        this.particle_dist   = 0.0;
        this.normalized_dist = 0.0;

        particles.forEach(element => {
            const dis = dist(
                this.position.x,
                this.position.y,
                element.previous_point.x,
                element.previous_point.y);

            if (dis < radius)
            {
                // remap from [0,radius]->[0.0, 1.0] for alpha
                // this can become more interesting if one assumes spatially
                // varying density functions for radius swapping the endpoints
                // results in a attractor effect
                const rmap = map(dis, 0, radius, 1.0, 0.0);

                // some quick mapping for HSV, makes it more discernible
                stroke(
                    rmap * 100 + 135, 255 * rmap, (1 - rmap) * 220 + 35, rmap);
                strokeWeight(rmap * 3);

                // a version with acceleration structures would perhaps be
                // interesting and in this case, returning 4 points, allowing
                // us to create bezier splines for the ondullating shapes.
                line(
                    this.position.x,
                    this.position.y,
                    element.previous_point.x,
                    element.previous_point.y);

                // store the distance to nearest particle and the [0,1] distance
                // for other methods.
                this.particle_dist   = dis;
                this.normalized_dist = rmap;
            }
        });
        strokeWeight(1.0);
    }

    agitate(level)
    {
        // this.max_speed = 20;
        this.position.x += level * (Math.random() * 2.0 - 1.0) * 10;
        this.position.y += level * (Math.random() * 2.0 - 1.0) * 10;
        this.velocity.mult(level * 10);
    }

    sonorize(radius)
    {
        // affect only when particle bisects the screen
        if (this.position.y > height / 2 + 1
            || this.position.yy < height / 2 - 1)
        {
            return;
        }

        // Change the modulator for the FM synthesis based on the x values
        // of the Y strip intersected particles.
        modulator_amplitude = map(this.particle_dist, 0, radius, 0, 5000);
        // modulator_amplitude = map(this.position.x, 0, width, 1, 5000);
        modulator.amp(modulator_amplitude, 0.05);

        modulator_frequency = map(this.position.x, 0, width, 1, 5000);
        // modulator_frequency = map(this.particle_dist, 0, this.radius, 1,
        // 5000);
        modulator.freq(modulator_frequency, 0.01);
        const xpan = constrain((this.position.x / width) * 2 - 0.9, -0.9, 0.9);
        modulator.pan(xpan);
    }
}

/*
function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}
*/

