
float inc      = 2.1; // 10.1
float incStart = 0.005;
float magInc   = 0.0005;
int start    = 0;
int scl      = 50; // 100
int cols, rows;
int zoff = 0;
float fps;

float magOff    = 0;
boolean showField = true;

int numParticles = 5000; // 12500;
Particle[] particles;
//ArrayList<Particle> particles;
PVector[] flowfield;

void setup()
{
    size(640, 480);
    pixelDensity(1);
    background(0);
    frameRate(60);

    cols = (int) floor(width / scl);
    rows = (int) floor(height / scl);
    blendMode(BLEND); 
    strokeWeight(1.0);
    stroke(255, 0, 0);
    
    
    particles = new Particle[numParticles];
    for (int i = 0; i < particles.length; i++)
    {
        particles[i] = new Particle();
    }
    
    flowfield = new PVector[rows * cols];
    for (int i = 0; i < flowfield.length; i++)
    {
        flowfield[i] = new PVector(0, 0);
    }
}

class Particle
{   
    float maxSpeed = 2.0;
    PVector pos, prevPos, vel, acc;
    color pcolor = color(0);
    PVector decay;
    
    Particle()
    {
        this.pos = new PVector(random(width), random(0, height));
        this.prevPos = this.pos.copy();
        this.vel = new PVector(0.0, 0.0);
        this.acc = new PVector(0.0, 0.0);
        this.pcolor = color(random(255), random(255), random(255));
        this.decay = new PVector(random(1.0), random(1.0));
    }
    
    Particle(float x, float y)
    {
        this.pos = new PVector(x, y);
        this.prevPos = this.pos.copy();
        this.vel = new PVector(0.0, 0.0);
        this.acc = new PVector(0.0, 0.0);
        this.pcolor = color(random(255), random(255), random(255));
        this.decay = new PVector(random(1.0), random(1.0));
    }
        
    void update()
    {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0.9); // toggle or scale
        /*
        this.acc.set(
          max(0.0, this.acc.x - this.decay.x),
          max(0.0, this.acc.y - this.decay.y)
          );
          */
    }

    void applyForce(PVector force)
    {
        this.acc.add(force);
    }

    void show()
    {
        line(
            this.pos.x, this.pos.y,
            this.prevPos.x, this.prevPos.y
            );
        this.updatePrev();
    }
    
    void inverseConstraint(PVector pos, float w, float h)
    {
        if (pos.x < 0)
        {
            this.pos.x = w;
            this.updatePrev();
        }
        if (pos.x > w)
        {
            this.pos.x = 0;
            this.updatePrev();
        }
        if (pos.y < 0)
        {
            this.pos.y = h;
            this.updatePrev();
        }
        if (pos.y > h)
        {
            this.pos.y = 0;
            this.updatePrev();
        }
    }
    
    void updatePrev()
    {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    }

    void edges()
    {
        this.inverseConstraint(this.pos, width, height);
    }

    void follow(PVector[] vectors)
    {
        int x     = floor(this.pos.x / scl);
        int y     = floor(this.pos.y / scl);
        int index = (x + y * cols) % vectors.length;
        PVector force = vectors[index]; // out of bounds
        this.applyForce(force);
    }
}

void draw()
{
    background(color(0, 0, 0, 0.2));
    //background(color(0, 0, 0));
    //tint(color(0, 0, 0, 0.1));


    int yoff = start;
    float tdelta = cos(frameCount * 0.01 * TWO_PI) * 0.5 + 0.5;

    //noiseDetail(2, tdelta * 0.25 + 0.05);
    for (int y = 0; y < rows; y++)
    {
        int xoff = start;

        for (int x = 0; x < cols; x++)
        {   
            //noiseSeed((x + frameCount) * y);
            //noiseDetail(2, tdelta * 0.25 + 0.05);
            noiseDetail(ceil((x + 1) / 8.0), x / (y + 1));

            int index = x + y * cols;
            float angle = noise(xoff, yoff, zoff) * TWO_PI;
            PVector v = PVector.fromAngle(angle);
            float m = map(noise(xoff, yoff, magOff), 0, 1, -5, 5);
            v.setMag(m);

            flowfield[index] = v;
            xoff += inc;
        }
        yoff += inc;
    }
    magOff += magInc;
    zoff += incStart;
    start -= magInc;

    for (Particle particle : particles)
    {
        stroke(particle.pcolor);
        particle.follow(flowfield);
        particle.update();
        particle.edges();
        particle.show();
    }

    
    if (random(10.0) > 5 && particles.length < 2500)
    {
        float rnd = floor(noise(zoff) * 20);

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
}
