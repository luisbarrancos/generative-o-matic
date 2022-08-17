// vertex data
attribute vec3 aPosition;

// and texcoords
attribute vec2 aTexCoord;

// varying texcoords shadered with the fragment shader
varying vec2 vTexCoord;

void main()
{
    vTexCoord = aTexCoord;
    
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}