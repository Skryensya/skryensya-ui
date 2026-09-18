/*
 * THE RULE VOCABULARY, published with the artifact.
 *
 * The contracts use a handful of operators whose meaning lived only in `validate.ts`: what "present"
 * means for a boolean, what `option=value` means in an `implies` key, whether an omitted option reads
 * as its default. An external tool reading the manifest had to guess. This is the table it reads
 * instead, written once, next to the validator that enforces it.
 */
export const vocabulary = {
  given: "An option is given when the tree sets it (a boolean only when true), a slot when it holds a composed child or non-blank text, a collection when it has an entry.",
  when: {
    present: "`host.when` / `a11y.when`: the option is set to anything.",
    absent: "`host.when` / `a11y.when`: the option is not set.",
    value: "Any other value in `when`: the option equals it exactly.",
  },
  whenGiven: "Template node rendered only when the named option or slot is given; a list means any of them.",
  whenMissing: "Template node rendered only when none of the named options or slots is given.",
  requires: "Every listed option must be given (and a required string must not be blank).",
  forbids: "No listed option may be given on this signature.",
  exactlyOneOf: "Exactly one option of each group is given.",
  atLeastOneOf:
    "At least one member of each group counts: a filled slot, a boolean option set to true, or an option other than its default.",
  implies: "When the key holds, every listed name must hold too. Keys and names are an option, a slot, or `option=value` (the omitted option reads as its default).",
  excludes: "When the key holds, no listed name may hold. Same key forms as `implies`.",
  notInside: "The signature may not sit inside any listed signature, at any depth.",
  pairs: "The option on the child composed into slot `a` equals the option on the child in slot `b`; a side with no value or default takes the other side's default.",
  between: "A number bounded by other options of the same node, inclusive; an omitted bound reads as its default.",
  keyOf: "A string naming entries of the signature's own keyed collection (`many`: space- or comma-separated); recursive collections are searched at every depth.",
  refersTo: "A string equal to the named option of some node of the named contract elsewhere in the same tree.",
  valuesFrom: "A string whose allowed values are another contract's option `values`.",
  pattern: "A string matching the regular expression `source`.",
  list: "A string holding a list of positive numbers joined by `separator`; `countFrom` names the row whose children the length must match.",
  element: "An enum whose value is the host element's tag instead of an attribute.",
  slotRules: {
    ordered: "Children of the listed signatures appear in the order `of` lists them.",
    cardinality: "Per signature: `one` exactly one, `optional` at most one, `many` any number.",
    groupCardinality: "The same counts over a group of signatures counted together.",
    minItems: "Lower bound on composed children or collection entries (checked once there is at least one).",
    maxItems: "Upper bound on composed children or collection entries.",
    uniqueChildOption: "Among composed signature children, the named option must be distinct (duplicate values are errors).",
    countWhere: "How many collection entries may have `option` equal to `equals`.",
    positions: "Positioned siblings share one set size and never repeat a position (set size -1 means unknown).",
    flatHierarchy: "Flat rows describe a tree through level, set size, position and expanded; the rows must agree.",
    restrictOptions: "A child in this slot may only use the listed values for those options (booleans as \"true\"/\"false\").",
  },
  a11y: "When `when` holds, one of `requiresOneOf` must be given: an option, a raw attribute, a filled slot, or a child signature by name.",
  events: {
    name: "`events` maps the code name (`valueChange`) to the DOM name (`sk:accordionvaluechange`).",
    detail: "`eventDetails[name].detail` is the fields of `event.detail` with TypeScript types.",
    direction: "`direction: \"in\"` is a command the consumer dispatches; omit (or out) means the component fires it.",
    reactProp: "`reactProp` is the React callback (`onValueChange`); `false` means no dedicated prop (DOM / handle / site-only).",
    reactDetail: "`reactDetail` is the React callback argument when it is not the `detail` object (bare value or `void`).",
    source: "`source` is the key of `parts` that dispatches (or listens for) the CustomEvent; usually `root`.",
    trigger:
      "`trigger` is the key of `parts` the user activates to cause the event. Omit when several parts can fire it, for lifecycle/timeout, or for inbound commands.",
  },
  portals:
    "Signature `portals: true` means floating content leaves the subtree in React (Vanilla keeps it in place). `portals: { container: true }` also documents the React-only `container` ref that scopes the portal (default `document.body`).",
  optionAttrs:
    "Template `optionAttrs` renames a host option's attribute on one node; an empty-string value omits that attribute on that node.",
  childAttrs:
    "Slot `childAttrs` names attributes a direct child may carry on its own host (LayoutGrid `data-width`). Authored on the child via UsageTree `attrs`; values are checked against each option.",
  forward:
    "Signature `forward` lists host attributes accepted via UsageTree `attrs`. When set, other attrs are `unknown-attr` (except `class`/`style`, any `data-*` outside `data-sk-*`, a contract's `authoredAttrs`, and a parent slot's `childAttrs`). A trailing `*` is a prefix (`aria-*`). Absent keeps attrs open.",
  authoredAttrs:
    "Contract `authoredAttrs` publishes `data-sk-*` hooks an author writes on a host belonging to ANOTHER family (Vaul `data-sk-vaul-close` on a Button, Megamenu `data-sk-megamenu-preview` on a NavListLink). `data-*` outside `data-sk-*` is the author's namespace and needs no declaration; an undeclared `data-sk-*` is `unknown-attr`.",
  compose:
    "Signature `compose` lists families this signature borrows (`of` = contract id) via `also` / baked chrome / binding injection. Optional `sheets` must exist in the CSS corpus; `systemOwned: true` means the composed markup is not an authored UsageTree child.",
  systemOwned:
    "Contract `systemOwned` lists keys of `parts` that bindings/enhancers emit but authors never write in a UsageTree (Calendar grid, Carousel controls). Every name must be a key of `parts`.",
  hitTesting:
    "Signature `hitTesting` declares pointer hit-testing: `host: \"none\"` for the host itself, `childrenNone` for direct children of those signatures (BadgeHolder's Badge/BadgeDot) that receive `pointer-events: none`.",
  /**
   * What `surfaceHash` / changelog `surface` versions. Realization (template `also` / attr dumps,
   * wiring, because, intent, react, category, option.machineInput) is out; flipping those must not
   * move the gate. See `packages/ai-compiler/src/surface.ts`.
   */
  contractSurface:
    "Changelog `surface` hashes the public contract: css, parts, options (type/values/default/attr/prop/constraints/computedInput/…), events, eventDetails, a11y, hooks, hookSheets, outputHooks, authoredAttrs, systemOwned, and per signature host, option lists, requires/forbids/groups, parents, notInside, implies/excludes/pairs, slots, mount, portals, hitTesting, forward, compose, deprecated. Excludes template (also/attrs/attrsWhen/optionAttrs/…), wiring, because, intent, react, category, and option.machineInput.",
  severities: {
    error: "The tree is invalid.",
    advisory: "The rule cannot be settled from the tree alone, or the shape is legal but usually a mistake.",
  },
} as const;
