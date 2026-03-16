import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, Wifi, WifiOff, LocateFixed } from "lucide-react";

const THEMES = [
  { id: "green", label: "GRN", color: "bg-green-500" },
  { id: "amber", label: "AMB", color: "bg-amber-500" },
  { id: "blue",  label: "BLU", color: "bg-blue-500" },
];

// Full WSR-88D station list with lat/lon for nearest-station calc
export const STATIONS = [
  // Northeast
  { id: "KOKX", label: "KOKX – New York City",      lat: 40.866, lon: -72.864 },
  { id: "KBOX", label: "KBOX – Boston",             lat: 41.956, lon: -71.137 },
  { id: "KBGM", label: "KBGM – Binghamton",         lat: 42.200, lon: -75.985 },
  { id: "KBUF", label: "KBUF – Buffalo",            lat: 42.949, lon: -78.737 },
  { id: "KENX", label: "KENX – Albany",             lat: 42.586, lon: -74.064 },
  { id: "KPBZ", label: "KPBZ – Pittsburgh",         lat: 40.532, lon: -80.218 },
  { id: "KCCX", label: "KCCX – State College",      lat: 40.923, lon: -78.004 },
  { id: "KDIX", label: "KDIX – Philadelphia",       lat: 39.947, lon: -74.411 },
  { id: "KCBW", label: "KCBW – Caribou ME",         lat: 46.039, lon: -67.806 },
  { id: "KGYX", label: "KGYX – Portland ME",        lat: 43.891, lon: -70.257 },
  // Mid-Atlantic
  { id: "KDOX", label: "KDOX – Dover DE",           lat: 38.826, lon: -75.440 },
  { id: "KAKQ", label: "KAKQ – Norfolk/Richmond",   lat: 36.984, lon: -77.007 },
  { id: "KLWX", label: "KLWX – Baltimore/DC",       lat: 38.975, lon: -77.478 },
  { id: "KFCX", label: "KFCX – Roanoke VA",         lat: 37.024, lon: -80.274 },
  { id: "KRNK", label: "KRNK – Blacksburg VA",      lat: 37.000, lon: -80.271 },
  // Southeast
  { id: "KFFC", label: "KFFC – Atlanta",            lat: 33.364, lon: -84.566 },
  { id: "KAMX", label: "KAMX – Miami",              lat: 25.611, lon: -80.413 },
  { id: "KTBW", label: "KTBW – Tampa Bay",          lat: 27.705, lon: -82.402 },
  { id: "KJAX", label: "KJAX – Jacksonville",       lat: 30.485, lon: -81.702 },
  { id: "KCLX", label: "KCLX – Charleston SC",      lat: 32.656, lon: -81.042 },
  { id: "KRAX", label: "KRAX – Raleigh",            lat: 35.665, lon: -78.490 },
  { id: "KMHX", label: "KMHX – Morehead City NC",   lat: 34.776, lon: -76.876 },
  { id: "KLTX", label: "KLTX – Wilmington NC",      lat: 33.989, lon: -78.429 },
  { id: "KGSP", label: "KGSP – Greenville SC",      lat: 34.883, lon: -82.220 },
  { id: "KJGX", label: "KJGX – Robins AFB GA",      lat: 32.675, lon: -83.351 },
  { id: "KVAX", label: "KVAX – Moody AFB GA",       lat: 30.890, lon: -83.002 },
  { id: "KEVX", label: "KEVX – Eglin AFB FL",       lat: 30.564, lon: -85.922 },
  { id: "KMLB", label: "KMLB – Melbourne FL",       lat: 28.113, lon: -80.654 },
  { id: "KBYX", label: "KBYX – Key West FL",        lat: 24.597, lon: -81.703 },
  // Ohio Valley / Kentucky
  { id: "KIND", label: "KIND – Indianapolis",       lat: 39.708, lon: -86.280 },
  { id: "KILN", label: "KILN – Cincinnati",         lat: 39.420, lon: -83.822 },
  { id: "KLVX", label: "KLVX – Louisville KY",      lat: 37.975, lon: -85.944 },
  { id: "KHPX", label: "KHPX – Fort Campbell KY",   lat: 36.737, lon: -87.645 },
  { id: "KJKL", label: "KJKL – Jackson KY",         lat: 37.590, lon: -83.313 },
  { id: "KPAH", label: "KPAH – Paducah KY",         lat: 37.068, lon: -88.772 },
  { id: "KOHX", label: "KOHX – Nashville",          lat: 36.247, lon: -86.563 },
  { id: "KNQA", label: "KNQA – Memphis",            lat: 35.345, lon: -89.873 },
  { id: "KHTX", label: "KHTX – Huntsville",         lat: 34.931, lon: -86.084 },
  { id: "KBMX", label: "KBMX – Birmingham",         lat: 33.172, lon: -86.770 },
  { id: "KGWX", label: "KGWX – Columbus MS",        lat: 33.897, lon: -88.329 },
  { id: "KIWX", label: "KIWX – N. Indiana",         lat: 41.408, lon: -85.700 },
  { id: "KLOT", label: "KLOT – Chicago",            lat: 41.604, lon: -88.085 },
  { id: "KGRR", label: "KGRR – Grand Rapids",       lat: 42.894, lon: -85.545 },
  { id: "KAPX", label: "KAPX – Gaylord MI",         lat: 44.907, lon: -84.720 },
  { id: "KMKX", label: "KMKX – Milwaukee",          lat: 42.968, lon: -88.551 },
  { id: "KDTX", label: "KDTX – Detroit",            lat: 42.700, lon: -83.472 },
  { id: "KCLE", label: "KCLE – Cleveland",          lat: 41.413, lon: -81.860 },
  // Midwest
  { id: "KDVN", label: "KDVN – Quad Cities",        lat: 41.612, lon: -90.581 },
  { id: "KILX", label: "KILX – Lincoln IL",         lat: 40.151, lon: -89.337 },
  { id: "KLSX", label: "KLSX – St. Louis",          lat: 38.699, lon: -90.683 },
  { id: "KEAX", label: "KEAX – Kansas City",        lat: 38.810, lon: -94.264 },
  { id: "KTWX", label: "KTWX – Topeka",             lat: 38.997, lon: -96.232 },
  { id: "KICT", label: "KICT – Wichita",            lat: 37.655, lon: -97.443 },
  { id: "KDMX", label: "KDMX – Des Moines",         lat: 41.731, lon: -93.723 },
  { id: "KARX", label: "KARX – La Crosse WI",       lat: 43.823, lon: -91.191 },
  { id: "KMPX", label: "KMPX – Minneapolis",        lat: 44.849, lon: -93.566 },
  { id: "KDLH", label: "KDLH – Duluth MN",          lat: 46.837, lon: -92.210 },
  // South Central
  { id: "KLZK", label: "KLZK – Little Rock",        lat: 34.836, lon: -92.262 },
  { id: "KTLX", label: "KTLX – Oklahoma City",      lat: 35.333, lon: -97.278 },
  { id: "KINX", label: "KINX – Tulsa",              lat: 36.175, lon: -95.565 },
  { id: "KFWS", label: "KFWS – Dallas/Fort Worth",  lat: 32.573, lon: -97.303 },
  { id: "KSHV", label: "KSHV – Shreveport",         lat: 32.451, lon: -93.841 },
  { id: "KPOE", label: "KPOE – Lake Charles",       lat: 31.155, lon: -92.976 },
  { id: "KLIX", label: "KLIX – New Orleans",        lat: 30.337, lon: -89.825 },
  { id: "KMOB", label: "KMOB – Mobile",             lat: 30.679, lon: -88.240 },
  { id: "KSJT", label: "KSJT – San Angelo TX",      lat: 31.371, lon: -100.493 },
  { id: "KEWX", label: "KEWX – San Antonio",        lat: 29.704, lon: -98.029 },
  { id: "KCRP", label: "KCRP – Corpus Christi",     lat: 27.784, lon: -97.511 },
  { id: "KBRO", label: "KBRO – Brownsville TX",     lat: 25.916, lon: -97.419 },
  { id: "KHGX", label: "KHGX – Houston",            lat: 29.472, lon: -95.079 },
  { id: "KLCH", label: "KLCH – Lake Charles LA",    lat: 30.125, lon: -93.216 },
  // High Plains
  { id: "KABR", label: "KABR – Aberdeen SD",        lat: 45.456, lon: -98.413 },
  { id: "KBIS", label: "KBIS – Bismarck",           lat: 46.771, lon: -100.760 },
  { id: "KMBX", label: "KMBX – Minot",              lat: 48.393, lon: -100.865 },
  { id: "KFSD", label: "KFSD – Sioux Falls",        lat: 43.588, lon: -96.729 },
  { id: "KUEX", label: "KUEX – Hastings NE",        lat: 40.321, lon: -98.442 },
  { id: "KOAX", label: "KOAX – Omaha",              lat: 41.320, lon: -96.367 },
  { id: "KDDC", label: "KDDC – Dodge City",         lat: 37.761, lon: -99.969 },
  { id: "KAMA", label: "KAMA – Amarillo",           lat: 35.234, lon: -101.709 },
  { id: "KLBB", label: "KLBB – Lubbock TX",         lat: 33.654, lon: -101.814 },
  { id: "KMAF", label: "KMAF – Midland TX",         lat: 31.943, lon: -102.189 },
  { id: "KUDX", label: "KUDX – Rapid City SD",      lat: 44.125, lon: -102.830 },
  { id: "KGGW", label: "KGGW – Glasgow MT",         lat: 48.206, lon: -106.625 },
  // Mountain West / Southwest
  { id: "KFTG", label: "KFTG – Denver",             lat: 39.787, lon: -104.546 },
  { id: "KPUX", label: "KPUX – Pueblo CO",          lat: 38.460, lon: -104.182 },
  { id: "KGJX", label: "KGJX – Grand Junction",     lat: 39.062, lon: -108.214 },
  { id: "KIWA", label: "KIWA – Phoenix",            lat: 33.289, lon: -111.670 },
  { id: "KEMX", label: "KEMX – Tucson",             lat: 31.894, lon: -110.630 },
  { id: "KABX", label: "KABX – Albuquerque",        lat: 35.150, lon: -106.824 },
  { id: "KFSX", label: "KFSX – Flagstaff",          lat: 34.574, lon: -111.198 },
  { id: "KESX", label: "KESX – Las Vegas",          lat: 35.701, lon: -114.891 },
  { id: "KVTX", label: "KVTX – Los Angeles",        lat: 34.412, lon: -119.179 },
  { id: "KHNX", label: "KHNX – San Joaquin Valley", lat: 36.314, lon: -119.632 },
  { id: "KMUX", label: "KMUX – San Francisco",      lat: 37.155, lon: -121.898 },
  { id: "KBBX", label: "KBBX – Beale AFB CA",       lat: 39.496, lon: -121.632 },
  { id: "KBHX", label: "KBHX – Eureka CA",          lat: 40.498, lon: -124.292 },
  { id: "KMAX", label: "KMAX – Medford OR",         lat: 42.081, lon: -122.717 },
  { id: "KLGX", label: "KLGX – Langley Hill WA",    lat: 47.117, lon: -124.106 },
  // Northwest
  { id: "KATX", label: "KATX – Seattle",            lat: 47.520, lon: -122.494 },
  { id: "KRTX", label: "KRTX – Portland",           lat: 45.715, lon: -122.965 },
  { id: "KPDT", label: "KPDT – Pendleton OR",       lat: 45.691, lon: -118.853 },
  { id: "KOTX", label: "KOTX – Spokane",            lat: 47.681, lon: -117.627 },
  { id: "KMSX", label: "KMSX – Missoula",           lat: 47.041, lon: -113.986 },
  { id: "KTFX", label: "KTFX – Great Falls",        lat: 47.460, lon: -111.385 },
  { id: "KCBX", label: "KCBX – Boise ID",           lat: 43.491, lon: -116.236 },
  // Alaska
  { id: "PAEC", label: "PAEC – Bethel AK",          lat: 60.793, lon: -161.876 },
  { id: "PAPD", label: "PAPD – Fairbanks AK",       lat: 65.036, lon: -147.499 },
  { id: "PAHG", label: "PAHG – Anchorage AK",       lat: 60.726, lon: -151.351 },
  { id: "PAKC", label: "PAKC – King Salmon AK",     lat: 60.792, lon: -156.629 },
  { id: "PAIH", label: "PAIH – Middleton Is AK",    lat: 59.462, lon: -146.301 },
  // Hawaii / Pacific
  { id: "PHKI", label: "PHKI – South Kauai",        lat: 21.894, lon: -159.552 },
  { id: "PHMO", label: "PHMO – Molokai",            lat: 21.133, lon: -157.180 },
  { id: "PHKM", label: "PHKM – Kamuela HI",         lat: 20.125, lon: -155.778 },
  { id: "PHWA", label: "PHWA – South HI",           lat: 19.095, lon: -155.569 },
  // Puerto Rico / Guam
  { id: "TJUA", label: "TJUA – San Juan PR",        lat: 18.116, lon: -66.078 },
  { id: "PGUA", label: "PGUA – Guam",               lat: 13.454, lon: 144.811 },
];

// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestStation(lat, lon) {
  return STATIONS.reduce((best, s) => {
    const d = haversine(lat, lon, s.lat, s.lon);
    return d < best.dist ? { id: s.id, dist: d } : best;
  }, { id: STATIONS[0].id, dist: Infinity }).id;
}

export default function RadarControls({ settings, onSettingsChange, nexradStatus, onRefreshNexrad }) {
  const [geoLoading, setGeoLoading] = useState(false);
  const update = (key, value) => onSettingsChange({ ...settings, [key]: value });

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestStation(pos.coords.latitude, pos.coords.longitude);
        update("station", nearest);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="p-4 border-b border-gray-700 space-y-4">
      <div className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
        Radar Controls
      </div>

      {/* Live NEXRAD toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono text-gray-400 flex items-center gap-1">
            {settings.showNexrad ? <Wifi size={11} className="text-green-400" /> : <WifiOff size={11} />}
            LIVE NEXRAD
          </Label>
          <Switch
            checked={settings.showNexrad}
            onCheckedChange={(v) => update("showNexrad", v)}
          />
        </div>

        {settings.showNexrad && (
          <>
            {/* Velocity toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono text-gray-400">VELOCITY</Label>
              <Switch
                checked={settings.showVelocity}
                onCheckedChange={(v) => update("showVelocity", v)}
              />
            </div>

            {/* Station selector + geo button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-mono text-gray-400">STATION</Label>
                <button
                  onClick={handleGeolocate}
                  disabled={geoLoading}
                  title="Auto-select nearest station"
                  className="text-gray-500 hover:text-green-400 disabled:opacity-40 transition-colors"
                >
                  <LocateFixed size={12} className={geoLoading ? "animate-pulse" : ""} />
                </button>
              </div>
              <select
                value={settings.station}
                onChange={(e) => update("station", e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 text-green-300 font-mono text-xs rounded px-2 py-1"
              >
                {STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Status + refresh */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono ${
                nexradStatus === "ok" ? "text-green-400" :
                nexradStatus === "loading" ? "text-yellow-400" :
                nexradStatus === "error" ? "text-red-400" : "text-gray-500"
              }`}>
                {nexradStatus === "ok" ? "● LIVE" :
                 nexradStatus === "loading" ? "◌ LOADING" :
                 nexradStatus === "error" ? "✕ ERROR" : "○ OFFLINE"}
              </span>
              <button
                onClick={onRefreshNexrad}
                disabled={nexradStatus === "loading"}
                className="text-gray-400 hover:text-green-400 disabled:opacity-40 transition-colors"
                title="Refresh radar data"
              >
                <RefreshCw size={13} className={nexradStatus === "loading" ? "animate-spin" : ""} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Range */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs font-mono text-gray-400">RANGE</Label>
          <span className="text-xs font-mono text-green-400">{settings.range} nm</span>
        </div>
        <Slider min={5} max={200} step={5} value={[settings.range]}
          onValueChange={([v]) => update("range", v)} className="w-full" />
      </div>

      {/* Sweep Speed */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label className="text-xs font-mono text-gray-400">SWEEP</Label>
          <span className="text-xs font-mono text-green-400">{settings.sweepSpeed}s/rev</span>
        </div>
        <Slider min={1} max={10} step={0.5} value={[settings.sweepSpeed]}
          onValueChange={([v]) => update("sweepSpeed", v)} className="w-full" />
      </div>

      {/* Labels toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-mono text-gray-400">LABELS</Label>
        <Switch checked={settings.showLabels} onCheckedChange={(v) => update("showLabels", v)} />
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