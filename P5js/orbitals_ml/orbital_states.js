class OrbitalState 
{
    #maxspeed = 2.0;
    #speed_factor = 0.0;
    #max_rotation = TWO_PI;
    #max_translation = 1.0;
    #max_scale = 1.0;
    #max_jittering = 2.0;
    #edge = 350;

    // sum and multiply 2 arrays element by element
    #sum = (a, b) => a.map((c, i) => c + b[i]);
    #sub = (a, b) => a.map((c, i) => c - b[i]);
    #mul = (a, b) => a.map((c, i) => c * b[i]);
    // multiply elements of array by scalar
    #smul = (arr, x) => arr.map((a) => a * x)

    constructor(x, y, z, vx, vy, vz)
    {
        // these should be private, their only control is to be provided
        // via the states or debug methods.
        //
        this.#maxspeed = 2.0;
        this.#speed_factor = 0.0;
        this.x = x;
        this.y = y;
        this.z = z;
        this.position = [this.x, this.y, this.z];
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.velocity = [this.vx, this.vy, this.vz];
        this.acceleration = [1.0, 1.0, 1.0];
        //
        this.angle = this.#speed_factor * TWO_PI * 0.001;
        this.#max_rotation = TWO_PI;
        this.rotate_x = 1.0 / 53;
        this.rotate_y = 1.0 / 59;
        this.rotate_z = 0.0;
        //
        this.#max_translation = 1.0;
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
    }

    update()
    {
        // incremente speed w acceleration/jolt, then reset acceleration.
        // this.position += this.velocity;
        this.#sum(this.position, this.velocity);

        //this.velocity += this.acceleration;
        this.#sum(this.velocity, this.acceleration);

        //this.acceleration *= 0.0;
        this.#smul(this.acceleration, 0.0);

        this.velocity = constrain(
            this.velocity, -this.#maxspeed, this.#maxspeed);
        //
        // slowly reduce the jittering. One can jolt it though
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
            this.translate_x, -this.#max_translation, this.#max_translation);
        this.translate_y = constrain(
            this.translate_y, -this.#max_translation, this.#max_translation);
        this.translate_z = constrain(
            this.translate_z, -this.#max_translation, this.#max_translation);
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
        this.#sum(this.acceleration, [1, 1, 1]);
    }

    shake(jitter)
    {
        // jittering is affected by mood, but one can shake things, and it
        // will subsides
        this.jittering += jitter;
    }

    wider(x, y, z)
    {
        this.translate_x += x;
        this.translate_y += y;
        this.translate_z += z;
    }

    closer(x, y, z)
    {
        this.translate_x -= x;
        this.translate_y -= y;
        this.translate_z -= z;
    }

    bigger(x, y, z)
    {
        this.scale_x += x;
        this.scale_y += y;
        this.scale_z += z;
    }

    smaller(x, y, z)
    {
        this.scale_x -= x;
        this.scale_y -= y;
        this.scale_z -= z;
    }

    faster(force)
    {
        this.#sum(this.acceleration, [force, force, force]);
        //this.acceleration += force; // assuming force >=0
    }

    slower(force)
    {
        this.#sub(this.acceleration, [force, force, force]);
        //this.acceleration -= force; // assuming force >=0
    }
    
    stop()
    {
        this.#sub(this.acceleration, [0.025, 0.025, 0.025]);
        //this.acceleration -= 0.025; // should give a gradual stop
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