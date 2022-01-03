"use strict";


Array.prototype.random =
function() {
    return this[Math.floor((Math.random() * this.length))];
}

let p            = [];
const edge       = 350;
const frame_rate = 25;
const dir        = [
    [ 1, 0, 0 ],
    [ -1, 0, 0 ],
    [ 0, 1, 0 ],
    [ 0, -1, 0 ],
    [ 0, 0, 1 ],
    [ 0, 0, -1 ]
];

let rotate_x = false;
let rotate_y = false;
let rotate_z = false;

// Math.pow is slower, and Math.hypot is incredbly slow
const square = x => x * x;
// sum and multiply 2 arrays element by element
const sum = (a, b) => a.map((c, i) => c + b[i]);
const sub = (a, b) => a.map((c, i) => c - b[i]);
const mul = (a, b) => a.map((c, i) => c * b[i]);
// multiply elements of array by scalar
const smul = (arr, x) => arr.map((a) => a * x)

// TeachableAI setup
// Global variable to store the classifier
let classifier;
// Label
let label = "listening...";
let confidence = 0;

// Teachable Machine model URL:
const sound_model = "https://teachablemachine.withgoogle.com/models/SyzvFAQv2/";
const ml_options  = {
    probabilityThreshold : 0.7
};

// color palette cycling, choices
let palette = 0;
let font = null;
let pts = []

// Sound
let carrier, modulator;
let freq, ampl;
let reverb;

function preload()
{
    // Load the model
    classifier = ml5.soundClassifier(sound_model + "model.json", ml_options);
    font = loadFont("assets/drafpc__.ttf");
}

function hex2rgb(hex)
{
    return [
        "0x" + hex[1] + hex[2] | 0,
        "0x" + hex[3] + hex[4] | 0,
        "0x" + hex[5] + hex[6] | 0
    ];
}

function initObject()
{
    p.length = 0;
    for (let x = -4; x <= 4; x++)
    {
        for (let y = -4; y <= 4; y++)
        {
            for (let z = -4; z <= 4; z++)
            {
                const [vx, vy, vz] = dir.random();
                let obj = new OrbitalState(x * 40, y * 40, z * 40, vx, vy, vz);
                p.push(obj);
            }
        }
    }
}

function soundSetup()
{
    // we'll be hearing the carrier
    ampl = 100;
    freq = 200;

    carrier = new p5.Oscillator("sine");
    carrier.amp(0.1);
    carrier.freq(220); // carrier base frequency
    carrier.disconnect();

    // modulated by this modulator
    modulator = new p5.Oscillator("sine");
    modulator.freq(freq);
    modulator.amp(ampl);
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
}

function sonorize(radius, distance)
{
    // Change the modulator for the FM synthesis based on the x values
    // of the Y strip intersected particles.
    ampl = map(distance, 0, radius, 0, 1);
    // modulator_amplitude = map(this.position.x, 0, width, 1, 5000);
    modulator.amp(ampl, 0.05);

    freq = map(distance, 0, width, 100, 5000);
    modulator.freq(freq, 0.01);
    //const xpan = constrain((this.position.x / width) * 2 - 0.9, -0.9, 0.9);
    //modulator.pan(xpan);     
}

function setup()
{
    p5.disableFriendlyErrors = true;
    createCanvas(width = 1280, height = 720, WEBGL);
    frameRate(frame_rate);
    background(0);
    // Start classifying
    // The sound model will continuously listen to the microphone
    classifier.classify(gotResult);
    // initialize the shapes array
    initObject();
    soundSetup();
}

// The model recognizing a sound will trigger this event
function gotResult(error, results)
{
    if (error)
    {
        console.error(error);
        return;
    }
    // The results are in an array ordered by confidence.
    // console.log(results[0]);
    label = results[0].label;
    confidence = results[0].confidence;
}

function labelActions(a)
{
    /*
    if (label === "Start")
    {
        a.start();
        //modulator.start();
        //carrier.disconnect();
        //carrier.start();
    }
    */
    
    // log at 1s intervals
    if (frameCount % frame_rate == 0) console.log("label = " + label);

    if (label === "Wider")
    {
        palette = 2;
        a.wider();
    }
    if (label === "Closer")
    {
        palette = 3;
        a.closer();
    }
    if (label === "Bigger")
    {
        palette = 4;
        a.bigger();
        ampl = constrain(ampl + 0.1, 0, 1);
        modulator.amp(ampl, 0.25);
    }
    if (label === "Smaller")
    {
        palette = 5;
        a.smaller();
        ampl = constrain(ampl - 0.1, 0, 1);
        modulator.amp(osc_ampl, 0.25);
    }
    if (label === "Faster")
    {
        palette = 6;
        a.faster();
        freq = constrain(freq + 10, 100, 10000);
        modulator.freq(freq, 0.25);
    }
    if (label === "Slower")
    {
        palette = 7;
        a.slower();
        freq = constrain(freq - 10, 100, 10000);
        modulator.freq(freq, 0.25);
    }
    if (label == "Warmer")
    {
        palette = 9;
        carrier.setType("sine");
    }
    if (label == "Colder")
    {
        palette = 10;
        carrier.setType("square");
    }
    if (label === "Stop")
    {
        a.stop();
        //carrier.stop();
        //modulator.stop();
    }
}

