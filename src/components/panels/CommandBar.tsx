import { motion } from "framer-motion";
import { MapPin, Navigation, Search } from "lucide-react";
import { useState } from "react";
import { useOrbitra, type LocationFix } from "@/store/orbitra";

const PRESETS: LocationFix[] = [
  { name: "London, UK", lat: 51.5074, lon: -0.1278, elevation: 11 },
  { name: "New York, USA", lat: 40.7128, lon: -74.006, elevation: 10 },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, elevation: 40 },
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093, elevation: 58 },
  { name: "Reykjavik, Iceland", lat: 64.1466, lon: -21.9426, elevation: 61 },
  { name: "Cape Canaveral, USA", lat: 28.3922, lon: -80.6077, elevation: 3 },
  { name: "Baikonur, Kazakhstan", lat: 45.965, lon: 63.305, elevation: 90 },
];

export function CommandBar() {
  const { location, setLocation, now } = useOrbitra();
  const [q, setQ] = useState("");
  const matches = q
    ? PRESETS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    : [];

  const useGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ name: "Current Position", lat: pos.coords.latitude, lon: pos.coords.longitude, elevation: pos.coords.altitude ?? 0 });
    });
  };

  return (
    <div className="glass-panel flex items-center gap-4 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <div className="font-display text-base tracking-[0.4em] text-glow-cyan">ORBITRA</div>
        <span className="hidden md:inline font-mono text-[10px] tracking-widest text-muted-foreground">PROJECT ZENITH · v0.9.1</span>
      </div>

      <div className="ml-4 hidden md:flex items-center gap-3 border-l border-cyan/15 pl-4 text-[10px] uppercase tracking-[0.2em]">
        <Stat label="UTC" value={now.toISOString().slice(11, 19)} />
        <Stat label="LAT" value={location.lat.toFixed(3) + "°"} />
        <Stat label="LON" value={location.lon.toFixed(3) + "°"} />
        <Stat label="LOC" value={location.name} accent />
      </div>

      <div className="relative ml-auto w-72">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyan" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search city, coordinates, target..."
          className="w-full rounded-md border border-cyan/20 bg-black/40 py-1.5 pl-9 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan/60 focus:outline-none focus:ring-1 focus:ring-cyan/40"
        />
        {matches.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="glass-panel absolute right-0 top-full z-30 mt-1 w-full overflow-hidden p-1">
            {matches.map((m) => (
              <button
                key={m.name}
                onClick={() => { setLocation(m); setQ(""); }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-cyan/10"
              >
                <MapPin className="h-3 w-3 text-cyan" />
                <span className="flex-1">{m.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{m.lat.toFixed(1)}, {m.lon.toFixed(1)}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <button onClick={useGPS} className="flex items-center gap-1.5 rounded-md border border-cyan/30 bg-cyan/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-glow-cyan hover:bg-cyan/15">
        <Navigation className="h-3 w-3" /> GPS
      </button>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${accent ? "text-glow-purple" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
