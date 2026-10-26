const LOCAL_STORAGE_KEYS = [
  "onboarded_v1",
  "pref_notifyRain",
  "pref_notifyTornado",
  "pref_autoTune",
  "shelterContacts_v2",
  "shelterContacts",
  "radarTargets",
];

const SESSION_STORAGE_KEYS = ["navigation-tab-state"];

function removeKeys(storage, keys) {
  if (!storage) return;
  for (const key of keys) {
    try {
      storage.removeItem(key);
    } catch {
      // Storage can throw in private browsing or when it is disabled.
    }
  }
}

export function clearLocalAppData() {
  if (typeof window === "undefined") return;
  removeKeys(window.localStorage, LOCAL_STORAGE_KEYS);
  removeKeys(window.sessionStorage, SESSION_STORAGE_KEYS);
}
