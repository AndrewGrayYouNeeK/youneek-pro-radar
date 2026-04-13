import { AlertTriangle, Clock, MapPin, Navigation, Wind, X } from "lucide-react";

function ToolChip({ icon: IconComponent, label, value, accent = "text-cyan-300" }) {
  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/82 px-3.5 py-3 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/65">
        <IconComponent className={`h-3.5 w-3.5 ${accent}`} aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1.5 text-sm font-bold text-white sm:text-[15px]">{value}</div>
    </div>
  );
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStormInfo(storm, userLocation) {
  const params = storm?.properties?.parameters || {};
  const speedArr = params.tornadoMovingSpeed || params.windSpeed || [];
  const dirArr = params.tornadoMovingDirection || [];

  const speedStr = speedArr[0] || "";
  const speedMatch = speedStr.match(/(\d+)/);
  const speedMph = speedMatch ? parseInt(speedMatch[1], 10) : null;
  const direction = dirArr[0] || null;

  let distanceMi = null;
  let etaMinutes = null;

  if (userLocation) {
    const coords = storm?.geometry?.coordinates?.[0] || [];
    if (coords.length) {
      const avgLon = coords.reduce((s, [lon]) => s + lon, 0) / coords.length;
      const avgLat = coords.reduce((s, [, lat]) => s + lat, 0) / coords.length;
      const distKm = haversineKm(avgLat, avgLon, userLocation.lat, userLocation.lon);
      distanceMi = Math.round(distKm * 0.621371);
      if (speedMph > 1) {
        etaMinutes = Math.max(1, Math.round((distanceMi / speedMph) * 60));
      }
    }
  }

  return { speedMph, direction, distanceMi, etaMinutes };
}

export default function StormToolsPanel({ storm, userLocation, onClose }) {
  if (!storm) return null;

  const eventType = storm?.properties?.event || "Storm Warning";
  const headline = storm?.properties?.headline || eventType;
  const { speedMph, direction, distanceMi, etaMinutes } = getStormInfo(storm, userLocation);

  return (
    <div
      className="absolute z-[1100] rounded-2xl border border-red-400/20 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl"
      style={{
        top: "calc(4.5rem + env(safe-area-inset-top))",
        left: "0.75rem",
        right: "0.75rem",
        maxWidth: "28rem",
      }}
      role="dialog"
      aria-label={`Storm tracking: ${eventType}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Storm Tracking
          </div>
          <div className="mt-0.5 text-sm font-bold text-white">{headline}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Close storm tracking panel"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ToolChip
          icon={Wind}
          label="Speed"
          value={speedMph ? `${speedMph} mph` : "Unknown"}
          accent="text-cyan-300"
        />
        <ToolChip
          icon={Navigation}
          label="Direction"
          value={direction || "Unknown"}
          accent="text-violet-400"
        />
        <ToolChip
          icon={MapPin}
          label="Distance"
          value={distanceMi !== null ? `${distanceMi} mi` : "—"}
          accent="text-amber-400"
        />
        <ToolChip
          icon={Clock}
          label="Est. Arrival"
          value={etaMinutes !== null ? `~${etaMinutes} min` : "—"}
          accent={etaMinutes !== null && etaMinutes < 15 ? "text-red-400" : "text-emerald-400"}
        />
      </div>
    </div>
  );
}