import { useState, useCallback, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import RadarDisplay from "../components/radar/RadarDisplay";
import TargetDialog from "../components/radar/TargetDialog";
import TargetList from "../components/radar/TargetList";
import RadarControls from "../components/radar/RadarControls";
import RadioPlayer from "../components/radar/RadioPlayer";
import BottomNav from "../components/radar/BottomNav";

const DEFAULT_SETTINGS = {
  showLabels: true,
  showTails: true,
  theme: "green",    // green | amber | blue
  showNexrad: false, // live NEXRAD overlay
  station: "KJKL",   // default station (nearest to Columbia, KY)
  showVelocity: false, // show velocity overlay
};

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function RadarScope() {
  const [targets, setTargets] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [pendingClick, setPendingClick] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [dialogMode, setDialogMode] = useState(null); // 'create' | 'inspect'

  // NEXRAD state
  const [reflImageUrl, setReflImageUrl] = useState(null);
  const [velImageUrl, setVelImageUrl] = useState(null);
  const [isTornadoWarning, setIsTornadoWarning] = useState(false);
  const [nexradStatus, setNexradStatus] = useState("offline");
  const refreshTimerRef = useRef(null);

  const fetchNexradData = useCallback(async (station, showVelocity) => {
    setNexradStatus("loading");
    try {
      const res = await base44.functions.invoke("fetchNexrad", { station, showVelocity });
      if (res.data?.error) throw new Error(res.data.error);
      setReflImageUrl(res.data.reflImageData || null);
      setVelImageUrl(res.data.velImageData || null);
      setIsTornadoWarning(!!res.data.isTornadoWarning);
      setNexradStatus("ok");
    } catch (e) {
      console.error("NEXRAD fetch failed:", e);
      setNexradStatus("error");
    }
  }, []);

  // Fetch on toggle on or station change
  useEffect(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    if (!settings.showNexrad) {
      setNexradStatus("offline");
      setReflImageUrl(null);
      setVelImageUrl(null);
      setIsTornadoWarning(false);
      return;
    }

    fetchNexradData(settings.station, settings.showVelocity);

    refreshTimerRef.current = setInterval(() => {
      fetchNexradData(settings.station, settings.showVelocity);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(refreshTimerRef.current);
  }, [settings.showNexrad, settings.station, settings.showVelocity, fetchNexradData]);

  const handleRefreshNexrad = useCallback(() => {
    if (settings.showNexrad) fetchNexradData(settings.station, settings.showVelocity);
  }, [settings.showNexrad, settings.station, settings.showVelocity, fetchNexradData]);

  const handleRadarClick = useCallback((clickData) => {
    setPendingClick(clickData);
    setDialogMode("create");
  }, []);

  const handleTargetClick = useCallback((target) => {
    setSelectedTarget(target);
    setDialogMode("inspect");
  }, []);

  const handleCreateTarget = useCallback((targetData) => {
    const newTarget = {
      id: Date.now().toString(),
      ...targetData,
      createdAt: new Date().toISOString(),
    };
    setTargets((prev) => [...prev, newTarget]);
    setPendingClick(null);
    setDialogMode(null);
  }, []);

  const handleDeleteTarget = useCallback((id) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    setSelectedTarget(null);
    setDialogMode(null);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setPendingClick(null);
    setSelectedTarget(null);
    setDialogMode(null);
  }, []);

  return (
    <div className="h-screen bg-gray-950 flex flex-col md:flex-row overflow-hidden pb-16">
      {/* Radar Display Area */}
      <div className="flex-1 relative overflow-hidden">
        <RadarDisplay
          settings={settings}
          showNexrad={settings.showNexrad}
          isTornadoWarning={isTornadoWarning}
        />
      </div>

      {/* Side Panel */}
      <div className="w-full md:w-72 bg-gray-900 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col">
        <RadarControls
          settings={settings}
          onSettingsChange={setSettings}
          nexradStatus={nexradStatus}
          onRefreshNexrad={handleRefreshNexrad}
        />
        <TargetList
          targets={targets}
          settings={settings}
          onTargetClick={handleTargetClick}
          onDeleteTarget={handleDeleteTarget}
        />
        <RadioPlayer nexradStation={settings.station} />
      </div>

      {/* Bottom Navigation */}
      <BottomNav station={settings.station} isTornadoWarning={isTornadoWarning} />

      {/* Dialogs */}
      {dialogMode === "create" && pendingClick && (
        <TargetDialog
          mode="create"
          initialData={pendingClick}
          onConfirm={handleCreateTarget}
          onClose={handleCloseDialog}
        />
      )}
      {dialogMode === "inspect" && selectedTarget && (
        <TargetDialog
          mode="inspect"
          target={selectedTarget}
          onDelete={() => handleDeleteTarget(selectedTarget.id)}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}