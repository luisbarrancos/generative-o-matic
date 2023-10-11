// Main sketch, all other PDEs are auxiliary (but same scoped)

import java.util.Iterator;
import java.util.ArrayList;

// Controls fdr the Perlin noise field
float noiseDensity = 5.0;
float noiseIncrement = 0.05;
int noiseOffset = 0;
int noiseTimeOffset = 0;

// Beware of the flow field cell size, since smaller values
// result in more dense and computationally expensive flow fields
int fieldCellSize = 12;
float fieldMagnitude = 0.005;
float fieldMagnitudeOffset = 0;

// Particle related variables
int numParticles = 1500; // 12500;
float maxParticleSpeed = 2.0;
float forceMultiplier = 0.1;
float attractionRadius = 8.0;
float repulsionRadius = 5.0;
float eatProbability = 0.05;
// Particles take only the colors from this pallete.
// TODO: some dynamic color generation
//color[] palette = {
//    #19324a, #5f8fe8, #5c7eed, #001219, #005f73, #0a9396,
//    #94d2bd, #e9d8a6, #ee9b00, #ca6702, #bb3e03, #ae2012, #9b2226
//};
color[] palette;

// Simulation controls and debugging.
int fps = 60;
boolean showField = false;

// We test the neighbourhood of N particles, and since they're
// relatively uniform on the canvas, a grid could alleviate the
// computational burden. A BSP could be interesting for sparse
// particles, when we have a very sharp flocking or aggregation
// and following behaviour.
int gridSize = 20;
Grid grid;

// The remaining global variables. Note that we use a PGraphics
// canvas, so, P2D mode must be used, and this doesn't allow for
// other blend modes other than "BLEND".
int fieldColumns, fieldRows;
ArrayList<Particle> particles;
PVector[] flowfield;
PGraphics canvas;


// WIP: XOR-Shift RNG for int and float values, timings needed
long seed;
long xorShiftRandom()
{
    seed ^= (seed << 21);
    seed ^= (seed >>> 35);
    seed ^= (seed << 4);
    return seed;
}

// Generate random float between 0.0 (inclusive) and 1.0 (exclusive)
float xorShiftRandomFloat()
{
    return (xorShiftRandom() & 0x7FFFFFFF) / (float) 0x7FFFFFFF;
}

void setup()
{
    size(640, 480, P2D);
    background(0);
    frameRate(fps);
    
    fieldColumns = (int) floor(width / fieldCellSize);
    fieldRows = (int) floor(height / fieldCellSize);
    
    // WIP: timings for XOR-shift RNG
    seed = System.currentTimeMillis();  // Seed with the current time
    for (int i = 0; i < 10; i++)
    {
        long randomValue = xorShiftRandom();
        text("Random Integer: " + randomValue, 50, 50 + i * 30);
    }

    for (int i = 0; i < 10; i++)
    {
        float randomValue = xorShiftRandomFloat();
        text("Random Float: " + randomValue, 200, 50 + i * 30);
    }

    // Create particle trails palette, which MUST be done before constructing
    // particles.
    Palette trailColors = new Palette(64);
    // hue, saturation, brightness offsets are relative to the [0,360] and
    // [0,100] ranges for hue and saturation and brightness respectively.
    trailColors.createTriadicPalette(color(255, 153, 0), 30, 60, 40);
    palette = trailColors.getPalette();

    particles = new ArrayList<Particle>();
    for (int i = 0; i < numParticles; i++)
    {
        particles.add(new Particle());
    }

    flowfield = new PVector[fieldRows * fieldColumns];
    for (int i = 0; i < flowfield.length; i++)
    {
        flowfield[i] = new PVector(0, 0);
    }
    
    canvas = createGraphics(width, height, P2D);
    // Default blend mode BLEND in P2D triggers a NullPointerException
    //canvas.blendMode(BLEND);
    //canvas.strokeWeight(1.0);

    // Initialize the optimization grid
    grid = new Grid(fieldColumns, fieldRows, gridSize);
    
    // Precompute noise values
    float[] noiseValues = new float[fieldColumns * fieldRows];
    for (int y = 0; y < fieldRows; y++)
    {
        for (int x = 0; x < fieldColumns; x++)
        {
            noiseValues[x + y * fieldColumns] = noise(x * noiseDensity, y * noiseDensity, noiseTimeOffset);
        }
    }
}


void draw()
{
    canvas.beginDraw();
    canvas.background(0, 0, 0, 10);
    
    int yoff = noiseOffset;
    for (int y = 0; y < fieldRows; y++)
    {
        int xoff = noiseOffset;
        for (int x = 0; x < fieldColumns; x++)
        {
            int index = x + y * fieldColumns;
            //noiseDetail(2, 2); // expensive, not really worth it here
            float angle = noise(xoff, yoff, noiseTimeOffset) * TWO_PI;
            PVector v = PVector.fromAngle(angle);
            v.setMag(5);
            flowfield[index] = v;
            xoff += noiseDensity;
        }
        yoff += noiseDensity;
    }
    
    fieldMagnitudeOffset += fieldMagnitude;
    noiseTimeOffset += noiseIncrement;
    noiseOffset -= fieldMagnitude;
    
    // for (P p : ps) is throwing an error
    // TODO: just syntactical sugar but i would like to know more.
    Iterator<Particle> iterator = particles.iterator();
    while(iterator.hasNext())
    {
        Particle particle = iterator.next();
        stroke(particle.particleColor);
        
        // Query the grid for nearby particles and apply attraction and repulsion forces
        // particle.followField(flowfield);
        particle.applyAttraction();
        particle.applyRepulsion();
        particle.updateMotion();
        particle.wrapAround();
        particle.createTrail();
        
        // Insert the particle into the grid, for we divide the canvas
        // into grid cells in order to keep track of which particles are
        // on each cell. This will allow us to save some time finding the
        // N nearest.
        grid.insert(particle);
    }
    
    ArrayList<Particle> newParticles = new ArrayList<Particle>();
    ArrayList<Particle> particlesToRemove = new ArrayList<Particle>();
    
    // Check for eating and reproduction
    Iterator<Particle> eatIterator = particles.iterator();
    
    while(eatIterator.hasNext())
    {
        Particle particle = eatIterator.next();
        if (random(1) < eatProbability)
        {
            int closestIndex = particle.findNearest();
            if (closestIndex != -1)
            {
                // Add the new particle to the list and mark the current for removal
                newParticles.add(new Particle(random(width), random(height)));
                particlesToRemove.add(particle);
            }
        }
    }
    
    // Add particles if needed
    if (random(10.0) > 5 && particles.size() < 2500)
    {
        float rnd = floor(noise(noiseTimeOffset) * 20);
        for (int j = 0; j < rnd; j++)
        {
            newParticles.add(new Particle(random(width), random(height)));
        }
    }
    
    // Remove excess particles if needed
    if (particles.size() > 2000)
    {
        int rnd = (int) random(0, 10);
        Iterator<Particle> excessIterator = particles.iterator();
        int removedCount = 0;

        while(excessIterator.hasNext() && removedCount < rnd)
        {
            particlesToRemove.add(excessIterator.next());
            removedCount++;
        }
    }
    
    particles.removeAll(particlesToRemove);    
    particles.addAll(newParticles);
    
    canvas.endDraw();
    image(canvas, 0, 0);
}