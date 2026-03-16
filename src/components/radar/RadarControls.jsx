import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const THEMES = [
  { id: "green", label: "GRN", color: "bg-green-500" },
  { id: "amber", label: "AMB", color: "bg-amber-500" },
  { id: "blue",  label: "BLU", color: "bg-blue-500" },
];

export default function RadarControls({ settings, onSettingsChange }) {
  const update = (key, value) => onSettingsChange({ ...settings, [key]: value });

  return (
    <div className="p-4 border-b border-gray-700 space-y-4">
      {/* Header */}
      <div className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
        Radar Controls
      </div>

      {/* Range */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs font-mono text-gray-400">RANGE</Label>
          <span className="text-xs font-mono text-green-400">{settings.range} nm</span>
        </div>
        <Slider
          min={5}
          max={200}
          step={5}
          value={[settings.range]}
          onValueChange={([v]) => update("range", v)}
          className="w-full"
        />
      </div>

      {/* Sweep Speed */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs font-mono text-gray-400">SWEEP</Label>
          <span className="text-xs font-mono text-green-400">{settings.sweepSpeed}s/rev</span>
        </div>
        <Slider
          min={1}
          max={10}
          step={0.5}
          value={[settings.sweepSpeed]}
          onValueChange={([v]) => update("sweepSpeed", v)}
          className="w-full"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono text-gray-400">LABELS</Label>
          <Switch
            checked={settings.showLabels}
            onCheckedChange={(v) => update("showLabels", v)}
          />
        </div>
      </div>

      {/* Theme */}
      <div>
        <Label className="text-xs font-mono text-gray-400 block mb-2">PHOSPHOR</Label>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => update("theme", t.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-mono transition-colors ${
                settings.theme === t.id
                  ? "border-gray-400 text-white"
                  : "border-gray-700 text-gray-500 hover:border-gray-500"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${t.color}`} />
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}