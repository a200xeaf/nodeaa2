import ("stdfaust.lib");

echo = +~(de.sdelay(192000, 1024, delayLength) : *(feedback));
duration = hslider("duration", 500, 1, 2000, 1) * 0.001;
delayLength = duration * ma.SR;
feedback = hslider("feedback", 0.5, 0.0, 0.99, 0.01) : si.smoo;
wet = hslider("wet", 0.5, 0.0, 1.0, 0.01) : si.smoo;

TEST(x, y) = x, y : de.sdelay(192000, 1024, delayLength) *(feedback), de.sdelay(192000, 1024, delayLength) *(feedback) : echo, echo;

process = ef.dryWetMixer(wet, TEST);