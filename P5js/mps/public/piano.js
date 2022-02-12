// Juste quelques tests à partir des docs du site Tone.js ! https://tonejs.github.io/
        
        // PIANO SAMPLER
        const sampler = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                C1: "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                A1: "A1.mp3",
                C2: "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                A2: "A2.mp3",
                C3: "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                A3: "A3.mp3",
                C4: "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                A4: "A4.mp3",
                C5: "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                A5: "A5.mp3",
                C6: "C6.mp3",
                "D#6": "Ds6.mp3",
                "F#6": "Fs6.mp3",
                A6: "A6.mp3",
                C7: "C7.mp3",
                "D#7": "Ds7.mp3",
                "F#7": "Fs7.mp3",
                A7: "A7.mp3",
                C8: "C8.mp3"
            },

            // Cela règle la durée de permanence des notes jouées
            release: 10,

            // Source locale des sons
            // baseUrl: "./audio/salamander/"

            baseUrl: "https://tonejs.github.io/audio/salamander/"
        }).toDestination();

        piano({
            parent: document.querySelector("#content"),
            noteon: note => sampler.triggerAttack(note.name),
            noteoff: note => sampler.triggerRelease(note.name),

        });

        // Pour ajouter des effets...
        // Exemples..
        // const filter = new Tone.AutoFilter(4).start();
        // const distortion = new Tone.Distortion(0.5);

        const reverb = new Tone.Reverb(10);

        // connect the player to the filter, distortion and then to the master output
        // sampler.chain(filter, distortion, reverb, Tone.Destination);

        sampler.chain(reverb, Tone.Destination);
   
        // SEQUENCEUR
        const keys = new Tone.Players({
            urls: {
                0: "A1.mp3",
                1: "Fs5.mp3",
                2: "C7.mp3",
                3: "A6.mp3",
            },
            fadeOut: "64n",
            
            // Source des sons du séquenceur
            baseUrl: "https://tonejs.github.io/audio/salamander/"
        }).toDestination();

        document.querySelector("tone-play-toggle").addEventListener("start", () => Tone.Transport.start());
        document.querySelector("tone-play-toggle").addEventListener("stop", () => Tone.Transport.stop());
        document.querySelector("tone-slider").addEventListener("input", (e) => Tone.Transport.bpm.value = parseFloat(e.target.value));
        document.querySelector("tone-step-sequencer").addEventListener("trigger", ({
            detail
        }) => {
            keys.player(detail.row).start(detail.time, 0, "16t");
        });