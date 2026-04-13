const INTENSITY_SCALE = [
  { color: "#93c5fd", label: "Weak" },
  { color: "#4ade80", label: "Mod" },
  { color: "#facc15", label: "Heavy" },
  { color: "#ef4444", label: "Ext" },
];

export default function ProLegend({ productLabel }) {
  return (
    <div
      className="absolute z-[999] rounded-xl border border-white/10 bg-slate-950/78 px-3 py-2 shadow-lg backdrop-blur-md"
      style={{
        bottom: "calc(3.5rem + env(safe-area-inset-bottom))",
        left: "0.75rem",
      }}
      aria-label={`Radar intensity legend for ${productLabel}`}
    >
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {productLabel || "Radar"}
      </div>
      <div className="flex items-center gap-2">
        {INTENSITY_SCALE.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
            <span className="text-[9px] font-medium text-slate-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}