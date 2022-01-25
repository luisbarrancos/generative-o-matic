
class Oscillators
{
    constructor()
    {
        this.num_oscillators = 10;
        this.oscillators = [];
        this.delays = [];
        this.reverbs = [];
        this.min_frequency = 200;
        this.max_frequency = 3000;
        this.num_steps = 64;
        this.fft_delta = Math.ceil((this.max_frequency - this.min_frequency) / this.num_steps);
        this.init_fft = false;
        this.playing = false;
    }

    create(fft = false)
    {
        if (this.oscillators.length == 0)
        {
            for (let i = 0; i < this.num_oscillators; i++)
            {
                let osc = new p5.Oscillator();
                osc.setType("sine");
                osc.freq(random(this.min_frequency, this.max_frequency));
                osc.amp(1.0 / this.num_oscillators); // normalize
                // we can start, or pipe to effects
                osc.start();

                //let reverb = new p5.Reverb();
                //let delay = new p5.Delay();
                //delay.disconnect()
                //delay.connect(reverb);
                //osc.disconnect();
                //osc.connect(delay);

                this.oscillators.push(osc);
                //this.delays.push(delay);
                //this.reverbs.push(reverb);
            }
            this.playing = true;
        }
        if (fft == true)
        {
            // FFT (0, bins), smoothing, bins=1024, change to 64
            this.fft = new p5.FFT(); 
            this.init_fft = true;
        }
    }

    start()
    {
        if (this.oscillators.length != 0 && this.playing == false)
        {
            for (oscillator in oscillators)
            {
                oscillator.start();
            }
        }
    }

    stop()
    {
        if (this.oscillators.length != 0 && this.playing == true)
        {
            for (oscillator in oscillators)
            {
                oscillator.stop();
            }
        }
    }

    // we can map frequencies, from this.oscillator.f , mapped from min freq, max fre
    // into vertical or horizontal coords, to give some effect
    // randomize frequencies with mouse pressed
    randomize()
    {
        const chosen = random(0, this.num_oscillators);
        this.oscillators[chosen].freq(random(this.min_frequency, this.max_frequency));
        this.oscillators[chosen].amp(Math.random() / this.num_oscillators);
    }

    update_waveform(freq, ampl, type)
    {
        const chosen = random(0, this.num_oscillators);
        this.oscillators[chosen].freq(MathUtils.clamp(freq, this.min_frequency, this.max_frequency));
        this.oscillators[chosen].ampl(MathUtils.clamp(ampl, 0.0, 1.0) / this.num_oscillators);
        this.oscillators[chosen].setType(type);
    }

    update_wavetype(type)
    {
        const chosen = random(0, this.num_oscillators);
        this.oscillators[chosen].setType(type);
    }

    scale_frequency(scale, ndx = null)
    {
        let wave_index = (ndx != null) ? ndx : random(0, this.num_oscillators);
        const freq = this.oscillators[wave_index].getFreq();

        this.oscillators[wave_index].freq(
            clamp(scale * freq, this.min_frequency, this.max_frequency));
    }

    frequency(ndx)
    {
        if (this.playing == true) return this.oscillators[ndx].getFreq(); 
    }

    amplitude(ndx)
    {
        if (this.playing == true) return this.oscillators[ndx].getAmp();
    }

    update_fft_steps(steps)
    {
        this.num_steps = steps;
        this.fft_delta = Math.ceil(
            (this.max_frequency - this.min_frequency) / this.num_steps);
    }

    update_frequency_ranges(minfreq, maxfreq)
    {
        this.min_frequency = minfreq;
        this.max_frequency = maxfreq;
        this.update_fft_steps(this.num_steps);
    }

    energy()
    {
        if (this.init_fft && this.playing == true)
        {
            // the FFT is going to be over the combined waveform, so no need
            // to specify the isolated oscillator.
            // analyze([bins],[scale]), bins=1024 (def), scalde default [0,255]
            // https://creative-coding.decontextualize.com/synthesizing-analyzing-sound/
            // spectrogram from bins. NOTE: analyze MUST be called before Energy().
            //
            let bins = fft.analyze();
            let waveform_energy = [];

            for (let i = this.min_frequency; i < this.max_frequency; i += this.fft_delta)
            {
                // foreach band i, where bandwidth of i = (maxf - minf) / delta
                // get the energy in the band
                // we can get the energy **at** the frequency, or between f_(n-1) and f_n
                // which is what we want. It returns energy in [0,255], remap to [0.0, 1.0]
                waveform_energy.push(fft.getEnergy(i, i + this.fft_delta) / 255.0);
            }
            return waveform_energy; // will it survive outside call?
        }
        return null;
    }

    waveform()
    {
        if (this.init_fft == true && this.playing == true)
        {
            return this.fft.waveform();
        }
    }
}

