import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const STATIONS = {
  KOKX: { nwsZoneId: "NYZ071" }, KBOX: { nwsZoneId: "MAZ009" }, KBGM: { nwsZoneId: "NYZ039" },
  KBUF: { nwsZoneId: "NYZ014" }, KENX: { nwsZoneId: "NYZ054" }, KPBZ: { nwsZoneId: "PAZ018" },
  KCCX: { nwsZoneId: "PAZ032" }, KDIX: { nwsZoneId: "NJZ006" }, KDOX: { nwsZoneId: "DEZ002" },
  KAKQ: { nwsZoneId: "VAZ075" }, KLWX: { nwsZoneId: "MDZ009" }, KFCX: { nwsZoneId: "VAZ037" },
  KFFC: { nwsZoneId: "GAZ030" }, KAMX: { nwsZoneId: "FLZ063" }, KTBW: { nwsZoneId: "FLZ034" },
  KJAX: { nwsZoneId: "FLZ015" }, KCLX: { nwsZoneId: "SCZ040" }, KRAX: { nwsZoneId: "NCZ041" },
  KMHX: { nwsZoneId: "NCZ196" }, KLTX: { nwsZoneId: "NCZ108" }, KGSP: { nwsZoneId: "SCZ004" },
  KJGX: { nwsZoneId: "GAZ120" }, KEVX: { nwsZoneId: "FLZ108" }, KMLB: { nwsZoneId: "FLZ057" },
  KBYX: { nwsZoneId: "FLZ078" }, KIND: { nwsZoneId: "INZ052" }, KILN: { nwsZoneId: "OHZ052" },
  KLVX: { nwsZoneId: "KYZ044" }, KHPX: { nwsZoneId: "KYZ068" },
  KJKL: { nwsZoneId: "KYZ082" }, KPAH: { nwsZoneId: "KYZ095" },
  KOHX: { nwsZoneId: "TNZ058" }, KNQA: { nwsZoneId: "TNZ086" }, KHTX: { nwsZoneId: "ALZ011" },
  KBMX: { nwsZoneId: "ALZ040" }, KGWX: { nwsZoneId: "MSZ033" }, KIWX: { nwsZoneId: "INZ005" },
  KLOT: { nwsZoneId: "ILZ003" }, KGRR: { nwsZoneId: "MIZ050" }, KAPX: { nwsZoneId: "MIZ009" },
  KMKX: { nwsZoneId: "WIZ064" }, KDTX: { nwsZoneId: "MIZ075" }, KCLE: { nwsZoneId: "OHZ006" },
  KDVN: { nwsZoneId: "IAZ040" }, KILX: { nwsZoneId: "ILZ048" }, KLSX: { nwsZoneId: "MOZ069" },
  KEAX: { nwsZoneId: "MOZ011" }, KTWX: { nwsZoneId: "KSZ029" }, KICT: { nwsZoneId: "KSZ070" },
  KDMX: { nwsZoneId: "IAZ048" }, KMPX: { nwsZoneId: "MNZ060" }, KDLH: { nwsZoneId: "MNZ020" },
  KLZK: { nwsZoneId: "ARZ034" }, KTLX: { nwsZoneId: "OKZ025" }, KINX: { nwsZoneId: "OKZ009" },
  KFWS: { nwsZoneId: "TXZ119" }, KSHV: { nwsZoneId: "LAZ011" }, KPOE: { nwsZoneId: "LAZ029" },
  KLIX: { nwsZoneId: "LAZ064" }, KMOB: { nwsZoneId: "ALZ070" }, KHGX: { nwsZoneId: "TXZ163" },
  KEWX: { nwsZoneId: "TXZ204" }, KCRP: { nwsZoneId: "TXZ242" }, KBRO: { nwsZoneId: "TXZ271" },
  KABR: { nwsZoneId: "SDZ005" }, KBIS: { nwsZoneId: "NDZ031" }, KMBX: { nwsZoneId: "NDZ007" },
  KFSD: { nwsZoneId: "SDZ023" }, KUEX: { nwsZoneId: "NEZ055" }, KOAX: { nwsZoneId: "NEZ020" },
  KDDC: { nwsZoneId: "KSZ088" }, KAMA: { nwsZoneId: "TXZ035" }, KUDX: { nwsZoneId: "SDZ040" },
  KFTG: { nwsZoneId: "COZ039" }, KPUX: { nwsZoneId: "COZ083" }, KGJX: { nwsZoneId: "COZ060" },
  KIWA: { nwsZoneId: "AZZ503" }, KEMX: { nwsZoneId: "AZZ505" }, KABX: { nwsZoneId: "NMZ005" },
  KFSX: { nwsZoneId: "AZZ501" }, KESX: { nwsZoneId: "NVZ012" }, KVTX: { nwsZoneId: "CAZ039" },
  KHNX: { nwsZoneId: "CAZ048" }, KMUX: { nwsZoneId: "CAZ505" }, KBBX: { nwsZoneId: "CAZ013" },
  KBHX: { nwsZoneId: "CAZ112" }, KMAX: { nwsZoneId: "ORZ018" }, KATX: { nwsZoneId: "WAZ002" },
  KRTX: { nwsZoneId: "ORZ006" }, KPDT: { nwsZoneId: "ORZ058" }, KOTX: { nwsZoneId: "WAZ052" },
  KMSX: { nwsZoneId: "MTZ301" }, KTFX: { nwsZoneId: "MTZ101" }, KCBX: { nwsZoneId: "IDZ006" },
  PAEC: { nwsZoneId: "AKZ201" }, PAPD: { nwsZoneId: "AKZ101" }, PAHG: { nwsZoneId: "AKZ116" },
  PAKC: { nwsZoneId: "AKZ180" }, PHKI: { nwsZoneId: "HIZ001" }, PHMO: { nwsZoneId: "HIZ010" },
  PHKM: { nwsZoneId: "HIZ021" }, PHWA: { nwsZoneId: "HIZ025" }, TJUA: { nwsZoneId: "PRZ001" },
};

