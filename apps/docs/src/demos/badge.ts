import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const tones = ["neutral", "accent", "success", "warning", "danger"] as const;

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
