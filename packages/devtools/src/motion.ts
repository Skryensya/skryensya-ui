/*
 * MOTION SLOW-MO — retunes the primitive duration SCALE, not a per-element multiplier.
 *
 * `packages/core/css/primitives/_motion.scss` is the one place every animated duration in the
 * system ultimately comes from: every component consumes a semantic `--motion-*-duration` token
 * (`packages/core/css/semantic/_motion.scss`), and every one of those resolves to one of a handful
 * of `--scale-duration-*` primitives. Overriding just those primitives at a devtools-scoped selector
 * therefore slows down EVERY component's motion proportionally and correctly — retune a few root
 * tokens, touch nothing else.
 *
 * The values are duplicated here rather than read back from the primitives file: a custom property
 * cannot reference its OWN name inside a more specific selector matching the SAME element without
 * creating a genuine cycle (the cascade resolves to one winning declaration per property per
 * element, and that declaration referencing itself is invalid, not "the previous one"). Multiplying
 * a literal by `FACTOR` here, instead of hand-multiplying and hardcoding the product, at least keeps
 * the retune (or a future factor change) to one number.
 */

export const SLOW_MO_ATTR = "data-sk-devtools-slow-mo";
const STYLE_ID = "sk-devtools-slow-mo-style";
const FACTOR = 6;

export function ensureSlowMoStyleTag(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    html[${SLOW_MO_ATTR}] {
      --scale-duration-fast: calc(120ms * ${FACTOR});
      --scale-duration-moderate: calc(200ms * ${FACTOR});
      --scale-duration-slow: calc(320ms * ${FACTOR});
      --scale-duration-deliberate: calc(1600ms * ${FACTOR});
      --scale-duration-cycle-fast: calc(640ms * ${FACTOR});
      --scale-duration-cycle: calc(960ms * ${FACTOR});
      --scale-duration-cycle-slow: calc(1440ms * ${FACTOR});
    }
  `;
  document.head.appendChild(style);
}

export function createMotionSlowMo() {
  ensureSlowMoStyleTag();
  return {
    start(): void {
      document.documentElement.setAttribute(SLOW_MO_ATTR, "");
    },
    stop(): void {
      document.documentElement.removeAttribute(SLOW_MO_ATTR);
    },
  };
}
