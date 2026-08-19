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

const rootSelector = "[data-sk-toast]";
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
  applyAttrs(root, { "aria-live": liveRegion.ariaLive, "aria-atomic": "true", role: liveRegion.role });
  if (region) applyAttrs(region, { "aria-live": "polite" });
  if (dismiss) applyAttrs(dismiss, { type: "button" });

  let dismissed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const requestDismiss = (reason: ToastDismissDetails["reason"]) => {
    if (dismissed) return;

    dismissed = true;
    if (timer !== undefined) clearTimeout(timer);

    const finish = () => {
      const details: ToastDismissDetails = { reason };
      options.onDismiss?.(details);
      root.dispatchEvent(new CustomEvent<ToastDismissDetails>(toastEvents.dismiss, { bubbles: true, detail: details }));
    };

    // toast.css answers `data-dismissing` with an opacity/scale/filter transition (`--motion-exit-*`),
    // and the region's own removal contract is `event.target.remove()` on receipt of `sk-dismiss`
    // (see toast-dismiss.ts) — so the exit only has somewhere to play if the EVENT waits for it. The
    // attribute goes on first, then the event fires once that transition ends, never before. Nothing
    // to wait for (no stylesheet loaded, `transition-duration: 0s`) skips the promise tick entirely and
    // fires on the same turn as the call, exactly like before this existed — a synchronous contract
    // stays synchronous where there is no animation to hold it up for.
    applyAttrs(root, { "data-dismissing": true });
    const durationMs = getExitDurationMs(root);
    if (durationMs <= 0) {
      finish();
      return;
    }
    waitForExit(root, durationMs).then(finish);
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

// The longest `transition-duration` the cascade currently resolves for this element, in
// milliseconds. Read AFTER `data-dismissing` goes on, so it reflects the exit rule's own timing
// (`--motion-exit-*`), not whatever was transitioning before. 0 in any environment with no matching
// stylesheet (unit tests, a page that never loaded toast.css) or genuinely no transition left after
// the cascade.
function getExitDurationMs(root: HTMLElement): number {
  return Math.max(
    0,
    ...getComputedStyle(root)
      .transitionDuration.split(",")
      .map((value) => parseFloat(value) * 1000 || 0),
  );
}

// Resolves once the `[data-dismissing]` exit transition (toast.css) finishes, or after its own
// measured duration if the `transitionend` never arrives — display:none ancestors, a property the
// browser decided not to animate, anything that would otherwise strand the toast on screen forever.
function waitForExit(root: HTMLElement, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      root.removeEventListener("transitionend", onTransitionEnd);
      resolve();
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === root) finish();
    };
    root.addEventListener("transitionend", onTransitionEnd);
    // A little slack over the measured duration: a `transitionend` that arrives a frame late from
    // rounding should still win the race, not the fallback.
    setTimeout(finish, durationMs + 50);
  });
}
