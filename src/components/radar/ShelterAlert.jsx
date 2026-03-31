import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function loadContacts() {
  try {
    // Try new format first
    const v2 = JSON.parse(localStorage.getItem('shelterContacts_v2') || 'null');
    if (Array.isArray(v2) && v2.length > 0 && v2[0]?.phone) return v2;
    // Fall back to legacy (array of phone strings)
    const legacy = JSON.parse(localStorage.getItem('shelterContacts') || '[]');
    return legacy.map((p, i) => ({ id: String(i), name: `Contact ${i + 1}`, phone: p }));
  } catch { return []; }
}

export default function ShelterAlert({ activeTornadoWarning, activeTornadoWatch }) {
  const [sent, setSent] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const sendTimerRef = useRef(null);
  const contacts = loadContacts();

  if (!contacts.length) return null;

  const handleShelter = (messagePrefix = "⚠️ TORNADO WARNING") => {
    const uniquePhones = [...new Set(contacts.map((c) => c.phone).filter(Boolean))];
    if (!uniquePhones.length) return;

    const buildBody = (locationLine) =>
      encodeURIComponent(
        `${messagePrefix} — I'm safe and sheltering.\n${locationLine}\n— sent via YouNeeK Pro Radar`
      );

    const openNext = (phones, locationLine, index) => {
      if (index >= phones.length) return;
      const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? "&" : "?";
      window.open(`sms:${phones[index]}${separator}body=${buildBody(locationLine)}`, '_blank');
      setCurrentContactIndex(index + 1);
      // Stagger each subsequent contact by 1.5 seconds so the user can send before the next opens
      if (index + 1 < phones.length) {
        setTimeout(() => openNext(phones, locationLine, index + 1), 1500);
      }
    };

    const send = (locationLine) => {
      openNext(uniquePhones, locationLine, 0);
      setSent(true);
      if (sendTimerRef.current) window.clearTimeout(sendTimerRef.current);
      sendTimerRef.current = window.setTimeout(() => {
        setSent(false);
        setIsTesting(false);
        setCurrentContactIndex(0);
      }, 8000);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          send(`My location: https://maps.google.com/?q=${latitude},${longitude}`);
        },
        () => send('(Location unavailable)')
      );
    } else {
      send('(Location unavailable)');
    }
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[1600] flex justify-center px-3"
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-full max-w-md rounded-2xl border border-emerald-400/40 bg-emerald-950/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-sm font-bold text-emerald-300">
                  Sending to {contacts.length} contact{contacts.length !== 1 ? 's' : ''}{' '}
                  {contacts.length > 1 && currentContactIndex > 0 ? `(${currentContactIndex}/${contacts.length})` : ''}
                </p>
                <p className="text-xs text-emerald-400/70 mt-0.5">
                  {isTesting
                    ? 'Test drafts are opening one by one — send each as it opens.'
                    : 'Message drafts are opening one by one — send each as it opens.'}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="alert"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            {/* Warning badge */}
            <div className="mb-2 flex items-center justify-between">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${activeTornadoWarning ? 'border border-red-500/30 bg-red-500/10 text-red-300' : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full animate-pulse ${activeTornadoWarning ? 'bg-red-400' : 'bg-amber-400'}`} />
                {activeTornadoWarning ? 'Tornado Warning Active' : 'Tornado Watch Active'}
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
              </div>
            </div>

            <p className="mb-3 text-xs leading-5 text-slate-300">
              Tap below to send your location &amp; safe status to{' '}
              <span className="font-semibold text-white">{contacts.map((c) => c.name).join(', ')}</span>.
            </p>

            <div className="space-y-2">
              {(activeTornadoWarning || activeTornadoWatch) && (
                <button
                  aria-label="Send shelter alert to all contacts"
                  onClick={() => handleShelter(activeTornadoWarning ? "⚠️ TORNADO WARNING" : "🟡 TORNADO WATCH")}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(74,222,128,0.3)] transition-colors hover:bg-emerald-400 active:scale-[0.98]"
                >
                  {activeTornadoWarning ? "🏠 I'm Sheltering — Alert All Contacts" : "🟡 Heads Up — Alert All Contacts"}
                </button>
              )}

              <button
                aria-label="Test emergency text to all contacts"
                onClick={() => {
                  setIsTesting(true);
                  handleShelter("🧪 TEST MESSAGE");
                }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15 active:scale-[0.98]"
              >
                🧪 Test Emergency Text
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
