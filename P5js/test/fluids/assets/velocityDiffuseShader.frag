
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uFloat;

varying highp vec2 vTexCoord;

const float h = 1.0;

void main(void)
{
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
