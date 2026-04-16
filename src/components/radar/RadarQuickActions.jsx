import { useEffect, useRef } from "react";
import { ChevronDown, Map, Layers } from "lucide-react";

function ActionButton({ icon: IconComponent, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-950/82 px-3 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-900/90"
    >
      <IconComponent className="h-4 w-4 text-cyan-300" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default function RadarQuickActions({
  show,
  onConus,
  onToggleLayers,
  onClose,
}) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add slight delay to prevent immediate closing when opening
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-[1000]"
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)' }}
    >
      <div className="w-[min(16rem,calc(100vw-3rem))] space-y-2 rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:bg-white/10"
          aria-label="Close toolbox"
        >
          <span>Radar Tools</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
        <ActionButton icon={Layers} label="Radar Layers" onClick={onToggleLayers} />
        <ActionButton icon={Map} label="Reset View" onClick={onConus} />
      </div>
    </div>
  );
}
