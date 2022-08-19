# Multiplayer fluids

A sketch running a CFD simulation 
# Running the sketch

The sketch relies on [P5.multiplayer](https://github.com/L05/p5.multiplayer)
and follows the templated model given by the module authors, namely, copying
the custom host and server sketches into the ```p5-multiplayer/public``` 
directory, overwriting the existing sketches, and start the nodejs server.
However, the entire structure is already in-place and ready to run.

## Running

1. Go to the [multiplayer fluids directory](https://github.com/luisbarrancos/generative-o-matic/tree/master/P5js/multiplayer_fluids) and you should see the files ```server.js```, ```host.js``` and ```index.js```

2. Edit them so that their ```serverIp``` entries are filled to your network setup, i.e, ```192.168.0.3``` and ```serverPort``` set to, for example, port 3000.

3. With NodeJS in your system, still in the ```multiplayer_fluids``` directory run ```npm install```

4. Run ```node server.js```

5. You should have a server running now. Open your host in a browser, i.e, ```http://192.168.0.3:3000/host.html``` assuming the defaults outlined in point 2.

6. Scan the QR code with your mobile, it should go to i.e, ```http://192.168.0.3:3000/?=sdi4``` which is the hardcoded *room* name.

## Notes

Tried on Firefox, Chrome. You should see a virtual "bubble level" moving in your mobile phone. If you see a large static circle within a circle, without any motion whatsoever, check your device permissions. You need access to the mobile phone sensors in order to get their data.

## Authors

 * Luis Barrancos, p5 host, client
 * José Magalháes, server & CFD integration
 * Pavel Dobryakov, CFD GLSL

## Licenses

GNU GPLv3 unless stated otherwise, namely, Pavel Dobryakov's MIT licensed GLSL code.

