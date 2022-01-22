
copy index.js               to the directory p5-multiplayer/public/
copy host.js                to the directory p5-multiplayer/public/
copy index.html             to the directory p5-multiplayer/public/
copy host.html              to the directory p5-multiplayer/public/
copy emotionmode.js         to the directory p5-multiplayer/public/
copy emotion_classifier.js  to the directory p5-multiplayer/public/

go to directory p5-multiplayer/

run the instructions from p5-multiplayer:

    npm install
    node server.js

this starts the server

then open a chrome window
go to:
        127.0.0.1:3000/host.html

check the console, this should give you a name, like a mineral name
sapphire, crystal, etc...
open another chrome window

        127.0.0.1:3000/?roomId=«name from the console»


