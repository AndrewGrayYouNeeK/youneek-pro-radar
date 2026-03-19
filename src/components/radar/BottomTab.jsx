import { Activity, Settings, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useNavigationStack } from "@/lib/NavigationStack";

const TABS = [
  { label: "Radar", path: "/RadarScope", icon: Activity },
  { label: "Contacts", path: "/Contacts", icon: Users },
  { label: "Settings", path: "/Settings", icon: Settings },
];

export default function BottomTab() {
  const location = useLocation();
  const { navigateToTab, resetTab } = useNavigationStack();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[1800] select-none border-t border-white/10 bg-slate-950/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-3 py-2">
        {TABS.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path || (label === "Radar" && location.pathname === "/");
          return (
            <button
              key={path}
              type="button"
              onClick={() => {
                if (active) {
                  resetTab(label);
                } else {
                  navigateToTab(label);
                }
              }}
              aria-label={`Open ${label}`}
              className={`flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}