import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Station coordinates (lat, lon) for bounding box calculation
const STATIONS = {
  KLOT: { lat: 41.604, lon: -88.085 },
  KORD: { lat: 41.979, lon: -87.908 },
  KATL: { lat: 33.364, lon: -84.428 },
  KDFW: { lat: 32.573, lon: -97.303 },
  KNYC: { lat: 40.866, lon: -72.864 },
  KMIA: { lat: 25.611, lon: -80.413 },
  KDEN: { lat: 39.787, lon: -104.546 },
  KSEA: { lat: 47.52,  lon: -122.494 },
  KPHX: { lat: 33.422, lon: -112.186 },
  KBOS: { lat: 41.956, lon: -71.137 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const station = (body.station || 'KLOT').toUpperCase();
    const rangeNm = body.rangeNm || 100; // nautical miles radius to show

    const stationInfo = STATIONS[station] || STATIONS.KLOT;
    const { lat, lon } = stationInfo;

    // Convert nautical miles to degrees (approx)
    const nmToDeg = rangeNm / 60;
    const bbox = {
      xmin: lon - nmToDeg * 1.3,
      ymin: lat - nmToDeg,
      xmax: lon + nmToDeg * 1.3,
      ymax: lat + nmToDeg,
    };

    // Fetch radar image from NOAA MRMS MapServer (live, updates every 5-10 min)
    const exportUrl = new URL('https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity/MapServer/export');
    exportUrl.searchParams.set('bbox', `${bbox.xmin},${bbox.ymin},${bbox.xmax},${bbox.ymax}`);
    exportUrl.searchParams.set('bboxSR', '4326');
    exportUrl.searchParams.set('size', '512,512');
    exportUrl.searchParams.set('imageSR', '4326');
    exportUrl.searchParams.set('format', 'png32');
    exportUrl.searchParams.set('transparent', 'true');
    exportUrl.searchParams.set('f', 'json');

    const metaRes = await fetch(exportUrl.toString());
    const meta = await metaRes.json();

    if (!meta.href) {
      throw new Error('No image URL returned from NOAA MapServer');
    }

    return Response.json({
      station,
      lat,
      lon,
      rangeNm,
      bbox,
      imageUrl: meta.href,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});