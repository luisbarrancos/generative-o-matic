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
p5.disableFriendlyErrors = true;

// steps should place more samples on Y or X if the aspect ratio != square
let x_step;
let y_step;
let x_vec, y_vec;

// for particle trails we need a second framebuffer object
// let fb;

let particles = [];
let flow_field;

// avoid the hassle and set the color palette
let orange;
let midblu;
let grey;

//
// Adding bells & whistles and this is getting heavier.
// Don't go above 250-350.
const num_particles = 150;
const frame_rate    = 25;
// particle flow field time step increment
let delta_t = 0.01;
let delta_z = 0.0;

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

// sliders for particle behaviour
let slide_cohesion, slide_align, slide_separation;

//
// TODO: start splitting into functions for the AV capture, audio input
//
function setup()
{
    // we'll be hearing the carrier
    modulator_amplitude = 100;
    modulator_frequency = 200;

    carrier = new p5.Oscillator("sine");
    carrier.amp(0.1);
    carrier.freq(220); // carrier base frequency
    carrier.disconnect();

    // modulated by this modulator
    modulator = new p5.Oscillator("sine");
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

    let canvas = createCanvas(w, h);

    // allocate storage for N particles
    for (let i = 0; i < num_particles; i++)
    {
        // now we should split the number of particle types,
        // predators, prey for now, add more later perhaps
        // and assign them different positions in the screenp
        // Note: avoid p5js random() and use Math.random() directly to
        // bypass the range checking.
        //
        const ptype = (i % 2 == 0) ? 0 : 1;

        particles[i] =
            new Particle(Math.random() * width, Math.random() * height, ptype);
    }

    // base number of steps, change acceleration. to aspect ratio
    const step = 20;
    x_step     = step;
    y_step     = Math.floor(step * height / width);

    // divide the canvas into aspect compensated cells
    x_vec = Math.floor(width / x_step);
    y_vec = Math.floor(height / y_step);

    // initialize the flow field, once, the boids take over next
    //FlowField();

    // background(midblu);
    // background(grey);

    slide_separation = createSlider(-15, 15.0, 1.0);
    slide_cohesion = createSlider(-15, 15.0, 1.0);
    slide_align = createSlider(-15, 15.0, 1.0);

    frameRate(frame_rate);
    // noLoop();
}

function draw()
{
    background(grey);
    // blendMode(EXCLUSION);

    // AUDIO: get the mic feed
    const level = map(mic.getLevel(), 0.0, 0.5, 0.0, 1.0);
    // console.log(level);

    // initialize the flow field
    FlowField();

    fill(0, 0, 0); // .05 alpha
    // noStroke();
    stroke(0, 0, 0); // .05 alpha
    // strokeWeight(3);

    // search radius for particle connectors. Constant for now, but
    // a density function can also produce interesting results.
    const radius = 50.0;

    for (let k = 0; k < particles.length; k++)
    {
        particles[k].separation_weight = slide_separation.value();
        particles[k].alignment_weight = slide_align.value();
        particles[k].cohesion_weight = slide_align.value();

        // particles[k].show();
        // particles[k].update();
        // particles[k].edge();
        particles[k].follow(flow_field);
        particles[k].run(particles)
        particles[k].show()

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
        //{
        //    particles[k].sonorize(radius);
        //}
    }
}

function FlowField()
{
    // create an array corresponding to the number of grid entries
    flow_field  = new Array(x_vec * y_vec);
    let delta_y = 0.0;

    // traverse each vertical and horizontal grid unit
    for (let y = 0; y < height; y += y_step)
    {
        let delta_x = 0.0;
        for (let x = 0; x < width; x += x_step)
        {
            // for each grid position at which we calculate the optical flow
            // hack
            const x_cell = x / x_step;
            const y_cell = y / y_step;

            // 4 number of channels, RGBA, so the index iterates over each RGBA
            // tuple
            const i = (x + (y * width)) * 4;

            // create an index for a linear 1D array from the horizontal
            // vertical grid unit counters
            const index     = x_cell + (y_cell * x_vec);
            const vecDirect = noise(delta_x, delta_y, delta_z) * 4 * TWO_PI;
            delta_x += delta_t;

            // and create a new vector from this angle
            let dir = p5.Vector.fromAngle(vecDirect);

            flow_field[index] = dir;
            dir.setMag(4);
        }
        delta_y += delta_t;
        delta_z += delta_t * 0.01;
    }
    // Done with the main canvas/sketch
}

//
// TODO: Move to own file, add repulsor method, chaser method, clean things a
// bit
//

