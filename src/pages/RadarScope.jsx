import { useState, useCallback, Suspense, lazy } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
const RadarDisplay = lazy(() => import("../components/radar/RadarDisplay"));
import TargetDialog from "../components/radar/TargetDialog";
import BottomTab from "../components/radar/BottomTab";
import AppHeader from "@/components/mobile/AppHeader";
import { useNavigationStack } from "@/lib/NavigationStack";
import useTabPageMemory from "@/hooks/useTabPageMemory";

const DEFAULT_SETTINGS = {
  showLabels: true,
  showTails: true,
  theme: "green",    // green | amber | blue
  showNexrad: false, // live NEXRAD overlay
  station: "KJKL",   // default station (nearest to Columbia, KY)
  showVelocity: false, // show velocity overlay
};

export default function RadarScope() {
  useTabPageMemory("Radar");
  const navigate = useNavigate();
  const location = useLocation();
  const { goBack } = useNavigationStack();
  const queryClient = useQueryClient();
  const { data: targets = [] } = useQuery({
    queryKey: ["radarTargets"],
    queryFn: async () => JSON.parse(localStorage.getItem("radarTargets") || "[]"),
    initialData: [],
  });
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

  const createTargetMutation = useMutation({
    mutationFn: async () => {
      const nextTargets = queryClient.getQueryData(["radarTargets"]) || [];
      localStorage.setItem("radarTargets", JSON.stringify(nextTargets));
      return nextTargets;
    },
    onMutate: async (targetData) => {
      await queryClient.cancelQueries({ queryKey: ["radarTargets"] });
      const previousTargets = queryClient.getQueryData(["radarTargets"]) || [];
      const newTarget = {
        id: Date.now().toString(),
        ...targetData,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData(["radarTargets"], [...previousTargets, newTarget]);
      if (location.search) {
        goBack(location.pathname);
      } else {
        navigate(location.pathname, { replace: true });
      }
      return { previousTargets };
    },
    onError: (_error, _targetData, context) => {
      queryClient.setQueryData(["radarTargets"], context?.previousTargets || []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["radarTargets"] });
    },
  });

  const deleteTargetMutation = useMutation({
    mutationFn: async () => {
      const nextTargets = queryClient.getQueryData(["radarTargets"]) || [];
      localStorage.setItem("radarTargets", JSON.stringify(nextTargets));
      return nextTargets;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["radarTargets"] });
      const previousTargets = queryClient.getQueryData(["radarTargets"]) || [];
      queryClient.setQueryData(["radarTargets"], previousTargets.filter((target) => target.id !== id));
      if (location.search) {
        goBack(location.pathname);
      } else {
        navigate(location.pathname, { replace: true });
      }
      return { previousTargets };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(["radarTargets"], context?.previousTargets || []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["radarTargets"] });
    },
  });

  const handleCreateTarget = useCallback((targetData) => {
    createTargetMutation.mutate(targetData);
  }, [createTargetMutation]);

  const handleDeleteTarget = useCallback((id) => {
    deleteTargetMutation.mutate(id);
  }, [deleteTargetMutation]);

  const handleCloseDialog = useCallback(() => {
    if (location.search) {
      goBack(location.pathname);
    } else {
      navigate(location.pathname, { replace: true });
    }
  }, [goBack, navigate, location.pathname, location.search]);

  return (
    <div className="safe-screen h-screen bg-gray-950 overflow-hidden pb-24">
      <AppHeader title="Radar" />
      <div className="relative h-[calc(100%-3.5rem-env(safe-area-inset-top))] w-full overflow-hidden">
        <Suspense
          fallback={(
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"></div>
            </div>
          )}
        >
          <RadarDisplay
            settings={settings}
            showNexrad={settings.showNexrad}
            onSettingsChange={setSettings}
            showRadio={showRadio}
            onToggleRadio={setShowRadio}
          />
        </Suspense>
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