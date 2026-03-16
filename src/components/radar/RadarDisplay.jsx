import { useEffect, useRef } from "react";
import L from "leaflet";
import { LocateFixed } from "lucide-react";
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

export default function RadarDisplay({ settings, showNexrad, isTornadoWarning }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const radarLayerRef = useRef(null);
  const velLayerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (leafletMap.current) return;

    const coords = STATION_COORDS[settings.station] || [39.83, -98.58];

    leafletMap.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(coords, 7);

    // Always-visible base map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(leafletMap.current);

    leafletMap.current.invalidateSize();
    leafletMap.current.setView([37.8, -85.5], 8);

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

    // Remove existing radar layers
    if (radarLayerRef.current) { leafletMap.current.removeLayer(radarLayerRef.current); radarLayerRef.current = null; }
    if (velLayerRef.current)   { leafletMap.current.removeLayer(velLayerRef.current);   velLayerRef.current = null; }
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    if (!showNexrad) return;

    // Reflectivity overlay
    radarLayerRef.current = L.tileLayer.wms(
      "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi?",
      {
        layers: "nexrad-n0q",
        format: "image/png",
        transparent: true,
        opacity: 0.7,
        attribution: "Iowa Mesonet",
      }
    ).addTo(leafletMap.current);

    // Velocity overlay
    if (settings.showVelocity) {
      velLayerRef.current = L.tileLayer.wms(
        "https://mapservices.weather.noaa.gov/eventdriven/services/radar/radar_velocity/MapServer/WMSServer",
        {
          layers: "0",
          format: "image/png",
          transparent: true,
          opacity: 0.6,
        }
      ).addTo(leafletMap.current);
    }

    // Auto-refresh every 5 minutes
    refreshTimerRef.current = setInterval(() => {
      if (radarLayerRef.current?.redraw) {
        radarLayerRef.current.redraw();
      }
      if (velLayerRef.current?.redraw) {
        velLayerRef.current.redraw();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshTimerRef.current);
  }, [showNexrad, settings.showVelocity]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Browser won't let me find you—turn on location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        leafletMap.current.setView([latitude, longitude], 12);

        if (userLocationMarkerRef.current) {
          leafletMap.current.removeLayer(userLocationMarkerRef.current);
        }

        userLocationMarkerRef.current = L.marker([latitude, longitude])
          .addTo(leafletMap.current)
          .bindPopup("You're here!")
          .openPopup();
      },
      () => alert("Couldn't get location—check permissions.")
    );
  };

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      {/* Tornado warning banner */}
      {isTornadoWarning && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-400 text-black text-xs font-mono font-bold px-4 py-1 rounded shadow-lg animate-pulse">
          ⚠ TORNADO WARNING ACTIVE
        </div>
      )}
      <button
        onClick={handleLocateMe}
        className="absolute bottom-24 right-5 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700"
        aria-label="Locate me"
      >
        <LocateFixed size={24} />
      </button>
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: 400 }} />
    </div>
  );
}