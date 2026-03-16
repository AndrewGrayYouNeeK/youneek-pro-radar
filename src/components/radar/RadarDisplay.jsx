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

const RADIO_FEEDS = {
  KJKL: "27561", KLVX: "27562", KPAH: "27563", KHPX: "27564",
  KOHX: "24801", KNQA: "24802", KHTX: "24803",
  KILN: "22301", KIND: "22302", KCLE: "22303", KPBZ: "22304",
  KFFC: "21001", KAMX: "21002", KTBW: "21003", KJAX: "21004", KRAX: "21005", KGSP: "21006",
  KDIX: "20001", KOKX: "20002", KLWX: "20003", KBOX: "19001",
  KLSX: "18001", KLOT: "18002", KMPX: "18003", KDMX: "18004", KMKX: "18005",
  KTLX: "17001", KFWS: "17002", KHGX: "17003", KLIX: "17004", KEWX: "17005",
  KFTG: "16001", KICT: "16002", KEAX: "16003",
  KIWA: "15001", KEMX: "15002",
  KATX: "14001", KRTX: "14002",
  KVTX: "13001", KMUX: "13002",
  DEFAULT: "27561",
};

function getRadioUrl(station) {
  const feedId = RADIO_FEEDS[station] || RADIO_FEEDS.DEFAULT;
  return feedId ? `https://broadcastify.com/listen/feed/${feedId}` : null;
}

export default function RadarDisplay({ settings, showNexrad, isTornadoWarning }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const radarLayerRef = useRef(null);
  const velLayerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const [contacts, setContacts] = useState([]);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const audioRef = useRef(null);
  const radioUrl = getRadioUrl(settings.station);

  // Load contacts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("safeContacts");
    if (saved) {
      setContacts(JSON.parse(saved));
    }
  }, []);

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

  // Pan map when station changes
  useEffect(() => {
    if (!leafletMap.current) return;
    const coords = STATION_COORDS[settings.station];
    if (coords) leafletMap.current.setView(coords, 7);
  }, [settings.station]);

  // Add/remove radar WMS layers
  useEffect(() => {
    if (!leafletMap.current) return;

    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    // Remove reflectivity layer if showNexrad is off
    if (!showNexrad && radarLayerRef.current) {
      leafletMap.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    // Remove velocity layer
    if (velLayerRef.current) {
      leafletMap.current.removeLayer(velLayerRef.current);
      velLayerRef.current = null;
    }

    // Add reflectivity layer if showNexrad is on
    if (showNexrad && !radarLayerRef.current) {
      radarLayerRef.current = L.tileLayer.wms(
        "https://radar.weather.gov/arcgis/rest/services/radar/radar_base_reflectivity/MapServer/tile/{z}/{y}/{x}",
        {
          layers: "0",
          format: "png",
          transparent: true,
          opacity: 0.7,
          attribution: "NOAA",
        }
      ).addTo(leafletMap.current);
    }

    // Add velocity layer if both showNexrad and showVelocity are on
    if (showNexrad && settings.showVelocity) {
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
    if (showNexrad) {
      refreshTimerRef.current = setInterval(() => {
        if (radarLayerRef.current) radarLayerRef.current.redraw();
        if (velLayerRef.current) velLayerRef.current.redraw();
      }, 5 * 60 * 1000);
    }

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [showNexrad, settings.showVelocity]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setRadioPlaying(false);

    if (radioUrl) {
      audioRef.current = new Audio(radioUrl);
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "metadata";
    }

    return () => audioRef.current?.pause();
  }, [radioUrl]);

  const handleSafePing = () => {
    if (contacts.length === 0) {
      alert("Add contacts in Settings first!");
      return;
    }

    const center = leafletMap.current.getCenter();
    const lat = center.lat.toFixed(6);
    const lon = center.lng.toFixed(6);
    const message = `I'm safe after the storm. Location: https://maps.google.com/?q=${lat},${lon}`;

    contacts.forEach((phone) => {
      window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, "_blank");
    });

    alert("Sent! Your people know you're good.");
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      {/* Tornado warning banner */}
      {isTornadoWarning && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-400 text-black text-xs font-mono font-bold px-4 py-1 rounded shadow-lg animate-pulse">
          ⚠ TORNADO WARNING ACTIVE
        </div>
      )}

      {/* Radio Button */}
      <button
        onClick={() => {
          if (!audioRef.current) return alert("No stream for this station");
          if (radioPlaying) {
            audioRef.current.pause();
          } else {
            audioRef.current.play().catch(() => alert("Tap twice—browser blocks autoplay"));
          }
          setRadioPlaying(!radioPlaying);
        }}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: radioPlaying ? "#ff3333" : "#00ff00",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "24px",
          zIndex: 1000,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        }}
      >
        {radioPlaying ? "■" : "▶"}
      </button>

      {/* Safe Button */}
      <button
        onClick={() => {
          const lat = leafletMap.current.getCenter().lat.toFixed(5);
          const lon = leafletMap.current.getCenter().lng.toFixed(5);
          const msg = `I'm safe. Location: ${lat},${lon}`;
          window.open(`sms:+15551234567?body=${encodeURIComponent(msg)}`, "_blank");
        }}
        style={{
          position: "fixed",
          bottom: "100px",
          right: "20px",
          background: "#00aa00",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "none",
          zIndex: 1000,
        }}
      >
        I'm Safe
      </button>

      <div ref={mapRef} className="w-full h-full" style={{ minHeight: 400 }} />
    </div>
  );
}