class Particle
{
    constructor(x, y, type)
    {
        // initialize to a random position on the canvas
        this.x            = x;
        this.y            = y;
        this.position     = createVector(this.x, this.y);
        this.velocity     = createVector(10, 10); // dPdt
        this.acceleration = createVector(0, 0);   // dP^2/d^2t

        this.radius         = 50.0;
        this.max_speed      = 5;
        this.max_steering   = 0.1;
        this.previous_point = this.position.copy();

        // critter type
        this.type = type

        // control variables for flocking behaviour
        this.separation_weight = 1.0;
        this.alignment_weight  = 1.0;
        this.cohesion_weight   = 1.0;
    }

    update()
    {
        this.position.add(this.velocity);     // add dPdt
        this.velocity.add(this.acceleration); // add dP^2/d^2t
        this.acceleration.mult(0);
        this.velocity.limit(this.max_speed);
    }

    update_previous_position()
    {
        this.previous_point.x = this.position.x;
        this.previous_point.y = this.position.y;
    }

    run(boids, radius)
    {
        this.flock(boids, radius);
        this.update();
        this.edge();
    }

    follow(vectors)
    {
        const x =
            Math.floor(this.position.x / x_step); // init at randomized x cell
        const y =
            Math.floor(this.position.y / y_step); // init at randomized y cell
        const index = x + y * x_vec;              // linear 1d array indexing
        const force = vectors[index]; // access the force computed earlier
        this.apply_force(force);      // and apply it
    }

    apply_force(force)
    {
        this.acceleration.add(force); // add jolt to acceleration
    }

    show()
    {
        // display dots
        // const rdist = noise(this.position.x - this.position.y);
        // fill(rdist * 50, rdist * 100, rdist * 100, 0.35);
        // noStroke();

        const c = (this.type == 0) ? color(10, 200, 150, 0.5)
                                   : color(60, 200, 150, 0.5);

        fill(c);
        const time_freq = 0.0001;
        const delta     = this.radius * Math.sin(millis() * time_freq);
        const eps       = 0.1;
        const wiggle    = map(delta, -this.radius, this.radius, eps, 5);

        ellipse(this.position.x, this.position.y, wiggle, wiggle);
        this.update_previous_position();
    }

    edge()
    {
        // restrict the particles to the canvas, check the edges
        if (this.position.x < -this.radius)
        {
            this.position.x = width + this.radius;
            this.update_previous_position();
        }
        if (this.position.y < -this.radius)
        {
            this.position.y = height + this.radius;
            this.update_previous_position();
        }
        if (this.position.x > width + this.radius)
        {
            this.position.x = -this.radius;
            this.update_previous_position();
        }
        if (this.position.y > height + this.radius)
        {
            this.position.y = -this.radius;
            this.update_previous_position();
        }
    }

    // Reynolds flocking behaviour control:
    // separate, alignment, cohesion
    separate(boids, radius)
    {
        let steer = createVector(0, 0);
        let count = 0;

        for (const other of boids)
        {
            const d = p5.Vector.dist(this.position, other.position);

            if (0 < d && d < radius * 0.5)
            {
                let direction = p5.Vector.sub(this.position, other.position);
                direction.normalize().div(d);
                steer.add(direction);
                count++;
            }
        }

        if (count > 0)
        {
            steer.div(count);
        }

        if (0 < steer.mag())
        {
            steer.normalize();
            steer.mult(this.max_speed);
            steer.sub(this.velocity);
            steer.limit(this.max_steering);
        }
        return steer;
    }

    align(boids, radius)
    {
        let sum   = createVector(0, 0);
        let count = 0;

        for (const other of boids)
        {
            let distance = p5.Vector.dist(this.position, other.position);
            if (0 < distance && distance < radius)
            {
                sum.add(other.velocity);
                count++;
            }
        }

        if (count > 0)
        {
            sum.div(count);
            sum.normalize();
            sum.mult(this.max_speed);

            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.max_steering);
            return steer
        }
        return createVector(0, 0);
    }

    seek(target)
    {
        let desired = p5.Vector.sub(target, this.position);
        desired.normalize().mult(this.max_speed);

        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.max_steering);

        return steer;
    }

    cohesion(boids, radius)
    {
        let sum   = createVector(0, 0);
        let count = 0;

        for (const other of boids)
        {
            const distance = p5.Vector.dist(this.position, other.position);

            if (0 < distance && distance < radius)
            {
                sum.add(other.position);
                count++;
            }
        }

        if (count > 0)
        {
            sum.div(count);
            return this.seek(sum);
        }
        return createVector(0, 0);
    }

    flock(boids, radius)
    {
        let separation = this.separate(boids, radius);
        let alignment  = this.align(boids, radius);
        let cohesion   = this.cohesion(boids, radius);

        separation.mult(this.separation_weight);
        alignment.mult(this.alignment_weight);
        cohesion.mult(this.cohesion_weight);

        this.apply_force(separation);
        this.apply_force(alignment);
        this.apply_force(cohesion);
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
        // strokeWeight(1.0);
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