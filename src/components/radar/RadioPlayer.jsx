import { useState, useEffect } from "react";
import { Radio, ChevronDown, ChevronUp } from "lucide-react";

// NOAA Weather Radio All Hazards stations by NEXRAD region
// Frequencies: standard NWR broadcasts on 162.400–162.550 MHz
const NWR_BY_NEXRAD = {
  // Kentucky
  KJKL: { label: "WXL58 162.400 MHz", desc: "NOAA Weather Radio – Jackson KY",       streamUrl: "https://www.broadcastify.com/webPlayer/27561" },
  KLVX: { label: "WXL57 162.550 MHz", desc: "NOAA Weather Radio – Louisville KY",     streamUrl: "https://www.broadcastify.com/webPlayer/27562" },
  KPAH: { label: "WXK99 162.400 MHz", desc: "NOAA Weather Radio – Paducah KY",        streamUrl: "https://www.broadcastify.com/webPlayer/27563" },
  KHPX: { label: "WXL24 162.475 MHz", desc: "NOAA Weather Radio – Fort Campbell KY",  streamUrl: "https://www.broadcastify.com/webPlayer/27564" },
  // Tennessee
  KOHX: { label: "WXJ23 162.550 MHz", desc: "NOAA Weather Radio – Nashville TN",      streamUrl: "https://www.broadcastify.com/webPlayer/24801" },
  KNQA: { label: "WXK34 162.400 MHz", desc: "NOAA Weather Radio – Memphis TN",        streamUrl: "https://www.broadcastify.com/webPlayer/24802" },
  KHTX: { label: "WXJ54 162.475 MHz", desc: "NOAA Weather Radio – Huntsville AL",     streamUrl: "https://www.broadcastify.com/webPlayer/24803" },
  // Ohio Valley
  KILN: { label: "WXK48 162.400 MHz", desc: "NOAA Weather Radio – Cincinnati OH",     streamUrl: "https://www.broadcastify.com/webPlayer/22301" },
  KIND: { label: "WXL38 162.550 MHz", desc: "NOAA Weather Radio – Indianapolis IN",   streamUrl: "https://www.broadcastify.com/webPlayer/22302" },
  KCLE: { label: "KEC83 162.550 MHz", desc: "NOAA Weather Radio – Cleveland OH",      streamUrl: "https://www.broadcastify.com/webPlayer/22303" },
  KPBZ: { label: "KEC49 162.400 MHz", desc: "NOAA Weather Radio – Pittsburgh PA",     streamUrl: "https://www.broadcastify.com/webPlayer/22304" },
  // Southeast
  KFFC: { label: "WXJ58 162.400 MHz", desc: "NOAA Weather Radio – Atlanta GA",        streamUrl: "https://www.broadcastify.com/webPlayer/21001" },
  KAMX: { label: "WXJ52 162.550 MHz", desc: "NOAA Weather Radio – Miami FL",          streamUrl: "https://www.broadcastify.com/webPlayer/21002" },
  KTBW: { label: "WXJ66 162.400 MHz", desc: "NOAA Weather Radio – Tampa FL",          streamUrl: "https://www.broadcastify.com/webPlayer/21003" },
  KJAX: { label: "WXJ39 162.475 MHz", desc: "NOAA Weather Radio – Jacksonville FL",   streamUrl: "https://www.broadcastify.com/webPlayer/21004" },
  KRAX: { label: "WXJ51 162.400 MHz", desc: "NOAA Weather Radio – Raleigh NC",        streamUrl: "https://www.broadcastify.com/webPlayer/21005" },
  KGSP: { label: "WXJ62 162.550 MHz", desc: "NOAA Weather Radio – Greenville SC",     streamUrl: "https://www.broadcastify.com/webPlayer/21006" },
  // Mid-Atlantic
  KDIX: { label: "KWO35 162.475 MHz", desc: "NOAA Weather Radio – Philadelphia PA",   streamUrl: "https://www.broadcastify.com/webPlayer/20001" },
  KOKX: { label: "KWO55 162.400 MHz", desc: "NOAA Weather Radio – New York NY",       streamUrl: "https://www.broadcastify.com/webPlayer/20002" },
  KLWX: { label: "KEC83 162.400 MHz", desc: "NOAA Weather Radio – Baltimore/DC",      streamUrl: "https://www.broadcastify.com/webPlayer/20003" },
  // Northeast
  KBOX: { label: "WXJ22 162.550 MHz", desc: "NOAA Weather Radio – Boston MA",         streamUrl: "https://www.broadcastify.com/webPlayer/19001" },
  // Midwest
  KLSX: { label: "WXK44 162.550 MHz", desc: "NOAA Weather Radio – St. Louis MO",      streamUrl: "https://www.broadcastify.com/webPlayer/18001" },
  KLOT: { label: "WXI29 162.550 MHz", desc: "NOAA Weather Radio – Chicago IL",        streamUrl: "https://www.broadcastify.com/webPlayer/18002" },
  KMPX: { label: "WXK84 162.400 MHz", desc: "NOAA Weather Radio – Minneapolis MN",    streamUrl: "https://www.broadcastify.com/webPlayer/18003" },
  KDMX: { label: "WXL98 162.475 MHz", desc: "NOAA Weather Radio – Des Moines IA",     streamUrl: "https://www.broadcastify.com/webPlayer/18004" },
  KMKX: { label: "WXJ65 162.400 MHz", desc: "NOAA Weather Radio – Milwaukee WI",      streamUrl: "https://www.broadcastify.com/webPlayer/18005" },
  // South Central
  KTLX: { label: "WXK31 162.400 MHz", desc: "NOAA Weather Radio – Oklahoma City OK",  streamUrl: "https://www.broadcastify.com/webPlayer/17001" },
  KFWS: { label: "WXL47 162.550 MHz", desc: "NOAA Weather Radio – Dallas TX",         streamUrl: "https://www.broadcastify.com/webPlayer/17002" },
  KHGX: { label: "WXJ88 162.400 MHz", desc: "NOAA Weather Radio – Houston TX",        streamUrl: "https://www.broadcastify.com/webPlayer/17003" },
  KLIX: { label: "WXJ64 162.550 MHz", desc: "NOAA Weather Radio – New Orleans LA",    streamUrl: "https://www.broadcastify.com/webPlayer/17004" },
  KEWX: { label: "WXJ89 162.400 MHz", desc: "NOAA Weather Radio – San Antonio TX",    streamUrl: "https://www.broadcastify.com/webPlayer/17005" },
  // High Plains
  KFTG: { label: "WXK57 162.400 MHz", desc: "NOAA Weather Radio – Denver CO",         streamUrl: "https://www.broadcastify.com/webPlayer/16001" },
  KICT: { label: "WXK52 162.475 MHz", desc: "NOAA Weather Radio – Wichita KS",        streamUrl: "https://www.broadcastify.com/webPlayer/16002" },
  KEAX: { label: "WXK83 162.400 MHz", desc: "NOAA Weather Radio – Kansas City MO",    streamUrl: "https://www.broadcastify.com/webPlayer/16003" },
  // Southwest
  KIWA: { label: "WXJ91 162.400 MHz", desc: "NOAA Weather Radio – Phoenix AZ",        streamUrl: "https://www.broadcastify.com/webPlayer/15001" },
  KEMX: { label: "WXJ92 162.550 MHz", desc: "NOAA Weather Radio – Tucson AZ",         streamUrl: "https://www.broadcastify.com/webPlayer/15002" },
  // Northwest
  KATX: { label: "KHB34 162.400 MHz", desc: "NOAA Weather Radio – Seattle WA",        streamUrl: "https://www.broadcastify.com/webPlayer/14001" },
  KRTX: { label: "KZZ74 162.550 MHz", desc: "NOAA Weather Radio – Portland OR",       streamUrl: "https://www.broadcastify.com/webPlayer/14002" },
  // California
  KVTX: { label: "KXO49 162.400 MHz", desc: "NOAA Weather Radio – Los Angeles CA",    streamUrl: "https://www.broadcastify.com/webPlayer/13001" },
  KMUX: { label: "KMF49 162.400 MHz", desc: "NOAA Weather Radio – San Francisco CA",  streamUrl: "https://www.broadcastify.com/webPlayer/13002" },
  // Default fallback
  DEFAULT: { label: "NWR National",   desc: "NOAA Weather Radio – National Feed",      streamUrl: "https://www.broadcastify.com/webPlayer/27561" },
};

function getStation(nexradId) {
  return NWR_BY_NEXRAD[nexradId] || NWR_BY_NEXRAD.DEFAULT;
}

export default function RadioPlayer({ nexradStation }) {
  const [open, setOpen] = useState(false);
  const station = getStation(nexradStation);

  return (
    <div className="border-t border-gray-700">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono font-bold text-gray-400 tracking-widest hover:text-green-400 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Radio size={11} />
          NOAA WEATHER RADIO
        </span>
        {open ? <ChevronDown size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          <div className="text-green-400 text-xs font-mono font-bold">{station.label}</div>
          <div className="text-gray-500 text-xs font-mono">{station.desc}</div>
          <a
            href={station.streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-3 py-2 bg-green-900 hover:bg-green-800 border border-green-600 text-green-300 text-xs font-mono rounded transition-colors"
          >
            ▶ OPEN LIVE STREAM
          </a>
          <div className="text-gray-600 text-xs font-mono text-center">
            Opens Broadcastify in new tab
          </div>
        </div>
      )}
    </div>
  );
}