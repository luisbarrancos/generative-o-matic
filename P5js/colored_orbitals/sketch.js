"use strict";

// get the palette from https://coolors.co/
const colors = "083d77,ebebd3,f4d35e,ee964b,f95738".split(",").map(x => "#" + x)

Array.prototype.random =
    function() {
    return this[Math.floor((Math.random() * this.length))];
}

let p      = [];
const edge = 350;

const dir = [
    [ 1, 0, 0 ],
    [ -1, 0, 0 ],
    [ 0, 1, 0 ],
    [ 0, -1, 0 ],
    [ 0, 0, 1 ],
    [ 0, 0, -1 ]
];

function setup()
{
    p5.disableFriendlyErrors = true;
    createCanvas(width = 1280, height = 720, WEBGL);
    colorMode(HSB);
    frameRate(60);
    background(0);
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

            if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 < 1500)
            {
                stroke(colors[Math.round(i / 50) % colors.length]);
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

            push()
            translate(mcx * 8, mcy * 8, mcz * 8);
            rotateZ(a.z * rotangle);
            rotateY(a.y * rotangle);
            stroke(colors[Math.round(i / 60) % colors.length]);
            strokeWeight(0.2);
            box(15);
            pop();

            pop();
        }
        else
        {
            push()
            translate(a.x, a.y, a.z)

            push()
            translate(msx * 11, msy * 11, msz * 11);
            rotateZ(a.z * rotangle);
            rotateX(a.x * rotangle);
            stroke(colors[Math.round(i / 30) % colors.length]);
            strokeWeight(0.1);
            sphere(a.z * 0.05, 5, 5);
            pop();

            pop();
        }

        push()
        translate(a.x, a.y, a.z)

        push()
        translate(mcz * 12, msx * 13, mcy * 11);
        stroke(colors[Math.round(i / 70) % colors.length]);
        strokeWeight(0.1);
        sphere(a.y * 0.02, 3, 3);
        pop();

        pop();
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
