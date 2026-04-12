
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

export default function StormAnalysisStrip() {
  return null;
}