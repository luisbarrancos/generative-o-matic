# Running the sketch

The sketch relies on [P5.multiplayer](https://github.com/L05/p5.multiplayer)
and follows the templated model given by the module authors, namely, copying
the custom host and server sketches into the ```p5-multiplayer/public``` 
directory, overwriting the existing sketches, and start the nodejs server.

## Step by step

 * copy [index.js](https://github.com/luisbarrancos/generative-o-matic/blob/master/P5js/networked_cymatics/index.js) to the directory p5- multiplayer/public/
 * copy [host.js](https://github.com/luisbarrancos/generative-o-matic/blob/master/P5js/networked_cymatics/host.js) to the directory p5-multiplayer/public/
 * copy [index.html](https://github.com/luisbarrancos/generative-o-matic/blob/master/P5js/networked_cymatics/index.html) to the directory p5-multiplayer/public/
 * copy [host.html](https://github.com/luisbarrancos/generative-o-matic/blob/master/P5js/networked_cymatics/index.html) to the directory p5-multiplayer/public/
 * copy [emotionmode.js](https://github.com/luisbarrancos/generative-o-matic/blob/master/P5js/networked_cymatics/emotionmodel.js) to the directory p5-multiplayer/public/
 * copy [emotion_classifier.js](https://github.com/luisbarrancos/generative-o-matic/blob/master/P5js/networked_cymatics/emotion_classifier.js) to the directory p5-multiplayer/public/

Then go to directory [p5-multiplayer/](https://github.com/L05/p5.multiplayer) of your locally cloned P5.multiplayer repository.
And run the instructions from p5-multiplayer:

```bash
    npm install
    node server.js
```

This starts the server. Proceed then open a browser window to ```http://127.0.0.1:3000/host.html```
Check the console, this should give you a room name, but this is also shown in the
main sketch itself, in this case, it would be ```http://127.0.0.1:3000/?=gold```
This URL will be shown in the main sketch in textual form, besides in the form of a QR Code.
Scan and join.


