// sound wave, create an oscillator if there is no player oscillator running
class SoundWave
{
    constructor()
    {
        this.carrier = new p5.Oscillator();
        this.carrier.freq(220);
        this.carrier.setType("sine");
        this.carrier.amp(0.5);
        this.carrier.start();
        
        this.osc = new p5.Oscillator();
        this.osc.disconnect();
        this.osc.freq(30);
        this.osc.setType("sine");
        this.osc.amp(0.5);

        this.reverb = new p5.Reverb();
        this.delay = new p5.Delay();
        this.delay.disconnect()

        this.playing = false;
        this.samples = fft_samples;
    }

    start()
    {
        if (this.playing == false)
        {
            this.carrier.start();
            this.osc.start();
            this.carrier.freq(this.osc);

            this.delay.connect(this.reverb);
            this.carrier.disconnect();
            this.carrier.connect(this.delay);

            //this.osc.start();
            this.playing = true;
            this.fft = new p5.FFT(0, this.samples);
            this.fft.setInput(this.osc);
        }
    }

    stop()
    {
        if (this.playing == true)
        {
            this.carrier.stop();
            this.osc.stop();
            this.playing = false;
        }
    }

    update(frequency, amplitude)
    {
        if (this.playing == true)
        {
            // Ensure valid ranges, and wave types
            // freq = [10-22050], ampl = [0,1], type = [sine, square, triangle, sawtooth]
            this.osc.freq(frequency);
            this.osc.amp(amplitude);
        }
    }

    change_type(wavetype)
    {
        if (this.playing == true && wavetype != null)
        {
            // Ensure valid ranges, and wave types
            // let freq = [10-22050], ampl = [0,1], type = [sine, square, triangle, sawtooth]
            this.osc.setType(wavetype);
        }
    }

    scale_frequency(scale)
    {
        if (this.playing == true)
        {
            let frequency = this.osc.getFreq();
            this.osc.freq(clamp((scale + 0.1) * frequency, min_frequency, max_frequency));
            this.carrier.freq(map(scale*scale, 0.1, 0.5, 400, 4000));
        }
    }

    frequency()
    {
        if (this.playing == true) return this.osc.getFreq();
    }

    amplitude()
    {
        if (this.playing == true) return this.osc.getAmp();
    }

    waveform()
    {
        if (this.playing == true) return this.fft.waveform();
    }
}

