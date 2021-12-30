class Palette
{
    // 1. get the palette from https://coolors.co/
    // 2. each line corresponds to a color "state" to be trained
    // 3. add a comment to keep track of the training states

    static #color_tables = [
        // start
        "083d77,ebebd3,f4d35e,ee964b,f95738",
        // shake
        "fdffff,b10f2e,570000,280000,de7c5a",
        // wider
        "ffbc42,d81159,8f2d56,218380,73d2de",
        // closer
        "ef6461,e4b363,e8e9eb,e0dfd5,313638",
        // bigger
        "ffae03,e67f0d,fe4e00,e9190f,ff0f80",
        // smaller
        "3c1642,086375,1dd3b0,affc41,b2ff9e",
        // faster
        "0485e0,0f8796,0abf2e,6fa688,356e78",
        // slower
        "092120,00f7eb,2cc9c2,178782,163b39",
        // stop
        "003049,d62828,f77f00,fcbf49,eae2b7",
        // sentiment analysis ?
        // positive, warm colors, jittery motion
        "03045e,023e8a,0077b6,0096c7,00b4d8,48cae4,90e0ef,ade8f4,caf0f8",
        // negative, cool colors, steady motion
        "001219,005f73,0a9396,94d2bd,e9d8a6,ee9b00,ca6702,bb3e03,ae2012,9b2226",
        // rotate on X, Y, Z, or translate on X, Y, Z
        // rotate on X, with radians depending on strenght
        "03071e,370617,6a040f,9d0208,d00000,dc2f02,e85d04,f48c06,faa307,ffba08",
        // rotate on Y, with radians depending on strenght
        "d9ed92,b5e48c,99d98c,76c893,52b69a,34a0a4,168aad,1a759f,1e6091,184e77",
        // rotate on Z, with radians depending on strenght
        "007f5f,2b9348,55a630,80b918,aacc00,bfd200,d4d700,dddf00,eeef20,ffff3f",
    ]

    static colors(i, state, period)
    {
        const ndx = Math.floor(state % this.#color_tables.length);
        const c = this.#color_tables[ndx].split(",").map(x => "#" + x);
        return c[Math.round(i / 50) % c.length];
    }

    static get_gradient(state)
    {
        const ndx = Math.floor(state % this.#color_tables.length);
        return this.#color_tables[ndx].split(",").map(x => "#" + x);
    }
}