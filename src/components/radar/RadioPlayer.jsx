import { useEffect, useMemo, useRef, useState } from "react";
import { Radio, Play, Pause, LocateFixed } from "lucide-react";

const LOCAL_STATIONS = [
  { id: "WXL58", label: "Jackson, KY", lat: 37.591, lon: -83.313, streamUrl: "https://radio.weatherusa.net/NWR/WXL58.mp3" },
  { id: "WZ2523", label: "Frankfort, KY", lat: 38.2, lon: -84.873, streamUrl: "https://wxradio.org/KY-Frankfort-WZ2523" },
  { id: "KIH43", label: "Louisville, KY", lat: 38.253, lon: -85.758, streamUrl: "https://radio.weatherusa.net/NWR/KIH43.mp3" },
  { id: "WXK99", label: "Paducah, KY", lat: 37.068, lon: -88.772, streamUrl: "https://radio.weatherusa.net/NWR/WXK99.mp3" },
  { id: "WXL24", label: "Fort Campbell, KY", lat: 36.668, lon: -87.477, streamUrl: "https://radio.weatherusa.net/NWR/WXL24.mp3" },
  { id: "WXK48", label: "Cincinnati, OH", lat: 39.103, lon: -84.512, streamUrl: "https://radio.weatherusa.net/NWR/WXK48.mp3" },
  { id: "WXJ23", label: "Nashville, TN", lat: 36.163, lon: -86.782, streamUrl: "https://radio.weatherusa.net/NWR/WXJ23.mp3" },
];

const NEXRAD_FALLBACK = {
  KJKL: "WXL58",
  KLVX: "KIH43",
  KPAH: "WXK99",
  KHPX: "WXL24",
  KILN: "WXK48",
  KOHX: "WXJ23",
};

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

export default function RadioPlayer({ nexradStation }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [stationId, setStationId] = useState(NEXRAD_FALLBACK[nexradStation] || "WXL58");

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
    if (!isLocating && NEXRAD_FALLBACK[nexradStation]) {
      setStationId((current) => current || NEXRAD_FALLBACK[nexradStation]);
    }
  }, [isLocating, nexradStation]);

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
    <div className="border-t border-gray-700 p-3 space-y-2">
      <audio ref={audioRef} preload="none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-400 tracking-widest">
          <Radio size={11} />
          NOAA WEATHER RADIO
        </div>
        {isLocating && <LocateFixed size={12} className="text-green-400 animate-pulse" />}
      </div>

      <div className="text-green-400 text-xs font-mono font-bold">{station.label}</div>
      <div className="text-gray-500 text-xs font-mono">
        {isLocating ? "Finding your nearest local stream..." : "Plays directly here in the menu."}
      </div>

      <button
        onClick={togglePlayback}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-900 hover:bg-green-800 border border-green-600 text-green-300 text-xs font-mono rounded transition-colors"
      >
        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        {isPlaying ? "STOP LOCAL NOAA" : "PLAY LOCAL NOAA"}
      </button>
    </div>
  );
}