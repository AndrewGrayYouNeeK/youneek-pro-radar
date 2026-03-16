import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const STATIONS = {
  // Northeast
  KOKX: { lat: 40.866, lon: -72.864, nwsZoneId: "NYZ071" },
  KBOX: { lat: 41.956, lon: -71.137, nwsZoneId: "MAZ009" },
  KBGM: { lat: 42.200, lon: -75.985, nwsZoneId: "NYZ039" },
  KBUF: { lat: 42.949, lon: -78.737, nwsZoneId: "NYZ014" },
  KENX: { lat: 42.586, lon: -74.064, nwsZoneId: "NYZ054" },
  KPBZ: { lat: 40.532, lon: -80.218, nwsZoneId: "PAZ018" },
  KCCX: { lat: 40.923, lon: -78.004, nwsZoneId: "PAZ032" },
  KDIX: { lat: 39.947, lon: -74.411, nwsZoneId: "NJZ006" },
  // Southeast
  KFFC: { lat: 33.364, lon: -84.566, nwsZoneId: "GAZ030" },
  KAMX: { lat: 25.611, lon: -80.413, nwsZoneId: "FLZ063" },
  KTBW: { lat: 27.705, lon: -82.402, nwsZoneId: "FLZ034" },
  KJAX: { lat: 30.485, lon: -81.702, nwsZoneId: "FLZ015" },
  KCLX: { lat: 32.656, lon: -81.042, nwsZoneId: "SCZ040" },
  KRAX: { lat: 35.665, lon: -78.490, nwsZoneId: "NCZ041" },
  KAKQ: { lat: 36.984, lon: -77.007, nwsZoneId: "VAZ075" },
  KLWX: { lat: 38.975, lon: -77.478, nwsZoneId: "MDZ009" },
  // Midwest
  KLOT: { lat: 41.604, lon: -88.085, nwsZoneId: "ILZ003" },
  KGRR: { lat: 42.894, lon: -85.545, nwsZoneId: "MIZ050" },
  KAPX: { lat: 44.907, lon: -84.720, nwsZoneId: "MIZ009" },
  KMKX: { lat: 42.968, lon: -88.551, nwsZoneId: "WIZ064" },
  KDVN: { lat: 41.612, lon: -90.581, nwsZoneId: "IAZ040" },
  KILX: { lat: 40.151, lon: -89.337, nwsZoneId: "ILZ048" },
  KLSX: { lat: 38.699, lon: -90.683, nwsZoneId: "MOZ069" },
  KEAX: { lat: 38.810, lon: -94.264, nwsZoneId: "MOZ011" },
  KTWX: { lat: 38.997, lon: -96.232, nwsZoneId: "KSZ029" },
  KICT: { lat: 37.655, lon: -97.443, nwsZoneId: "KSZ070" },
  // Ohio Valley
  KIND: { lat: 39.708, lon: -86.280, nwsZoneId: "INZ052" },
  KILN: { lat: 39.420, lon: -83.822, nwsZoneId: "OHZ052" },
  KLVX: { lat: 37.975, lon: -85.944, nwsZoneId: "KYZ044" },
  KPAH: { lat: 37.068, lon: -88.772, nwsZoneId: "KYZ095" },
  KOHX: { lat: 36.247, lon: -86.563, nwsZoneId: "TNZ058" },
  KNQA: { lat: 35.345, lon: -89.873, nwsZoneId: "TNZ086" },
  KHTX: { lat: 34.931, lon: -86.084, nwsZoneId: "ALZ011" },
  KBMX: { lat: 33.172, lon: -86.770, nwsZoneId: "ALZ040" },
  KGWX: { lat: 33.897, lon: -88.329, nwsZoneId: "MSZ033" },
  // South Central
  KLZK: { lat: 34.836, lon: -92.262, nwsZoneId: "ARZ034" },
  KTLX: { lat: 35.333, lon: -97.278, nwsZoneId: "OKZ025" },
  KINX: { lat: 36.175, lon: -95.565, nwsZoneId: "OKZ009" },
  KFWS: { lat: 32.573, lon: -97.303, nwsZoneId: "TXZ119" },
  KSHV: { lat: 32.451, lon: -93.841, nwsZoneId: "LAZ011" },
  KPOE: { lat: 31.155, lon: -92.976, nwsZoneId: "LAZ029" },
  KLIX: { lat: 30.337, lon: -89.825, nwsZoneId: "LAZ064" },
  KMOB: { lat: 30.679, lon: -88.240, nwsZoneId: "ALZ070" },
  // High Plains
  KABR: { lat: 45.456, lon: -98.413, nwsZoneId: "SDZ005" },
  KBIS: { lat: 46.771, lon: -100.760, nwsZoneId: "NDZ031" },
  KMBX: { lat: 48.393, lon: -100.865, nwsZoneId: "NDZ007" },
  KFSD: { lat: 43.588, lon: -96.729, nwsZoneId: "SDZ023" },
  KUEX: { lat: 40.321, lon: -98.442, nwsZoneId: "NEZ055" },
  KOAX: { lat: 41.320, lon: -96.367, nwsZoneId: "NEZ020" },
  KDDC: { lat: 37.761, lon: -99.969, nwsZoneId: "KSZ088" },
  KAMA: { lat: 35.234, lon: -101.709, nwsZoneId: "TXZ035" },
  // Mountain West / Southwest
  KFTG: { lat: 39.787, lon: -104.546, nwsZoneId: "COZ039" },
  KPUX: { lat: 38.460, lon: -104.182, nwsZoneId: "COZ083" },
  KGJX: { lat: 39.062, lon: -108.214, nwsZoneId: "COZ060" },
  KIWA: { lat: 33.289, lon: -111.670, nwsZoneId: "AZZ503" },
  KEMX: { lat: 31.894, lon: -110.630, nwsZoneId: "AZZ505" },
  KABX: { lat: 35.150, lon: -106.824, nwsZoneId: "NMZ005" },
  KFSX: { lat: 34.574, lon: -111.198, nwsZoneId: "AZZ501" },
  KESX: { lat: 35.701, lon: -114.891, nwsZoneId: "NVZ012" },
  KVTX: { lat: 34.412, lon: -119.179, nwsZoneId: "CAZ039" },
  KHNX: { lat: 36.314, lon: -119.632, nwsZoneId: "CAZ048" },
  KMUX: { lat: 37.155, lon: -121.898, nwsZoneId: "CAZ505" },
  // Northwest
  KATX: { lat: 47.520, lon: -122.494, nwsZoneId: "WAZ002" },
  KRTX: { lat: 45.715, lon: -122.965, nwsZoneId: "ORZ006" },
  KPDT: { lat: 45.691, lon: -118.853, nwsZoneId: "ORZ058" },
  KOTX: { lat: 47.681, lon: -117.627, nwsZoneId: "WAZ052" },
  KMSX: { lat: 47.041, lon: -113.986, nwsZoneId: "MTZ301" },
  KTFX: { lat: 47.460, lon: -111.385, nwsZoneId: "MTZ101" },
  // Alaska
  PAEC: { lat: 60.793, lon: -161.876, nwsZoneId: "AKZ201" },
  PAPD: { lat: 65.036, lon: -147.499, nwsZoneId: "AKZ101" },
  PAHG: { lat: 60.726, lon: -151.351, nwsZoneId: "AKZ116" },
  // Hawaii / Puerto Rico
  PHKI: { lat: 21.894, lon: -159.552, nwsZoneId: "HIZ001" },
  PHMO: { lat: 21.133, lon: -157.180, nwsZoneId: "HIZ010" },
  TJUA: { lat: 18.116, lon: -66.078, nwsZoneId: "PRZ001" },
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