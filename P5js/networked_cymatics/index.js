"use strict";

// essential UI parameters
var screen_width  = 512;
var screen_height = 512;
//
var half_width  = screen_width / 2;
var half_height = screen_height / 2;

const frame_rate  = 60;

// enable to debug
const debug = false;

// network tests
const serverIp   = "127.0.0.1";
const serverPort  = "3000";
const local = true;

// webcam, sentiment analysis
let val          = 5;
let positions    = null;
let face_tracker = null;
let ec           = null;
let emotionData  = null;

// player aux functions
let player_color, player_color_dim;
let player_colors;


// A click is needed for the device to request permission
if (typeof DeviceMotionEvent.requestPermission === 'function')
{
    document.body.addEventListener('click', function() {
        DeviceMotionEvent.requestPermission()
            .then(function() {
                console.log('DeviceMotionEvent enabled');

                motion = true;
                ios    = true;
            })
            .catch(function(error) {
                console.warn('DeviceMotionEvent not enabled', error);
            })
    })
}
else
{
    // we are not on ios13 and above
    // todo
    // add detection for hardware for other devices
    // if(got the hardware) {
    // motion = true;
    // }
}


function set_player_colors()
{
    let hue = random(0, 360);
    colorMode(HSB);
    player_color     = color(hue, 100, 100);
    player_color_dim = color(hue, 100, 80);
    colorMode(RGB);
    return {"active_color" : player_color, "dimmed_color" : player_color_dim};
}

function preload()
{
    setupClient();
}

function setup()
{
	createMetaTag();
    screen_width = window.innerWidth;
    screen_height = window.innerHeight;
    half_width    = screen_width / 2;
    half_height   = screen_height / 2;
    let canvas = createCanvas(screen_width, screen_height);

    canvas.position(0, 0);
    background(255, 0, 0);
    frameRate(frame_rate);
    angleMode(RADIANS);

    // setup player colors and other client variables
    player_colors = set_player_colors();
    // Send any initial setup data to your host here.
    /*
        Example:
        sendData('myDataType', {
        val1: 0,
        val2: 128,
        val3: true
        });

        Use `type` to classify message types for host.
    */
    sendData("player_color", {
        r : red(player_colors["active_color"]) / 255,
        g : green(player_colors["active_color"]) / 255,
        b : blue(player_colors["active_color"]) / 255
    });

    // Webcam for face tracking, sentiment analysis
    const constraints = {
        video : {
            width : {min : 320, ideal : min(screen_width, 640), max : 640},
            height : {min : 240, ideal : min(screen_height, 480), max : 480},
            frameRate : {min : 25, ideal : 25, max : 60},
            aspectRatio : screen_width / screen_height,
        },
        audio : false
    };

    let video_input = createCapture(constraints);
    video_input.size(width, height);
    video_input.position(0, 0);

    // video_input.elt.setAttribute("playsinline", ""); // apparently for iphone
    // compat (!)
    video_input.hide();

    // Tracker for sentiment analysis, CLMtracker
    // https://www.auduno.com/clmtrackr/docs/reference.html
    //
    // set eigenvector 9 and 11 to not be regularized.
    // This is to better detect motion of the eyebrows
    ///
    pModel.shapeModel.nonRegularizedVectors.push(9);
    pModel.shapeModel.nonRegularizedVectors.push(11);

    face_tracker = new clm.tracker({UseWebGL : true, scoreThreshold : 0.5});
    face_tracker.init(pModel); // clmtracker pModel default model_pca_20_svm
    // face_tracker.setResponseMode("blend", ["raw", "lpb"]); // heavier,
    // default is "raw"
    face_tracker.start(video_input.elt);

    // Sentiment analysis
    // from model, "angry", "disgusted", "fear", "sad", "surprised", "happy"
    delete emotionModel["disgusted"];
    delete emotionModel["fear"];
    ec = new emotionClassifier();
    ec.init(emotionModel);
    emotionData = ec.getBlank();
    // ec.predict(parameters), returns a prediction array
    // prediction[n] = {"emotion" : e, "value" : x}
    // prediction[n]["value"] = 1.0 / (1.0 + Math.exp(-score))
    // class emotionClassifier has member previousParameters[]
}

function draw()
{
    // blendMode(DIFFERENCE);
    // background(127, 50, 50, 50);
    // blendMode(HARD_LIGHT);
    background(player_colors["dimmed_color"], 50);

    //if (isClientConnected(display = true))
    if (isClientConnected())
    {
        // Tracking face, get x,y face markers
        positions = face_tracker.getCurrentPosition();

        if (positions.length > 0)
        {
            // requires a modified clmtrackr.js, bundled
            face_tracker.colorize_draw(
                canvas,
                undefined,
                undefined,
                "rgb(50, 200, 200)", // fill color
                "rgb(20, 150, 150)", // stroke color
                frameCount % 5       // stroke weight
            );
            /*
            for (let i = 0; i < positions.length; i++)
            {
                // draw ellipse at each position point
                ellipse(positions[i][0], positions[i][1], 4, 4);
            }
            */
            // Tracking parameters for sentiment analysis
            const cp = face_tracker.getCurrentParameters();
            const er = ec.meanPredict(cp);
            // er object: index, dict{emotion:x, value:y}
            // 0: {emotion: "angry", value : 0.345345}
            // emotions are: angry | sad | surprised | happy

            // this might need updating, so that when tracking list lost some emotion
            // is still playable in the host
            let maxkey = null, maxvalue = 0;
            for (let i = 0; i < er.length; i++)
            {
                if (er[i].value > maxvalue)
                {
                    maxvalue = er[i].value;
                    maxkey   = er[i].emotion;
                }
                if (debug)
                {
                    console.log(er[i]); // emotion and value
                    textSize(32);
                    text("Emotion = " + maxkey, screen_height / 2, 30);
                }
            }
            // We can send only the filtered emotion, with the highest confidence value
            // or the entire list. The first minimizes network throughput, the later
            // gives more creative possibilities (and processing load) to the server.
            // For now send everything
            sendData("emotion_results", {"emotion" : maxkey, "confidence" : maxvalue});
        }
        else if (debug)
        {
            textSize(32);
            noStroke();
            text("Tracking lost", screen_width / 2, screen_height / 2);
        }
    }
    else
    {
        text("Not connected", screen_width / 2, screen_height / 2);
    }
}

// Messages can be sent from a host to all connected clients
function onReceiveData(data)
{
    // Input data processing here. --->
    if (data.type === "timestamp")
    {
        print(data.timestamp);
    }

    // <----
    /* Example:
       if (data.type === "myDataType") {
         processMyData(data);
       }

       Use "data.type" to get the message type sent by host.
    */
}

function mouseClicked(event)
{
    if (debug)
    {
        console.log(`sketch X = ${mouseX}, Y = ${mouseY}`);
    }

    const input_coords = {
        "xcoord" : mouseX,
        "ycoord" : mouseY,
    };
    sendData("input_coords", input_coords);
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed()
{
    userStartAudio();
}

function mouseMoved(event)
{
    ; // userStartAudio() ?
}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling
 * the page.
 */
document.ontouchmove = function(event) {
    event.preventDefault();
};

function createMetaTag() {
	let meta = createElement('meta');
	meta.attribute('name', 'viewport');
	meta.attribute('content', 'user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width,height=device-height');

	let head = select('head');
	meta.parent(head);
}
