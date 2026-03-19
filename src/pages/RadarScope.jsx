import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RadarDisplay from "../components/radar/RadarDisplay";
import TargetDialog from "../components/radar/TargetDialog";
import BottomTab from "../components/radar/BottomTab";
import AppHeader from "@/components/mobile/AppHeader";

const DEFAULT_SETTINGS = {
  showLabels: true,
  showTails: true,
  theme: "green",    // green | amber | blue
  showNexrad: false, // live NEXRAD overlay
  station: "KJKL",   // default station (nearest to Columbia, KY)
  showVelocity: false, // show velocity overlay
};

export default function RadarScope() {
  const navigate = useNavigate();
  const location = useLocation();
  const [targets, setTargets] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showRadio, setShowRadio] = useState(true);

  const urlParams = new URLSearchParams(location.search);
  const dialogMode = urlParams.get("dialog");
  const selectedTargetId = urlParams.get("targetId");
  const pendingClick = dialogMode === "create"
    ? {
        bearing: Number(urlParams.get("bearing") || 0),
        range: Number(urlParams.get("range") || 0),
      }
    : null;
  const selectedTarget = targets.find((target) => target.id === selectedTargetId) || null;

  const handleRadarClick = useCallback((clickData) => {
    const params = new URLSearchParams();
    params.set("dialog", "create");
    params.set("bearing", String(clickData?.bearing ?? 0));
    params.set("range", String(clickData?.range ?? 0));
    navigate(`${location.pathname}?${params.toString()}`);
  }, [navigate, location.pathname]);

  const handleTargetClick = useCallback((target) => {
    const params = new URLSearchParams();
    params.set("dialog", "inspect");
    params.set("targetId", target.id);
    navigate(`${location.pathname}?${params.toString()}`);
  }, [navigate, location.pathname]);

  const handleCreateTarget = useCallback((targetData) => {
    const newTarget = {
      id: Date.now().toString(),
      ...targetData,
      createdAt: new Date().toISOString(),
    };
    setTargets((prev) => [...prev, newTarget]);
    if (location.search) {
      navigate(-1);
    } else {
      navigate(location.pathname, { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  const handleDeleteTarget = useCallback((id) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    if (location.search) {
      navigate(-1);
    } else {
      navigate(location.pathname, { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  const handleCloseDialog = useCallback(() => {
    if (location.search) {
      navigate(-1);
    } else {
      navigate(location.pathname, { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  return (
    <div className="safe-screen h-screen bg-gray-950 overflow-hidden pb-24">
      <AppHeader title="Radar" />
      <div className="relative h-[calc(100%-3.5rem-env(safe-area-inset-top))] w-full overflow-hidden">
        <RadarDisplay
          settings={settings}
          showNexrad={settings.showNexrad}
          onSettingsChange={setSettings}
          showRadio={showRadio}
          onToggleRadio={setShowRadio}
        />
      </div>

      <BottomTab />

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