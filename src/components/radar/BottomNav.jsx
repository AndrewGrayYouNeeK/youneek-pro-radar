import { useState } from "react";
import { Radio, X } from "lucide-react";

// NEXRAD → Broadcastify feed IDs (webPlayer IDs)
const NWR_BY_NEXRAD = {
  KJKL: { label: "WXL58", desc: "Jackson KY", feedId: "27561" },
  KLVX: { label: "WXL57", desc: "Louisville KY", feedId: "27562" },
  KPAH: { label: "WXK99", desc: "Paducah KY", feedId: "27563" },
  KHPX: { label: "WXL24", desc: "Fort Campbell KY", feedId: "27564" },
  KOHX: { label: "WXJ23", desc: "Nashville TN", feedId: "24801" },
  KNQA: { label: "WXK34", desc: "Memphis TN", feedId: "24802" },
  KHTX: { label: "WXJ54", desc: "Huntsville AL", feedId: "24803" },
  KILN: { label: "WXK48", desc: "Cincinnati OH", feedId: "22301" },
  KIND: { label: "WXL38", desc: "Indianapolis IN", feedId: "22302" },
  KCLE: { label: "KEC83", desc: "Cleveland OH", feedId: "22303" },
  KPBZ: { label: "KEC49", desc: "Pittsburgh PA", feedId: "22304" },
  KFFC: { label: "WXJ58", desc: "Atlanta GA", feedId: "21001" },
  KAMX: { label: "WXJ52", desc: "Miami FL", feedId: "21002" },
  KTBW: { label: "WXJ66", desc: "Tampa FL", feedId: "21003" },
  KJAX: { label: "WXJ39", desc: "Jacksonville FL", feedId: "21004" },
  KRAX: { label: "WXJ51", desc: "Raleigh NC", feedId: "21005" },
  KGSP: { label: "WXJ62", desc: "Greenville SC", feedId: "21006" },
  KDIX: { label: "KWO35", desc: "Philadelphia PA", feedId: "20001" },
  KOKX: { label: "KWO55", desc: "New York NY", feedId: "20002" },
  KLWX: { label: "KEC83", desc: "Baltimore/DC", feedId: "20003" },
  KBOX: { label: "WXJ22", desc: "Boston MA", feedId: "19001" },
  KLSX: { label: "WXK44", desc: "St. Louis MO", feedId: "18001" },
  KLOT: { label: "WXI29", desc: "Chicago IL", feedId: "18002" },
  KMPX: { label: "WXK84", desc: "Minneapolis MN", feedId: "18003" },
  KDMX: { label: "WXL98", desc: "Des Moines IA", feedId: "18004" },
  KMKX: { label: "WXJ65", desc: "Milwaukee WI", feedId: "18005" },
  KTLX: { label: "WXK31", desc: "Oklahoma City OK", feedId: "17001" },
  KFWS: { label: "WXL47", desc: "Dallas TX", feedId: "17002" },
  KHGX: { label: "WXJ88", desc: "Houston TX", feedId: "17003" },
  KLIX: { label: "WXJ64", desc: "New Orleans LA", feedId: "17004" },
  KEWX: { label: "WXJ89", desc: "San Antonio TX", feedId: "17005" },
  KFTG: { label: "WXK57", desc: "Denver CO", feedId: "16001" },
  KICT: { label: "WXK52", desc: "Wichita KS", feedId: "16002" },
  KEAX: { label: "WXK83", desc: "Kansas City MO", feedId: "16003" },
  KIWA: { label: "WXJ91", desc: "Phoenix AZ", feedId: "15001" },
  KEMX: { label: "WXJ92", desc: "Tucson AZ", feedId: "15002" },
  KATX: { label: "KHB34", desc: "Seattle WA", feedId: "14001" },
  KRTX: { label: "KZZ74", desc: "Portland OR", feedId: "14002" },
  KVTX: { label: "KXO49", desc: "Los Angeles CA", feedId: "13001" },
  KMUX: { label: "KMF49", desc: "San Francisco CA", feedId: "13002" },
  DEFAULT: { label: "NWR", desc: "National Feed", feedId: "27561" },
};

function getStation(nexradId) {
  return NWR_BY_NEXRAD[nexradId] || NWR_BY_NEXRAD.DEFAULT;
}

export default function BottomNav({ station, isTornadoWarning }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const stationInfo = getStation(station);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-700 flex items-center px-4 gap-4 transition-all ${
          isTornadoWarning ? "border-t-red-500 shadow-[0_-4px_12px_rgba(220,38,38,0.5)]" : ""
        }`}
      >
        {/* Status Text */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-gray-500">
            {stationInfo.label} — {stationInfo.desc}
          </div>
        </div>

        {/* Radio Button */}
        <button
          onClick={() => setShowPlayer(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
            isTornadoWarning
              ? "bg-red-900 text-red-200 hover:bg-red-800 shadow-[0_0_8px_rgba(220,38,38,0.6)]"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <Radio size={14} />
          LISTEN
          {isTornadoWarning && <span className="text-red-500 text-lg animate-pulse">●</span>}
        </button>
      </div>

      {/* Player Modal */}
      {showPlayer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowPlayer(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#1a1a1a",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #333",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#888", fontFamily: "monospace" }}>
                  NOAA WEATHER RADIO
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#4ade80",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                  }}
                >
                  {stationInfo.label}
                </div>
                <div style={{ fontSize: "11px", color: "#666", fontFamily: "monospace" }}>
                  {stationInfo.desc}
                </div>
              </div>
              <button
                onClick={() => setShowPlayer(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  padding: "0",
                  fontSize: "18px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Broadcastify Player */}
            <iframe
              src={`https://www.broadcastify.com/webPlayer/${stationInfo.feedId}`}
              width="100%"
              height="280"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              style={{ borderRadius: "8px", marginBottom: "12px" }}
            />

            {/* Info */}
            <div style={{ fontSize: "10px", color: "#888", fontFamily: "monospace", textAlign: "center" }}>
              Full player controls available • Click outside to close
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content overlap */}
      <div className="h-16"></div>
    </>
  );
}