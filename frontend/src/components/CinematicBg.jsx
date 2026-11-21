import { useEffect, useRef } from "react";
import "./CinematicBg.css";

export default function CinematicBg() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let raf;

    const onMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 40;
      targetY = (e.clientY / window.innerHeight - 0.5) * 40;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      el.style.setProperty("--mx", `${currentX}px`);
      el.style.setProperty("--my", `${currentY}px`);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    loop();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cinematic-bg">
      <div className="cb-nebula" />
      <div className="cb-glow" />
      <div className="cb-vignette" />
      <div className="cb-grain" />
    </div>
  );
}