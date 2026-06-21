import { useEffect, useRef } from "react";

/**
 * Animated starfield background using canvas2D - lightweight, parallax, mouse-reactive.
 */
export function Starfield({ density = 1, parallax = true }: { density?: number; parallax?: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const count = Math.floor((w * h) / 9000 * density);
    const stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 0.9 + 0.1,
      r: Math.random() * 1.4 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));

    // a few colored nebula blobs
    const nebulae = Array.from({ length: 6 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 300 + 200,
      hue: Math.random() > 0.5 ? "#9D4EDD" : "#00F5FF",
    }));

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("resize", onResize);
    if (parallax) window.addEventListener("mousemove", onMove);

    const render = () => {
      ctx.fillStyle = "#03060f";
      ctx.fillRect(0, 0, w, h);

      // nebulae
      for (const n of nebulae) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, n.hue + "33");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      }

      const mx = mouse.current.x * 30 * devicePixelRatio;
      const my = mouse.current.y * 30 * devicePixelRatio;
      for (const s of stars) {
        s.tw += 0.02;
        const a = 0.5 + Math.sin(s.tw) * 0.5;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${200 + s.z * 55}, ${230 + s.z * 25}, 255, ${a})`;
        ctx.arc(s.x + mx * s.z, s.y + my * s.z, s.r * s.z, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [density, parallax]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
