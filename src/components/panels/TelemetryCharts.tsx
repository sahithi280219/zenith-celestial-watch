import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart } from "recharts";
import { useOrbitra } from "@/store/orbitra";

export function TelemetryCharts() {
  const { now } = useOrbitra();
  const kpData = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    t: `${String(i).padStart(2, "0")}h`,
    kp: Math.max(0, 2 + Math.sin(i / 2) * 2 + Math.cos(i / 5 + now.getMinutes() / 30) * 1.5 + Math.random() * 0.8),
  })), [now.getMinutes()]);

  const altData = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    t: i,
    alt: 408 + Math.sin(i / 3 + now.getSeconds() / 10) * 6,
  })), [now.getSeconds()]);

  return (
    <div className="grid grid-cols-3 gap-3 h-full">
      <Card title="KP INDEX · 24H" value={kpData[kpData.length - 1].kp.toFixed(2)} unit="kp" accent="#9D4EDD">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={kpData} margin={{ top: 4, right: 4, left: -28, bottom: -8 }}>
            <defs>
              <linearGradient id="kpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9D4EDD" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#9D4EDD" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#9D4EDD" strokeOpacity={0.08} />
            <XAxis dataKey="t" tick={{ fill: "#6b7a99", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7a99", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#050A1A", border: "1px solid #9D4EDD55", fontSize: 11 }} />
            <Area dataKey="kp" stroke="#9D4EDD" fill="url(#kpGrad)" strokeWidth={1.5} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card title="ISS ALTITUDE · 60M" value={altData[altData.length - 1].alt.toFixed(1)} unit="km" accent="#00F5FF">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={altData} margin={{ top: 4, right: 4, left: -28, bottom: -8 }}>
            <CartesianGrid stroke="#00F5FF" strokeOpacity={0.08} />
            <XAxis dataKey="t" tick={{ fill: "#6b7a99", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis domain={[400, 416]} tick={{ fill: "#6b7a99", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#050A1A", border: "1px solid #00F5FF55", fontSize: 11 }} />
            <Line dataKey="alt" stroke="#00F5FF" strokeWidth={1.8} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="VISIBILITY SCORE" value="87" unit="/100" accent="#FFD166">
        <div className="relative h-full w-full flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-full w-full">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#FFD16622" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="48" fill="none" stroke="#FFD166" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(87 / 100) * 301.6} 301.6`}
              transform="rotate(-90 60 60)"
              style={{ filter: "drop-shadow(0 0 6px #FFD166)" }}
            />
            <text x="60" y="58" textAnchor="middle" fill="#FFD166" fontFamily="Orbitron" fontSize="22">87</text>
            <text x="60" y="74" textAnchor="middle" fill="#6b7a99" fontSize="8" letterSpacing="2">CLEAR SKY</text>
          </svg>
        </div>
      </Card>
    </div>
  );
}

function Card({ title, value, unit, accent, children }: { title: string; value: string; unit: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel flex flex-col p-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-[10px] tracking-[0.25em] text-muted-foreground">{title}</span>
        <span className="font-mono text-xs" style={{ color: accent, textShadow: `0 0 8px ${accent}80` }}>{value}<span className="ml-1 text-muted-foreground">{unit}</span></span>
      </div>
      <div className="mt-1 h-[110px] flex-1">{children}</div>
    </div>
  );
}
