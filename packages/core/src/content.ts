import { calloutParts, type CalloutTone } from "./callout.js";
import type { ComponentContract } from "./contract.js";

/** Same tone vocabulary as Callout, including `neutral` for a plain toast. */
export type ToastTone = CalloutTone;

export type ToastLiveRegion = "polite" | "assertive";
export type ToastDismissReason = "dismiss" | "timeout";

export type ToastDismissDetails = {
  reason: ToastDismissReason;
};

export type ToastOptions = {
  /** Milliseconds before requesting dismissal. Omit to keep the toast visible. */
  timeout?: number;
  onDismiss?: (details: ToastDismissDetails) => void;
};

export const toastLiveRegions = {
  polite: { ariaLive: "polite", role: "status" },
  assertive: { ariaLive: "assertive", role: "alert" },
} as const;

export const toastEvents = {
  dismiss: "sk-dismiss",
} as const;

export function getToastLiveRegion(tone: ToastTone): ToastLiveRegion {
  return tone === "danger" ? "assertive" : "polite";
}

export function hasToastTimeout(timeout: number | undefined): timeout is number {
  return typeof timeout === "number" && Number.isFinite(timeout) && timeout > 0;
}

/**
 * Toast reuses Callout anatomy for everything BUT the dismiss control: the region class is
 * toast-specific, and icon/content/title/description/actions are callout parts so the floating
 * message and the inline message stay one visual panel. Dismiss is not shared; Callout has no such
 * part, closing itself is behaviour a purely informational message does not have; Toast owns
 * that one class outright instead of borrowing a part that does not exist on the thing it borrows
 * everything else from.
 */
export const contentParts = {
  toastRegion: "sk-toast-region",
  toast: calloutParts.root,
  toastIcon: calloutParts.icon,
  toastContent: calloutParts.content,
  toastTitle: calloutParts.title,
  toastDescription: calloutParts.description,
  toastActions: calloutParts.actions,
  toastDismiss: "sk-toast__dismiss",
} as const;

export type ContentPart = keyof typeof contentParts;
export type ContentPartClass = (typeof contentParts)[ContentPart];

/**
 * The transient half of Callout; the half that IS interactive, which is the whole reason the
 * two are separate contracts rather than one with a `presentation`. A Toast is owned by a region
 * that floats above the page and leaves on its own, so a dismiss control and a timeout make sense
 * here in a way they never do on a message that just sits in the document explaining something.
 *
 * Same panel anatomy, same part classes for icon/content/title/description/actions, same tone
 * vocabulary: what differs is where it lives, how long, and that it alone owns a dismiss.
 *
 * `timeout` is deliberately absent from the contract as a rendered attribute. How long a message
 * stays is behaviour, and behaviour is the binding's: the contract owns whether the dismiss control
 * EXISTS, the same split Tag makes.
 */
export const contentContract = {
  id: "content",
  css: "@skryensya/core/components/toast.css",
  parts: contentParts,

  options: {
    tone: {
      type: "enum",
      values: ["neutral", "info", "success", "warning", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
    /** Whether the toast carries a dismiss control. Structure; `onDismiss` is the binding's. */
    dismissible: { type: "boolean", default: false, attr: "data-dismissible", trueValue: "" },
    /** The dismiss control's accessible name. It is icon-only, so it has no other. */
    dismissLabel: { type: "string", default: "Dismiss notification", attr: "aria-label" },
    /** Milliseconds before the enhancer requests dismissal. Omit to keep the toast visible. */
    timeout: { type: "number", attr: "data-timeout", machineInput: true },
  },

  signatures: {
    ToastRegion: {
      intent: ["toast-container", "notification-area", "where-toasts-live"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "signature", of: ["Toast"] } },
      /*
       * `aria-live` on the REGION, not only on each toast: a toast that is inserted into a live
       * region is announced because the region was already being watched. Announcing an element
       * that appears from nowhere is exactly what screen readers are free to miss.
       */
      template: {
        element: "div",
        part: "toastRegion",
        host: true,
        attrs: { "aria-live": "polite" },
        slot: "children",
      },
      react: { from: "@skryensya/react/content", name: "ToastRegion" },
    },

    ToastTemplate: {
      intent: ["toast-blueprint", "dynamic-toast-template"],
      host: { element: "template" },
      options: [],
      slots: { children: { accepts: "signature", of: ["Toast"], required: true } },
      template: { element: "template", host: true, slot: "children" },
      react: { from: "@skryensya/react/content", name: "ToastTemplate" },
    },

    Toast: {
      intent: ["transient-message", "saved-confirmation", "undo-prompt", "background-task-finished"],
      host: { element: "div" },
      parents: ["ToastRegion", "ToastTemplate"],
      options: ["tone", "dismissible", "dismissLabel", "timeout"],
      mount: "data-sk-toast",
      slots: {
        icon: { accepts: "signature", of: ["Icon"] },
        title: { accepts: "text" },
        children: { accepts: "node", required: true },
        actions: { accepts: "signature", of: ["Button.action", "Button.navigation"] },
      },
      template: {
        element: "div",
        part: "toast",
        host: true,
        // Tone decides the announcement, not just the paint: the same rule Callout states.
        attrsWhen: [
          { option: "tone", equals: "danger", attrs: { role: "alert", "aria-live": "assertive" } },
          { option: "tone", notEquals: "danger", attrs: { role: "status", "aria-live": "polite" } },
        ],
        children: [
          { element: "span", part: "toastIcon", whenGiven: "icon", attrs: { "aria-hidden": "true" }, slot: "icon" },
          {
            element: "div",
            part: "toastContent",
            children: [
              { element: "p", part: "toastTitle", whenGiven: "title", slot: "title" },
              { element: "div", part: "toastDescription", slot: "children" },
            ],
          },
          {
            element: "div",
            part: "toastActions",
            // Either reason is enough for the row to exist; React draws it for both too.
            whenGiven: ["actions", "dismissible"],
            children: [
              { slot: "actions" },
              {
                element: "button",
                part: "toastDismiss",
                also: ["sk-button", "sk-interactive"],
                whenGiven: "dismissible",
                options: ["dismissLabel"],
                mount: "data-sk-button",
                attrs: { type: "button", "data-variant": "ghost", "data-size": "sm", "data-icon-only": "" },
                children: [{ element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "md" } }],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/content", name: "Toast" },
    },
  },
} as const satisfies ComponentContract;
