import type { ComponentContract } from "./contract.js";
/*
 * The icon contract. Types and vocabulary, no geometry, no DOM, no dependencies.
 *
 * Core names ROLES and never a provider (decision 2). "chevron-down" is a position the system
 * references; which drawing occupies it is decided by the consumer when binding an IconSet, exactly
 * like a brand decides which hue occupies --palette-blue-600. A core module called `lucide` would be
 * a tenant with a proper name, and it would also break the package's empty dependencies.
 *
 * What is NOT here, and why (decision 15):
 *   - providers with hasIcon/getIcon: a runtime service needs the whole catalogue in memory, which
 *     is exactly what the allowlist was meant to avoid. A set is an index, not a service.
 *   - manifest and type generators: the consumer's object literal IS the manifest, and `satisfies`
 *     gives the same error generated types would. Removing dead code is the bundler's job.
 */

/**
 * Normalized SVG geometry: the children of an `<svg>`, without the element.
 *
 * The binding writes the `<svg>` (viewBox, a11y, class); the set contributes only what goes inside.
 * That split is what keeps accessibility and the class name out of the set's reach.
 */
export type IconData = {
  /**
   * Markup that is a child of the `<svg>`. TRUSTED: authored in the project or generated at build
   * time, never from a user or an API; the renderer injects it without sanitizing. See the cost
   * stated in decision 15.
   */
  body: string;
  /**
   * The literal viewBox `body` was drawn in. Never a rendered size, that is decided by
   * `--sk-icon-size`.
   *
   * It is a string and not a width/height pair because a viewBox does not always start at `0 0`:
   * Material draws in `0 -960 960 960`. Storing two numbers and assembling `0 0 w h` was a lossy
   * encoding that only worked by coincidence, while the only sets were Lucide (`0 0 24 24`) and
   * Phosphor (`0 0 256 256`).
   */
  viewBox: string;
  /**
   * Presentation attributes for the outer `<svg>`. This is where the geometry's intent lives: an
   * outline set sets `{ fill: "none", stroke: "currentColor", "stroke-width": "2" }` and a solid one
   * sets `{ fill: "currentColor" }`.
   *
   * It belongs to the set and not to CSS on purpose: a CSS declaration beats a presentation
   * attribute, so a `fill: currentColor` in patterns/icon.css would turn every outline set solid.
   */
  attrs?: Readonly<Record<string, string>>;
};

/**
 * The stable vocabulary: the roles the system references and that survive a change of set.
 *
 * It covers an app's most common cases, not just what the foundational components consume: a
 * vocabulary that only reached `chevron-down` would force every project to re-declare `search` or
 * `delete` as its own icon, and then the name of the system's most common role would be different in
 * every app, which is exactly what a stable vocabulary exists to prevent.
 *
 * Every name here is a ROLE, never a drawing (decision 2, one tier up). That is why `delete` and not
 * `trash`, `edit` and not `pencil`, `search` and not `magnifying-glass`, `more` and not `dots`,
 * `visibility` and not `eye`: the name has to stay true when another set draws the role differently.
 * The `chevron-*` and `arrow-*` ones are the deliberate exception, they name a direction, and the
 * distinction between the two (chevron reveals, arrow moves) has no other short name.
 *
 * `danger`, not `error`: the system already says danger in --color-text-danger, --color-action-danger
 * and BadgeTone, and a word does not coexist with its synonym.
 *
 * The limit stays the same: a PRODUCT concept (invoice, warehouse, airplane-tilt) does not get in no
 * matter how common it is in an app, it is passed as `data` and belongs to the consumer. And every
 * name here is an obligation for every set author, because IconSet is complete: adding one is
 * additive for the consumer and new work for whoever draws.
 */
