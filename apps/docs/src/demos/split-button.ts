import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import {
  splitButtonMenuItems,
  splitButtonSubtleMenuItems,
  splitButtonTranslucentMenuItems,
  splitButtonGhostMenuItems,
  splitButtonDangerMenuItems,
} from "./data/split-button";
import { namePart } from "./annotation-parts";

/*
 * Both halves are composed, real signatures. A real `Button.action` for the action, a real
 * `Menu` for the alternatives: not described by a flat prop. That is what the contract takes:
 * `split-button.ts`'s own template has no "action" part of its own anymore, only a slot a real
 * Button fills, so this tree is what actually decides its fill/size/welded corner, the same way
 * it already decided the trigger's.
 *
 * `neutral` on BOTH halves: not one variant per segment. A colored action segment beside an uncolored
 * trigger (or the reverse) reads as two DIFFERENT controls that happen to be touching, not one;
 * `Button`'s six variants and `weldStart`/`weldEnd` compose the same way regardless of which
 * variant either segment picks, but picking two DIFFERENT ones for the two halves of the SAME
 * control is a choice this file makes deliberately AGAINST, not a limitation of the mechanism.
 */
export const splitButtonTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    action: {
      contract: "button",
      signature: "Button.action",
      /*
       * `weldEnd`: the action half of a split button always has a trigger glued to its end
       * side: never left to a default, the same reasoning `split-button.ts`'s own contract doc
       * gives for why this option is not exposed as author-configurable at all there. `variant`/
       * `size` restated explicitly even though both are their own defaults (`neutral`/`"md"`) -
       * kept for symmetry with the trigger's own explicit `triggerVariant` below and with every
       * other tree in this file, all of which restate it the same way.
       */
      options: { variant: "solid", size: "md", weldEnd: true },
      slots: { children: t("demo.splitButton.action") },
    },
    menu: {
      contract: "menu",
      signature: "Menu",
      /*
       * `triggerLabel`, not `label` alone, is what names the TRIGGER BUTTON itself. The real
       * split-button pattern industry-wide (GitHub's `...` button, Bootstrap's `dropdown-toggle-
       * split`, Fluent's `SplitButton`) is an icon-only dropdown segment, no visible text at all,
       * named for a screen reader by `aria-label`. `trigger` (the slot) is left UNSET on purpose:
       * Menu's own template (`core/menu.ts`) always paints a chevron on the trigger, unconditionally,
       * so there is nothing left for a second, composed chevron to add. Passing one used to paint a
       * visible SECOND `▾` right beside the first (confirmed live) and STILL left the button with no
       * accessible name (its only content was an `aria-hidden` icon). `triggerLabel` fixes both by
       * construction: the chevron stays the only visible content, and the button announces a real
       * name. Matching this page's own a11y tab, "two independent buttons: one runs the action, the
       * other announces and opens the alternatives."
       *
       * `triggerVariant`/`triggerSize`/`triggerIconOnly`/`triggerWeldStart` pair this trigger with
       * the action `Button` above: same variant (see this tree's own top comment for why they
       * match), same size, the icon-only SHAPE any bare icon Button already has (button.css's own
       * `[data-icon-only]`), and the one delta that makes it a split-button trigger instead of a
       * bare icon button. Its own start edge welded flat against the action's end edge. Restated
       * explicitly here since composing the `menu` slot by hand means this tree: not `SplitButton`'s
       * own React binding. Is the one responsible for keeping the two paired (see `split-button.ts`'s
       * own contract doc).
       */
      options: {
        label: t("demo.splitButton.menuLabel"),
        triggerLabel: t("demo.splitButton.menuLabel"),
        triggerVariant: "neutral",
        triggerSize: "md",
        triggerIconOnly: true,
        triggerWeldStart: true,
      },
      slots: {
        items: splitButtonMenuItems(t),
      },
    },
  },
});


/*
 * The weld itself: root group, action Button, Menu trigger. Menu's open panel is taught on Menu's
 * own page; here the specimen stays closed so the hairline seam is the thing being named.
 */
export const splitButtonAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("splitButtonPage.anatomyLabel"), inert: true },
  slots: {
    subject: splitButtonTree(t),
    items: [
      namePart(".sk-split-button", "block-start", { ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-button", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-menu__trigger", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** Same pairing as `splitButtonTree`, `size: "sm"` on both halves. Proof the two stay ONE
 *  control at every size, not a full-size action beside a shrunk dropdown (or the reverse). */
export const splitButtonSmallTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    action: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "solid", size: "sm", weldEnd: true },
      slots: { children: t("demo.splitButton.action") },
    },
    menu: {
      contract: "menu",
      signature: "Menu",
      options: {
        label: t("demo.splitButton.menuLabel"),
        triggerLabel: t("demo.splitButton.menuLabel"),
        triggerVariant: "neutral",
        triggerSize: "sm",
        triggerIconOnly: true,
        triggerWeldStart: true,
      },
      slots: {
        items: splitButtonMenuItems(t),
      },
    },
  },
});

