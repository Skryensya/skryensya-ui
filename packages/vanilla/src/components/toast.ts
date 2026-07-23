import {
  contentParts,
  getToastLiveRegion,
  hasToastTimeout,
  toastEvents,
  toastLiveRegions,
  type ToastDismissDetails,
  type ToastOptions,
  type ToastTone,
} from "@skryensya/core/content";
import { applyAttrs, bindEvents } from "../runtime/apply.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-ds-toast]";
const dismissSelector = `.${contentParts.toastDismiss}`;

type Cleanup = () => void;

export function connectToast(root: HTMLElement, options: ToastOptions = {}): Cleanup {
  if (!root.classList.contains(contentParts.toast)) {
    throw new Error(`Toast enhancer expects .${contentParts.toast} on the root element.`);
  }

  const dismiss = root.querySelector(dismissSelector);
  if (dismiss && !(dismiss instanceof HTMLButtonElement)) {
    throw new Error(`Toast dismiss control must be a <button>.`);
  }

  const liveRegion = toastLiveRegions[getToastLiveRegion(getToastTone(root))];
  const region = root.closest<HTMLElement>(`.${contentParts.toastRegion}`);
  applyAttrs(root, { "aria-live": liveRegion.ariaLive, role: liveRegion.role });
  if (region) applyAttrs(region, { "aria-live": "polite" });
  if (dismiss) applyAttrs(dismiss, { type: "button" });

  let dismissed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const requestDismiss = (reason: ToastDismissDetails["reason"]) => {
    if (dismissed) return;

    dismissed = true;
    if (timer !== undefined) clearTimeout(timer);

    const details: ToastDismissDetails = { reason };
    options.onDismiss?.(details);
    root.dispatchEvent(new CustomEvent<ToastDismissDetails>(toastEvents.dismiss, { bubbles: true, detail: details }));
  };

  const cleanup = dismiss ? bindEvents(dismiss, { click: () => requestDismiss("dismiss") }) : () => {};
  if (hasToastTimeout(options.timeout)) timer = setTimeout(() => requestDismiss("timeout"), options.timeout);

  return () => {
    cleanup();
    if (timer !== undefined) clearTimeout(timer);
  };
}

export const mountToast = createConnectMount({
  key: "toast",
  rootSelector,
  connect: (root) => connectToast(root, { timeout: parseTimeout(root.dataset.timeout) }),
});

function getToastTone(root: HTMLElement): ToastTone {
  const tone = root.dataset.tone;
  return tone === "info" || tone === "success" || tone === "warning" || tone === "danger" ? tone : "neutral";
}

function parseTimeout(value: string | undefined): number | undefined {
  const timeout = Number(value);
  return hasToastTimeout(timeout) ? timeout : undefined;
}
