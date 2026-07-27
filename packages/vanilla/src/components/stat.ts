import {
  animateStatCount,
  formatStatCount,
  prefersReducedMotion,
  readStatCountDuration,
  statAttrs,
  statCountFractionDigits,
  statParts,
} from "@skryensya/core/stat";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${statAttrs.root}][${statAttrs.animate}]`;

type Cleanup = () => void;

export const mountStat = createConnectMount({ key: "stat", rootSelector, connect: connectStat });

/** Opt-in count-up for authored stats. Roots without `data-animate` are left alone. */
export function connectStat(root: HTMLElement): Cleanup {
  const value = root.querySelector<HTMLElement>(`.${statParts.value}`);
  if (!value) throw new Error(`${statParts.root}[${statAttrs.animate}] needs a .${statParts.value}.`);

  const countAttr = value.getAttribute(statAttrs.count);
  if (countAttr == null || countAttr === "") {
    throw new Error(`.${statParts.value} needs a finite ${statAttrs.count} when ${statAttrs.animate} is set.`);
  }
  const to = Number(countAttr);
  if (!Number.isFinite(to)) {
    throw new Error(`.${statParts.value} needs a finite ${statAttrs.count} when ${statAttrs.animate} is set.`);
  }

  const fromAttr = value.getAttribute(statAttrs.from);
  const from = fromAttr == null || fromAttr === "" ? 0 : Number(fromAttr);
  if (!Number.isFinite(from)) {
    throw new Error(`${statAttrs.from} must be a finite number when present.`);
  }

  const fractionAttr = value.getAttribute(statAttrs.fractionDigits);
  const fractionDigits =
    fractionAttr == null || fractionAttr === ""
      ? statCountFractionDigits(to)
      : Number.parseInt(fractionAttr, 10);
  if (!Number.isFinite(fractionDigits)) {
    throw new Error(`${statAttrs.fractionDigits} must be an integer when present.`);
  }

  const format = (n: number) =>
    formatStatCount(n, {
      locale: value.getAttribute(statAttrs.locale) ?? undefined,
      prefix: value.getAttribute(statAttrs.prefix) ?? undefined,
      suffix: value.getAttribute(statAttrs.suffix) ?? undefined,
      fractionDigits,
    });

  const finalText = value.textContent?.trim() || format(to);
  const tick = reserveValueSlot(value, finalText);

  let handle: { stop: () => void } | undefined;
  let observer: IntersectionObserver | undefined;
  let cancelled = false;

  const run = () => {
    if (cancelled) return;
    const duration = prefersReducedMotion() ? 0 : readStatCountDuration(root);
    handle?.stop();
    handle = animateStatCount({
      from,
      to,
      duration,
      onUpdate: (n) => {
        tick.textContent = format(n);
      },
      onComplete: () => {
        tick.textContent = finalText;
      },
    });
  };

  if (typeof IntersectionObserver === "undefined") {
    run();
  } else {
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        observer = undefined;
        run();
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
  }

  return () => {
    cancelled = true;
    observer?.disconnect();
    handle?.stop();
    tick.textContent = finalText;
  };
}

/**
 * Stack an invisible final string under a visible tick so intermediate shorter figures never
 * shrink the box (CLS). Authored text becomes the sizer; the tick starts at that same final
 * string until the count actually runs.
 */
function reserveValueSlot(value: HTMLElement, finalText: string): HTMLElement {
  const existing = value.querySelector<HTMLElement>(`.${statParts.valueTick}`);
  if (existing) {
    const sizer = value.querySelector<HTMLElement>(`.${statParts.valueSizer}`);
    if (sizer) sizer.textContent = finalText;
    existing.textContent = finalText;
    return existing;
  }

  const sizer = value.ownerDocument.createElement("span");
  sizer.className = statParts.valueSizer;
  sizer.setAttribute("aria-hidden", "true");
  sizer.textContent = finalText;

  const tick = value.ownerDocument.createElement("span");
  tick.className = statParts.valueTick;
  tick.textContent = finalText;

  value.replaceChildren(sizer, tick);
  return tick;
}
