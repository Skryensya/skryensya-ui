import type { ComponentContract } from "./contract.js";

/*
 * WINDOW, the contract.
 *
 * A NON-MODAL panel the person can move, resize, minimize and maximize, the way a desktop window
 * behaves: a tool palette, an inspector, a chat that has to stay open beside the work. It is the
 * one overlay here that does NOT block the page. A dialog asks for an answer before anything else
 * happens; a window sits beside what you are doing and waits.
 *
 * The behaviour is `@zag-js/floating-panel`'s machine, the SAME one in both bindings (ADR-0010).
 * Zag calls it a "floating panel"; this system calls it a Window, because "floating" is a word
 * CONTEXT.md keeps away from placement (see Anchored) and what the component draws, a title bar
 * with minimize, maximize and close, is what everyone already calls a window.
 *
 * WHAT THE MACHINE OWNS, and therefore what no stylesheet or binding restates:
 *
 *   - Position and size. It writes `--x`, `--y`, `--width` and `--height` on the positioner, and
 *     the stylesheet only reads them. They are Zag's names, not `--sk-*` hooks: overriding one does
 *     nothing, the next pointer move writes over it.
 *   - The stack. Every open window is in one module-level stack; focusing one brings it to the
 *     front (`--z-index`) and marks the others `data-behind`. One machine, one stack, whichever
 *     binding opened the window.
 *   - The keyboard. With the content focused, the arrow keys move the window (Shift for a larger
 *     step) and Escape closes it when `closeOnEscape` is on. Escape during a drag or a resize
 *     cancels THAT gesture and puts the window back, rather than closing it.
 *
 * WHAT IT DOES NOT OWN, and why the bindings step in:
 *
 *   - The close control's name. Zag hardcodes `aria-label="Close Window"` in English; both bindings
 *     write `closeLabel` over it, so a Spanish page does not announce an English button.
 *   - The stage controls when the window is not resizable. Zag ignores their click but still shows
 *     them; a control that does nothing is worse than no control, so both bindings hide them.
 *
 * ACCESSIBILITY. The content is `role="dialog"` WITHOUT `aria-modal`, named by its title
 * (`aria-labelledby`, wired by the machine): a screen reader announces a named dialog and does not
 * pretend the rest of the page went inert, because it did not. Focus moves into the window when it
 * opens and back to the trigger when it closes.
 *
 * NO JAVASCRIPT, NO WINDOW. Unlike a native dialog there is no platform element to fall back to:
 * the content stays hidden until the machine opens it. Put nothing in a window that exists nowhere
 * else, the same rule a tooltip lives by.
 */

export type WindowStage = "minimized" | "maximized" | "default";

export const windowStages = ["minimized", "maximized", "default"] as const satisfies readonly WindowStage[];

/** The eight edges and corners a window can be resized from, in Zag's compass vocabulary. */
export type WindowResizeAxis = "n" | "e" | "s" | "w" | "ne" | "se" | "sw" | "nw";

export const windowResizeAxes = [
  "n",
  "e",
  "s",
  "w",
  "ne",
  "se",
  "sw",
  "nw",
] as const satisfies readonly WindowResizeAxis[];

/** The size a window opens at when nobody says otherwise. Zag's own fallback, named here. */
export const windowDefaultSize = { width: 320, height: 240 } as const;

/**
 * The positioner's props without Zag's inline `z-index`.
 *
 * Zag writes `z-index: var(--z-index)`, where `--z-index` is the window's place in the stack: 1, 2,
 * 3. Inline, that beats any stylesheet, and those raw numbers put every window UNDER a sticky
 * navbar. The stack order is worth keeping, the layer is not the machine's to choose: so the
 * declaration goes and `--z-index` stays, and `window.css` adds it to the system's own layer.
 * Shared by both bindings so they cannot strip different things. Handles the object React receives
 * and the string the Svelte adapter serializes it to.
 */
export function withoutStackZIndex<T extends object>(props: T): T {
  const { style } = props as T & { style?: unknown };
  if (typeof style === "string") {
    const kept = style
      .split(";")
      .filter((declaration) => declaration.split(":")[0]?.trim() !== "z-index")
      .join(";");
    return { ...props, style: kept };
  }
  if (style && typeof style === "object") {
    const { zIndex: _zIndex, "z-index": _zIndexKebab, ...rest } = style as Record<string, unknown>;
    return { ...props, style: rest };
  }
  return props;
}

export type WindowOpenChangeDetails = { open: boolean };
export type WindowStageChangeDetails = { stage: WindowStage };

export const windowParts = {
  root: "sk-window",
  trigger: "sk-window__trigger",
  positioner: "sk-window__positioner",
  content: "sk-window__content",
  /** The strip the pointer grabs to move the window. It wraps the header. */
  drag: "sk-window__drag",
  header: "sk-window__header",
  title: "sk-window__title",
  /** The minimize / maximize / restore / close cluster. Zag's `control` part. */
  controls: "sk-window__controls",
  stage: "sk-window__stage",
  close: "sk-window__close",
  body: "sk-window__body",
  resize: "sk-window__resize",
} as const;

