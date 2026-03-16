import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import parser from 'npm:nexrad-level-3-data@0.6.1';

// List latest files from the NEXRAD Level 3 S3 bucket and return the most recent one
async function getLatestFileKey(station, product) {
  const prefix = `${station}_${product}`;
  const url = `https://unidata-nexrad-level3.s3.amazonaws.com/?list-type=2&prefix=${prefix}&max-keys=5`;
  const res = await fetch(url);
  const text = await res.text();

  // Parse XML keys from S3 ListObjectsV2 response
  const keys = [...text.matchAll(/<Key>([^<]+)<\/Key>/g)].map(m => m[1]);
  if (keys.length === 0) throw new Error(`No files found for ${station} ${product}`);

  // Sort descending and take the most recent
  keys.sort((a, b) => b.localeCompare(a));
  return keys[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const station = (body.station || 'KLOT').toUpperCase();
    const product = body.product || 'N0R';

    // Get the latest file key
    const key = await getLatestFileKey(station, product);

    // Fetch the binary file
    const fileRes = await fetch(`https://unidata-nexrad-level3.s3.amazonaws.com/${key}`);
    if (!fileRes.ok) throw new Error(`Failed to fetch file: ${fileRes.status}`);

    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse with nexrad-level-3-data (suppress console noise)
    const data = parser(buffer, { logger: false });

    // Extract radials from the parsed data
    // The radial data is in data.data.radials for product 94 (NXQ/N0R digital)
    // or data.data.packet.radials for older products
    let radials = null;
    if (data?.data?.radials) {
      radials = data.data.radials;
    } else if (data?.data?.packet?.radials) {
      radials = data.data.packet.radials;
    } else if (data?.data?.packets) {
      // Find first radial packet
      for (const pkt of data.data.packets) {
        if (pkt.radials) { radials = pkt.radials; break; }
      }
    }

    if (!radials || radials.length === 0) {
      return Response.json({ error: 'No radial data found', raw: JSON.stringify(data).slice(0, 500) }, { status: 422 });
    }

    // Build a compact radial array: [{angle, angleWidth, gates:[dBZ values]}]
    // For product 94 (digital), scale: value * 0.5 - 33  → dBZ
    // For product 19/20 (N0R legacy), data levels map differently
    const isDigital = data?.header?.code === 94 || data?.header?.code === 99;

    const compactRadials = radials.map(r => {
      const gates = (r.gates || r.data || []).map(v => {
        if (v <= 1) return null; // no data / below threshold
        return isDigital ? (v * 0.5 - 33) : (v * 0.5 - 33); // same formula for N0R
      });
      return {
        angle: r.startAngle ?? r.angle ?? 0,
        angleWidth: r.angleDelta ?? r.angleWidth ?? 1,
        gates,
      };
    });

    // Get range info from header
    const rangeKm = data?.productDescription?.maxDataRange
      ?? data?.header?.rangeFirstGate
      ?? 230;

    return Response.json({
      station,
      product,
      key,
      timestamp: data?.header?.dateTime ?? null,
      rangeKm,
      numGates: compactRadials[0]?.gates?.length ?? 0,
      radials: compactRadials,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});