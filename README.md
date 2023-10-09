# Generative-o-matic

Assortment of [P5js](https://p5js.org/), [Processing](https://processing.org/) and [OpenFrameWorks](https://openframeworks.cc/download/) sketches.

## What is it then?

Some generative art sketches and simulations involving computer vision, optical flow, particles, vector fields, voice recognition via [Google's TeachableAI](https://teachablemachine.withgoogle.com/) and [ML5js](https://ml5js.org/), feature tracking and sentiment analysis via [CLMTrackr](https://github.com/auduno/clmtrackr).
For now [P5js](https://p5js.org/), only, but [Processing](https://processing.org/) and [OpenFrameWorks](https://openframeworks.cc/download/) sketches will follow shortly. 

## How can i use them?

You can try [VSCode](https://code.visualstudio.com/) with the [P5.vscode](https://marketplace.visualstudio.com/items?itemName=samplavigne.p5-vscode) extension, which pulls a live server, or you can try opening the HTML files in your browser. Note that some sketches require audio and/or webcam access, so make sure you are granting permissions for the sketches.
There's nothing suspicious about such access, but the sketches are small so even a beginner should be able to read them and feel reassured nothing abnormal is taking place.

## The exception(s)

Some sketches require running a [NodeJS](https://nodejs.org/en/) server though.
[This sketch in particular](https://github.com/luisbarrancos/generative-o-matic/tree/master/P5js/multiplayer_fluids), which relies on [P5.multiplayer](https://github.com/L05/p5.multiplayer) in order to have multiple users interacting via a QR scanned UI/interface sketch in their mobile devices with a host sketch.

### P5js sketches

 - Blur: defocused overlaying circles with a pseudo-random color gradient
 - Colored Orbitals: wireframe orbitals around a center of attraction.
 - Flowfield: particle color accumulation as it traverses a noise vector field.
 - Flowlock: colored particles with movement rules across a noise vector field.
 - Frosted Window: random colored lines with pseudo-random color gradient.
 - Heatwave I: Procedural cityscape sunset, with gloom and pixelation.
 - HLines: Pseudo-random colored gradient horizontal grid lines.
 - HLines II: Pseudo-random ellipses and color gradient frosted window effect.
 - Light Orbitals: wireframe orbitals with lighter desaturated background.
 - Multiplayer Fluids: WebGL fluid dynamics where the user can join a NodeJS server via a QR code, and use his mobile phone to interact with other users and the fluid field.
 - Networked Cymatic: Pseudo-cymatics, where the user interaction in a server generates the wave patterns and oscillations on the plane.
 - Noisey Waves: radial noise circles overlaying.
 - Orbitals ML: Google ML trained particle orbitals around a center where multiple users can join and command the orbitals with ML trained voice recognition. Commands can be *Stop*, *X Rotate*, *Y Rotate*, *Z Rotate*, *Warmer*, *Colder*, *Faster*, *Slower*, *Bigger*, *Smaller*, *Wider*, *Closer*.
 - Solar Mirror: variant of Heatwave I, with the appearance of a sunset on a solar mirror array.
 - Solar Mirror Sunset: Yet another variant of Heatwave I.
 - Webcam Field Connectors: Particle agents moving on a flow field generated by the webcam. The user can use gestures to drive the particles, but the particles have their own defined behaviour, being attracted to one another, but not too much. The attraction, proximity, repelling, generates sound waves. It creates the idea of sonic fluid around a user's gestures.
 - Webcam Vector Field: More basic version of the particle agents on a vector field.

## License

All sketches [GNU GPLv3 licensed](https://www.gnu.org/licenses/gpl-3.0.en.html), except where explicitly stated otherwise.

