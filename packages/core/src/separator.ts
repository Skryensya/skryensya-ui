import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * SEPARATOR, a rule between two things.
 *
 * IT EXISTS BECAUSE EVERY OTHER FAMILY WAS ALREADY DRAWING ONE PRIVATELY. Toolbar has
 * `ToolbarSeparator`, Sidebar has `SidebarSeparator`, and `menu.css` and `patterns/footer.css` each
 * paint their own `role="separator"`; outside those, a page that wanted a rule between two blocks
 * had nothing to reach for and wrote a `<div>` with a border. This is that rule, published once.
 *
 * NOT A SPLITTER. A `role="separator"` that can be MOVED is focusable, takes arrow keys and reports
 * `aria-valuenow` (WAI's Window Splitter). That is `@skryensya/core/splitter`, and it is a different
 * component with a different keyboard contract. This one is static by construction: it divides, it
 * does not resize.
 *
 * THE DEFAULT IS A MEANINGFUL RULE, NOT A DECORATIVE ONE. `<hr>` is a paragraph-level thematic
 * break with an implicit `separator` role, and that is the right default for the case this family
 * was published for: a line that says two blocks are about different things. `decorative` is the
 * opt-out, for the rule that only exists to draw - a chrome hairline inside a card - which is
 * announced as nothing at all. Both spellings are real; what is wrong is having only one.
 */
export const separatorParts = {
  root: "sk-separator",
  /** The two rules either side of a label. Decorative by construction: the label carries the name. */
  rule: "sk-separator__rule",
  label: "sk-separator__label",
} as const;

export type SeparatorPart = keyof typeof separatorParts;
export type SeparatorPartClass = (typeof separatorParts)[SeparatorPart];

export const separatorContract = {
  id: "separator",
  category: "layout",
  css: "@skryensya/core/components/separator.css",
  parts: separatorParts,
  hooks: [
    "--sk-separator-color",
    "--sk-separator-label-fg",
    "--sk-separator-label-font-size",
    "--sk-separator-label-gap",
    "--sk-separator-spacing",
    "--sk-separator-thickness",
  ],

  options: {
    /**
     * Which way it runs. `vertical` is the rule BETWEEN two things sitting side by side, and it
     * needs a height from whatever holds it: a separator has no content of its own to give it one.
     *
     * `alsoAttr` is what keeps the paint and the announcement from disagreeing: the stylesheet
     * selects on `data-orientation` and a screen reader reads `aria-orientation`, and one option
     * behind both means they can never drift.
     */
    orientation: {
      type: "enum",
      values: ["horizontal", "vertical"],
      default: "horizontal",
      attr: "data-orientation",
      alsoAttr: "aria-orientation",
    },
    /**
     * How loud the rule is. Named by ROLE, like every other tone in the system: `subtle` is chrome
     * inside a surface, `default` divides content, `strong` separates sections that have little to
     * do with each other.
     */
    tone: {
      type: "enum",
      values: ["subtle", "default", "strong"],
      default: "default",
      attr: "data-tone",
    },
    /**
     * The air around it. `none` is for a rule that sits flush inside something that already spaces
     * it (a menu, a toolbar); the default leaves a block gap on both sides.
     */
    spacing: {
      type: "enum",
      values: ["none", "sm", "md", "lg"],
      default: "md",
      attr: "data-spacing",
    },
    /**
     * The rule is PAINT, not meaning: it is removed from the accessibility tree entirely.
     *
     * For a hairline that exists to draw a box's internal edge, where announcing "separator" adds a
     * landmark to a screen reader's pass over content that has none. When the line says two blocks
     * are about different things, leave this off.
     */
    decorative: { type: "boolean", default: false, attr: "data-decorative", trueValue: "" },
  },

  signatures: {
    Separator: {
      intent: ["divider", "thematic-break", "rule-between-blocks", "hairline"],
      host: { element: "hr" },
      options: ["orientation", "tone", "spacing", "decorative"],
      forward: ["id", "aria-*"],
      slots: {},
      template: {
        element: "hr",
        part: "root",
        host: true,
        /*
         * `role="presentation"` and not `aria-hidden`: the element has no content to hide, and
         * presentation is the spelling that says "this box is paint" while leaving the DOM alone.
         */
        attrsWhen: [{ option: "decorative", equals: "true", attrs: { role: "presentation" } }],
      },
      react: { from: "@skryensya/react/separator", name: "Separator" },
    },

    /*
     * THE ONE WITH A WORD IN IT: "or", "since 2019", "older". Two rules with a label between them.
     *
     * It is a `<div>` and not an `<hr>` because an `<hr>` may hold no content, and it carries
     * `role="separator"` explicitly to keep what the element lost. The name comes from the label
     * through `aria-labelledby` rather than from the content, because `separator` is not a
     * name-from-content role: a screen reader reaches a nameless separator and says "separator",
     * which is exactly the word the visible label was written to replace.
     */
    LabelledSeparator: {
      intent: ["or-divider", "labelled-divider", "rule-with-a-word-in-it"],
      host: { element: "div" },
      /* No `orientation`: a label in a vertical rule is a line of rotated text, which is a
         different component and not a variant of this one. */
      options: ["tone", "spacing"],
      forward: ["id"],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "separator" },
        labelledBySlot: "children",
        children: [
          { element: "span", part: "rule", attrs: { "aria-hidden": "true" } },
          { element: "span", part: "label", slot: "children" },
          { element: "span", part: "rule", attrs: { "aria-hidden": "true" } },
        ],
      },
      react: { from: "@skryensya/react/separator", name: "LabelledSeparator" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: a hand-written union here would be a second place the values live. */
export type SeparatorOrientation = OptionValue<typeof separatorContract.options.orientation>;
export type SeparatorTone = OptionValue<typeof separatorContract.options.tone>;
export type SeparatorSpacing = OptionValue<typeof separatorContract.options.spacing>;
