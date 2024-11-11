import("stdfaust.lib");

// User interface elements
damping = hslider("damping", 0.1, 0.01, 1, 0.01);     // Damping slider

freq = hslider("freq", 1000, 10, 24000, 1);
gain = hslider("gain", 1.0, 0.0, 1.0, 0.01);
gate = button("gate");

// Convert frequency to string length
length = pm.f2l(freq);

// Generate impulse when button is pressed
excitation = ba.impulsify(gate);

// Karplus-Strong string synthesis
process = excitation : pm.ks(length, damping) * gain <: _,_;