import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Globe } from "@/components/Globe";
import { Starfield } from "@/components/Starfield";
import { AlertCenter } from "@/components/panels/AlertCenter";
import { CommandBar } from "@/components/panels/CommandBar";
import { ISSPanel } from "@/components/panels/ISSPanel";
import { ObjectTelemetry } from "@/components/panels/ObjectTelemetry";
import { TelemetryCharts } from "@/components/panels/TelemetryCharts";
import { ZenithRadar } from "@/components/panels/ZenithRadar";
import { useISS } from "@/lib/api/iss";
import { useOrbitra } from "@/store/orbitra";

export const Route = createFileRoute("/observatory")({
  head: () => ({
    meta: [
      { title: "Observatory · ORBITRA" },
      { name: "description", content: "Real-time space surveillance command center." },
    ],
  }),
  component: Observatory,
});

function Observatory() {
  const { location, setLocation, tick } = useOrbitra();
  const { data: iss } = useISS();

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Starfield density={0.6} parallax={false} />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

      <div className="relative grid h-full w-full grid-rows-[auto_1fr_auto] gap-3 p-3">
        <CommandBar />

        <div className="grid min-h-0 grid-cols-[320px_1fr_340px] gap-3">
          {/* LEFT */}
          <div className="flex min-h-0 flex-col gap-3">
            <div className="min-h-0 flex-1"><AlertCenter /></div>
          </div>

          {/* CENTER GLOBE */}
          <div className="glass-panel relative min-h-0 overflow-hidden">
            <Globe
              lat={location.lat}
              lon={location.lon}
              issLat={iss?.lat}
              issLon={iss?.lon}
              onPick={(la, lo) => setLocation({ name: `${la.toFixed(2)}°, ${lo.toFixed(2)}°`, lat: la, lon: lo })}
            />
            {/* HUD overlays */}
            <div className="pointer-events-none absolute left-4 top-4 font-mono text-[10px] tracking-widest text-glow-cyan">
              <div>EARTH · LIVE FEED</div>
              <div className="text-muted-foreground">PROJ: ORTHO · MODE: ZENITH</div>
            </div>
            <div className="pointer-events-none absolute right-4 top-4 text-right font-mono text-[10px] tracking-widest">
              <div className="text-glow-cyan">CONTACT: <span className="text-foreground">{location.name}</span></div>
              <div className="text-muted-foreground">{location.lat.toFixed(4)}° · {location.lon.toFixed(4)}°</div>
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] tracking-widest text-muted-foreground">
              ↻ CLICK GLOBE TO RETARGET · DRAG TO ROTATE · SCROLL TO ZOOM
            </div>
            <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 font-mono text-[10px] tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-blink" /> TELEMETRY OK
            </div>
            {/* Corner HUD brackets */}
            {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((p) => (
              <span key={p} className={`pointer-events-none absolute h-4 w-4 border-cyan/60 ${p}`} style={{
                borderTopWidth: p.includes("top") ? 1 : 0,
                borderBottomWidth: p.includes("bottom") ? 1 : 0,
                borderLeftWidth: p.includes("left") ? 1 : 0,
                borderRightWidth: p.includes("right") ? 1 : 0,
              }} />
            ))}
          </div>

          {/* RIGHT */}
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
            <ZenithRadar />
            <ISSPanel />
            <ObjectTelemetry />
          </div>
        </div>

        {/* BOTTOM */}
        <div className="h-44">
          <TelemetryCharts />
        </div>
      </div>

      {/* Ticker */}
      <div className="pointer-events-none absolute inset-x-0 top-[58px] overflow-hidden border-y border-cyan/15 bg-black/40 py-1 backdrop-blur-sm">
        <div className="animate-ticker whitespace-nowrap font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
          ◆ STARLINK-12 DEPLOY NOMINAL · ◆ KP INDEX 4.2 · ◆ AURORA BOREALIS PROBABILITY 78% · ◆ ISS PASS T-14:22 ELEV 78° · ◆ X1.2 FLARE FROM AR3664 · ◆ FALCON 9 STATIC FIRE COMPLETE · ◆ VOYAGER 1 SIGNAL ACQUIRED · ◆ NEO 2024 PT5 CLOSEST APPROACH 1.2 LD
        </div>
      </div>
    </div>
  );
}
