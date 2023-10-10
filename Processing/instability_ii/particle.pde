//
// Particle trail behaviour: attraction, repulsion, etc..
// Note that this is accessing some Processing global vars, and
// that PDE files in the sketch directory are considered to be
// in the **same** scope. This is moved to its own file for the
// sake of readability.
//

class Particle
{
    PVector position, previousPosition, velocity, acceleration;
    color particleColor = color(0);
    PVector decay;
    
    // Create a default particle, or one with a specific position.
    // TODO: erh, is there any faster alternative to random()?
    Particle()
    {
        this.position = new PVector(random(width), random(0, height));
        this.previousPosition = this.position.copy();
        this.velocity = new PVector(0.0, 0.0);
        this.acceleration = new PVector(0.0, 0.0);
        this.particleColor = color(palette[(int) random(0, palette.length)]);
        this.decay = new PVector(random(1.0), random(1.0));
    }
    
    Particle(float x, float y)
    {
        this.position = new PVector(x, y);
        this.previousPosition = this.position.copy();
        this.velocity = new PVector(0.0, 0.0);
        this.acceleration = new PVector(0.0, 0.0);
        this.particleColor = color(palette[(int) random(0, palette.length)]);
        this.decay = new PVector(random(1.0), random(1.0));
    }
    
    void updateMotion()
    {
        this.velocity.add(this.acceleration);
        this.velocity.limit(maxParticleSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0.9); // toggle or scale
    }
    
    void applyForce(PVector force)
    {
        force.mult(forceMultiplier);
        this.acceleration.add(force);
    }
    
    void applyAttraction()
    {
        for (Particle other : particles)
        {
            if (this != other)
            {
                float d = dist(position.x, position.y, other.position.x, other.position.y);
                if (d > 0 && d < attractionRadius)
                {
                    PVector force = PVector.sub(other.position, position);
                    force.normalize();
                    this.applyForce(force);
                }
            }
        }
    }
    
    void applyRepulsion()
    {
        for (Particle other : particles)
        {
            if (this != other)
            {
                float d = dist(position.x, position.y, other.position.x, other.position.y);
                if (d > 0 && d < repulsionRadius)
                {
                    PVector force = PVector.sub(position, other.position);
                    force.normalize();
                    this.applyForce(force);
                }
            }
        }
    }
    
    void createTrail()
    {
        line(
            this.position.x, this.position.y,
            this.previousPosition.x, this.previousPosition.y
            );
        this.updatePreviousPosition();
    }

    // Think of the particle as moving along the surface of
    // a thorus, wrapping along x and y.
    void wrapAround(PVector position, float w, float h)
    {
        if (position.x < 0)
        {
            this.position.x = w;
            this.updatePreviousPosition();
        }
        if (position.x > w)
        {
            this.position.x = 0;
            this.updatePreviousPosition();
        }
        if (position.y < 0)
        {
            this.position.y = h;
            this.updatePreviousPosition();
        }
        if (position.y > h)
        {
            this.position.y = 0;
            this.updatePreviousPosition();
        }
    }
    
    void updatePreviousPosition()
    {
        this.previousPosition.x = this.position.x;
        this.previousPosition.y = this.position.y;
    }
    
    void edges()
    {
        this.wrapAround(this.position, width, height);
    }
    
    void followField(PVector[] vectors)
    {
        int x     = floor(this.position.x / fieldCellSize);
        int y     = floor(this.position.y / fieldCellSize);
        int index = (x + y * fieldColumns) % vectors.length;
        PVector force = vectors[index];
        this.applyForce(force);
    }

    int findNearest()
    {
        float minDist = Float.MAX_VALUE;
        int closestIndex = -1;

        for (int i = 0; i < particles.size(); i++)
        {
            Particle other = particles.get(i);
            if (this == other) {
                continue;
            }

            float d = dist(
                this.position.x, this.position.y,
                other.position.x, other.position.y
                );

            if (d < minDist)
            {
                minDist = d;
                closestIndex = i;
            }
        }
        return closestIndex;
    }
}

