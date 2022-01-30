/*
    Assorted math utilities for the CFD simulation and others.
    Copyright (C) 2022 Luis Barrancos

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

class MathUtils
{
    constructor() { ; }

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

    static randint(nmax)
    {
        return Math.max(0, Math.ceil(Math.random() * nmax) - 1);
    }

    static random_range(nmin, nmax)
    {
        return Math.min(nmax - 1, Math.round(Math.random() * nmax + nmin));
    }
}
