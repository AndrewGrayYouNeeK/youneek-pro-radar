import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// NEXRAD station coordinates for centering the map
const STATION_COORDS = {
  KOKX: [40.866, -72.864], KBOX: [41.956, -71.137], KBGM: [42.200, -75.985],
  KBUF: [42.949, -78.737], KENX: [42.586, -74.064], KPBZ: [40.532, -80.218],
  KCCX: [40.923, -78.004], KDIX: [39.947, -74.411], KCBW: [46.039, -67.806],
  KGYX: [43.891, -70.257], KDOX: [38.826, -75.440], KAKQ: [36.984, -77.007],
  KLWX: [38.975, -77.478], KFCX: [37.024, -80.274], KRNK: [37.000, -80.271],
  KFFC: [33.364, -84.566], KAMX: [25.611, -80.413], KTBW: [27.705, -82.402],
  KJAX: [30.485, -81.702], KCLX: [32.656, -81.042], KRAX: [35.665, -78.490],
  KMHX: [34.776, -76.876], KLTX: [33.989, -78.429], KGSP: [34.883, -82.220],
  KJGX: [32.675, -83.351], KVAX: [30.890, -83.002], KEVX: [30.564, -85.922],
  KMLB: [28.113, -80.654], KBYX: [24.597, -81.703], KIND: [39.708, -86.280],
  KILN: [39.420, -83.822], KLVX: [37.975, -85.944], KHPX: [36.737, -87.645],
  KJKL: [37.590, -83.313], KPAH: [37.068, -88.772], KOHX: [36.247, -86.563],
  KNQA: [35.345, -89.873], KHTX: [34.931, -86.084], KBMX: [33.172, -86.770],
  KGWX: [33.897, -88.329], KIWX: [41.408, -85.700], KLOT: [41.604, -88.085],
  KGRR: [42.894, -85.545], KAPX: [44.907, -84.720], KMKX: [42.968, -88.551],
  KDTX: [42.700, -83.472], KCLE: [41.413, -81.860], KDVN: [41.612, -90.581],
  KILX: [40.151, -89.337], KLSX: [38.699, -90.683], KEAX: [38.810, -94.264],
  KTWX: [38.997, -96.232], KICT: [37.655, -97.443], KDMX: [41.731, -93.723],
  KARX: [43.823, -91.191], KMPX: [44.849, -93.566], KDLH: [46.837, -92.210],
  KLZK: [34.836, -92.262], KTLX: [35.333, -97.278], KINX: [36.175, -95.565],
  KFWS: [32.573, -97.303], KSHV: [32.451, -93.841], KPOE: [31.155, -92.976],
  KLIX: [30.337, -89.825], KMOB: [30.679, -88.240], KSJT: [31.371, -100.493],
  KEWX: [29.704, -98.029], KCRP: [27.784, -97.511], KBRO: [25.916, -97.419],
  KHGX: [29.472, -95.079], KLCH: [30.125, -93.216], KABR: [45.456, -98.413],
  KBIS: [46.771, -100.760], KMBX: [48.393, -100.865], KFSD: [43.588, -96.729],
  KUEX: [40.321, -98.442], KOAX: [41.320, -96.367], KDDC: [37.761, -99.969],
  KAMA: [35.234, -101.709], KLBB: [33.654, -101.814], KMAF: [31.943, -102.189],
  KUDX: [44.125, -102.830], KGGW: [48.206, -106.625], KFTG: [39.787, -104.546],
  KPUX: [38.460, -104.182], KGJX: [39.062, -108.214], KIWA: [33.289, -111.670],
  KEMX: [31.894, -110.630], KABX: [35.150, -106.824], KFSX: [34.574, -111.198],
  KESX: [35.701, -114.891], KVTX: [34.412, -119.179], KHNX: [36.314, -119.632],
  KMUX: [37.155, -121.898], KBBX: [39.496, -121.632], KBHX: [40.498, -124.292],
  KMAX: [42.081, -122.717], KLGX: [47.117, -124.106], KATX: [47.520, -122.494],
  KRTX: [45.715, -122.965], KPDT: [45.691, -118.853], KOTX: [47.681, -117.627],
  KMSX: [47.041, -113.986], KTFX: [47.460, -111.385], KCBX: [43.491, -116.236],
};

