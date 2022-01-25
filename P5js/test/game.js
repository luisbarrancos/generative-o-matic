
const clamp = (x, mi, ma) => Math.min(Math.max(mi, x), ma);

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
    
    add(id, min_frequency = 200, max_frequency = 3000)
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
            "min_frequency" : clamp(this.harmonic * min_frequency, 20, 20000),
            "max_frequency" : clamp(this.harmonic * max_frequency, 20, 20000),
        };

        this.players[id].oscillators = new Oscillators();

        this.players[id].update_frequency_ranges(
            this.players[id].frequency_range.min_frequency,
            this.players[id].frequency_range.max_frequency
        );

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
        this.players[id].soundwave.stop();
        delete this.players[id];
        this.numPlayers--;
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

    updateSoundWaves(id, frequency, amplitude)
    {
        if (debug)
        {
            console.log(`freq = ${frequency}, amp = ${amplitude}`);
        }
        this.players[id].soundwave.update(frequency, amplitude);
    }

    updateWaveType(id, wavetype, confidence)
    {
        this.players[id].soundwave.change_type(wavetype);
        this.players[id].soundwave.scale_frequency(confidence);
    }

    updateCymatics(id)
    {
        this.players[id].cymatic.update_frequency(
            this.players[id].soundwave.frequency(),
            this.players[id].frequency_range);

        //this.players[id].cymatic.set_color(this.players[id].color);
    }

    draw_cymatic(id)
    {
        /*
        this.players[id].cymatic.update_frequency(
            this.players[id].soundwave.frequency(),
            this.players[id].frequency_range);
            */
        this.players[id].cymatic.set_color(this.getColor(id));
        this.players[id].cymatic.draw(this.players[id].soundwave.waveform());
    }

    draw()
    {
        for (let id in game.players)
        {
            this.draw_cymatic(id);
        }
    }
}
