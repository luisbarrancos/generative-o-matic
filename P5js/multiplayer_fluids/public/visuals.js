/*
    Visuaks class for sketches, WIP.
    Copyright (C) 2022, Luis Barrancos

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
class Visuals
{
    // pass the FFT waveform, energy, do fancy visuals
    constructor(fft_samples = 64)
    {
        this.samples      = fft_samples;
        this.visuals_init = true;
        this.player_color = color(255, 255, 255);
        ;
    }

    set_color(c) { this.player_color = c; }

    update_frequency(frequency, frequency_range)
    {
        /*
        this.frequency = map(
            frequency,
            frequency_range.min_frequency,
            frequency_range.max_frequency,
            min_spokes,
            max_spokes
            );

        this.num_steps = Math.floor(this.frequency);
        this.angle_steps = TWO_PI / this.num_steps;

        if (this.visuals_init == false)
        {
            this.visuals_init = true;
        }
        */
        if (debug)
            console.log("update frequency on visuals");
    }

    draw(wavedata)
    {
        /*
        if (debug)
        {
            console.log(`fft samples = ${this.samples}, num steps =
        ${this.num_steps}, angle steps = ${this.angle_steps}`);
        }

        if (this.visuals_init == true)
        {
            let V;
            stroke(this.player_color);

            if (realistic)
            {
                V = createVector(1, 0, 0);
            }

            for (let i = 0; i < this.samples; i++)
            {
                const x = map(i, 0, this.samples, 0, half_width);
                const y = map(wavedata[i], -1, 1, 0, screen_height);
                let phi;

                if (realistic)
                {
                    const U = createVector(x, 0, 0);
                    phi = Math.max(U.dot(V));
                }

                for (let j = 0; j < this.num_steps; j++)
                {
                    push();
                    translate(half_width, half_height);
                    rotate(j * this.angle_steps);
                    translate(-half_width, -half_height);

                    if (realistic)
                    {
                        fill(phi);
                        ellipse(phi * x, y, phi * 0.11, phi * 0.1);
                    }
                    else
                    {
                        ellipse(x, y, 2);
                    }
                    pop();
                }
            }
            noStroke();
        }
        */
        if (debug)
            console.log("draw() in visuals");
    }
}
