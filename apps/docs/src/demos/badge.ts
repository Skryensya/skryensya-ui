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
    options: { tone },
    attrs: { role: "status", "aria-label": tone },
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
          options: { tone: "danger" },
          attrs: { role: "status", "aria-label": t("demo.badge.unread") },
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
          options: { tone: "success" },
          attrs: { role: "status", "aria-label": t("demo.badge.online") },
        },
      ],
    },
  ],
});
