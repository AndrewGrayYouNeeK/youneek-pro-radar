import { useState, useCallback } from "react";
import RadarDisplay from "../components/radar/RadarDisplay";
import TargetDialog from "../components/radar/TargetDialog";

const DEFAULT_SETTINGS = {
  showLabels: true,
  showTails: true,
  theme: "green",    // green | amber | blue
  showNexrad: false, // live NEXRAD overlay
  station: "KJKL",   // default station (nearest to Columbia, KY)
  showVelocity: false, // show velocity overlay
};

export default function RadarScope() {
  const [targets, setTargets] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showRadio, setShowRadio] = useState(true);
  const [pendingClick, setPendingClick] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [dialogMode, setDialogMode] = useState(null); // 'create' | 'inspect'

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
    <div className="h-screen bg-gray-950 overflow-hidden">
      <div className="relative h-full w-full overflow-hidden">
        <RadarDisplay
          settings={settings}
          showNexrad={settings.showNexrad}
          onSettingsChange={setSettings}
          showRadio={showRadio}
          onToggleRadio={setShowRadio}
        />
      </div>

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