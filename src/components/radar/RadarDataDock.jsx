import { Activity, AlertTriangle, Layers3, MapPin, ZoomIn } from "lucide-react";

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
  if (!metrics) return null;

  return (
    <div
      className="absolute z-[1000] flex gap-2 overflow-x-auto pb-0.5"
      style={{
        left: "0.75rem",
        right: "4.5rem",
        bottom: "calc(8rem + env(safe-area-inset-bottom))",
      }}
      aria-label="Radar data dock"
    >
      <DockItem icon={MapPin} label="Station" value={station || "—"} />
      <DockItem icon={Layers3} label="Product" value={productLabel || "—"} accent="text-violet-400" />
      <DockItem icon={ZoomIn} label="Zoom" value={metrics.zoom} accent="text-sky-400" />
      <DockItem
        icon={AlertTriangle}
        label="Alerts"
        value={metrics.warnings > 0 ? `${metrics.warnings} active` : "None"}
        accent={metrics.warnings > 0 ? "text-amber-400" : "text-slate-400"}
      />
      <DockItem icon={Activity} label="Status" value={metrics.inspectorStatus} accent="text-emerald-400" />
    </div>
  );
}