export default function LiveCompass({ bearing = 0, followMode = false, onToggleFollow }) {
  const COMPASS_TICK_COUNT = 36;
  const normalizedBearing = Number.isFinite(bearing) ? ((bearing % 360) + 360) % 360 : 0;
  const direction = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(normalizedBearing / 45) % 8];
  const cardinals = [
    { label: "N", angle: 0, color: "text-red-400", bold: true },
    { label: "E", angle: 90, color: "text-slate-300", bold: false },
    { label: "S", angle: 180, color: "text-slate-300", bold: false },
    { label: "W", angle: 270, color: "text-slate-300", bold: false },
  ];

  return (
    <div
      className="absolute left-3 top-20 z-[1000] rounded-2xl border border-white/15 bg-slate-950/60 px-3 py-3 text-white shadow-2xl backdrop-blur-md"
      aria-label={`Live compass heading ${Math.round(normalizedBearing)} degrees ${direction}`}
    >
      <div className="flex items-center gap-3">
        {/* Compass rose */}
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-white/20 bg-slate-900/60" />
          {/* Tick marks */}
          {Array.from({ length: COMPASS_TICK_COUNT }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: i % 9 === 0 ? "2px" : "1px",
                height: i % 9 === 0 ? "7px" : "4px",
                top: "4px",
                left: "calc(50% - 1px)",
                transformOrigin: "bottom center",
                transform: `rotate(${i * 10}deg) translateY(0)`,
                backgroundColor: i % 9 === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
          {/* Cardinal labels */}
          {cardinals.map(({ label, angle, color, bold }) => {
            const rad = (angle - normalizedBearing) * Math.PI / 180;
            const r = 20;
            const x = Math.sin(rad) * r;
            const y = -Math.cos(rad) * r;
            return (
              <span
                key={label}
                className={`absolute text-[9px] font-bold leading-none pointer-events-none select-none ${color}`}
                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`, top: "50%", left: "50%" }}
              >
                {label}
              </span>
            );
          })}
          {/* Needle — north (red) */}
          <div
            className="absolute"
            style={{
              width: "3px",
              height: "22px",
              bottom: "50%",
              left: "calc(50% - 1.5px)",
              transformOrigin: "bottom center",
              transform: `rotate(${-normalizedBearing}deg)`,
              background: "linear-gradient(to top, transparent 0%, #ef4444 40%, #ef4444 100%)",
              borderRadius: "3px 3px 0 0",
              boxShadow: "0 0 6px rgba(239,68,68,0.7)",
              transition: "transform 200ms ease-out",
            }}
          />
          {/* Needle — south (white) */}
          <div
            className="absolute"
            style={{
              width: "3px",
              height: "18px",
              top: "50%",
              left: "calc(50% - 1.5px)",
              transformOrigin: "top center",
              transform: `rotate(${-normalizedBearing}deg)`,
              background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.7) 40%)",
              borderRadius: "0 0 3px 3px",
              transition: "transform 200ms ease-out",
            }}
          />
          {/* Center dot */}
          <div className="relative z-10 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        </div>

        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Compass</div>
          <div className="mt-1 text-lg font-bold leading-none text-white">{Math.round(normalizedBearing)}°</div>
          <div className="mt-0.5 text-xs font-medium text-slate-300">{direction}</div>
          <button
            type="button"
            onClick={onToggleFollow}
            className={`mt-2 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${followMode ? "bg-cyan-500/90 text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/15"}`}
          >
            {followMode ? "Follow: On" : "Follow: Off"}
          </button>
        </div>
      </div>
    </div>
  );
}