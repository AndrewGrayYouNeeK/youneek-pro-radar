import { Crosshair, MapPinned, Ruler, ScanSearch } from "lucide-react";

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
  return (
    <div className="pointer-events-none absolute bottom-24 right-3 z-[1000] w-[12.5rem] space-y-2">
      <InspectorRow icon={Crosshair} label="Inspector" value={inspector.active ? "Live" : "Standby"} accent="text-emerald-300" />
      <InspectorRow icon={MapPinned} label="Lat / Lon" value={`${inspector.lat}, ${inspector.lon}`} />
      <InspectorRow icon={Ruler} label="Bearing / Range" value={`${inspector.bearing}° / ${inspector.range} mi`} accent="text-amber-300" />
      <InspectorRow icon={ScanSearch} label="Product" value={productLabel} accent="text-violet-300" />
    </div>
  );
}