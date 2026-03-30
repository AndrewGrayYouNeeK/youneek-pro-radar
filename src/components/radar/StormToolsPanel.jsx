import { Crosshair, Gauge, Navigation, ScanSearch } from "lucide-react";

function ToolChip({ icon: IconComponent, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/75 px-3 py-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default function StormToolsPanel({ metrics, productLabel }) {
  return (
    <div className="absolute bottom-24 left-3 right-24 z-[1000] pointer-events-none">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <ToolChip icon={ScanSearch} label="Product" value={productLabel} />
        <ToolChip icon={Navigation} label="Bearing" value={`${metrics.bearing}°`} />
        <ToolChip icon={Gauge} label="Range" value={`${metrics.range} mi`} />
        <ToolChip icon={Crosshair} label="Scan Focus" value={metrics.focus} />
      </div>
    </div>
  );
}