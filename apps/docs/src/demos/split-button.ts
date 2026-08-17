import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { splitButtonMenuItems } from "./data/split-button";

/*
 * Both halves are composed, real signatures — a real `Button.action` for the primary, a real
 * `Menu` for the alternatives — not described by a flat prop. That is what the contract takes:
 * `split-button.ts`'s own template has no "primary" part of its own anymore, only a slot a real
 * Button fills, so this tree is what actually decides its fill/size/squared corner, the same way
 * it already decided the trigger's.
 */
export const splitButtonTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    primary: {
      contract: "button",
      signature: "Button.action",
      /*
       * `squareEnd`: the primary half of a split button always has a trigger glued to its end
       * side — never left to a default, the same reasoning `split-button.ts`'s own contract doc
       * gives for why this option is not exposed as author-configurable at all there. `variant`/
       * `size` restated explicitly even though `"primary"`/`"md"` are their own defaults — the
       * compiler never serializes an option's value when it equals that option's own default
       * (confirmed live: a plain `Button` demo carries no `data-size` either), so leaving them out
       * would mean `.sk-button[data-variant="primary"]` (button.css) simply never matches.
       */
      options: { variant: "primary", size: "md", squareEnd: true },
      slots: { children: t("demo.splitButton.primary") },
    },
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
       *
       * `triggerVariant`/`triggerSize`/`triggerIconOnly`/`triggerSquareStart` pair this trigger
       * with the primary `Button` above: same variant, same size, the icon-only SHAPE any bare
       * icon Button already has (button.css's own `[data-icon-only]`), and the one delta that
       * makes it a split-button trigger instead of a bare icon button — its own start corner
       * squared flat against the primary's end corner. Restated explicitly here, matching the
       * primary's own values, since composing the `menu` slot by hand means this tree — not
       * `SplitButton`'s own React binding — is the one responsible for keeping the two in sync
       * (see `split-button.ts`'s own contract doc).
       */
      options: {
        label: t("demo.splitButton.menuLabel"),
        triggerLabel: t("demo.splitButton.menuLabel"),
        triggerVariant: "primary",
        triggerSize: "md",
        triggerIconOnly: true,
        triggerSquareStart: true,
      },
      slots: {
        items: splitButtonMenuItems(t),
      },
    },
  },
});
