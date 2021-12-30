"use strict";

Array.prototype.random =
    function() {
    return this[Math.floor((Math.random() * this.length))];
}

let p      = [];
const edge = 350;
const square = x => x * x;
const dir = [
    [ 1, 0, 0 ],
    [ -1, 0, 0 ],
    [ 0, 1, 0 ],
    [ 0, -1, 0 ],
    [ 0, 0, 1 ],
    [ 0, 0, -1 ]
];
const debug_speech = new p5.Speech("Google UK English Male"); // speech synthesis object

function setup()
{
    p5.disableFriendlyErrors = true;
    createCanvas(width = 1280, height = 720, WEBGL);
    colorMode(HSB);
    frameRate(25);
    background(0);
}

function mousePressed()
{
    debug_speech.speak("Debugging p5 speech.");
}

function initArray()
{
    p.length = 0;
    for (let x = -4; x <= 4; x++)
    {
        for (let y = -4; y <= 4; y++)
        {
            for (let z = -4; z <= 4; z++)
            {
                const [vx, vy, vz] = dir.random();
                p.push({
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

function draw()
{
    const f = frameCount;
    let speed_factor = 1.0; // this will change with input voice

    if (f % ((edge + 1) * 2) == 1)
    {
        initArray();
    }
    rotateX(f / 61);
    rotateZ(f / 59);

    const tdelta   = TWO_PI * f * 0.1;
    const rotangle = tdelta * 0.0005;

    background((f + 127) % 255, 40, Math.floor(noise(f * 0.01) * 50));
    noFill();

    for (let i = 0; i < p.length - 1; i++)
    {
        let a = p[i];

        a.x += a.vx * 2;
        if (Math.abs(a.x) > edge)
        {
            a.vx *= -1;
        }

        a.y += a.vy * 2;
        if (Math.abs(a.y) > edge)
        {
            a.vy *= -1;
        }

        a.z += a.vz * 2;
        if (Math.abs(a.z) > edge)
        {
            a.vz *= -1;
        }

        for (let j = i + 1; j < p.length; j++)
        {
            const b = p[j];
            // Math.hypot() is slow. Math.pow() as well. The exponentiantion as well,
            // so use a x*x lambda since we're in a nested loop
            if(square(a.x - b.x) + square(a.y - b.y) + square(a.z - b.z) < 1500)
            {
                stroke(Palette.colors(i, 1, 50));
                line(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        }
        const axdelta = a.x + tdelta;
        const aydelta = a.y + tdelta;
        const azdelta = a.z + tdelta;
        const mcx     = Math.cos(axdelta);
        const mcy     = Math.cos(aydelta);
        const mcz     = Math.cos(azdelta);
        const msx     = Math.sin(axdelta);
        const msy     = Math.sin(aydelta);
        const msz     = Math.sin(azdelta);

        if (i % 2 == 0)
        {
            push()
            translate(a.x, a.y, a.z)

            translate(mcx * 8, mcy * 8, mcz * 8);
            rotateZ(a.z * rotangle);
            rotateY(a.y * rotangle);
            stroke(Palette.colors(i, 4, 60));
            strokeWeight(0.2);
            box(15);

            pop();
        }
        else
        {
            push()
            translate(a.x, a.y, a.z)

            translate(msx * 11, msy * 11, msz * 11);
            rotateZ(a.z * rotangle);
            rotateX(a.x * rotangle);
            stroke(Palette.colors(i, 4, 60));
            strokeWeight(0.1);
            sphere(a.z * 0.05, 5, 5);

            pop();
        }

        push()
        translate(a.x, a.y, a.z)

        translate(mcz * 12, msx * 13, mcy * 11);
        stroke(Palette.colors(i, 5, 70));
        strokeWeight(0.1);
        sphere(a.y * 0.02, 3, 3);

        pop();
    }
}
