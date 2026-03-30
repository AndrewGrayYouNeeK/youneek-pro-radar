export default function RadarRangeRings() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[150] flex items-center justify-center">
      <div className="relative h-[78vmin] w-[78vmin] max-h-[34rem] max-w-[34rem] rounded-full border border-slate-400/20 bg-slate-950/10 shadow-[0_0_80px_rgba(2,6,23,0.25)]">
        <div className="absolute inset-[16.66%] rounded-full border border-slate-400/15" />
        <div className="absolute inset-[33.33%] rounded-full border border-slate-400/15" />
        <div className="absolute inset-1/2 h-px -translate-y-1/2 bg-slate-400/15" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-400/15" />
        <span className="absolute left-1/2 top-3 -translate-x-1/2 text-[10px] font-semibold tracking-[0.18em] text-slate-300/75">N</span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-[0.18em] text-slate-300/75">E</span>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[0.18em] text-slate-300/75">S</span>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-[0.18em] text-slate-300/75">W</span>
        <span className="absolute right-[17%] top-1/2 -translate-y-8 text-[10px] text-slate-300/60">50 mi</span>
        <span className="absolute right-[34%] top-1/2 -translate-y-8 text-[10px] text-slate-300/60">100 mi</span>
        <span className="absolute right-[49%] top-1/2 -translate-y-8 text-[10px] text-slate-300/60">150 mi</span>
      </div>
    </div>
  );
}