export type WindowPart = keyof typeof windowParts;
export type WindowPartClass = (typeof windowParts)[WindowPart];

/**
 * The hooks the vanilla layer scans for on authored markup. The stage and axis are NOT hooks of
 * their own: the enhancer reads them from `data-stage` / `data-axis`, the same attributes the
 * machine writes back, so authored markup and React end with one attribute each rather than two.
 */
export const windowAttrs = {
  root: "data-sk-window",
  trigger: "data-sk-window-trigger",
  positioner: "data-sk-window-positioner",
  content: "data-sk-window-content",
  drag: "data-sk-window-drag",
  header: "data-sk-window-header",
  title: "data-sk-window-title",
  controls: "data-sk-window-controls",
  stage: "data-sk-window-stage",
  close: "data-sk-window-close",
  body: "data-sk-window-body",
  resize: "data-sk-window-resize",
} as const;

export type WindowAttr = keyof typeof windowAttrs;
export type WindowAttrName = (typeof windowAttrs)[WindowAttr];

/** The DOM events a Window dispatches on its root. */
export const windowEvents = {
  openChange: "sk:windowopenchange",
  stageChange: "sk:windowstagechange",
} as const;

/** The icon role each stage control draws. The roles exist for this component (see `icon.ts`). */
export const windowStageIcons = {
  minimized: "minimize",
  maximized: "maximize",
  default: "restore",
} as const satisfies Record<WindowStage, string>;

/**
 * The template's stage control for one stage: the enhancer reads `data-stage` to know which one it
 * is, and the label option it carries becomes its `aria-label`.
 */
const stageControl = (stage: WindowStage, labelOption: string) =>
  ({
    element: "button",
    part: "stage",
    also: ["sk-button", "sk-interactive"],
    mount: windowAttrs.stage,
    options: [labelOption],
    attrs: {
      type: "button",
      "data-stage": stage,
      "data-icon-only": "",
      "data-size": "sm",
      "data-variant": "ghost",
    },
    children: [
      { element: "span", attrs: { "data-sk-icon": windowStageIcons[stage], "data-sk-icon-size": "sm" } },
    ],
  }) as const;

const resizeHandle = (axis: WindowResizeAxis) =>
  ({
    element: "div",
    part: "resize",
    mount: windowAttrs.resize,
    attrs: { "data-axis": axis },
  }) as const;

