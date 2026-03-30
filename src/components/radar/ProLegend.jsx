import { CloudRain, Tornado, Waves, Snowflake, Wind } from "lucide-react";

function LegendItem({ icon: Icon, label, tone }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur-md">
      <Icon className={`h-3.5 w-3.5 ${tone}`} aria-hidden="true" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200">{label}</span>
    </div>
  );
}

export default function ProLegend({ productLabel }) {
  return (
    <div className="pointer-events-none absolute bottom-24 left-3 right-24 z-[1000]">
      <div className="flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-slate-950/78 p-2 shadow-2xl backdrop-blur-xl">
        <LegendItem icon={CloudRain} label={productLabel} tone="text-cyan-300" />
        <LegendItem icon={Tornado} label="Tornado" tone="text-red-300" />
        <LegendItem icon={Wind} label="Severe" tone="text-amber-300" />
        <LegendItem icon={Waves} label="Flood" tone="text-blue-300" />
        <LegendItem icon={Snowflake} label="Winter" tone="text-violet-300" />
      </div>
    </div>
  );
}