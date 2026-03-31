import { useState, useEffect } from "react";
import L from "leaflet";

const WORKER_BASE = "https://youneek-radar-worker.youneekartifacts.workers.dev";

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function getGeometryPoints(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates[0] || [];
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  if (geometry.type === "Point") return [geometry.coordinates];
  return [];
}
function featureIsNearUser(feature, userLocation, maxDistanceKm = 150) {
  const points = getGeometryPoints(feature?.geometry);
  return points.some(([lon, lat]) => haversineKm(lat, lon, userLocation.lat, userLocation.lon) <= maxDistanceKm);
}

export default function useRadarLayers({
  isMapReady, leafletMap, settings, userLocation, setUserLocation, alertToggles,
  stormMarkerGroupRef, hookLayerGroupRef, countyWarningLayerRef, vectorLayerGroupRef,
  mesoLayerGroupRef, hailLayerGroupRef, spotterLayerGroupRef, lightningLayerGroupRef,
  baseLayerRef, radarLayerRef, velLayerRef, radarLayer2Ref,
  userLocationMarkerRef, lastRadarUpdateRef, staleTimerRef,
  radarOpacity,
}) {
  const [stormReports, setStormReports] = useState([]);
  const [isStale, setIsStale] = useState(false);
  const [hookZones, setHookZones] = useState([]);
  const [stormVectors, setStormVectors] = useState([]);
  const [baseLayer, setBaseLayer] = useState("dark");
  const [mesoMarkers, setMesoMarkers] = useState([]);
  const [hailReports, setHailReports] = useState([]);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [spotterReports, setSpotterReports] = useState([]);
  const [srhData, setSrhData] = useState(null);
  const [lightningStrikes, setLightningStrikes] = useState([]);
  const [showLightning, setShowLightning] = useState(false);
  const [forecastHazards, setForecastHazards] = useState([]);
  const [showForecast, setShowForecast] = useState(false);
  const [nearestStation, setNearestStation] = useState(null);

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

  return {
    stormReports, isStale, hookZones, stormVectors,
    baseLayer, setBaseLayer, mesoMarkers, hailReports,
    showShareBanner, setShowShareBanner, spotterReports, srhData,
    lightningStrikes, showLightning, setShowLightning,
    forecastHazards, showForecast, setShowForecast,
    nearestStation,
  };
}
