import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * TAGS INPUT, several values typed into one field.
 *
 * WHAT IT IS, stated against its neighbours, because three of them are close enough to be picked by
 * mistake:
 *
 *   - Combobox resolves what is typed to one of ITS OWN options. This one accepts whatever was
 *     typed: the vocabulary is the person's, not the page's. A field that must end up with values
 *     from a known list is a multi-select Combobox, and choosing this instead means accepting
 *     typos as data.
 *   - Tag renders one chip. It has no field, no keyboard and no value; this composes it.
 *   - FileUpload is the other "a list grows as you add to it" control, and the difference is where
 *     the value comes from: a file is picked from the platform, a tag is typed.
 *
 * IT COMPOSES TAG RATHER THAN DRAWING CHIPS OF ITS OWN. The chip inside the field IS a Tag,
 * `sk-tag` classes and all, because a system where the chip in a filter bar and the chip in a field
 * are two different drawings has two chips. What this family owns is the FIELD around them.
 *
 * THE VALUE IS AUTHORED AS MARKUP, one element per tag, rather than seeded from an attribute the
 * enhancer parses. That is what keeps emitted markup honest before its JavaScript arrives: the tags
 * are already there, already readable, and the enhancer patches machine props onto elements that
 * exist instead of creating them. Rating authors one radio per step for the same reason.
 */
export const tagsInputParts = {
  root: "sk-tags-input",
  /** The box that looks like a field: the tags and the entry sit inside it, and it takes the focus ring. */
  control: "sk-tags-input__control",
  /**
   * The tags, as a group. `display: contents`, so it adds no box: it exists because the LIST is the
   * value, and the enhancer replaces the whole of it at once when the value changes (see the Svelte
   * component). Without it there is no node standing for "the tags" that is not also the field.
   */
  list: "sk-tags-input__items",
  /** One tag's outer element, which is what the machine highlights and navigates. */
  item: "sk-tags-input__item",
  /** The chip itself. Composes Tag: this is `sk-tag` with a hook of its own. */
  preview: "sk-tags-input__item-preview",
  text: "sk-tags-input__item-text",
  remove: "sk-tags-input__item-remove",
  /** The field a tag turns into while it is being edited in place. */
  itemInput: "sk-tags-input__item-input",
  /** Where new tags are typed. */
  input: "sk-tags-input__input",
  /** The form participant, carrying the whole value so a plain submit works. */
  hidden: "sk-tags-input__hidden",
} as const;

export type TagsInputPart = keyof typeof tagsInputParts;
export type TagsInputPartClass = (typeof tagsInputParts)[TagsInputPart];

/** The enhancer's attachment points. Authored markup has no channel but an attribute. */
export const tagsInputAttrs = {
  root: "data-sk-tags-input",
  control: "data-sk-tags-input-control",
  list: "data-sk-tags-input-items",
  item: "data-sk-tags-input-item",
  preview: "data-sk-tags-input-item-preview",
  text: "data-sk-tags-input-item-text",
  remove: "data-sk-tags-input-item-remove",
  itemInput: "data-sk-tags-input-item-input",
  input: "data-sk-tags-input-input",
  hidden: "data-sk-tags-input-hidden",
} as const;

export type TagsInputValueChangeDetails = { value: string[] };

/** The DOM events this family dispatches, `sk:<family><event>` like every other one. */
export const tagsInputEvents = {
  /** Detail: `{ value: string[] }`. The whole list, not the one that changed. */
  valueChange: "sk:tagsinputvaluechange",
} as const;

/** Zag's own default, published here so both bindings read one source instead of its internals. */
export const tagsInputDefaultDelimiter = ",";

