import { useState } from "react";
import { base44 } from "@/api/base44Client";
import BottomTab from "@/components/radar/BottomTab";

export default function Settings() {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteAccount = async () => {
    const me = await base44.auth.me();
    await base44.entities.User.delete(me.id);
    await base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-28 pt-6 text-white">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="mt-2 text-sm text-slate-400">Manage your account and mobile experience.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-slate-300">Account</div>
          <div className="mt-4 space-y-3">
            {!confirmingDelete ? (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="w-full rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm font-medium text-red-300"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                <p className="text-sm text-red-100">This permanently deletes your account. Are you sure?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 rounded-xl bg-red-600 px-3 py-3 text-sm font-medium text-white"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}