// our vertex data
attribute vec3 aPosition;

// our texcoordinates
attribute vec2 aTexCoord;

// this is a variable that will be shared with the fragment shader
// we will assign the attribute texcoords to the varying texcoords to move them from the vert shader to the frag shader
// it can be called whatever you want but often people prefiv it with 'v' to indicate that it is a varying
varying vec2 vTexCoord;

void main() {

  // copy the texture coordinates
  vTexCoord = aTexCoord;

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  // send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}

/*

#ifdef GL_ES
precision mediump float;
#endif

/*
uniform - unchanging values (uniform) for all triangles.
attribute - vertex attributes. each vertex has different values for each of these. 
these are the INPUTs for the vertex shader.
varying - these are the values that are interpolated (vary) between the vertices of
 a triangle. these are the OUTPUTs of the vertex shader and the INPUTs of the fragment shader.

the vertex shader runs for a single vertex and the `attributes` contain the values for 
that vertex. the vertex shader is responsible for outputting the corresponding `varying`
 values for its vertex. those varying values are then interpolated over the surface of
  the triangle and the resulting interpolated values are passed to the fragment 
  shader in varyings of the same name.


attribute vec3 aPosition;
attribute vec2 aTexCoord;

// Always include this to get the position of the pixel and map the shader correctly onto the shape

void main() {

  // Copy the position data into a vec4, adding 1.0 as the w parameter
  vec4 positionVec4 = vec4(aPosition, 1.0);

  // scale the rect by two, and move it to the center of the screen
  // if we don't do this, it will appear with its bottom left corner in the center of the sketch
  // try commenting this line out to see what happens
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0; 

  // Send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}
*/