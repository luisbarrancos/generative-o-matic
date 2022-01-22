
const screen_width = 1024;
const screen_height = 1024;
const scaling = 2.0;
const numsteps = 40 * scaling;

let xstep, ystep;
let half_width, half_height;
let sun_xcoord, sun_ycoord;

const colors =
"03071e,370617,6a040f,9d0208,d00000,dc2f02,e85d04,f48c06,faa307,ffba08"
        .split(",")
        .map((a) => "#" + a);

const colors2 =
    "03071e,370617,6a040f,9d0208,d00000,dc2f02,e85d04,f48c06,faa307,ffba08"
    .split(",")
    .map((a) => "#" + a);


function setup()
{
    createCanvas(screen_width, screen_height);//, WEBGL);
    //colorMode(HSB, 1);
    angleMode(RADIANS);
    noFill();
    //noStroke();
    // noLoop();
    stroke(120, 200, 200);
    background(0);
    frameRate(25);

    xstep = screen_width % numsteps;
    ystep = screen_height % numsteps;
    ystep *= 0.957;
    half_width = screen_width / 2;
    half_height = screen_height / 2;

    sun_xcoord = screen_width - 130 * scaling;
    sun_ycoord = screen_height - 180 * scaling;

    half_width = 0;
    half_height = 0;

    //blendMode(ADD);
}

function hexToRgb(hex)
{
    hex = hex.replace('#', '');

    var bigint = parseInt(hex, 16);

    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return color(r, g, b);
}

function draw()
{
    background(0, 0, 0, 2);
    const t = frameCount * 0.1;
    const m = millis() * 0.001;

    noiseDetail(1, 0.873);

    //beginShape(QUADS);
    for (let x = 0; x < screen_width; x += xstep)
    {
        let lastx = x;

        for (let y = 0; y < screen_height; y += ystep)
        {
            const bx = noise(x + t, y + t) * 100 / scaling;
            const by = noise(x + m, y + m) * 100 / scaling;
            const nx = Math.cos(bx) * 50 / scaling + xstep / 2;
            const ny = Math.sin(by) * 50 / scaling + ystep / 2;

            let c = hexToRgb(colors[Math.ceil(Math.abs(y / scaling)) % colors.length]);
            //console.log("color c " + c);
            c.setAlpha(100);
            //stroke(c);
            noStroke();
            fill(c);

            const xx = x - half_width + nx;
            const yy = y - half_height + ny;


            let c2 = hexToRgb(colors2[Math.ceil(Math.abs(y)) % colors2.length]);
            //console.log("color c " + c);
            c2.setAlpha(15);
            fill(c2);
            blendMode(ADD);
            ellipse(sun_xcoord, sun_ycoord, xx / bx, yy / by);
            blendMode(BLEND);
            fill(c);

            //curveVertex(x, y);
            //curveVertex(xx, yy);
            //curveVertex(lastx, yy);
            rect(xx, yy, x - xx, y - yy);


            //ellipse(x - half_width + nx, y - half_height + ny,
            //        40 * noise(y + t + m, x + t + m));
        }
    }
}
