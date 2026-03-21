import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function MobileSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label || placeholder,
    [options, placeholder, value]
  );

  useEffect(() => {
    if (!open) return;
    window.history.pushState({ mobileSelect: true }, "");
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop, { once: true });
    return () => window.removeEventListener("popstate", onPop);
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-left text-sm text-white outline-none"
        >
          {selectedLabel}
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-white/10 bg-slate-950 text-white">
        <DrawerHeader>
          <DrawerTitle>{label}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[70vh] space-y-2 overflow-y-auto px-4 pb-6">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-label={`Choose ${option.label}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`min-h-11 w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                value === option.value
                  ? "border-green-500 bg-green-950 text-green-300"
                  : "border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}