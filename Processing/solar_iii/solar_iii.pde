

float inc      = 2.1; // 10.1
float incStart = 0.005;
float magInc   = 0.0005;
int start    = 0;

int scl      = 50;
int fps = 60;

int cols, rows;
int zoff = 0;

float magOff    = 0;
boolean showField = true;

int numParticles = 1000; // 12500;
Particle[] particles;
//ArrayList<Particle> particles;
PVector[] flowfield;

int alpha = 255;

color[] palette =
{
  color(234, 226, 183, alpha),
  color(252, 191, 73, alpha),
  color(247, 127, 0, alpha),
  color(214, 40, 40, alpha),
  color(0, 48, 73, alpha),
};

PGraphics pg;

void setup()
{
    size(640, 480, P2D);
    pg = createGraphics(width, height, P2D);
    frameRate(fps);

    cols = ceil(width / float(scl));
    rows = ceil(height / float(scl));
    blendMode(BLEND); 
    
    background(0, 0.1);
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
    PVector pos, prevPos, vel, acc;
    color pcolor = color(0);
    PVector decay;
    
    Particle()
    {
        this.pos = new PVector(random(width), random(0, height));
        this.prevPos = this.pos.copy();
        this.vel = new PVector(0.0, 0.0);
        this.acc = new PVector(0.0, 0.0);
        this.pcolor = color(palette[(int) random(0, palette.length)]);
        this.decay = new PVector(random(1.0), random(1.0));
    }
    
    Particle(float x, float y)
    {
        this.pos = new PVector(x, y);
        this.prevPos = this.pos.copy();
        this.vel = new PVector(0.0, 0.0);
        this.acc = new PVector(0.0, 0.0);
        this.pcolor = color(palette[(int) random(0, palette.length)]);
        this.decay = new PVector(random(1.0), random(1.0));
    }
        
    void update()
    {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0); // toggle or scale
    }

    void applyForce(PVector force)
    {
        this.acc.add(force);
    }

    void show()
    {
        pg.line(
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
        int index = (x + y * cols);
        PVector force = vectors[index];
        this.applyForce(force);
    }
    
    void check(Particle[] particles)
    {
        for (Particle particle : particles)
        {
            PVector n = new PVector(this.pos.x - particle.pos.x, this.pos.y - particle.pos.y);
            if (n.mag() > 400)
            {
                this.applyForce(n.mult(-10));
            }
            if (n.mag() < frameCount % 200 /* 125 */)
            {
                //this.applyForce(n.mult(-10));
                PVector r = PVector.random2D();
                this.applyForce(n.add(r.mult(100)));
                int ndx = (int) floor(map(n.mag(), 0, 25, 0, palette.length-1));
                this.pcolor = palette[ndx % palette.length];
            }
        }
    }
}

void draw()
{
    pg.beginDraw();
    pg.background(0, 3);
    //background(color(0, 0, 0));
    //pg.tint(0, 4);

    int yoff = start;
    float tdelta = frameCount / (cos(frameCount * 0.01 * TWO_PI) * 0.5 + 0.5);

    //noiseDetail(2, tdelta * 0.25 + 0.05);
    for (int y = 0; y < rows; y++)
    {
        int xoff = start;

        for (int x = 0; x < cols; x++)
        {   
            //noiseSeed((x + frameCount) * y);
            //noiseDetail(2, tdelta * 0.25 + 0.05);
            //noiseDetail(ceil((x + 1) / 8.0), x / (y + 1));
            int index = x + y * cols;
            float angle = noise(xoff, yoff, zoff) * TWO_PI;
            PVector v = PVector.fromAngle(angle);
            float m = map(noise(xoff, yoff, magOff), 0, 1, -5, 5);
            
            v.setMag(m);
            flowfield[index] = v; // replace v by other flow field as needed rather than noise()
            
            xoff += inc;
        }
        yoff += inc;
    }
    magOff += magInc;
    zoff += incStart;
    start -= magInc;

    for (Particle particle : particles)
    {
        pg.stroke(particle.pcolor);
        particle.follow(flowfield);
        particle.check(particles);
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
    
    
    pg.endDraw();
    image(pg, 0, 0);
    

}

