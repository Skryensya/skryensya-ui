import {
  STORAGE_KEY,
  patchStore,
  clearPreference as clearSlot,
  readPreference,
  readStore,
  writeStore,
  type Preference,
  type StorageStore,
} from "@skryensya/core/storage";
import { useCallback, useSyncExternalStore } from "react";

/*
 * STORAGE, the React binding.
 *
 * `useStoredPreference(colorModePreference)` is `useState` that remembers. Like `useHotkey`, it sits
 * on core and never on @skryensya/vanilla — the two bindings are siblings over the same contract
 * (decision 14), so a React app installs one package and a vanilla app the other.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`, for two reasons that are not style:
 *
 *   - localStorage is an EXTERNAL store. Reading it during render is a side effect that tears under
 *     concurrent rendering: two components reading the same preference in one pass can disagree.
 *     `useSyncExternalStore` is the API React added for exactly this shape.
 *   - It gives SSR a separate path. `getServerSnapshot` returns the fallback, so a server render and
 *     the client's first paint agree, instead of hydrating into a mismatch the moment a stored value
 *     differs from the default.
 *
 * The snapshot must be REFERENTIALLY STABLE or React re-renders forever, which is why the cache below
 * exists: `readPreference` builds nothing, but the store it reads from is parsed fresh each call, so
 * an object-valued preference would return a new identity every time.
 */

/** Bubbles on `window` whenever any preference changes. Same name the vanilla binding dispatches. */
const storageChangeEvent = "sk-storage-change";

function safeRead(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWrite(store: StorageStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, writeStore(store));
  } catch {
    // Private mode, blocked site data, or quota. The setter still notifies, so the UI stays live for
    // this session; only persistence is lost.
  }
}

/*
 * Snapshot cache, keyed by the raw string.
 *
 * `getSnapshot` is called on every render and every notification, and it must return the SAME value
 * when nothing changed. Caching on the raw string means the identity only moves when the stored bytes
 * do, which is the honest definition of "changed" for something whose whole state is one string.
 */
let cachedRaw: string | null = null;
let cachedStore: StorageStore = {};

function currentStore(): StorageStore {
  const raw = safeRead();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedStore = readStore(raw);
  }
  return cachedStore;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(storageChangeEvent, onChange);
  // The native event only fires in OTHER tabs; this one hears its own writes through the custom event.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(storageChangeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function announce(slot: string): void {
  window.dispatchEvent(new CustomEvent(storageChangeEvent, { detail: { slot } }));
}

export type UseStoredPreference<Value> = readonly [
  value: Value,
  setValue: (next: Value) => void,
  clear: () => void,
];

/**
 * Read and write one declared preference, kept in sync across components and browser tabs.
 *
 *   const [mode, setMode] = useStoredPreference(colorModePreference);
 *
 * The third tuple member forgets the value rather than storing the current default, so a product that
 * changes its default later still reaches readers who never chose.
 */
export function useStoredPreference<Value>(preference: Preference<Value>): UseStoredPreference<Value> {
  const getSnapshot = useCallback(
    () => readPreference(currentStore(), preference),
    [preference],
  );

  // SSR and the pre-hydration snapshot: the fallback, so server and first client paint agree.
  const getServerSnapshot = useCallback(() => preference.fallback, [preference]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: Value) => {
      safeWrite(patchStore(currentStore(), preference, next));
      announce(preference.slot);
    },
    [preference],
  );

  const clear = useCallback(() => {
    safeWrite(clearSlot(currentStore(), preference));
    announce(preference.slot);
  }, [preference]);

  return [value, setValue, clear] as const;
}