function rotate_screen(f)
{
    if (label == "X Rotate")
    {
        palette = 11;
        rotate_x = true;
    }
    if (label == "Y Rotate")
    {
        palette = 12;
        rotate_y = true;
    }
    if (label == "Z Rotate")
    {
        palette = 13;
        rotate_z = true;
    }
    //
    if (label == "Stop")
    {
        rotate_x = false;
        rotate_y = false;
        rotate_z = false;
    }
    //
    if (rotate_x == true) rotateX(f / 23);
    if (rotate_y == true) rotateY(f / 47);
    if (rotate_z == true) rotateZ(f / 31);
}

function draw()
{
    const f = frameCount;
    rotate_screen(f);
    const tdelta   = TWO_PI * f * 0.1;
    const rotangle = tdelta * 0.00005;
    
    //background((f + 127) % 255, 40, Math.floor(noise(f * 0.01) * 50));
    background(0);
    noFill();

    // DEBUG: Uncomment to debug AI/ML 
    /*
    textFont(font);
    textSize(200);
    textAlign(CENTER, CENTER);
    fill(255);
    pts = font.textToPoints(label, -400, -200, 200, {
        sampleFactor: 0.1, // increase for more points
        simplifyThreshold: 0.0 // increase to remove collinear points
    })
    //text(label, -400, -200);
    
    beginShape(POINTS)
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]
      vertex(p.x, p.y)
    }
    endShape()
    */


    for (let i = 0; i < p.length - 1; i++)
    {
        let a = p[i];
        
        if (i % frame_rate == 0)
            sonorize(5000, square(a.vx) + square(a.vy) + square(a.vz));

        labelActions(a);
        a.edge();
        a.update();
        
        stroke(Palette.colors(i, palette % Palette.palette_length, 50));

        for (let j = i + 1; j < p.length; j++)
        {
            const b = p[j];

            if (square(a.x - b.x) + square(a.y - b.y) + square(a.z - b.z) < 1500)
            {
                //if (j % frame_rate == 0 && i % frame_rate == 0)
                line(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        }

        const axdelta = a.x + tdelta;
        const aydelta = a.y + tdelta;
        const azdelta = a.z + tdelta;
        const mcx     = a.amplitude * Math.cos(a.frequency + axdelta);
        const mcy     = a.amplitude * Math.cos(a.frequency + aydelta);
        const mcz     = a.amplitude * Math.cos(a.frequency + azdelta);
        const msx     = a.amplitude * Math.sin(a.frequency * axdelta);
        const msy     = a.amplitude * Math.sin(a.frequency * aydelta);
        const msz     = a.amplitude * Math.sin(a.frequency * azdelta);

        if (i % 2 == 0)
        {
            push();
            translate(a.x, a.y, a.z);
            translate(mcx, mcy, mcz);
            rotateZ(a.z * a.frequency * rotangle);
            rotateY(a.y * a.frequency * rotangle);
            //stroke(Palette.colors(i, (palette + 1) % Palette.palette_length, 50));
            strokeWeight(0.2);
            box(a.size);
            pop();
        }
        else
        {
            push();
            translate(a.x, a.y, a.z);
            translate(msx * 4, msy * 4, msz * 4);
            rotateZ(a.z * a.frequency * rotangle);
            rotateX(a.x * a.frequency * rotangle);
            //stroke(Palette.colors(i, (palette + 2) % Palette.palette_length, 50));
            strokeWeight(0.1);
            sphere(a.z * 0.0025 * a.size, 5, 5);
            pop();
        }
        
        push();
        translate(a.x, a.y, a.z);
        translate(
            mcz * 0.05 * a.frequency,
            msx * 0.05 * a.frequency,
            mcy * 0.05 * a.frequency);
            //stroke(Palette.colors(i, (palette + 3) % Palette.palette_length, 50));
            strokeWeight(0.1);
            sphere(a.y * 0.00125 * a.size, 3, 3);
            pop();
        }
    }
    