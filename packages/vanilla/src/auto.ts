import type { IconSet } from "@skryensya/core/icon";
import { mountIcons } from "./icon.js";
import { initComponents } from "./runtime/registry.js";

export { initComponents } from "./runtime/registry.js";

/**
 * `initComponents(root)` bound to an icon set, with the wait a race needs.
 *
 * Svelte enhancers can finish their DOM commit after `initComponents()`'s own await resolves (an
 * enhancer's `$effect` can land on a later microtask than the one that mounted it), so a control
 * an enhancer injects. A chevron, a check. Can still be an un-hydrated `[data-sk-icon]`
 * placeholder the instant a single `mountIcons` pass already ran past it. Waiting one animation
 * frame before mounting icons a SECOND time is what makes that pass deterministic instead of a
 * race a page might or might not lose.
 *
 * Every environment that boots a full page of enhanced markup needs this exact sequence: the docs
 * preview frame (`apps/docs/src/scripts/component-preview-frame.ts`) and the ai-gates G2 stage
 * that exists to catch drift between the two bindings both do. Before this function existed each
 * wrote its own copy, and only the docs frame's knew to wait for the second pass. The gate had no
 * way to catch a regression in the exact race its own sibling was written to defend against.
 */
export async function mountComponentsWithIcons(root: Document | Element, set: IconSet): Promise<void> {
  mountIcons(root, set);
  await initComponents(root);
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  mountIcons(root, set);
}
