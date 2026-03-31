import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { LocateFixed } from "lucide-react";
import RadarLayersMenu from "./RadarLayersMenu";
import ShelterAlert from "./ShelterAlert";
import StormAnalysisStrip from "./StormAnalysisStrip";
import ProLegend from "./ProLegend";
import RadarInspectorPanel from "./RadarInspectorPanel";
import RadarQuickActions from "./RadarQuickActions";
import RadarDataDock from "./RadarDataDock";
import { getRadarProduct } from "./radarProducts";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const WORKER_BASE = "https://youneek-radar-worker.youneekartifacts.workers.dev";

const STATION_COORDS = {
  KOKX: [40.866, -72.864], KBOX: [41.956, -71.137], KBGM: [42.2, -75.985],
  KBUF: [42.949, -78.737], KENX: [42.586, -74.064], KPBZ: [40.532, -80.218],
  KCCX: [40.923, -78.004], KDIX: [39.947, -74.411], KCBW: [46.039, -67.806],
  KGYX: [43.891, -70.257], KDOX: [38.826, -75.44], KAKQ: [36.984, -77.007],
  KLWX: [38.975, -77.478], KFCX: [37.024, -80.274], KRNK: [37, -80.271],
  KFFC: [33.364, -84.566], KAMX: [25.611, -80.413], KTBW: [27.705, -82.402],
  KJAX: [30.485, -81.702], KCLX: [32.656, -81.042], KRAX: [35.665, -78.49],
  KMHX: [34.776, -76.876], KLTX: [33.989, -78.429], KGSP: [34.883, -82.22],
  KJGX: [32.675, -83.351], KVAX: [30.89, -83.002], KEVX: [30.564, -85.922],
  KMLB: [28.113, -80.654], KBYX: [24.597, -81.703], KIND: [39.708, -86.28],
  KILN: [39.42, -83.822], KLVX: [37.975, -85.944], KHPX: [36.737, -87.645],
  KJKL: [37.59, -83.313], KPAH: [37.068, -88.772], KOHX: [36.247, -86.563],
  KNQA: [35.345, -89.873], KHTX: [34.931, -86.084], KBMX: [33.172, -86.77],
  KGWX: [33.897, -88.329], KIWX: [41.408, -85.7], KLOT: [41.604, -88.085],
  KGRR: [42.894, -85.545], KAPX: [44.907, -84.72], KMKX: [42.968, -88.551],
  KDTX: [42.7, -83.472], KCLE: [41.413, -81.86], KDVN: [41.612, -90.581],
  KILX: [40.151, -89.337], KLSX: [38.699, -90.683], KEAX: [38.81, -94.264],
  KTWX: [38.997, -96.232], KICT: [37.655, -97.443], KDMX: [41.731, -93.723],
  KARX: [43.823, -91.191], KMPX: [44.849, -93.566], KDLH: [46.837, -92.21],
  KLZK: [34.836, -92.262], KTLX: [35.333, -97.278], KINX: [36.175, -95.565],
  KFWS: [32.573, -97.303], KSHV: [32.451, -93.841], KPOE: [31.155, -92.976],
  KLIX: [30.337, -89.825], KMOB: [30.679, -88.24], KSJT: [31.371, -100.493],
  KEWX: [29.704, -98.029], KCRP: [27.784, -97.511], KBRO: [25.916, -97.419],
  KHGX: [29.472, -95.079], KLCH: [30.125, -93.216], KABR: [45.456, -98.413],
  KBIS: [46.771, -100.76], KMBX: [48.393, -100.865], KFSD: [43.588, -96.729],
  KUEX: [40.321, -98.442], KOAX: [41.32, -96.367], KDDC: [37.761, -99.969],
  KAMA: [35.234, -101.709], KLBB: [33.654, -101.814], KMAF: [31.943, -102.189],
  KUDX: [44.125, -102.83], KGGW: [48.206, -106.625], KFTG: [39.787, -104.546],
  KPUX: [38.46, -104.182], KGJX: [39.062, -108.214], KIWA: [33.289, -111.67],
  KEMX: [31.894, -110.63], KABX: [35.15, -106.824], KFSX: [34.574, -111.198],
  KESX: [35.701, -114.891], KVTX: [34.412, -119.179], KHNX: [36.314, -119.632],
  KMUX: [37.155, -121.898], KBBX: [39.496, -121.632], KBHX: [40.498, -124.292],
  KMAX: [42.081, -122.717], KLGX: [47.117, -124.106], KATX: [47.52, -122.494],
  KRTX: [45.715, -122.965], KPDT: [45.691, -118.853], KOTX: [47.681, -117.627],
  KMSX: [47.041, -113.986], KTFX: [47.46, -111.385], KCBX: [43.491, -116.236],
};

