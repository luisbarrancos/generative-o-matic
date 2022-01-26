/*
p5.multiplayer - HOST

This "host" sketch is intended to be run in desktop browsers.
It connects to a node server via socket.io, from which it receives
rerouted input data from all connected "clients".

Navigate to the project"s "public" directory.
Run http-server -c-1 to start server. This will default to port 8080.
Run http-server -c-1 -p80 to start server on open port 80.

*/

////////////
// Network Settings
// const serverIp      = "https://yourservername.herokuapp.com";
// const serverIp      = "https://yourprojectname.glitch.me";

const serverIp   = "192.168.0.3";
const serverPort = "3000";
const local      = true;
let game;

// essential UI parameters
const screen_width  = 512;
const screen_height = 512;
const half_width    = screen_width / 2;
const half_height   = screen_height / 2;
const frame_rate    = 25;

// enable to debug
const debug              = true;
p5.disableFriendlyErrors = true;

// sound synthesis related
const absolute_min_frequency = 20;
const absolute_max_frequency = 20000; // for sound step
const fft_samples            = 64;

// We"ll create an array of 10 oscillators then on a time basis change
// the wave type, frequency, amplitude. Individually it will be
// imperceptible, but combined it will slowly evolve over time
// TODO: move to class

// QR code related stuff
let qr_img;
// an HTML div to display it in:
let tagDiv;
// font related
let font;

// shaders and glsl related
let shader_base;
// This is going to be painful
// TODO: clean this up a bit, move input events into own class, and perhaps some
//       OpenGL/GLSL functionality as well
const gridSize = [ 512, 512 ];

let velocityMap;
let pressureMap;
let denseMap;

let velocityAddShader;
let velocityDiffuseShader;
let velocityAdvectShader;
let velocityProjectShader;
let pressureShader;
let denseAddShader;
let denseDiffuseShader;
let denseAdvectShader;
let displayShader;

function preload()
{
    setupHost();

    // DEBUG shader
    /*
    shader_base = loadShader(
        "assets/base.vert",
        "assets/base.frag",
    );
    */
    const verts         = "assets/vertex.vert";
    const add_frag      = "assets/velocityAddShader.frag";
    const diffuse_frag  = "assets/velocityDiffuseShader.frag";
    const advect_frag   = "assets/velocityAdvectShader.frag";
    const project_frag  = "assets/velocityProjectShader.frag";
    const pressure_frag = "assets/pressureShader.frag";
    const display_frag  = "assets/displayShader.frag";

    // velocity map
    velocityAddShader     = loadShader(verts, add_frag);
    velocityDiffuseShader = loadShader(verts, diffuse_frag);
    velocityAdvectShader  = loadShader(verts, advect_frag);
    velocityProjectShader = loadShader(verts, project_frag);
    // pressure map
    pressureShader = loadShader(verts, pressure_frag);
    // dense map
    denseAddShader     = loadShader(verts, add_frag);
    denseDiffuseShader = loadShader(verts, diffuse_frag);
    denseAdvectShader  = loadShader(verts, advect_frag);
    // display
    displayShader = loadShader(verts, display_frag);

    // fonts must be loaded and set before drawing text
    // WebGL text()
    // https://github.com/processing/p5.js/wiki/Getting-started-with-WebGL-in-p5
    font = loadFont("assets/RobotoMono-Regular.ttf");
}

function setup()
{
    if (debug)
    {
        p5.disableFriendlyErrors = false;
        console.log("Initializing...");
        setuplogger();
    }

    // noCanvas();
    let canvas = createCanvas(screen_width, screen_height, WEBGL);
    canvas.position(0, 0);
    angleMode(RADIANS);
    frameRate(frame_rate);

    // blendMode(ADD);
    background(0);

    // main CFD shader
    // TODO: well, we"re creating the FBOs, and loading the shaders, we could
    // store
    //       into an object, encapsulate this neatly to spare this spam in
    //       setup() but on the other hand it is yet another layer of
    //       indirection.
    //
    velocityMap = createGraphics(gridSize[0], gridSize[1], WEBGL);
    pressureMap = createGraphics(gridSize[0], gridSize[1], WEBGL);
    denseMap    = createGraphics(gridSize[0], gridSize[1], WEBGL);

    velocityMap.shader(velocityAddShader);
    velocityMap.shader(velocityDiffuseShader);
    velocityMap.shader(velocityAdvectShader);
    velocityMap.shader(velocityProjectShader);

    pressureMap.shader(pressureShader);

    denseMap.shader(denseAddShader);
    denseMap.shader(denseDiffuseShader);
    denseMap.shader(denseAdvectShader);

    velocityMap.background(127, 127, 0);

    velocityMap.stroke(127, 127, 0);
    pressureMap.background(0);
    pressureMap.stroke(0);
    denseMap.background(0);
    denseMap.stroke(0);

    shader(displayShader);
    displayShader.setUniform("uBaseColor", [ 0.6, 0.6, 0.65 ]);

    // qrcode for server, room
    qr_img = generate_qrcode(room_url(), 4, 6);

    // create the HTML tag div
    tagDiv = createDiv();
    tagDiv.position(screen_width - 100, screen_height - 100);

    // Host/Game setup
    game = new Game(screen_width, screen_height);
}

