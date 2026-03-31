import { useEffect, useMemo, useRef, useState } from "react";
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
import { WORKER_BASE, STATION_COORDS, TILT_PRODUCTS, getCacheBust, getRadarTileUrl, getAlertUrl, getRainViewerTileUrl, fetchLatestRainViewerTileUrl, haversineKm, getGeometryPoints, featureIsNearUser } from "./radarConstants";


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
  const [baseLayer, setBaseLayer] = useState('dark');
  const [mesoMarkers, setMesoMarkers] = useState([]);
  const [hailReports, setHailReports] = useState([]);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [radarOpacity, setRadarOpacity] = useState(0.72);
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const [spotterReports, setSpotterReports] = useState([]);
  const [srhData, setSrhData] = useState(null);
  const [lightningStrikes, setLightningStrikes] = useState([]);
  const [showLightning, setShowLightning] = useState(true);
  const [forecastHazards, setForecastHazards] = useState(null);
  const [showForecast, setShowForecast] = useState(false);
  const [nearestStation, setNearestStation] = useState(null);
  const stormMarkerGroupRef = useRef(null);
  const hookLayerGroupRef = useRef(null);
  const countyWarningLayerRef = useRef(null);
  const vectorLayerGroupRef = useRef(null);
  const mesoLayerGroupRef = useRef(null);
  const hailLayerGroupRef = useRef(null);
  const spotterLayerGroupRef = useRef(null);
  const lightningLayerGroupRef = useRef(null);
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
      [radarLayerRef, velLayerRef, tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef, userLocationMarkerRef, prevLoopLayerRef, loopLayerRef, stormMarkerGroupRef, hookLayerGroupRef, countyWarningLayerRef, vectorLayerGroupRef, mesoLayerGroupRef, hailLayerGroupRef, spotterLayerGroupRef, lightningLayerGroupRef, baseLayerRef].forEach((r) => {
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

      fetch('https://mesonet.agron.iastate.edu/geojson/lsr.php?hours=3&wfo=all')
        .then(r => r.json())
        .then(data => {
          if (!leafletMap.current) return;

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

          lastRadarUpdateRef.current = Date.now();
          setIsStale(false);
        })
        .catch(() => {});
    };

    fetchStormReports();
    const interval = setInterval(fetchStormReports, 5 * 60 * 1000);


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



    const fetchHookZones = () => {
      fetch('https://api.weather.gov/alerts/active?event=Tornado%20Warning&status=actual')
        .then(r => r.json())
        .then(data => {
          if (!leafletMap.current) return;


          if (hookLayerGroupRef.current) {
            leafletMap.current.removeLayer(hookLayerGroupRef.current);
          }
          const group = L.layerGroup();
          const zones = [];

          (data?.features || []).forEach(feature => {
            const props = feature?.properties || {};
            const geometry = feature?.geometry;
            if (!geometry?.coordinates) return;


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
    const interval = setInterval(fetchHookZones, 3 * 60 * 1000);
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

    baseLayerRef.current.addTo(leafletMap.current);
    baseLayerRef.current.bringToBack();
  }, [isMapReady, baseLayer]);

  // ── Tilt Selector — switch radar elevation angle ──────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current || !showNexrad) return;
    if (settings.radarProduct !== 'reflectivity') return;
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


            let centerLat, centerLon;
            try {
              const coords = geometry.coordinates[0];
              centerLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
              centerLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
            } catch { return; }



            const motionDeg = 240;
            const speedMph = 35;
            const arrowLenDeg = 0.3;
            const toRad = Math.PI / 180;
            const moveDirRad = (motionDeg + 180) * toRad;
            const endLat = centerLat + arrowLenDeg * Math.cos(moveDirRad);
            const endLon = centerLon + arrowLenDeg * Math.sin(moveDirRad);


            const arrow = L.polyline(
              [[centerLat, centerLon], [endLat, endLon]],
              { color: '#facc15', weight: 2.5, opacity: 0.85, dashArray: '6 3' }
            ).addTo(group);


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
    if (leafletMap2.current) return;

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

  // ── Radar Opacity Sync ───────────────────────────────────────────────────
  useEffect(() => {
    if (radarLayerRef.current?.setOpacity) radarLayerRef.current.setOpacity(radarOpacity);
  }, [radarOpacity]);

  // ── Storm Spotter Reports ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current) return;

    const fetchSpotters = () => {

      Promise.all([
        fetch('https://mesonet.agron.iastate.edu/geojson/lsr.php?hours=3&wfo=all&type=F').then(r => r.json()),
        fetch('https://mesonet.agron.iastate.edu/geojson/lsr.php?hours=3&wfo=all&type=W').then(r => r.json()),
      ]).then(([funnels, wind]) => {
        if (!leafletMap.current) return;
        if (spotterLayerGroupRef.current) leafletMap.current.removeLayer(spotterLayerGroupRef.current);
        const group = L.layerGroup();
        const allReports = [];

        const addReports = (data, type, emoji, color) => {
          (data?.features || []).forEach(feature => {
            const props = feature?.properties || {};
            const coords = feature?.geometry?.coordinates;
            if (!coords) return;
            const [lon, lat] = coords;

            const icon = L.divIcon({
              className: '',
              html: `<div style="
                width:26px;height:26px;
                border:2px solid ${color};
                border-radius:4px;
                background:${color}22;
                display:flex;align-items:center;justify-content:center;
                font-size:13px;
                box-shadow:0 0 6px ${color}66;
              ">${emoji}</div>`,
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            });

            const time = props.valid ? new Date(props.valid).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
            const mag = props.magnitude ? ` ${props.magnitude}` : '';
            L.marker([lat, lon], { icon, zIndexOffset: 350 })
              .bindPopup(`<div style="font-family:sans-serif;min-width:150px">
                <strong style="color:${color}">${emoji} ${type}${mag}</strong><br/>
                <span style="font-size:11px;color:#888">${props.city || ''} ${props.state || ''}</span><br/>
                <span style="font-size:11px;color:#aaa">${time}</span>
              </div>`)
              .addTo(group);
            allReports.push({ type, lat, lon });
          });
        };

        addReports(funnels, 'FUNNEL CLOUD', '🌪️', '#a78bfa');
        addReports(wind, 'WIND DAMAGE', '💨', '#fb923c');

        group.addTo(leafletMap.current);
        spotterLayerGroupRef.current = group;
        setSpotterReports(allReports);
      }).catch(() => {});
    };

    fetchSpotters();
    const interval = setInterval(fetchSpotters, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
      if (spotterLayerGroupRef.current && leafletMap.current) leafletMap.current.removeLayer(spotterLayerGroupRef.current);
    };
  }, [isMapReady]);

  // ── SRH / Wind Shear Data (Storm-Relative Helicity) ──────────────────────
  useEffect(() => {
    if (!userLocation) return;

    fetch(`https://api.weather.gov/points/${userLocation.lat.toFixed(4)},${userLocation.lon.toFixed(4)}`)
      .then(r => r.json())
      .then(data => {
        const office = data?.properties?.gridId;
        const x = data?.properties?.gridX;
        const y = data?.properties?.gridY;
        if (!office) return;
        return fetch(`https://api.weather.gov/gridpoints/${office}/${x},${y}`);
      })
      .then(r => r?.json())
      .then(data => {
        if (!data) return;

        const windValues = data?.properties?.windSpeed?.values || [];
        if (windValues.length === 0) return;
        const surfaceWind = windValues[0]?.value || 0;
        const upperWind = windValues[Math.min(6, windValues.length - 1)]?.value || 0;
        const shearKt = Math.round(Math.abs(upperWind - surfaceWind) * 0.539957);

        const srhCategory = shearKt > 50 ? 'Significant' : shearKt > 30 ? 'Elevated' : 'Low';
        const srhColor = shearKt > 50 ? '#ef4444' : shearKt > 30 ? '#f97316' : '#22c55e';
        setSrhData({ shearKt, srhCategory, srhColor });
      })
      .catch(() => {});
  }, [userLocation]);

  // ── Lightning Strike Overlay (simulated from LSR lightning reports) ────────
  useEffect(() => {
    if (!isMapReady || !leafletMap.current || !showLightning) return;

    const fetchLightning = () => {
      fetch('https://mesonet.agron.iastate.edu/geojson/lsr.php?hours=1&wfo=all&type=L')
        .then(r => r.json())
        .then(data => {
          if (!leafletMap.current) return;
          if (lightningLayerGroupRef.current) leafletMap.current.removeLayer(lightningLayerGroupRef.current);
          const group = L.layerGroup();
          const strikes = [];

          (data?.features || []).forEach(feature => {
            const coords = feature?.geometry?.coordinates;
            const props = feature?.properties || {};
            if (!coords) return;
            const [lon, lat] = coords;
            const age = Date.now() - new Date(props.valid || Date.now()).getTime();
            const minutesOld = age / 60000;
            const opacity = Math.max(0.2, 1 - minutesOld / 60);

            const icon = L.divIcon({
              className: '',
              html: `<div style="
                font-size:16px;
                opacity:${opacity};
                filter:drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 12px #f59e0b);
                line-height:1;
              ">⚡</div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });

            L.marker([lat, lon], { icon, zIndexOffset: 200, interactive: false }).addTo(group);
            strikes.push({ lat, lon });
          });

          group.addTo(leafletMap.current);
          lightningLayerGroupRef.current = group;
          setLightningStrikes(strikes);
        })
        .catch(() => {});
    };

    fetchLightning();
    const interval = setInterval(fetchLightning, 2 * 60 * 1000);
    return () => {
      clearInterval(interval);
      if (lightningLayerGroupRef.current && leafletMap.current) leafletMap.current.removeLayer(lightningLayerGroupRef.current);
    };
  }, [isMapReady, showLightning]);

  // ── Forecast Hazards Panel (from NWS for user location) ──────────────────
  useEffect(() => {
    if (!userLocation) return;
    fetch(`https://api.weather.gov/points/${userLocation.lat.toFixed(4)},${userLocation.lon.toFixed(4)}`)
      .then(r => r.json())
      .then(data => {
        const forecastUrl = data?.properties?.forecast;
        const zone = data?.properties?.county;
        const city = data?.properties?.relativeLocation?.properties?.city;
        const state = data?.properties?.relativeLocation?.properties?.state;
        setNearestStation({ city, state, zone });
        if (!forecastUrl) return;
        return fetch(forecastUrl);
      })
      .then(r => r?.json())
      .then(data => {
        if (!data) return;
        const periods = data?.properties?.periods?.slice(0, 4) || [];
        const hazards = periods.map(p => ({
          name: p.name,
          temp: p.temperature,
          unit: p.temperatureUnit,
          wind: p.windSpeed,
          icon: p.isDaytime ? '☀️' : '🌙',
          short: p.shortForecast,
          hasTstorm: /thunder|storm/i.test(p.shortForecast),
          hasTornado: /tornado/i.test(p.shortForecast),
          hasHail: /hail/i.test(p.shortForecast),
        }));
        setForecastHazards(hazards);
      })
      .catch(() => {});
  }, [userLocation]);

  // ── Nearest NEXRAD Station Finder ─────────────────────────────────────────
  useEffect(() => {
    if (!userLocation) return;
    let closestStation = null;
    let closestDist = Infinity;
    Object.entries(STATION_COORDS).forEach(([id, [lat, lon]]) => {
      const dist = haversineKm(userLocation.lat, userLocation.lon, lat, lon);
      if (dist < closestDist) { closestDist = dist; closestStation = { id, dist: Math.round(dist * 0.621371) }; }
    });
    if (closestStation) setNearestStation(prev => ({ ...prev, ...closestStation }));
  }, [userLocation]);

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
      {}
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
      {}
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
      {}
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
      {}
      <button
        onClick={() => setBaseLayer(v => v === 'dark' ? 'satellite' : 'dark')}
        className="absolute z-[1000] flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/90 px-3 py-1.5 text-[11px] font-bold text-slate-300 shadow-lg backdrop-blur-sm hover:text-white transition-colors"
        style={{ bottom: "calc(9.5rem + env(safe-area-inset-bottom))", right: "calc(1.25rem + env(safe-area-inset-right))" }}
        aria-label="Toggle satellite base layer"
      >
        {baseLayer === 'dark' ? '🛰️ Sat' : '🌑 Dark'}
      </button>
      {}
      {mesoMarkers.length > 0 && (
        <div className="absolute z-[1000] flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/85 px-3 py-1.5 text-[11px] font-bold text-purple-300 shadow-lg backdrop-blur-sm animate-pulse"
          style={{ top: "calc(3.5rem + env(safe-area-inset-top))", right: "1rem" }}>
          🌀 {mesoMarkers.length} meso
        </div>
      )}
      {}
      {spotterReports.length > 0 && (
        <div className="absolute z-[1000] flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-slate-950/80 px-3 py-1.5 text-[11px] font-bold text-violet-300 shadow-lg backdrop-blur-sm"
          style={{ top: "calc(7.5rem + env(safe-area-inset-top))", right: "1rem" }}>
          👁️ {spotterReports.length} spotter
        </div>
      )}
      {}
      {srhData && (
        <div className="absolute z-[1000] rounded-xl border border-white/10 bg-slate-950/85 px-3 py-2 shadow-lg backdrop-blur-sm"
          style={{ bottom: "calc(13rem + env(safe-area-inset-bottom))", left: "calc(1.25rem + env(safe-area-inset-left))" }}>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Wind Shear</div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black" style={{ color: srhData.srhColor }}>{srhData.shearKt}kt</span>
            <span className="text-[10px] font-semibold" style={{ color: srhData.srhColor }}>{srhData.srhCategory}</span>
          </div>
        </div>
      )}
      {}
      <div className="absolute z-[1000]"
        style={{ bottom: "calc(9.5rem + env(safe-area-inset-bottom))", left: "50%", transform: "translateX(-50%)" }}>
        {showOpacitySlider && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 shadow-lg backdrop-blur-sm mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Opacity</span>
            <input type="range" min="0.2" max="1" step="0.05" value={radarOpacity}
              onChange={e => setRadarOpacity(parseFloat(e.target.value))}
              className="w-28 accent-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-300">{Math.round(radarOpacity * 100)}%</span>
          </div>
        )}
        <button
          onClick={() => setShowOpacitySlider(v => !v)}
          className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow backdrop-blur-sm transition-colors ${showOpacitySlider ? 'border-cyan-500/50 bg-cyan-950/90 text-cyan-300' : 'border-white/10 bg-slate-900/90 text-slate-400'}`}
        >
          🎚️ {Math.round(radarOpacity * 100)}%
        </button>
      </div>
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
      {}
      <button
        onClick={() => setShowLightning(v => !v)}
        className={`absolute z-[1000] flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-lg backdrop-blur-sm transition-colors ${showLightning ? 'border-yellow-500/40 bg-yellow-950/80 text-yellow-300' : 'border-white/10 bg-slate-900/80 text-slate-500'}`}
        style={{ bottom: "calc(13rem + env(safe-area-inset-bottom))", right: "calc(1.25rem + env(safe-area-inset-right))" }}
        aria-label="Toggle lightning overlay"
      >
        ⚡ {showLightning ? `${lightningStrikes.length} strikes` : 'Lightning off'}
      </button>
      {}
      {nearestStation?.id && (
        <div className="absolute z-[1000] rounded-xl border border-white/10 bg-slate-950/85 px-3 py-2 shadow-lg backdrop-blur-sm pointer-events-none"
          style={{ bottom: "calc(10px)", right: "calc(1rem + env(safe-area-inset-right))" }}>
          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Nearest Radar</div>
          <div className="text-sm font-black text-cyan-300">{nearestStation.id}</div>
          <div className="text-[10px] text-slate-400">{nearestStation.dist} mi away</div>
        </div>
      )}
      {}
      {forecastHazards && (
        <div className="absolute z-[1100] right-0 top-0 h-full w-72 max-w-[90vw]"
          style={{ pointerEvents: showForecast ? 'auto' : 'none' }}>
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 transition-transform duration-300 ${showForecast ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="rounded-l-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl w-64">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-white">Forecast</span>
                {nearestStation?.city && <span className="text-[10px] text-slate-400">{nearestStation.city}, {nearestStation.state}</span>}
              </div>
              <div className="space-y-2">
                {forecastHazards.map((p, i) => (
                  <div key={i} className={`rounded-xl p-2.5 border ${p.hasTornado ? 'border-red-500/40 bg-red-950/40' : p.hasTstorm ? 'border-orange-500/30 bg-orange-950/30' : 'border-white/5 bg-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white">{p.icon} {p.name}</span>
                      <span className="text-[11px] font-black text-cyan-300">{p.temp}°{p.unit}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.short}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">💨 {p.wind}</div>
                    {p.hasTornado && <div className="text-[10px] font-bold text-red-400 mt-1">⚠️ Tornado possible</div>}
                    {p.hasHail && <div className="text-[10px] font-bold text-blue-400 mt-0.5">🌨️ Hail possible</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForecast(v => !v)}
            className={`absolute right-64 top-1/2 -translate-y-1/2 flex h-10 w-7 items-center justify-center rounded-l-xl border border-white/10 shadow-lg backdrop-blur-sm transition-colors ${showForecast ? 'bg-cyan-700 text-white' : 'bg-slate-900/90 text-slate-400'}`}
            style={{ pointerEvents: 'auto' }}
            aria-label="Toggle forecast panel"
          >
            {showForecast ? '›' : '‹'}
          </button>
        </div>
      )}
      <ShelterAlert activeTornadoWarning={activeTornadoWarning} activeTornadoWatch={activeTornadoWatch} userLocation={userLocation} />
    </div>
  );
}