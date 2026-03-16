import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactsDialog({ isOpen, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("safeContacts");
      if (saved) {
        setContacts(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  const saveContacts = (updated) => {
    setContacts(updated);
    localStorage.setItem("safeContacts", JSON.stringify(updated));
  };

  const addContact = () => {
    if (!newPhone.trim()) return;
    const updated = [...contacts, newPhone.trim()];
    saveContacts(updated);
    setNewPhone("");
  };

  const removeContact = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    saveContacts(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-96 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-green-400 font-mono font-bold text-sm tracking-widest uppercase">
            Emergency Contacts
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Input */}
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addContact()}
              className="bg-gray-800 border-gray-600 text-green-300 font-mono text-sm"
            />
            <Button
              onClick={addContact}
              size="icon"
              className="bg-green-800 hover:bg-green-700 text-green-100"
            >
              <Plus size={16} />
            </Button>
          </div>

          {/* Contacts List */}
          {contacts.length === 0 ? (
            <div className="text-gray-500 text-xs font-mono text-center py-4">
              No contacts saved yet
            </div>
          ) : (
            <ul className="space-y-2">
              {contacts.map((phone, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded border border-gray-700"
                >
                  <span className="text-green-300 font-mono text-sm">{phone}</span>
                  <button
                    onClick={() => removeContact(idx)}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Info */}
          <div className="text-gray-500 text-xs font-mono text-center pt-2">
            {contacts.length > 0 && (
              <div>
                Messages will SMS to {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 font-mono text-xs"
          >
            DONE
          </Button>
        </div>
      </div>
    </div>
  );
}