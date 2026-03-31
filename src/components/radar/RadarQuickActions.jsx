import { Crosshair, Map, Play, Radar, CircleDot } from "lucide-react";

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
  onZoomIn,
  onZoomOut,
  onToggleRings,
  showRangeRings,
  onToggleLoop,
  isLooping,
}) {
  return (
    <div className="absolute left-3 top-28 z-[1000] flex w-[13rem] flex-col gap-2">
      <button
        onClick={onToggleShow}
        className="rounded-xl border border-white/10 bg-slate-950/88 px-3 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-900/90"
      >
        {show ? "Hide Tools" : "Show Tools"}
      </button>
      {show && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/74 p-2 shadow-2xl backdrop-blur-xl">
          <ActionButton icon={Radar} label="Hook Zone" onClick={onHookZone} />
          <ActionButton icon={Map} label="CONUS" onClick={onConus} />
          <ActionButton icon={Crosshair} label="Zoom In" onClick={onZoomIn} />
          <ActionButton icon={CircleDot} label="Zoom Out" onClick={onZoomOut} />
          <ActionButton icon={CircleDot} label={showRangeRings ? "Hide Rings" : "Show Rings"} onClick={onToggleRings} />
          <ActionButton icon={Play} label={isLooping ? "Stop Loop" : "Start Loop"} onClick={onToggleLoop} />
        </div>
      )}
    </div>
  );
}