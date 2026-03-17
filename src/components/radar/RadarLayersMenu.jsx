import { useEffect, useMemo, useRef, useState } from "react";
import { Radio, Play, Pause, LocateFixed } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { LOCAL_STATIONS } from "./radioStations";
import RadioStationPicker from "./RadioStationPicker";
import AccountActions from "./AccountActions";

function ToggleRow({ label, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-white">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
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
    if (!isOpen) return;
    window.history.pushState({ radarLayersMenu: true }, "");
    const onPop = () => setIsOpen(false);
    window.addEventListener("popstate", onPop, { once: true });
    return () => window.removeEventListener("popstate", onPop);
  }, [isOpen]);

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
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        aria-label="Open layers menu"
      >
        <span className="text-xl">🗂️</span>
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
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Radio Station
                  </label>
                  <RadioStationPicker
                    stations={LOCAL_STATIONS}
                    selectedStationId={stationId}
                    onStationChange={setStationId}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-slate-300">
                    <Radio size={11} />
                    NOAA WEATHER RADIO
                  </div>
                  {isLocating && <LocateFixed size={12} className="animate-pulse text-green-400" />}
                </div>

                <div className="text-xs font-mono font-bold text-green-400">{station.label.replace(/^\w+\s/, "")}</div>
                <div className="text-xs font-mono text-slate-400">
                  {isLocating ? "Finding your nearest local stream..." : "Plays directly here in the menu."}
                </div>

                <button
                  onClick={togglePlayback}
                  aria-label={isPlaying ? "Stop radio playback" : "Start radio playback"}
                  className="flex w-full items-center justify-center gap-2 rounded border border-green-600 bg-green-900 px-3 py-2 text-xs font-mono text-green-300 transition-colors hover:bg-green-800"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  {isPlaying ? "STOP LOCAL NOAA" : "PLAY LOCAL NOAA"}
                </button>
              </div>
            )}

            <AccountActions />
          </div>
        </div>
      )}
    </div>
  );
}