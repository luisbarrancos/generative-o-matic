const gridSize = [512, 512];

let font;

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
	const verts 			= "assets/vertex.vert";
	const add_frag 			= "assets/velocityAddShader.frag";
	const diffuse_frag 		= "assets/velocityDiffuseShader.frag";
	const advect_frag		= "assets/velocityAdvectShader.frag";
	const project_frag 		= "assets/velocityProjectShader.frag";
	const pressure_frag 	= "assets/pressureShader.frag";
	const display_frag 		= "assets/displayShader.frag";

	// velocity map
	velocityAddShader = loadShader(verts, add_frag);
	velocityDiffuseShader = loadShader(verts, diffuse_frag);
	velocityAdvectShader = loadShader(verts, advect_frag);
	velocityProjectShader = loadShader(verts, project_frag);
	// pressure map
	pressureShader = loadShader(verts, pressure_frag);
	// dense map
	denseAddShader = loadShader(verts, add_frag);
	denseDiffuseShader = loadShader(verts, diffuse_frag);
	denseAdvectShader = loadShader(verts, advect_frag);
	// display
	displayShader = loadShader(verts, display_frag);
}

function setup()
{
	const w = windowWidth;
	const h = windowHeight;
	createCanvas(w, h, WEBGL);
	pixelDensity(1);
	noStroke();

	velocityMap = createGraphics(gridSize[0], gridSize[1], WEBGL);
	pressureMap = createGraphics(gridSize[0], gridSize[1], WEBGL);
	denseMap = createGraphics(gridSize[0], gridSize[1], WEBGL);

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
	displayShader.setUniform('uBaseColor', [0.6, 0.6, 0.65]);
}


function draw() {
	
	//noiseDetail(5, 0.8);
	//pressureMap.background(noise(frameCount), noise(frameCount*2), noise(frameCount*3));

	// velocity ------------------------------------------------------
	velocityMap.shader(velocityDiffuseShader);
	velocityDiffuseShader.setUniform('uTexture', velocityMap);
	velocityDiffuseShader.setUniform('uResolution', gridSize);
	velocityDiffuseShader.setUniform('uFloat', 0.1);
	velocityMap.rect(-gridSize[0]/2, -gridSize[1]/2, gridSize[0], gridSize[1]);
	
	velocityMap.shader(velocityAdvectShader);
	velocityAdvectShader.setUniform('uTexture', velocityMap);
	velocityAdvectShader.setUniform('uVelocity', velocityMap);
	velocityAdvectShader.setUniform('uFloat', 1.0);
	velocityMap.rect(-gridSize[0]/2, -gridSize[1]/2, gridSize[0], gridSize[1]);
	
	pressureMap.shader(pressureShader);
	pressureShader.setUniform('uVelocity', velocityMap);
	pressureShader.setUniform('uResolution', gridSize);
	for (let i = 0; i < 20; i++) {
		pressureShader.setUniform('uPressure', pressureMap);
		pressureMap.rect(-gridSize[0]/2, -gridSize[1]/2, gridSize[0], gridSize[1]);
	}
	
	velocityMap.shader(velocityProjectShader);
	velocityProjectShader.setUniform('uPressure', pressureMap);
	velocityProjectShader.setUniform('uVelocity', velocityMap);
	velocityProjectShader.setUniform('uResolution', gridSize);
	velocityMap.rect(-gridSize[0]/2, -gridSize[1]/2, gridSize[0], gridSize[1]);
	
	
	// denseMap ------------------------------------------------------
	denseMap.shader(denseDiffuseShader);
	denseDiffuseShader.setUniform('uTexture', denseMap);
	denseDiffuseShader.setUniform('uResolution', gridSize);
	denseDiffuseShader.setUniform('uFloat', 0.1);
	denseMap.rect(-gridSize[0]/2, -gridSize[1]/2, gridSize[0], gridSize[1]);
	
	denseMap.shader(denseAdvectShader);
	denseAdvectShader.setUniform('uTexture', denseMap);
	denseAdvectShader.setUniform('uVelocity', velocityMap);
	denseAdvectShader.setUniform('uFloat', 0.998);
	denseMap.rect(-gridSize[0]/2, -gridSize[1]/2, gridSize[0], gridSize[1]);
	
	// display -------------------------------------------------------
	const col = color(`hsb(${frameCount%360}, 50%, 50%)`);
	displayShader.setUniform('uSourceColor', [col._getRed() / 255, col._getGreen() / 255, col._getBlue() / 255]);
	displayShader.setUniform('uTexture', denseMap);
	rect(-width/2, -height/2, width, height);
}


