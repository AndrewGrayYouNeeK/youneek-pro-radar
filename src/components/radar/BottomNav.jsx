import { useState, useRef, useEffect } from "react";
import { Radio, Volume2, VolumeX } from "lucide-react";

const NWR_BY_NEXRAD = {
  KJKL: { label: "WXL58", desc: "Jackson KY", streamUrl: "https://www.broadcastify.com/webPlayer/27561" },
  KLVX: { label: "WXL57", desc: "Louisville KY", streamUrl: "https://www.broadcastify.com/webPlayer/27562" },
  KPAH: { label: "WXK99", desc: "Paducah KY", streamUrl: "https://www.broadcastify.com/webPlayer/27563" },
  KHPX: { label: "WXL24", desc: "Fort Campbell KY", streamUrl: "https://www.broadcastify.com/webPlayer/27564" },
  KOHX: { label: "WXJ23", desc: "Nashville TN", streamUrl: "https://www.broadcastify.com/webPlayer/24801" },
  KNQA: { label: "WXK34", desc: "Memphis TN", streamUrl: "https://www.broadcastify.com/webPlayer/24802" },
  KHTX: { label: "WXJ54", desc: "Huntsville AL", streamUrl: "https://www.broadcastify.com/webPlayer/24803" },
  KILN: { label: "WXK48", desc: "Cincinnati OH", streamUrl: "https://www.broadcastify.com/webPlayer/22301" },
  KIND: { label: "WXL38", desc: "Indianapolis IN", streamUrl: "https://www.broadcastify.com/webPlayer/22302" },
  KCLE: { label: "KEC83", desc: "Cleveland OH", streamUrl: "https://www.broadcastify.com/webPlayer/22303" },
  KPBZ: { label: "KEC49", desc: "Pittsburgh PA", streamUrl: "https://www.broadcastify.com/webPlayer/22304" },
  KFFC: { label: "WXJ58", desc: "Atlanta GA", streamUrl: "https://www.broadcastify.com/webPlayer/21001" },
  KAMX: { label: "WXJ52", desc: "Miami FL", streamUrl: "https://www.broadcastify.com/webPlayer/21002" },
  KTBW: { label: "WXJ66", desc: "Tampa FL", streamUrl: "https://www.broadcastify.com/webPlayer/21003" },
  KJAX: { label: "WXJ39", desc: "Jacksonville FL", streamUrl: "https://www.broadcastify.com/webPlayer/21004" },
  KRAX: { label: "WXJ51", desc: "Raleigh NC", streamUrl: "https://www.broadcastify.com/webPlayer/21005" },
  KGSP: { label: "WXJ62", desc: "Greenville SC", streamUrl: "https://www.broadcastify.com/webPlayer/21006" },
  KDIX: { label: "KWO35", desc: "Philadelphia PA", streamUrl: "https://www.broadcastify.com/webPlayer/20001" },
  KOKX: { label: "KWO55", desc: "New York NY", streamUrl: "https://www.broadcastify.com/webPlayer/20002" },
  KLWX: { label: "KEC83", desc: "Baltimore/DC", streamUrl: "https://www.broadcastify.com/webPlayer/20003" },
  KBOX: { label: "WXJ22", desc: "Boston MA", streamUrl: "https://www.broadcastify.com/webPlayer/19001" },
  KLSX: { label: "WXK44", desc: "St. Louis MO", streamUrl: "https://www.broadcastify.com/webPlayer/18001" },
  KLOT: { label: "WXI29", desc: "Chicago IL", streamUrl: "https://www.broadcastify.com/webPlayer/18002" },
  KMPX: { label: "WXK84", desc: "Minneapolis MN", streamUrl: "https://www.broadcastify.com/webPlayer/18003" },
  KDMX: { label: "WXL98", desc: "Des Moines IA", streamUrl: "https://www.broadcastify.com/webPlayer/18004" },
  KMKX: { label: "WXJ65", desc: "Milwaukee WI", streamUrl: "https://www.broadcastify.com/webPlayer/18005" },
  KTLX: { label: "WXK31", desc: "Oklahoma City OK", streamUrl: "https://www.broadcastify.com/webPlayer/17001" },
  KFWS: { label: "WXL47", desc: "Dallas TX", streamUrl: "https://www.broadcastify.com/webPlayer/17002" },
  KHGX: { label: "WXJ88", desc: "Houston TX", streamUrl: "https://www.broadcastify.com/webPlayer/17003" },
  KLIX: { label: "WXJ64", desc: "New Orleans LA", streamUrl: "https://www.broadcastify.com/webPlayer/17004" },
  KEWX: { label: "WXJ89", desc: "San Antonio TX", streamUrl: "https://www.broadcastify.com/webPlayer/17005" },
  KFTG: { label: "WXK57", desc: "Denver CO", streamUrl: "https://www.broadcastify.com/webPlayer/16001" },
  KICT: { label: "WXK52", desc: "Wichita KS", streamUrl: "https://www.broadcastify.com/webPlayer/16002" },
  KEAX: { label: "WXK83", desc: "Kansas City MO", streamUrl: "https://www.broadcastify.com/webPlayer/16003" },
  KIWA: { label: "WXJ91", desc: "Phoenix AZ", streamUrl: "https://www.broadcastify.com/webPlayer/15001" },
  KEMX: { label: "WXJ92", desc: "Tucson AZ", streamUrl: "https://www.broadcastify.com/webPlayer/15002" },
  KATX: { label: "KHB34", desc: "Seattle WA", streamUrl: "https://www.broadcastify.com/webPlayer/14001" },
  KRTX: { label: "KZZ74", desc: "Portland OR", streamUrl: "https://www.broadcastify.com/webPlayer/14002" },
  KVTX: { label: "KXO49", desc: "Los Angeles CA", streamUrl: "https://www.broadcastify.com/webPlayer/13001" },
  KMUX: { label: "KMF49", desc: "San Francisco CA", streamUrl: "https://www.broadcastify.com/webPlayer/13002" },
  DEFAULT: { label: "NWR", desc: "National Feed", streamUrl: "https://www.broadcastify.com/webPlayer/27561" },
};

