import { CheckCircle2, Circle, ListChecks } from "lucide-react";

function ChecklistItem({ done, label }) {
  const Icon = done ? CheckCircle2 : Circle;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/78 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200 shadow-lg backdrop-blur-md">
      <Icon className={`h-3.5 w-3.5 ${done ? "text-emerald-300" : "text-slate-500"}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default function RadarChecklistPanel() {
  return null;
}