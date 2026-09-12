import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

const tones = ["neutral", "accent", "success", "warning", "danger"] as const;

/*
 * TWO SPECIMENS, because `sk-badge` is one class with two shapes and a diagram that draws one of
 * them is making a claim about the part that is false.
 *
 * A pulsing dot in a holder's corner and a standalone tag with text are the same root class,
 * `BadgeDot` and `Badge`: one has no content and borrows its position from the holder, the other is
 * a pill in the flow that holds whatever it is given. Shown alone, either one teaches that
 * `sk-badge` means that one. Side by side, with `match: "all"` sending a leader to each, the name
 * covers what it actually covers, and the pair carries the second lesson for free: the tag needs no
 * holder, the dot is the one that does.
 *
 * `sk-badge-holder` stays SINGULAR, and the contrast is the point of putting them in one drawing: a
 * holder is a corner to hang a dot on, so only the left specimen has one, and its single leader
 * says which of the two is being talked about. Two kinds of name, told apart by how many lines
 * leave the bubble.
 */
export const badgeAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("badge.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "layout",
      signature: "Inline",
      /* `lg` rather than the `md` the tone rows use: these two are far enough apart that the leaders
         fanning out to them read as two separate destinations, not as one wide box. `end` so the
         tag sits on the control's baseline edge instead of floating level with its middle. */
      options: { gap: "lg", inlineAlign: "end" },
      children: [
        {
          contract: "badge",
          signature: "BadgeHolder",
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { iconOnly: true, variant: "ghost" },
              attrs: { "aria-label": t("demo.badge.settings") },
              children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
            },
            {
              contract: "badge",
              signature: "BadgeDot",
              options: { tone: "danger", label: t("demo.badge.unread"), pulse: true },
            },
          ],
        },
        {
          contract: "badge",
          signature: "Badge",
          options: { tone: "accent" },
          children: t("demo.badge.anatomyTag"),
        },
      ],
    },
    items: [
      namePart(".sk-badge-holder", "inline-start"),
      /*
       * FROM ABOVE, so both leaders come DOWN onto what they name. Which edge a leader leaves and
       * which edge it enters are both decided by the gutter the label is in (`leaderTarget`), so
       * naming the pair from an inline gutter means entering each ring from its side: the dot, which
       * is a circle at the holder's top corner with a tag sitting a row below it, then gets a line
       * arriving at its lower corner after passing the tag, and the reader has to work out which of
       * the two the line stopped at. From the block-start gutter both leaders drop out of the
       * bubble's underside onto the top edge of each ring, and neither one goes near the other's.
       *
       * OUTSIDE, because one of the two things this name covers is 8px across. An inset ring on the
       * dot is a 4px square drawn inside a circle barely twice its size: at a hairline stroke that
       * is a smudge on the dot rather than a mark around it, and the leader appears to end at
       * nothing. Outside, both shapes get a ring that reads as one, which is the point of the label
       * covering both.
       */
      namePart(".sk-badge", "block-start", { match: "all", ringPlacement: "offset", ringDistance: 3 }),
    ],
  },
});


export const badgeDotsTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md" },
  children: tones.map((tone) => ({
    contract: "badge",
    signature: "BadgeDot",
    options: { tone, label: tone },
  })),
});

export const badgeSmallTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "center" },
  children: [
    { contract: "badge", signature: "Badge", options: { tone: "neutral" }, children: "Default" },
    { contract: "badge", signature: "Badge", options: { tone: "neutral", size: "sm" }, children: "Small" },
  ],
});

export const badgePulseTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md" },
  children: tones.map((tone) => ({
    contract: "badge",
    signature: "BadgeDot",
    options: { tone, label: tone, pulse: true },
  })),
});

export const badgeHoldersTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "lg", inlineAlign: "end" },
  children: [
    {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { iconOnly: true, variant: "ghost" },
          attrs: { "aria-label": t("demo.badge.settings") },
          children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
        },
        {
          contract: "badge",
          signature: "BadgeDot",
          options: { tone: "danger", label: t("demo.badge.unread"), pulse: true },
        },
      ],
    },
    {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { name: "Ana Solís" },
          children: "AS",
        },
        {
          contract: "badge",
          signature: "BadgeDot",
          options: { tone: "success", label: t("demo.badge.online"), pulse: true },
        },
      ],
    },
  ],
});
