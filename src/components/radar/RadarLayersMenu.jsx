import { useEffect, useMemo, useRef, useState } from "react";
import { Radio, Play, Pause, LocateFixed } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { LOCAL_STATIONS } from "./radioStations";
import MobileSelect from "@/components/mobile/MobileSelect";
import AccountActions from "./AccountActions";

function ToggleRow({ label, checked, onCheckedChange, ariaLabel }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[13px] leading-tight text-white">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={ariaLabel || label} />
    </div>
  );
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestStation(lat, lon) {
  return LOCAL_STATIONS.reduce((best, station) => {
    const distance = haversine(lat, lon, station.lat, station.lon);
    return distance < best.distance ? { station, distance } : best;
  }, { station: LOCAL_STATIONS[0], distance: Infinity }).station;
}

export default function RadarLayersMenu({
  showNexrad,
  showVelocity,
  showRadio,
  nexradStation,
  alertToggles,
  onShowNexradChange,
  onShowVelocityChange,
  onShowRadioChange,
  onAlertToggleChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [stationId, setStationId] = useState(LOCAL_STATIONS[0].id);

  const station = useMemo(
    () => LOCAL_STATIONS.find((item) => item.id === stationId) || LOCAL_STATIONS[0],
    [stationId]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = getNearestStation(position.coords.latitude, position.coords.longitude);
        setStationId(nearest.id);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = station.streamUrl;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise?.then) {
        playPromise.then(() => setIsPlaying(true));
      }
    }
  }, [station, isPlaying]);

  useEffect(() => {
    if (!showRadio && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [showRadio]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = audioRef.current.play();
    if (playPromise?.then) {
      playPromise.then(() => setIsPlaying(true));
      return;
    }

    setIsPlaying(true);
  };

  return (
    <div
      className="absolute z-[1000]"
      style={{ top: 'calc(0.75rem + env(safe-area-inset-top))', right: 'calc(0.75rem + env(safe-area-inset-right))' }}
    >
      <audio ref={audioRef} preload="none" />
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        aria-label={isOpen ? "Close layers menu" : "Open layers menu"}
        aria-description="Opens radar, warning, and radio controls"
        aria-hidden="false"
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
              <ToggleRow
                label="📻 Radio"
                checked={showRadio}
                onCheckedChange={onShowRadioChange}
                ariaLabel="Toggle weather radio"
              />
            </div>

            {showRadio && (
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-widest text-slate-300">
                    <Radio size={11} aria-hidden="true" />
                    NOAA WEATHER RADIO
                  </div>
                  {isLocating && <LocateFixed size={12} aria-hidden="true" className="animate-pulse text-green-400" />}
                </div>

                <MobileSelect
                  label="Radio Station"
                  value={stationId}
                  onChange={setStationId}
                  options={LOCAL_STATIONS.map((item) => ({ value: item.id, label: item.label }))}
                />

                <div className="text-xs font-mono font-bold text-green-400">{station.label.replace(/^\w+\s/, "")}</div>
                <div className="text-[11px] font-mono text-slate-400">
                  {isLocating ? "Finding your nearest local stream..." : "Plays directly here in the menu."}
                </div>

                <button
                  onClick={togglePlayback}
                  aria-label={isPlaying ? "Stop local NOAA weather radio" : "Play local NOAA weather radio"}
                  className="flex w-full items-center justify-center gap-2 rounded border border-green-600 bg-green-900 px-3 py-2 text-xs font-mono text-green-300 transition-colors hover:bg-green-800"
                >
                  {isPlaying ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
                  {isPlaying ? "STOP LOCAL NOAA" : "PLAY LOCAL NOAA"}
                </button>
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Warnings</div>
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

            <AccountActions />
          </div>
        </div>
      )}
    </div>
  );
}