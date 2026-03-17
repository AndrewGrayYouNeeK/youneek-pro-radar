import { useEffect, useState } from "react";
import BottomTab from "@/components/radar/BottomTab";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("shelterContacts") || "[]");
    setContacts(stored);
  }, []);

  const saveContacts = (nextContacts) => {
    setContacts(nextContacts);
    localStorage.setItem("shelterContacts", JSON.stringify(nextContacts));
  };

  const addContact = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    saveContacts([...contacts, trimmed]);
    setValue("");
  };

  const removeContact = (contactToRemove) => {
    saveContacts(contacts.filter((contact) => contact !== contactToRemove));
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-28 pt-6 text-white">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Shelter Contacts</h1>
          <p className="mt-2 text-sm text-slate-400">Add the people you want ready when you tap the shelter alert button.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex gap-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Phone number or contact note"
              className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none"
            />
            <button
              onClick={addContact}
              className="rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No shelter contacts saved yet.
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-white">{contact}</div>
                <button
                  onClick={() => removeContact(contact)}
                  className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs font-medium text-red-300"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomTab />
    </div>
  );
}