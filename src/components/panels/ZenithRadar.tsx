import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useOrbitra } from "@/store/orbitra";
import { formatDec, formatRA, nearestConstellation, zenithEquatorial, subSolarPoint } from "@/lib/astro";

export function ZenithRadar() {
  const { location, now } = useOrbitra();
  const z = zenithEquatorial(now, location.lat, location.lon);
  const c = nearestConstellation(z.ra, z.dec);
  const sun = subSolarPoint(now);
  const sunSeparation = Math.hypot(
    ((sun.lon - location.lon + 540) % 360) - 180,
    sun.lat - location.lat,
  );
  const isDaytime = sunSeparation < 90;

  return (
    <div className="glass-panel-glow scanline relative p-5">
      <Header title="ZENITH ENGINE" badge={isDaytime ? "DAY" : "NIGHT"} badgeColor={isDaytime ? "gold" : "cyan"} />

      <div className="mt-4 grid grid-cols-[180px_1fr] gap-5">
        <RadarDisplay lat={location.lat} />

        <div className="space-y-2">
          <Metric label="Zenith RA" value={formatRA(z.ra)} mono />
          <Metric label="Zenith Dec" value={formatDec(z.dec)} mono />
          <Metric label="LST" value={z.lst.toFixed(4) + " h"} mono />
          <Metric label="Nearest Constellation" value={c.name} accent />
          <Metric label="Separation" value={c.separation.toFixed(2) + "°"} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-cyan/15 pt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Confidence: <span className="text-glow-cyan">99.4%</span></span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-blink" />
          LIVE STREAM
        </span>
      </div>
    </div>
  );
}

function RadarDisplay({ lat }: { lat: number }) {
  // Animated radar with concentric rings and rotating sweep
  return (
    <div className="relative aspect-square">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00F5FF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweep" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0" />
            <stop offset="100%" stopColor="#00F5FF" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="95" fill="url(#radarBg)" />
        {[20, 40, 60, 80, 95].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#00F5FF" strokeOpacity="0.18" />
        ))}
        <line x1="5" y1="100" x2="195" y2="100" stroke="#00F5FF" strokeOpacity="0.15" />
        <line x1="100" y1="5" x2="100" y2="195" stroke="#00F5FF" strokeOpacity="0.15" />

        {/* horizon arc representing latitude */}
        <circle cx="100" cy="100" r={Math.abs(lat)} fill="none" stroke="#9D4EDD" strokeOpacity="0.5" strokeDasharray="3 3" />

        {/* zenith dot */}
        <circle cx="100" cy="100" r="3" fill="#FFD166" />

        <g className="animate-radar" style={{ transformOrigin: "100px 100px" }}>
          <path d="M100 100 L195 100 A95 95 0 0 0 100 5 Z" fill="url(#sweep)" />
        </g>

        {/* scattered targets */}
        {Array.from({ length: 18 }).map((_, i) => {
          const a = (i / 18) * Math.PI * 2;
          const r = 30 + ((i * 13) % 60);
          return <circle key={i} cx={100 + Math.cos(a) * r} cy={100 + Math.sin(a) * r} r="1.5" fill="#00F5FF" opacity={0.4 + ((i * 7) % 6) * 0.1} />;
        })}
      </svg>
      <div className="absolute inset-x-0 -bottom-1 text-center font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
        ZENITH +90°
      </div>
    </div>
  );
}

function Header({ title, badge, badgeColor }: { title: string; badge?: string; badgeColor?: "cyan" | "gold" | "critical" }) {
  const color = badgeColor === "gold" ? "border-gold/40 text-gold" : badgeColor === "critical" ? "border-critical/40 text-critical" : "border-cyan/40 text-glow-cyan";
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-cyan animate-pulse-glow" />
        <h3 className="font-display text-xs tracking-[0.3em] text-foreground/90">{title}</h3>
      </div>
      {badge && <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] tracking-widest ${color}`}>{badge}</span>}
    </div>
  );
}

function Metric({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  return (
    <motion.div
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-baseline justify-between border-b border-cyan/10 pb-1.5"
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""} ${accent ? "text-glow-purple" : "text-foreground"}`}>{v}</span>
    </motion.div>
  );
}
