import { alertParts, type AlertTone } from "./alert.js";
import type { ComponentContract } from "./contract.js";

/** Same tone vocabulary as Alert, including `neutral` for a plain toast. */
export type ToastTone = AlertTone;

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
 * Toast reuses Alert anatomy. The region class is toast-specific; every item part is an alert part
 * so the floating message and the inline message stay one visual contract.
 */
export const contentParts = {
  toastRegion: "sk-toast-region",
  toast: alertParts.root,
  toastIcon: alertParts.icon,
  toastContent: alertParts.content,
  toastTitle: alertParts.title,
  toastDescription: alertParts.description,
  toastActions: alertParts.actions,
  toastDismiss: alertParts.dismiss,
} as const;

export type ContentPart = keyof typeof contentParts;
export type ContentPartClass = (typeof contentParts)[ContentPart];

/**
 * The transient half of Alert.
 *
 * Same anatomy, same part classes, same tone vocabulary — what differs is where it lives and how
 * long. A Toast is owned by a region that floats above the page and it leaves on its own, so the
 * two pieces are contracted together: a Toast outside a ToastRegion has nowhere to be.
 *
 * `timeout` is deliberately absent. How long a message stays is behaviour, and behaviour is the
 * binding's — the contract owns whether the dismiss control EXISTS, the same split Tag makes.
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
    presentation: {
      type: "enum",
      values: ["banner", "accent", "inline"],
      default: "banner",
      attr: "data-presentation",
    },
    /** Whether the toast carries a dismiss control. Structure; `onDismiss` is the binding's. */
    dismissible: { type: "boolean", default: false, attr: "data-dismissible", trueValue: "" },
    /** The dismiss control's accessible name. It is icon-only, so it has no other. */
    dismissLabel: { type: "string", default: "Dismiss notification", attr: "aria-label" },
  },

  signatures: {
    ToastRegion: {
      intent: ["toast-container", "notification-area", "where-toasts-live"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "signature", of: ["Toast"], required: true } },
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

    Toast: {
      intent: ["transient-message", "saved-confirmation", "undo-prompt", "background-task-finished"],
      host: { element: "div" },
      parents: ["ToastRegion"],
      options: ["tone", "presentation", "dismissible", "dismissLabel"],
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
        // Tone decides the announcement, not just the paint — the same rule Alert states.
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
