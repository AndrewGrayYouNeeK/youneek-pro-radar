import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const STATIONS = {
  KOKX: { nwsZoneId: "NYZ071" }, KBOX: { nwsZoneId: "MAZ009" }, KBGM: { nwsZoneId: "NYZ039" },
  KBUF: { nwsZoneId: "NYZ014" }, KENX: { nwsZoneId: "NYZ054" }, KPBZ: { nwsZoneId: "PAZ018" },
  KCCX: { nwsZoneId: "PAZ032" }, KDIX: { nwsZoneId: "NJZ006" }, KFFC: { nwsZoneId: "GAZ030" },
  KAMX: { nwsZoneId: "FLZ063" }, KTBW: { nwsZoneId: "FLZ034" }, KJAX: { nwsZoneId: "FLZ015" },
  KCLX: { nwsZoneId: "SCZ040" }, KRAX: { nwsZoneId: "NCZ041" }, KAKQ: { nwsZoneId: "VAZ075" },
  KLWX: { nwsZoneId: "MDZ009" }, KLOT: { nwsZoneId: "ILZ003" }, KGRR: { nwsZoneId: "MIZ050" },
  KAPX: { nwsZoneId: "MIZ009" }, KMKX: { nwsZoneId: "WIZ064" }, KDVN: { nwsZoneId: "IAZ040" },
  KILX: { nwsZoneId: "ILZ048" }, KLSX: { nwsZoneId: "MOZ069" }, KEAX: { nwsZoneId: "MOZ011" },
  KTWX: { nwsZoneId: "KSZ029" }, KICT: { nwsZoneId: "KSZ070" }, KIND: { nwsZoneId: "INZ052" },
  KILN: { nwsZoneId: "OHZ052" }, KLVX: { nwsZoneId: "KYZ044" }, KPAH: { nwsZoneId: "KYZ095" },
  KOHX: { nwsZoneId: "TNZ058" }, KNQA: { nwsZoneId: "TNZ086" }, KHTX: { nwsZoneId: "ALZ011" },
  KBMX: { nwsZoneId: "ALZ040" }, KGWX: { nwsZoneId: "MSZ033" }, KLZK: { nwsZoneId: "ARZ034" },
  KTLX: { nwsZoneId: "OKZ025" }, KINX: { nwsZoneId: "OKZ009" }, KFWS: { nwsZoneId: "TXZ119" },
  KSHV: { nwsZoneId: "LAZ011" }, KPOE: { nwsZoneId: "LAZ029" }, KLIX: { nwsZoneId: "LAZ064" },
  KMOB: { nwsZoneId: "ALZ070" }, KABR: { nwsZoneId: "SDZ005" }, KBIS: { nwsZoneId: "NDZ031" },
  KMBX: { nwsZoneId: "NDZ007" }, KFSD: { nwsZoneId: "SDZ023" }, KUEX: { nwsZoneId: "NEZ055" },
  KOAX: { nwsZoneId: "NEZ020" }, KDDC: { nwsZoneId: "KSZ088" }, KAMA: { nwsZoneId: "TXZ035" },
  KFTG: { nwsZoneId: "COZ039" }, KPUX: { nwsZoneId: "COZ083" }, KGJX: { nwsZoneId: "COZ060" },
  KIWA: { nwsZoneId: "AZZ503" }, KEMX: { nwsZoneId: "AZZ505" }, KABX: { nwsZoneId: "NMZ005" },
  KFSX: { nwsZoneId: "AZZ501" }, KESX: { nwsZoneId: "NVZ012" }, KVTX: { nwsZoneId: "CAZ039" },
  KHNX: { nwsZoneId: "CAZ048" }, KMUX: { nwsZoneId: "CAZ505" }, KATX: { nwsZoneId: "WAZ002" },
  KRTX: { nwsZoneId: "ORZ006" }, KPDT: { nwsZoneId: "ORZ058" }, KOTX: { nwsZoneId: "WAZ052" },
  KMSX: { nwsZoneId: "MTZ301" }, KTFX: { nwsZoneId: "MTZ101" }, PAEC: { nwsZoneId: "AKZ201" },
  PAPD: { nwsZoneId: "AKZ101" }, PAHG: { nwsZoneId: "AKZ116" }, PHKI: { nwsZoneId: "HIZ001" },
  PHMO: { nwsZoneId: "HIZ010" }, TJUA: { nwsZoneId: "PRZ001" },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const station = (body.station || 'KTLX').toUpperCase();
    const stationInfo = STATIONS[station] || STATIONS.KTLX;
    const { nwsZoneId } = stationInfo;

    // Only check tornado warnings — images load directly from NOAA on the frontend
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