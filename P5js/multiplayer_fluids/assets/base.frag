#ifdef GL_ES
precision mediump float;
#endif

/*
uniform - unchanging values (uniform) for all triangles.
attribute - vertex attributes. each vertex has different 
values for each of these. these are the INPUTs for the vertex shader.
varying - these are the values that are interpolated (vary) between 
the vertices of a triangle. these are the OUTPUTs of the vertex shader 
and the INPUTs of the fragment shader.
*/

the vertex shader runs for a single vertex and the `attributes` contain the values for that vertex. the vertex shader is responsible for outputting the corresponding `varying` values for its vertex. those varying values are then interpolated over the surface of the triangle and the resulting interpolated values are passed to the fragment shader in varyings of the same name.
uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file

void main() {

  // position of the pixel divided by resolution, to get normalized positions on the canvas
  vec2 st = gl_FragCoord.xy/u_resolution.xy; 

  // Lets use the pixels position on the x-axis as our gradient for the red color
  // Where the position is closer to 0.0 we get black (st.x = 0.0)
  // Where the position is closer to width (defined as 1.0) we get red (st.x = 1.0)

  gl_FragColor = vec4(st.x,0.0,0.0,1.0); // R,G,B,A

  // you can only have one gl_FragColor active at a time, but try commenting the others out
  // try the green component

  //gl_FragColor = vec4(0.0,st.x,0.0,1.0); 

  // try both the x position and the y position
  
  //gl_FragColor = vec4(st.x,st.y,0.0,1.0); 
}