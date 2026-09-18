import type { ComponentContract } from "./contract.js";
/*
 * VAUL, the contract.
 *
 * A modal panel anchored to an edge. The classes and parts are ours and permanent; the modality is
 * the platform's (a native <dialog>, decision 11), and drag-to-dismiss is Vaul's own enhancer
 * because neither the platform nor Zag has it.
 */

/** Which edge the Vaul arrives from. Logical, so the inline edges follow writing direction. */
export type VaulEdge = "inline-start" | "inline-end" | "block-end";

export type VaulOpenChangeDetails = {
  open: boolean;
};

export type VaulOptions = {
  /**
   * Where the panel is anchored. Must match the `data-edge` the markup already carries, the
   * enhancer reads it rather than writing it, because the edge is a layout decision the CSS makes.
   */
  edge?: VaulEdge;
  /**
   * Fraction of the panel's own size that must be dragged away before releasing dismisses it.
   * Below the threshold the panel springs back.
   */
  dismissThreshold?: number;
  /**
   * Speed (px/ms) past which a release dismisses regardless of distance, a flick is an intent, and
   * waiting for it to cross a distance threshold is what makes a sheet feel stuck.
   */
  dismissVelocity?: number;
  /** Set false to keep the panel but not the dragging. */
  draggable?: boolean;
  onOpenChange?: (details: VaulOpenChangeDetails) => void;
};

export const vaulParts = {
  root: "sk-vaul",
  handle: "sk-vaul__handle",
} as const;

export type VaulPart = keyof typeof vaulParts;
export type VaulPartClass = (typeof vaulParts)[VaulPart];

export const vaulScope = "vaul";

export const vaulDataParts = {
  root: "root",
  handle: "handle",
} as const;

export const vaulEvents = {
  openChange: "sk:vaulopenchange",
} as const;

export const vaulAttrs = {
  /**
   * Authored on any control inside the drawer: clicking it closes the Vaul. Both the trigger the
   * contract bakes and a Button an author drops in the body carry the same attribute, because the
   * enhancer looks for THIS and not for a part class - a close control is a role, not a place.
   */
  close: "data-sk-vaul-close",
} as const;

/*
 * VAUL is published; it took a while because this file's stylesheet lives in `css/patterns/`,
 * which `NOT-PUBLISHED.md` used as the rule for what is a pattern and therefore takes no contract.
 *
 * That was reasoning from WHERE THE CODE SITS, the same mistake `toc` corrected. A pattern has no
 * anatomy of its own; `anchored` is classes and custom properties that six components compose, and
 * none of them "contains an anchored". A Vaul has two parts, four options, an event and a 291-line
 * enhancer, and the drawer page opens by saying "un drawer ES un Vaul". That is a component whose
 * sheet is filed in the wrong folder, not a pattern.
 *
 * What it is NOT is a second Dialog. Both are native `<dialog>`s and the modality is the platform's
 * in both; what Vaul adds is an EDGE and a gesture to dismiss along it. That is why the edge is an
 * option rather than a variant class: it decides layout, and the enhancer reads it to know which
 * axis a drag travels.
 */
