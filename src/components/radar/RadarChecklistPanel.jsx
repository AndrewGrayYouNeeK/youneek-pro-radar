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

export default function RadarChecklistPanel({ items }) {
  return (
    <div className="pointer-events-none absolute right-3 top-[17.9rem] z-[1000] w-[12.5rem] space-y-2">
      <div className="rounded-2xl border border-white/10 bg-slate-950/82 px-3 py-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
          <ListChecks className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
          Checklist
        </div>
      </div>
      <div className="space-y-2 rounded-3xl border border-white/10 bg-slate-950/78 p-2 shadow-2xl backdrop-blur-xl">
        {items.map((item) => (
          <ChecklistItem key={item.label} done={item.done} label={item.label} />
        ))}
      </div>
    </div>
  );
}