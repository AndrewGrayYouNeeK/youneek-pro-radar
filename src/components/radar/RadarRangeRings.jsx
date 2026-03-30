export default function RadarRangeRings() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[150] flex items-center justify-center">
      <div className="relative h-[78vmin] w-[78vmin] max-h-[34rem] max-w-[34rem] rounded-full border border-cyan-300/25">
        <div className="absolute inset-[16.66%] rounded-full border border-cyan-300/20" />
        <div className="absolute inset-[33.33%] rounded-full border border-cyan-300/20" />
        <div className="absolute inset-1/2 h-px -translate-y-1/2 bg-cyan-300/20" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-300/20" />
        <span className="absolute left-1/2 top-3 -translate-x-1/2 text-[10px] font-semibold tracking-[0.18em] text-cyan-200/70">N</span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-[0.18em] text-cyan-200/70">E</span>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[0.18em] text-cyan-200/70">S</span>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold tracking-[0.18em] text-cyan-200/70">W</span>
        <span className="absolute right-[17%] top-1/2 -translate-y-8 text-[10px] text-cyan-200/60">50 mi</span>
        <span className="absolute right-[34%] top-1/2 -translate-y-8 text-[10px] text-cyan-200/60">100 mi</span>
        <span className="absolute right-[49%] top-1/2 -translate-y-8 text-[10px] text-cyan-200/60">150 mi</span>
      </div>
    </div>
  );
}