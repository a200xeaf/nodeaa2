import("stdfaust.lib");
gain = hslider("gain", 1.0, 0.0, 1.0, 0.001);
process = _ * gain, _ * gain;