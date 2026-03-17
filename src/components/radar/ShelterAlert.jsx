import { useState } from "react";

export default function ShelterAlert({ activeTornadoWarning, userLocation }) {
  const [confirmed, setConfirmed] = useState(false);

  const openSmsDraft = (lat, lon) => {
    const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
    const message = `⚠️ TORNADO WARNING ACTIVE. I am safe and sheltering. My location: ${mapsUrl} — sent via YouNeeK Pro Radar`;
    window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
    setConfirmed(true);
  };

  const handleTap = () => {
    if (!navigator.geolocation) {
      if (userLocation) {
        openSmsDraft(userLocation.lat, userLocation.lon);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        openSmsDraft(position.coords.latitude, position.coords.longitude);
      },
      () => {
        if (userLocation) {
          openSmsDraft(userLocation.lat, userLocation.lon);
        }
      }
    );
  };

  return (
    <>
      {activeTornadoWarning && (
        <div className="fixed bottom-6 left-1/2 z-[2000] -translate-x-1/2 px-4">
          <button
            onClick={handleTap}
            className="animate-pulse rounded-full border border-green-300 bg-green-500 px-6 py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(34,197,94,0.7)] transition-colors hover:bg-green-400 sm:text-base"
          >
            🟢 I&apos;M SHELTERING — TAP TO ALERT CONTACTS
          </button>
        </div>
      )}

      {confirmed && (
        <div className="fixed inset-0 z-[2001] flex items-center justify-center bg-black/60 px-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/95 px-6 py-5 text-center text-white shadow-2xl">
            <div className="text-lg font-semibold">✅ Stay sheltered. Help is on the way if needed.</div>
          </div>
        </div>
      )}
    </>
  );
}