import { useState, useEffect } from "react";
import { Radio, ChevronDown, ChevronUp, LocateFixed } from "lucide-react";

// Radio stations keyed by NEXRAD station ID (nearest major market)
const RADIO_BY_NEXRAD = {
  // Kentucky
  KJKL: [
    { id: "wain-fm",  label: "WAIN 93.5 FM",      desc: "Country – Columbia KY",    embedUrl: "https://player.listenlive.co/76521" },
    { id: "wain-am",  label: "WAIN 1270 AM",       desc: "Sports – Columbia KY",     embedUrl: "https://player.listenlive.co/76531" },
  ],
  KLVX: [
    { id: "whas",     label: "WHAS 840 AM",        desc: "News/Talk – Louisville KY", embedUrl: "https://player.listenlive.co/40891" },
    { id: "wlrs",     label: "WLRS 105.1 FM",      desc: "Rock – Louisville KY",      embedUrl: "https://player.listenlive.co/40901" },
  ],
  KPAH: [
    { id: "wddj",     label: "WDDJ 96.9 FM",       desc: "Country – Paducah KY",      embedUrl: "https://player.listenlive.co/45751" },
  ],
  KHPX: [
    { id: "wkdq",     label: "WKDQ 99.5 FM",       desc: "Country – Hopkinsville KY", embedUrl: "https://player.listenlive.co/45761" },
  ],
  // Tennessee
  KOHX: [
    { id: "wsix",     label: "WSIX 97.9 FM",       desc: "Country – Nashville TN",    embedUrl: "https://player.listenlive.co/40861" },
    { id: "wkdf",     label: "WKDF 103.3 FM",      desc: "Rock – Nashville TN",       embedUrl: "https://player.listenlive.co/40871" },
  ],
  KNQA: [
    { id: "wegr",     label: "WEGR 102.7 FM",      desc: "Rock – Memphis TN",         embedUrl: "https://player.listenlive.co/42521" },
  ],
  // Ohio Valley
  KILN: [
    { id: "700wlw",   label: "WLW 700 AM",         desc: "News/Talk – Cincinnati OH",  embedUrl: "https://player.listenlive.co/40921" },
  ],
  KIND: [
    { id: "wibc",     label: "WIBC 93.1 FM",       desc: "News/Talk – Indianapolis IN",embedUrl: "https://player.listenlive.co/40931" },
  ],
  KCLE: [
    { id: "wtam",     label: "WTAM 1100 AM",       desc: "News/Talk – Cleveland OH",   embedUrl: "https://player.listenlive.co/40941" },
  ],
  // Southeast
  KFFC: [
    { id: "wstr",     label: "WSTR 94.9 FM",       desc: "Top 40 – Atlanta GA",       embedUrl: "https://player.listenlive.co/41011" },
  ],
  KAMX: [
    { id: "whqt",     label: "WHQT 105.1 FM",      desc: "R&B – Miami FL",            embedUrl: "https://player.listenlive.co/41021" },
  ],
  // Midwest
  KLSX: [
    { id: "kmox",     label: "KMOX 1120 AM",       desc: "News/Talk – St. Louis MO",  embedUrl: "https://player.listenlive.co/41031" },
  ],
  KLOT: [
    { id: "wbbm",     label: "WBBM 780 AM",        desc: "News/Talk – Chicago IL",    embedUrl: "https://player.listenlive.co/41041" },
  ],
  KMPX: [
    { id: "wcco",     label: "WCCO 830 AM",        desc: "News/Talk – Minneapolis MN",embedUrl: "https://player.listenlive.co/41051" },
  ],
  // South Central
  KTLX: [
    { id: "ktok",     label: "KTOK 1000 AM",       desc: "News/Talk – Oklahoma City", embedUrl: "https://player.listenlive.co/41061" },
  ],
  KFWS: [
    { id: "krld",     label: "KRLD 1080 AM",       desc: "News/Talk – Dallas TX",     embedUrl: "https://player.listenlive.co/41071" },
  ],
  KHGX: [
    { id: "ktrh",     label: "KTRH 740 AM",        desc: "News/Talk – Houston TX",    embedUrl: "https://player.listenlive.co/41081" },
  ],
  // Northeast
  KOKX: [
    { id: "wcbs",     label: "WCBS 880 AM",        desc: "News – New York NY",        embedUrl: "https://player.listenlive.co/41091" },
  ],
  KBOX: [
    { id: "wbz",      label: "WBZ 1030 AM",        desc: "News – Boston MA",          embedUrl: "https://player.listenlive.co/41101" },
  ],
  // Northwest
  KATX: [
    { id: "kiro",     label: "KIRO 97.3 FM",       desc: "News/Talk – Seattle WA",    embedUrl: "https://player.listenlive.co/41111" },
  ],
  KRTX: [
    { id: "kpoj",     label: "KPOJ 620 AM",        desc: "News/Talk – Portland OR",   embedUrl: "https://player.listenlive.co/41121" },
  ],
  // Southwest
  KIWA: [
    { id: "ktar",     label: "KTAR 92.3 FM",       desc: "News/Talk – Phoenix AZ",    embedUrl: "https://player.listenlive.co/41131" },
  ],
  KVTX: [
    { id: "kfwb",     label: "KNX 1070 AM",        desc: "News – Los Angeles CA",     embedUrl: "https://player.listenlive.co/41141" },
  ],
  KMUX: [
    { id: "kcbs",     label: "KCBS 740 AM",        desc: "News – San Francisco CA",   embedUrl: "https://player.listenlive.co/41151" },
  ],
  // Mountain
  KFTG: [
    { id: "khow",     label: "KHOW 630 AM",        desc: "News/Talk – Denver CO",     embedUrl: "https://player.listenlive.co/41161" },
  ],
  // Fallback
  DEFAULT: [
    { id: "wain-fm",  label: "WAIN 93.5 FM",       desc: "Country – Columbia KY",     embedUrl: "https://player.listenlive.co/76521" },
  ],
};

function getStationsForNexrad(nexradId) {
  return RADIO_BY_NEXRAD[nexradId] || RADIO_BY_NEXRAD.DEFAULT;
}

export default function RadioPlayer({ nexradStation }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const stations = getStationsForNexrad(nexradStation);

  // Reset active station when NEXRAD station changes
  useEffect(() => {
    setActive(stations[0]);
  }, [nexradStation]);

  const currentStation = active || stations[0];

  return (
    <div className="border-t border-gray-700">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono font-bold text-gray-400 tracking-widest hover:text-green-400 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Radio size={11} />
          LOCAL RADIO
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* Region label */}
          <div className="text-gray-600 text-xs font-mono">
            📍 {nexradStation || "DEFAULT"} region
          </div>

          {/* Station selector */}
          <div className="flex gap-1 flex-wrap">
            {stations.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${
                  currentStation.id === s.id
                    ? "bg-green-900 border-green-600 text-green-300"
                    : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="text-gray-500 text-xs font-mono">{currentStation.desc}</div>

          <iframe
            key={currentStation.id}
            src={currentStation.embedUrl}
            title={currentStation.label}
            allow="autoplay"
            style={{
              width: "100%",
              height: 110,
              border: "none",
              borderRadius: 4,
              background: "#111",
            }}
          />
        </div>
      )}
    </div>
  );
}