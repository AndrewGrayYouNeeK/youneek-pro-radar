
import { MapPin, Navigation, Radar, ShieldAlert } from "lucide-react";

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
      className="pointer-events-none absolute left-3 z-[1000] grid grid-cols-2 gap-2"
      style={{ bottom: "calc(11rem + env(safe-area-inset-bottom))" }}
    >
      <DockItem
        icon={MapPin}
        label="Location"
        value={`${metrics.latitude}°${metrics.latHemisphere} ${metrics.longitude}°${metrics.lonHemisphere}`}
        accent="text-sky-400"
      />
      <DockItem
        icon={Radar}
        label="Station"
        value={station || "—"}
        accent="text-emerald-300"
      />
      <DockItem
        icon={Navigation}
        label="Zoom"
        value={`${metrics.zoom}×`}
        accent="text-amber-300"
      />
      <DockItem
        icon={ShieldAlert}
        label="Warnings"
        value={`${metrics.warnings} active`}
        accent={metrics.warnings > 0 ? "text-red-400" : "text-slate-400"}
      />
    </div>
  );
}
