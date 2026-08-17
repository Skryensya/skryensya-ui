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
      options: { label: t("demo.splitButton.menuLabel") },
      /*
       * `trigger` is text, the same shape every other Menu demo uses (`menu.ts`'s own trees) — NOT
       * a composed chevron `Icon`, which is what this tree authored until now. Menu's own template
       * (`core/menu.ts`) always paints a chevron indicator on the trigger button, unconditionally,
       * for every consumer; a second chevron passed as `trigger` content painted a visible SECOND
       * one right beside it (confirmed live: two `▾` glyphs on the same button). It also left the
       * button with no accessible name at all — its only content was an `aria-hidden` icon, so a
       * screen reader announced nothing on the second half of a control this page's own a11y tab
       * describes as "two independent buttons: one runs the action, the other announces and opens
       * the alternatives." Plain text fixes both: one chevron (Menu's own), and a real name from
       * the button's own content, exactly like every other Menu trigger in this catalogue.
       */
      slots: {
        trigger: t("demo.splitButton.menuLabel"),
        items: splitButtonMenuItems(t),
      },
    },
  },
});
