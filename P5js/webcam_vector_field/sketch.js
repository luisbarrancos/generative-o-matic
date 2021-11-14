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

// steps should place more samples on Y or X if the aspect ratio != square
let x_step;
let y_step;
let x_vec, y_vec;

// for particle trails we need a second framebuffer object
// let fb;

let particles = [];
let flow_field;

let cam;

let orange;
let midblu;
let grey;

const num_particles = 500;
const frame_rate    = 25;

function setup()
{
    orange = color("#ffa100");
    midblu = color("#0dade6");
    grey   = color("#575e59");

    frameRate(frame_rate);
    pixelDensity(1);
    colorMode(HSB);

    const w = 640, h = 480;
    const ratio = w / h;

    let canvas = createCanvas(w, h);
    // fb = createGraphics(w, h);

    // create a webcam with specific contraints and hide it
    // minimize data stream
    // https://w3c.github.io/mediacapture-main/getusermedia.html#media-track-constraints
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints#Result
    const constraints = {
        video : {
            width : {min : 640, ideal : min(w, 1280), max : 1280},
            height : {min : 480, ideal : min(h, 720), max : 720},
            frameRate : {min : 25, ideal : 25, max : 60},
            aspectRatio : w / h,
        },
        audio : false
    };
    cam = createCapture(constraints);
    cam.size(width, height);
    cam.hide();

    // allocate storage for N particles
    for (let i = 0; i < num_particles; i++)
    {
        particles[i] = new Particle();
    }

    // base number of steps, change acceleration. to aspect ratio
    const step = 20;
    x_step     = step;
    y_step     = floor(step * height / width);

    // divide the canvas into aspect compensated cells
    x_vec = floor(width / x_step);
    y_vec = floor(height / y_step);

    background(midblu);
}

function draw()
{
    // load webcam feed and flip horizontally
    push();
    translate(cam.width, 0);
    scale(-1, 1);
    image(cam, 0, 0, width, height);
    pop();

    // filter(POSTERIZE, 8); // invert, erode, dilate, blur, grey, posterize,
    // threshold
    loadPixels();
    // clear it from view, or comment to debug the video feed
    background(midblu);

    // initialize the flow field
    FlowField();

    for (let k = 0; k < particles.length; k++)
    {
        particles[k].show();
        particles[k].update();
        particles[k].edge();
        particles[k].follow(flow_field);
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
            const lum = map(luminance(r, g, b), 0, 255, 0, 1);

            // create an index for a linear 1D array from the horizontal
            // vertical grid unit counters
            const index = x_cell + (y_cell * x_vec);

            // create a vector V0 corresponding to each grid unit/cell
            const v0 = createVector(x_cell, x_cell);

            // and another that rotates 2 PI radians based on the relative
            // luminance Y this isn't really optical flow, but a crude
            // approximation to interact with webcam pixel values. For proper
            // optical flow one would need to compute the image gradient, which
            // would imply two framebuffers, one for previous time t_(n-1) and
            // another for present time t_n
            //
            const v1 = createVector(
                x_cell * cos(lum * TWO_PI), x_cell * sin(lum * TWO_PI));

            // measure the angle between them in radians
            const vecDirect = v0.angleBetween(v1);

            // and create a new vector from this angle
            let dir = p5.Vector.fromAngle(vecDirect);

            /*
            // if it stabilizes with no input (static feed), randomize a bit
            if (dir.mag() < 0.1)
            {
                dir.add(createVector(noise(x), noise(y)));
            }
            */

            // push the new vector into the array and set its magnitude
            // NOTE: some magnitude randomization can be interesting, and
            //       setting split components for dir x, y, z can also be
            //       interesting.
            flow_field[index] = dir;
            dir.setMag(4);

            // Debug the "motion vectors" with hue mode nad lines
            // HSB mode, change alpha
            // stroke(lum * 255, 255, 255);
            push();

            translate(x, y);
            rotate(dir.heading());
            // line(0, 0, y_step, 0); // debug lines

            // primary rotating squares
            noStroke();
            fill(grey);
            rotate(frameCount * 0.03);
            square(lum * x_step / 2, lum * y_step / 2, lum * dir.mag() * 5);

            // secondary rotating squares
            noFill()
            stroke(255);
            rotate(frameCount * 0.05);
            square(lum * x_step / 2, lum * y_step / 2, lum * dir.mag() * 7);

            pop();
        }
    }
}

class Particle
{
    constructor()
    {
        // initialize to a random position on the canvas
        this.x              = random(width);
        this.y              = random(height);
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
        const x = floor(this.position.x / x_step); // init at randomized x cell
        const y = floor(this.position.y / y_step); // init at randomized y cell
        const index = x + y * x_vec;               // linear 1d array indexing
        const force = vectors[index]; // access the force computed earlier
        this.applyForce(force);       // and apply it
    }

    applyForce(force)
    {
        this.acceleration.add(force); // add force
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
}

/*
function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}
*/