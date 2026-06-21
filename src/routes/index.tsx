import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Globe2, Radio, Satellite, Sparkles } from "lucide-react";
import { Starfield } from "@/components/Starfield";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ORBITRA — Project Zenith: The Celestial Eye" },
      { name: "description", content: "Discover what exists directly above any point on Earth in real time." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Starfield density={1.3} />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />

      {/* Animated orbit rings behind hero */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[280, 380, 520, 700].map((r, i) => (
          <motion.div
            key={r}
            className="absolute rounded-full border border-cyan/15"
            style={{ width: r, height: r, left: -r / 2, top: -r / 2 }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 60 + i * 20, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_12px_#00F5FF]" />
          </motion.div>
        ))}
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl tracking-[0.5em] text-glow-cyan">ORBITRA</span>
          <span className="hidden md:inline font-mono text-[10px] tracking-widest text-muted-foreground">v0.9.1 · LIVE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-blink" />
          ALL SYSTEMS NOMINAL
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="rounded-full border border-cyan/30 bg-cyan/5 px-4 py-1 font-mono text-[10px] tracking-[0.3em] text-glow-cyan"
        >
          PROJECT ZENITH · THE CELESTIAL EYE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
          className="mt-6 font-display text-[clamp(3.5rem,11vw,9rem)] font-bold leading-none tracking-[0.06em]"
        >
          <span className="bg-gradient-to-b from-white via-cyan-200 to-cyan/40 bg-clip-text text-transparent" style={{ WebkitTextStroke: "1px rgba(0,245,255,0.1)" }}>
            ORBITRA
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }} className="mt-6 max-w-2xl font-display text-sm tracking-[0.3em] text-muted-foreground">
          DISCOVER WHAT EXISTS DIRECTLY ABOVE ANY POINT ON EARTH — IN REAL TIME.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-12">
          <Link
            to="/observatory"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md border border-cyan/50 bg-cyan/10 px-8 py-4 font-display text-sm tracking-[0.4em] text-glow-cyan transition hover:bg-cyan/20"
            style={{ boxShadow: "0 0 32px oklch(0.88 0.18 210 / 0.35), inset 0 0 24px oklch(0.88 0.18 210 / 0.1)" }}
          >
            <span className="relative z-10">ENTER OBSERVATORY</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition group-hover:translate-x-1" />
            <span className="absolute inset-0 bg-gradient-to-r from-cyan/0 via-cyan/30 to-cyan/0 opacity-0 transition group-hover:opacity-100" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-24 grid w-full grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Globe2, label: "Earth Pickability", value: "<1px" },
            { icon: Satellite, label: "Tracked Objects", value: "8,412" },
            { icon: Radio, label: "Data Latency", value: "0.4s" },
            { icon: Sparkles, label: "Celestial Bodies", value: "∞" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }}
              className="glass-panel relative overflow-hidden p-4 text-left"
            >
              <s.icon className="h-4 w-4 text-cyan" />
              <div className="mt-2 font-mono text-2xl text-glow-cyan">{s.value}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
              <span className="absolute -right-1 -top-1 h-12 w-12 rounded-full bg-cyan/10 blur-2xl" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <footer className="relative z-10 mt-20 flex items-center justify-between px-8 py-6 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
        <span>MISSION CONTROL · {new Date().getUTCFullYear()}</span>
        <span>LAT 0.000 LON 0.000 · ALT ∞ KM</span>
      </footer>
    </main>
  );
}
