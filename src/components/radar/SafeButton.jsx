import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function SafeButton({ isTornadoWarning, mapRef }) {
  const [contacts, setContacts] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load contacts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("safeContacts");
    if (saved) {
      setContacts(JSON.parse(saved));
    }
  }, []);

  const handleSafePing = () => {
    if (!contacts.length) {
      alert("Add emergency contacts in Settings first!");
      return;
    }

    // Get current map center
    const center = mapRef.current?.getCenter();
    const lat = center?.lat || 0;
    const lon = center?.lng || 0;
    const message = `I'm safe. Location: https://maps.google.com/?q=${lat},${lon}`;

    // Open SMS for each contact
    contacts.forEach((phone) => {
      window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, "_blank");
    });

    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (!isTornadoWarning) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {showSuccess && (
        <div className="mb-3 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-2 animate-pulse">
          <CheckCircle size={14} />
          Messages sent
        </div>
      )}
      <button
        onClick={handleSafePing}
        className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg shadow-lg transition-all animate-pulse"
      >
        <CheckCircle size={18} />
        I'm Safe
      </button>
      <div className="mt-2 text-xs text-gray-400 font-mono text-right max-w-xs">
        {contacts.length} contact{contacts.length !== 1 ? "s" : ""} saved
      </div>
    </div>
  );
}