import { PanelTopClose, PanelTopOpen } from "lucide-react";

export default function RadarOverlayToggle({ collapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="absolute right-3 top-28 z-[1100] rounded-xl border border-white/10 bg-slate-950/88 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-900/90"
      aria-label={collapsed ? "Show radar panels" : "Hide radar panels"}
    >
      <span className="flex items-center gap-2">
        {collapsed ? <PanelTopOpen className="h-4 w-4 text-cyan-300" /> : <PanelTopClose className="h-4 w-4 text-cyan-300" />}
        {collapsed ? "Show Panels" : "Hide Panels"}
      </span>
    </button>
  );
}