export const tagsInputContract = {
  id: "tags-input",
  category: "forms",
  css: "@skryensya/core/components/tags-input.css",
  parts: tagsInputParts,
  events: tagsInputEvents,
  eventDetails: {
    valueChange: {
      detail: { value: "string[]" },
      reactProp: "onValueChange",
      source: "root",
      trigger: "input",
    },
  },
  hooks: [
    /*
     * TWO OF TAG'S OWN HOOKS, re-declared here and therefore published here. The highlighted chip
     * is `sk-tag` tinted, not a second drawing, so the tint is written the way the system says to
     * write one: by re-declaring the composed component's hooks rather than out-specifying its
     * rules. Declaring them is what keeps the reconciliation honest - a hook a sheet sets and no
     * contract names is override surface nothing documents.
     */
    "--sk-tag-bg",
    "--sk-tag-fg",
    "--sk-tags-input-bg",
    "--sk-tags-input-border-color",
    "--sk-tags-input-border-width",
    "--sk-tags-input-disabled-bg",
    "--sk-tags-input-disabled-border-color",
    "--sk-tags-input-gap",
    "--sk-tags-input-input-min-size",
    "--sk-tags-input-invalid-border-color",
    "--sk-tags-input-padding-x",
    "--sk-tags-input-padding-y",
    "--sk-tags-input-radius",
    "--sk-tags-input-readonly-bg",
    "--sk-tags-input-readonly-border-color",
    "--sk-tags-input-shadow",
    "--sk-tags-input-wash",
  ],

  options: {
    /**
     * The accessible name of the field where tags are typed.
     *
     * Required, and on the INPUT rather than the box around it: the box is not a control, so a name
     * written there would name nothing a screen reader ever lands on.
     */
    label: { type: "string", attr: "aria-label" },
    placeholder: { type: "string", attr: "placeholder" },
    /**
     * Every delete control's accessible name. One string for all of them, and deliberately not a
     * `{value}` pattern like Rating's `itemLabel`: interpolating per tag is copy the EMITTER cannot
     * produce, so authored markup and React would announce two different names for the same button.
     * Tag makes the same call for the same reason.
     */
    removeLabel: { type: "string", default: "Remove", attr: "aria-label" },
    /**
     * How many tags the field accepts.
     *
     * PAST IT A NEW TAG IS REFUSED IN SILENCE, and the refusal is visible in one place: the text
     * stays in the entry instead of turning into a chip. That is the machine's own behaviour, stated
     * here because it is what a consumer has to design around - a page that needs to say WHY counts
     * the tags itself on `valueChange` and writes its own message.
     */
    max: { type: "number", min: 1, integer: true, attr: "data-max", machineInput: true },
    /**
     * The character that both COMMITS a tag and splits a pasted list. `,` by default, which is what
     * a person pasting a list from a spreadsheet already has between their values.
     */
    delimiter: {
      type: "string",
      default: tagsInputDefaultDelimiter,
      attr: "data-delimiter",
      machineInput: true,
    },
    /**
     * Whether the same tag may be added twice. Off, because a repeated tag is a typo far more often
     * than it is a fact - and, again, off means DROPPED rather than rejected: the duplicate simply
     * does not appear, and the entry clears as if it had been added.
     */
    allowDuplicates: {
      type: "boolean",
      default: false,
      attr: "data-allow-duplicates",
      trueValue: "",
      machineInput: true,
    },
    /** Whether a committed tag can be reopened (Enter, or a double click) and rewritten in place. */
    editable: {
      type: "boolean",
      default: true,
      attr: "data-editable",
      falseValue: "false",
      machineInput: true,
    },
    /** The form field name. The hidden input carries the value under it. */
    name: { type: "string", attr: "data-name", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
    /** Shows the tags and refuses to change them. Not `disabled`: a read-only field is still read. */
    readOnly: { type: "boolean", default: false, attr: "data-readonly", trueValue: "" },
    /** Reflects a failed validation the FORM decided, not one this control can see. */
    invalid: { type: "boolean", default: false, attr: "data-invalid", trueValue: "", alsoAttr: "aria-invalid" },
    required: { type: "boolean", default: false, attr: "data-required", trueValue: "" },
  },

  signatures: {
    TagsInput: {
      intent: ["tags-input", "multi-value-entry", "keywords", "recipients", "chips-input", "token-input"],
      host: { element: "div" },
      options: [
        "label",
        "placeholder",
        "removeLabel",
        "max",
        "delimiter",
        "allowDuplicates",
        "editable",
        "name",
        "disabled",
        "readOnly",
        "invalid",
        "required",
      ],
      requires: ["label"],
      forward: ["id", "aria-*"],
      mount: tagsInputAttrs.root,
      /* The chip is a Tag, not a drawing of one: sk-tag and its two parts, with tag.css behind them. */
      compose: [{ of: "tag", sheets: ["@skryensya/core/components/tag.css"], systemOwned: true }],
      slots: {
        /**
         * The tags the field starts with, one entry each. A collection and not a delimited string
         * option, because each one becomes an element: a string would have to be parsed by an
         * enhancer that may never run, and the markup would show an empty field until it did.
         */
        items: {
          accepts: "items",
          prop: "defaultValue",
          item: {
            /* No per-entry options: a tag IS its text, and the value attribute is copied from it. */
            options: {},
            slots: {
              /**
               * The tag itself. It is the value AND the label, which is what a tags input is: the
               * `data-value` the machine reads is copied from this text rather than authored twice,
               * so the two can never disagree.
               */
              label: { accepts: "text", required: true },
            },
            /* React's `defaultValue` is `string[]`: an entry reaches it as its text alone. */
            unwrap: "label",
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "control",
            mount: tagsInputAttrs.control,
            children: [
              {
                element: "span",
                part: "list",
                mount: tagsInputAttrs.list,
                children: [
              {
                repeat: "items",
                children: [
                  {
                    element: "span",
                    part: "item",
                    mount: tagsInputAttrs.item,
                    attrsFromItemSlot: { "data-value": "label" },
                    children: [
                      /* THE CHIP IS A TAG. `sk-tag` is composed, not redrawn; see the file header. */
                      {
                        element: "span",
                        part: "preview",
                        also: ["sk-tag"],
                        mount: tagsInputAttrs.preview,
                        attrs: { "data-removable": "" },
                        children: [
                          {
                            element: "span",
                            part: "text",
                            also: ["sk-tag__label"],
                            mount: tagsInputAttrs.text,
                            itemSlot: "label",
                          },
                          /*
                           * The same system-owned Button + close icon realization Tag writes, for
                           * the same reason: the state layer, the focus ring and the hit target are
                           * Button's, and `close` is the system's dismiss icon.
                           */
                          {
                            element: "button",
                            part: "remove",
                            also: ["sk-tag__remove", "sk-button", "sk-interactive"],
                            mount: tagsInputAttrs.remove,
                            options: ["removeLabel"],
                            attrs: {
                              type: "button",
                              "data-variant": "ghost",
                              "data-tone": "neutral",
                              "data-size": "sm",
                              "data-icon-only": "",
                              "data-sk-button": "",
                            },
                            children: [
                              { element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "md" } },
                            ],
                          },
                        ],
                      },
                      /*
                       * The in-place editor, hidden until the machine opens it. Authored rather than
                       * created on demand, like the hidden form input: no enhancer in this layer
                       * makes elements, it patches the ones the markup already has.
                       */
                      {
                        element: "input",
                        part: "itemInput",
                        mount: tagsInputAttrs.itemInput,
                        attrs: { type: "text", hidden: "" },
                      },
                    ],
                  },
                ],
              },
                ],
              },
              {
                element: "input",
                part: "input",
                mount: tagsInputAttrs.input,
                options: ["label", "placeholder"],
                attrs: { type: "text", autocomplete: "off" },
              },
            ],
          },
          /*
           * The form participant. The machine writes the whole value onto it in both bindings, so an
           * enhanced page submits its tags through a plain `<form>`.
           */
          {
            element: "input",
            part: "hidden",
            mount: tagsInputAttrs.hidden,
            attrs: { type: "text", hidden: "" },
          },
        ],
      },
      react: { from: "@skryensya/react/tags-input", name: "TagsInput" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated: a hand-written union here would be a second place the values live. */
export type TagsInputDelimiter = OptionValue<typeof tagsInputContract.options.delimiter>;
