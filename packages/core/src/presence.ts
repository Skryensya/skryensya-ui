import type { ComponentContract } from "./contract.js";

/*
 * PRESENCE: content that animates out before it leaves.
 *
 * The CSS does the animating. `[hidden]` is the closed state, and `transition-behavior:
 * allow-discrete` on `display` holds the element on screen for the length of the exit, the same
 * idiom Dialog and Popover use for their own close. So in authored markup, toggling `hidden` is the
 * entire API: nothing to mount, no machine.
 *
 * What the platform cannot do is the React case. `{open && <Panel />}` removes the node in the
 * same commit, and there is nothing left for a transition to run on. The React binding keeps the
 * host mounted, flips `hidden`, and drops its children only once the exit has had time to paint.
 * "Once the exit has had time" is the one piece of behavior both bindings need to agree on, which
 * is why it lives here: `presenceExitMs` reads it off the element's own computed style.
 *
 * WHY NOT `@zag-js/presence`. ADR-0009 already rejected it: it tracks `animationName` to learn what
 * `allow-discrete` already gives the CSS for free, and only one binding would ever run it, which
 * fails ADR-0010's "one machine, two adapters" test. Reading a duration is a pure function.
 */

export const presenceParts = {
  root: "sk-presence",
} as const;

export type PresencePart = keyof typeof presenceParts;

export const presenceContract = {
  id: "presence",
  category: "layout",
  css: "@skryensya/core/components/presence.css",
  parts: presenceParts,
  hooks: [
    "--sk-presence-enter-distance",
    "--sk-presence-enter-duration",
    "--sk-presence-enter-easing",
    "--sk-presence-exit-distance",
    "--sk-presence-exit-duration",
    "--sk-presence-exit-easing",
  ],
  options: {
    /*
     * `data-state` is what a descendant or a sibling selector keys off; `hidden` (below, in the
     * template) is what the stylesheet animates and what takes the content out of the
     * accessibility tree once the exit ends. One option writes both, so they cannot disagree.
     */
    present: {
      type: "boolean",
      default: true,
      attr: "data-state",
      trueValue: "open",
      falseValue: "closed",
    },
  },
  signatures: {
    Presence: {
      intent: ["animate-in-and-out", "exit-animation", "conditional-content", "show-hide-transition"],
      host: { element: "div" },
      options: ["present"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrsWhen: [{ option: "present", equals: "false", attrs: { hidden: "" } }],
        slot: "children",
      },
      react: { from: "@skryensya/react/presence", name: "Presence" },
    },
  },
} as const satisfies ComponentContract;

/*
 * The CSS lists are parallel (`transition-duration` and `transition-delay` repeat to the longer
 * one), so the longest total is max(duration[i] + delay[i % delays.length]) over each list. A value
 * the browser did not resolve, jsdom's empty string included, reads as 0 and settles at once.
 */
function parseTimes(value: string): number[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const n = Number.parseFloat(part);
      if (!Number.isFinite(n)) return 0;
      return part.endsWith("ms") ? n : n * 1000;
    });
}

function longest(durations: string, delays: string): number {
  const d = parseTimes(durations);
  const l = parseTimes(delays);
  if (d.length === 0) return 0;
  return Math.max(0, ...d.map((duration, i) => duration + (l.length ? l[i % l.length]! : 0)));
}

/** The subset of `CSSStyleDeclaration` this reads, so a test can pass a plain object. */
export type PresenceTiming = Pick<
  CSSStyleDeclaration,
  "transitionDuration" | "transitionDelay" | "animationDuration" | "animationDelay"
>;

/**
 * How long an element that just became `hidden` keeps painting its exit, in milliseconds.
 *
 * Read from the computed style AFTER `hidden` is set, because that is when the exit timings are the
 * ones in effect. A consumer's own `@keyframes` exit counts too: whichever of the two runs longer.
 *
 * A timer on this number, not `transitionend`, is what settles an exit. The event is not reliable
 * here: a discrete `display` transition does not fire it everywhere, an ancestor that is itself
 * `display: none` fires nothing, and jsdom never fires it at all.
 */
export function presenceExitMs(style: PresenceTiming): number {
  return Math.max(
    longest(style.transitionDuration, style.transitionDelay),
    longest(style.animationDuration, style.animationDelay),
  );
}
