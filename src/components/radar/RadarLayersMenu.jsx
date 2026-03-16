import { useState } from "react";
import { Switch } from "@/components/ui/switch";

function ToggleRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-white">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function RadarLayersMenu({
  showNexrad,
  showVelocity,
  showRadio,
  alertToggles,
  onShowNexradChange,
  onShowVelocityChange,
  onShowRadioChange,
  onAlertToggleChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute right-3 top-3 z-[1000]">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        aria-label="Open layers menu"
      >
        <span className="text-xl">☰</span>
      </button>

      {isOpen && (
        <div className="mt-2 w-72 rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-md">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Layers
          </div>
          <div className="space-y-3">
            <ToggleRow label="📡 Live NEXRAD" checked={showNexrad} onCheckedChange={onShowNexradChange} />
            <ToggleRow label="🌀 Velocity" checked={showVelocity} onCheckedChange={onShowVelocityChange} />
            <ToggleRow
              label="🌪️ Tornado Warnings"
              checked={alertToggles.tornado}
              onCheckedChange={(value) => onAlertToggleChange("tornado", value)}
            />
            <ToggleRow
              label="⛈️ Severe Thunderstorm"
              checked={alertToggles.severe}
              onCheckedChange={(value) => onAlertToggleChange("severe", value)}
            />
            <ToggleRow
              label="🌊 Flood Warnings"
              checked={alertToggles.flood}
              onCheckedChange={(value) => onAlertToggleChange("flood", value)}
            />
            <ToggleRow
              label="❄️ Winter Advisories"
              checked={alertToggles.winter}
              onCheckedChange={(value) => onAlertToggleChange("winter", value)}
            />
            <ToggleRow label="📻 Radio" checked={showRadio} onCheckedChange={onShowRadioChange} />
          </div>
        </div>
      )}
    </div>
  )
}