export const stableIconNames = [
  // dirección, chevron revela y adjunta, arrow mueve y navega
  "chevron-up",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "arrow-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  /* VOTING, and why it is a role of its own and not "the fat arrow". The `arrow-*` ones above name a
   * DIRECTION and are the vocabulary's deliberate exception; this names an ACTION, and that is why it
   * works as a stable name where `arrow-big-up` would not: that is the name Lucide gives the drawing,
   * Phosphor calls it `arrow-fat-up` and Material does not even draw an arrow, it draws a thumb.
   * Three drawings, one role, which is exactly the case this list exists to resolve (`delete` and not
   * `trash`). A set decides what occupies it; the system asks for "voting". */
  "vote-up",
  "vote-down",
  "external-link",

  // acción
  "add",
  "remove",
  "close",
  "check",
  "search",
  "edit",
  "delete",
  "copy",
  "filter",
  "refresh",
  /* Zooms the view out, it does not name a magnifying glass: a set may draw a minus in a circle or
   * arrows pointing inward, and the role stays true. */
  "zoom-out",
  "more",
  "menu",

  // state, the four tones the system already names
  "info",
  "success",
  "warning",
  "danger",

  // contenido y sistema
  "calendar",
  "clock",
  "upload",
  "download",
  "file",
  "folder",
  "settings",
  "user",
  "visibility",
  "visibility-off",
  /* An app's language / locale selection. It is a ROLE, not a drawing: it names "pick the language of
   * this", and it stays true whether a set draws it as two crossed writing strokes (Lucide), an "A文"
   * pair (Material, Phosphor) or anything else. That is why `language` and not `translate`, which is
   * the name two of the three sets give the drawing, nor `globe`, which would say "region / web"
   * before "change the language". The three published sets cover it. */
  "language",

  // color mode (the ThemeToggle's faces)
  "mode-system",
  "mode-light",
  "mode-dark",

  /* screen class. It is a ROLE like the rest: it names the SIZE of screen, not the device drawn. A set
   * may draw `screen-desktop` as a monitor or as a laptop and `screen-mobile` as a phone or as a hand
   * holding a phone, and all three names stay true. That is why `screen-desktop` and not `monitor`,
   * which would be the drawing, exactly like `delete` and not `trash`.
   *
   * `screen-desktop` is NOT a synonym of `mode-system`, even though Lucide and Phosphor draw both as
   * a monitor: one says "the system decides the mode" and the other "large screen". Two roles that
   * share a drawing today are still two roles, and a set may separate them tomorrow. */
  "screen-desktop",
  "screen-tablet",
  "screen-mobile",
] as const;

export type StableIconName = (typeof stableIconNames)[number];

/**
 * The binding of each role to a geometry; an icon set is a brand.
 *
 * Complete, not partial: a set that does not cover the vocabulary leaves a foundational component
 * without its icon at runtime, just like a brand missing a ramp position leaves a broken color.
 *
 * Core ships none, and cannot: a real set comes from an external library, and @skryensya/core's
 * dependencies are empty on purpose. Sets live in separate packages,
 * `@skryensya/icons-lucide`, `@skryensya/icons-phosphor`, `@skryensya/icons-material`, which is the
 * exit decision 15 had already anticipated: additive, and without core naming a tenant.
 */
export type IconSet = Readonly<Record<StableIconName, IconData>>;

/**
 * The pattern's three sizes, which the renderer writes as `data-size`.
 *
 * There is no numeric escape hatch: an arbitrary size is requested by re-declaring the hook, which is
 * how every arbitrary value in the system is requested, `.hero .sk-icon { --sk-icon-size: 2rem; }`. A
 * numeric prop that wrote width/height would lose against the CSS inline-size anyway.
 */
export type IconSize = "sm" | "md" | "lg";

/**
 * The icon "box", the `<svg>` the binding writes around a set's geometry, computed ONCE, as data.
 *
 * The same contract was being encoded four times: React's `<Icon>`, vanilla's `buildIcon`, and the
 * docs' `iconMarkup`/`iconDataMarkup`. The rules that matter, the box always owns the class, the
 * viewBox, the size and the accessibility, so a set can never override them; a set's `attrs` supply
 * fill/stroke and nothing else; a label turns a decorative icon into content, lived in only one of
 * the four (vanilla). This centralises them so every renderer stays a thin adapter to its own output
 * target (JSX, a DOM node, a string): pure data in, two ordered attribute groups plus the body out.
 *
 * `presentation` is the set's own attrs (fill/stroke/…), with any box-owned key stripped out so a set
 * can't seize the viewBox or accessibility. `box` is what the binding owns, and it comes LAST at every
 * call site so it wins. An adapter that also carries consumer attributes (React's `{...props}`,
 * vanilla's authored attributes) places them BETWEEN the two groups, after presentation, so they may
 * override fill/stroke; before box, so they never override the contract.
 */
