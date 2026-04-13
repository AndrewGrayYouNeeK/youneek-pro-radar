import { Activity, Crosshair, Eye, Navigation, Zap } from "lucide-react";

function AnalysisPill({ icon: Icon, label, value, tone = "text-cyan-300" }) {
  return (
    <div className="shrink-0 rounded-2xl border border-white/10 bg-slate-950/75 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${tone}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function StormAnalysisStrip({ metrics }) {
  if (!metrics) return null;

  const isWarning = metrics.stormMode?.includes("Warning");
  const isWatch = metrics.stormMode?.includes("Watch");
  const modeTone = isWarning ? "text-red-400" : isWatch ? "text-amber-400" : "text-cyan-300";

  return (
    <div
      className="absolute z-[1000] flex gap-2 overflow-x-auto pb-0.5"
      style={{
        left: "0.75rem",
        right: "4.5rem",
        bottom: "calc(12rem + env(safe-area-inset-bottom))",
      }}
      aria-label="Storm analysis data"
    >
      <AnalysisPill icon={Zap} label="Mode" value={metrics.stormMode} tone={modeTone} />
      <AnalysisPill icon={Navigation} label="Bearing" value={`${metrics.bearing}°`} />
      <AnalysisPill icon={Crosshair} label="Range" value={`${metrics.range} nm`} />
      <AnalysisPill icon={Eye} label="Focus" value={metrics.focus} />
      <AnalysisPill icon={Activity} label="Feed" value={metrics.refreshLabel} />
    </div>
  );
}