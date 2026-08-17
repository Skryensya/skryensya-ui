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
      options: { label: t("demo.splitButton.menuLabel"), triggerLabel: t("demo.splitButton.menuLabel") },
      slots: {
        items: splitButtonMenuItems(t),
      },
    },
  },
});
