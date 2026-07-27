/*
 * STORAGE, the contract, and the only part with no browser in it.
 *
 * A design system persists preferences: color mode, contrast, density, whatever a product adds. That
 * is not a component, it is plumbing every consumer re-invents — and re-invented four times inside
 * this repo alone, each copy with its own try/catch, its own key, and its own hand-rolled guard. So it
 * ships like every other behaviour with no platform equivalent (decision 14): the pure codec here, the
 * imperative binding in @skryensya/vanilla, the hook in @skryensya/react. This file knows how to READ
 * and PATCH a store, and nothing about where the string came from.
 *
 * THREE RULES, and they are the whole design:
 *
 *   1. ONE ENTRY. Everything lives under a single localStorage key holding one JSON object. Not one
 *      key per preference: a namespace of loose `sk-*` keys is impossible to clear, to inspect or to
 *      version, and it is what `sk-playground` had started to become. One entry means "reset the
 *      site" is one `removeItem`.
 *
 *   2. A PREFERENCE IS DECLARED, never ad-hoc. `definePreference` takes a slot, a fallback and a
 *      PARSER, and the parser is mandatory. Stored data is untrusted input — the reader can edit it,
 *      and a version you shipped last month can leave a shape this one has never seen. Every existing
 *      call site already hand-wrote an `isBinding` / `isColorMode` guard next to its read; making the
 *      guard part of the declaration is what removes the duplication instead of relocating it.
 *
 *   3. READING NEVER FAILS. An unparseable store, an unknown value, a `localStorage` that throws
 *      because the reader is in private mode — every one of them yields the fallback. A preference is
 *      a nicety; nothing about it justifies taking the page down.
 */

/**
 * The single localStorage entry the whole system shares.
 *
 * Deliberately short and unnamespaced-looking: it is the consumer's origin, not ours, and a longer
 * key buys nothing. Consumers who need a different one pass it to the vanilla binding.
 */
export const STORAGE_KEY = "sk";

/** The parsed store: slot → whatever was written there. Values are UNTRUSTED until parsed. */
export type StorageStore = Record<string, unknown>;

/**
 * A declared preference: where it lives, what it accepts, and what it is when it is not there.
 *
 * @typeParam Value - the parsed type, which is what every reader gets back.
 */
export interface Preference<Value> {
  /** The slot inside the store's object. */
  slot: string;
  /** What a reader gets when the slot is absent, unparseable or invalid. */
  fallback: Value;
  /**
   * Untrusted value in, `Value` or `undefined` out. Return `undefined` to reject, which is what
   * makes a stale or hand-edited entry fall back instead of propagating.
   */
  parse: (raw: unknown) => Value | undefined;
}

/**
 * Declare a preference. The identity function with a type — the point is that the three facts travel
 * together, so nothing can read a slot without also saying how to validate it.
 *
 *   export const colorModePreference = definePreference({
 *     slot: "scheme",
 *     fallback: "system",
 *     parse: (raw) => (isColorMode(raw) ? raw : undefined),
 *   });
 */
export function definePreference<Value>(preference: Preference<Value>): Preference<Value> {
  return preference;
}

/**
 * Parse a raw storage string into a store. Never throws.
 *
 * A non-object JSON payload (`"null"`, `"3"`, `"[]"`) is treated as absent rather than spread into a
 * store: `{...null}` is silently `{}` but `{...[1,2]}` is `{0:1,1:2}`, and a store with numeric slots
 * is a corrupted one that would then be written back.
 */
export function readStore(raw: string | null | undefined): StorageStore {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as StorageStore;
  } catch {
    return {};
  }
}

/** Serialise a store back to a string. The inverse of {@link readStore}. */
export function writeStore(store: StorageStore): string {
  return JSON.stringify(store);
}

/** Read one preference out of an already-parsed store, falling back on anything unexpected. */
export function readPreference<Value>(store: StorageStore, preference: Preference<Value>): Value {
  const parsed = preference.parse(store[preference.slot]);
  return parsed === undefined ? preference.fallback : parsed;
}

/**
 * A store with one slot replaced. Pure: the caller decides where the result goes.
 *
 * Read-modify-write over the WHOLE object on every change, rather than keeping a store in memory, is
 * what keeps two preferences from clobbering each other's slot when a second tab wrote in between.
 */
export function patchStore<Value>(
  store: StorageStore,
  preference: Preference<Value>,
  value: Value,
): StorageStore {
  return { ...store, [preference.slot]: value };
}

/** A store with one slot removed, so "go back to the default" is not a value that has to be stored. */
export function clearPreference(store: StorageStore, preference: Preference<unknown>): StorageStore {
  const { [preference.slot]: _removed, ...rest } = store;
  return rest;
}

/**
 * Parse helper for the common case: a preference whose values are a closed set of strings.
 *
 * `oneOf(colorModes)` is the whole parser for scheme, contrast, binding and screen — which is every
 * preference in this repo, because a preference with an open-ended value is usually a setting that
 * wanted to be state.
 */
export function oneOf<const Value extends string>(
  values: readonly Value[],
): (raw: unknown) => Value | undefined {
  return (raw) => (typeof raw === "string" && (values as readonly string[]).includes(raw) ? (raw as Value) : undefined);
}

/** Parse helper for a free-form string slot (a share code, a draft), with an optional length cap. */
export function stringValue(maxLength = 1024): (raw: unknown) => string | undefined {
  return (raw) => (typeof raw === "string" && raw.length <= maxLength ? raw : undefined);
}

/** Parse helper for a boolean slot. */
export function booleanValue(): (raw: unknown) => boolean | undefined {
  return (raw) => (typeof raw === "boolean" ? raw : undefined);
}
