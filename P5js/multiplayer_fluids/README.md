# Running the sketch

The sketch relies on [P5.multiplayer](https://github.com/L05/p5.multiplayer)
and follows the templated model given by the module authors, namely, copying
the custom host and server sketches into the ```p5-multiplayer/public``` 
directory, overwriting the existing sketches, and start the nodejs server.

## Step by step

Go to this sketch's [root](https://github.com/luisbarrancos/generative-o-matic/blob/sdi4/P5js/multiplayer_fluids/) of your locally cloned repo and run the instructions from p5-multiplayer:

```bash
    npm install
    node server.js
```

This starts the server. Proceed then open a browser window to ```http://127.0.0.1:3000/host.html```
Check the console, this should give you a room name, but this is also shown in the
main sketch itself, in this case, it would be ```http://127.0.0.1:3000/?=gold```
This URL will be shown in the main sketch in textual form, besides in the form of a QR Code.
Scan and join.

## Attention:

You might need to edit the variables ```serverIp``` and ```serverPort``` in the files ```server.js```, ```host.js``` and ```index.js``` to reflect your own network situation.

