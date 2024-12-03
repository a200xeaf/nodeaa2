import("stdfaust.lib");

gain = hslider("gain", 1.0, 1.0, 60.0, 0.01) : si.smoo;
wet = hslider("wet", 0.5, 0.0, 1.0, 0.01) : si.smoo;

scale(x) = 1 / sqrt(x);

TEST(x, y) = x, y : _ * gain, _ * gain : atan, atan : _ * scale(gain), _ * scale(gain);

process = ef.dryWetMixer(wet, TEST);
