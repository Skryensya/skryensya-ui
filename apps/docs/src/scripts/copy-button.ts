/*
 * Behavior for `CopyButton.astro` (docs-local markup, decision 33: no published contract owns this
 * any more). Mirrors what `@skryensya/vanilla`'s deleted `connectCopyButton` used to do. The DOM
 * shape didn't change, only where the click/timer logic lives.
 */
import { anchorNameFor, bindAnchor, supportsAnchorPositioning } from "@skryensya/core/anchored";
import { writeClipboard } from "@skryensya/core/copy-button";
import { setIconState } from "@skryensya/core/icon-state-button";

let nextId = 0;
const uniqueId = (prefix: string) => `${prefix}-${++nextId}`;

const FEEDBACK_DURATION = 1800;
/*
 * A re-click before the anchor position has fully settled is what actually causes the flag to
 * paint overlapping the button (see `paint()` below); forcing a reflow narrowed the window but
 * did not close it. Throttling the CLICK itself closes it for real: no second `paint()` call
 * happens until a real frame has had time to render the first one's close→reopen in full, so
 * there is never a second position computation to race the first.
 */
const CLICK_THROTTLE = 400;

/*
 * Docs-local now (decision 33: no published contract owns this shape any more). `CopyCells.astro`'s
 * script (`copy-cells.ts`) retargets the one shared button by writing `target`/`root` directly, so
 * this is exported rather than kept private to this file.
 */
export const attrs = {
  root: "data-sk-copy-button",
  target: "data-sk-copy-button-target",
  state: "data-sk-copy-button-state",
  label: "data-sk-copy-button-label",
  feedback: "data-sk-copy-button-feedback",
  successLabel: "data-sk-copy-button-success-label",
  errorLabel: "data-sk-copy-button-error-label",
  successAriaLabel: "data-sk-copy-button-success-aria-label",
  errorAriaLabel: "data-sk-copy-button-error-aria-label",
} as const;

type CopyState = "copied" | "error";

function sourceText(button: HTMLButtonElement): string | null {
  const target = button.getAttribute(attrs.target);
  return target ? (document.getElementById(target)?.textContent ?? null) : null;
}

function connect(root: HTMLButtonElement): () => void {
  const label = root.querySelector<HTMLElement>(`[${attrs.label}]`);
  const flag = root.querySelector<HTMLElement>(`[${attrs.feedback}]`);

  /*
   * The dashed-ident that ties this button to its own flag (decision 25, Anclaje): without it the
   * flag has no anchor, `position-area` falls back to its static position, and it lands wherever
   * page flow happens to put it. Usually right on top of the button it is meant to float beside.
   * Skipped where the API is absent: there is no machine here to take over, so the stylesheet's own
   * `@supports not (anchor-name)` rule hides the flag rather than place it wrongly.
   */
  const unbindAnchor =
    flag && supportsAnchorPositioning()
      ? bindAnchor(root, flag, anchorNameFor(root.id || uniqueId("sk-copy-button")))
      : undefined;

  const idleLabel = label?.textContent ?? "Copy";
  const idleAriaLabel = root.getAttribute("aria-label") ?? idleLabel;
  const successLabel = root.getAttribute(attrs.successLabel) ?? "Copied";
  const errorLabel = root.getAttribute(attrs.errorLabel) ?? "Copy failed";
  const successAriaLabel = root.getAttribute(attrs.successAriaLabel) ?? successLabel;
  const errorAriaLabel = root.getAttribute(attrs.errorAriaLabel) ?? errorLabel;

  let resetTimer: number | undefined;
  let throttleTimer: number | undefined;

  const reset = () => {
    setIconState(root, attrs.state, undefined, idleAriaLabel);
    if (label) label.textContent = idleLabel;
    flag?.removeAttribute("data-state");
  };

  const paint = (state: CopyState) => {
    setIconState(root, attrs.state, state, state === "copied" ? successAriaLabel : errorAriaLabel);
    if (label) label.textContent = state === "copied" ? successLabel : errorLabel;
    /*
     * A second copy before the first flag closed used to write `data-state="open"` onto a flag
     * that was already open. A no-op attribute set the browser had nothing to react to, and the
     * anchor positioning that followed painted the flag overlapping the button. Forcing a
     * close→reflow→reopen here fixed that race, but forces a synchronous reflow on EVERY open,
     * including the first ever. The one time the engine is still settling `position-try` for a
     * box that has never been visible before, which risks freezing an unsettled result into what
     * paints. `onClick`'s throttle closes the actual race instead: a second click can no longer
     * reach `paint()` while the first flag is still open, so there is nothing left to reopen.
     */
    flag?.setAttribute("data-state", "open");
    if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      reset();
      resetTimer = undefined;
    }, FEEDBACK_DURATION);
  };

  const onClick = () => {
    /* Throttled, not just debounced: a click mid-cooldown is dropped outright rather than queued
       or restarted, since the reader's intent ("copy THIS") is already satisfied by the click that
       is still playing out. */
    if (root.getAttribute("aria-disabled") === "true") return;
    root.setAttribute("aria-disabled", "true");
    if (throttleTimer !== undefined) window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(() => {
      root.removeAttribute("aria-disabled");
      throttleTimer = undefined;
    }, CLICK_THROTTLE);

    const text = sourceText(root);
    if (!text) {
      paint("error");
      return;
    }
    /*
     * Optimistic: painted BEFORE the write resolves, not after. `navigator.clipboard.writeText`'s
     * permission check alone can take 150ms+, and gating the icon/flag animation behind that
     * await left a dead pause after the click before anything moved. The animation then had to
     * play its full course in one late burst, which read as a snap rather than a response to the
     * click. A clipboard write failing is rare enough that correcting to "error" after the fact
     * costs less than delaying the common case ever does.
     */
    paint("copied");
    void writeClipboard(text).then((copied) => {
      if (!copied) paint("error");
    });
  };

  root.addEventListener("click", onClick);
  return () => {
    root.removeEventListener("click", onClick);
    if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    if (throttleTimer !== undefined) window.clearTimeout(throttleTimer);
    root.removeAttribute("aria-disabled");
    reset();
    unbindAnchor?.();
  };
}

export function initCopyButtons(): void {
  document.querySelectorAll<HTMLButtonElement>(`[${attrs.root}]:not([data-copy-button-bound])`).forEach((root) => {
    root.setAttribute("data-copy-button-bound", "");
    connect(root);
  });
}
