// code from https://editor.p5js.org/chesterdols/sketches/B12rzkBQx
// P5.js Code from Daniel Shiffman instructional
// <https://www.youtube.com/watch?v=BjoM9oKOAKY&t=542s>

// steps should place more samples on Y or X if the aspect ratio != square
let xstep;
let ystep;
let xvec, yvec;
let fb;

let particles = [];
let flowfield;

let cam;

let orange;
let midblu;
let grey;

const num_particles = 250;

function setup()
{
    orange = color("#ffa100");
    midblu = color("#0dade6");
    grey = color("#575e59");

    frameRate(25);
    pixelDensity(1);
    colorMode(HSB);

    const w = 640, h = 480;
    const ratio = w / h;

    let canvas = createCanvas(w, h);
    fb = createGraphics(w, h);

    // create a webcam with specific contraints and hide it
    // minimize data stream
    // https://w3c.github.io/mediacapture-main/getusermedia.html#media-track-constraints
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints#Result
    const constraints =
    {
        video:
        {
            width:  { min: 640, ideal: min(w, 1280), max: 1280},
            height: { min: 480, ideal: min(h, 720), max: 720},
            frameRate: { min: 25, ideal: 25, max: 60},
            aspectRatio: w / h,
        },
        audio: false
    };

    cam = createCapture(constraints);
    cam.size(width, height);
    cam.hide();

    // allocate storage for N particles
    for (let i = 0; i < num_particles; i++)
    {
        particles[i] = new Particle();
    }

    // base number of steps, change acc. to aspect ratio
    const step = 20;
    xstep = step;
    ystep = floor(step * height / width);

    // divide the canvas into aspect compensated cells
    xvec = floor(width / xstep);
    yvec = floor(height / ystep);

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

    //filter(POSTERIZE, 8); // invert, erode, dilate, blur, grey, posterize, threshold
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
        particles[k].follow(flowfield);
    }
    // 2nd framebuffer object for trails
    //image(fb, 0, 0);
}

// ITU-R BT.709 relative luminance Y
function luminance(r, g, b)
{
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function FlowField()
{
    // create an array corresponding to the number of grid entries
    flowfield = new Array(xvec * yvec);

    // traverse each vertical and horizontal grid unit
    for (let y = 0; y < height; y += ystep)
    {
        for (let x = 0; x < width; x += xstep)
        {
            // for each grid position at which we calculate the optical flow hack
            let vX = x / xstep;
            let vY = y / ystep;

            // 4 number of channels, RGBA, so the index iterates over each RGBA tuple
            let i = (x + (y * width)) * 4;

            // and get the R, G, B channels value
            let r = pixels[i + 0];
            let g = pixels[i + 1];
            let b = pixels[i + 2];

            // compute the relative luminance Y (from ITU-R BT.709 RGB primaries
            //  D65 white point), CIE (1931) XYZ->RGB matrix
            const lum = map(luminance(r, g, b), 0, 255, 0, 1);

            // create an index for a linear 1D array from the horizontal
            // vertical grid unit counters
            let index = vX + (vY * xvec);

            // create a vector V0 corresponding to each grid unit/cell
            let v0 = createVector(vX, vX);

            // and another that rotates 2 PI radians based on the relative luminance Y
            // this isn't really optical flow, but a crude approximation to interact with
            // webcam pixel values. For proper optical flow one would need to compute the
            // image gradient, which would imply two framebuffers, one for previous
            // time t_(n-1) and another for present time t_n
            //
            let v1 = createVector(vX * cos(lum * TWO_PI), vX * sin(lum * TWO_PI));

            // measure the angle between them in radians
            let vecDirect = v0.angleBetween(v1);
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
            flowfield[index] = dir;
            dir.setMag(4);
            
            // Debug the "motion vectors" with hue mode nad lines
            // HSB mode, change alpha
            //stroke(lum * 255, 255, 255);

            push();
            
            translate(x, y);
            rotate(dir.heading());
            //line(0, 0, ystep, 0); // debug lines
            
            // primary rotating squares
            noStroke();
            fill(grey);
            rotate(frameCount * 0.03);
            square(lum * xstep / 2, lum * ystep / 2, lum * dir.mag() * 5);
            
            // secondary rotating squares
            noFill()
            stroke(255);
            rotate(frameCount * 0.05);
            square(lum * xstep / 2, lum * ystep / 2, lum * dir.mag() * 7);

            pop();
            
        }
    }
}

class Particle
{
    constructor()
    {
        // initialize to a random position on the canvas
        this.x        = random(width);
        this.y        = random(height);
        this.pos      = createVector(this.x, this.y);
        this.vel      = createVector(0, 0); // dPdt
        this.acc      = createVector(0, 0); // dP^2/d^2t
        this.r        = 2.0;
        this.maxspeed = 5;
        this.prevP    = this.pos.copy();
    }

    update()
    {
        this.pos.add(this.vel); // add dPdt
        this.vel.add(this.acc); // add dP^2/d^2t
        this.acc.mult(0);
        this.vel.limit(this.maxspeed);
    }

    updatePreviousPosition()
    {
        this.prevP.x = this.pos.x;
        this.prevP.y = this.pos.y;
    }

    follow(vectors)
    {
        const x     = floor(this.pos.x / xstep); // init at randomized x cell
        const y     = floor(this.pos.y / ystep); // init at randomized y cell
        const index = x + y * xvec; // linear 1d array indexing
        const force = vectors[index]; // access the force computed earlier
        this.applyForce(force); // and apply it
    }

    applyForce(force)
    {
        this.acc.add(force); // add force
    }

    show()
    {
        // display dots
        fill(orange);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 6, 6);

        // and rotating squares
        push();

        noFill();
        stroke(190, 90, 130, 10);
        strokeWeight(0.5);
        translate(this.pos.x, this.pos.y);
        rotate(frameCount * this.prevP.y * 0.0001);
        square(0, 0, 16);
        
        pop();

        this.updatePreviousPosition();
    }

    edge()
    {
        // restrict the particles to the canvas, check the edges
        if (this.pos.x < -this.r)
        {
            this.pos.x = width + this.r;
            this.updatePreviousPosition();
        }
        if (this.pos.y < -this.r)
        {
            this.pos.y = height + this.r;
            this.updatePreviousPosition();
        }
        if (this.pos.x > width + this.r)
        {
            this.pos.x = -this.r;
            this.updatePreviousPosition();
        }
        if (this.pos.y > height + this.r)
        {
            this.pos.y = -this.r;
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