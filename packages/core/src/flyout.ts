import type { ComponentContract } from "./contract.js";

export type FlyoutOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type FlyoutValueChangeDetails = {
  value: string[];
};

export type FlyoutOptions = {
  id?: string;
  disabled?: boolean;
  value?: string[];
  defaultValue?: string[] | string;
  placeholder?: string;
  options?: readonly FlyoutOption[];
  onValueChange?: (details: FlyoutValueChangeDetails) => void;
};

/** Same event name as Select so shared docs listeners keep working. */
export const flyoutEvents = {
  valueChange: "sk-value-change",
  /** Fired when a flyout opens; other instances close so only one stays open. */
  open: "sk-flyout-open",
} as const;

export type FlyoutOpenDetails = {
  root: HTMLElement;
};

export const flyoutParts = {
  root: "sk-flyout",
  label: "sk-flyout__label",
  trigger: "sk-flyout__trigger",
  value: "sk-flyout__value",
  indicator: "sk-flyout__indicator",
  panel: "sk-flyout__panel",
  item: "sk-flyout__item",
  itemText: "sk-flyout__item-text",
  itemIndicator: "sk-flyout__item-indicator",
} as const;

export type FlyoutPart = keyof typeof flyoutParts;
export type FlyoutPartClass = (typeof flyoutParts)[FlyoutPart];

export const flyoutAttrs = {
  root: "data-sk-flyout",
  label: "data-sk-flyout-label",
  trigger: "data-sk-flyout-trigger",
  value: "data-sk-flyout-value",
  indicator: "data-sk-flyout-indicator",
  panel: "data-sk-flyout-panel",
  item: "data-sk-flyout-item",
  itemText: "data-sk-flyout-item-text",
  itemIndicator: "data-sk-flyout-item-indicator",
} as const;

export type FlyoutAttr = keyof typeof flyoutAttrs;
export type FlyoutAttrName = (typeof flyoutAttrs)[FlyoutAttr];

export type FlyoutFixedCoords = {
  top: number;
  left: number;
  /** Side of the trigger after fitting into the viewport. */
  side: "inline-end" | "inline-start";
};

type RectLike = Pick<DOMRect, "top" | "right" | "bottom" | "left" | "width" | "height">;

/**
 * Fixed coords for the flyout panel: prefer inline-end of the trigger, flip to inline-start when
 * needed, then clamp so the panel stays inside the viewport with a small padding.
 */
export function computeFlyoutFixedCoords(input: {
  trigger: RectLike;
  panelWidth: number;
  panelHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  gap?: number;
  padding?: number;
  rtl?: boolean;
}): FlyoutFixedCoords {
  const gap = input.gap ?? 4;
  const pad = input.padding ?? 8;
  const { trigger, panelWidth, panelHeight, viewportWidth, viewportHeight, rtl = false } = input;

  const spaceEnd = rtl ? trigger.left - pad : viewportWidth - trigger.right - pad;
  const spaceStart = rtl ? viewportWidth - trigger.right - pad : trigger.left - pad;

  const endFits = spaceEnd >= panelWidth + gap;
  const startFits = spaceStart >= panelWidth + gap;
  const side: FlyoutFixedCoords["side"] = endFits
    ? "inline-end"
    : startFits
      ? "inline-start"
      : spaceEnd >= spaceStart
        ? "inline-end"
        : "inline-start";

  let left: number;
  if (!rtl) {
    left = side === "inline-end" ? trigger.right + gap : trigger.left - gap - panelWidth;
  } else {
    left = side === "inline-end" ? trigger.left - gap - panelWidth : trigger.right + gap;
  }

  const maxLeft = Math.max(pad, viewportWidth - pad - panelWidth);
  left = Math.min(Math.max(left, pad), maxLeft);

  let top = trigger.top;
  const maxTop = Math.max(pad, viewportHeight - pad - panelHeight);
  top = Math.min(Math.max(top, pad), maxTop);

  return { top: Math.round(top), left: Math.round(left), side };
}

/**
 * A value picker whose panel opens BESIDE the trigger and stays in the DOM.
 *
 * The one floating family that is not anchored: the panel is a child of the root, and placement is
 * fixed coordinates computed from the trigger's rect (flipping and clamping so it stays inside the
 * viewport, clipping ancestors included). Nothing is portalled, nothing is CSS-anchored, and both
 * bindings therefore land on the same subtree — which is why this one is published while tooltip,
 * popover and menu are not.
 *
 * Closed, the panel is `hidden`. Not removed: it is what `aria-controls` points at, and a reference
 * to an element that does not exist yet is a reference to nothing.
 */
export const flyoutContract = {
  id: "flyout",
  css: "@skryensya/core/components/flyout.css",
  parts: flyoutParts,

  options: {
    /** What the trigger shows before anything is chosen. */
    placeholder: { type: "string", default: "Select option", attr: "data-placeholder", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    /** The value chosen to begin with. Read once; after that the interaction owns it. */
    defaultValue: { type: "string", attr: "data-value", machineInput: true },
  },

  signatures: {
    Flyout: {
      intent: ["value-picker", "dropdown", "choose-from-a-list", "filter-picker"],
      host: { element: "div" },
      options: ["placeholder", "disabled", "defaultValue"],
      slots: {
        label: { accepts: "text" },
        indicator: { accepts: "node" },
        openIndicator: { accepts: "node" },
        itemIndicator: { accepts: "node" },
        items: {
          accepts: "items",
          prop: "options",
          required: true,
          item: {
            options: {
              value: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
            },
            slots: { label: { accepts: "text", required: true } },
            key: "value",
          },
        },
      },
      mount: "data-sk-flyout",
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "label", part: "label", mount: "data-sk-flyout-label", whenGiven: "label", slot: "label" },
          {
            element: "button",
            part: "trigger",
            also: ["sk-interactive"],
            mount: "data-sk-flyout-trigger",
            attrs: { type: "button", "aria-haspopup": "listbox" },
            children: [
              { element: "span", part: "value", mount: "data-sk-flyout-value", textFromOption: "placeholder" },
              {
                element: "span",
                part: "indicator",
                mount: "data-sk-flyout-indicator",
                attrs: { "aria-hidden": "true" },
                children: [
                  { element: "span", attrs: { "data-state": "closed" }, slot: "indicator" },
                  { element: "span", attrs: { "data-state": "open" }, slot: "openIndicator" },
                ],
              },
            ],
          },
          {
            element: "ul",
            part: "panel",
            mount: "data-sk-flyout-panel",
            // Hidden, not absent: `aria-controls` points at it, and closed is a state, not a removal.
            attrs: { role: "listbox", hidden: "" },
            children: [
              {
                element: "li",
                part: "item",
                also: ["sk-interactive"],
                mount: "data-sk-flyout-item",
                attrs: { role: "option" },
                repeat: "items",
                itemOptions: ["value", "disabled"],
                children: [
                  { element: "span", part: "itemText", mount: "data-sk-flyout-item-text", itemSlot: "label" },
                  {
                    element: "span",
                    part: "itemIndicator",
                    mount: "data-sk-flyout-item-indicator",
                    attrs: { "aria-hidden": "true" },
                    slot: "itemIndicator",
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/flyout", name: "Flyout" },
    },
  },
} as const satisfies ComponentContract;