const LOCAL_RADIO_STATIONS = [
  { lat: 37.591, lon: -83.313, url: "https://radio.weatherusa.net/NWR/WXL58.mp3" },
  { lat: 38.253, lon: -85.758, url: "https://radio.weatherusa.net/NWR/KIH43.mp3" },
  { lat: 37.068, lon: -88.772, url: "https://radio.weatherusa.net/NWR/WXK99.mp3" },
  { lat: 36.668, lon: -87.477, url: "https://radio.weatherusa.net/NWR/WXL24.mp3" },
  { lat: 39.103, lon: -84.512, url: "https://radio.weatherusa.net/NWR/WXK48.mp3" },
  { lat: 36.163, lon: -86.782, url: "https://radio.weatherusa.net/NWR/WXJ23.mp3" },
];

const NEXRAD_RADIO_FALLBACK = {
  KJKL: "https://radio.weatherusa.net/NWR/WXL58.mp3",
  KLVX: "https://radio.weatherusa.net/NWR/KIH43.mp3",
  KPAH: "https://radio.weatherusa.net/NWR/WXK99.mp3",
  KHPX: "https://radio.weatherusa.net/NWR/WXL24.mp3",
  KILN: "https://radio.weatherusa.net/NWR/WXK48.mp3",
  KOHX: "https://radio.weatherusa.net/NWR/WXJ23.mp3",
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestRadioUrl(lat, lon) {
  return LOCAL_RADIO_STATIONS.reduce((best, station) => {
    const distance = haversine(lat, lon, station.lat, station.lon);
    return distance < best.distance ? { url: station.url, distance } : best;
  }, { url: LOCAL_RADIO_STATIONS[0].url, distance: Infinity }).url;
}

export default function RadarDisplay({ settings, onSettingsChange, showNexrad, isTornadoWarning }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const radarLayerRef = useRef(null);
  const velLayerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const audioRef = useRef(null);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioUrl, setRadioUrl] = useState(
    NEXRAD_RADIO_FALLBACK[settings.station] || "https://radio.weatherusa.net/NWR/KIH43.mp3"
  );

  // Initialize map once
  useEffect(() => {
    if (leafletMap.current) return;

    const coords = STATION_COORDS[settings.station] || [39.83, -98.58];

    leafletMap.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(coords, 7);

    // Dark base tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: "abcd",
      maxZoom: 18,
    }).addTo(leafletMap.current);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => setRadioUrl(getNearestRadioUrl(position.coords.latitude, position.coords.longitude)),
      () => {},
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!audioRef.current || !radioUrl) return;

    audioRef.current.src = radioUrl;
    const playPromise = audioRef.current.play();

    if (playPromise?.then) {
      playPromise.then(() => setRadioPlaying(true)).catch(() => setRadioPlaying(false));
    } else {
      setRadioPlaying(true);
    }
  }, [radioUrl]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Pan map when station changes
  useEffect(() => {
    if (!leafletMap.current) return;
    const coords = STATION_COORDS[settings.station];
    if (coords) leafletMap.current.setView(coords, 7);
  }, [settings.station]);

  // Add/remove radar WMS layers
  useEffect(() => {
    if (!leafletMap.current) return;

    // Remove existing radar layers
    if (radarLayerRef.current) { leafletMap.current.removeLayer(radarLayerRef.current); radarLayerRef.current = null; }
    if (velLayerRef.current)   { leafletMap.current.removeLayer(velLayerRef.current);   velLayerRef.current = null; }
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    if (!showNexrad) return;

    // NOAA nowCOAST reflectivity mosaic WMS
    radarLayerRef.current = L.tileLayer.wms(
      "https://nowcoast.noaa.gov/geoserver/observations/weather_radar/wms",
      {
        layers: "conus_base_reflectivity_mosaic",
        format: "image/png",
        transparent: true,
        opacity: 0.75,
        version: "1.3.0",
        attribution: "NOAA/NWS",
      }
    ).addTo(leafletMap.current);

    // Velocity layer
    if (settings.showVelocity) {
      velLayerRef.current = L.tileLayer.wms(
        "https://nowcoast.noaa.gov/geoserver/observations/weather_radar/wms",
        {
          layers: "conus_radial_velocity_mosaic",
          format: "image/png",
          transparent: true,
          opacity: 0.65,
          version: "1.3.0",
        }
      ).addTo(leafletMap.current);
    }

    // Auto-refresh every 5 minutes
    refreshTimerRef.current = setInterval(() => {
      if (radarLayerRef.current) radarLayerRef.current.redraw();
      if (velLayerRef.current)   velLayerRef.current.redraw();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshTimerRef.current);
  }, [showNexrad, settings.showVelocity]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      {/* Tornado warning banner */}
      {isTornadoWarning && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-400 text-black text-xs font-mono font-bold px-4 py-1 rounded shadow-lg animate-pulse">
          ⚠ TORNADO WARNING ACTIVE
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: 400 }} />
    </div>
  );
}