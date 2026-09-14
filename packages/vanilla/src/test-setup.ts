/*
 * The shared jsdom floor, re-exported rather than copied. It moved to `@skryensya/core/jsdom-floor`
 * when React needed the same shims: two setups had already drifted into 38 identical lines, and
 * `packages/ai-gates` was importing this file for exactly that reason.
 *
 * This module stays because `vitest.config.ts` names it as `setupFiles` and `ai-gates` imports it by
 * this path; both keep working, and neither has to know where the floor actually lives.
 */
import "@skryensya/core/jsdom-floor";
