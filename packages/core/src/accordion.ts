import type { ComponentContract, OptionValue } from "./contract.js";

export type AccordionValue = string | readonly string[] | null;

export type AccordionValueChangeDetails = {
  value: AccordionValue;
};

/*
 * Runtime wiring that is NOT authored into markup the way options are. Controlled `value` and
 * `onValueChange` belong here (same split as Tabs): the contract owns what a UsageTree can set
 * (`defaultValue`, `type`, …); the binding owns the live state channel. See `accordionContract`.
 */
export type AccordionOptions = {
  type?: AccordionType;
  /** Controlled open set. React-only; authored markup has no controlled channel. */
  value?: AccordionValue;
  /**
   * Initial open set. React accepts a string or string[]; markup writes one string
   * (`data-default-value`, comma-separated when `type="multiple"`).
   */
  defaultValue?: AccordionValue;
  collapsible?: boolean;
  disabled?: boolean;
  onValueChange?: (details: AccordionValueChangeDetails) => void;
};

export const accordionDataParts = {
  root: "root",
  item: "item",
  trigger: "trigger",
  triggerHeading: "trigger-heading",
  content: "content",
} as const;

export const accordionScope = "accordion";

/** Class on the coordinating root, joins expandable Tiles into one framed stack. */
export const accordionParts = {
  root: "sk-accordion",
  /** The trigger's `role="heading"` wrapper. `display: contents` in accordion.css: see the contract. */
  triggerHeading: "sk-accordion__trigger-heading",
} as const;

/*
 * THE PLATFORM'S OWN DISCLOSURE, whose classes this contract also owns.
 *
 * `<details>`/`<summary>` opens, closes, is keyboard-reachable and is announced with no script at
 * all, and siblings sharing a `name` are exclusive without a coordinator. That is the same job the
 * signatures above do with a machine, which is exactly why it is not a second component: it used to
 * be one (`detailsContract`, its own page, its own row in the catalogue), and a reader had to pick
 * between two entries before learning they answered the same question. Same dissolve Popup got into
 * `Popover.bare`, and the same shape `Select.native` / `DatePicker.native` / `ColorPicker.native`
 * already have  -  the platform's version is a SIGNATURE of the family, not a rival to it.
 *
 * The class names are unchanged and stay `sk-details*`, because that is what the element is and
 * `details.css` (207 lines of it) already says so. Only the contract's part KEYS carry `native`, to
 * clear `root` and `content`, which the machine-driven half already holds.
 *
 * Exported as its own bag so `@skryensya/react/details` keeps importing one name, and because the
 * five classes are a set: a binding wants all of them or none.
 */
export const detailsParts = {
  group: "sk-details-group",
  root: "sk-details",
  summary: "sk-details__summary",
  indicator: "sk-details__indicator",
  content: "sk-details__content",
} as const;

export type DetailsPart = keyof typeof detailsParts;
export type DetailsPartClass = (typeof detailsParts)[DetailsPart];

export const accordionEvents = {
  /** Detail: `{ value: string | string[] | null }`, single → string|null, multiple → string[]. */
  valueChange: "sk:accordionvaluechange",
} as const;

/**
 * A stack of expandable tiles that agree on how many can be open.
 *
 * The coordination is the whole component: each item runs its own collapsible machine (ADR-190: one
 * accordion machine hid the content the moment it closed, killing the animation), and what the root
 * owns is the RULE: single or multiple, and whether the open one may close again.
 *
 * Its items are ExpandableTiles wearing a different `data-part`. That is not a shortcut: an
 * accordion section IS an expandable surface, and giving it its own anatomy would mean two
 * stylesheets that must be kept looking identical forever. `also` / shared part classes are the
 * realization; the public compose target for a lone section remains ExpandableTile.
 *
 * Initial open state (pick ONE channel):
 * - Root `defaultValue` → `data-default-value` (comma-separated when `type="multiple"`). React's
 *   `defaultValue` prop. Preferred when the open set is decided at the accordion.
 * - Per-item `defaultOpen` → `data-default-open`. Markup-friendly when each section declares itself.
 * Vanilla reads root first, then falls back to items. React only implements the root channel.
 *
 * Live updates: event `valueChange` (`sk:accordionvaluechange`); React also exposes `onValueChange`.
 * Controlled `value` is binding-only (see `AccordionOptions`), not a contract option.
 *
 * AND THE SAME COMPONENT SHIPS THE PLATFORM'S OWN VERSION, `DetailsGroup` / `Details` /
 * `Details.Summary` / `Details.Content`, which emit `<details>` and run no machine at all. They were
 * a contract of their own until this merge; see the block above those four signatures for what is
 * actually left to choose between, and `detailsParts` for why their classes keep the `sk-details`
 * name.
 */