async function fetchImageAsBase64(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 NOAA-RIDGE-Proxy/1.0" }
  });
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${url}`);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return "data:image/gif;base64," + btoa(binary);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const station = (body.station || 'KTLX').toUpperCase();
    const showVelocity = body.showVelocity || false;
    const stationInfo = STATIONS[station] || STATIONS.KTLX;
    const { nwsZoneId } = stationInfo;

    const reflUrl = `https://radar.weather.gov/ridge/standard/${station}_0.gif`;
    const velUrl  = `https://radar.weather.gov/ridge/standard/base_velocity/${station}_0.gif`;

    // Fetch images + alerts in parallel
    const [reflData, velData, alertsResult] = await Promise.allSettled([
      fetchImageAsBase64(reflUrl),
      showVelocity ? fetchImageAsBase64(velUrl) : Promise.resolve(null),
      (async () => {
        const r = await fetch(`https://api.weather.gov/alerts/active?zone=${nwsZoneId}`);
        if (!r.ok) return { isTornadoWarning: false, alerts: [] };
        const json = await r.json();
        const tornadoes = (json.features || []).filter(a => a.properties.event === "Tornado Warning");
        return {
          isTornadoWarning: tornadoes.length > 0,
          alerts: tornadoes.map(a => ({ headline: a.properties.headline, expires: a.properties.expires })),
        };
      })(),
    ]);

    return Response.json({
      station,
      reflImageData: reflData.status === "fulfilled" ? reflData.value : null,
      velImageData: velData.status === "fulfilled" ? velData.value : null,
      isTornadoWarning: alertsResult.status === "fulfilled" ? alertsResult.value.isTornadoWarning : false,
      nwsAlerts: alertsResult.status === "fulfilled" ? alertsResult.value.alerts : [],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});