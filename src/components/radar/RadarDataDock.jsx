import { Database, Gauge, MapPinned, ScanLine } from "lucide-react";

function DockItem({ icon: Icon, label, value, accent = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/82 px-3 py-2 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${accent}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function RadarDataDock({ metrics, productLabel, station }) {
  return (
    <div className="pointer-events-none absolute bottom-[12.75rem] left-3 z-[1000] w-[13rem] space-y-2">
      <DockItem icon={Database} label="Station" value={station} accent="text-cyan-300" />
      <DockItem icon={ScanLine} label="Product" value={productLabel} accent="text-violet-300" />
      <DockItem icon={Gauge} label="Zoom / Focus" value={`${metrics.zoom} / ${metrics.focus}`} accent="text-emerald-300" />
      <DockItem icon={MapPinned} label="Center" value={`${metrics.latitude}°${metrics.latHemisphere} / ${metrics.longitude}°${metrics.lonHemisphere}`} accent="text-amber-300" />
    </div>
  );
}