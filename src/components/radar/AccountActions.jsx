import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { clearLocalAppData } from "@/lib/localData";

export default function AccountActions() {
  const [open, setOpen] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      clearLocalAppData();
    },
    onMutate: () => {
      setConfirmingClear(false);
      setOpen(false);
    },
    onSuccess: () => {
      window.location.assign("/");
    },
  });

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setConfirmingClear(false);
      }}
    >
      <DrawerTrigger asChild>
        <button
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          aria-label="Open local data menu"
        >
          Local data
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-white/10 bg-slate-950 text-white">
        <DrawerHeader>
          <DrawerTitle>Local data</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3 px-4 pb-6">
          {!confirmingClear ? (
            <button
              onClick={() => setConfirmingClear(true)}
              aria-label="Clear local data"
              className="w-full rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-950/70"
            >
              Clear local data
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
              <p className="text-sm text-red-100">This erases contacts, targets, and settings stored on this device. Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingClear(false)}
                  aria-label="Cancel clearing local data"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => clearDataMutation.mutate()}
                  aria-label="Confirm clearing local data"
                  disabled={clearDataMutation.isPending}
                  className="flex-1 rounded-lg border border-red-500 bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Confirm clear
                </button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}