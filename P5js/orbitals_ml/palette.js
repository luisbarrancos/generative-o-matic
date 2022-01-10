class Palette
{
    // 1. get the palette from https://coolors.co/
    // 2. each line corresponds to a color "state" to be trained
    // 3. add a comment to keep track of the training states

    static #color_tables =
        [
            // start
            "68c2cc,32c1d1,29acba,50d0de,0d7985", // blue sky
            // shake
            "7fdb0d,acd180,92fa14,7b9956,7eb53c", // greens
            // wider
            "945654,574848,ba8684,4d0806,e84b46", // reds
            // closer
            "c00ce8,aa2ac7,873699,bd85c9,8a6094", // purples
            // bigger
            "cfb161,5c4811,302504,26200e,69592f", // brown
            // smaller
            "826d23,f2ca3a,d1b44b,f0c322,d4a600", // yellow
            // faster
            "199135,4fa162,33bd53,5fba74,259940", // green
            // slower
            "371147,9d76ad,371645,ca8ae6,a470ba", // pink
            // stop
            "c2704e,d46739,c4511f,944726,ba3902", // oranges
            // sentiment analysis ?
            // positive,warm colors,jittery motion
            "8a4a48,d49896,faa5a2,b33a36,a31510,db0223,2b0f13,820316,300108,bd0f29", // waaaaarm,red and stuff
            // negative,cool colors,steady motion
            "2a7dbd,5787ab,2f6e9e,1575bf,45f5f2,336363,34706f,0f6665,72fcfa,37739e", // coooold,blue and stuff
            // rotate on x,y,z,or translate on x,y,z
            // rotate on x,with radians depending on strenght
            "7d7034,c7ad3c,f2dc77,b89e2c,66550a,8ca371,518219,bef77c,a6e063,90bf5a", // golds
            // rotate on y,with radians depending on strenght
            "f060df,fa39e3,f0a3e7,73486e,a683a2,4f1e8f,947bb5,8863b8,6a4699,a66ef0", // purple
            // rotate on z,with radians depending on strenght
            "9e2c06,822d11,c44d25,e36a42,e0a490,ab2020,ff511c,855749,db9079,945a48", // orange browns
        ]

        static palette_length = this.#color_tables.length;
    static color_weights      = Array(this.palette_length).fill(0);

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
        return c[Math.round(i / 50) % c.length];
    }

    static get_gradient(state)
    {
        const ndx = Math.floor(state % this.#color_tables.length);
        return this.#color_tables[ndx].split(",").map(x => "#" + x);
    }
}
