import { motion } from "framer-motion";
import { Activity, Eye, Orbit, Radar } from "lucide-react";

const PLANETS = [
  { name: "Mercury", elev: -12, az: 88, dist: "0.71 AU", visible: false },
  { name: "Venus", elev: 24, az: 245, dist: "0.45 AU", visible: true },
  { name: "Mars", elev: 38, az: 175, dist: "1.62 AU", visible: true },
  { name: "Jupiter", elev: 61, az: 110, dist: "5.20 AU", visible: true },
  { name: "Saturn", elev: -8, az: 295, dist: "9.50 AU", visible: false },
  { name: "Uranus", elev: 18, az: 78, dist: "19.1 AU", visible: false },
  { name: "Neptune", elev: -32, az: 320, dist: "29.7 AU", visible: false },
];

export function ObjectTelemetry() {
  return (
    <div className="glass-panel flex flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Orbit className="h-4 w-4 text-purple" />
          <h3 className="font-display text-xs tracking-[0.3em]">OBJECT TELEMETRY</h3>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-purple">PLANETARY · LIVE</span>
      </div>

      <div className="mt-3 space-y-1.5">
        {PLANETS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group relative grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-md border border-cyan/10 bg-black/30 px-3 py-2 hover:border-cyan/30"
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${p.visible ? "bg-success animate-blink" : "bg-muted-foreground/40"}`} />
              <span className="font-display text-[11px] tracking-widest">{p.name.toUpperCase()}</span>
            </div>
            <Stat icon={<Activity className="h-2.5 w-2.5" />} value={`${p.elev > 0 ? "+" : ""}${p.elev}°`} />
            <Stat icon={<Radar className="h-2.5 w-2.5" />} value={`${p.az}°`} />
            <span className="font-mono text-[10px] text-muted-foreground">{p.dist}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 border-t border-cyan/10 pt-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <Eye className="h-3 w-3" /> NAKED-EYE VISIBLE
          <span className="ml-auto font-mono text-glow-cyan">{PLANETS.filter((p) => p.visible).length} bodies</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1 font-mono text-[11px] text-glow-cyan">
      {icon}{value}
    </span>
  );
}
