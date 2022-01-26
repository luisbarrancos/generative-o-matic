
precision highp float;

uniform sampler2D uTexture;
uniform vec3 uSourse;
uniform vec2 uMouse;
uniform vec2 uWindowsize;

varying highp vec2 vTexCoord;

void main(void)
{
    vec2 to = uMouse - gl_FragCoord.xy;
    to *= uWindowsize / uWindowsize.x;
    vec3 splat = uSourse * exp(-dot(to, to) / 50.0);
    vec3 color = texture2D(uTexture, vTexCoord).rgb + splat;

    gl_FragColor = vec4(color, 1.0);
}
