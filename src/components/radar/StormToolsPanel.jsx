
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

export default function StormToolsPanel() {
  return null;
}