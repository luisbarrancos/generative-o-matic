
precision highp float;

uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uResolution;

varying highp vec2 vTexCoord;

const float h = 1.0;

void main(void)
{
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

