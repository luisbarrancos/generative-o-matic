class OrbitalState
{
    #speed_factor;
    #max_rotation;
    #max_translation;
    #max_scale;
    #edge;

    constructor(x, y, z, vx, vy, vz)
    {
        this.x  = x;
        this.y  = y;
        this.z  = z;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        //
        this.angle         = this.#speed_factor * TWO_PI * 0.001;
        this.#max_rotation = TWO_PI;
        this.rotate_x      = 1.0 / 53;
        this.rotate_y      = 1.0 / 59;
        this.rotate_z      = 0.0;
        //
        this.#max_translation = 25.0;
        this.translate_x      = 0.01;
        this.translate_y      = 0.01;
        this.translate_z      = 0.01;
        //
        this.#max_scale = 3.0;
        this.scale_x    = 1.0;
        this.scale_y    = 1.0;
        this.scale_z    = 1.0;
        this.#edge      = 350;

        this.amplitude          = 1.0;
        this.amplitude_flag     = 1;
        this.frequency          = 1.0;
        this.frequency_flag     = 1;
        this.offset             = 0.0;
        this.offset_flag        = 1;
        this.size               = 8.0;
        this.size_flag          = 1;
        this.color_hue          = 1.0;
        this.color_hue_flag     = 1;
    }

    update()
    {
        // faster, slower
        if (this.frequency_flag == 1)
        {
            this.frequency = constrain(this.frequency + 0.5, 0, 32)
        }
        if (this.frequency_flag == -1)
        {
            this.frequency = constrain(this.frequency - 0.5, 0, 32);
        }
        // wider, closer
        if (this.amplitude_flag == 1)
        {
            this.amplitude = constrain(this.amplitude + 0.1, 0, 2);
        }
        if (this.amplitude_flag == -1)
        {
            this.amplitude = constrain(this.amplitude - 0.1, 0, 2);
        }
        // bigger, smaller
        if (this.size_flag == 1)
        {
            this.size = constrain(this.size + 0.1, 2.0, 32);
        }
        if (this.size_flag == -1)
        {
            this.size = constrain(this.size - 0.1, 2.0, 32);
        }
        // jittering
        if (this.jittering_flag == 1)
        {
            //this.timer
        }
        // warmer, cooler color hues
        if (this.color_cycle_flag == 1)
        {
            ;
        }
        if (this.color_cycle_flag == -1)
        {
            ;
        }
    }

    edge()
    {
        this.x += this.vx * 2;
        if (Math.abs(this.x) > this.#edge)
        {
            this.vx += -1;
        }
        this.y += this.vy * 2;
        if (Math.abs(this.y) > this.#edge)
        {
            this.vy *= -1;
        }
        this.z += this.vz * 2;
        if (Math.abs(this.z) > this.#edge)
        {
            this.vz *= -1;
        }
    }
    start()
    {
        this.color_cycle_flag = 1;
    }
    wider() { this.amplitude_flag = 1; }
    closer() { this.amplitude_flag = -1; }
    bigger() { this.size_flag = 1; }
    smaller() { this.size_flag = -1; }
    faster() { this.frequency_flag = 1; }
    slower() { this.frequency_flag = -1; }
    stop()
    {
        this.color_cycle_flag = -1;
    }
    rotate_x(x) { this.rotate_x += this.angle; }
    rotate_y(y) { this.rotate_y += this.angle; }
    rotate_z(z) { this.rotate_z += this.angle; }
}