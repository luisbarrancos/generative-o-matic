"use strict";

const colors =
    "083d77-ebebd3-f4d35e-ee964b-f95738-f24".split("-").map(a => "#" + a)
const colors2 =
    "22577a-38a3a5-57cc99-80ed99-c7f9cc-fff".split("-").map(a => "#" + a)

let p      = [];
const edge = 300;

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
    blendMode(SCREEN);
    frameRate(60);
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
                const [vx, vy, vz] = random(dir);
                p.push({
                    x : x * 38,
                    y : y * 38,
                    z : z * 38,
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
    background((f + 127) % 255, 40, Math.floor(noise(f * 0.01) * 50), 0.25);
    noFill();

    if (f % ((edge + 1) * 2) == 1)
    {
        initArray();
    }
    rotateX(f / 61);
    rotateZ(f / 59);

    const tdelta   = 2 * PI * f * 0.1;
    const rotangle = tdelta * 0.0005;

    for (let i = 0; i < p.length - 1; i++)
    {
        let a = p[i];

        a.x += a.vx * 2;
        if (abs(a.x) > edge)
        {
            a.vx *= -1;
        }

        a.y += a.vy * 2;
        if (abs(a.y) > edge)
        {
            a.vy *= -1;
        }

        a.z += a.vz * 2;
        if (abs(a.z) > edge)
        {
            a.vz *= -1;
        }

        for (let j = i + 1; j < p.length; j++)
        {
            const b = p[j];

            if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2 < 1500)
            {
                const c2 = color(colors[Math.round(i / 50) % colors.length]);
                c2.setAlpha(0.1);
                stroke(c2);
                line(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        }
        const axdelta = a.x + tdelta;
        const aydelta = a.y + tdelta;
        const azdelta = a.z + tdelta;

        const mcx = Math.cos(axdelta);
        const mcy = Math.cos(aydelta);
        const mcz = Math.cos(azdelta);
        const msx = Math.sin(axdelta);
        const msy = Math.sin(aydelta);
        const msz = Math.sin(azdelta);

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
