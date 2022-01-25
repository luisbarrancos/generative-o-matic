
class Game
{
    constructor(w, h)
    {
        this.w          = w;
        this.h          = h;
        this.players	= {};
        this.numPlayers	= 0;
        this.id         = 0;
        this.harmonic   = 1;
    }
    
    add(id, min_frequency = 40, max_frequency = 400)
    {
        this.players[id] = {};
        this.players[id].id = "p" + this.id;
        this.players[id].color = color(255, 255, 255);

        //
        print(this.players[id].id + " added.");

        // create oscilaltors array from frequency assigned, per harmonic
        // player1 gets the fundamental wave
        this.players[id].frequency_range =
        {
            "min_frequency" : MathUtils.clamp(this.harmonic * min_frequency, 20, 20000),
            "max_frequency" : MathUtils.clamp(this.harmonic * max_frequency, 20, 20000),
        };

        this.players[id].oscillators = new Oscillators(
            this.players[id].frequency_range.min_frequency,
            this.players[id].frequency_range.max_frequency,
        );
        /*
        this.players[id].oscillators.update_frequency_ranges(
            this.players[id].frequency_range.min_frequency,
            this.players[id].frequency_range.max_frequency
        );
        */

        this.players[id].oscillators.create();
        this.players[id].oscillators.start();

        this.id++;
        this.harmonic++;
        this.numPlayers++;
        // add sound wave for each player
    }

    setColor(id, r, g, b)
    {
        this.players[id].color = color(r, g, b);        
        print(this.players[id].id + " color added.");
    }

    getColor(id)
    {
        return this.players[id].color;
    }
        
    remove(id)
    {
        this.players[id].oscillators.stop();
        delete this.players[id];
        this.numPlayers--;
        this.numPlayers = Math.max(0, this.numPlayers);
        this.harmonic--; // not correct, it might overlap the harmonic
        this.harmonic = Math.max(1, this.harmonic);
    }

    checkId(id)
    {
        return (id in this.players) ? true : false;
    }
        
    printPlayerIds(x, y)
    {
        push();
        noStroke();
        let c = color(255, 180);
        fill(c);
        textSize(12);
        text(`# players: ${this.numPlayers}`, x, y);

        y = y + 14;

        for (let id in this.players)
        {
            c = this.players[id].color;
            c.setAlpha(180);
            fill(c);
            text(`player ${this.players[id].id}`, x, y);
            y += 16;
        }
        c = color(255, 180);
        fill(c);
        pop();
    }

    randomizeOscillators(id)
    {
        this.players[id].oscillators.randomize();
    }

    updateSoundWaves(id, frequency, amplitude, type)
    {
        if (debug)
        {
            console.log(`freq = ${frequency}, amp = ${amplitude}, type = ${type}`);
        }
        this.players[id].oscillators.update_waveform(frequency, amplitude, type);
    }

    updateWaveType(id, wavetype)
    {
        this.players[id].oscillators.update_wavetype(wavetype);
    }

    scaleFrequency(id, scale, ndx = null)
    {
        this.players[id].oscillators.scale_frequency(scale, ndx);
    }

    getFrequency(id, ndx = null)
    {
        return this.players[id].oscillators.frequency(ndx);
    }

    getAmplitude(id, ndx = null)
    {
        return this.players[id].oscillators.amplitude(ndx);
    }

    getEnergy(id)
    {
        // returns an array with the energy per bands, or null
        return this.players[id].oscillators.energy();
    }

    getWaveform(id)
    {
        return this.players[id].oscillators.waveform();
    }

    // main game draw cycle for player avatars in the visualization
    /*
    updateVisuals(id)
    {
        this.players[id].visuals.update_frequency(
            this.players[id].soundwave.frequency(),
            this.players[id].frequency_range);

        //this.players[id].visuals.set_color(this.players[id].color);
    }

    draw_visuaks(id)
    {
        this.players[id].visuals.set_color(this.getColor(id));
        this.players[id].visuals.draw(this.players[id].soundwave.waveform());
    }

    draw()
    {
        for (let id in game.players)
        {
            this.draw_visuals(id);
        }
    }
    */
}
