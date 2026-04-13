import { Crosshair, Layers3, Navigation, Target } from "lucide-react";

function InspectorRow({ icon: Icon, label, value, accent = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/78 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${accent}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

export default function RadarInspectorPanel({ inspector, productLabel }) {
  if (!inspector?.active) return null;

  return (
    <div
      className="absolute z-[1000] flex gap-2 overflow-x-auto pb-0.5"
      style={{
        left: "0.75rem",
        right: "4.5rem",
        bottom: "calc(8rem + env(safe-area-inset-bottom))",
      }}
      aria-label="Radar inspector panel"
    >
      <InspectorRow icon={Target} label="Latitude" value={`${inspector.lat}°`} />
      <InspectorRow icon={Target} label="Longitude" value={`${inspector.lon}°`} accent="text-sky-300" />
      <InspectorRow icon={Navigation} label="Bearing" value={`${inspector.bearing}°`} accent="text-violet-400" />
      <InspectorRow icon={Crosshair} label="Range" value={`${inspector.range} mi`} accent="text-emerald-400" />
      <InspectorRow icon={Layers3} label="Product" value={productLabel || "—"} accent="text-amber-400" />
    </div>
  );
}