import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { base44 } from "@/api/base44Client";

export default function AccountActions() {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const me = await base44.auth.me();
      await base44.entities.User.delete(me.id);
      await base44.auth.logout("/");
    },
    onMutate: () => {
      setConfirmingDelete(false);
      setOpen(false);
    },
  });

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setConfirmingDelete(false);
      }}
    >
      <DrawerTrigger asChild>
        <button
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          aria-label="Open account menu"
        >
          Account
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-white/10 bg-slate-950 text-white">
        <DrawerHeader>
          <DrawerTitle>Account</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3 px-4 pb-6">
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              aria-label="Delete account"
              className="w-full rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-950/70"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
              <p className="text-sm text-red-100">This permanently deletes your account. Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingDelete(false)}
                  aria-label="Cancel account deletion"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAccountMutation.mutate()}
                  aria-label="Confirm account deletion"
                  disabled={deleteAccountMutation.isPending}
                  className="flex-1 rounded-lg border border-red-500 bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}