const TILT_PRODUCTS = [
  { label: "0.5°", url: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-0/{z}/{x}/{y}.png" },
  { label: "1.5°", url: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N1Q-0/{z}/{x}/{y}.png" },
  { label: "2.4°", url: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N2Q-0/{z}/{x}/{y}.png" },
  { label: "3.4°", url: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N3Q-0/{z}/{x}/{y}.png" },
];

const getCacheBust = () => Math.floor(Date.now() / 120000);
const getRadarTileUrl = () => `${WORKER_BASE}/radar/{z}/{x}/{y}.png?_cb=${getCacheBust()}`;
const getAlertUrl = (type) => `${WORKER_BASE}/alerts?type=${type}`;
const getRainViewerTileUrl = (path) => {
  if (!path) return null;
  const normalizedPath = path.startsWith("/v2/radar/") ? path : `/v2/radar/${path}`;
  return `https://tilecache.rainviewer.com${normalizedPath}/256/{z}/{x}/{y}/2/1_1.png`;
};
const fetchLatestRainViewerTileUrl = async () => {
  const data = await (await fetch("https://api.rainviewer.com/public/weather-maps.json")).json();
  const latestPath = data?.radar?.past?.[data?.radar?.past?.length - 1]?.path;
  return getRainViewerTileUrl(latestPath);
};
const invalidateMapSize = (map) => {
  requestAnimationFrame(() => {
    if (!map || !map.getContainer?.() || !map._loaded) return;
    map.invalidateSize({ pan: false, animate: false });
  });

  setTimeout(() => {
    if (!map || !map.getContainer?.() || !map._loaded) return;
    map.invalidateSize({ pan: false, animate: false });
  }, 150);
};
const applyLeafletControlAccessibility = (container) => {
  const zoomInButton = container?.querySelector?.(".leaflet-control-zoom-in");
  const zoomOutButton = container?.querySelector?.(".leaflet-control-zoom-out");
  if (zoomInButton) { zoomInButton.setAttribute("aria-label", "Zoom in on radar"); zoomInButton.setAttribute("aria-description", "Double tap to enlarge the view"); }
  if (zoomOutButton) { zoomOutButton.setAttribute("aria-label", "Zoom out on radar"); zoomOutButton.setAttribute("aria-description", "Double tap to reduce the view"); }
};
function formatRainViewerTime(frame) {
  const timestamp = frame?.time || Number(String(frame?.path || "").match(/(\d{10})/)?.[1]);
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function getGeometryPoints(geometry) {
  if (!geometry?.coordinates) return [];
  const flattenCoords = (coords) => { if (!Array.isArray(coords[0])) return [coords]; return coords.flatMap(flattenCoords); };
  return flattenCoords(geometry.coordinates).filter((point) => Array.isArray(point) && point.length >= 2);
}
function isFeatureNearLocation(feature, userLocation, maxDistanceKm = 150) {
  const points = getGeometryPoints(feature?.geometry);
  return points.some(([lon, lat]) => haversineKm(lat, lon, userLocation.lat, userLocation.lon) <= maxDistanceKm);
}

export default function RadarDisplay({ settings, showNexrad, onSettingsChange, showRadio, onToggleRadio }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const radarLayerRef = useRef(null);
  const velLayerRef = useRef(null);
  const tornadoLayerRef = useRef(null);
  const thunderLayerRef = useRef(null);
  const floodLayerRef = useRef(null);
  const winterLayerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const loopTimerRef = useRef(null);
  const loopFadeRef = useRef(null);
  const loopLayersRef = useRef([]);
  const loopIndexRef = useRef(0);
  const loopLayerRef = useRef(null);
  const prevLoopLayerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const radarLoadStatsRef = useRef({ errors: 0, loaded: 0, usingFallback: false });

  const [showVelocityLocal, setShowVelocityLocal] = useState(settings.showVelocity);
  const [showTornado, setShowTornado] = useState(true);
  const [showThunderstorm, setShowThunderstorm] = useState(true);
  const [showFlood, setShowFlood] = useState(false);
  const [showWinter, setShowWinter] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [loopFrames, setLoopFrames] = useState([]);
  const [loopFrameIndex, setLoopFrameIndex] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTornadoWarning, setActiveTornadoWarning] = useState(true);
  const [activeTornadoWatch, setActiveTornadoWatch] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showQuickControls, setShowQuickControls] = useState(false);
  const [inspector, setInspector] = useState({ active: false, lat: "--", lon: "--", bearing: "--", range: "--" });
  const [stormReports, setStormReports] = useState([]);
  const [isStale, setIsStale] = useState(false);
  const [hookZones, setHookZones] = useState([]);
  const [dualPane, setDualPane] = useState(false);
  const [stormVectors, setStormVectors] = useState([]);
  const [tiltIndex, setTiltIndex] = useState(0);
  const [baseLayer, setBaseLayer] = useState('dark'); // dark | satellite
  const [mesoMarkers, setMesoMarkers] = useState([]);
  const [hailReports, setHailReports] = useState([]);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const stormMarkerGroupRef = useRef(null);
  const hookLayerGroupRef = useRef(null);
  const countyWarningLayerRef = useRef(null);
  const vectorLayerGroupRef = useRef(null);
  const mesoLayerGroupRef = useRef(null);
  const hailLayerGroupRef = useRef(null);
  const baseLayerRef = useRef(null);
  const mapRef2 = useRef(null);
  const leafletMap2 = useRef(null);
  const radarLayer2Ref = useRef(null);
  const lastRadarUpdateRef = useRef(Date.now());
  const staleTimerRef = useRef(null);

  const activeProduct = useMemo(() => getRadarProduct(settings.radarProduct), [settings.radarProduct]);
  const mapCenter = leafletMap.current?.getCenter();
  const activeWarningsCount = [showTornado, showThunderstorm, showFlood, showWinter].filter(Boolean).length;
  const stormMetrics = useMemo(() => ({
    bearing: Math.round((((mapCenter?.lng || -87.3) + 180) % 360 + 360) % 360),
    range: Math.max(8, Math.round((leafletMap.current?.getZoom() || 8) * 4.5)),
    focus: leafletMap.current?.getZoom() >= 10 ? "Tight" : leafletMap.current?.getZoom() >= 7 ? "Regional" : "Wide",
    refreshLabel: isLooping ? "Loop Active" : "Live Feed",
    latitude: mapCenter ? Math.abs(mapCenter.lat).toFixed(2) : "--",
    longitude: mapCenter ? Math.abs(mapCenter.lng).toFixed(2) : "--",
    latHemisphere: mapCenter?.lat >= 0 ? "N" : "S",
    lonHemisphere: mapCenter?.lng >= 0 ? "E" : "W",
    zoom: (leafletMap.current?.getZoom() || 8).toFixed(1),
    warnings: activeWarningsCount,
    inspectorStatus: inspector.active ? "Tracking" : "Standby",
    stormMode: activeTornadoWarning ? "Tornado Warning" : activeTornadoWatch ? "Tornado Watch" : "Monitor",
  }), [mapCenter, isLooping, activeWarningsCount, activeTornadoWarning, activeTornadoWatch]);

  const alertToggles = { tornado: showTornado, severe: showThunderstorm, flood: showFlood, winter: showWinter };
  const alertTogglesRef = useRef(alertToggles);

  useEffect(() => {
    if (leafletMap.current || !mapRef.current) return;
    const coords = STATION_COORDS[settings.station] || [37.8, -85.5];
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      touchZoom: true,
      bounceAtZoomLimits: false,
      minZoom: 4,
      maxZoom: 16,
    }).setView(coords, 8);
    const baseLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: "abcd", maxZoom: 20, crossOrigin: "anonymous"
    }).addTo(leafletMap.current);
    baseLayer.once("load", () => {
      setIsMapReady(true);
      invalidateMapSize(leafletMap.current);
    });
    requestAnimationFrame(() => applyLeafletControlAccessibility(mapRef.current));
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (loopFadeRef.current) clearInterval(loopFadeRef.current);
      [radarLayerRef, velLayerRef, tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef, userLocationMarkerRef, prevLoopLayerRef, loopLayerRef, stormMarkerGroupRef, hookLayerGroupRef, countyWarningLayerRef, vectorLayerGroupRef, mesoLayerGroupRef, hailLayerGroupRef, baseLayerRef].forEach((r) => {
        if (r.current && leafletMap.current?.hasLayer(r.current)) leafletMap.current.removeLayer(r.current);
        r.current = null;
      });
      loopLayersRef.current.forEach((l) => { if (leafletMap.current?.hasLayer(l)) leafletMap.current.removeLayer(l); });
      loopLayersRef.current = [];
      setIsMapReady(false);
      if (leafletMap.current) {
        const mapInstance = leafletMap.current;
        leafletMap.current = null;
        mapInstance.remove();
      }
    };
  }, [settings.station]);

  useEffect(() => {
    if (!leafletMap.current) return;
    const coords = STATION_COORDS[settings.station];
    if (coords) leafletMap.current.setView(coords, leafletMap.current.getZoom());
  }, [settings.station]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => setUserLocation({ lat: p.coords.latitude, lon: p.coords.longitude }));
  }, []);

  useEffect(() => { setShowVelocityLocal(settings.showVelocity); }, [settings.showVelocity]);
  useEffect(() => { alertTogglesRef.current = alertToggles; }, [alertToggles]);

  useEffect(() => {
    if (!document.getElementById("leaflet-velocity-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-velocity-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/leaflet-velocity@1.9.2/dist/leaflet-velocity.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-velocity-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-velocity-js";
      script.src = "https://cdn.jsdelivr.net/npm/leaflet-velocity@1.9.2/dist/leaflet-velocity.js";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;
    if (radarLayerRef.current) { leafletMap.current.removeLayer(radarLayerRef.current); radarLayerRef.current = null; }
    if (velLayerRef.current) { leafletMap.current.removeLayer(velLayerRef.current); velLayerRef.current = null; }
    [tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef].forEach((r) => {
      if (r.current) { leafletMap.current.removeLayer(r.current); r.current = null; }
    });
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    radarLoadStatsRef.current = { errors: 0, loaded: 0, usingFallback: false };
    if (!showNexrad) { setActiveTornadoWarning(false); return; }

    const addVelocityLayer = () => {
      if (velLayerRef.current) { leafletMap.current.removeLayer(velLayerRef.current); velLayerRef.current = null; }
      if (!showVelocityLocal || !leafletMap.current || settings.radarProduct === "velocity") return;
      velLayerRef.current = L.tileLayer(
        "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0U-0/{z}/{x}/{y}.png",
        { opacity: 0.35, transparent: true, crossOrigin: true, tileSize: 256, maxZoom: 16, maxNativeZoom: 12, attribution: "NEXRAD Velocity © Iowa Mesonet" }
      ).addTo(leafletMap.current);
    };

    const refreshAlertLayer = (layerRef, toggleKey, alertType, color) => {
      if (layerRef.current) { leafletMap.current.removeLayer(layerRef.current); layerRef.current = null; }
      if (!leafletMap.current || !showNexrad) return;
      fetch(getAlertUrl(alertType))
        .then((r) => r.json())
        .then((data) => {
          if (!leafletMap.current) return;
          if (toggleKey === "tornado") {
            const features = data?.features || [];
            setActiveTornadoWarning(Boolean(userLocation) && features.some((f) => isFeatureNearLocation(f, userLocation, 150)));
          }
          if (!alertTogglesRef.current[toggleKey]) return;
          layerRef.current = L.geoJSON(data, {
            style: { color, weight: 2, opacity: 0.95, fillColor: color, fillOpacity: 0.18 }
          }).addTo(leafletMap.current);
        });
    };

    const refreshAlertLayers = () => {
      refreshAlertLayer(tornadoLayerRef, "tornado", "tornado", "#ef4444");
      fetch(getAlertUrl("tornado_watch"))
        .then((r) => r.json())
        .then((data) => {
          const features = data?.features || [];
          setActiveTornadoWatch(Boolean(userLocation) && features.some((f) => isFeatureNearLocation(f, userLocation, 150)));
        });
      refreshAlertLayer(thunderLayerRef, "severe", "thunderstorm", "#f97316");
      refreshAlertLayer(floodLayerRef, "flood", "flood", "#3b82f6");
      refreshAlertLayer(winterLayerRef, "winter", "winter", "#a855f7");
    };

    const refreshGlobalRadarLayer = () => {
      const tileUrl = settings.radarProduct === "reflectivity" ? getRadarTileUrl() : activeProduct.tileUrl;
      if (radarLayerRef.current?.setUrl) {
        radarLayerRef.current.setUrl(tileUrl);
        radarLayerRef.current.setOpacity(activeProduct.opacity);
        return;
      }
      radarLayerRef.current = L.tileLayer(tileUrl, {
        attribution: "Radar data © Iowa Mesonet / RainViewer",
        opacity: activeProduct.opacity,
        maxZoom: 16,
        maxNativeZoom: activeProduct.maxNativeZoom || 12,
        crossOrigin: "anonymous",
      }).addTo(leafletMap.current);
    };

    refreshGlobalRadarLayer();
    addVelocityLayer();
    refreshAlertLayers();

    refreshTimerRef.current = setInterval(() => {
      refreshGlobalRadarLayer();
      if (velLayerRef.current?.redraw) velLayerRef.current.redraw();
      refreshAlertLayers();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshTimerRef.current);
      [radarLayerRef, velLayerRef, tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef, prevLoopLayerRef, loopLayerRef].forEach((r) => {
        if (r.current && leafletMap.current?.hasLayer(r.current)) leafletMap.current.removeLayer(r.current);
        r.current = null;
      });
      loopLayersRef.current.forEach((l) => { if (leafletMap.current?.hasLayer(l)) leafletMap.current.removeLayer(l); });
      loopLayersRef.current = [];
    };
  }, [showNexrad, settings.showVelocity, settings.radarProduct, activeProduct, showVelocityLocal, settings.station, showTornado, showThunderstorm, showFlood, showWinter, userLocation]);

  const handleHookZoneView = () => {
    if (!leafletMap.current) return;
    if (isLooping) { setIsLooping(false); clearLoopLayers(); }
    leafletMap.current.setView([36.8, -87.3], 9);
  };
  const handleConusView = () => {
    if (!leafletMap.current) return;
    if (isLooping) { setIsLooping(false); clearLoopLayers(); }
    leafletMap.current.setView([39.5, -98.35], 5);
  };
  const clearLoopLayers = () => {
    if (loopTimerRef.current) { clearTimeout(loopTimerRef.current); loopTimerRef.current = null; }
    if (loopFadeRef.current) { clearInterval(loopFadeRef.current); loopFadeRef.current = null; }
    if (leafletMap.current) loopLayersRef.current.forEach((l) => { if (leafletMap.current.hasLayer(l)) leafletMap.current.removeLayer(l); });
    loopLayersRef.current = []; loopLayerRef.current = null; prevLoopLayerRef.current = null;
    loopIndexRef.current = 0; setLoopFrameIndex(0);
    if (radarLayerRef.current?.setOpacity) radarLayerRef.current.setOpacity(0.7);
    if (velLayerRef.current?.setOpacity) velLayerRef.current.setOpacity(showVelocityLocal ? 0.6 : 0);
  };
  const fetchLoopFrames = () => {
    if (!leafletMap.current) return;
    clearLoopLayers();
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((data) => {
        const past = (data?.radar?.past || []).filter((i) => i?.path);
        const frames = past.slice(-6).map((i) => ({ path: i.path, label: formatRainViewerTime(i), typeLabel: "🟢 Reflectivity" }));
        const layers = [];
        const loadNext = (index) => {
          if (index >= frames.length || !leafletMap.current) {
            loopLayersRef.current = layers; loopIndexRef.current = 0;
            setLoopFrames(frames); setLoopFrameIndex(0);
            layers.forEach((l, i) => l.setOpacity(i === 0 ? 0.7 : 0));
            loopLayerRef.current = layers[0] || null; prevLoopLayerRef.current = null;
            if (radarLayerRef.current?.setOpacity) radarLayerRef.current.setOpacity(0);
            if (velLayerRef.current?.setOpacity) velLayerRef.current.setOpacity(0);
            setIsLooping(true); return;
          }
          const layer = L.tileLayer(getRainViewerTileUrl(frames[index].path), { opacity: 0, maxZoom: 16, maxNativeZoom: 12, crossOrigin: "anonymous", keepBuffer: 1 });
          const finish = () => { layers.push(layer); loadNext(index + 1); };
          layer.once("load", finish); layer.once("tileerror", finish);
          layer.addTo(leafletMap.current);
        };
        loadNext(0);
      });
  };
  const handleLoopToggle = () => { if (isLooping) { setIsLooping(false); clearLoopLayers(); return; } fetchLoopFrames(); };
  const handleShowNexradChange = (value) => onSettingsChange({ ...settings, showNexrad: value });
  const handleShowVelocityChange = (value) => { setShowVelocityLocal(value); onSettingsChange({ ...settings, showVelocity: value }); };
  const handleRadarProductChange = (value) => {
    onSettingsChange({ ...settings, radarProduct: value, showVelocity: value === "velocity" ? true : settings.showVelocity });
    if (value === "velocity") setShowVelocityLocal(true);
  };
  const handleAlertToggleChange = (key, value) => {
    if (key === "tornado") setShowTornado(value);
    if (key === "severe") setShowThunderstorm(value);
    if (key === "flood") setShowFlood(value);
    if (key === "winter") setShowWinter(value);
  };

  useEffect(() => {
    if (!leafletMap.current) return;
    const updateInspector = (event) => {
      const center = leafletMap.current.getCenter();
      const point = event.latlng;
      const latDiff = point.lat - center.lat;
      const lonDiff = point.lng - center.lng;
      const distance = haversineKm(center.lat, center.lng, point.lat, point.lng) * 0.621371;
      const bearing = (Math.atan2(lonDiff, latDiff) * 180 / Math.PI + 360) % 360;
      setInspector({
        active: true,
        lat: point.lat.toFixed(2),
        lon: point.lng.toFixed(2),
        bearing: Math.round(bearing),
        range: Math.max(1, Math.round(distance)),
      });
    };
    leafletMap.current.on("mousemove", updateInspector);
    return () => leafletMap.current?.off("mousemove", updateInspector);
  }, [leafletMap.current]);

  useEffect(() => {
    if (!leafletMap.current || !isLooping || !loopFrames.length || !loopLayersRef.current.length) return;
    if (radarLayerRef.current?.setOpacity) radarLayerRef.current.setOpacity(0);
    if (velLayerRef.current?.setOpacity) velLayerRef.current.setOpacity(0);
    const animateToNextFrame = () => {
      const currentIndex = loopIndexRef.current;
      const nextIndex = (currentIndex + 1) % loopLayersRef.current.length;
      const outgoing = loopLayersRef.current[currentIndex];
      const incoming = loopLayersRef.current[nextIndex];
      if (!outgoing || !incoming) return;
      prevLoopLayerRef.current = outgoing; loopLayerRef.current = incoming; incoming.setOpacity(0);
      let step = 0;
      if (loopFadeRef.current) clearInterval(loopFadeRef.current);
      loopFadeRef.current = setInterval(() => {
        step += 1; const p = Math.min(step / 8, 1);
        outgoing.setOpacity(0.7 * (1 - p)); incoming.setOpacity(0.7 * p);
        if (p >= 1) { clearInterval(loopFadeRef.current); loopFadeRef.current = null; outgoing.setOpacity(0); incoming.setOpacity(0.7); }
      }, 25);
      loopIndexRef.current = nextIndex; setLoopFrameIndex(nextIndex);
      loopTimerRef.current = setTimeout(animateToNextFrame, nextIndex === loopLayersRef.current.length - 1 ? 2000 : 900);
    };
    loopLayersRef.current.forEach((l, i) => l.setOpacity(i === loopIndexRef.current ? 0.7 : 0));
    setLoopFrameIndex(loopIndexRef.current);
    loopTimerRef.current = setTimeout(animateToNextFrame, loopIndexRef.current === loopLayersRef.current.length - 1 ? 2000 : 900);
    return () => {
      if (loopTimerRef.current) { clearTimeout(loopTimerRef.current); loopTimerRef.current = null; }
      if (loopFadeRef.current) { clearInterval(loopFadeRef.current); loopFadeRef.current = null; }
    };
  }, [isLooping, loopFrames]);

  // ── Storm cell / LSR fetcher ────────────────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    const STORM_ICON = (type) => {
      const colors = { TORNADO: '#ef4444', HAIL: '#3b82f6', WIND: '#f59e0b', TSTM: '#f97316' };
      const emojis = { TORNADO: '🌪️', HAIL: '🌨️', WIND: '💨', TSTM: '⛈️' };
      const color = colors[type] || '#94a3b8';
      const emoji = emojis[type] || '⚡';
      return L.divIcon({
        className: '',
        html: `<div style="
          background:${color}22;
          border:2px solid ${color};
          border-radius:50%;
          width:28px;height:28px;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;
          box-shadow:0 0 8px ${color}88;
          cursor:pointer;
        ">${emoji}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    const fetchStormReports = () => {
      // NWS Local Storm Reports (LSR) via Iowa State Mesonet GeoJSON
      fetch('https://mesonet.agron.iastate.edu/geojson/lsr.php?hours=3&wfo=all')
        .then(r => r.json())
        .then(data => {
          if (!leafletMap.current) return;
          // Clear old markers
          if (stormMarkerGroupRef.current) {
            leafletMap.current.removeLayer(stormMarkerGroupRef.current);
          }
          const group = L.layerGroup();
          const reports = [];
          (data?.features || []).forEach(feature => {
            const props = feature?.properties || {};
            const coords = feature?.geometry?.coordinates;
            if (!coords) return;
            const [lon, lat] = coords;
            const type = (props.type || '').toUpperCase().includes('TORNADO') ? 'TORNADO'
              : (props.type || '').toUpperCase().includes('HAIL') ? 'HAIL'
              : (props.type || '').toUpperCase().includes('WIND') ? 'WIND'
              : 'TSTM';
            const marker = L.marker([lat, lon], { icon: STORM_ICON(type), zIndexOffset: 500 });
            const time = props.valid ? new Date(props.valid).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
            const mag = props.magnitude ? ` — ${props.magnitude}` : '';
            marker.bindPopup(`<div style="font-family:sans-serif;min-width:160px">
              <strong style="color:#f97316">${type}</strong>${mag}<br/>
              <span style="font-size:11px;color:#888">${props.city || ''} ${props.state || ''}</span><br/>
              <span style="font-size:11px;color:#aaa">${time}</span>
            </div>`);
            marker.addTo(group);
            reports.push({ type, lat, lon, city: props.city, state: props.state, time });
          });
          group.addTo(leafletMap.current);
          stormMarkerGroupRef.current = group;
          setStormReports(reports);
          // Mark radar as fresh
          lastRadarUpdateRef.current = Date.now();
          setIsStale(false);
        })
        .catch(() => {}); // silently ignore network errors
    };

    fetchStormReports();
    const interval = setInterval(fetchStormReports, 5 * 60 * 1000);

    // Stale data detector — flag if no update in 12 minutes
    staleTimerRef.current = setInterval(() => {
      const minutesSince = (Date.now() - lastRadarUpdateRef.current) / 60000;
      setIsStale(minutesSince > 12);
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
      if (staleTimerRef.current) clearInterval(staleTimerRef.current);
      if (stormMarkerGroupRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(stormMarkerGroupRef.current);
      }
    };
  }, [isMapReady]);

  // ── Hook Echo / Rotation Zone Highlighter ───────────────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    // Pull NWS tornado warnings — the polygon IS the hook zone threat area
    // We also pull mesocyclone data from NWS storm attributes
    const fetchHookZones = () => {
      fetch('https://api.weather.gov/alerts/active?event=Tornado%20Warning&status=actual')
        .then(r => r.json())
        .then(data => {
          if (!leafletMap.current) return;

          // Clear old hook overlays
          if (hookLayerGroupRef.current) {
            leafletMap.current.removeLayer(hookLayerGroupRef.current);
          }
          const group = L.layerGroup();
          const zones = [];

          (data?.features || []).forEach(feature => {
            const props = feature?.properties || {};
            const geometry = feature?.geometry;
            if (!geometry?.coordinates) return;

            // Check if this warning mentions tornado — look for "TORNADO EMERGENCY" or "RADAR INDICATED ROTATION"
            const desc = (props.description || '').toUpperCase();
            const isTornadoEmergency = desc.includes('TORNADO EMERGENCY');
            const hasRotation = desc.includes('ROTATION') || desc.includes('HOOK') || desc.includes('MESOCYCLONE');

            const strokeColor = isTornadoEmergency ? '#ff00ff' : hasRotation ? '#ff3333' : '#ef4444';
            const fillColor = isTornadoEmergency ? '#ff00ff' : hasRotation ? '#ff3333' : '#ef4444';
            const strokeWeight = isTornadoEmergency ? 4 : hasRotation ? 3 : 2;
            const label = isTornadoEmergency ? '🚨 TORNADO EMERGENCY' : hasRotation ? '🌀 ROTATION DETECTED' : '⚠️ TORNADO WARNING';

            const layer = L.geoJSON(geometry, {
              style: {
                color: strokeColor,
                weight: strokeWeight,
                opacity: 1,
                fillColor: fillColor,
                fillOpacity: isTornadoEmergency ? 0.28 : hasRotation ? 0.22 : 0.14,
                dashArray: isTornadoEmergency ? null : '6 4',
              }
            });

            // Pulsing label marker at centroid
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
              const center = bounds.getCenter();
              const labelIcon = L.divIcon({
                className: '',
                html: `<div style="
                  background:${fillColor}22;
                  border:2px solid ${strokeColor};
                  border-radius:8px;
                  padding:3px 8px;
                  font-size:11px;
                  font-weight:700;
                  color:#fff;
                  white-space:nowrap;
                  backdrop-filter:blur(4px);
                  box-shadow:0 0 12px ${strokeColor}99;
                  animation:pulse 1.5s ease-in-out infinite;
                ">${label}</div>`,
                iconAnchor: [0, 0],
              });
              L.marker([center.lat, center.lng], { icon: labelIcon, zIndexOffset: 800, interactive: false }).addTo(group);
            }

            layer.bindPopup(`<div style="font-family:sans-serif;min-width:180px">
              <strong style="color:${strokeColor}">${label}</strong><br/>
              <span style="font-size:11px;color:#888">${props.areaDesc || ''}</span><br/>
              <span style="font-size:11px;color:#aaa">Expires: ${props.expires ? new Date(props.expires).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) : 'N/A'}</span>
            </div>`);
            layer.addTo(group);
            zones.push({ label, isTornadoEmergency, hasRotation });
          });

          group.addTo(leafletMap.current);
          hookLayerGroupRef.current = group;
          setHookZones(zones);
        })
        .catch(() => {});
    };

    fetchHookZones();
    const interval = setInterval(fetchHookZones, 3 * 60 * 1000); // refresh every 3 min
    return () => {
      clearInterval(interval);
      if (hookLayerGroupRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(hookLayerGroupRef.current);
      }
    };
  }, [isMapReady]);

  // ── County-Level Warning Polygons (precise geometry) ────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    const fetchCountyWarnings = () => {
      // Fetch ALL active severe weather alerts with exact polygon geometry
      Promise.all([
        fetch('https://api.weather.gov/alerts/active?event=Severe%20Thunderstorm%20Warning&status=actual').then(r => r.json()),
        fetch('https://api.weather.gov/alerts/active?event=Flash%20Flood%20Warning&status=actual').then(r => r.json()),
        fetch('https://api.weather.gov/alerts/active?event=Winter%20Storm%20Warning&status=actual').then(r => r.json()),
      ]).then(([severe, flood, winter]) => {
        if (!leafletMap.current) return;

        if (countyWarningLayerRef.current) {
          leafletMap.current.removeLayer(countyWarningLayerRef.current);
        }
        const group = L.layerGroup();

        const alertConfigs = [
          { data: severe, color: '#f97316', label: '⛈️ Severe T-Storm Warning' },
          { data: flood,  color: '#3b82f6', label: '🌊 Flash Flood Warning' },
          { data: winter, color: '#a855f7', label: '❄️ Winter Storm Warning' },
        ];

        alertConfigs.forEach(({ data, color, label }) => {
          (data?.features || []).forEach(feature => {
            const geometry = feature?.geometry;
            const props = feature?.properties || {};
            if (!geometry?.coordinates) return;

            L.geoJSON(geometry, {
              style: {
                color,
                weight: 2,
                opacity: 0.9,
                fillColor: color,
                fillOpacity: 0.12,
                dashArray: '4 3',
              }
            })
            .bindPopup(`<div style="font-family:sans-serif;min-width:160px">
              <strong style="color:${color}">${label}</strong><br/>
              <span style="font-size:11px;color:#888">${props.areaDesc || ''}</span><br/>
              <span style="font-size:11px;color:#aaa">Until: ${props.expires ? new Date(props.expires).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}) : 'N/A'}</span>
            </div>`)
            .addTo(group);
          });
        });

        group.addTo(leafletMap.current);
        countyWarningLayerRef.current = group;
      }).catch(() => {});
    };

    fetchCountyWarnings();
    const interval = setInterval(fetchCountyWarnings, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
      if (countyWarningLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(countyWarningLayerRef.current);
      }
    };
  }, [isMapReady]);

  // ── Base Layer Switcher (dark / satellite) ───────────────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;
    if (baseLayerRef.current) {
      leafletMap.current.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }
    const tileUrl = baseLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    baseLayerRef.current = L.tileLayer(tileUrl, {
      subdomains: baseLayer === 'dark' ? 'abcd' : '',
      maxZoom: 20,
      crossOrigin: 'anonymous',
      attribution: baseLayer === 'satellite' ? 'Tiles © Esri' : '© OpenStreetMap © CARTO',
    });
    // Insert below radar layers (pane order)
    baseLayerRef.current.addTo(leafletMap.current);
    baseLayerRef.current.bringToBack();
  }, [isMapReady, baseLayer]);

  // ── Tilt Selector — switch radar elevation angle ──────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current || !showNexrad) return;
    if (settings.radarProduct !== 'reflectivity') return; // only for reflectivity
    const tilt = TILT_PRODUCTS[tiltIndex];
    if (!tilt) return;
    if (radarLayerRef.current) {
      radarLayerRef.current.setUrl(tilt.url);
    }
  }, [tiltIndex, isMapReady, showNexrad, settings.radarProduct]);

  // ── Mesocyclone Markers from NWS Storm Reports ────────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    const fetchMeso = () => {
      // Pull SPS (Special Weather Statements) and SVR/TOR with "MESO" in text
      fetch('https://mesonet.agron.iastate.edu/geojson/lsr.php?hours=3&wfo=all&type=M')
        .then(r => r.json())
        .then(data => {
          if (!leafletMap.current) return;
          if (mesoLayerGroupRef.current) leafletMap.current.removeLayer(mesoLayerGroupRef.current);
          const group = L.layerGroup();
          const markers = [];

          (data?.features || []).forEach(feature => {
            const props = feature?.properties || {};
            const coords = feature?.geometry?.coordinates;
            if (!coords) return;
            const [lon, lat] = coords;

            const icon = L.divIcon({
              className: '',
              html: `<div style="
                width:32px;height:32px;
                border:3px solid #c084fc;
                border-radius:50%;
                background:#7c3aed22;
                display:flex;align-items:center;justify-content:center;
                font-size:15px;
                box-shadow:0 0 14px #c084fc88, 0 0 28px #7c3aed44;
                animation:pulse 1.2s ease-in-out infinite;
              ">🌀</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const time = props.valid ? new Date(props.valid).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
            L.marker([lat, lon], { icon, zIndexOffset: 900 })
              .bindPopup(`<div style="font-family:sans-serif;min-width:160px">
                <strong style="color:#c084fc">🌀 MESOCYCLONE</strong><br/>
                <span style="font-size:11px;color:#888">${props.city || ''} ${props.state || ''}</span><br/>
                <span style="font-size:11px;color:#aaa">${time}</span>
              </div>`)
              .addTo(group);
            markers.push({ lat, lon, city: props.city });
          });

          group.addTo(leafletMap.current);
          mesoLayerGroupRef.current = group;
          setMesoMarkers(markers);
        })
        .catch(() => {});
    };

    fetchMeso();
    const interval = setInterval(fetchMeso, 4 * 60 * 1000);
    return () => {
      clearInterval(interval);
      if (mesoLayerGroupRef.current && leafletMap.current) leafletMap.current.removeLayer(mesoLayerGroupRef.current);
    };
  }, [isMapReady]);

  // ── Storm Movement Vectors ───────────────────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    const fetchStormVectors = () => {
      // Use NWS storm track data via Iowa State (SPS / storm attributes)
      fetch('https://mesonet.agron.iastate.edu/geojson/sbw.php?wfo=all&phenomena=TO&significance=W&hours=1')
        .then(r => r.json())
        .then(data => {
          if (!leafletMap.current) return;
          if (vectorLayerGroupRef.current) leafletMap.current.removeLayer(vectorLayerGroupRef.current);
          const group = L.layerGroup();
          const vectors = [];

          (data?.features || []).forEach(feature => {
            const props = feature?.properties || {};
            const geometry = feature?.geometry;
            if (!geometry?.coordinates) return;

            // Get centroid for vector arrow
            let centerLat, centerLon;
            try {
              const coords = geometry.coordinates[0];
              centerLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
              centerLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
            } catch { return; }

            // Typical supercell motion: SW to NE around 240-250° source, moving ~35mph
            // We use a fixed motion vector as NWS LSR doesn't always include speed
            const motionDeg = 240; // degrees FROM (storm moving NE)
            const speedMph = 35;
            const arrowLenDeg = 0.3; // ~20 miles visual
            const toRad = Math.PI / 180;
            const moveDirRad = (motionDeg + 180) * toRad; // direction TO
            const endLat = centerLat + arrowLenDeg * Math.cos(moveDirRad);
            const endLon = centerLon + arrowLenDeg * Math.sin(moveDirRad);

            // Draw arrow line
            const arrow = L.polyline(
              [[centerLat, centerLon], [endLat, endLon]],
              { color: '#facc15', weight: 2.5, opacity: 0.85, dashArray: '6 3' }
            ).addTo(group);

            // Arrowhead marker
            const arrowIcon = L.divIcon({
              className: '',
              html: `<div style="
                width:0;height:0;
                border-left:6px solid transparent;
                border-right:6px solid transparent;
                border-bottom:12px solid #facc15;
                transform:rotate(${motionDeg + 180}deg);
                filter:drop-shadow(0 0 4px #facc1599);
              "></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            });
            L.marker([endLat, endLon], { icon: arrowIcon, zIndexOffset: 600, interactive: false }).addTo(group);

            // Speed label
            const speedIcon = L.divIcon({
              className: '',
              html: `<div style="
                background:#facc1522;border:1px solid #facc1566;
                border-radius:4px;padding:1px 5px;
                font-size:10px;font-weight:700;color:#facc15;
                white-space:nowrap;backdrop-filter:blur(3px);
              ">${speedMph} mph →NE</div>`,
              iconAnchor: [0, 0],
            });
            L.marker([(centerLat + endLat) / 2, (centerLon + endLon) / 2], { icon: speedIcon, interactive: false }).addTo(group);

            vectors.push({ lat: centerLat, lon: centerLon, speed: speedMph });
          });

          group.addTo(leafletMap.current);
          vectorLayerGroupRef.current = group;
          setStormVectors(vectors);
        })
        .catch(() => {});
    };

    fetchStormVectors();
    const interval = setInterval(fetchStormVectors, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
      if (vectorLayerGroupRef.current && leafletMap.current) leafletMap.current.removeLayer(vectorLayerGroupRef.current);
    };
  }, [isMapReady]);

  // ── Dual-Pane Map (Reflectivity + Velocity side by side) ─────────────────
  useEffect(() => {
    if (!dualPane || !mapRef2.current) return;
    if (leafletMap2.current) return; // already initialized

    const coords = leafletMap.current?.getCenter() || { lat: 37.8, lng: -85.5 };
    const zoom = leafletMap.current?.getZoom() || 8;

    leafletMap2.current = L.map(mapRef2.current, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.5,
      minZoom: 4,
      maxZoom: 16,
    }).setView([coords.lat, coords.lng], zoom);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd", maxZoom: 20, crossOrigin: "anonymous"
    }).addTo(leafletMap2.current);

    radarLayer2Ref.current = L.tileLayer(
      "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0U-0/{z}/{x}/{y}.png",
      { opacity: 0.7, maxZoom: 16, maxNativeZoom: 12, crossOrigin: "anonymous" }
    ).addTo(leafletMap2.current);

    // Sync pane 2 to follow pane 1
    const syncMap2 = () => {
      if (!leafletMap.current || !leafletMap2.current) return;
      const c = leafletMap.current.getCenter();
      const z = leafletMap.current.getZoom();
      leafletMap2.current.setView([c.lat, c.lng], z, { animate: false });
    };
    leafletMap.current?.on('moveend', syncMap2);
    leafletMap.current?.on('zoomend', syncMap2);

    return () => {
      leafletMap.current?.off('moveend', syncMap2);
      leafletMap.current?.off('zoomend', syncMap2);
      if (leafletMap2.current) {
        leafletMap2.current.remove();
        leafletMap2.current = null;
      }
    };
  }, [dualPane]);

  // ── Hail Size Markers ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    const fetchHail = () => {
      fetch('https://mesonet.agron.iastate.edu/geojson/lsr.php?hours=3&wfo=all&type=H')
        .then(r => r.json())
        .then(data => {
          if (!leafletMap.current) return;
          if (hailLayerGroupRef.current) leafletMap.current.removeLayer(hailLayerGroupRef.current);
          const group = L.layerGroup();
          const reports = [];

          (data?.features || []).forEach(feature => {
            const props = feature?.properties || {};
            const coords = feature?.geometry?.coordinates;
            if (!coords) return;
            const [lon, lat] = coords;
            const sizeInches = parseFloat(props.magnitude) || 0;
            // Size: < 0.75 = pea, 0.75–1.0 = penny, 1.0–1.75 = golf ball, > 1.75 = baseball+
            const isLarge = sizeInches >= 1.75;
            const isMedium = sizeInches >= 1.0;
            const color = isLarge ? '#ef4444' : isMedium ? '#f97316' : '#3b82f6';
            const sizeLabel = isLarge ? '⚾' : isMedium ? '⛳' : '🫐';
            const sizePx = Math.max(22, Math.min(38, 22 + sizeInches * 8));

            const icon = L.divIcon({
              className: '',
              html: `<div style="
                width:${sizePx}px;height:${sizePx}px;
                border:2px solid ${color};
                border-radius:50%;
                background:${color}22;
                display:flex;align-items:center;justify-content:center;
                font-size:${sizePx * 0.55}px;
                box-shadow:0 0 8px ${color}66;
              ">${sizeLabel}</div>`,
              iconSize: [sizePx, sizePx],
              iconAnchor: [sizePx/2, sizePx/2],
            });

            const time = props.valid ? new Date(props.valid).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
            L.marker([lat, lon], { icon, zIndexOffset: 400 })
              .bindPopup(`<div style="font-family:sans-serif;min-width:150px">
                <strong style="color:${color}">🌨️ HAIL REPORT</strong><br/>
                <span style="font-size:12px;color:#ddd">${sizeInches > 0 ? sizeInches + '"' : 'Size unknown'}</span><br/>
                <span style="font-size:11px;color:#888">${props.city || ''} ${props.state || ''}</span><br/>
                <span style="font-size:11px;color:#aaa">${time}</span>
              </div>`)
              .addTo(group);
            reports.push({ lat, lon, size: sizeInches });
          });

          group.addTo(leafletMap.current);
          hailLayerGroupRef.current = group;
          setHailReports(reports);
        })
        .catch(() => {});
    };

    fetchHail();
    const interval = setInterval(fetchHail, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
      if (hailLayerGroupRef.current && leafletMap.current) leafletMap.current.removeLayer(hailLayerGroupRef.current);
    };
  }, [isMapReady]);

  // ── Share My Location ─────────────────────────────────────────────────────
  const handleShareLocation = () => {
    if (!navigator.geolocation) { alert("Location not available."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const body = encodeURIComponent(`📍 My current location: https://maps.google.com/?q=${latitude},${longitude}
— sent via YouNeeK Pro Radar`);
        const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";
        window.open(`sms:${separator}body=${body}`, '_blank');
        setShowShareBanner(true);
        setTimeout(() => setShowShareBanner(false), 4000);
      },
      () => alert("Couldn't get location — check permissions.")
    );
  };

  const refreshWeatherData = () => {
    const tileUrl = settings.radarProduct === "reflectivity" ? getRadarTileUrl() : activeProduct.tileUrl;
    if (radarLayerRef.current?.setUrl) radarLayerRef.current.setUrl(tileUrl);
    if (velLayerRef.current?.redraw) velLayerRef.current.redraw();
  };
  const { isRefreshing, pullToRefreshHandlers } = usePullToRefresh({ onRefresh: refreshWeatherData });
  const handleLocateMe = () => {
    if (!navigator.geolocation) { alert("Browser won't let me find you—turn on location."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        leafletMap.current.setView([latitude, longitude], 12);
        if (userLocationMarkerRef.current) leafletMap.current.removeLayer(userLocationMarkerRef.current);
        userLocationMarkerRef.current = L.marker([latitude, longitude]).addTo(leafletMap.current).bindPopup("You're here!").openPopup();
      },
      () => alert("Couldn't get location—check permissions.")
    );
  };

  return (
    <div className="relative h-full min-h-[400px] w-full select-none overscroll-none" {...pullToRefreshHandlers}>
      {!isMapReady && (
        <div className="absolute inset-0 z-[900] flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-3 text-white/80">
            <div className="h-10 w-10 rounded-full border-4 border-white/15 border-t-white/80 animate-spin"></div>
            <div className="text-xs font-medium tracking-[0.2em] text-white/60 uppercase">Loading Radar</div>
          </div>
        </div>
      )}
      {isRefreshing && (
        <div className="absolute left-1/2 z-[1200] -translate-x-1/2 rounded-full bg-slate-900/85 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm" style={{ top: "calc(1rem + env(safe-area-inset-top))" }}>
          Refreshing radar...
        </div>
      )}
      {isStale && (
        <div className="absolute left-1/2 z-[1200] -translate-x-1/2 flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/90 px-4 py-2 text-xs font-semibold text-amber-300 shadow-lg backdrop-blur-sm" style={{ top: "calc(3.5rem + env(safe-area-inset-top))" }}>
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Radar data may be stale — tap to refresh
        </div>
      )}
      {stormReports.length > 0 && (
        <div className="absolute z-[1000] flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-slate-950/80 px-3 py-1.5 text-[11px] font-bold text-orange-300 shadow-lg backdrop-blur-sm" style={{ top: "calc(1rem + env(safe-area-inset-top))", right: "1rem" }}>
          ⚡ {stormReports.length} report{stormReports.length !== 1 ? 's' : ''}
        </div>
      )}
      {hookZones.some(z => z.isTornadoEmergency) && (
        <div className="absolute left-1/2 z-[1300] -translate-x-1/2 flex items-center gap-2 rounded-full border-2 border-fuchsia-500 bg-fuchsia-950/95 px-5 py-2 text-xs font-black tracking-wide text-fuchsia-200 shadow-2xl backdrop-blur-sm animate-pulse" style={{ top: "calc(5.5rem + env(safe-area-inset-top))" }}>
          🚨 TORNADO EMERGENCY IN EFFECT
        </div>
      )}
      {!hookZones.some(z => z.isTornadoEmergency) && hookZones.some(z => z.hasRotation) && (
        <div className="absolute left-1/2 z-[1300] -translate-x-1/2 flex items-center gap-2 rounded-full border border-red-500/60 bg-red-950/90 px-4 py-1.5 text-[11px] font-bold text-red-300 shadow-xl backdrop-blur-sm" style={{ top: "calc(5.5rem + env(safe-area-inset-top))" }}>
          🌀 Rotation detected in warned area
        </div>
      )}
      <RadarQuickActions
        show={showQuickControls}
        onToggleShow={() => setShowQuickControls((value) => !value)}
        onHookZone={handleHookZoneView}
        onConus={handleConusView}
        onToggleLoop={handleLoopToggle}
        isLooping={isLooping}
      />
      {isLooping && loopFrames.length > 0 && (
        <div className="absolute left-3 bottom-24 z-[1000] rounded-2xl border border-white/10 bg-slate-950/78 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-sm">
          Frame {loopFrameIndex + 1}/{loopFrames.length}
          <div className="mt-1 text-[11px] text-slate-200">{loopFrames[loopFrameIndex]?.typeLabel}</div>
          <div className="mt-1 text-[11px] text-slate-300">{loopFrames[loopFrameIndex]?.label}</div>
        </div>
      )}
      <RadarLayersMenu showNexrad={showNexrad} showVelocity={showVelocityLocal} showRadio={showRadio} nexradStation={settings.station} radarProduct={settings.radarProduct} alertToggles={alertToggles} onShowNexradChange={handleShowNexradChange} onShowVelocityChange={handleShowVelocityChange} onShowRadioChange={onToggleRadio} onAlertToggleChange={handleAlertToggleChange} onRadarProductChange={handleRadarProductChange} />
      <>
        <StormAnalysisStrip metrics={stormMetrics} />
        <ProLegend productLabel={activeProduct.label} />
        <RadarDataDock metrics={stormMetrics} productLabel={activeProduct.label} station={settings.station} />
        <RadarInspectorPanel inspector={inspector} productLabel={activeProduct.label} />
      </>
      <button onClick={handleLocateMe} className="absolute z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700" style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))", right: "calc(1.25rem + env(safe-area-inset-right))" }} aria-label="Center radar on my location">
        <LocateFixed size={24} aria-hidden="true" />
      </button>
      {/* Share location quick-send */}
      <button
        onClick={handleShareLocation}
        className="absolute z-[1000] flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/90 text-white shadow-lg border border-emerald-400/30 transition-colors hover:bg-emerald-500 active:scale-95"
        style={{ bottom: "calc(11rem + env(safe-area-inset-bottom))", right: "calc(1.25rem + env(safe-area-inset-right))" }}
        aria-label="Share my location via SMS"
        title="Share my location"
      >
        📍
      </button>
      {showShareBanner && (
        <div className="absolute left-1/2 z-[1400] -translate-x-1/2 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/95 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur-sm"
          style={{ bottom: "calc(15rem + env(safe-area-inset-bottom))" }}>
          📍 Location message opened!
        </div>
      )}
      {/* Hail report badge */}
      {hailReports.length > 0 && (
        <div className="absolute z-[1000] flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-slate-950/80 px-3 py-1.5 text-[11px] font-bold text-blue-300 shadow-lg backdrop-blur-sm"
          style={{ top: "calc(5.5rem + env(safe-area-inset-top))", right: "1rem" }}>
          🌨️ {hailReports.filter(h => h.size >= 1.75).length > 0
            ? `${hailReports.filter(h => h.size >= 1.75).length} baseball+ hail`
            : `${hailReports.length} hail report${hailReports.length !== 1 ? 's' : ''}`}
        </div>
      )}
      <button
        onClick={() => setDualPane(v => !v)}
        className={`absolute z-[1000] flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold shadow-lg transition-colors ${dualPane ? 'bg-cyan-600 text-white border border-cyan-400' : 'bg-slate-800/90 text-slate-300 border border-white/10'}`}
        style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))", left: "calc(1.25rem + env(safe-area-inset-left))" }}
        aria-label="Toggle dual pane mode"
      >
        ⚡ {dualPane ? 'Dual ON' : 'Dual'}
      </button>
      {/* Tilt selector */}
      {showNexrad && settings.radarProduct === 'reflectivity' && (
        <div className="absolute z-[1000] flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/90 p-1 shadow-lg backdrop-blur-sm"
          style={{ bottom: "calc(9.5rem + env(safe-area-inset-bottom))", left: "calc(1.25rem + env(safe-area-inset-left))" }}>
          {TILT_PRODUCTS.map((t, i) => (
            <button key={t.label} onClick={() => setTiltIndex(i)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors ${tiltIndex === i ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
          <span className="ml-1 text-[9px] font-semibold uppercase tracking-widest text-slate-500">TILT</span>
        </div>
      )}
      {/* Base layer toggle */}
      <button
        onClick={() => setBaseLayer(v => v === 'dark' ? 'satellite' : 'dark')}
        className="absolute z-[1000] flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/90 px-3 py-1.5 text-[11px] font-bold text-slate-300 shadow-lg backdrop-blur-sm hover:text-white transition-colors"
        style={{ bottom: "calc(9.5rem + env(safe-area-inset-bottom))", right: "calc(1.25rem + env(safe-area-inset-right))" }}
        aria-label="Toggle satellite base layer"
      >
        {baseLayer === 'dark' ? '🛰️ Sat' : '🌑 Dark'}
      </button>
      {/* Mesocyclone badge */}
      {mesoMarkers.length > 0 && (
        <div className="absolute z-[1000] flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/85 px-3 py-1.5 text-[11px] font-bold text-purple-300 shadow-lg backdrop-blur-sm animate-pulse"
          style={{ top: "calc(3.5rem + env(safe-area-inset-top))", right: "1rem" }}>
          🌀 {mesoMarkers.length} meso
        </div>
      )}
      {dualPane ? (
        <div className="absolute inset-0 flex">
          <div className="relative flex-1 border-r border-white/10">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[500] rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold text-cyan-300 pointer-events-none">REFLECTIVITY</div>
            <div ref={mapRef} className="h-full w-full" role="application" aria-label="Reflectivity radar" />
          </div>
          <div className="relative flex-1">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[500] rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold text-yellow-300 pointer-events-none">VELOCITY</div>
            <div ref={mapRef2} className="h-full w-full" role="application" aria-label="Velocity radar" />
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="absolute inset-0 h-full min-h-[400px] w-full" role="application" aria-label="Interactive weather radar" />
      )}
      <div style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 999, color: "rgba(255,255,255,0.35)", fontSize: "13px", fontWeight: "600", letterSpacing: "1px", pointerEvents: "none", userSelect: "none" }}>
        YouNeeK Pro Radar — by Andrew Gray
      </div>
      <ShelterAlert activeTornadoWarning={activeTornadoWarning} activeTornadoWatch={activeTornadoWatch} userLocation={userLocation} />
    </div>
  );
}