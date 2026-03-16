import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const STATIONS = {
  KTLX: { lat: 35.333, lon: -97.278, nwsZoneId: "OKZ025" },
  KLOT: { lat: 41.604, lon: -88.085, nwsZoneId: "ILZ003" },
  KORD: { lat: 41.979, lon: -87.908, nwsZoneId: "ILZ003" },
  KFFC: { lat: 33.364, lon: -84.566, nwsZoneId: "GAZ030" },
  KFWS: { lat: 32.573, lon: -97.303, nwsZoneId: "TXZ119" },
  KOKX: { lat: 40.866, lon: -72.864, nwsZoneId: "NYZ071" },
  KAMX: { lat: 25.611, lon: -80.413, nwsZoneId: "FLZ063" },
  KFTG: { lat: 39.787, lon: -104.546, nwsZoneId: "COZ039" },
  KATX: { lat: 47.52,  lon: -122.494, nwsZoneId: "WAZ002" },
  KIWA: { lat: 33.289, lon: -111.670, nwsZoneId: "AZZ503" },
  KBOX: { lat: 41.956, lon: -71.137, nwsZoneId: "MAZ009" },
};

async function fetchGifAsBase64(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binaryString);
  } catch (e) {
    console.error("Error fetching GIF:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const station = (body.station || 'KTLX').toUpperCase();
    const rangeNm = body.rangeNm || 100;

    const stationInfo = STATIONS[station] || STATIONS.KTLX;
    const { nwsZoneId } = stationInfo;

    // Fetch reflectivity and velocity GIFs from NOAA RIDGE2
    const reflUrl = `https://radar.weather.gov/ridge/standard/${station}_0.gif`;
    const velUrl  = `https://radar.weather.gov/ridge/standard/base_velocity/${station}_0.gif`;

    const [reflBase64, velBase64] = await Promise.all([
      fetchGifAsBase64(reflUrl),
      fetchGifAsBase64(velUrl),
    ]);

    // Check for active tornado warnings in the station's zone
    let isTornadoWarning = false;
    let nwsAlerts = [];
    try {
      const alertsRes = await fetch(`https://api.weather.gov/alerts/active?zone=${nwsZoneId}`);
      if (alertsRes.ok) {
        const json = await alertsRes.json();
        nwsAlerts = (json.features || []).filter(a => a.properties.event === "Tornado Warning");
        isTornadoWarning = nwsAlerts.length > 0;
      }
    } catch (e) {
      console.error("Alerts fetch failed:", e);
    }

    return Response.json({
      station,
      reflUrl,
      reflBase64,
      velUrl,
      velBase64,
      isTornadoWarning,
      nwsAlerts: nwsAlerts.map(a => ({
        headline: a.properties.headline,
        expires: a.properties.expires,
      })),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});