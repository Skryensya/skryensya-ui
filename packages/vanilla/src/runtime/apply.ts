type AttrValue = string | number | boolean | null | undefined;

type Attrs = Record<string, AttrValue>;
type Events = Record<string, EventListener>;

export function applyAttrs(element: Element, attrs: Attrs): void {
  for (const [name, value] of Object.entries(attrs)) {
    if (value === false || value == null) {
      element.removeAttribute(name);
    } else if (value === true) {
      element.setAttribute(name, "");
    } else {
      element.setAttribute(name, String(value));
    }
  }
}

export function bindEvents(element: Element, events: Events): () => void {
  const cleanups: Array<() => void> = [];

  for (const [name, listener] of Object.entries(events)) {
    element.addEventListener(name, listener);
    cleanups.push(() => element.removeEventListener(name, listener));
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

/*
 * ── The Zag/Svelte mode: patching `connect` props onto authored markup ────────────────────────────
 *
 * Zag's `connect`s return prop objects typed as framework attributes (with no index signature): they
 * mix attributes, `onX` handlers and `style`. These two functions are progressive enhancement's
 * "patch-in-place": instead of rendering new markup, they sync those props onto the authored HTML,
 * preserving its content and its BEM classes (they never touch `class`). It is the vanilla counterpart
 * of what `spreadProps` does in the framework's DOM, and it lives here so every `.svelte` can reuse it.
 */

// Zag's `connect`s hand back props with no index signature; to iterate them generically we treat them
// as a record.
export type DomProps = Record<string, unknown>;

const isEventKey = (key: string) => /^on[A-Za-z]/.test(key);

// Attributes the browser treats as booleans: presence = true.
const BOOLEAN_ATTRS = new Set([
  "hidden",
  "disabled",
  "readonly",
  "required",
  "checked",
  "selected",
  "open",
  "inert",
]);

/*
 * Which inline declarations THIS runtime put on each node. Authored markup also brings inline styles
 * (`style="--sk-carousel-slide-size: 26rem"`); overwriting the whole attribute would erase them, so we
 * patch declaration by declaration and only remove the ones we had put there ourselves and that no
 * longer come back.
 */
const appliedStyleProps = new WeakMap<HTMLElement, Set<string>>();

/*
 * Which attributes THIS runtime put on each node in the previous patch. Same as with the styles: Zag
 * OMITS a state prop when it turns false (`getItemProps` stops including `data-highlighted` as soon as
 * the item stops being highlighted, instead of sending it as `false`), so a patch that only walks the
 * present props never sees the old attribute and does not remove it. Without this, `data-highlighted` /
 * `data-state` ACCUMULATE: keyboarding down a list, every row that gets highlighted keeps the mark and
 * several end up highlighted at once. We remember what we wrote and remove what no longer comes back,
 * which is the same thing Zag's `spreadProps` does (Select uses it) and why that one does not have the bug.
 */
const appliedAttrs = new WeakMap<Element, Set<string>>();

/** `"display:grid;gap:8px"` → `[["display","grid"],["gap","8px"]]`. */
function parseStyleString(value: string): Array<[string, string]> {
  return value
    .split(";")
    .map((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator < 0) return null;
      const prop = declaration.slice(0, separator).trim();
      const raw = declaration.slice(separator + 1).trim();
      return prop ? ([prop, raw] as [string, string]) : null;
    })
    .filter((entry): entry is [string, string] => entry !== null);
}

/** camelCase of Zag's props to the real CSS property; custom properties are left untouched. */
const cssProp = (key: string) =>
  key.startsWith("--")
    ? key
    : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

function applyStyle(node: HTMLElement, value: unknown): void {
  if (value == null) return;

  const entries: Array<[string, string]> =
    typeof value === "string"
      ? parseStyleString(value)
      : typeof value === "object"
        ? Object.entries(value as Record<string, unknown>)
            .filter(([, raw]) => raw != null)
            .map(([prop, raw]) => [cssProp(prop), String(raw)])
        : [];

  const previous = appliedStyleProps.get(node);
  const applied = new Set<string>();

  for (const [prop, raw] of entries) {
    node.style.setProperty(prop, raw);
    applied.add(prop);
  }

  if (previous) {
    for (const prop of previous) {
      if (!applied.has(prop)) node.style.removeProperty(prop);
    }
  }
  appliedStyleProps.set(node, applied);
}

export type ApplyOptions = {
  /**
   * Whether to write the props' `style`. Yes by default.
   *
   * Set it to `false` when the MACHINE also writes styles by hand on the same node. The `style`
   * `connect` returns is static configuration (derived from props that do not change), but an
   * `$effect` re-applies it on EVERY state change, and there it beats what the machine just wrote
   * imperatively.
   *
   * The case that uncovered it: the carousel sets `scroll-snap-type: none` while you drag, so it can
   * move the track by hand. The effect returned it to `x mandatory` in the same frame, so every pixel
   * of drag re-snapped it, and moving the mouse 10px jumped a whole slide. Configuration is applied
   * ONCE; state belongs to the machine.
   */
  style?: boolean;
};

/**
 * Syncs a Zag props object onto `node`. It ignores event handlers (those are wired with
 * {@link bindZagEvents}) and never overwrites `class`; the BEM classes are authored by the consumer.
 */
export function applyZagProps(
  node: HTMLElement,
  props: DomProps,
  options: ApplyOptions = {},
): void {
  const writeStyle = options.style !== false;
  // Attributes this patch leaves PRESENT on the node; at the end we remove the ones we had put there
  // before and that no longer come back (the state Zag omits instead of sending as false).
  const owned = new Set<string>();
  const previous = appliedAttrs.get(node);

  for (const key in props) {
    const value = props[key];

    if (key === "class" || key === "className") continue;
    if (typeof value === "function") continue; // handlers y demás

    if (key === "style") {
      if (writeStyle) applyStyle(node, value);
      continue;
    }

    if (value === false || value === undefined || value === null) {
      // Boolean aria-* attributes need the string "false" (they stay present); the rest are removed.
      if (value === false && key.startsWith("aria-")) {
        node.setAttribute(key, "false");
        owned.add(key);
      } else if (value === false || previous?.has(key)) {
        /*
         * `false` is an opinion: the machine says that state is off, and it is removed.
         *
         * `undefined` / `null` are NOT: they are the prop the machine does not fill because nobody
         * passed it, and in authored markup that name may belong to the AUTHOR. Zag tooltip's
         * `getTriggerProps` returns `"data-value": undefined` when it is given no `value`; deleting it
         * tore the `data-value` off every `<button data-sk-segmented-option>` that is also a
         * Tooltip trigger, and Segmented was left unable to resolve which option had been
         * clicked (the preview's screen presets: Free/Tablet/Mobile stopped responding).
         * Only what THIS runtime had written before is deleted.
         */
        node.removeAttribute(key);
      }
      continue;
    }

    if (value === true) {
      if (key.startsWith("aria-")) node.setAttribute(key, "true");
      else if (BOOLEAN_ATTRS.has(key)) node.setAttribute(key, "");
      else node.setAttribute(key, "true");
      owned.add(key);
      continue;
    }

    node.setAttribute(key, String(value));
    owned.add(key);
  }

  // Sweep of the stale: an attribute THIS runtime wrote in the previous patch and that the current
  // props no longer bring is a state that turned off (e.g. the `data-highlighted` of the row that
  // stopped being highlighted). It never touches authored attributes: only the ones we put there leave.
  if (previous)
    for (const key of previous) if (!owned.has(key)) node.removeAttribute(key);
  appliedAttrs.set(node, owned);
}

/*
 * `applyZagProps` never overwrites `class`: the BEM classes are authored by the consumer. Several
 * enhancers need a specific exception to that rule: not to RENDER anything, but to GUARANTEE that a
 * structural or state-layer class (`sk-interactive`, `sk-tile--expandable`, `sk-anchor`) is present
 * even if the author forgot it, the same backstop the old enhancer gave before this migration. That
 * exception used to be reopened with a loose `classList.add` in every component that needed it (nine
 * sites, across seven files), each with its own comment re-explaining why. `ensureClasses` is the only
 * place that exception exists: `applyZagProps`'s rule is still "never class" except through this named,
 * searchable function, and the classes it guarantees are documented at the call site, not reinvented.
 */
export function ensureClasses(node: HTMLElement, ...classes: readonly string[]): void {
  node.classList.add(...classes);
}

/** DOM event name from Svelte (`onclick`) or Vanilla (`onPointerDown`) keys. */
const eventName = (key: string) => key.slice(2).toLowerCase();

/**
 * Wires a Zag props object's event handlers onto `node`. `getProps` is re-read on every firing so the
 * current handler is always used (the machine changes state and with it Zag's closure). Returns a
 * function that removes every added listener.
 */
export function bindZagEvents(
  node: HTMLElement,
  getProps: () => DomProps,
): () => void {
  const initial = getProps();
  const handlers: Array<[string, EventListener]> = [];

  for (const key in initial) {
    if (!isEventKey(key) || typeof initial[key] !== "function") continue;
    const type = eventName(key);
    const listener: EventListener = (event) => {
      const fn = getProps()[key];
      if (typeof fn === "function") (fn as (e: Event) => void)(event);
    };
    node.addEventListener(type, listener);
    handlers.push([type, listener]);
  }

  return () => {
    for (const [type, listener] of handlers)
      node.removeEventListener(type, listener);
  };
}
