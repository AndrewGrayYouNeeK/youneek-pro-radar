import { useState, useCallback } from "react";
import RadarDisplay from "../components/radar/RadarDisplay";
import TargetDialog from "../components/radar/TargetDialog";
import TargetList from "../components/radar/TargetList";
import RadarControls from "../components/radar/RadarControls";
import RadioPlayer from "../components/radar/RadioPlayer";

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
    <div className="h-screen bg-gray-950 flex flex-col md:flex-row overflow-hidden">
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