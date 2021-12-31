class OrbitalState 
{
    #maxspeed = 22.0;
    #speed_factor = 0.0;
    #max_rotation = TWO_PI;
    #max_translation = 1.0;
    #max_scale = 1.0;
    #max_jittering = 2.0;
    #edge = 350;

    amplitude = 1.0;
    amplitude_flag = 1;
    frequency = 1.0;
    frequency_flag = 1;
    offset = 0.0;
    offset_flag = 1;
    size = 8.0;
    size_flag = 1;

    // sum and multiply 2 arrays element by element
    /*
    #sum = (a, b) => a.map((c, i) => c + b[i]);
    #sub = (a, b) => a.map((c, i) => c - b[i]);
    #mul = (a, b) => a.map((c, i) => c * b[i]);
    // multiply elements of array by scalar
    #smul = (arr, x) => arr.map((a) => a * x)
    */

    constructor(x, y, z, vx, vy, vz)
    {
        // these should be private, their only control is to be provided
        // via the states or debug methods.
        //
        this.#maxspeed = 1.0;
        this.#speed_factor = 0.0;
        this.x = x;
        this.y = y;
        this.z = z;
        this.position = [this.x, this.y, this.z];
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        //this.velocity = [this.vx, this.vy, this.vz];
        this.velocity = 1.0;
        
        this.acceleration = 0.025;
        //
        this.angle = this.#speed_factor * TWO_PI * 0.001;
        this.#max_rotation = TWO_PI;
        this.rotate_x = 1.0 / 53;
        this.rotate_y = 1.0 / 59;
        this.rotate_z = 0.0;
        //
        this.#max_translation = 25.0;
        this.translate_x = 0.01;
        this.translate_y = 0.01;
        this.translate_z = 0.01;
        //
        this.#max_scale = 3.0;
        this.scale_x = 1.0;
        this.scale_y = 1.0;
        this.scale_z = 1.0;
        //
        this.#max_jittering = 2.0;
        this.jittering = 0.0;
        this.mood = 0.0;
        //
        this.#edge = 350;

        this.amplitude = 1.0;
        this.amplitude_flag = 1;
        this.frequency = 1.0;
        this.frequency_flag = 1;
        this.offset = 0.0;
        this.offset_flag = 1;
        this.size = 8.0;
        this.size_flag = 1;
    }

    update()
    {
        // incremente speed w acceleration/jolt, then reset acceleration.
        // this.position += this.velocity;
        //this.#sum(this.position, this.velocity);
        //this.velocity += this.acceleration;
        //this.#sum(this.velocity, this.acceleration);
        //this.acceleration *= 0.0;
        //this.#smul(this.acceleration, 0.0);
        /*
        this.vx = constrain(this.vx + this.acceleration, 0, this.#maxspeed);
        this.vy = constrain(this.vy + this.acceleration, 0, this.#maxspeed);
        this.vz = constrain(this.vz + this.acceleration, 0, this.#maxspeed);
        this.acceleration = 0;

        //this.velocity += this.acceleration;
        this.velocity = constrain(
            this.velocity, 0, this.#maxspeed);
        //this.acceleration = 0;
        */

        //
        // slowly reduce the jittering. One can jolt it though

        /*
        if (this.jittering > 0.01)
        {
            this.jittering -= 0.01;
        }
        this.jittering = constrain(this.jittering, 0.0, this.#max_jittering);
        this.mood = constrain(this.mood, -1.0, 1.0); // bad mood, good mood

        // xforms
        // rotation
        this.rotate_x = constrain(
            this.rotate_x, -this.#max_rotation, this.#max_rotation);
        this.rotate_y = constrain(
            this.rotate_y, -this.#max_rotation, this.#max_rotation);
        this.rotate_y = constrain(
            this.rotate_z, -this.#max_rotation, this.#max_rotation);

        // scale
        this.scale_x = constrain(this.scale_x, 0.01, this.#max_scale);
        this.scale_y = constrain(this.scale_y, 0.01, this.#max_scale);
        this.scale_z = constrain(this.scale_z, 0.01, this.#max_scale);

        // translation finally
        this.translate_x = constrain(
            this.translate_x + this.x + this.velocity,
            -this.#max_translation, this.#max_translation);
        this.translate_y = constrain(
            this.translate_y + this.y + this.velocity,
            -this.#max_translation, this.#max_translation);
        this.translate_z = constrain(
            this.translate_z + this.z + this.velocity,
            -this.#max_translation, this.#max_translation);*/
            /*
        this.translate_x = constrain(
            this.translate_x, -this.#max_translation, this.#max_translation);
        this.translate_y = constrain(
            this.translate_y, -this.#max_translation, this.#max_translation);
        this.translate_z = constrain(
            this.translate_z, -this.#max_translation, this.#max_translation);
            */
        this.velocity += this.acceleration;
        //this.frequency = constrain(this.frequency + this.velocity, 0, 32);
        this.acceleration = 0;
    
        // faster, slower
        if (this.frequency_flag == 1)
            this.frequency = constrain(this.frequency + 0.5, 0, 32)
        if (this.frequency_flag == -1)
            this.frequency = constrain(this.frequency - 0.5, 0, 32);
        // wider, closer
        if (this.amplitude_flag == 1)
            this.amplitude = constrain(this.amplitude + 0.1, 0, 2);
        if (this.amplitude_flag == -1)
            this.amplitude = constrain(this.amplitude - 0.1, 0, 2);
        // bigger, smaller
        if (this.size_flag == 1)
            this.size = constrain(this.size + 0.1, 2.0, 32);
        if (this.size_flag == -1)
            this.size = constrain(this.size - 0.1, 2.0, 32);
    }

    edge()
    {
        this.x += this.vx * 2;
        if (Math.abs(this.x) > this.#edge)
        {
            this.vx *= -1;
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

    apply_mood(mood)
    {
        // add mood/sentiment, [-1, 1] -> negative, positive
        this.mood += mood;
        // this will affect jittering too
        this.jittering += (this.mood > 0) ? this.mood : -this.mood;
    }
    
    change_angle(angle)
    {
        this.angle = angle * this.speed_factor * TWO_PI * 0.001;
    }

    // states, teachable AI
    start()
    {
        //this.acceleration = 0.025;
    }

    shake(jitter)
    {
        // jittering is affected by mood, but one can shake things, and it
        // will subsides
        this.jittering += jitter;
    }

    wider()
    {
        this.amplitude_flag = 1;
    }

    closer()
    {
        this.amplitude_flag = -1;
    }

    bigger()
    {
        this.size_flag = 1;
    }

    smaller()
    {
        this.size_flag = -1;
    }

    faster()
    {
        this.frequency_flag = 1;

    }

    slower()
    {
        this.frequency_flag = -1;
    }
    
    stop()
    {
        // add to vx, vy, vz, update, reset in update()
        //this.acceleration = -0.025;
    }
    //
    // sentiment could control angle
    rotate_x(x)
    {
        this.rotate_x += this.angle;
    }

    rotate_y(y)
    {
        this.rotate_y += this.angle;
    }

    rotate_z(z)
    {
        this.rotate_z += this.angle;
    }
}