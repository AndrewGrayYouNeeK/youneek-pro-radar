import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import MobileSelect from "@/components/mobile/MobileSelect";
import AccountActions from "./AccountActions";
import RadioControls from "./RadioControls";
import { RADAR_PRODUCTS } from "./radarProducts";

function ToggleRow({ label, checked, onCheckedChange, ariaLabel }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[13px] leading-tight text-white">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={ariaLabel || label} />
    </div>
  );
}

export default function RadarLayersMenu({
  showNexrad,
  showVelocity,
  showRadio,
  nexradStation,
  radarProduct,
  alertToggles,
  onShowNexradChange,
  onShowVelocityChange,
  onShowRadioChange,
  onAlertToggleChange,
  onRadarProductChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <div
      className="absolute z-[1000]"
      style={{ top: 'calc(0.75rem + env(safe-area-inset-top))', right: 'calc(0.75rem + env(safe-area-inset-right))' }}
    >
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        aria-label={isOpen ? "Close layers menu" : "Open layers menu"}
        title="Opens radar, warning, and radio controls"
      >
        <span className="text-xl" aria-hidden="true">🗂️</span>
      </button>

      {isOpen && (
        <div className="mt-2 w-[min(18rem,calc(100vw-1.5rem))] max-h-[calc(100vh-7.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Layers
          </div>
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Radar</div>
              <div className="flex gap-1.5">
                {[
                  { id: "reflectivity", icon: "🌧", label: "Rain" },
                  { id: "snow", icon: "❄️", label: "Snow" },
                  { id: "temperature", icon: "🌡", label: "Temp" },
                ].map(({ id, icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onRadarProductChange(id)}
                    className={`flex flex-1 flex-col items-center rounded-xl border py-2 text-[11px] font-semibold transition-colors ${
                      radarProduct === id
                        ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-300"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                    aria-pressed={radarProduct === id}
                    aria-label={`Switch to ${label} layer`}
                  >
                    <span className="text-base" aria-hidden="true">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
              <ToggleRow
                label="📡 Live NEXRAD"
                checked={showNexrad}
                onCheckedChange={onShowNexradChange}
                ariaLabel="Toggle live NEXRAD radar layer"
              />
              <ToggleRow
                label="🌀 Velocity"
                checked={showVelocity}
                onCheckedChange={onShowVelocityChange}
                ariaLabel="Switch to velocity mode"
              />
              <MobileSelect
                label="Radar Product"
                value={radarProduct}
                onChange={onRadarProductChange}
                options={RADAR_PRODUCTS.map((product) => ({ value: product.id, label: product.label }))}
                placeholder="Choose product"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <button
                type="button"
                onClick={() => setShowAlerts((value) => !value)}
                className="flex w-full items-center justify-between text-left"
                aria-label={showAlerts ? "Hide warning controls" : "Show warning controls"}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Warnings</div>
                {showAlerts ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {showAlerts && (
                <div className="mt-2 space-y-2">
                  <ToggleRow
                    label="🌪️ Tornado Warnings"
                    checked={alertToggles.tornado}
                    onCheckedChange={(value) => onAlertToggleChange("tornado", value)}
                    ariaLabel="Toggle tornado warnings layer"
                  />
                  <ToggleRow
                    label="⛈️ Severe Thunderstorm"
                    checked={alertToggles.severe}
                    onCheckedChange={(value) => onAlertToggleChange("severe", value)}
                    ariaLabel="Toggle severe thunderstorm warnings layer"
                  />
                  <ToggleRow
                    label="🌊 Flood Warnings"
                    checked={alertToggles.flood}
                    onCheckedChange={(value) => onAlertToggleChange("flood", value)}
                    ariaLabel="Toggle flood warnings layer"
                  />
                  <ToggleRow
                    label="❄️ Winter Advisories"
                    checked={alertToggles.winter}
                    onCheckedChange={(value) => onAlertToggleChange("winter", value)}
                    ariaLabel="Toggle winter advisories layer"
                  />
                </div>
              )}
            </div>

            <RadioControls showRadio={showRadio} onShowRadioChange={onShowRadioChange} />

            <AccountActions />
          </div>
        </div>
      )}
    </div>
  );
}