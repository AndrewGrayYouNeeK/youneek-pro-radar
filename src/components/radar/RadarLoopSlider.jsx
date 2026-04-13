import { Pause, Play } from "lucide-react";

export default function RadarLoopSlider({ frames, frameIndex, isPlaying, onFrameChange, onTogglePlay }) {
  if (!frames || frames.length === 0) return null;

  return (
    <div
      className="absolute left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-2.5 shadow-2xl backdrop-blur-md"
      style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))", width: "min(22rem, calc(100vw - 2rem))" }}
    >
      <button
        type="button"
        onClick={onTogglePlay}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 transition-colors hover:bg-cyan-500/30"
        aria-label={isPlaying ? "Pause radar loop" : "Resume radar loop"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="flex flex-1 flex-col gap-1.5">
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={frameIndex}
          onChange={(e) => onFrameChange(Number(e.target.value))}
          className="w-full cursor-pointer accent-cyan-400"
          aria-label="Radar loop frame"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>{frames[0]?.label ?? ""}</span>
          <span className="font-semibold text-cyan-300">{frames[frameIndex]?.label ?? ""}</span>
          <span>{frames[frames.length - 1]?.label ?? ""}</span>
        </div>
      </div>
    </div>
  );
}