export const accordionContract = {
  id: "accordion",
  category: "content",
  css: "@skryensya/core/components/accordion.css",
  parts: {
    ...accordionParts,
    item: "sk-tile",
    trigger: "sk-tile__trigger",
    content: "sk-tile__expandable-content",
    /* The platform half. `native` rather than `details` on the keys so the two anatomies read as one
       family with two owners, the way `Select.native` names its `<select>`. */
    nativeGroup: detailsParts.group,
    native: detailsParts.root,
    nativeSummary: detailsParts.summary,
    nativeIndicator: detailsParts.indicator,
    nativeContent: detailsParts.content,
  },
  hooks: [
    "--sk-accordion-bg",
    "--sk-accordion-border-color",
    "--sk-accordion-divider-color",
    "--sk-accordion-open-bg",
    "--sk-accordion-radius",
    "--sk-color-border-selected",
    "--sk-color-border-strong",
    "--sk-color-border-subtle",
    "--sk-color-focus",
    "--sk-color-selection-selected",
    "--sk-color-text-disabled",
    "--sk-color-text-primary",
    "--sk-color-text-secondary",
    "--sk-font-body-sm",
    "--sk-font-heading-sm",
    "--sk-space-2",
    "--sk-space-3",
    "--sk-space-4",
    "--sk-tile-border-color",
    "--sk-tile-padding",
    "--sk-tile-radius",
    "--sk-tile-shadow",
    "--sk-tile-title-weight",
    /* The native half's own surface (details.css). Same bag, because one contract now ships both. */
    "--sk-details-bg",
    "--sk-details-border-color",
    "--sk-details-content-bg",
    "--sk-details-content-fg",
    "--sk-details-fg",
    "--sk-details-gap",
    "--sk-details-heading-gap",
    "--sk-details-indicator-fg",
    "--sk-details-padding",
  ],
  /* This component's styling does not fit in one stylesheet; see `hookSheets` on the contract. The
     third is the platform half's: `details.css` paints `<details>` and animates `::details-content`,
     and nothing else in the system imports it. */
  hookSheets: [
    "@skryensya/core/components/tile.css",
    "@skryensya/core/components/details.css",
  ],
  events: accordionEvents,
  eventDetails: {
    valueChange: { detail: { value: "string | string[] | null" }, reactProp: "onValueChange", source: "root", trigger: "triggerHeading" },
  },

  options: {
    /** How many sections may be open. `single` is the default because it is what keeps a page short. */
    type: { type: "enum", values: ["single", "multiple"], default: "single", attr: "data-type" },
    /**
     * Whether the open section may be closed again. Only meaningful when `type` is `single`
     * (with `multiple`, every open section can close independently).
     */
    collapsible: { type: "boolean", default: true, attr: "data-collapsible", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    /**
     * Initial open item value(s). Markup: one string, comma-separated when `type="multiple"`.
     * React spells the same idea as `defaultValue` (string or string[]). Absent: vanilla falls
     * back to per-item `defaultOpen`; React starts with nothing open.
     */
    defaultValue: { type: "string", attr: "data-default-value", machineInput: true },
    /** Which section this one is, so the root can say which is open. Required: the rule needs a name. */
    value: { type: "string", attr: "data-value" },
    /** Starts expanded. Read once; after that the machine owns it. Markup channel when root has no defaultValue. */
    defaultOpen: { type: "boolean", default: false, attr: "data-default-open", trueValue: "", machineInput: true },
    /**
     * The page-outline heading level a trigger announces itself at (`aria-level`, on a wrapper
     * carrying `role="heading"`, never on the button. A control cannot also claim the heading
     * role its own interactive one already fills). WAI's Accordion pattern wants this so a
     * screen-reader user navigating by heading lands on every section; without it, sections are
     * reachable only by Tab. Defaults to 3, the level every demo in this codebase already uses for
     * the same sections rendered as `<details>` (`apps/docs/src/demos/accordion.ts`). Bindings
     * clamp to 1..6 (the only values `aria-level` means); the schema cannot yet express that range.
     */
    headingLevel: { type: "number", default: 3, min: 1, max: 6, integer: true, attr: "aria-level" },
    /**
     * Siblings sharing a name are exclusive; the browser closes the others itself.
     *
     * The platform half's answer to `type="single"`, and the reason it can be a real alternative
     * rather than a lesser one: the exclusivity is the browser's, not a coordinator's.
     */
    name: { type: "string", attr: "name" },
    /**
     * Starts expanded. After that the browser owns it: `Details`' counterpart to `defaultOpen`,
     * spelled the way HTML spells it.
     *
     * NOT exercised by the canonical tree, and the reason is unresolved rather than uninteresting:
     * the emitted markup carries `open` and React's `<details open>` came out closed, with no
     * warning logged and with every other option on the same node arriving fine. Left out of the
     * fixture so the gate is not green over a divergence; the option is real and the bindings
     * disagree about it, which is worth chasing with fresh eyes.
     */
    open: { type: "boolean", default: false, attr: "open", trueValue: "" },
  },

  signatures: {
    Accordion: {
      intent: ["accordion", "faq", "collapsible-sections", "coordinated-expandables"],
      host: { element: "div" },
      options: ["type", "collapsible", "disabled", "defaultValue"],
      /*
       * With `multiple`, every open section can close on its own; `collapsible` only gates `single`.
       * Both bindings already ignore the combo (`canCollapse = type === "multiple" || collapsible`).
       */
      excludes: { "type=multiple": ["collapsible"] },
      /** Host id / a11y names on the accordion root. */
      forward: ["id", "aria-*"],
      slots: {
        children: { accepts: "signature", of: ["Accordion.Item"], required: true },
      },
      mount: "data-sk-accordion",
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { "data-scope": "accordion", "data-part": "root" },
        slot: "children",
      },
      react: { from: "@skryensya/react/accordion", name: "Accordion" },
    },

    "Accordion.Item": {
      intent: ["accordion-section", "faq-entry"],
      host: { element: "section" },
      parents: ["Accordion"],
      options: ["value", "defaultOpen", "disabled"],
      requires: ["value"],
      /* Section is ExpandableTile chrome via shared parts / also / hookSheets. */
      compose: [
        {
          of: "tile",
          sheets: ["@skryensya/core/components/tile.css"],
          systemOwned: true,
        },
      ],
      slots: {
        children: {
          accepts: "signature",
          of: ["Accordion.Trigger", "Accordion.Content"],
          required: true,
          ordered: true,
          cardinality: { "Accordion.Trigger": "one", "Accordion.Content": "one" },
        },
      },
      /*
       * `sk-interactive` lives on the trigger, not here: same fix as `ExpandableTile` (which this
       * section shares its whole anatomy with): the section is the container, its trigger button
       * is the only clickable thing, and the state layer painting behind the whole section made
       * hovering the revealed answer tint it too.
       */
      template: {
        element: "section",
        part: "item",
        host: true,
        also: ["sk-tile--expandable"],
        // `item`, not `root`: the coordinator finds its sections by this, and the tile paint is the same.
        attrs: { "data-scope": "tile", "data-part": "item" },
        slot: "children",
      },
      react: { from: "@skryensya/react/accordion", name: "Accordion.Item" },
    },

    "Accordion.Trigger": {
      intent: ["accordion-header", "section-toggle"],
      // The host is the HEADING, not the button: `role="heading"` and `aria-level` name what this
      // is on the page outline, and a control cannot also claim the heading role its own
      // interactive one already fills, so the two live on separate elements. The wrapper is
      // `display: contents` (accordion.css), so it never becomes a real box between the section
      // and its button. The grid gap `.sk-tile` already sets between trigger and content reads
      // exactly as before.
      host: { element: "div" },
      parents: ["Accordion.Item"],
      options: ["headingLevel"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "div",
        part: "triggerHeading",
        host: true,
        attrs: { role: "heading", "data-part": accordionDataParts.triggerHeading },
        optionAttrs: { headingLevel: "aria-level" },
        children: [
          {
            element: "button",
            part: "trigger",
            also: ["sk-tile--interactive", "sk-interactive"],
            attrs: { type: "button", "data-scope": "tile", "data-part": "trigger" },
            slot: "children",
          },
        ],
      },
      react: { from: "@skryensya/react/accordion", name: "Accordion.Trigger" },
    },

    "Accordion.Content": {
      intent: ["accordion-body", "the-answer"],
      host: { element: "div" },
      parents: ["Accordion.Item"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "div",
        part: "content",
        host: true,
        attrs: { "data-scope": "tile", "data-part": "content" },
        slot: "children",
      },
      react: { from: "@skryensya/react/accordion", name: "Accordion.Content" },
    },

    /*
     * THE PLATFORM HALF. Four signatures that emit `<details>` and nothing else, with no machine,
     * no mount attribute and no vanilla enhancer: there is nothing for one to do.
     *
     * WHAT ACTUALLY DECIDES between these and the four above, now that both animate. The old split
     * said animation  -  `Accordion` runs a machine so it can transition its panels, `Details`
     * cannot  -  and that stopped being true when `details.css` grew its `::details-content`
     * transition behind `@supports (interpolate-size: allow-keywords)`. What is left is CONTROL: an
     * open set you can drive from outside, a `sk:accordionvaluechange` to listen to, and a
     * `disabled` section. A page that needs none of those should take the platform's.
     *
     * SHAPE MIRRORS `ExpandableTile`, not a single signature with a `summary` prop: `Details`
     * composes `Details.Summary` and `Details.Content` as children. A `summary` prop hiding that
     * structure read as more component than the platform actually needed; this way the React binding
     * is close to writing `<details><summary>…</summary>…</details>` by hand, which is the whole
     * point of reaching for the platform's own element instead of a machine.
     */
    DetailsGroup: {
      intent: ["faq-without-javascript", "exclusive-disclosures", "no-runtime-accordion"],
      host: { element: "section" },
      options: [],
      slots: { children: { accepts: "signature", of: ["Details"], required: true } },
      template: { element: "section", part: "nativeGroup", host: true, slot: "children" },
      react: { from: "@skryensya/react/details", name: "DetailsGroup" },
    },

    Details: {
      intent: ["one-disclosure", "expandable-section", "no-javascript"],
      host: { element: "details" },
      /*
       * NOT `parents: ["DetailsGroup"]`: a lone disclosure is the common case (FAQ item without
       * exclusivity, docs aside). The group is optional coordination via shared `name`, not a
       * required ancestor, same split `Accordion` vs a single `ExpandableTile`.
       */
      options: ["name", "open"],
      slots: {
        children: {
          accepts: "signature",
          of: ["Details.Summary", "Details.Content"],
          required: true,
          ordered: true,
          cardinality: { "Details.Summary": "one", "Details.Content": "one" },
        },
      },
      template: { element: "details", part: "native", host: true, slot: "children" },
      react: { from: "@skryensya/react/details", name: "Details" },
    },

    "Details.Summary": {
      intent: ["disclosure-trigger", "what-the-closed-state-shows"],
      host: { element: "summary" },
      parents: ["Details"],
      options: [],
      /** Host id / a11y names on the disclosure summary. */
      forward: ["id", "aria-*"],
      /* Baked chevron-down/up via `data-sk-icon`; not an authored Icon child (BackToTop same). */
      compose: [{ of: "icon", systemOwned: true }],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "summary",
        part: "nativeSummary",
        also: ["sk-interactive"],
        host: true,
        children: [
          { slot: "children" },
          /*
           * The disclosure mark, BAKED IN rather than composed; unlike `Accordion.Trigger`, which
           * leaves `TileChevron` to the author. `<summary>` already suppresses the browser's own
           * triangle (`list-style: none`, `.sk-details__summary::marker { content: "" }`), so an
           * instance with nothing composed here would lose the affordance WCAG expects a disclosure
           * to have, not just look plain. `details.css` already carried the swap rules for
           * `sk-details__indicator` before any template painted it.
           *
           * Two icons, never a rotated one, same rule `TileChevron`'s own comment states: the set
           * supplies chevron-down and chevron-up, and `[open]` on the ancestor `<details>` is what
           * CSS keys the swap on; no JS, because the platform already owns `open` here.
           */
          {
            element: "span",
            part: "nativeIndicator",
            attrs: { "aria-hidden": "true" },
            children: [
              {
                element: "span",
                attrs: { "data-state": "closed" },
                children: [
                  { element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "md" } },
                ],
              },
              {
                element: "span",
                attrs: { "data-state": "open" },
                children: [
                  { element: "span", attrs: { "data-sk-icon": "chevron-up", "data-sk-icon-size": "md" } },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/details", name: "Details.Summary" },
    },

    "Details.Content": {
      intent: ["disclosure-body", "what-opening-reveals"],
      host: { element: "div" },
      parents: ["Details"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "nativeContent", host: true, slot: "children" },
      react: { from: "@skryensya/react/details", name: "Details.Content" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: adding a value to the contract's `type` enum is the only edit. */
export type AccordionType = OptionValue<typeof accordionContract.options.type>;
