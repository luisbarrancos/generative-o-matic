
float noiseDensity = 2.1;
float noiseIncrement = 0.005;
float fieldMagnitude = 0.0005;
int noiseOffset = 0;

int fieldCellSize = 50;
int fps = 60;

int fieldColumns, fieldRows;
int noiseTimeOffset = 0;

float fieldMagnitudeOffset = 0;
boolean showField = true;

int numParticles = 1000; // 12500;
Particle[] particles;
PVector[] flowfield;

int alpha = 15;
int centerX, centerY;

color[] palette2 =
{
    color(220, 47, 2, alpha),
    color(232, 93, 4, alpha),
    color(244, 140, 6, alpha),
    color(250, 163, 7, alpha),
    color(255, 186, 8, alpha),
    color(208, 0, 0, alpha),
    color(157, 2, 8, alpha),
    color(106, 4, 15, alpha),
    color(55, 6, 23, alpha),
    color(3, 7, 30, alpha),
};
    
color[] palette =
{
    #001219,#005f73, #0a9396, #94d2bd, #e9d8a6, #ee9b00, #ca6702, #bb3e03, #ae2012, #9b2226
};
        
PGraphics canvas;
    
void setup()
{
    size(640, 480, P2D);
    canvas = createGraphics(width, height, P2D);
    frameRate(fps);

    centerX = floor(width / 2);
    centerY = floor(height / 2);
    
    fieldColumns = ceil(width / float(fieldCellSize));
    fieldRows= ceil(height / float(fieldCellSize));
    blendMode(BLEND); 
    
    background(0, 0.1);
    strokeWeight(1.0);
    stroke(255, 255, 255);
    
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
        this.pcolor = color(255); //color(palette[(int) random(0, palette.length)]);
        this.decay = new PVector(random(1.0), random(1.0));
    }
        
    Particle(float x, float y)
    {
        this.position = new PVector(x, y);
        this.previousPosition = this.position.copy();
        this.velocity = new PVector(0.0, 0.0);
        this.acceleration = new PVector(0.0, 0.0);
        this.pcolor = color(255);//color(palette[(int) random(0, palette.length)]);
        this.decay = new PVector(random(1.0), random(1.0));
    }
    
    void updateMotion()
    {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0); // toggle or scale
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
        int x = floor(this.position.x / fieldCellSize);
        int y = floor(this.position.y / fieldCellSize);
        PVector force = vectors[x + y * fieldColumns];
        this.applyForce(force);
    }
        
    void check(Particle[] particles, float dist)
    {
        for (Particle particle : particles)
        {
            PVector n = new PVector(
                this.position.x - particle.position.x,
                this.position.y - particle.position.y
                );
            
            if (n.mag() > 400)
            {
                this.applyForce(n.mult( - 10));
            }
            if (n.mag() < frameCount % ceil(dist) /* 200 */ /* 125 */)
            {
                PVector r = PVector.random2D();
                this.applyForce(n.add(r.mult(100)));
                this.pcolor = lerpColor(#ffbf00, #ce0041, n.mag() / (floor(dist) + 1));
            }
        }
    }
}

void draw()
{
    canvas.beginDraw();
    canvas.background(0, 3);
    
    int yOffset = noiseOffset;
    float dist = dist(mouseX, mouseY, centerX, centerY);
    
    for (int y = 0; y < fieldRows; y++)
    {
        int xOffset = noiseOffset;
        
        for (int x = 0; x < fieldColumns; x++)
        {   
            float angle = noise(xOffset, yOffset, noiseTimeOffset) * TWO_PI;
            PVector v = PVector.fromAngle(angle);
            // TODO: finish XOR-shift variants, replace this perhaps
            float m = map(noise(xOffset, yOffset, fieldMagnitudeOffset), 0, 1, -5, 5);
            v.setMag(m);
            flowfield[x + y * fieldColumns] = v;
            
            xOffset += noiseDensity;
        }
        yOffset += noiseDensity;
    }
    fieldMagnitudeOffset += fieldMagnitude;
    noiseTimeOffset += noiseIncrement;
    noiseOffset -= fieldMagnitude;
    
    for (Particle particle : particles)
    {
        canvas.stroke(particle.pcolor);
        particle.followField(flowfield);
        particle.check(particles, dist);
        particle.updateMotion();
        particle.edges();
        particle.createTrail();
    }
    
    if (random(10.0) > 5 && particles.length < 2500)
    {
        // Same as above: somewhat wasteful
        float rnd = floor(noise(noiseTimeOffset) * 20);
        
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

    canvas.endDraw();
    image(canvas, 0, 0);
}