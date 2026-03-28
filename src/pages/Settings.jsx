import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BottomTab from "@/components/radar/BottomTab";
import AppHeader from "@/components/mobile/AppHeader";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Radio, Bell, Shield, Info, Trash2, AlertTriangle } from "lucide-react";

const APP_VERSION = "1.0.0";

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 border-b border-white/5">
        {title}
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, sublabel, right, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        onClick ? "hover:bg-white/5 active:bg-white/10" : "cursor-default"
      } ${danger ? "text-red-300" : "text-white"}`}
    >
      {Icon && (
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-red-950/60" : "bg-white/10"}`}>
          <Icon className={`h-4 w-4 ${danger ? "text-red-400" : "text-slate-300"}`} aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-tight">{label}</div>
        {sublabel && <div className="mt-0.5 text-xs text-slate-400 leading-snug">{sublabel}</div>}
      </div>
      {right !== undefined ? (
        <div className="shrink-0">{right}</div>
      ) : onClick ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
      ) : null}
    </button>
  );
}

export default function Settings() {
  useTabPageMemory("Settings");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [notifyRain, setNotifyRain] = useState(() => localStorage.getItem("pref_notifyRain") !== "false");
  const [notifyTornado, setNotifyTornado] = useState(() => localStorage.getItem("pref_notifyTornado") !== "false");
  const [autoTune, setAutoTune] = useState(() => localStorage.getItem("pref_autoTune") !== "false");
  const [showAbout, setShowAbout] = useState(false);

  const handleToggle = (key, setter) => (val) => {
    setter(val);
    localStorage.setItem(key, String(val));
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const me = await base44.auth.me();
      await base44.entities.User.delete(me.id);
      await base44.auth.logout("/");
    },
    onMutate: () => setConfirmingDelete(false),
  });

  return (
    <div className="safe-screen min-h-screen bg-slate-950 pb-28 text-white">
      <AppHeader title="Settings" />
      <div className="mx-auto max-w-md space-y-4 px-4 pt-5">

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow
            icon={Bell}
            label="Rain arrival alerts"
            sublabel="Get a heads-up before rain reaches your location"
            right={
              <Switch
                checked={notifyRain}
                onCheckedChange={handleToggle("pref_notifyRain", setNotifyRain)}
                aria-label="Toggle rain arrival alerts"
              />
            }
          />
          <SettingRow
            icon={AlertTriangle}
            label="Tornado & severe weather"
            sublabel="Show the shelter button when warnings are active"
            right={
              <Switch
                checked={notifyTornado}
                onCheckedChange={handleToggle("pref_notifyTornado", setNotifyTornado)}
                aria-label="Toggle tornado warning alerts"
              />
            }
          />
        </Section>

        {/* Radio */}
        <Section title="NOAA Radio">
          <SettingRow
            icon={Radio}
            label="Auto-tune nearest station"
            sublabel="Automatically select the closest NOAA station on startup"
            right={
              <Switch
                checked={autoTune}
                onCheckedChange={handleToggle("pref_autoTune", setAutoTune)}
                aria-label="Toggle auto-tune nearest station"
              />
            }
          />
        </Section>

        {/* About */}
        <Section title="About">
          <SettingRow
            icon={Info}
            label="YouNeeK Pro Radar"
            sublabel={`Version ${APP_VERSION} — by Andrew Gray`}
            onClick={() => setShowAbout((v) => !v)}
            right={<ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${showAbout ? "rotate-90" : ""}`} />}
          />
          {showAbout && (
            <div className="px-4 pb-4 pt-1 text-xs leading-relaxed text-slate-400 space-y-2">
              <p>Real-time NEXRAD radar mosaics from Iowa Environmental Mesonet. NWS active weather alerts. NOAA Weather Radio with automatic nearest-station tuning. One-tap shelter notification to your emergency contacts.</p>
              <p className="text-slate-500">Data sources: Iowa Mesonet · api.weather.gov · open-meteo.com</p>
              <p className="text-slate-500">© 2026 Andrew Gray · YouNeeK</p>
            </div>
          )}
          <SettingRow
            icon={Shield}
            label="Privacy"
            sublabel="Location is used locally only — never stored or shared"
            right={null}
          />
        </Section>

        {/* Account */}
        <Section title="Account">
          {!confirmingDelete ? (
            <SettingRow
              icon={Trash2}
              label="Delete Account"
              sublabel="Permanently removes your account and data"
              onClick={() => setConfirmingDelete(true)}
              danger
            />
          ) : (
            <div className="space-y-3 p-4">
              <p className="text-sm text-red-200 leading-snug">This permanently deletes your account. There's no going back.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  aria-label="Cancel account deletion"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAccountMutation.mutate()}
                  aria-label="Confirm account deletion"
                  disabled={deleteAccountMutation.isPending}
                  className="flex-1 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {deleteAccountMutation.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          )}
        </Section>

      </div>
      <BottomTab />
    </div>
  );
}