export const windowContract = {
  id: "window",
  category: "overlays",
  css: "@skryensya/core/components/window.css",
  parts: windowParts,
  hooks: [
    "--sk-window-bg",
    "--sk-window-border-color",
    "--sk-window-fg",
    "--sk-window-handle-size",
    "--sk-window-header-bg",
    "--sk-window-header-border-color",
    "--sk-window-padding",
    "--sk-window-radius",
    "--sk-window-shadow",
    "--sk-window-shadow-behind",
    "--sk-window-wash",
  ],
  events: windowEvents,
  eventDetails: {
    openChange: { detail: { open: "boolean" }, reactProp: "onOpenChange", source: "root", trigger: "trigger" },
    stageChange: { detail: { stage: "WindowStage" }, reactProp: "onStageChange", source: "root", trigger: "stage" },
  },

  options: {
    /** Starts open. Read once as the initial state; after that the machine owns it. */
    defaultOpen: {
      type: "boolean",
      default: false,
      attr: "data-default-open",
      trueValue: "",
      machineInput: true,
    },
    /** The title bar moves the window. On by default; `false` pins it where it opened. */
    draggable: {
      type: "boolean",
      default: true,
      attr: "data-draggable",
      falseValue: "false",
      machineInput: true,
    },
    /**
     * The edges resize the window, and the stage controls minimize and maximize it. On by
     * default. Off hides both, because the machine refuses every stage change on a window it cannot
     * resize.
     */
    resizable: {
      type: "boolean",
      default: true,
      attr: "data-resizable",
      falseValue: "false",
      machineInput: true,
    },
    /** Escape, with focus inside, closes the window. On by default. */
    closeOnEscape: {
      type: "boolean",
      default: true,
      attr: "data-close-on-escape",
      falseValue: "false",
      machineInput: true,
    },
    /** Reopening puts the window back where it was left, at the size it was left. Off: it re-centres. */
    persistRect: {
      type: "boolean",
      default: false,
      attr: "data-persist-rect",
      trueValue: "",
      machineInput: true,
    },
    /** Opening width in CSS pixels. */
    defaultWidth: { type: "number", min: 1, attr: "data-default-width", machineInput: true },
    /** Opening height in CSS pixels. */
    defaultHeight: { type: "number", min: 1, attr: "data-default-height", machineInput: true },
    /** The narrowest a resize can make it, in CSS pixels. */
    minWidth: { type: "number", min: 1, attr: "data-min-width", machineInput: true },
    /** The shortest a resize can make it, in CSS pixels. */
    minHeight: { type: "number", min: 1, attr: "data-min-height", machineInput: true },
    /** Accessible name of the icon-only close control. Replaces Zag's hardcoded English one. */
    closeLabel: { type: "string", default: "Close", attr: "aria-label" },
    /** Accessible names of the three icon-only stage controls. */
    minimizeLabel: { type: "string", default: "Minimize", attr: "aria-label" },
    maximizeLabel: { type: "string", default: "Maximize", attr: "aria-label" },
    restoreLabel: { type: "string", default: "Restore", attr: "aria-label" },
    /** Accessible name for an icon-only trigger. Pair with `triggerIconOnly`. */
    triggerLabel: { type: "string", attr: "aria-label" },
    /** Forwarded to the trigger's Button chrome, the same three Popover and Menu publish. */
    triggerVariant: { type: "string", attr: "data-variant", valuesFrom: { contract: "button", option: "variant" } },
    triggerTone: { type: "string", attr: "data-tone", valuesFrom: { contract: "button", option: "tone" } },
    triggerSize: { type: "string", attr: "data-size", valuesFrom: { contract: "button", option: "size" } },
    triggerIconOnly: { type: "boolean", default: false, attr: "data-icon-only", trueValue: "" },
  },

  signatures: {
    Window: {
      intent: ["floating-window", "movable-panel", "resizable-panel", "non-modal-tool-panel", "floating-panel"],
      host: { element: "div" },
      options: [
        "defaultOpen",
        "draggable",
        "resizable",
        "closeOnEscape",
        "persistRect",
        "defaultWidth",
        "defaultHeight",
        "minWidth",
        "minHeight",
        "closeLabel",
        "minimizeLabel",
        "maximizeLabel",
        "restoreLabel",
        "triggerLabel",
        "triggerVariant",
        "triggerTone",
        "triggerSize",
        "triggerIconOnly",
      ],
      mount: windowAttrs.root,
      forward: ["id", "aria-*"],
      /*
       * React portals the positioner to `document.body` so a transformed or clipping ancestor
       * cannot trap a `position: fixed` window; authored markup leaves it where it was written, and
       * `fixed` already takes it out of the flow. Same split, and same `container` escape hatch,
       * as Tooltip.
       */
      portals: { container: true },
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: {
        /** What opens it. Carries its own accessible name (or use `triggerLabel` when icon-only). */
        trigger: { accepts: "node", required: true },
        /** The window's name: shown in the title bar and announced as the dialog's label. */
        title: { accepts: "text", required: true },
        /** What the window holds. It scrolls when the window is smaller than it. */
        children: { accepts: "node", required: true },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "button",
            part: "trigger",
            also: ["sk-button", "sk-interactive"],
            mount: windowAttrs.trigger,
            attrs: { type: "button" },
            options: ["triggerLabel", "triggerVariant", "triggerTone", "triggerSize", "triggerIconOnly"],
            slot: "trigger",
          },
          {
            element: "div",
            part: "positioner",
            mount: windowAttrs.positioner,
            children: [
              {
                element: "div",
                part: "content",
                mount: windowAttrs.content,
                children: [
                  {
                    element: "div",
                    part: "drag",
                    mount: windowAttrs.drag,
                    children: [
                      {
                        element: "div",
                        part: "header",
                        mount: windowAttrs.header,
                        children: [
                          { element: "h2", part: "title", mount: windowAttrs.title, slot: "title" },
                          {
                            element: "div",
                            part: "controls",
                            mount: windowAttrs.controls,
                            children: [
                              stageControl("minimized", "minimizeLabel"),
                              stageControl("maximized", "maximizeLabel"),
                              stageControl("default", "restoreLabel"),
                              {
                                element: "button",
                                part: "close",
                                also: ["sk-button", "sk-interactive"],
                                mount: windowAttrs.close,
                                options: ["closeLabel"],
                                attrs: {
                                  type: "button",
                                  "data-icon-only": "",
                                  "data-size": "sm",
                                  "data-variant": "ghost",
                                },
                                children: [
                                  { element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "sm" } },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  { element: "div", part: "body", mount: windowAttrs.body, slot: "children" },
                  ...windowResizeAxes.map(resizeHandle),
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/window", name: "Window" },
    },
  },

  a11y: [
    {
      when: { triggerIconOnly: true },
      requiresOneOf: ["triggerLabel"],
      because:
        "An icon-only trigger shows no text, so the trigger button owns the accessible name; the glyph is decorative.",
    },
  ],
} as const satisfies ComponentContract;
