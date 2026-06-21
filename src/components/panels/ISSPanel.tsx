import { motion } from "framer-motion";
import { Satellite, Gauge, Users, Orbit } from "lucide-react";
import { useCrew, useISS } from "@/lib/api/iss";

export function ISSPanel() {
  const { data: iss } = useISS();
  const { data: crew } = useCrew();
  const issCrew = crew?.filter((c) => c.craft === "ISS") ?? [];

  return (
    <div className="glass-panel relative p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4 text-gold" />
          <h3 className="font-display text-xs tracking-[0.3em]">ISS TELEMETRY</h3>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-gold">25544 · ZARYA</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Telemetry icon={<Gauge className="h-3 w-3" />} label="VELOCITY" value={iss ? Math.round(iss.velocity).toLocaleString() : "—"} unit="km/h" bar={iss ? (iss.velocity / 28000) * 100 : 0} />
        <Telemetry icon={<Orbit className="h-3 w-3" />} label="ALTITUDE" value={iss ? iss.altitude.toFixed(1) : "—"} unit="km" bar={iss ? (iss.altitude / 420) * 100 : 0} />
        <Telemetry icon={<Satellite className="h-3 w-3" />} label="LATITUDE" value={iss ? iss.lat.toFixed(2) : "—"} unit="°" bar={iss ? ((iss.lat + 90) / 180) * 100 : 0} />
        <Telemetry icon={<Satellite className="h-3 w-3" />} label="LONGITUDE" value={iss ? iss.lon.toFixed(2) : "—"} unit="°" bar={iss ? ((iss.lon + 180) / 360) * 100 : 0} />
      </div>

      <div className="mt-4 border-t border-cyan/10 pt-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <Users className="h-3 w-3" /> Crew Aboard
          <span className="ml-auto text-glow-cyan font-mono">{issCrew.length}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-[11px]">
          {issCrew.slice(0, 6).map((c) => (
            <div key={c.name} className="truncate text-foreground/80">· {c.name}</div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success animate-blink" /> NOMINAL</span>
        <span>SIGNAL <span className="text-glow-cyan">-72 dBm</span></span>
      </div>
    </div>
  );
}

function Telemetry({ icon, label, value, unit, bar }: { icon: React.ReactNode; label: string; value: string; unit: string; bar: number }) {
  return (
    <div className="rounded-md border border-cyan/15 bg-black/30 p-2">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-lg text-glow-cyan">{value}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-1 h-0.5 w-full overflow-hidden rounded bg-cyan/10">
        <motion.div
          className="h-full bg-cyan shadow-[0_0_8px_#00F5FF]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, Math.min(100, bar))}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
