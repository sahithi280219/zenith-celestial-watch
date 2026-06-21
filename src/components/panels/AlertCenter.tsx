import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Radio, Rocket, Satellite, Sun, Waves } from "lucide-react";
import { useEffect, useState } from "react";

type Severity = "info" | "warn" | "critical" | "success";
type Alert = {
  id: string; title: string; detail: string; time: string; severity: Severity;
  icon: React.ReactNode;
};

const SEED: Alert[] = [
  { id: "1", title: "ISS PASS INBOUND", detail: "Visible pass in 14m 22s · 78° elevation", time: "T-14:22", severity: "success", icon: <Satellite className="h-3.5 w-3.5" /> },
  { id: "2", title: "GEOMAGNETIC STORM G2", detail: "Kp index 6.3 detected · aurora probable", time: "06:42 UTC", severity: "warn", icon: <Waves className="h-3.5 w-3.5" /> },
  { id: "3", title: "STARSHIP IFT-9 SCRUB", detail: "Launch window shifted to T+02:14:00", time: "12 min ago", severity: "info", icon: <Rocket className="h-3.5 w-3.5" /> },
  { id: "4", title: "X1.2 SOLAR FLARE", detail: "AR3664 erupting · CME analysis pending", time: "18 min ago", severity: "critical", icon: <Sun className="h-3.5 w-3.5" /> },
  { id: "5", title: "NEO 2024 PT5 TRACKED", detail: "Closest approach 1.2 LD · monitoring", time: "01:08 UTC", severity: "info", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { id: "6", title: "DEEP SPACE NETWORK", detail: "DSS-43 acquired Voyager 1 carrier", time: "live", severity: "success", icon: <Radio className="h-3.5 w-3.5" /> },
];

export function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>(SEED);

  useEffect(() => {
    const id = setInterval(() => {
      const id = crypto.randomUUID();
      const pool: Alert[] = [
        { id, title: "STARLINK GROUP 12-3", detail: "60 satellites deployed · orbit nominal", time: "now", severity: "success", icon: <Satellite className="h-3.5 w-3.5" /> },
        { id, title: "AURORA OVAL EXPANDED", detail: "Visible to 50°N · Kp rising", time: "now", severity: "warn", icon: <Waves className="h-3.5 w-3.5" /> },
        { id, title: "FALCON 9 STATIC FIRE", detail: "SLC-40 · countdown holding T-00:07", time: "now", severity: "info", icon: <Rocket className="h-3.5 w-3.5" /> },
      ];
      const a = pool[Math.floor(Math.random() * pool.length)];
      setAlerts((s) => [{ ...a, id }, ...s].slice(0, 8));
    }, 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass-panel flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-critical animate-blink" />
          <h3 className="font-display text-xs tracking-[0.3em]">LIVE EVENT FEED</h3>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">{alerts.length} ACTIVE</span>
      </div>

      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {alerts.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.35 }}
              className={`group relative overflow-hidden rounded-md border bg-black/40 p-3 ${
                a.severity === "critical" ? "border-critical/40 shadow-[0_0_18px_oklch(0.68_0.24_15/0.25)]" :
                a.severity === "warn" ? "border-gold/40" :
                a.severity === "success" ? "border-success/40" :
                "border-cyan/20"
              }`}
            >
              <div className="absolute left-0 top-0 h-full w-0.5"
                style={{ background: a.severity === "critical" ? "#FF4D6D" : a.severity === "warn" ? "#FFD166" : a.severity === "success" ? "#00E676" : "#00F5FF" }} />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`${a.severity === "critical" ? "text-critical" : a.severity === "warn" ? "text-gold" : a.severity === "success" ? "text-success" : "text-glow-cyan"}`}>{a.icon}</span>
                  <span className="font-display text-[11px] tracking-widest">{a.title}</span>
                </div>
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground">{a.time}</span>
              </div>
              <p className="mt-1 pl-5 text-[11px] text-muted-foreground">{a.detail}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
