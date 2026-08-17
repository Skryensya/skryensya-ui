import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { splitButtonMenuItems } from "./data/split-button";

/*
 * Both halves are composed, real signatures — a real `Button.action` for the primary, a real
 * `Menu` for the alternatives — not described by a flat prop. That is what the contract takes:
 * `split-button.ts`'s own template has no "primary" part of its own anymore, only a slot a real
 * Button fills, so this tree is what actually decides its fill/size/squared corner, the same way
 * it already decided the trigger's.
 *
 * `neutral` on the primary, `primary` on the trigger: the ONE colored thing in this control is the
 * dropdown affordance, not the default action's own label — a deliberate choice, not this file's
 * own opinion about which half "should" carry color; `Button`'s six variants and `squareStart`/
 * `squareEnd` compose the same way regardless of which segment gets which.
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
       * `size` restated explicitly even though `"md"` is its own default (`neutral` is ALSO
       * Button's own default, but stated here anyway for symmetry with every other tree in this
       * file, which all restate it) — the compiler never serializes an option's value when it
       * equals that option's own default (confirmed live: a plain `Button` demo carries no
       * `data-size` either), so leaving a NON-default value like `primary` (below, on the trigger)
       * out would mean `.sk-button[data-variant="primary"]` (button.css) simply never matches.
       */
      options: { variant: "neutral", size: "md", squareEnd: true },
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
       * `triggerSize`/`triggerIconOnly`/`triggerSquareStart` pair this trigger with the primary
       * `Button` above: same size, the icon-only SHAPE any bare icon Button already has (button.css's
       * own `[data-icon-only]`), and the one delta that makes it a split-button trigger instead of a
       * bare icon button — its own start corner squared flat against the primary's end corner.
       * `triggerVariant` is deliberately NOT the same as the primary's own `variant` this time — see
       * this tree's own top comment. Restated explicitly here since composing the `menu` slot by hand
       * means this tree — not `SplitButton`'s own React binding — is the one responsible for keeping
       * the two paired (see `split-button.ts`'s own contract doc).
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

/** Same pairing as `splitButtonTree`, `size: "sm"` on both halves — proof the two stay ONE
 *  control at every size, not a full-size action beside a shrunk dropdown (or the reverse). */
export const splitButtonSmallTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    primary: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "neutral", size: "sm", squareEnd: true },
      slots: { children: t("demo.splitButton.primary") },
    },
    menu: {
      contract: "menu",
      signature: "Menu",
      options: {
        label: t("demo.splitButton.menuLabel"),
        triggerLabel: t("demo.splitButton.menuLabel"),
        triggerVariant: "primary",
        triggerSize: "sm",
        triggerIconOnly: true,
        triggerSquareStart: true,
      },
      slots: {
        items: splitButtonMenuItems(t),
      },
    },
  },
});

/*
 * The dropdown segment FIRST, the default action trailing — not through `SplitButton`'s own
 * contract, which always orders `primary` before `menu` (the pattern every real split button
 * this session's own research found uses: the dropdown trailing, chevron flipping to leading only
 * under `dir="rtl"` mirroring, never as an authored per-instance choice in the SAME direction).
 * Composed instead from `Inline` (`gap: "none"`, `inlineAlign: "stretch"` — the same welded layout
 * `.sk-split-button` itself uses, reused here via `attrs.class` rather than restated) holding a
 * Menu then a Button in that literal order — proof the underlying primitives
 * (`squareStart`/`squareEnd`, `triggerSquareStart`/`triggerSquareEnd`) work for ANY order an author
 * wants, `SplitButton` being the convenience for the common one, not the only shape they support.
 * `squareEnd`/`triggerSquareEnd` here, the MIRROR of the two trees above: the trigger is now
 * LEADING (its own end corner touches the seam), the button is now TRAILING (its own start corner
 * does).
 */
export const splitButtonMenuFirstTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "none", inlineAlign: "stretch" },
  attrs: { class: "sk-split-button" },
  slots: {
    children: [
      {
        contract: "menu",
        signature: "Menu",
        options: {
          label: t("demo.splitButton.menuLabel"),
          triggerLabel: t("demo.splitButton.menuLabel"),
          triggerVariant: "primary",
          triggerSize: "md",
          triggerIconOnly: true,
          triggerSquareEnd: true,
        },
        slots: {
          items: splitButtonMenuItems(t),
        },
      },
      {
        contract: "button",
        signature: "Button.action",
        options: { variant: "neutral", size: "md", squareStart: true },
        slots: { children: t("demo.splitButton.primary") },
      },
    ],
  },
});
