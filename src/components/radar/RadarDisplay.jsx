import { useRef, useEffect, useCallback, useState } from "react";

const THEME_COLORS = {
  green: { sweep: "#00ff88", ring: "#005533", text: "#00cc66", target: "#00ff88", bg: "#001a0d" },
  amber: { sweep: "#ffbb00", ring: "#553d00", text: "#cc9900", target: "#ffbb00", bg: "#1a1000" },
  blue:  { sweep: "#00ccff", ring: "#003355", text: "#0099cc", target: "#00ccff", bg: "#000d1a" },
};

export default function RadarDisplay({ targets, settings, onRadarClick, onTargetClick, reflImageUrl, velImageUrl, isTornadoWarning }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const sweepAngleRef = useRef(0);
  const lastTimeRef = useRef(null);
  const trailsRef = useRef([]);
  const [tornadoPulse, setTornadoPulse] = useState(0);

  // Pulsing sine-wave animation for tornado warning
  useEffect(() => {
    if (!isTornadoWarning) { setTornadoPulse(0); return; }
    const id = setInterval(() => {
      setTornadoPulse(Math.sin(Date.now() / 200) * 0.5 + 0.5);
    }, 50);
    return () => clearInterval(id);
  }, [isTornadoWarning]);

  const colors = THEME_COLORS[settings.theme] || THEME_COLORS.green;

  const draw = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) {
      animRef.current = requestAnimationFrame(draw);
      return;
    }
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) / 2 - 4;
    if (radius <= 0) {
      animRef.current = requestAnimationFrame(draw);
      return;
    }

    // Delta time
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Advance sweep
    const rpm = 1 / settings.sweepSpeed;
    sweepAngleRef.current = (sweepAngleRef.current + dt * rpm * 2 * Math.PI) % (2 * Math.PI);

    // Update trails
    trailsRef.current.push({ angle: sweepAngleRef.current, opacity: 0.7 });
    trailsRef.current = trailsRef.current
      .map((t) => ({ ...t, opacity: t.opacity - dt * 0.6 }))
      .filter((t) => t.opacity > 0);

    // --- Background ---
    ctx.fillStyle = colors.bg;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.clip();

    // NEXRAD overlay is rendered as an <img> tag in JSX below — no canvas drawing needed here.

    // --- Sweep trail (gradient arc) ---
    const trailLength = Math.PI / 2;
    const gradient = ctx.createConicalGradient
      ? null // not standard; we do it manually
      : null;

    // Draw sweep trail as thin filled arcs
    for (let i = 0; i < 30; i++) {
      const fraction = i / 30;
      const startA = sweepAngleRef.current - trailLength * (1 - fraction) - Math.PI / 2;
      const endA = sweepAngleRef.current - trailLength * (1 - (i + 1) / 30) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startA, endA);
      ctx.closePath();
      ctx.fillStyle = `${colors.sweep}${Math.floor(fraction * 40).toString(16).padStart(2, "0")}`;
      ctx.fill();
    }

    // --- Sweep line ---
    const sweepX = cx + radius * Math.cos(sweepAngleRef.current - Math.PI / 2);
    const sweepY = cy + radius * Math.sin(sweepAngleRef.current - Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = colors.sweep;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = colors.sweep;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // --- Range rings ---
    const numRings = 4;
    for (let i = 1; i <= numRings; i++) {
      const r = (radius / numRings) * i;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = colors.ring;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Range label
      const rangeVal = Math.round((settings.range / numRings) * i);
      ctx.fillStyle = colors.text;
      ctx.font = "10px monospace";
      ctx.fillText(`${rangeVal}nm`, cx + 4, cy - r + 12);
    }

    // --- Bearing lines (every 30°) ---
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg - 90) * (Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(rad), cy + radius * Math.sin(rad));
      ctx.strokeStyle = colors.ring;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Bearing labels at outer edge
      const labelR = radius - 14;
      ctx.fillStyle = colors.text;
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${deg}°`, cx + labelR * Math.cos(rad), cy + labelR * Math.sin(rad));
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // --- Center dot (pulses yellow during tornado warning) ---
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = colors.sweep;
    ctx.fill();

    // --- Tornado warning pulse ring ---
    if (isTornadoWarning && tornadoPulse > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, 18 + tornadoPulse * 10, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(255, 220, 0, ${tornadoPulse * 0.9})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(255, 200, 0, 0.8)";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // --- Targets ---
    targets.forEach((target) => {
      const bearingRad = (target.bearing - 90) * (Math.PI / 180);
      const r = (target.range / settings.range) * radius;
      const tx = cx + r * Math.cos(bearingRad);
      const ty = cy + r * Math.sin(bearingRad);

      // Glow
      ctx.shadowColor = colors.target;
      ctx.shadowBlur = 12;

      // Symbol based on type
      ctx.fillStyle = colors.target;
      ctx.strokeStyle = colors.target;
      ctx.lineWidth = 1.5;

      const type = target.type || "unknown";
      if (type === "surface") {
        ctx.beginPath();
        ctx.rect(tx - 5, ty - 5, 10, 10);
        ctx.stroke();
      } else if (type === "air") {
        ctx.beginPath();
        ctx.moveTo(tx, ty - 6);
        ctx.lineTo(tx + 5, ty + 4);
        ctx.lineTo(tx - 5, ty + 4);
        ctx.closePath();
        ctx.stroke();
      } else if (type === "subsurface") {
        ctx.beginPath();
        ctx.moveTo(tx, ty + 6);
        ctx.lineTo(tx + 5, ty - 4);
        ctx.lineTo(tx - 5, ty - 4);
        ctx.closePath();
        ctx.stroke();
      } else {
        // unknown - diamond
        ctx.beginPath();
        ctx.moveTo(tx, ty - 6);
        ctx.lineTo(tx + 5, ty);
        ctx.lineTo(tx, ty + 6);
        ctx.lineTo(tx - 5, ty);
        ctx.closePath();
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Label
      if (settings.showLabels && target.callsign) {
        ctx.fillStyle = colors.text;
        ctx.font = "10px monospace";
        ctx.fillText(target.callsign, tx + 8, ty - 4);
      }
    });

    ctx.restore();

    // --- Outer ring border ---
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = colors.ring;
    ctx.lineWidth = 2;
    ctx.stroke();

    animRef.current = requestAnimationFrame(draw);
  }, [targets, settings, colors]);

  useEffect(() => {
    lastTimeRef.current = null;
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const size = Math.min(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight, 700);
      canvas.width = size;
      canvas.height = size;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 4;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > radius) return;

    const rangeVal = (dist / radius) * settings.range;
    let bearingRad = Math.atan2(dy, dx) + Math.PI / 2;
    if (bearingRad < 0) bearingRad += 2 * Math.PI;
    const bearingDeg = (bearingRad * 180) / Math.PI;

    // Check if clicking near a target
    for (const target of targets) {
      const tBearingRad = (target.bearing - 90) * (Math.PI / 180);
      const tR = (target.range / settings.range) * radius;
      const tx = cx + tR * Math.cos(tBearingRad);
      const ty = cy + tR * Math.sin(tBearingRad);
      if (Math.sqrt((x - tx) ** 2 + (y - ty) ** 2) < 14) {
        onTargetClick(target);
        return;
      }
    }

    onRadarClick({
      bearing: Math.round(bearingDeg) % 360,
      range: Math.round(rangeVal * 10) / 10,
    });
  }, [targets, settings.range, onRadarClick, onTargetClick]);

  return (
    <div className="flex items-center justify-center w-full h-full" style={{ minHeight: 320 }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="cursor-crosshair rounded-full"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
    </div>
  );
}