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

const RADIO_STATIONS = [
  { value: "WXL58", label: "WXL58 Jackson KY" },
  { value: "WZ2523", label: "WZ2523 Frankfort KY" },
  { value: "KIH43", label: "KIH43 Louisville KY" },
  { value: "WXK99", label: "WXK99 Paducah KY" },
  { value: "WXL24", label: "WXL24 Fort Campbell KY" },
  { value: "WXK48", label: "WXK48 Cincinnati OH" },
  { value: "WXJ23", label: "WXJ23 Nashville TN" },
];

export default function RadarLayersMenu({
  showNexrad,
  showVelocity,
  showRadio,
  selectedStation,
  alertToggles,
  onShowNexradChange,
  onShowVelocityChange,
  onShowRadioChange,
  onStationChange,
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
            {showRadio && (
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Radio Station
                </label>
                <select
                  value={selectedStation}
                  onChange={(e) => onStationChange(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                >
                  {RADIO_STATIONS.map((station) => (
                    <option key={station.value} value={station.value}>
                      {station.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}