import { Activity, AlertTriangle, Compass, Orbit } from "lucide-react";

function AnalysisPill({ icon: Icon, label, value, tone = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/75 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${tone}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function StormAnalysisStrip({ metrics }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-[8.9rem] z-[1000]">
      <div className="grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-slate-950/78 p-2 shadow-2xl backdrop-blur-xl md:grid-cols-4">
        <AnalysisPill icon={Activity} label="Storm Mode" value={metrics.stormMode} tone="text-red-300" />
        <AnalysisPill icon={Orbit} label="Scan Type" value={metrics.focus} tone="text-amber-300" />
        <AnalysisPill icon={Compass} label="Centerline" value={`${metrics.bearing}° / ${metrics.range} mi`} tone="text-emerald-300" />
        <AnalysisPill icon={AlertTriangle} label="Alert Stack" value={`${metrics.warnings} active`} tone="text-violet-300" />
      </div>
    </div>
  );
}