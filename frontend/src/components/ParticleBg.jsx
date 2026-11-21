import { useEffect, useRef } from "react";

const MOUSE_MODE = "repel";
const MOUSE_RADIUS = 260;

// Change to "attract" to make particles move towards the cursor.
function isDarkMode() {
  const els = [document.documentElement, document.body];
  return els.some(
    (el) =>
      el.classList.contains("dark") ||
      el.classList.contains("dark-mode") ||
      el.getAttribute("data-theme") === "dark"
  );
}

const THEMES = {
  dark: {
    dot: (a) => `rgba(255,255,255,${a})`,
    line: (a) => `rgba(255,255,255,${a})`,
  },
  light: {
    dot: (a) => `rgba(10,16,96,${a})`, 
    line: (a) => `rgba(40,70,190,${a})`, 
  },
};

export default function ParticleBg() {
  const canvasRef = useRef(null);
  const darkRef = useRef(isDarkMode());

  useEffect(() => {
    darkRef.current = isDarkMode(); 

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = window.innerWidth;
    let h = window.innerHeight;
    let raf;
    const mouse = { x: -9999, y: -9999, active: false };

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    // Distribute particles evenly across the entire screen using a jittered grid.
    const COUNT = Math.max(45, Math.min(110, Math.floor((w * h) / 14000)));
    const MAX_DIST = 150;
    const cols = Math.ceil(Math.sqrt(COUNT * (w / h)));
    const rows = Math.ceil(COUNT / cols);
    const cellW = w / cols;
    const cellH = h / rows;

    const particles = Array.from({ length: COUNT }, (_, i) => ({
      x: ((i % cols) + Math.random()) * cellW,
      y: (Math.floor(i / cols) + Math.random()) * cellH,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      pvx: 0, 
      pvy: 0,
      r: Math.random() * 2 + 1.2,
    }));

    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      for (const p of particles) {
        p.x *= nw / w;
        p.y *= nh / h;
      }
      w = nw;
      h = nh;
      setSize();
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = () => {
      const t = darkRef.current ? THEMES.dark : THEMES.light;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        // mouse push / pull
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < MOUSE_RADIUS && d > 0.1) {
            const force = 1 - d / MOUSE_RADIUS;
            const dir = MOUSE_MODE === "attract" ? -1 : 1;
            p.pvx += (dx / d) * force * dir * 0.6;
            p.pvy += (dy / d) * force * dir * 0.6;
          }
        }
        p.pvx *= 0.92;
        p.pvy *= 0.92;

        p.x += p.vx + p.pvx;
        p.y += p.vy + p.pvy;

        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx); }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy); }
      }

      // particle <-> particle lines
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < MAX_DIST) {
            ctx.strokeStyle = t.line((1 - d / MAX_DIST) * 0.6);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // cursor <-> particle lines
      if (mouse.active) {
        for (const p of particles) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < MOUSE_RADIUS * 1.3) {
            ctx.strokeStyle = t.line((1 - d / (MOUSE_RADIUS * 1.3)) * 0.8);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // dots
      for (const p of particles) {
        ctx.fillStyle = t.dot(0.9);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    // Detect theme changes without restarting the animation.
    const observer = new MutationObserver(() => {
      darkRef.current = isDarkMode();
    });
    const opts = { attributes: true, attributeFilter: ["class", "data-theme"] };
    observer.observe(document.documentElement, opts);
    observer.observe(document.body, opts);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}