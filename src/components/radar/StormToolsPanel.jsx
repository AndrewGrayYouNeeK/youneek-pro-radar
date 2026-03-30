import { Crosshair, Gauge, Navigation, ScanSearch, Radar, Timer } from "lucide-react";

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

export default function StormToolsPanel({ metrics, productLabel }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-[4.65rem] z-[1000] space-y-2">
      <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/78 px-3 py-2 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Radar className="h-3.5 w-3.5" aria-hidden="true" />
            {productLabel}
          </div>
          <div className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
            {metrics.refreshLabel}
          </div>
          <div>{metrics.focus} Scan</div>
        </div>
      </div>

      <div className="mr-16 rounded-3xl border border-white/10 bg-slate-900/45 p-2 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <ToolChip icon={ScanSearch} label="Product" value={productLabel} />
          <ToolChip icon={Navigation} label="Bearing" value={`${metrics.bearing}°`} />
          <ToolChip icon={Gauge} label="Range" value={`${metrics.range} mi`} accent="text-emerald-300" />
          <ToolChip icon={Crosshair} label="Tilt Focus" value={metrics.focus} accent="text-amber-300" />
        </div>
      </div>
    </div>
  );
}