import { Crosshair, Gauge, Navigation, ScanSearch } from "lucide-react";

function ToolChip({ icon: IconComponent, label, value }) {
  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/82 px-3.5 py-3 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/65">
        <IconComponent className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1.5 text-sm font-bold text-white sm:text-[15px]">{value}</div>
    </div>
  );
}

export default function StormToolsPanel({ metrics, productLabel }) {
  return (
    <div className="pointer-events-none absolute bottom-24 left-3 right-24 z-[1000]">
      <div className="rounded-3xl border border-white/10 bg-slate-900/45 p-2 shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <ToolChip icon={ScanSearch} label="Product" value={productLabel} />
          <ToolChip icon={Navigation} label="Bearing" value={`${metrics.bearing}°`} />
          <ToolChip icon={Gauge} label="Range" value={`${metrics.range} mi`} />
          <ToolChip icon={Crosshair} label="Scan Focus" value={metrics.focus} />
        </div>
      </div>
    </div>
  );
}