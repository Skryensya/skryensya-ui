import {
  marqueeAttrs,
  marqueeDurationSeconds,
  marqueeGapFill,
  marqueeInitialPlaying,
  marqueeParts,
  marqueeProperties,
  type MarqueeDirection,
  type MarqueeStart,
} from "@skryensya/core/marquee";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

type Cleanup = () => void;

/*
 * The DOM adapter owns intent and measurement, never animation frames. CSS moves the track; this
 * adapter swaps Play/Pause, follows the live reduced-motion preference, and turns one content
 * width into a duration so `slow` means the same velocity for a short or long strip.
 *
 * It also owns the only measurement the loop's continuity depends on: a run shorter than its
 * viewport gets its gaps widened until it reaches across, because two copies of a short run leave a
 * hole. That is why the viewport is observed alongside the content; the content alone never resizes
 * when the window does, and the hole opens at exactly that moment.
 */
export function connectMarquee(root: HTMLElement): Cleanup {
  const toggle = root.querySelector<HTMLButtonElement>(`.${marqueeParts.toggle}`);
  const viewport = root.querySelector<HTMLElement>(`.${marqueeParts.viewport}`);
  const content = root.querySelector<HTMLElement>(`.${marqueeParts.content}:not([aria-hidden="true"])`);
  const playLabel = toggle?.querySelector<HTMLElement>("[data-action=play]");
  const pauseLabel = toggle?.querySelector<HTMLElement>("[data-action=pause]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const start: MarqueeStart = root.getAttribute(marqueeAttrs.start) === "auto" ? "auto" : "manual";
  const direction: MarqueeDirection = (() => {
    const value = root.getAttribute(marqueeAttrs.direction);
    return value === "right" || value === "up" || value === "down" ? value : "left";
  })();
  let playing = marqueeInitialPlaying(start, reducedMotion.matches);
  let userChanged = false;

  const syncState = (): void => {
    root.setAttribute(marqueeAttrs.state, playing ? "playing" : "paused");
    toggle?.setAttribute("aria-pressed", String(playing));
    playLabel?.toggleAttribute("hidden", playing);
    pauseLabel?.toggleAttribute("hidden", !playing);
  };

  const vertical = direction === "up" || direction === "down";

  const syncGeometry = (): void => {
    if (!content) return;
    const cadenceMilliseconds = Number.parseFloat(
      getComputedStyle(root).getPropertyValue("--sk-marquee-cadence-duration"),
    );
    /* Measure at the authored gap, never at the one a previous pass wrote: reading back a filled run
     * and filling it again would compound, and the strip would drift wider on every resize. */
    root.style.setProperty(marqueeProperties.gapFill, "0px");
    const gapCount = content.childElementCount;
    const runSize = vertical ? content.scrollHeight : content.scrollWidth;
    const viewportSize = vertical ? (viewport?.clientHeight ?? 0) : (viewport?.clientWidth ?? 0);
    const fill = marqueeGapFill(runSize, gapCount, viewportSize);
    if (fill > 0) root.style.setProperty(marqueeProperties.gapFill, `${fill}px`);
    const seconds = marqueeDurationSeconds(runSize + fill * gapCount, cadenceMilliseconds);
    if (seconds > 0) root.style.setProperty(marqueeProperties.duration, `${seconds}s`);
  };

  const onToggle = (): void => {
    if (reducedMotion.matches) return;
    userChanged = true;
    playing = !playing;
    syncState();
  };

  const onMotionPreference = (): void => {
    if (reducedMotion.matches) playing = false;
    else if (start === "auto" && !userChanged) playing = true;
    syncState();
  };

  toggle?.addEventListener("click", onToggle);
  reducedMotion.addEventListener("change", onMotionPreference);
  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncGeometry);
  if (content) resizeObserver?.observe(content);
  if (viewport) resizeObserver?.observe(viewport);
  syncState();
  syncGeometry();

  return () => {
    toggle?.removeEventListener("click", onToggle);
    reducedMotion.removeEventListener("change", onMotionPreference);
    resizeObserver?.disconnect();
  };
}

export const mountMarquee = createConnectMount({
  key: "marquee",
  rootSelector: `[${marqueeAttrs.root}]`,
  connect: connectMarquee,
});
