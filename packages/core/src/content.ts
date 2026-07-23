import { alertParts, type AlertTone } from "./alert.js";

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
  dismiss: "ds-dismiss",
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
  toastRegion: "ds-toast-region",
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
