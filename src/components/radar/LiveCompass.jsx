export default function LiveCompass({ bearing = 0 }) {
  const normalizedBearing = Number.isFinite(bearing) ? ((bearing % 360) + 360) % 360 : 0;
  const direction = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(normalizedBearing / 45) % 8];

  return (
    <div
      className="absolute left-3 top-20 z-[1000] rounded-2xl border border-white/10 bg-slate-950/78 px-3 py-3 text-white shadow-lg backdrop-blur-sm"
      aria-label={`Live compass heading ${Math.round(normalizedBearing)} degrees ${direction}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-slate-900/80">
          <div className="absolute text-[10px] font-bold text-red-400" style={{ top: 4 }}>N</div>
          <div className="absolute text-[10px] font-semibold text-slate-300" style={{ right: 6 }}>E</div>
          <div className="absolute text-[10px] font-semibold text-slate-300" style={{ bottom: 4 }}>S</div>
          <div className="absolute text-[10px] font-semibold text-slate-300" style={{ left: 6 }}>W</div>
          <div
            className="absolute h-6 w-1 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] origin-bottom transition-transform duration-200"
            style={{ transform: `translateY(-6px) rotate(${normalizedBearing}deg)` }}
          />
          <div className="h-2.5 w-2.5 rounded-full bg-white" />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Compass</div>
          <div className="mt-1 text-lg font-bold leading-none text-white">{Math.round(normalizedBearing)}°</div>
          <div className="mt-1 text-xs font-medium text-slate-300">{direction}</div>
        </div>
      </div>
    </div>
  );
}