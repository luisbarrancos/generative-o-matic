
precision highp float;

uniform sampler2D uTexture;
uniform vec3 uBaseColor;
uniform vec3 uSourceColor;

varying highp vec2 vTexCoord;

void main(void)
{
	float u = texture2D(uTexture, vTexCoord).x;
	vec3 color = mix(uBaseColor, uSourceColor, u);
	gl_FragColor = vec4(color, 1.0);
}
