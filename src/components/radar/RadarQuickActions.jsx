import { ChevronUp, Compass, Map, Play, Radar } from "lucide-react";

function ActionButton({ icon: IconComponent, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-950/82 px-3 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-900/90"
    >
      <IconComponent className="h-4 w-4 text-cyan-300" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default function RadarQuickActions({
  show,
  onToggleShow,
  onHookZone,
  onConus,
  onToggleLoop,
  isLooping,
  showCompass,
  onToggleCompass,
}) {
  return (
    <div
      className="absolute z-[1000]"
      style={{ top: 'calc(5.5rem + env(safe-area-inset-top))', right: 'calc(3.75rem + env(safe-area-inset-right))' }}
    >
      <button
        onClick={onToggleShow}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        aria-label={show ? "Close tools menu" : "Open tools menu"}
      >
        <span className="text-xl" aria-hidden="true">🧰</span>
      </button>
      {show && (
        <div className="mt-2 w-[min(14rem,calc(100vw-1.5rem))] space-y-2 rounded-2xl border border-white/10 bg-slate-950/74 p-2 shadow-2xl backdrop-blur-xl">
          <button
            onClick={onToggleShow}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:bg-white/10"
            aria-label="Hide toolbox"
          >
            <span>Toolbox</span>
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <ActionButton icon={Compass} label={showCompass ? "Hide Compass" : "Show Compass"} onClick={onToggleCompass} />
          <ActionButton icon={Radar} label="Hook Zone" onClick={onHookZone} />
          <ActionButton icon={Map} label="CONUS" onClick={onConus} />
          <ActionButton icon={Play} label={isLooping ? "Stop Loop" : "Start Loop"} onClick={onToggleLoop} />
        </div>
      )}
    </div>
  );
}