function draw()
{
    // clear();
    // fill(255, 127, 50);
    // background(0);

    // The shader call must be per frame, and the input only per established
    // connection. After the rectangle binding the GLSL shaders, we need the
    // players information and the QR code. We might need to add these to the
    // actual shader itself since the rectangle ovelays on top of everything.
    //
    // DEBUG shader
    // shader(shader_base);
    // and the rectangle for them, but the QR code must be sent aftwards
    // rect(0, 0, width, height);

    // Main CFD shader
    // noiseDetail(5, 0.8);
    // pressureMap.background(noise(frameCount), noise(frameCount*2),
    // noise(frameCount*3));

    // TODO: this needs to be neater...
    // Velocity
    velocityMap.shader(velocityDiffuseShader);
    velocityDiffuseShader.setUniform("uTexture", velocityMap);
    velocityDiffuseShader.setUniform("uResolution", gridSize);
    velocityDiffuseShader.setUniform("uFloat", 0.1);
    velocityMap.rect(
        -gridSize[0] / 2, -gridSize[1] / 2, gridSize[0], gridSize[1]);
    // Advection
    velocityMap.shader(velocityAdvectShader);
    velocityAdvectShader.setUniform("uTexture", velocityMap);
    velocityAdvectShader.setUniform("uVelocity", velocityMap);
    velocityAdvectShader.setUniform("uFloat", 1.0);
    velocityMap.rect(
        -gridSize[0] / 2, -gridSize[1] / 2, gridSize[0], gridSize[1]);

    // Pressure
    pressureMap.shader(pressureShader);
    pressureShader.setUniform("uVelocity", velocityMap);
    pressureShader.setUniform("uResolution", gridSize);
    for (let i = 0; i < 20; i++)
    {
        pressureShader.setUniform("uPressure", pressureMap);
        pressureMap.rect(
            -gridSize[0] / 2, -gridSize[1] / 2, gridSize[0], gridSize[1]);
    }
    // Projection
    velocityMap.shader(velocityProjectShader);
    velocityProjectShader.setUniform("uPressure", pressureMap);
    velocityProjectShader.setUniform("uVelocity", velocityMap);
    velocityProjectShader.setUniform("uResolution", gridSize);
    velocityMap.rect(
        -gridSize[0] / 2, -gridSize[1] / 2, gridSize[0], gridSize[1]);

    // Density
    denseMap.shader(denseDiffuseShader);
    denseDiffuseShader.setUniform("uTexture", denseMap);
    denseDiffuseShader.setUniform("uResolution", gridSize);
    denseDiffuseShader.setUniform("uFloat", 0.1);
    denseMap.rect(-gridSize[0] / 2, -gridSize[1] / 2, gridSize[0], gridSize[1]);

    // Density/advection
    denseMap.shader(denseAdvectShader);
    denseAdvectShader.setUniform("uTexture", denseMap);
    denseAdvectShader.setUniform("uVelocity", velocityMap);
    denseAdvectShader.setUniform("uFloat", 0.998);
    denseMap.rect(-gridSize[0] / 2, -gridSize[1] / 2, gridSize[0], gridSize[1]);

    // Finally display
    // TODO: move to half-float FBO, add bloom, tonemap
    const col = color(`hsb(${frameCount % 360}, 50%, 50%)`);
    displayShader.setUniform(
        "uSourceColor",
        [ col._getRed() / 255, col._getGreen() / 255, col._getBlue() / 255 ]);
    displayShader.setUniform("uTexture", denseMap);
    rect(-width / 2, -height / 2, width, height);

    if (isHostConnected(display = true))
    {
        // Display player IDs in top left corner
        game.printPlayerIds(5, 20);
        // Update and draw game objects
        // game.draw();
    }
    // this might need to be moved with the other text into the actual shader
    // if we don"t find a way to overlay the image over the rectangle
    displayCustomAddress(color(255, 180), 12, 10, screen_height - 14);

    if (debug)
    {
        document.getElementById("qrcode").innerHTML = qr_img;
    }
    else
    {
        tagDiv.html(qr_img);
    }
}

function onClientConnect(data)
{
    // Client connect logic here. --->
    if (debug)
    {
        console.log(`${data.id} has connected.`);
    }

    if (!game.checkId(data.id))
    {
        game.add(data.id);
    }
    // <----
}

function onClientDisconnect(data)
{
    // Client disconnect logic here. --->
    if (game.checkId(data.id))
    {
        game.remove(data.id);
    }
    // <----
}

// functions
// on receive data, of data type
// call method that changes game state
// so the game object must contain the game state, the cymatics
//

