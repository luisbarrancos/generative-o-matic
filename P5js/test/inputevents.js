
class InputEvents
{
    constructor(
        game,
        data,
        absolute_min_frequency,
        absolute_max_frequency,
        w,
        h)
    {
        this.game                   = game;
        this.data                   = data;
        this.screen_width           = w;
        this.screen_height          = h;
        this.absolute_min_frequency = absolute_min_frequency;
        this.absolute_max_frequency = absolute_max_frequency;
    }

    processMouseClick()
    {
        if (this.data != null)
        {
            this.game.players[this.data.id].xcoord = this.data.xcoord;
            this.game.players[this.data.id].ycoord = this.data.ycoord;

            const frequency = MathUtils.clamp(
                Math.round(
                    map(this.data.xcoord,
                        0,
                        this.screen_width,
                        this.game.players[this.data.id]
                            .frequency_range.min_frequency,
                        this.game.players[this.data.id]
                            .frequency_range.max_frequency)),
                this.absolute_min_frequency,
                this.absolute_max_frequency);

            const amplitude = MathUtils.clamp(
                map(this.data.ycoord, 0, this.screen_height, 0.001, 1.0),
                0.0,
                1.0);

            if (debug)
            {
                log(`processMouseClick: Frequency = ${frequency}, amplitude = ${
                    amplitude}`);
            }
            game.updateSoundWaves(this.data.id, frequency, amplitude, "sine");

            // game.updateVisuals(data.id);
            if (debug)
            {
                console.log(
                    `${this.data.id} XY received: X = ${this.data.xcoord}, ${
                        this.data.id} Y = ${this.data.ycoord}`);
            }
        }
    }

    processJoystick()
    {
        fill(0, 255, 0);
        text(
            "process joystick data",
            this.screen_width / 2,
            this.screen_height / 2);
    }

    processDeviceShake()
    {
        fill(255, 200, 0);
        text("process device shake");
    }

    processDeviceSensors()
    {
        fill(255, 200, 0);
        text("process device sensors");
    }

    processTouchDrag()
    {
        fill(255, 200, 0);
        text("process touch & drag");
    }
}
