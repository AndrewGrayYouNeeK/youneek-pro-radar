import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { LocateFixed } from "lucide-react";
import RadarLayersMenu from "./RadarLayersMenu";
import ShelterAlert from "./ShelterAlert";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths
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
const invalidateMapSize = (map) => {
  requestAnimationFrame(() => map.invalidateSize());
  setTimeout(() => map.invalidateSize(), 150);
};

function formatRainViewerTime(frame) {
  const timestamp = frame?.time || Number(String(frame?.path || "").match(/(\d{10})/)?.[1]);
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getGeometryPoints(geometry) {
  if (!geometry?.coordinates) return [];

  const flattenCoords = (coords) => {
    if (!Array.isArray(coords[0])) return [coords];
    return coords.flatMap(flattenCoords);
  };

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
  const [menuOpen, setMenuOpen] = useState(false);
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
  const alertToggles = {
    tornado: showTornado,
    severe: showThunderstorm,
    flood: showFlood,
    winter: showWinter,
  };
  const alertTogglesRef = useRef(alertToggles);

  useEffect(() => {
    if (leafletMap.current || !mapRef.current) return;

    const coords = STATION_COORDS[settings.station] || [37.8, -85.5];

    leafletMap.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
      zoomSnap: 0.5,
    }).setView(coords, 8);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: "abcd",
      maxZoom: 20,
      crossOrigin: "anonymous",
    }).addTo(leafletMap.current);

    invalidateMapSize(leafletMap.current);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      if (loopFadeRef.current) clearInterval(loopFadeRef.current);
      if (prevLoopLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(prevLoopLayerRef.current);
        prevLoopLayerRef.current = null;
      }
      if (loopLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(loopLayerRef.current);
        loopLayerRef.current = null;
      }
      loopLayersRef.current.forEach((layer) => {
        if (leafletMap.current?.hasLayer(layer)) {
          leafletMap.current.removeLayer(layer);
        }
      });
      loopLayersRef.current = [];
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
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

    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    setShowVelocityLocal(settings.showVelocity);
  }, [settings.showVelocity]);

  useEffect(() => {
    alertTogglesRef.current = alertToggles;
  }, [alertToggles]);

  useEffect(() => {
    if (!leafletMap.current) return;

    if (radarLayerRef.current) {
      leafletMap.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }
    if (velLayerRef.current) {
      leafletMap.current.removeLayer(velLayerRef.current);
      velLayerRef.current = null;
    }
    [tornadoLayerRef, thunderLayerRef, floodLayerRef, winterLayerRef].forEach((layerRef) => {
      if (layerRef.current) {
        leafletMap.current.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    });
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    radarLoadStatsRef.current = { errors: 0, loaded: 0, usingFallback: false };

    if (!showNexrad) {
      setActiveTornadoWarning(false);
      return;
    }

    const addVelocityLayer = () => {
      if (velLayerRef.current) {
        leafletMap.current.removeLayer(velLayerRef.current);
        velLayerRef.current = null;
      }
      if (!showVelocityLocal || !leafletMap.current) return;

      velLayerRef.current = L.tileLayer.wms(
        "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0u.cgi",
        {
          layers: "nexrad-n0u",
          format: "image/png",
          transparent: true,
          opacity: 0.6,
        }
      ).addTo(leafletMap.current);
    };

    const refreshAlertLayer = (layerRef, toggleKey, url, color) => {
      if (layerRef.current) {
        leafletMap.current.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      if (!leafletMap.current || !showNexrad) return;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (!leafletMap.current) return;

          if (toggleKey === "tornado") {
            const features = data?.features || [];
            setActiveTornadoWarning(
              Boolean(userLocation) && features.some((feature) => isFeatureNearLocation(feature, userLocation, 150))
            );
          }

          if (!alertTogglesRef.current[toggleKey]) return;

          layerRef.current = L.geoJSON(data, {
            style: {
              color,
              weight: 2,
              opacity: 0.95,
              fillColor: color,
              fillOpacity: 0.18,
            },
          }).addTo(leafletMap.current);
        });
    };

    const refreshAlertLayers = () => {
      refreshAlertLayer(
        tornadoLayerRef,
        "tornado",
        "https://api.weather.gov/alerts/active?event=Tornado+Warning&status=actual",
        "#ef4444"
      );
      refreshAlertLayer(
        thunderLayerRef,
        "severe",
        "https://api.weather.gov/alerts/active?event=Severe+Thunderstorm+Warning&status=actual",
        "#f97316"
      );
      refreshAlertLayer(
        floodLayerRef,
        "flood",
        "https://api.weather.gov/alerts/active?event=Flood+Warning&status=actual",
        "#3b82f6"
      );
      refreshAlertLayer(
        winterLayerRef,
        "winter",
        "https://api.weather.gov/alerts/active?event=Winter+Weather+Advisory&status=actual",
        "#a855f7"
      );
    };

    const loadRainViewerFallback = () => {
      if (radarLoadStatsRef.current.usingFallback || !leafletMap.current) return;
      radarLoadStatsRef.current.usingFallback = true;

      if (radarLayerRef.current) {
        leafletMap.current.removeLayer(radarLayerRef.current);
        radarLayerRef.current = null;
      }

      fetch("https://api.rainviewer.com/public/weather-maps.json")
        .then((response) => response.json())
        .then((data) => {
          const latestPath = data?.radar?.past?.[data.radar.past.length - 1]?.path;
          const fallbackUrl = getRainViewerTileUrl(latestPath);
          if (!fallbackUrl || !leafletMap.current) return;

          radarLayerRef.current = L.tileLayer(fallbackUrl, {
            attribution: "RainViewer",
            opacity: 0.7,
            maxZoom: 18,
            maxNativeZoom: 12,
            crossOrigin: "anonymous",
          }).addTo(leafletMap.current);

          addVelocityLayer();
          refreshAlertLayers();
        });
    };

    const cb = getCacheBust();
    const opacity = 0.7;
    const iowaLayer = L.tileLayer(`${RIDGE2_URL}?_cb=${cb}`, {
      opacity: opacity,
      transparent: true,
      crossOrigin: true,
      tileSize: 256,
      maxZoom: 18,
      maxNativeZoom: 12,
      attribution: 'NEXRAD © <a href="https://mesonet.agron.iastate.edu/">Iowa Mesonet</a>',
    });

    iowaLayer.on("tileload", () => {
      radarLoadStatsRef.current.loaded += 1;
    });

    iowaLayer.on("tileerror", () => {
      radarLoadStatsRef.current.errors += 1;
      if (radarLoadStatsRef.current.errors >= 3 && radarLoadStatsRef.current.loaded === 0) {
        loadRainViewerFallback();
      }
    });

    radarLayerRef.current = iowaLayer.addTo(leafletMap.current);
    addVelocityLayer();
    refreshAlertLayers();

    refreshTimerRef.current = setInterval(() => {
      if (radarLayerRef.current?.setUrl && !radarLoadStatsRef.current.usingFallback) {
        radarLoadStatsRef.current.errors = 0;
        radarLoadStatsRef.current.loaded = 0;
        radarLayerRef.current.setUrl(getIowaReflectivityUrl());
      }
      if (velLayerRef.current?.redraw) {
        velLayerRef.current.redraw();
      }
      refreshAlertLayers();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(refreshTimerRef.current);
      if (prevLoopLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(prevLoopLayerRef.current);
        prevLoopLayerRef.current = null;
      }
      if (loopLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(loopLayerRef.current);
        loopLayerRef.current = null;
      }
    };
  }, [
    showNexrad,
    settings.showVelocity,
    showVelocityLocal,
    settings.station,
    showTornado,
    showThunderstorm,
    showFlood,
    showWinter,
    userLocation,
  ]);

  const handleHookZoneView = () => {
    if (!leafletMap.current) return;
    leafletMap.current.setView([36.8, -87.3], 9);
  };

  const handleConusView = () => {
    if (!leafletMap.current) return;
    leafletMap.current.setView([39.5, -98.35], 5);
  };

  const clearLoopLayers = () => {
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    if (loopFadeRef.current) {
      clearInterval(loopFadeRef.current);
      loopFadeRef.current = null;
    }
    if (leafletMap.current) {
      loopLayersRef.current.forEach((layer) => {
        if (leafletMap.current.hasLayer(layer)) {
          leafletMap.current.removeLayer(layer);
        }
      });
    }
    loopLayersRef.current = [];
    loopLayerRef.current = null;
    prevLoopLayerRef.current = null;
    loopIndexRef.current = 0;
    setLoopFrameIndex(0);
    if (radarLayerRef.current?.setOpacity) {
      radarLayerRef.current.setOpacity(0.7);
    }
  };

  const fetchLoopFrames = () => {
    if (!leafletMap.current) return;

    clearLoopLayers();

    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((response) => response.json())
      .then((data) => {
        const frames = (data?.radar?.past || [])
          .filter((item) => item?.path)
          .map((item) => ({
            path: item.path,
            label: formatRainViewerTime(item),
          }));

        const preloadPromises = frames.map((frame) => new Promise((resolve) => {
          const layer = L.tileLayer(getRainViewerTileUrl(frame.path), {
            opacity: 0,
            maxZoom: 18,
            maxNativeZoom: 12,
            crossOrigin: "anonymous",
          });

          const finish = () => resolve(layer);
          layer.once("load", finish);
          layer.once("tileerror", finish);
          layer.addTo(leafletMap.current);
        }));

        Promise.all(preloadPromises).then((layers) => {
          if (!leafletMap.current) return;

          loopLayersRef.current = layers;
          loopIndexRef.current = 0;
          setLoopFrames(frames);
          setLoopFrameIndex(0);
          layers.forEach((layer, index) => layer.setOpacity(index === 0 ? 0.7 : 0));
          loopLayerRef.current = layers[0] || null;
          prevLoopLayerRef.current = null;
          if (radarLayerRef.current?.setOpacity) {
            radarLayerRef.current.setOpacity(0);
          }
          setIsLooping(true);
        });
      });
  };

  const handleLoopToggle = () => {
    if (isLooping) {
      setIsLooping(false);
      clearLoopLayers();
      return;
    }

    fetchLoopFrames();
  };

  const handleShowNexradChange = (value) => {
    onSettingsChange({ ...settings, showNexrad: value });
  };

  const handleShowVelocityChange = (value) => {
    setShowVelocityLocal(value);
    onSettingsChange({ ...settings, showVelocity: value });
  };

  const handleAlertToggleChange = (key, value) => {
    if (key === "tornado") setShowTornado(value);
    if (key === "severe") setShowThunderstorm(value);
    if (key === "flood") setShowFlood(value);
    if (key === "winter") setShowWinter(value);
  };

  useEffect(() => {
    if (!leafletMap.current || !isLooping || !loopFrames.length || !loopLayersRef.current.length) {
      return;
    }

    if (radarLayerRef.current?.setOpacity) {
      radarLayerRef.current.setOpacity(0);
    }

    const animateToNextFrame = () => {
      const currentIndex = loopIndexRef.current;
      const nextIndex = (currentIndex + 1) % loopLayersRef.current.length;
      const outgoingLayer = loopLayersRef.current[currentIndex];
      const incomingLayer = loopLayersRef.current[nextIndex];

      if (!outgoingLayer || !incomingLayer) return;

      prevLoopLayerRef.current = outgoingLayer;
      loopLayerRef.current = incomingLayer;
      incomingLayer.setOpacity(0);

      let step = 0;
      const totalSteps = 8;
      if (loopFadeRef.current) {
        clearInterval(loopFadeRef.current);
      }

      loopFadeRef.current = setInterval(() => {
        step += 1;
        const progress = Math.min(step / totalSteps, 1);
        outgoingLayer.setOpacity(0.7 * (1 - progress));
        incomingLayer.setOpacity(0.7 * progress);

        if (progress >= 1) {
          clearInterval(loopFadeRef.current);
          loopFadeRef.current = null;
          outgoingLayer.setOpacity(0);
          incomingLayer.setOpacity(0.7);
        }
      }, 25);

      loopIndexRef.current = nextIndex;
      setLoopFrameIndex(nextIndex);
      const isLastFrame = nextIndex === loopLayersRef.current.length - 1;
      loopTimerRef.current = setTimeout(animateToNextFrame, isLastFrame ? 1500 : 700);
    };

    loopLayersRef.current.forEach((layer, index) => layer.setOpacity(index === loopIndexRef.current ? 0.7 : 0));
    setLoopFrameIndex(loopIndexRef.current);
    const isLastFrame = loopIndexRef.current === loopLayersRef.current.length - 1;
    loopTimerRef.current = setTimeout(animateToNextFrame, isLastFrame ? 1500 : 700);

    return () => {
      if (loopTimerRef.current) {
        clearTimeout(loopTimerRef.current);
        loopTimerRef.current = null;
      }
      if (loopFadeRef.current) {
        clearInterval(loopFadeRef.current);
        loopFadeRef.current = null;
      }
    };
  }, [isLooping, loopFrames]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Browser won't let me find you—turn on location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lon: longitude });
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
    <div className="relative h-full min-h-[400px] w-full">
      <div className="absolute left-3 top-20 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleHookZoneView}
          className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        >
          🌀 Hook Zone
        </button>
        <button
          onClick={handleConusView}
          className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        >
          🗺️ CONUS
        </button>
        <button
          onClick={handleLoopToggle}
          className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-800/90"
        >
          {isLooping ? "⏹ Loop" : "▶ Loop"}
        </button>
        {isLooping && loopFrames.length > 0 && (
          <div className="rounded-lg bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-sm">
            Frame {loopFrameIndex + 1}/{loopFrames.length}
            <div className="mt-1 text-[11px] text-slate-300">{loopFrames[loopFrameIndex]?.label}</div>
          </div>
        )}
      </div>
      <RadarLayersMenu
        showNexrad={showNexrad}
        showVelocity={showVelocityLocal}
        showRadio={showRadio}
        nexradStation={settings.station}
        alertToggles={alertToggles}
        onShowNexradChange={handleShowNexradChange}
        onShowVelocityChange={handleShowVelocityChange}
        onShowRadioChange={onToggleRadio}
        onAlertToggleChange={handleAlertToggleChange}
      />
      <button
        onClick={handleLocateMe}
        className="absolute bottom-24 right-5 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700"
        aria-label="Locate me"
      >
        <LocateFixed size={24} />
      </button>
      <div ref={mapRef} className="absolute inset-0 h-full min-h-[400px] w-full" />
      <ShelterAlert
        activeTornadoWarning={true}
        userLocation={userLocation}
      />
    </div>
  );
}