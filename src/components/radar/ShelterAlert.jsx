import React from 'react';

export default function ShelterAlert({ activeTornadoWarning }) {
  const contacts = JSON.parse(localStorage.getItem('shelterContacts') || '[]');
  if (!contacts || contacts.length === 0) return null;
  if (!activeTornadoWarning) return null;

  const handleShelter = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const body = encodeURIComponent(`⚠️ TORNADO WARNING ACTIVE. I am safe and sheltering. My location: ${mapsUrl} — sent via YouNeeK Pro Radar`);
      window.open(`sms:?&body=${body}`);
    }, () => {
      const body = encodeURIComponent(`⚠️ TORNADO WARNING ACTIVE. I am safe and sheltering. — sent via YouNeeK Pro Radar`);
      window.open(`sms:?&body=${body}`);
    });
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 z-[1600] flex justify-center px-3" style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-emerald-400/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
              Tornado Warning
            </div>
            <h3 className="mt-2 text-sm font-semibold text-white">Send your safe message fast</h3>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              One tap opens a text message to your shelter contacts with your status and location.
            </p>
          </div>
          <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-200">
            {contacts.length} contact{contacts.length === 1 ? '' : 's'}
          </div>
        </div>

        <button
          aria-label="Alert shelter contacts"
          onClick={handleShelter}
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(74,222,128,0.35)] transition-colors hover:bg-emerald-300"
        >
          I’m Sheltering — Alert Contacts
        </button>
      </div>
    </div>
  );
}