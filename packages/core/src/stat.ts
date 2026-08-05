import type { ComponentContract } from "./contract.js";

/*
 * STAT, a single headline metric: a label, a big value, and an optional change indicator.
 *
 * The trend colors the change independently of its sign, because "down is good" for churn and
 * "up is good" for revenue, the caller decides which direction is positive.
 *
 * Count-up is OPT-IN: static markup stays static. Bindings call `animateStatCount` only when the
 * consumer asks (`animate` in React, `data-animate` in vanilla).
 */
export type StatTrend = "up" | "down" | "neutral";

export const statParts = {
  root: "sk-stat",
  label: "sk-stat__label",
  value: "sk-stat__value",
  /** Invisible final string that holds layout width during count-up (no CLS). */
  valueSizer: "sk-stat__value-sizer",
  /** Visible ticking digits; stacked on the sizer. */
  valueTick: "sk-stat__value-tick",
  change: "sk-stat__change",
} as const;

export type StatPart = keyof typeof statParts;
export type StatPartClass = (typeof statParts)[StatPart];

/** Authored-root attributes for the vanilla enhancer (opt-in animate only). */
export const statAttrs = {
  root: "data-sk-stat",
  animate: "data-animate",
  count: "data-count",
  from: "data-from",
  prefix: "data-prefix",
  suffix: "data-suffix",
  locale: "data-locale",
  fractionDigits: "data-fraction-digits",
} as const;

export type StatCountEasing = (t: number) => number;

export type AnimateStatCountOptions = {
  from?: number;
  to: number;
  /** Milliseconds. Prefer `--sk-stat-count-duration` / `--motion-count-duration`. */
  duration: number;
  /** Progress 0…1 → eased 0…1. Default matches `--scale-easing-enter` (settle into place). */
  easing?: StatCountEasing;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
};

/**
 * Ease-out that matches the spirit of `--scale-easing-enter` (decelerate into the final value).
 * Pure math so bindings do not have to parse `cubic-bezier(...)` from computed style.
 */
export const statCountEasingEnter: StatCountEasing = (t) => {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
};

export type AnimateStatCountHandle = {
  stop: () => void;
};

/** Interpolates `from` → `to` on animation frames. No-ops when duration ≤ 0 (reduced motion). */
export function animateStatCount(options: AnimateStatCountOptions): AnimateStatCountHandle {
  const from = options.from ?? 0;
  const { to, duration, onUpdate, onComplete } = options;
  const easing = options.easing ?? statCountEasingEnter;

  if (!(duration > 0) || from === to) {
    onUpdate(to);
    onComplete?.();
    return { stop: () => undefined };
  }

  let frame = 0;
  let stopped = false;
  const started = performance.now();

  const tick = (now: number) => {
    if (stopped) return;
    const t = clamp01((now - started) / duration);
    onUpdate(from + (to - from) * easing(t));
    if (t < 1) {
      frame = requestAnimationFrame(tick);
      return;
    }
    onUpdate(to);
    onComplete?.();
  };

  frame = requestAnimationFrame(tick);

  return {
    stop: () => {
      stopped = true;
      if (frame) cancelAnimationFrame(frame);
    },
  };
}

/** Reads `--sk-stat-count-duration` (falls back to `--motion-count-duration` via the cascade). */
export function readStatCountDuration(element: Element): number {
  const raw = getComputedStyle(element).getPropertyValue("--sk-stat-count-duration").trim();
  return parseCssDuration(raw) ?? 1600;
}

export type FormatStatCountOptions = {
  locale?: string;
  prefix?: string;
  suffix?: string;
  fractionDigits?: number;
};

export function formatStatCount(value: number, options: FormatStatCountOptions = {}): string {
  const fractionDigits = options.fractionDigits ?? statCountFractionDigits(value);
  const formatted = new Intl.NumberFormat(options.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
  return `${options.prefix ?? ""}${formatted}${options.suffix ?? ""}`;
}

/** How many fraction digits a target number implies (`1.20` → 2, `48200` → 0). */
export function statCountFractionDigits(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const text = String(n);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

export function prefersReducedMotion(media = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")): boolean {
  return media?.matches ?? false;
}

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function parseCssDuration(raw: string): number | undefined {
  if (!raw) return undefined;
  if (raw.endsWith("ms")) {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  if (raw.endsWith("s")) {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n * 1000 : undefined;
  }
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

/*
 * A number with a name. The label comes first in the markup so it is read before the value: a screen
 * reader announcing "1.284" without "usuarios activos" has said nothing.
 */
export const statContract = {
  id: "stat",
  css: "@skryensya/core/components/stat.css",
  parts: statParts,

  options: {
    /** Which way the change points. Paired with the change text, never the only cue. */
    trend: { type: "enum", values: ["up", "down", "neutral"], attr: "data-trend" },
    animate: { type: "boolean", default: false, attr: "data-animate", trueValue: "", machineInput: true },
    count: { type: "number", attr: "data-count", machineInput: true },
    locale: { type: "string", attr: "data-locale", machineInput: true },
    suffix: { type: "string", attr: "data-suffix", machineInput: true },
    fractionDigits: { type: "number", attr: "data-fraction-digits", machineInput: true },
  },

  signatures: {
    Stat: {
      intent: ["metric", "kpi", "one-number-with-a-name", "dashboard-figure"],
      host: { element: "div" },
      options: ["trend", "animate", "count", "locale", "suffix", "fractionDigits"],
      mount: "data-sk-stat",
      slots: {
        label: { accepts: "text", required: true },
        value: { accepts: "text", required: true },
        /**
         * The delta. `node`, not `text`, because the trend GLYPH lives here: the stylesheet sizes
         * `.sk-stat__change .sk-icon` to the caption beside it, which is only reachable if an Icon
         * can be composed in. Typed as text, the contract could express the number and not the arrow
         * that every hand-written example on the docs page already had.
         *
         * `trend` still owns the colour and the direction. The glyph is the redundant cue that keeps
         * the meaning from depending on colour alone.
         */
        change: { accepts: "node" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "span", part: "label", slot: "label" },
          {
            element: "span",
            part: "value",
            options: ["count", "locale", "suffix", "fractionDigits"],
            slot: "value",
          },
          { element: "span", part: "change", whenGiven: "change", options: ["trend"], slot: "change" },
        ],
      },
      react: { from: "@skryensya/react/stat", name: "Stat" },
    },
  },
} as const satisfies ComponentContract;
