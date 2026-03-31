import { CloudRain, Tornado, Waves, Snowflake, Wind } from "lucide-react";

function LegendItem({ icon: Icon, label, tone }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur-md">
      <Icon className={`h-3.5 w-3.5 ${tone}`} aria-hidden="true" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200">{label}</span>
    </div>
  );
}

export default function ProLegend() {
  return null;
}