

float noiseDensity = 2.1;
float noiseIncrement = 0.005;
float fieldMagnitude = 0.0005;
int noiseOffset = 0;
int fieldCellSize = 12;
int fieldColumns, fieldRows;
int fieldMagnitudeOffset = 0;
float fps;

float noiseTimeOffset = 0;
boolean showField = true;

int numParticles = 2000;
Particle[] particles;
//ArrayList<Particle> particles;
PVector[] flowfield;
PGraphics canvas;

int alpha = 255;

color[] palette = {
  color(187, 224, 240, alpha),
  color(0, 166, 166, alpha),
  color(239, 202, 8, alpha),
  color(244, 159, 10, alpha),
  color(240, 135, 0, alpha)
};
  
void setup()
{
    size(640, 480);
    canvas = createGraphics(640, 480);
    frameRate(25);

    fieldColumns = (int) floor(width / fieldCellSize);
    fieldRows = (int) floor(height / fieldCellSize);
    blendMode(BLEND); 
    
    background(0, 0.1);
    strokeWeight(1.0);
    stroke(255, 0, 0);
    
    
    particles = new Particle[numParticles];
    for (int i = 0; i < particles.length; i++)
    {
        particles[i] = new Particle();
    }
    
    flowfield = new PVector[fieldRows * fieldColumns];
    for (int i = 0; i < flowfield.length; i++)
    {
        flowfield[i] = new PVector(0, 0);
    }
}

float[] cartesian2polar(float x, float y)
{
    float r = sqrt(x*x + y*y);
    float theta = atan2(y, x);
    float[] out = {r, theta};
    return out;
}

float[] polar2cartesian(float r, float theta)
{
    float x = r * cos(theta);
    float y = r * sin(theta);
    float out[] = {x, y};
    return out;
}

class Particle
{   
    float maxSpeed = 2.0;
    PVector position, previousPosition, velocity, acceleration;
    color pcolor = color(0);
    PVector decay;
    
    Particle()
    {
        this.position = new PVector(random(width), random(0, height));
        this.previousPosition = this.position.copy();
        this.velocity = new PVector(0.0, 0.0);
        this.acceleration = new PVector(0.0, 0.0);
        this.pcolor = color(palette[(int) random(0, palette.length)]);
        this.decay = new PVector(random(1.0), random(1.0));
    }
    
    Particle(float x, float y)
    {
        this.position = new PVector(x, y);
        this.previousPosition = this.position.copy();
        this.velocity = new PVector(0.0, 0.0);
        this.acceleration = new PVector(0.0, 0.0);
        this.pcolor = color(palette[(int) random(0, palette.length)]);
        this.decay = new PVector(random(1.0), random(1.0));
    }
        
    void updateMotion()
    {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0.0); // toggle or scale
        /*
        this.acceleration.set(
          max(0.0, this.acceleration.x - this.decay.x),
          max(0.0, this.acceleration.y - this.decay.y)
          );
          */
    }

    void applyForce(PVector force)
    {
        this.acceleration.add(force);
    }

    void createTrail()
    {
        canvas.line(
            this.position.x, this.position.y,
            this.previousPosition.x, this.previousPosition.y
            );
        this.updatePreviousPosition();
    }
    
    void updatePreviousPosition()
    {
        this.previousPosition.x = this.position.x;
        this.previousPosition.y = this.position.y;
    }

    void wrapAround()
    {
        if (this.position.x < 0)
        {
            this.position.x = width;
            this.updatePreviousPosition();
        }
        if (this.position.x > width)
        {
            this.position.x = 0;
            this.updatePreviousPosition();
        }
        if (this.position.y < 0)
        {
            this.position.y = height;
            this.updatePreviousPosition();
        }
        if (this.position.y > height)
        {
            this.position.y = 0;
            this.updatePreviousPosition();
        }
    }

    void followField(PVector[] vectors)
    {
        int x     = floor(this.position.x / fieldCellSize);
        int y     = floor(this.position.y / fieldCellSize);
        int index = (x + y * fieldColumns) % vectors.length;
        PVector force = vectors[index]; // out of bounds
        this.applyForce(force);
    }
    
    void probeNeighborhood(Particle[] particles)
    {
        for (Particle particle : particles)
        {
            PVector n = new PVector(this.position.x - particle.position.x, this.position.y - particle.position.y);
            if (n.mag() < 25)
            {
                this.applyForce(n.mult(-1));
            }
        }
    }
}


void draw()
{
    canvas.beginDraw();
    canvas.background(0, 1);
    //background(color(0, 0, 0));
    canvas.tint(0, 4);

    int yoff = noiseOffset;
    float tdelta = frameCount / (cos(frameCount * 0.01 * TWO_PI) * 0.5 + 0.5);

    //noiseDetail(2, tdelta * 0.25 + 0.05);
    for (int y = 0; y < fieldRows; y++)
    {
        int xoff = noiseOffset;

        for (int x = 0; x < fieldColumns; x++)
        {   
            //noiseSeed((x + frameCount) * y);
            //noiseDetail(2, tdelta * 0.25 + 0.05);
            //noiseDetail(ceil((x + 1) / 8.0), x / (y + 1));
            int index = x + y * fieldColumns;
            float angle = noise(xoff, yoff, fieldMagnitudeOffset) * TWO_PI;
            PVector v = PVector.fromAngle(angle);
            float m = map(noise(xoff, yoff, noiseTimeOffset), 0, 1, -5, 5);
            v.setMag(m);

            flowfield[index] = v;
            xoff += noiseDensity;
        }
        yoff += noiseDensity;
    }
    noiseTimeOffset += fieldMagnitude;
    fieldMagnitudeOffset += noiseIncrement;
    noiseOffset -= fieldMagnitude;

    for (Particle particle : particles)
    {
        canvas.stroke(particle.pcolor);
        particle.followField(flowfield);
        particle.probeNeighborhood(particles);
        particle.updateMotion();
        particle.wrapAround();
        particle.createTrail();
    }

    if (random(10.0) > 5 && particles.length < 2500)
    {
        float rnd = floor(noise(fieldMagnitudeOffset) * 20);

        for (int i = 0; i < rnd; i++)
        {
            append(particles, new Particle(random(width), random(height)));
        }
    }
    else if (particles.length > 2000)
    {
        int rnd = (int) random(0, 10);

        for (int i = 0; i < rnd && rnd <= particles.length; i++)
        {
            shorten(particles);
        }
    }
    //tint(0, 0.1);
    canvas.endDraw();
    image(canvas, 0, 0);
}

