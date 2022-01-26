
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uVelocity;
uniform float uFloat;

varying highp vec2 vTexCoord;

const float dt = 0.008;

void main(void)
{
    vec2 pos_to = vTexCoord - (texture2D(uVelocity, vTexCoord).xy - 127.0 / 255.0) * dt;
    vec3 color  = texture2D(uTexture, pos_to).rgb;

    gl_FragColor = vec4(uFloat * color, 1.0);
}
