import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

export default function RadarTimeSlider({ frames, frameIndex, isPlaying, onSeek, onTogglePlay }) {
  if (!frames || frames.length === 0) return null;

  const handleSliderChange = (e) => {
    onSeek(Number(e.target.value));
  };

  const handlePrev = () => onSeek(Math.max(0, frameIndex - 1));
  const handleNext = () => onSeek(Math.min(frames.length - 1, frameIndex + 1));

  const currentFrame = frames[frameIndex];

  return (
    <div
      className="absolute left-3 z-[1000]"
      style={{
        bottom: "calc(6.5rem + env(safe-area-inset-bottom))",
        right: "calc(5rem + env(safe-area-inset-right))",
      }}
    >
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 px-3 py-2.5 shadow-xl backdrop-blur-md">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Radar History
          </span>
          <span className="text-[10px] font-medium text-slate-300">
            {currentFrame?.label || `Frame ${frameIndex + 1}`}
          </span>
        </div>

        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={frameIndex}
          onChange={handleSliderChange}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400"
          aria-label="Radar time scrubber"
          aria-valuetext={currentFrame?.label}
        />

        {/* Tick labels */}
        <div className="mt-1 flex justify-between">
          {frames.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSeek(i)}
              className={`text-[9px] leading-none transition-colors ${
                i === frameIndex ? "font-bold text-cyan-300" : "text-slate-500 hover:text-slate-300"
              }`}
              aria-label={`Jump to frame ${i + 1}: ${f.label}`}
            >
              {f.label ? f.label.replace(/ (AM|PM)/, "") : `F${i + 1}`}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={frameIndex === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 disabled:opacity-40"
            aria-label="Previous frame"
          >
            <SkipBack className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 transition-colors hover:bg-cyan-500/30"
            aria-label={isPlaying ? "Pause radar loop" : "Play radar loop"}
          >
            {isPlaying
              ? <Pause className="h-4 w-4" aria-hidden="true" />
              : <Play  className="h-4 w-4" aria-hidden="true" />
            }
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={frameIndex === frames.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 disabled:opacity-40"
            aria-label="Next frame"
          >
            <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