function mouseMoved() {
	const mousePos = [mouseX / width * gridSize[0], (height - mouseY) / height * gridSize[1]];
	
	velocityMap.shader(velocityAddShader);
	velocityAddShader.setUniform('uTexture', velocityMap);
	velocityAddShader.setUniform('uSourse', [constrain(movedX / 10.0, -0.5, 0.5), constrain(movedY / 10.0, -0.5, 0.5), 0]);
	velocityAddShader.setUniform('uMouse', mousePos);
	velocityAddShader.setUniform('uWindowsize', [width, height]);
	velocityMap.rect(-gridSize[0]/2, -gridSize[1]/2, gridSize[0], gridSize[1]);
	
	denseMap.shader(denseAddShader);
	denseAddShader.setUniform('uTexture', denseMap);
	denseAddShader.setUniform('uSourse', [0.2, 0, 0]);
	denseAddShader.setUniform('uMouse', mousePos);
	denseAddShader.setUniform('uWindowsize', [width, height]);
	denseMap.rect(-gridSize[0]/2, -gridSize[1]/2, gridSize[0], gridSize[1]);
}

const vert = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTexCoord;

void main(void) {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
	
	vTexCoord = aTexCoord;
}
`;

const addFrag = `
precision highp float;

uniform sampler2D uTexture;
uniform vec3 uSourse;
uniform vec2 uMouse;
uniform vec2 uWindowsize;

varying highp vec2 vTexCoord;

void main(void) {
	vec2 to = uMouse - gl_FragCoord.xy;
	to *= uWindowsize / uWindowsize.x;
	vec3 splat = uSourse * exp(-dot(to, to) / 50.0);
	vec3 color = texture2D(uTexture, vTexCoord).rgb + splat;

	gl_FragColor = vec4(color, 1.0);
}
`;

const diffuseFrag = `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uFloat;

varying highp vec2 vTexCoord;

const float h = 1.0;

void main(void) {
	vec2 pix = 1.0 / uResolution;
	
	vec3 col0 = texture2D(uTexture, vTexCoord).rgb;
	vec3 col1 = texture2D(uTexture, vTexCoord + vec2(pix.x, 0.0)).rgb;
	vec3 col2 = texture2D(uTexture, vTexCoord - vec2(pix.x, 0.0)).rgb;
	vec3 col3 = texture2D(uTexture, vTexCoord + vec2(0.0, pix.y)).rgb;
	vec3 col4 = texture2D(uTexture, vTexCoord - vec2(0.0, pix.y)).rgb;
	
	vec3 laplacian = (col1 + col2 + col3 + col4 - 4.0 * col0) / (h * h);
	
	vec3 color = col0 + uFloat * laplacian;
	
	gl_FragColor = vec4(color, 1.0);
}
`;

const advectFrag = `
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uVelocity;
uniform float uFloat;

varying highp vec2 vTexCoord;

const float dt = 0.008;

void main(void) {
	vec2 pos_to = vTexCoord - (texture2D(uVelocity, vTexCoord).xy - 127.0 / 255.0) * dt;
	vec3 color = texture2D(uTexture, pos_to).rgb;
	
	gl_FragColor = vec4(uFloat * color, 1.0);
}
`;

const projectFrag = `
precision highp float;

uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uResolution;

varying highp vec2 vTexCoord;

const float h = 1.0;

void main(void) {
	vec2 pix = 1.0 / uResolution;
	
	float p1 = texture2D(uPressure, vTexCoord + vec2(pix.x, 0.0)).x;
	float p2 = texture2D(uPressure, vTexCoord - vec2(pix.x, 0.0)).x;
	float p3 = texture2D(uPressure, vTexCoord + vec2(0.0, pix.y)).x;
	float p4 = texture2D(uPressure, vTexCoord - vec2(0.0, pix.y)).x;
	
	vec2 uv = texture2D(uVelocity, vTexCoord).xy;
	uv += vec2(p1 - p2, p3 - p4) / (2.0 * h);
	
	gl_FragColor = vec4(uv, 0.0, 1.0);
}
`;

const pressureFrag = `
precision highp float;

uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uResolution;

varying highp vec2 vTexCoord;

const float h = 1.0;

void main(void) {
	vec2 pix = 1.0 / uResolution;
	
	float p1 = texture2D(uPressure, vTexCoord + vec2(pix.x, 0.0)).x;
	float p2 = texture2D(uPressure, vTexCoord - vec2(pix.x, 0.0)).x;
	float p3 = texture2D(uPressure, vTexCoord + vec2(0.0, pix.y)).x;
	float p4 = texture2D(uPressure, vTexCoord - vec2(0.0, pix.y)).x;
	
	float u1 = texture2D(uVelocity, vTexCoord + vec2(pix.x, 0.0)).x;
	float u2 = texture2D(uVelocity, vTexCoord - vec2(pix.x, 0.0)).x;
	float v1 = texture2D(uVelocity, vTexCoord + vec2(0.0, pix.y)).y;
	float v2 = texture2D(uVelocity, vTexCoord - vec2(0.0, pix.y)).y;
	
	float div = u1 - u2 + v1 - v2;
	
	float p = (p1 + p2 + p3 + p4 + h * div / 2.0) / 4.0;
	
	gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
}
`;

const displayFrag = `
precision highp float;

uniform sampler2D uTexture;
uniform vec3 uBaseColor;
uniform vec3 uSourceColor;

varying highp vec2 vTexCoord;

void main(void) {
	float u = texture2D(uTexture, vTexCoord).x;
	vec3 color = mix(uBaseColor, uSourceColor, u);
	gl_FragColor = vec4(color, 1.0);
}
`;
