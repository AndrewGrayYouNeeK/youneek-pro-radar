import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { LocateFixed } from "lucide-react";
import RadarLayersMenu from "./RadarLayersMenu";
import ShelterAlert from "./ShelterAlert";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

const RIDGE2_URL = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-0/{z}/{x}/{y}.png";
const getCacheBust = () => Math.floor(Date.now() / 120000);
const getIowaReflectivityUrl = () => `${RIDGE2_URL}?_cb=${getCacheBust()}`;
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
  requestAnimationFrame(() => map.invalidateSize());
  setTimeout(() => map.invalidateSize(), 150);
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

function sstColor(tempC) {
  const t = Math.max(0, Math.min(1, (tempC + 2) / 35));
  if (t < 0.25) return `rgb(0,${Math.round(t * 4 * 200)},255)`;
  if (t < 0.5) return `rgb(0,${Math.round(200 + (t - 0.25) * 4 * 55)},${Math.round(255 - (t - 0.25) * 4 * 255)})`;
  if (t < 0.75) return `rgb(${Math.round((t - 0.5) * 4 * 255)},255,0)`;
  return `rgb(255,${Math.round(255 - (t - 0.75) * 4 * 255)},0)`;
}
function drawArrow(ctx, x, y, angleDeg, speedKmh, cellSize) {
  const angleRad = (angleDeg - 90) * Math.PI / 180;
  const len = Math.min(cellSize * 0.42, 6 + speedKmh * 1.4);
  const headLen = Math.max(4, len * 0.32);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  ctx.beginPath(); ctx.moveTo(0, -len / 2); ctx.lineTo(0, len / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -len / 2); ctx.lineTo(-headLen * 0.45, -len / 2 + headLen); ctx.lineTo(headLen * 0.45, -len / 2 + headLen); ctx.closePath(); ctx.fill();
  ctx.restore();
}
async function fetchOceanGrid(bounds, gridStep = 2.0) {
  const lats = [], lons = [];
  for (let lat = Math.ceil(bounds.getSouth() / gridStep) * gridStep; lat <= bounds.getNorth(); lat += gridStep) lats.push(+lat.toFixed(2));
  for (let lon = Math.ceil(bounds.getWest() / gridStep) * gridStep; lon <= bounds.getEast(); lon += gridStep) lons.push(+lon.toFixed(2));
  if (!lats.length || !lons.length) return [];
  const pairs = [];
  for (const lat of lats) for (const lon of lons) pairs.push([lat, lon]);
  const chunks = [];
  for (let i = 0; i < pairs.length; i += 10) chunks.push(pairs.slice(i, i + 10));
  const results = [];
  await Promise.all(chunks.map(async (chunk) => {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${chunk.map((p) => p[0]).join(",")}&longitude=${chunk.map((p) => p[1]).join(",")}&current=ocean_current_velocity,ocean_current_direction,sea_surface_temperature&cell_selection=sea`;
    try {
      const json = await (await fetch(url)).json();
      const arr = Array.isArray(json) ? json : [json];
      arr.forEach((item, i) => {
        if (item?.current) results.push({ lat: chunk[i][0], lon: chunk[i][1], velocity: item.current.ocean_current_velocity ?? null, direction: item.current.ocean_current_direction ?? null, sst: item.current.sea_surface_temperature ?? null });
      });
    } catch (_) {}
  }));
  return results;
}
function createOceanCanvasLayer(map) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;z-index:450;";
  let data = [], animFrame = null, running = true;
  function resize() { const s = map.getSize(); canvas.width = s.x; canvas.height = s.y; }
  function render() {
    if (!running) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const zoom = map.getZoom();
    const cellSize = zoom >= 7 ? 44 : zoom >= 5 ? 54 : 68;
    data.forEach(({ lat, lon, velocity, direction, sst }) => {
      if (velocity === null || direction === null) return;
      const point = map.latLngToContainerPoint([lat, lon]);
      const { x, y } = point;
      if (x < -cellSize || x > canvas.width + cellSize || y < -cellSize || y > canvas.height + cellSize) return;
      const color = sst !== null ? sstColor(sst) : "#00bfff";
      if (sst !== null) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = color + "cc"; ctx.fill(); }
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.8; ctx.globalAlpha = 0.85;
      drawArrow(ctx, x, y, direction, velocity, cellSize);
      ctx.globalAlpha = 1;
      if (zoom >= 6) {
        ctx.font = "9px monospace"; ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.75;
        ctx.fillText(`${velocity.toFixed(1)}km/h`, x + 6, y - 4);
        if (sst !== null) ctx.fillText(`${sst.toFixed(1)}°C`, x + 6, y + 8);
        ctx.globalAlpha = 1;
      }
    });
    animFrame = requestAnimationFrame(render);
  }
  function update(newData) { data = newData; }
  function destroy() { running = false; if (animFrame) cancelAnimationFrame(animFrame); canvas.remove(); }
  map.getPanes().overlayPane.appendChild(canvas);
  resize();
  map.on("resize move zoom", resize);
  render();
  return { canvas, update, destroy };
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
  const oceanCanvasRef = useRef(null);
  const oceanFetchTimerRef = useRef(null);
  const oceanPopupRef = useRef(null);
  const velocityLayerRef = useRef(null);

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
  const [isMapReady, setIsMapReady] = useState(false);
  const [showOcean, setShowOcean] = useState(false);
  const [oceanLoading, setOceanLoading] = useState(false);
  const [oceanMode, setOceanMode] = useState('arrows');
  const [showQuickControls, setShowQuickControls] = useState(true);

  const alertToggles = { tornado: showTornado, severe: showThunderstorm, flood: showFlood, winter: showWinter };
  const alertTogglesRef = useRef(alertToggles);

  useEffect(() => {
    if (leafletMap.current || !mapRef.current) return;
    const coords = STATION_COORDS[settings.station] || [37.8, -85.5];
    leafletMap.current = L.map(mapRef.current, { zoomControl: true, attributionControl: true, zoomSnap: 0.5 }).setView(coords, 8);
    const baseLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: "abcd", maxZoom: 20, crossOrigin: "anonymous" }).addTo(leafletMap.current);
    baseLayer.once("load", () => setIsMapReady(true));
    invalidateMapSize(leafletMap.current);
    requestAnimationFrame(() => applyLeafletControlAccessibility(mapRef.current));
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (loopFadeRef.current) clearInterval(loopFadeRef.current);
      if (oceanFetchTimerRef.current) clearInterval(oceanFetchTimerRef.current);
      if (oceanCanvasRef.current) { oceanCanvasRef.current.destroy(); oceanCanvasRef.current = null; }
      [radarLayerRef, velLayerRef, tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef, userLocationMarkerRef, prevLoopLayerRef, loopLayerRef].forEach((r) => { if (r.current && leafletMap.current?.hasLayer(r.current)) leafletMap.current.removeLayer(r.current); r.current = null; });
      loopLayersRef.current.forEach((l) => { if (leafletMap.current?.hasLayer(l)) leafletMap.current.removeLayer(l); });
      loopLayersRef.current = [];
      setIsMapReady(false);
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; }
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
    if (!document.getElementById('leaflet-velocity-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-velocity-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/leaflet-velocity@1.9.2/dist/leaflet-velocity.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-velocity-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-velocity-js';
      script.src = 'https://cdn.jsdelivr.net/npm/leaflet-velocity@1.9.2/dist/leaflet-velocity.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!leafletMap.current || !isMapReady) return;

    const cleanupOcean = () => {
      if (oceanCanvasRef.current) { oceanCanvasRef.current.destroy(); oceanCanvasRef.current = null; }
      if (oceanFetchTimerRef.current) { clearInterval(oceanFetchTimerRef.current); oceanFetchTimerRef.current = null; }
      if (oceanPopupRef.current) { leafletMap.current.removeLayer(oceanPopupRef.current); oceanPopupRef.current = null; }
      if (velocityLayerRef.current) { leafletMap.current.removeLayer(velocityLayerRef.current); velocityLayerRef.current = null; }
    };

    if (!showOcean) { cleanupOcean(); return; }

    if (oceanMode === 'arrows') {
      if (velocityLayerRef.current) { leafletMap.current.removeLayer(velocityLayerRef.current); velocityLayerRef.current = null; }
      oceanCanvasRef.current = createOceanCanvasLayer(leafletMap.current);
      const loadOceanData = async () => {
        setOceanLoading(true);
        const data = await fetchOceanGrid(leafletMap.current.getBounds(), 2.0);
        if (oceanCanvasRef.current) oceanCanvasRef.current.update(data);
        setOceanLoading(false);
      };
      loadOceanData();
      leafletMap.current.on("moveend zoomend", loadOceanData);
      const onMapClick = async (e) => {
        if (!showOcean) return;
        if (oceanPopupRef.current) { leafletMap.current.removeLayer(oceanPopupRef.current); oceanPopupRef.current = null; }
        try {
          const { lat, lng } = e.latlng;
          const json = await (await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&current=ocean_current_velocity,ocean_current_direction,sea_surface_temperature&cell_selection=sea`)).json();
          if (json?.current?.ocean_current_velocity != null) {
            const { ocean_current_velocity: v, ocean_current_direction: d, sea_surface_temperature: t } = json.current;
            oceanPopupRef.current = L.popup({ closeButton: true })
              .setLatLng(e.latlng)
              .setContent(`<div style="font-family:monospace;font-size:12px;color:#fff;background:#1a1a2e;padding:10px 14px;border-radius:8px;border:1px solid #c8a45a"><div style="color:#c8a45a;font-weight:bold;margin-bottom:6px">🌊 Ocean Current</div><div>💨 Speed: <b>${v.toFixed(2)} km/h</b></div><div>🧭 Direction: <b>${d?.toFixed(0)}°</b></div>${t != null ? `<div>🌡️ Temp: <b>${t.toFixed(1)}°C / ${(t*9/5+32).toFixed(1)}°F</b></div>` : ""}<div style="color:#666;font-size:10px;margin-top:6px">Open-Meteo Marine API</div></div>`)
              .openOn(leafletMap.current);
          }
        } catch (_) {}
      };
      leafletMap.current.on("click", onMapClick);
      oceanFetchTimerRef.current = setInterval(loadOceanData, 10 * 60 * 1000);
      return () => {
        if (leafletMap.current) { leafletMap.current.off("moveend zoomend", loadOceanData); leafletMap.current.off("click", onMapClick); }
        cleanupOcean();
      };

    } else {
      if (oceanCanvasRef.current) { oceanCanvasRef.current.destroy(); oceanCanvasRef.current = null; }

      const loadVelocityLayer = async () => {
        setOceanLoading(true);
        try {
          const bounds = leafletMap.current.getBounds();
          const lats = [], lons = [];
          const step = 2.0;
          for (let lat = Math.ceil(bounds.getSouth() / step) * step; lat <= bounds.getNorth(); lat += step) lats.push(+lat.toFixed(2));
          for (let lon = Math.ceil(bounds.getWest() / step) * step; lon <= bounds.getEast(); lon += step) lons.push(+lon.toFixed(2));

          const pairs = [];
          for (const lat of lats) for (const lon of lons) pairs.push([lat, lon]);
          const chunks = [];
          for (let i = 0; i < pairs.length; i += 10) chunks.push(pairs.slice(i, i + 10));

          const results = [];
          await Promise.all(chunks.map(async (chunk) => {
            const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${chunk.map(p=>p[0]).join(",")}&longitude=${chunk.map(p=>p[1]).join(",")}&current=ocean_current_velocity,ocean_current_direction,sea_surface_temperature&cell_selection=sea`;
            try {
              const json = await (await fetch(url)).json();
              const arr = Array.isArray(json) ? json : [json];
              arr.forEach((item, i) => {
                if (item?.current?.ocean_current_velocity != null) {
                  const deg = item.current.ocean_current_direction ?? 0;
                  const spd = item.current.ocean_current_velocity ?? 0;
                  const rad = deg * Math.PI / 180;
                  results.push({ lat: chunk[i][0], lon: chunk[i][1], u: spd * Math.sin(rad), v: spd * Math.cos(rad), sst: item.current.sea_surface_temperature ?? null });
                }
              });
            } catch (_) {}
          }));

          if (!results.length || !leafletMap.current) { setOceanLoading(false); return; }

          const uniqueLats = [...new Set(results.map(r => r.lat))].sort((a,b) => a-b);
          const uniqueLons = [...new Set(results.map(r => r.lon))].sort((a,b) => a-b);
          const nx = uniqueLons.length, ny = uniqueLats.length;
          const uData = new Array(nx * ny).fill(0);
          const vData = new Array(nx * ny).fill(0);
          results.forEach(({ lat, lon, u, v }) => {
            const xi = uniqueLons.indexOf(lon);
            const yi = uniqueLats.indexOf(lat);
            if (xi >= 0 && yi >= 0) { uData[yi * nx + xi] = u; vData[yi * nx + xi] = v; }
          });

          const header = {
            parameterUnit: "km/h", parameterNumberName: "Ocean Current",
            nx, ny,
            lo1: uniqueLons[0], lo2: uniqueLons[nx-1],
            la1: uniqueLats[ny-1], la2: uniqueLats[0],
            dx: uniqueLons.length > 1 ? uniqueLons[1] - uniqueLons[0] : 2,
            dy: uniqueLats.length > 1 ? uniqueLats[1] - uniqueLats[0] : 2,
            refTime: new Date().toISOString(),
          };

          const velocityData = [
            { header: { ...header, parameterCategory: 2, parameterNumber: 2 }, data: uData },
            { header: { ...header, parameterCategory: 2, parameterNumber: 3 }, data: vData },
          ];

          if (velocityLayerRef.current) { leafletMap.current.removeLayer(velocityLayerRef.current); velocityLayerRef.current = null; }
          if (!window.L?.velocityLayer) {
            setOceanLoading(false);
            setOceanMode('arrows');
            return;
          }

          velocityLayerRef.current = window.L.velocityLayer({
            displayValues: true,
            displayOptions: {
              velocityType: "Ocean Current",
              position: "bottomleft",
              emptyString: "No ocean data",
              angleConvention: "bearingCCW",
              speedUnit: "km/h",
            },
            data: velocityData,
            maxVelocity: 10,
            velocityScale: 0.012,
            colorScale: ["#0000ff","#0080ff","#00ffff","#00ff80","#00ff00","#80ff00","#ffff00","#ff8000","#ff0000"],
            opacity: 0.85,
          }).addTo(leafletMap.current);
        } catch (_) {}
        setOceanLoading(false);
      };

      loadVelocityLayer();
      leafletMap.current.on("moveend zoomend", loadVelocityLayer);
      oceanFetchTimerRef.current = setInterval(loadVelocityLayer, 10 * 60 * 1000);

      return () => {
        if (leafletMap.current) leafletMap.current.off("moveend zoomend", loadVelocityLayer);
        cleanupOcean();
      };
    }
  }, [showOcean, isMapReady, oceanMode]);

  useEffect(() => {
    if (!leafletMap.current) return;
    if (radarLayerRef.current) { leafletMap.current.removeLayer(radarLayerRef.current); radarLayerRef.current = null; }
    if (velLayerRef.current) { leafletMap.current.removeLayer(velLayerRef.current); velLayerRef.current = null; }
    [tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef].forEach((r) => { if (r.current) { leafletMap.current.removeLayer(r.current); r.current = null; } });
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    radarLoadStatsRef.current = { errors: 0, loaded: 0, usingFallback: false };
    if (!showNexrad) { setActiveTornadoWarning(false); return; }
    const addVelocityLayer = () => {
      if (velLayerRef.current) { leafletMap.current.removeLayer(velLayerRef.current); velLayerRef.current = null; }
      if (!showVelocityLocal || !leafletMap.current) return;
      velLayerRef.current = L.tileLayer("https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0U-0/{z}/{x}/{y}.png", { opacity: 0.65, transparent: true, crossOrigin: true, tileSize: 256, maxZoom: 18, maxNativeZoom: 12, attribution: 'NEXRAD Velocity © Iowa Mesonet' }).addTo(leafletMap.current);
    };
    const refreshAlertLayer = (layerRef, toggleKey, url, color) => {
      if (layerRef.current) { leafletMap.current.removeLayer(layerRef.current); layerRef.current = null; }
      if (!leafletMap.current || !showNexrad) return;
      fetch(url).then((r) => r.json()).then((data) => {
        if (!leafletMap.current) return;
        if (toggleKey === "tornado") { const features = data?.features || []; setActiveTornadoWarning(Boolean(userLocation) && features.some((f) => isFeatureNearLocation(f, userLocation, 150))); }
        if (!alertTogglesRef.current[toggleKey]) return;
        layerRef.current = L.geoJSON(data, { style: { color, weight: 2, opacity: 0.95, fillColor: color, fillOpacity: 0.18 } }).addTo(leafletMap.current);
      });
    };
    const refreshAlertLayers = () => {
      refreshAlertLayer(tornadoLayerRef, "tornado", "https://api.weather.gov/alerts/active?event=Tornado+Warning&status=actual", "#ef4444");
      refreshAlertLayer(thunderLayerRef, "severe", "https://api.weather.gov/alerts/active?event=Severe+Thunderstorm+Warning&status=actual", "#f97316");
      refreshAlertLayer(floodLayerRef, "flood", "https://api.weather.gov/alerts/active?event=Flood+Warning&status=actual", "#3b82f6");
      refreshAlertLayer(winterLayerRef, "winter", "https://api.weather.gov/alerts/active?event=Winter+Weather+Advisory&status=actual", "#a855f7");
    };
    const refreshGlobalRadarLayer = () => {
      fetchLatestRainViewerTileUrl().then((latestUrl) => {
        if (!latestUrl || !leafletMap.current) return;
        if (radarLayerRef.current?.setUrl) {
          radarLayerRef.current.setUrl(latestUrl);
          return;
        }
        radarLayerRef.current = L.tileLayer(latestUrl, {
          attribution: "RainViewer",
          opacity: 0.7,
          maxZoom: 18,
          maxNativeZoom: 12,
          crossOrigin: "anonymous"
        }).addTo(leafletMap.current);
      });
    };
    refreshGlobalRadarLayer();
    addVelocityLayer(); refreshAlertLayers();
    refreshTimerRef.current = setInterval(() => {
      refreshGlobalRadarLayer();
      if (velLayerRef.current?.redraw) velLayerRef.current.redraw();
      refreshAlertLayers();
    }, 5 * 60 * 1000);
    return () => {
      clearInterval(refreshTimerRef.current);
      [radarLayerRef, velLayerRef, tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef, prevLoopLayerRef, loopLayerRef].forEach((r) => { if (r.current && leafletMap.current?.hasLayer(r.current)) leafletMap.current.removeLayer(r.current); r.current = null; });
      loopLayersRef.current.forEach((l) => { if (leafletMap.current?.hasLayer(l)) leafletMap.current.removeLayer(l); });
      loopLayersRef.current = [];
    };
  }, [showNexrad, settings.showVelocity, showVelocityLocal, settings.station, showTornado, showThunderstorm, showFlood, showWinter, userLocation]);

  const handleHookZoneView = () => {
    if (!leafletMap.current) return;
    if (isLooping) {
      setIsLooping(false);
      clearLoopLayers();
    }
    leafletMap.current.setView([36.8, -87.3], 9);
  };
  const handleConusView = () => {
    if (!leafletMap.current) return;
    if (isLooping) {
      setIsLooping(false);
      clearLoopLayers();
    }
    leafletMap.current.setView([39.5, -98.35], 5);
  };
  const clearLoopLayers = () => {
    if (loopTimerRef.current) { clearTimeout(loopTimerRef.current); loopTimerRef.current = null; }
    if (loopFadeRef.current) { clearInterval(loopFadeRef.current); loopFadeRef.current = null; }
    if (leafletMap.current) loopLayersRef.current.forEach((l) => { if (leafletMap.current.hasLayer(l)) leafletMap.current.removeLayer(l); });
    loopLayersRef.current = []; loopLayerRef.current = null; prevLoopLayerRef.current = null; loopIndexRef.current = 0; setLoopFrameIndex(0);
    if (radarLayerRef.current?.setOpacity) radarLayerRef.current.setOpacity(0.7);
    if (velLayerRef.current?.setOpacity) velLayerRef.current.setOpacity(showVelocityLocal ? 0.6 : 0);
  };
  const fetchLoopFrames = () => {
    if (!leafletMap.current) return;
    clearLoopLayers();
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then(r => r.json())
      .then(data => {
        const past = (data?.radar?.past || []).filter(i => i?.path);
        const limited = past.slice(-6);
        const frames = limited.map(i => ({
          path: i.path,
          label: formatRainViewerTime(i),
          typeLabel: "🟢 Reflectivity",
        }));

        let loaded = 0;
        const layers = [];
        const loadNext = (index) => {
          if (index >= frames.length || !leafletMap.current) {
            loopLayersRef.current = layers;
            loopIndexRef.current = 0;
            setLoopFrames(frames);
            setLoopFrameIndex(0);
            layers.forEach((l, i) => l.setOpacity(i === 0 ? 0.7 : 0));
            loopLayerRef.current = layers[0] || null;
            prevLoopLayerRef.current = null;
            if (radarLayerRef.current?.setOpacity) radarLayerRef.current.setOpacity(0);
            if (velLayerRef.current?.setOpacity) velLayerRef.current.setOpacity(0);
            setIsLooping(true);
            return;
          }
          const layer = L.tileLayer(getRainViewerTileUrl(frames[index].path), {
            opacity: 0,
            maxZoom: 18,
            maxNativeZoom: 12,
            crossOrigin: "anonymous",
            keepBuffer: 1,
          });
          const finish = () => { layers.push(layer); loadNext(index + 1); };
          layer.once("load", finish);
          layer.once("tileerror", finish);
          layer.addTo(leafletMap.current);
        };
        loadNext(0);
      });
  };
  const handleLoopToggle = () => { if (isLooping) { setIsLooping(false); clearLoopLayers(); return; } fetchLoopFrames(); };
  const handleOceanToggle = () => {
    const nextShowOcean = !showOcean;
    setShowOcean(nextShowOcean);
    if (!nextShowOcean || !leafletMap.current) return;
    if (isLooping) {
      setIsLooping(false);
      clearLoopLayers();
    }
    leafletMap.current.setView([20, 0], 2);
  };
  const handleShowNexradChange = (value) => onSettingsChange({ ...settings, showNexrad: value });
  const handleShowVelocityChange = (value) => { setShowVelocityLocal(value); onSettingsChange({ ...settings, showVelocity: value }); };
  const handleAlertToggleChange = (key, value) => {
    if (key === "tornado") setShowTornado(value);
    if (key === "severe") setShowThunderstorm(value);
    if (key === "flood") setShowFlood(value);
    if (key === "winter") setShowWinter(value);
  };

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

  const refreshWeatherData = () => {
    fetchLatestRainViewerTileUrl().then((latestUrl) => {
      if (latestUrl && radarLayerRef.current?.setUrl) radarLayerRef.current.setUrl(latestUrl);
    });
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
        <div className="absolute left-1/2 z-[1200] -translate-x-1/2 rounded-full bg-slate-900/85 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm" style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}>
          Refreshing radar...
        </div>
      )}
      <div className="absolute left-3 top-20 z-[1000] flex flex-col gap-2" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '2px' }}>
        <button
          onClick={() => setShowQuickControls((value) => !value)}
          className="rounded-lg bg-slate-900/85 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        >
          {showQuickControls ? "Hide Tools" : "Show Tools"}
        </button>

        {showQuickControls && (
          <>
            <button onClick={handleHookZoneView} className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90">🌀 Hook Zone</button>
            <button onClick={handleConusView} className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90">🗺️ CONUS</button>
            <button onClick={handleLoopToggle} className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90">{isLooping ? "⏹ Loop" : "▶ Loop"}</button>
            <button
              onClick={handleOceanToggle}
              className={`rounded-lg px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors ${showOcean ? "bg-cyan-700/90 hover:bg-cyan-600/90" : "bg-slate-900/80 hover:bg-slate-800/90"}`}
            >
              {oceanLoading ? "⏳ Ocean..." : showOcean ? "🌊 Ocean ✓" : "🌊 Ocean"}
            </button>
            {isLooping && loopFrames.length > 0 && (
              <div className="rounded-lg bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-sm">
                Frame {loopFrameIndex + 1}/{loopFrames.length}
                <div className="mt-1 text-[11px] text-slate-200">{loopFrames[loopFrameIndex]?.typeLabel}</div>
                <div className="mt-1 text-[11px] text-slate-300">{loopFrames[loopFrameIndex]?.label}</div>
              </div>
            )}
            {showOcean && (
              <div className="rounded-lg bg-slate-900/80 px-2 py-2 text-[10px] text-slate-300 shadow-lg backdrop-blur-sm leading-5" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                <div className="font-bold text-cyan-300 mb-1">🌊 Mode</div>
                <div className="flex gap-1 mb-2">
                  <button
                    onClick={() => setOceanMode('velocity')}
                    className={`flex-1 rounded px-1 py-1 text-[10px] font-medium transition-colors ${oceanMode === 'velocity' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    🌀 Flow
                  </button>
                  <button
                    onClick={() => setOceanMode('arrows')}
                    className={`flex-1 rounded px-1 py-1 text-[10px] font-medium transition-colors ${oceanMode === 'arrows' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    ➡️ Arrows
                  </button>
                </div>
                <div style={{ background: "linear-gradient(to right,#0000ff,#00ffff,#00ff00,#ffff00,#ff0000)", height: 6, borderRadius: 3, marginBottom: 3 }} />
                <div className="flex justify-between text-[9px]"><span>Slow</span><span>Fast</span></div>
                <div className="mt-1 text-slate-400">Tap ocean for details</div>
              </div>
            )}
          </>
        )}
      </div>
      <RadarLayersMenu showNexrad={showNexrad} showVelocity={showVelocityLocal} showRadio={showRadio} nexradStation={settings.station} alertToggles={alertToggles} onShowNexradChange={handleShowNexradChange} onShowVelocityChange={handleShowVelocityChange} onShowRadioChange={onToggleRadio} onAlertToggleChange={handleAlertToggleChange} />
      <button onClick={handleLocateMe} className="absolute z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700" style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))', right: 'calc(1.25rem + env(safe-area-inset-right))' }} aria-label="Center radar on my location">
        <LocateFixed size={24} aria-hidden="true" />
      </button>
      <div ref={mapRef} className="absolute inset-0 h-full min-h-[400px] w-full" role="application" aria-label="Interactive weather radar" />
      <div style={{ position:'absolute', bottom:'10px', left:'10px', zIndex:999, color:'rgba(255,255,255,0.35)', fontSize:'13px', fontWeight:'600', letterSpacing:'1px', pointerEvents:'none', userSelect:'none' }}>
        YouNeeK Pro Radar — by Andrew Gray
      </div>
      <ShelterAlert activeTornadoWarning={activeTornadoWarning} userLocation={userLocation} />
    </div>
  );
}