/** Same pairing as `splitButtonTree`, `variant: "subtle"` on both halves. The deliberate choice
 *  this file's top comment argues for: one variant across the WHOLE control, never split
 *  between the two halves. Content swapped to Archive: a lower-emphasis action than Save, the
 *  kind `subtle` (visible but quiet background) actually fits. */
export const splitButtonSubtleTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    action: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "soft", size: "md", weldEnd: true },
      slots: { children: t("demo.splitButton.subtlePrimary") },
    },
    menu: {
      contract: "menu",
      signature: "Menu",
      options: {
        label: t("demo.splitButton.subtleMenuLabel"),
        triggerLabel: t("demo.splitButton.subtleMenuLabel"),
        triggerVariant: "subtle",
        triggerSize: "md",
        triggerIconOnly: true,
        triggerWeldStart: true,
      },
      slots: {
        items: splitButtonSubtleMenuItems(t),
      },
    },
  },
});

/** Same pairing as `splitButtonTree`, `variant: "translucent"` on both halves. Content swapped
 *  to Download: `translucent` reads as glass over media, and a download action over a photo or
 *  hero backdrop is the case it was built for. */
export const splitButtonTranslucentTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    action: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "translucent", size: "md", weldEnd: true },
      slots: { children: t("demo.splitButton.translucentPrimary") },
    },
    menu: {
      contract: "menu",
      signature: "Menu",
      options: {
        label: t("demo.splitButton.translucentMenuLabel"),
        triggerLabel: t("demo.splitButton.translucentMenuLabel"),
        triggerVariant: "translucent",
        triggerSize: "md",
        triggerIconOnly: true,
        triggerWeldStart: true,
      },
      slots: {
        items: splitButtonTranslucentMenuItems(t),
      },
    },
  },
});

/** Same pairing as `splitButtonTree`, `variant: "ghost"` on both halves. Content swapped to
 *  Share: chromeless and optional, the register `ghost`'s own near-invisible resting state
 *  matches. */
export const splitButtonGhostTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    action: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "ghost", size: "md", weldEnd: true },
      slots: { children: t("demo.splitButton.ghostPrimary") },
    },
    menu: {
      contract: "menu",
      signature: "Menu",
      options: {
        label: t("demo.splitButton.ghostMenuLabel"),
        triggerLabel: t("demo.splitButton.ghostMenuLabel"),
        triggerVariant: "ghost",
        triggerSize: "md",
        triggerIconOnly: true,
        triggerWeldStart: true,
      },
      slots: {
        items: splitButtonGhostMenuItems(t),
      },
    },
  },
});

/** Same pairing as `splitButtonTree`, `variant: "danger"` on both halves. Content swapped to
 *  Delete: the one action `danger`'s coloring exists to warn about. */
export const splitButtonDangerTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    action: {
      contract: "button",
      signature: "Button.action",
      options: { tone: "danger", size: "md", weldEnd: true },
      slots: { children: t("demo.splitButton.dangerPrimary") },
    },
    menu: {
      contract: "menu",
      signature: "Menu",
      options: {
        label: t("demo.splitButton.dangerMenuLabel"),
        triggerLabel: t("demo.splitButton.dangerMenuLabel"),
        triggerVariant: "danger",
        triggerSize: "md",
        triggerIconOnly: true,
        triggerWeldStart: true,
      },
      slots: {
        items: splitButtonDangerMenuItems(t),
      },
    },
  },
});

/*
 * The dropdown segment FIRST, the default action trailing: not through `SplitButton`'s own
 * contract, which always orders `primary` before `menu` (the pattern every real split button
 * this session's own research found uses: the dropdown trailing, chevron flipping to leading only
 * under `dir="rtl"` mirroring, never as an authored per-instance choice in the SAME direction).
 * Composed instead from `Inline` (`gap: "none"`, `inlineAlign: "stretch"`. The same welded layout
 * `.sk-split-button` itself uses, reused here via `attrs.class` rather than restated) holding a
 * Menu then a Button in that literal order. Proof the underlying primitives
 * (`weldStart`/`weldEnd`, `triggerWeldStart`/`triggerWeldEnd`) work for ANY order an author
 * wants, `SplitButton` being the convenience for the common one, not the only shape they support.
 * `weldEnd`/`triggerWeldEnd` here, the MIRROR of the two trees above: the trigger is now
 * LEADING (its own end edge touches the seam), the button is now TRAILING (its own start edge
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
          triggerVariant: "neutral",
          triggerSize: "md",
          triggerIconOnly: true,
          triggerWeldEnd: true,
        },
        slots: {
          items: splitButtonMenuItems(t),
        },
      },
      {
        contract: "button",
        signature: "Button.action",
        options: { variant: "solid", size: "md", weldStart: true },
        slots: { children: t("demo.splitButton.action") },
      },
    ],
  },
});
