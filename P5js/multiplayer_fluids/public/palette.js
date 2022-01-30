/*
    Palette class for sketches, meant for coolors.co arrays.
    Copyright (C) 2022 Luis Barrancos

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

class Palette
{
    // 1. get the palette from https://coolors.co/
    // 2. each line corresponds to a color "state" to be trained
    // 3. add a comment to keep track of the training states

    static #color_tables = [
        // TODO: map palette to input, i.e, device shake, orientation
        // sensors
        //
        // complementary: blue | yellow
        "ff5400,ff6d00,ff8500,ff9100,ff9e00,00b4d8,0096c7,0077b6,023e8a,03045e",
        // grey blue, yellow red triadic
        "001219,005f73,0a9396,94d2bd,e9d8a6,ee9b00,ca6702,bb3e03,ae2012,9b2226",
        // blue analogous
        "03045e,023e8a,0077b6,0096c7,00b4d8,48cae4,90e0ef,ade8f4,caf0f8",
        // warm
        "03071e,370617,6a040f,9d0208,d00000,dc2f02,e85d04,f48c06,faa307,ffba08",
        // green
        "d8f3dc,b7e4c7,95d5b2,74c69d,52b788,40916c,2d6a4f,1b4332,081c15",
        // grey blue
        "d9ed92,b5e48c,99d98c,76c893,52b69a,34a0a4,168aad,1a759f,1e6091,184e77",
    ];

    static palette_length = this.#color_tables.length;
    static color_weights  = Array(this.palette_length).fill(0);

    static hex2rgb(hex)
    {
        return [
            "0x" + hex[1] + hex[2] | 0,
            "0x" + hex[3] + hex[4] | 0,
            "0x" + hex[5] + hex[6] | 0
        ];
    }

    static colors(i, state, period)
    {
        const ndx = Math.floor(state % this.#color_tables.length);
        const c   = this.#color_tables[ndx].split(",").map(x => "#" + x);
        return c[Math.round(i / period) % c.length];
    }

    static get_gradient(state)
    {
        const ndx = Math.floor(state % this.#color_tables.length);
        return this.#color_tables[ndx].split(",").map(x => "#" + x);
    }

    static get_rgba_color(index, state)
    {
        const carr = this.get_gradient(state);
        const ctmp = carr[index % carr.length];
        const rgb  = this.hex2rgb(ctmp);
        return [ rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1.0 ];
    }
}
