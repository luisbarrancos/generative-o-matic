//
// Set of color utils to generate randomized color palettes or
// palettes with offset H,S,V values, complementary offset palettes
// and triadic offset palettes.
//
class Palette
{
    private color[] colors;

    Palette(int numColors)
    {
        initializePalette(numColors);
    }

    void initializePalette(int numColors)
    {
        colors = new color[numColors];
        
        for (int i = 0; i < colors.length; i++)
        {
            colors[i] = color((int) random(256), (int) random(256), (int) random(256));
        }
    }

    void createRandomPalette(color baseColor, int hueOffset, int saturationOffset, int brightnessOffset)
    {
        float baseHue = hue(baseColor);
        float baseSaturation = saturation(baseColor);
        float baseBrightness = brightness(baseColor);

        for (int i = 0; i < colors.length; i++)
        {
            float hueValue = random(baseHue - hueOffset, baseHue + hueOffset);
            float saturationValue = constrain(random(baseSaturation - saturationOffset, baseSaturation + saturationOffset), 0, 100);
            float brightnessValue = constrain(random(baseBrightness - brightnessOffset, baseBrightness + brightnessOffset), 0, 100);

            colors[i] = HSVtoRGB(int(hueValue), int(saturationValue), int(brightnessValue));
        }
    }

    void createComplementaryPalette(color baseColor, float hueRandomization, float saturationRandomization, float brightnessRandomization)
    {
        colors[0] = baseColor;
        float baseHue = hue(baseColor);
        float baseSaturation = saturation(baseColor);
        float baseBrightness = brightness(baseColor);

        for (int i = 1; i < colors.length; i++)
        {
            float hueOffset = random(-hueRandomization, hueRandomization);
            float satOffset = random(-saturationRandomization, saturationRandomization);
            float briOffset = random(-brightnessRandomization, brightnessRandomization);

            int hue = (int) (baseHue + 180 + int(hueOffset)) % 360;
            int sat = constrain(int(baseSaturation + satOffset), 0, 100);
            int bri = constrain(int(baseBrightness + briOffset), 0, 100);

            colors[i] = HSVtoRGB(hue, sat, bri);
        }
    }

    // Expects a RGB [0,255] base color and [0.0, 1.0] randomization scalers
    void createTriadicPalette(color baseColor, float hueRandomization, float saturationRandomization, float brightnessRandomization)
    {
        colors[0] = baseColor;
        float baseHue = hue(baseColor);
        float baseSaturation = saturation(baseColor);
        float baseBrightness = brightness(baseColor);

        for (int i = 1; i < colors.length; i++)
        {
            float hueOffset = random(-hueRandomization, hueRandomization);
            float satOffset = random(-saturationRandomization, saturationRandomization);
            float briOffset = random(-brightnessRandomization, brightnessRandomization);

            int hue1 = (int) (baseHue + 120 + int(hueOffset)) % 360;
            int hue2 = (int) (baseHue + 240 + int(hueOffset)) % 360;
            
            int sat = constrain(int(baseSaturation + satOffset), 0, 100);
            int bri = constrain(int(baseBrightness + briOffset), 0, 100);

            colors[i] = HSVtoRGB(hue1, sat, bri);
            i++;

            if (i < colors.length)
            {
                colors[i] = HSVtoRGB(hue2, sat, bri);
            }
        }
    }

    color[] getPalette()
    {
        return colors;
    }

    String[] getHexColors()
    {
        String[] hexColors = new String[colors.length];
        for (int i = 0; i < colors.length; i++)
        {
            hexColors[i] = "#" + hex(colors[i], 6);
        }
        return hexColors;
    }

    color RGBtoHSV(int r, int g, int b)
    {
        float rp = float(r) / 255.0;
        float gp = float(g) / 255.0;
        float bp = float(b) / 255.0;

        float cmax = max(rp, max(gp, bp));
        float cmin = min(rp, min(gp, bp));
        float delta = cmax - cmin;
        float h = 0;

        if (delta != 0)
        {
            if (cmax == rp)
            {
                h = 60 * ((gp - bp) / delta); if (h < 0) h += 360;
            }
            else if (cmax == gp)
            {
                h = 60 * ((bp - rp) / delta + 2);
            }
            else
            {
                h = 60 * ((rp - gp) / delta + 4);
            }
        }

        int hue = int(h);
        int saturation = int((cmax == 0) ? 0 : (delta / cmax) * 100);
        int brightness = int(cmax * 100);

        return color(int(hue), int(saturation), int(brightness));
    }

    color HSVtoRGB(int hue, int saturation, int brightness)
    {
        float h = float(hue) / 360.0;
        float s = float(saturation) / 100.0;
        float v = float(brightness) / 100.0;

        if (s == 0)
        {
            return color(int(v * 255), int(v * 255), int(v * 255));
        }

        float c = v * s;
        float x = c * (1 - abs((h * 6) % 2 - 1));
        float m = v - c, rp, gp, bp;

        if (h < 1)
        {
            rp = c; gp = x; bp = 0;
        }
        else if (h < 2)
        {
            rp = x; gp = c; bp = 0;
        }
        else if (h < 3)
        {
            rp = 0; gp = c; bp = x;
        }
        else if (h < 4)
        {
            rp = 0; gp = x; bp = c;
        }
        else if (h < 5)
        {
            rp = x; gp = 0; bp = c;
        }
        else
        {
            rp = c; gp = 0; bp = x;
        }

        rp = (rp + m) * 255;
        gp = (gp + m) * 255;
        bp = (bp + m) * 255;

        return color(int(rp), int(gp), int(bp));
    }
}