export const vaulContract = {
  id: "vaul",
  category: "overlays",
  css: "@skryensya/core/patterns/vaul.css",
  parts: vaulParts,
  events: vaulEvents,
  eventDetails: {
    openChange: { detail: { open: "boolean" }, reactProp: "onOpenChange", source: "root" },
  },
  /* Written by both drag shells on every pointer move; read them, never set them. */
  outputHooks: ["--sk-vaul-drag-offset", "--sk-vaul-drag-progress"],
  /* Authored on any control inside the drawer - usually a Button - to make it a close trigger. */
  authoredAttrs: [vaulAttrs.close],
  hooks: [
    "--sk-drawer-bg",
    "--sk-drawer-border-color",
    "--sk-drawer-border-width",
    "--sk-drawer-elevation",
    "--sk-drawer-fg",
    "--sk-drawer-inline-size",
    "--sk-drawer-wash",
    "--sk-vaul-backdrop-bg",
    "--sk-vaul-bg",
    "--sk-vaul-border-color",
    "--sk-vaul-border-width",
    "--sk-vaul-drag-offset",
    "--sk-vaul-drag-progress",
    "--sk-vaul-elevation",
    "--sk-vaul-enter-duration",
    "--sk-vaul-enter-easing",
    "--sk-vaul-exit-duration",
    "--sk-vaul-exit-easing",
    "--sk-vaul-fg",
    "--sk-vaul-material",
    "--sk-vaul-overpull",
    "--sk-vaul-radius",
    "--sk-vaul-release-duration",
    "--sk-vaul-release-easing",
    "--sk-vaul-size",
    "--sk-vaul-wash",
  ],

  options: {
    /** Where the panel is anchored. Logical, so the inline edges follow writing direction. */
    edge: {
      type: "enum",
      values: ["inline-start", "inline-end", "block-end"],
      default: "block-end",
      attr: "data-edge",
    },
    /** Rendered already open, non-modally. The platform's attribute, as on `Dialog`. */
    open: { type: "boolean", default: false, attr: "open", trueValue: "" },
    /*
     * Required, same reasoning as `Dialog`'s own required `title` slot: `showModal()` gives the
     * root an implicit `role="dialog"` whether or not the composition thinks about it, and WAI's
     * Dialog (Modal) pattern requires that role to carry a name. Vaul has no header of its own to
     * source a `labelledBySlot` from (deliberately: "its own semantics are the composition's
     * business"), so the name is a plain option instead of a slot, the same shape `Feed`'s own
     * required `label` already uses for a root with no title node either.
     */
    label: { type: "string", attr: "aria-label" },
    /**
     * The panel's id, which a `Vaul.Trigger` names in `opens`. Optional: a panel opened only from
     * script needs none. Authored rather than generated because the trigger is a separate node.
     */
    panelId: { type: "string", attr: "id", prop: "id" },
    /**
     * The `panelId` of the Vaul this trigger opens. Written twice: `data-sk-vaul-open` is what the
     * enhancer listens on, `aria-controls` is what assistive tech follows.
     */
    opens: {
      type: "string",
      attr: "data-sk-vaul-open",
      alsoAttr: "aria-controls",
      refersTo: { contract: "vaul", option: "panelId" },
    },
    /*
     * The trigger and close buttons wear Button's look without being Buttons, the same untyped
     * trio Popover and Menu publish for their own triggers: Vaul does not own that vocabulary.
     */
    buttonVariant: { type: "string", attr: "data-variant", prop: "variant", valuesFrom: { contract: "button", option: "variant" } },
    buttonTone: { type: "string", attr: "data-tone", prop: "tone", valuesFrom: { contract: "button", option: "tone" } },
    buttonSize: { type: "string", attr: "data-size", prop: "size", valuesFrom: { contract: "button", option: "size" } },
    buttonIconOnly: { type: "boolean", default: false, attr: "data-icon-only", trueValue: "", prop: "iconOnly" },
    /** The accessible name of an icon-only trigger or close button. */
    buttonLabel: { type: "string", attr: "aria-label", prop: "aria-label" },
    /*
     * Whether the handle takes the drag. Written only as `data-draggable="false"`: the enhancer
     * treats anything else as on, so true is saying nothing. React passes it as a prop to its own
     * drag shell, which is why it is a machine input rather than markup both sides must mirror.
     */
    draggable: { type: "boolean", default: true, attr: "data-draggable", falseValue: "false", machineInput: true },
    /** Fraction (0–1) of the panel's size a release must have travelled to dismiss it. */
    dismissThreshold: { type: "number", default: 0.4, min: 0, max: 1, attr: "data-dismiss-threshold", machineInput: true },
  },

  a11y: [
    {
      /* A heading inside the panel can name it instead, the way the docs' own drawer does. */
      when: {},
      requiresOneOf: ["label", "aria-labelledby"],
      because: "showModal() gives the panel role=\"dialog\", and a dialog needs a name.",
      signatures: ["Vaul", "Vaul.drawer"],
    },
    {
      when: { buttonIconOnly: true },
      requiresOneOf: ["buttonLabel"],
      because: "An icon-only trigger or close button has no visible text, so nothing else names it.",
      signatures: ["Vaul.Trigger", "Vaul.Close"],
    },
  ],

  signatures: {
    Vaul: {
      intent: ["edge-anchored-panel", "bottom-sheet", "drag-to-dismiss", "mobile-navigation"],
      host: { element: "dialog" },
      mount: "data-sk-vaul",
      options: ["panelId", "edge", "open", "label", "draggable", "dismissThreshold"],
      /** Extra a11y; panel id is the panelId option (not forwarded). */
      forward: ["aria-*"],
      slots: {
        /** Whatever the panel holds. Its own semantics are the composition's business. */
        children: { accepts: "node", required: true },
      },
      template: {
        element: "dialog",
        part: "root",
        host: true,
        children: [
          /*
           * Always drawn, always `aria-hidden`. It is the affordance for a gesture that only exists
           * where the enhancer runs, and announcing a grip that may do nothing is worse than
           * silence; the panel closes with Escape and with its own control either way.
           */
          {
            element: "div",
            part: "handle",
            attrs: { "aria-hidden": "true", "data-part": "handle" },
          },
          { slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/vaul", name: "Vaul" },
    },

    /*
     * THE DRAWER: a Vaul that fills its edge instead of sitting against it.
     *
     * `drawer.css` is forty-five lines and ONE class. That is the whole difference, so this is a
     * signature of this family rather than a component of its own: a separate contract would
     * duplicate both parts, both options and the enhancer's mount point to say `sk-drawer`.
     * The docs page has always known; it opens with "un drawer ES un Vaul".
     */
    "Vaul.drawer": {
      intent: ["navigation-drawer", "side-panel", "mobile-navigation"],
      host: { element: "dialog" },
      mount: "data-sk-vaul",
      options: ["panelId", "edge", "open", "label", "draggable", "dismissThreshold"],
      /** Extra a11y; panel id is the panelId option (not forwarded). */
      forward: ["aria-*"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "dialog",
        part: "root",
        also: ["sk-drawer"],
        host: true,
        children: [
          {
            element: "div",
            part: "handle",
            attrs: { "aria-hidden": "true", "data-part": "handle" },
          },
          { slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/vaul", name: "Drawer" },
    },

    /*
     * WHAT OPENS IT. A separate signature, not a slot, because the button lives wherever the page
     * puts it (a navbar, a toolbar) and the `<dialog>` lives at the end of the body. `opens` pairs
     * them by the panel's id, checked by `refersTo`. The expanded state is the enhancer's (Vanilla)
     * or the component's (React) to keep in step with the dialog; at rest it is closed.
     */
    "Vaul.Trigger": {
      intent: ["open-a-sheet", "open-a-drawer", "mobile-menu-button"],
      host: { element: "button" },
      options: ["opens", "buttonVariant", "buttonTone", "buttonSize", "buttonIconOnly", "buttonLabel"],
      requires: ["opens"],
      /** Form association and extra a11y; Button look stays the button* options. */
      forward: ["id", "name", "form", "aria-*"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "button",
        also: ["sk-button", "sk-interactive"],
        host: true,
        attrs: { type: "button", "aria-haspopup": "dialog", "aria-expanded": "false" },
        slot: "children",
      },
      react: { from: "@skryensya/react/vaul", name: "Vaul.Trigger" },
    },

    /** WHAT CLOSES IT from inside: any button in the panel carrying the closer attribute. */
    "Vaul.Close": {
      intent: ["close-a-sheet", "dismiss-a-drawer"],
      host: { element: "button" },
      options: ["buttonVariant", "buttonTone", "buttonSize", "buttonIconOnly", "buttonLabel"],
      /** Form association and extra a11y; Button look stays the button* options. */
      forward: ["id", "name", "form", "aria-*"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "button",
        also: ["sk-button", "sk-interactive"],
        host: true,
        attrs: { type: "button", [vaulAttrs.close]: "" },
        slot: "children",
      },
      react: { from: "@skryensya/react/vaul", name: "Vaul.Close" },
    },
  },
} as const satisfies ComponentContract;
