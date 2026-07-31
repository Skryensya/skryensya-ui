import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

function statCard(
  label: string,
  value: string,
  change: string,
  trend: "up" | "down" | "neutral",
  icon: "arrow-up" | "arrow-down" | "remove",
  options: Record<string, string | number | boolean> = {},
): UsageTree {
  return {
    contract: "box",
    signature: "Box",
    options: { surface: "surface", border: "subtle", padding: "lg" },
    children: {
      contract: "stat",
      signature: "Stat",
      options: { trend, ...options },
      slots: {
        label,
        value,
        change: [
          { contract: "icon", signature: "Icon", options: { name: icon, size: "sm" } },
          change,
        ],
      },
    },
  };
}

export const statCardsTree = (t: Translate, locale: "es" | "en"): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  attrs: { "aria-label": t("demo.stat.summary") },
  children: [
    statCard(t("demo.stat.income"), locale === "es" ? "48.200 €" : "$48,200", "12.5%", "up", "arrow-up"),
    statCard(t("demo.stat.orders"), "1,204", "8.2%", "up", "arrow-up"),
    statCard(t("demo.stat.cancellations"), "0.9%", "0.3", "up", "arrow-down"),
  ],
});

export const statAnimatedTree = (t: Translate, locale: "es" | "en"): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", multicol: true },
  attrs: { "aria-label": t("demo.stat.summary") },
  children: [
    statCard(
      t("demo.stat.income"),
      locale === "es" ? "48.200 €" : "48,200 USD",
      "12.5%",
      "up",
      "arrow-up",
      { animate: true, count: 48200, locale: locale === "es" ? "es-ES" : "en-US", suffix: locale === "es" ? " €" : " USD" },
    ),
    statCard(t("demo.stat.orders"), "1,204", "8.2%", "up", "arrow-up", {
      animate: true,
      count: 1204,
      locale: locale === "es" ? "es-ES" : "en-US",
    }),
    statCard(t("demo.stat.cancellations"), "0.9%", "0.3", "up", "arrow-down", {
      animate: true,
      count: 0.9,
      locale: locale === "es" ? "es-ES" : "en-US",
      suffix: "%",
      fractionDigits: 1,
    }),
  ],
});
