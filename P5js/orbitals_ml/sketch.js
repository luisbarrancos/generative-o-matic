"use strict";

Array.prototype.random =
    function() {
    return this[Math.floor((Math.random() * this.length))];
}

let p = [];
let p2 = [];
const edge = 350;
const dir = [
    [ 1, 0, 0 ],
    [ -1, 0, 0 ],
    [ 0, 1, 0 ],
    [ 0, -1, 0 ],
    [ 0, 0, 1 ],
    [ 0, 0, -1 ]
];

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
  
// Teachable Machine model URL:
const soundModel = "https://teachablemachine.withgoogle.com/models/SyzvFAQv2/"; 

function preload()
{
    // Load the model
    classifier = ml5.soundClassifier(soundModel + "model.json");
}

function initArray()
{
    p2.length = 0;
    for (let x = -4; x <= 4; x++)
    {
        for (let y = -4; y <= 4; y++)
        {
            for (let z = -4; z <= 4; z++)
            {
                const [vx, vy, vz] = dir.random();
                p2.push({
                    x : x * 40, // 35
                    y : y * 40, // 35
                    z : z * 40, // 35
                    vx : vx,
                    vy : vy,
                    vz : vz
                });
            }
        }
    }
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

function setup()
{
    p5.disableFriendlyErrors = true;
    createCanvas(width = 1280, height = 720, WEBGL);
    colorMode(HSB);
    frameRate(25);
    background(0);
    // Start classifying
    // The sound model will continuously listen to the microphone
    classifier.classify(gotResult);
    initObject();
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
}

function labelActions(a)
{
    /*
    if (label === "Start")
    {
       /a.start();
    
    if (label === "Shake")
    {
        a.shake(2.0); // jitter
    }
    */
    if (label === "Wider")
    {
        a.wider();
    }
    if (label === "Closer")
    {
        a.closer();
    }
    if (label === "Bigger")
    {
        a.bigger();
    }
    if (label === "Smaller")
    {
        a.smaller();
    }
    if (label === "Faster")
    {
        a.faster();
    }
    if (label === "Slower")
    {
        a.slower();
    }
    /*
    if (label === "Stop")
    {
        a.stop();
    }
    */
}

function draw()
{
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(255);
    text(label, width / 2, height / 2);

    const f = frameCount;
    let speed_factor = 1.0; // this will change with input voice

    /*
    if (f % ((edge + 1) * 2) == 1)
    {
        //initArray();
        initObject();
    }
    */
    rotateX(f / 61);
    rotateZ(f / 59);

    const tdelta   = TWO_PI * f * 0.1;
    const rotangle = tdelta * 0.0005;

    background((f + 127) % 255, 40, Math.floor(noise(f * 0.01) * 50));
    noFill();  

    for (let i = 0; i < p.length - 1; i++)
    {
        //console.log(p[i]);
        let a = p[i];

        labelActions(a);
        a.edge();
        a.update();

        /*
        for (let j = i + 1; j < p.length; j++)
        {
            const b = p[j];
            if(square(a.x - b.x) + square(a.y - b.y) + square(a.z - b.z) < 1500)
            {
                stroke(Palette.colors(i, 1, 50));
                line(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        }
        */
        
        // amplitude * cos(frequency * x + offset);

        const axdelta = a.x + tdelta;
        const aydelta = a.y + tdelta;
        const azdelta = a.z + tdelta;
        const mcx     = a.amplitude * Math.cos(a.frequency * axdelta);
        const mcy     = a.amplitude * Math.cos(a.frequency * aydelta);
        const mcz     = a.amplitude * Math.cos(a.frequency * azdelta);
        const msx     = a.amplitude * Math.sin(a.frequency * axdelta);
        const msy     = a.amplitude * Math.sin(a.frequency * aydelta);
        const msz     = a.amplitude * Math.sin(a.frequency * azdelta);

        if (i % 2 == 0)
        {
            push();
            translate(a.x, a.y, a.z);
            //push();
            translate(mcx, mcy, mcz);
            rotateZ(a.z * a.frequency * rotangle);
            rotateY(a.y * a.frequency * rotangle);
            stroke(Palette.colors(i, 4, 60));
            strokeWeight(0.2);
            box(a.size);
            //pop();
            pop();
        }
        /*
        else
        {
            push();
            translate(a.x, a.y, a.z);
            //push();
            translate(msx * 11, msy * 11, msz * 11);
            rotateZ(a.z * rotangle);
            rotateX(a.x * rotangle);
            stroke(Palette.colors(i, 4, 60));
            strokeWeight(0.1);
            sphere(a.z * 0.05, 5, 5);
            //pop();
            pop();
        }
        */

        push();
        translate(a.x, a.y, a.z);
        //push();
        translate(mcz * 12, msx * 13, mcy * 11);
        stroke(Palette.colors(i, 5, 70));
        strokeWeight(0.1);
        sphere(a.y * 0.02, 3, 3);
        //pop();
        pop();
    }
}
