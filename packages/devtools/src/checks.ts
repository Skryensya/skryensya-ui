import { menuAttrs } from "@skryensya/core/menu";
import { HIT_AREA_ATTR, ensureHitAreaStyleTag } from "./overlay.js";
import { FOCUS_ORDER_ATTR, ensureFocusOrderStyleTag } from "./focus-order.js";
import { SLOW_MO_ATTR, ensureSlowMoStyleTag } from "./motion.js";

/*
 * THE NAMES TWO REALMS HAVE TO SPELL IDENTICALLY.
 *
 * A debug check is one attribute on a root plus one stylesheet rule that reads it. That is trivial in
 * one document and not in two: every preview here is an iframe with its own document, so the top page
 * and the frame must agree on the attribute, and the frame must have the rule before the attribute is
 * set. Both halves used to be reached for by relative path, four times, from two apps -
 * `apps/docs/src/layouts/Base.astro` and `apps/eval-viewer/src/frame/entry.tsx` - each importing the
 * three modules separately and then folding them back into one array and one three-line block.
 *
 * THE MEMBERSHIP RULE, and it is mechanical rather than editorial: a name belongs in this module if
 * and only if two independent pieces of code - separated by a realm, or by a script-timing seam - must
 * spell it identically. Everything else stays private. That is why `HIT_AREA_ATTR`,
 * `ensureHitAreaStyleTag` and their five siblings are NOT re-exported here: no caller has ever wanted
 * one without the others, so six names would be a wider interface saying the same thing as two.
 *
 * NOT A SUBPATH PER FILE, which is what `packages/editor` does with seven of them and what the review
 * that prompted this flagged as shallow. One door, because there is one decision behind it.
 */

/**
 * Every attribute a realm has to mirror from its parent root, and the ONLY list a caller should build
 * one from.
 *
 * TWO SHAPES LIVE HERE and the difference is the one thing a caller must know:
 *
 *   - The first three are pure CSS, live-toggleable. Mirror them whenever they change; a
 *     `MutationObserver` on the parent root keeps them current and costs nothing.
 *   - `menuAttrs.debugSafetyTriangle` is READ ONCE, at mount: `Menu.svelte` resolves it with
 *     `closest()` during setup and never looks again. Mirroring it after menus have mounted silently
 *     does nothing, which is why it must be set before anything in the realm mounts.
 *
 * The last one is Core's, imported rather than retyped: it is a contract attribute
 * (`packages/core/src/menu.ts`), and it was the one literal in this set that had a real owner
 * somewhere else.
 */
export const CHECK_ATTRIBUTES: readonly string[] = [
  HIT_AREA_ATTR,
  SLOW_MO_ATTR,
  FOCUS_ORDER_ATTR,
  menuAttrs.debugSafetyTriangle,
];

/**
 * Install every check's stylesheet into THIS realm's document.
 *
 * No target parameter, deliberately: the three `ensure*StyleTag` functions underneath reach for the
 * ambient `document`, and a parameter this call could not honour would be worse than its absence.
 * That is not a limitation in practice - a realm installs its own rules, from its own script, where
 * `document` is already the right one.
 *
 * IDEMPOTENT per document (each rule is guarded by its own `<style>` id), and INERT until its
 * attribute is set - so installing early costs nothing and is the only safe order.
 *
 * ORDERING, which is the whole reason this is one call: install before mirroring state into a realm.
 * A realm that sets a check attribute before its rule exists shows nothing until the next attribute
 * change, and a document assembled once from a snapshot never gets that second chance.
 *
 * KNOWN INTERACTION, carried over rather than resolved: hit-area and focus-order both paint
 * `.sk-interactive::after`, so with both on, the later stylesheet wins the `background`. Deliberately
 * left alone - see `focus-order.ts`.
 */
export function installChecks(): void {
  ensureHitAreaStyleTag();
  ensureSlowMoStyleTag();
  ensureFocusOrderStyleTag();
}
