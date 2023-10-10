//
// Grid optimization to find nearest particle trail neighbours.
// Note that this is accessing some Processing global vars, and
// that PDE files in the sketch directory are considered to be
// in the **same** scope. This is moved to its own file for the
// sake of readability.
//

class Grid
{
    int fieldColumns, fieldRows;
    int cellSize;
    ArrayList<Particle>[][] grid;
    
    Grid(int fieldColumns, int fieldRows, int cellSize)
    {
        this.fieldColumns = fieldColumns;
        this.fieldRows = fieldRows;
        this.cellSize = cellSize;
        grid = new ArrayList[fieldColumns][fieldRows];

        for (int i = 0; i < fieldColumns; i++)
        {
            for (int j = 0; j < fieldRows; j++)
            {
                grid[i][j] = new ArrayList<Particle>();
            }
        }
    }
    
    void insert(Particle particle)
    {
        int col = (int)(particle.position.x / cellSize);
        int row = (int)(particle.position.y / cellSize);
        col = constrain(col, 0, fieldColumns - 1);
        row = constrain(row, 0, fieldRows - 1);
        grid[col][row].add(particle);
    }
    
    ArrayList<Particle> query(Particle particle, float radius)
    {
        ArrayList<Particle> neighbors = new ArrayList<Particle>();
        int col = (int)(particle.position.x / cellSize);
        int row = (int)(particle.position.y / cellSize);

        for (int i = -1; i <= 1; i++)
        {
            for (int j = -1; j <= 1; j++)
            {
                int x = col + i;
                int y = row + j;

                if (x >= 0 && x < fieldColumns && y >= 0 && y < fieldRows)
                {
                    ArrayList<Particle> cell = grid[x][y];

                    for (Particle neighbor : cell)
                    {
                        float d = dist(
                            particle.position.x, particle.position.y,
                            neighbor.position.x, neighbor.position.y
                           );

                        if (d > 0 && d < radius)
                        {
                            neighbors.add(neighbor);
                        }
                    }
                }
            }
        }
        return neighbors;
    }
    
    void clear()
    {
        for (int i = 0; i < fieldColumns; i++)
        {
            for (int j = 0; j < fieldRows; j++)
            {
                grid[i][j].clear();
            }
        }
    }
}
