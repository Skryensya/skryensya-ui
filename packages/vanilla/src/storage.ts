/*
 * STORAGE, the imperative binding.
 *
 * Core owns the codec and the declaration; this file owns the only three things that need a browser:
 * touching `localStorage`, surviving its failures, and telling everyone when a value changed.
 *
 * WHY IT IS WORTH A MODULE, given every call site is three lines. Those three lines were wrong in all
 * four copies this replaced, in the same two ways:
 *
 *   - `localStorage` THROWS. Not "returns null"; throws, on property access, in Safari private mode
 *     and wherever site data is blocked. A bare `localStorage.getItem` at module scope takes the page
 *     down for those readers. Every access here is guarded, and a failed store degrades to memory, so
 *     the preference stops persisting and nothing else changes.
 *
 *   - A SECOND TAB is invisible. Nothing hand-rolled subscribed to the `storage` event, so two open
 *     tabs drifted apart until reload. Subscribing is what makes a preference a preference rather than
 *     a per-tab variable, and it costs one listener for the whole page.
 */

import {
  STORAGE_KEY,
  patchStore,
  clearPreference as clearSlot,
  readPreference as readFromStore,
  readStore,
  writeStore,
  type Preference,
  type StorageStore,
} from "@skryensya/core/storage";

export type Unsubscribe = () => void;

/**
 * The in-memory fallback store.
 *
 * Not a cache: it is only consulted when the real one is unreachable. Caching a reachable store would
 * mean a write from another tab is invisible until reload, which is the bug the `storage` listener
 * below exists to fix.
 */
let memoryStore: StorageStore = {};
let storageWorks: boolean | null = null;

/** Probe once. Writing is the real test; Safari private mode reads fine and throws on write. */
function storage(): Storage | null {
  if (storageWorks === false) return null;
  try {
    const probe = "__sk_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    storageWorks = true;
    return window.localStorage;
  } catch {
    storageWorks = false;
    return null;
  }
}

function loadStore(): StorageStore {
  const store = storage();
  if (!store) return memoryStore;
  try {
    return readStore(store.getItem(STORAGE_KEY));
  } catch {
    return memoryStore;
  }
}

function saveStore(next: StorageStore): void {
  memoryStore = next;
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, writeStore(next));
  } catch {
    // Quota exceeded, or storage revoked mid-session. The value stays in memory for this tab.
  }
}

/** Bubbles on `window` whenever any preference changes, in this tab or another one. */
export const storageChangeEvent = "sk-storage-change";

/** `detail.slot` is the slot that changed, or `null` when the whole entry was cleared elsewhere. */
export type StorageChangeDetail = { slot: string | null };

let crossTabBound = false;

/**
 * Re-broadcast another tab's write as our own change event, so a subscriber needs one listener rather
 * than two. The `storage` event only fires in OTHER tabs, which is exactly the gap: this tab already
 * knows about its own writes because it made them.
 */
function bindCrossTab(): void {
  if (crossTabBound || typeof window === "undefined") return;
  crossTabBound = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    // `key === null` means the whole origin was cleared.
    window.dispatchEvent(
      new CustomEvent<StorageChangeDetail>(storageChangeEvent, { detail: { slot: null } }),
    );
  });
}

/** Read a preference. Never throws; an unreachable, corrupt or stale store yields its fallback. */
export function getPreference<Value>(preference: Preference<Value>): Value {
  return readFromStore(loadStore(), preference);
}

/** Write a preference and announce it. Read-modify-write, so a concurrent slot is never clobbered. */
export function setPreference<Value>(preference: Preference<Value>, value: Value): void {
  saveStore(patchStore(loadStore(), preference, value));
  announce(preference.slot);
}

/**
 * Forget a preference, so the reader goes back to the fallback.
 *
 * Distinct from writing the fallback: a stored fallback freezes today's default into the reader's
 * browser, and a product that later changes its default would never reach them.
 */
export function clearPreference(preference: Preference<unknown>): void {
  saveStore(clearSlot(loadStore(), preference));
  announce(preference.slot);
}

function announce(slot: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<StorageChangeDetail>(storageChangeEvent, { detail: { slot } }),
  );
}

/**
 * Call `listener` with the current value now and on every later change, here or in another tab.
 *
 * Returns the unsubscribe. Fires immediately on purpose: "read it, then watch it" is what every
 * caller wanted, and splitting the two is how a caller ends up rendering a stale first frame.
 */
export function subscribePreference<Value>(
  preference: Preference<Value>,
  listener: (value: Value) => void,
): Unsubscribe {
  bindCrossTab();
  let last = getPreference(preference);
  listener(last);

  const onChange = (event: Event) => {
    const slot = (event as CustomEvent<StorageChangeDetail>).detail?.slot;
    // `null` is a whole-store change from another tab: it may or may not touch this slot, so re-read.
    if (slot !== null && slot !== preference.slot) return;
    const next = getPreference(preference);
    if (Object.is(next, last)) return;
    last = next;
    listener(next);
  };

  window.addEventListener(storageChangeEvent, onChange);
  return () => window.removeEventListener(storageChangeEvent, onChange);
}

/** Wipe the whole entry: the one call behind a "reset preferences" control. */
export function clearAllPreferences(): void {
  memoryStore = {};
  const store = storage();
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do: memory is already clear */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<StorageChangeDetail>(storageChangeEvent, { detail: { slot: null } }),
    );
  }
}

/** Test seam: forget the probe result and the memory fallback between cases. */
export function resetStorageForTests(): void {
  memoryStore = {};
  storageWorks = null;
}
