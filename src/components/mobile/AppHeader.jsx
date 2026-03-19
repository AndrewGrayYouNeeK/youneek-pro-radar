import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const TITLES = {
  "/RadarScope": "Radar",
  "/Contacts": "Contacts",
  "/Settings": "Settings",
};

export default function AppHeader({ title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedTitle = title || TITLES[location.pathname] || "YouNeeK Pro Radar";
  const showBack = location.pathname !== "/RadarScope" && location.pathname !== "/";

  return (
    <div
      className="sticky top-0 z-[1700] border-b border-white/10 bg-slate-950/90 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="h-11 w-11" />
          )}
          <h1 className="truncate text-lg font-semibold text-white">{resolvedTitle}</h1>
        </div>
        <div className="h-11 w-11" />
      </div>
    </div>
  );
}