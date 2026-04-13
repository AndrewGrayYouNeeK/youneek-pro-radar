import { Clock, Navigation, Wind, X, Zap } from "lucide-react";

const STORM_SPEED_HINT_MPH = 30;

function ToolChip({ icon: IconComponent, label, value, accent = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/82 px-3.5 py-3 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/65">
        <IconComponent className={`h-3.5 w-3.5 ${accent}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1.5 text-sm font-bold text-white sm:text-[15px]">{value}</div>
    </div>
  );
}

export default function StormToolsPanel({ stormTrack, onDismiss }) {
  if (!stormTrack) return null;

  const distanceLabel =
    stormTrack.distanceMi < 10
      ? `${stormTrack.distanceMi.toFixed(1)} mi`
      : `${Math.round(stormTrack.distanceMi)} mi`;
  const etaLabel =
    stormTrack.etaMin < 60
      ? `${stormTrack.etaMin} min`
      : `${(stormTrack.etaMin / 60).toFixed(1)} hr`;

  return (
    <div
      className="absolute z-[1001] flex flex-col gap-2 rounded-2xl border border-cyan-400/20 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md"
      style={{
        left: "calc(1rem + env(safe-area-inset-left))",
        bottom: "calc(9rem + env(safe-area-inset-bottom))",
        width: "min(18rem, calc(100vw - 2rem))",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          Storm Tracker
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss storm tracker"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ToolChip icon={Navigation} label="Bearing" value={`${stormTrack.bearing}°`} accent="text-cyan-300" />
        <ToolChip icon={Wind} label="Distance" value={distanceLabel} accent="text-amber-300" />
        <ToolChip icon={Clock} label="ETA" value={etaLabel} accent="text-rose-300" />
      </div>
      {stormTrack.etaMin <= 30 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs text-rose-300">
          ⚠️ Storm may reach your location within {stormTrack.etaMin} minutes.
        </div>
      )}
      <div className="text-[10px] text-slate-500">
        Tap any storm cell on the radar to track it. ETA assumes ~{STORM_SPEED_HINT_MPH} mph storm motion.
      </div>
    </div>
  );
}