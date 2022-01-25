// some auxiliary functions

class MathUtils
{
    constructor()
    {
        ;
    }

    static square = (x) => x * x;
    static hypot = (x, y) => Math.sqrt(square(x) + square(y));
    static clamp = (x, mi, ma) => Math.min(Math.max(mi, x), ma);
    
    static cartesian2polar(x, y)
    {
        return [ Math.sqrt(x * x + y * y), Math.atan2(y, x) ];
    }
    
    static polar2cartesian(r, theta)
    {
        return [ r * Math.cos(theta), r * Math.sin(theta) ];
    }

}