function onReceiveData(data)
{
    if (data != null)
    {
        if (debug)
        {
            console.log(data);
        }

        // Main series of input events from the client
        // Unique player color ID
        //
        if (data.type === "player_color")
        {
            game.setColor(data.id, data.r * 255, data.g * 255, data.b * 255);
        }
        // On mouse click, send X,Y coords, and affect the frequency and
        // amplitude of the soundwave.
        else if (data.type === "input_coords")
        {
            processMouseClick(data);
            // game method to process input coords (sound effect)
        }
        // If the device motion is above a shake threshold, trigger
        else if (data.type === "shaken")
        {
            processDeviceShake(data);
        }
        // If device motion is above a shake threshold, trigger, so that we
        // have a binary state: resting | movement
        else if (data.type === "device_moved")
        {
            // accelerationX|Y|Z, rotationX|Y|Z
            // inclination
            processDeviceSensors(data);
        }
        // Touch & drag, not yet active
        else if (data.type === "touch_drag")
        {
            processTouchDrag(data);
        }
    }
}

//
// Input processing
//
// function that calls method of globally accessible game object which
// was declared outside any method, globally, but instantiated within setup()
//

function processMouseClick(data)
{
    if (data != null)
    {
        game.players[data.id].xcoord = data.xcoord;
        game.players[data.id].ycoord = data.ycoord;

        const frequency = MathUtils.clamp(
            Math.round(
                map(data.xcoord,
                    0,
                    screen_width,
                    game.players[data.id].frequency_range.min_frequency,
                    game.players[data.id].frequency_range.max_frequency)),
            absolute_min_frequency,
            absolute_max_frequency);

        const amplitude = MathUtils.clamp(
            map(data.ycoord, 0, screen_height, 0.001, 1.0), 0.0, 1.0);

        if (debug)
        {
            log(`processMouseClick: Frequency = ${frequency}, amplitude = ${
                amplitude}`);
        }

        game.updateSoundWaves(data.id, frequency, amplitude, "sine");

        // game.updateVisuals(data.id);
        if (debug)
        {
            console.log(`${data.id} XY received: X = ${data.xcoord}, ${
                data.id} Y = ${data.ycoord}`);
        }
    }
}

////////////
// Input processing
// TODO: move to own separate class, this is annoying
function processJoystick(data)
{
    fill(0, 255, 0);
    text("process joystick data", width / 2, height / 2);
}

function processDeviceShake(data)
{
    fill(255, 200, 0);
    text("process device shake");
}

function processDeviceSensors(data)
{
    fill(255, 200, 0);
    text("process device sensors");
}

function processTouchDrag(data)
{
    if (debug)
    {
        fill(255, 200, 0);
        text("Process touch & drag:");
        if (data != null)
        {
            // text(`Process touch & drag: x coord = ${data.x_coord}, movedX =
            // ${data.x_motion}`); text(`Process touch & drag: y coord =
            // ${data.y_coord}, movedX = ${data.y_motion}`);
        }
    }

    if (data != null)
    {
        const mousePos = [
            data.x_coord / width * gridSize[0],
            (height - data.y_coord) / height * gridSize[1] // swapped Y in GLSL
        ];

        velocityMap.shader(velocityAddShader);
        velocityAddShader.setUniform("uTexture", velocityMap);
        // should be movedX, movedY
        velocityAddShader.setUniform("uSourse", [
            constrain(data.x_pcoord / 10.0, -0.5, 0.5),
            constrain(data.y_pcoord / 10.0, -0.5, 0.5),
            0
        ]);

        velocityAddShader.setUniform("uMouse", mousePos);
        velocityAddShader.setUniform("uWindowsize", [ width, height ]);
        velocityMap.rect(
            -gridSize[0] / 2, -gridSize[1] / 2, gridSize[0], gridSize[1]);

        denseMap.shader(denseAddShader);
        denseAddShader.setUniform("uTexture", denseMap);
        denseAddShader.setUniform("uSourse", [ 0.2, 0, 0 ]);
        denseAddShader.setUniform("uMouse", mousePos);
        denseAddShader.setUniform("uWindowsize", [ width, height ]);
        denseMap.rect(
            -gridSize[0] / 2, -gridSize[1] / 2, gridSize[0], gridSize[1]);
    }
}

// Displays server address in lower left of screen
function room_url(roomid = null)
{
    if (roomid == null || roomId === "undefined")
        return `${serverIp}:${serverPort}/?=sdi4`;

    return `${serverIp}:${serverPort}/?=${roomId}`;
}

function generate_qrcode(qr_input_string, margin, size)
{
    // qrcode for server, room
    // const qr_input_string = room_url();
    let qr = qrcode(0, "L");
    qr.addData(qr_input_string);
    qr.make();
    const qr_img = qr.createImgTag(margin, size, "qr code");
    return qr_img;
}

function displayCustomAddress(textcolor, font_size, xpos, ypos)
{
    push();
    fill(textcolor);
    textFont(font, font_size);
    text(
        `Enter the room at : ${serverIp}/?=${roomId} or scan the QR code`,
        xpos,
        ypos);
    pop();
}

// This is included for testing purposes to demonstrate that
// messages can be sent from a host back to all connected clients
function mousePressed()
{
    if (debug)
    {
        console.log("Mouse pressed: sending timestamp millis() to client.")
    }
    sendData("timestamp", {timestamp : millis()});
    // audio context
    userStartAudio();
}

/*
function mouseClicked()
{
    userStartAudio();
}
*/

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}
