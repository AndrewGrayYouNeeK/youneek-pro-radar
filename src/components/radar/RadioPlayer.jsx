import { useState } from "react";
import { Radio, ChevronDown, ChevronUp } from "lucide-react";

const STATIONS = [
  {
    id: "wain-fm",
    label: "WAIN 93.5 FM",
    desc: "Hot Country – Columbia KY",
    embedUrl: "https://player.listenlive.co/76521",
  },
  {
    id: "wain-am",
    label: "WAIN 1270 AM / 101.9 FM",
    desc: "Sports – Columbia KY",
    embedUrl: "https://player.listenlive.co/76531",
  },
];

export default function RadioPlayer() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(STATIONS[0]);

  return (
    <div className="border-t border-gray-700">
      {/* Header toggle */}
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
          {/* Station selector */}
          <div className="flex gap-1 flex-wrap">
            {STATIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s)}
                className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${
                  active.id === s.id
                    ? "bg-green-900 border-green-600 text-green-300"
                    : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="text-gray-500 text-xs font-mono">{active.desc}</div>

          {/* Embedded player */}
          <iframe
            key={active.id}
            src={active.embedUrl}
            title={active.label}
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