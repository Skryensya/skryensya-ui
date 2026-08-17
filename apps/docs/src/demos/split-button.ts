import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { splitButtonMenuItems } from "./data/split-button";

/*
 * The default action plus its variants, and the Menu half is a real Menu, composed rather than
 * described by a flat list. That is what the contract takes, and what the stylesheet now reaches by
 * structure instead of through a class the composition could never pass.
 */
export const splitButtonTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  /*
   * `variant`/`size` restated explicitly even though `"primary"`/`"md"` are their own defaults —
   * the compiler never serializes an option's value when it equals that option's own default
   * (confirmed live: a plain `Button` demo carries no `data-size` either), so the primary segment's
   * `data-variant` would go unwritten and `.sk-button[data-variant="primary"]` (button.css) would
   * simply never match. Same reasoning as `triggerVariant`/`triggerSize` below, restated for the
   * primary half instead of the trigger.
   */
  options: { variant: "primary", size: "md" },
  slots: {
    children: t("demo.splitButton.primary"),
    menu: {
      contract: "menu",
      signature: "Menu",
      /*
       * `triggerLabel`, not `label` alone, is what names the TRIGGER BUTTON itself — the real
       * split-button pattern industry-wide (GitHub's `...` button, Bootstrap's `dropdown-toggle-
       * split`, Fluent's `SplitButton`) is an icon-only dropdown segment, no visible text at all,
       * named for a screen reader by `aria-label`. `trigger` (the slot) is left UNSET on purpose:
       * Menu's own template (`core/menu.ts`) always paints a chevron on the trigger, unconditionally,
       * so there is nothing left for a second, composed chevron to add — passing one used to paint a
       * visible SECOND `▾` right beside the first (confirmed live) and STILL left the button with no
       * accessible name (its only content was an `aria-hidden` icon). `triggerLabel` fixes both by
       * construction: the chevron stays the only visible content, and the button announces a real
       * name — matching this page's own a11y tab, "two independent buttons: one runs the action, the
       * other announces and opens the alternatives."
       */
      /*
       * `triggerVariant`/`triggerSize`/`triggerSquareStart` pair this trigger with the primary
       * button above — the SAME `variant`/`size` this tree gives `SplitButton` itself (both
       * default to `"primary"`/`"md"`, restated explicitly here since composing the `menu` slot by
       * hand means this tree, not `SplitButton`'s own React binding, is the one responsible for
       * keeping the two in sync; see `split-button.ts`'s own contract doc). `Button`'s existing
       * `[data-variant]`/`[data-size]`/`[data-square-start]` rules (button.css) do the rest —
       * nothing split-button-specific left to set here.
       */
      options: {
        label: t("demo.splitButton.menuLabel"),
        triggerLabel: t("demo.splitButton.menuLabel"),
        triggerVariant: "primary",
        triggerSize: "md",
        triggerSquareStart: true,
      },
      slots: {
        items: splitButtonMenuItems(t),
      },
    },
  },
});
