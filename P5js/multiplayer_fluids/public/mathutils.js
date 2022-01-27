// some auxiliary functions

class MathUtils {
  constructor() { ; }

  static square = (x) => x * x;
  static hypot = (x, y) => Math.sqrt(square(x) + square(y));
  static clamp = (x, mi, ma) => Math.min(Math.max(mi, x), ma);

  static cartesian2polar(x, y) {
    return [ Math.sqrt(x * x + y * y), Math.atan2(y, x) ];
  }

  static polar2cartesian(r, theta) {
    return [ r * Math.cos(theta), r * Math.sin(theta) ];
  }

  static randint(nmax) {
    return Math.max(0, Math.ceil(Math.random() * nmax) - 1);
  }

  static random_range(nmin, nmax) {
    return Math.min(nmax - 1, Math.round(Math.random() * nmax + nmin));
  }
}
