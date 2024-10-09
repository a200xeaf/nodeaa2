import("filters.lib");

freq = hslider("frequency", 2000, 20, 20000, 1) : si.smoo;
q = hslider("quality", 0.1, 0.1, 6, 0.01) : si.smoo;

process = _, _ : fi.resonlp(freq, q, 1.0), fi.resonlp(freq, q, 1.0);