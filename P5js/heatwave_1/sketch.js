
const screen_width = 1024;
const screen_height = 1024;
const scaling = 2.0;
const numsteps = 40 * scaling;
const frame_rate = 25;

let xstep, ystep;
let half_width, half_height;
let sun_xcoord, sun_ycoord;
let pg;
let scaleOutput = 1;

const colors =
"264653,287271,2a9d8f,8ab17d,babb74,e9c46a,efb366,f4a261,ee8959,e76f51"
.split(",")
.map((a) => "#" + a);

const colors2 =
"03071e,370617,6a040f,9d0208,d00000,dc2f02,e85d04,f48c06,faa307,ffba08"
.split(",")
.map((a) => "#" + a);


function hexToRgb(hex)
{
    hex = hex.replace('#', '');
    
    var bigint = parseInt(hex, 16);
    
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    
    return color(r, g, b);
}

function setup()
{
    createCanvas(screen_width, screen_height);//, WEBGL);
    angleMode(RADIANS);
    background(0);
    frameRate(frame_rate);
    
    //pixelDensity(0.5);
    noFill();
    noStroke();
    
    xstep = screen_width % numsteps;
    ystep = screen_height % numsteps;
    ystep *= 0.957;
    half_width = screen_width / 2;
    half_height = screen_height / 2;
    
    sun_xcoord = screen_width - 130 * scaling;
    sun_ycoord = screen_height - 180 * scaling;
    
    half_width = 0;
    half_height = 0;
    
    pg = createGraphics(4096, 4096);
    pg.background(0);
}

let img;

function preload()
{
    //img = loadImage("sample-image.png");
}

function draw()
{
    background(0, 0, 0, 2);
    const t = frameCount * 0.1;
    const m = millis() * 0.001;
    
    noiseDetail(1, 0.873);
    
    for (let x = 0; x < screen_width; x += xstep)
    {
        let lastx = x;
        
        for (let y = 0; y < screen_height; y += ystep)
        {
            const bx = noise(x + t, y + t) * 100 / scaling;
            const by = noise(x + m, y + m) * 100 / scaling;
            const nx = Math.cos(bx) * 50 * scaling + xstep / 2;
            const ny = Math.sin(by) * 50 * scaling + ystep / 2;
            const xx = x - half_width + nx;
            const yy = y - half_height + ny;
            
            let c2 = hexToRgb(colors2[Math.ceil(Math.abs(y)) % colors2.length]);
            c2.setAlpha(15);
            fill(c2);
            blendMode(ADD);
            ellipse(sun_xcoord, sun_ycoord, xx / bx, yy / by);
            
            blendMode(BLEND);
            let c = hexToRgb(colors[Math.ceil(Math.abs(y / scaling)) % colors.length]);
            c.setAlpha(100);
            fill(c);
            rect(xx, yy, x - xx, y - yy);
        }
    }


}

function keyPressed()
{ 
    // Pressing the "q" key to
    // save the image
    if (key === "q")
    {
        save(`frame_${frameCount}.png`);
    }
}