function getStation(nexradId) {
  return NWR_BY_NEXRAD[nexradId] || NWR_BY_NEXRAD.DEFAULT;
}

export default function BottomNav({ station, isTornadoWarning }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showVolume, setShowVolume] = useState(false);
  const iframeRef = useRef(null);

  const stationInfo = getStation(station);

  const handlePlayClick = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setShowVolume(false);
      if (iframeRef.current) {
        iframeRef.current.style.display = "none";
      }
    } else {
      setIsPlaying(true);
      setShowVolume(true);
      if (iframeRef.current) {
        iframeRef.current.style.display = "block";
      }
    }
  };

  return (
    <>
      {/* Hidden iframe for stream */}
      <iframe
        ref={iframeRef}
        src={stationInfo.streamUrl}
        style={{ display: "none" }}
        frameBorder="0"
        allowFullScreen
      />

      {/* Bottom Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-700 flex items-center px-4 gap-4 ${isTornadoWarning ? "border-t-red-500 bg-gray-950" : ""}`}>
        {/* Now Playing Ticker */}
        <div className="flex-1 min-w-0">
          {isPlaying ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              </div>
              <div className="text-xs font-mono text-green-400 truncate">
                {stationInfo.label} - {stationInfo.desc}
              </div>
            </div>
          ) : (
            <div className="text-xs font-mono text-gray-500">Ready to listen</div>
          )}
        </div>

        {/* Volume Control */}
        {showVolume && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-gray-400 w-6 text-right">{volume}</span>
          </div>
        )}

        {/* Radio Button */}
        <button
          onClick={handlePlayClick}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
            isPlaying
              ? isTornadoWarning
                ? "bg-red-600 text-white animate-pulse"
                : "bg-green-700 text-green-100"
              : isTornadoWarning
              ? "bg-red-900 text-red-400 hover:bg-red-800"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
          title={isPlaying ? "Stop streaming" : "Play live stream"}
        >
          {isPlaying ? (
            <Volume2 size={18} />
          ) : (
            <Radio size={18} />
          )}
        </button>

        {/* Mute Button */}
        {isPlaying && (
          <button
            onClick={() => setIsPlaying(false)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all"
            title="Mute"
          >
            <VolumeX size={18} />
          </button>
        )}
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-16"></div>
    </>
  );
}