export type RenderIconBoxInput = {
  /** The geometry to wrap. */
  icon: IconData;
  /** Written as `data-icon`; omit to skip it (React re-renders on context change and needs no marker). */
  dataIcon?: string;
  /** Emitted as `data-size` only when provided. React defaults to `"md"`, so it is always present there. */
  size?: IconSize;
  /**
   * The accessible name. `undefined`/`null` → decorative (`aria-hidden`). Any string, INCLUDING the
   * empty string, → content (`role="img"` + `aria-label`), matching an authored `data-sk-icon-label=""`.
   */
  label?: string | null;
  /** Extra classes beyond `sk-icon`, already joined. `sk-icon` is always present and always first. */
  className?: string;
};

/** The resolved box: two ordered attribute groups (set-owned, then box-owned) and the inner geometry. */
export type IconBox = {
  presentation: [string, string][];
  box: [string, string][];
  body: string;
};

/** The attributes the box owns outright, a set that names one of these in `attrs` is ignored. */
const BOX_OWNED = new Set([
  "class",
  "viewbox",
  "data-icon",
  "data-size",
  "aria-hidden",
  "aria-label",
  "role",
  "focusable",
]);

export function renderIconBox({ icon, dataIcon, size, label, className }: RenderIconBoxInput): IconBox {
  const presentation = Object.entries(icon.attrs ?? {}).filter(([k]) => !BOX_OWNED.has(k.toLowerCase()));

  const box: [string, string][] = [];
  if (dataIcon !== undefined) box.push(["data-icon", dataIcon]);
  box.push(["class", className ? `sk-icon ${className}` : "sk-icon"]);
  if (size) box.push(["data-size", size]);
  // the viewBox is where the geometry was drawn, taken from the set as-is, never a rendered size, and
  // never `0 0 w h` (Material draws in "0 -960 960 960").
  box.push(["viewBox", icon.viewBox]);
  // a label makes the icon content; without one it is decorative. A control with text already names the
  // action, so decorative is the right default.
  if (label !== undefined && label !== null) {
    box.push(["role", "img"], ["aria-label", label]);
  } else {
    box.push(["aria-hidden", "true"]);
  }
  // an svg is not a tab stop; historic IE/Edge made it one and this is still the cure.
  box.push(["focusable", "false"]);

  return { presentation, box, body: icon.body };
}

/*
 * The contract. An icon is the clearest case of the two bindings meeting at different depths:
 * React renders the `<svg>` itself, while authored markup writes a PLACEHOLDER; `<span
 * data-sk-icon="delete">`; the enhancer replaces with the real element once a set is bound.
 *
 * They converge because both go through `renderIconBox` above: the same box attributes, the same
 * viewBox from the set, the same decorative-by-default accessibility. The placeholder is not a
 * lesser form, it is the only form authored markup can take; the system ships no geometry
 * (decision 15), so the drawing cannot exist until a set is chosen.
 *
 * `name` is a stable icon name, a ROLE the system names: `delete`, never `trash`.
 */
export const iconContract = {
  id: "icon",
  css: "@skryensya/core/patterns/icon.css",
  parts: { root: "sk-icon" },

  options: {
    /**
     * The stable name: a ROLE the system names, never the drawing. Constrained to the vocabulary
     * itself, so a name no set is obliged to draw fails validation instead of crashing at mount;
     * which is what `inbox` did the first time this contract was exercised.
     */
    name: { type: "enum", values: stableIconNames, attr: "data-sk-icon" },
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-sk-icon-size" },
    /**
     * The accessible name. Absent means decorative, which is the right default: a control with a
     * visible label already names itself, and a second name is noise.
     */
    label: { type: "string", attr: "data-sk-icon-label" },
  },

  signatures: {
    Icon: {
      intent: ["icon", "glyph", "pictogram", "decorative-mark"],
      host: { element: "span" },
      options: ["name", "size", "label"],
      requires: ["name"],
      slots: {},
      /*
       * The placeholder carries no part class: the class belongs to the `<svg>` the binding writes,
       * and a set never controls the class, the size or the accessibility (decision 15).
       */
      template: { element: "span", host: true },
      react: { from: "@skryensya/react/icon", name: "Icon" },
    },
  },
} as const satisfies ComponentContract;
