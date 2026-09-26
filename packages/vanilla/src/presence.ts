import { presenceContract, presenceExitMs } from "@skryensya/core/presence";

/*
 * PRESENCE, the imperative binding.
 *
 * Not an enhancer: there is nothing to mount. Authored markup already animates on its own, because
 * `presence.css` keys the whole transition off `hidden`, so `element.hidden = true` is a complete
 * close. What this adds is the one thing an attribute write cannot say: WHEN the exit has finished,
 * for a caller that wants to remove the node, move focus, or chain the next step after it.
 *
 * It writes `data-state` beside `hidden` so the markup matches what the React binding renders, and
 * settles on the same `presenceExitMs` reading React waits for.
 */

const { present: presentOption } = presenceContract.options;

/* One pending settle per element, so reopening mid-exit cancels the close instead of racing it. */
const pending = new WeakMap<HTMLElement, { timer: ReturnType<typeof setTimeout>; resolve: () => void }>();

/**
 * Show or hide a `.sk-presence` element. Resolves once the change has finished painting: at once
 * when showing, after the exit when hiding. A close interrupted by a reopen resolves at the reopen.
 *
 *   await setPresent(panel, false);
 *   panel.remove();
 */
export function setPresent(element: HTMLElement, present: boolean): Promise<void> {
  const previous = pending.get(element);
  if (previous) {
    clearTimeout(previous.timer);
    pending.delete(element);
    previous.resolve();
  }

  const wasHidden = element.hidden;
  element.hidden = !present;
  element.setAttribute("data-state", present ? presentOption.trueValue : presentOption.falseValue);

  if (present || wasHidden) return Promise.resolve();

  const wait = presenceExitMs(getComputedStyle(element));
  if (wait === 0) return Promise.resolve();

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(element);
      resolve();
    }, wait);
    pending.set(element, { timer, resolve });
  });
}
