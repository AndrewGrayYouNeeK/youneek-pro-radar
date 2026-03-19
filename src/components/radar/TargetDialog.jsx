import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TARGET_TYPES = ["surface", "air", "subsurface", "unknown"];

export default function TargetDialog({ mode, initialData, target, onConfirm, onDelete, onClose }) {
  const [form, setForm] = useState({
    callsign: target?.callsign || "",
    type: target?.type || "unknown",
    bearing: target?.bearing ?? initialData?.bearing ?? 0,
    range: target?.range ?? initialData?.range ?? 0,
    notes: target?.notes || "",
  });

  const isInspect = mode === "inspect";

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      callsign: form.callsign || `C${Date.now().toString().slice(-4)}`,
      type: form.type,
      bearing: parseFloat(form.bearing),
      range: parseFloat(form.range),
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-80 p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-green-400 font-mono font-bold text-sm tracking-widest uppercase">
            {isInspect ? "Contact Data" : "New Contact"}
          </h2>
          <button onClick={onClose} aria-label="Close dialog" className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-800 hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Callsign */}
          <div>
            <Label className="text-gray-400 text-xs font-mono">CALLSIGN</Label>
            <Input
              value={form.callsign}
              onChange={(e) => setForm({ ...form, callsign: e.target.value })}
              placeholder="AUTO"
              readOnly={isInspect}
              className="bg-gray-800 border-gray-600 text-green-300 font-mono text-sm mt-1"
            />
          </div>

          {/* Type */}
          <div>
            <Label className="text-gray-400 text-xs font-mono">TYPE</Label>
            {isInspect ? (
              <div className="mt-1 text-green-300 font-mono text-sm uppercase">{form.type}</div>
            ) : (
              <div className="flex gap-2 mt-1 flex-wrap">
                {TARGET_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`min-h-11 px-3 py-2 text-xs font-mono rounded border transition-colors ${
                      form.type === t
                        ? "bg-green-900 border-green-500 text-green-300"
                        : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bearing / Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-400 text-xs font-mono">BEARING (°)</Label>
              <Input
                type="number"
                min={0}
                max={359}
                value={form.bearing}
                onChange={(e) => setForm({ ...form, bearing: e.target.value })}
                readOnly={isInspect}
                className="bg-gray-800 border-gray-600 text-green-300 font-mono text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-gray-400 text-xs font-mono">RANGE (nm)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={form.range}
                onChange={(e) => setForm({ ...form, range: e.target.value })}
                readOnly={isInspect}
                className="bg-gray-800 border-gray-600 text-green-300 font-mono text-sm mt-1"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-gray-400 text-xs font-mono">NOTES</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              readOnly={isInspect}
              className="bg-gray-800 border-gray-600 text-green-300 font-mono text-sm mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {isInspect ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  aria-label="Delete contact"
                  className="min-h-11 flex-1 font-mono text-xs"
                >
                  <Trash2 size={14} className="mr-1" /> DELETE
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="min-h-11 flex-1 font-mono text-xs border-gray-600 text-gray-300"
                >
                  CLOSE
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="submit"
                  size="sm"
                  aria-label="Plot contact"
                  className="min-h-11 flex-1 bg-green-800 hover:bg-green-700 text-green-100 font-mono text-xs"
                >
                  PLOT CONTACT
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  aria-label="Cancel new contact"
                  className="min-h-11 font-mono text-xs border-gray-600 text-gray-300"
                >
                  CANCEL
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}