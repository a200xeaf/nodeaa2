import("stdfaust.lib");

// Controls for frequency, gain, and ADSR envelope
freq = hslider("freq", 1000, 20, 24000, 1);
gain = hslider("gain", 1.0, 0.0, 1.0, 0.01);
gate = button("gate") : en.adsr(attack, sustain, decay, release);

attack = hslider("attack", 0.1, 0.0, 5.0, 0.0) : si.smoo;
decay = hslider("decay", 0.1, 0.0, 5.0, 0.0) : si.smoo;
sustain = hslider("sustain", 0.7, 0.0, 1.0, 0.0) : si.smoo;
release = hslider("release", 0.1, 0.0, 5.0, 0.0) : si.smoo;

// Waveform selection (simulating an enum with an hslider)
waveformsel = hslider("waveformsel", 0, 0, 4, 1);

// Oscillators for different waveforms
sineWave = os.osc(freq);
squareWave = os.square(freq);
sawtoothWave = os.sawtooth(freq);
triangleWave = os.triangle(freq);
noiseWave = no.noise;

// Using selectn to select the oscillator based on the waveform slider
oscillatorSel = sineWave, squareWave, sawtoothWave, triangleWave, noiseWave : ba.selectn(5, waveformsel);

// ADSR envelope applied to selected waveform
process = oscillatorSel * gate * gain <: _, _;