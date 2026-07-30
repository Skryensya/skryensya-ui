import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Sizes and speeds convert. Simulation (`js` + demo DOM) and contexts (`data-multicol` + heavy
 * composition) stay authored.
 *
 * Specimens use Box + Stack + Text rather than docs-only `loader-specimen*` classes — same teaching
 * shape, reachable parts. Size/speed names (`sm`, `fast`, …) stay written.
 */

function specimen(loader: UsageTree, name: string, description: string): UsageTree {
  return {
    contract: "box",
    signature: "Box",
    options: { surface: "surface", border: "subtle", padding: "lg" },
    children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm", align: "center" },
      children: [
        loader,
        {
          contract: "typography",
          signature: "Text",
          options: { weight: "label" },
          children: name,
        },
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          children: description,
        },
      ],
    },
  };
}

/** sm · md · lg — decorative until the large one, which owns the status announcement. */
export const loaderSizesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  attrs: { role: "group", "aria-label": t("demo.loader.sizesLabel") },
  children: [
    specimen(
      { contract: "loader", signature: "Loader", options: { size: "sm" } },
      "sm",
      t("demo.loader.size.sm"),
    ),
    specimen(
      { contract: "loader", signature: "Loader", options: { size: "md" } },
      "md",
      t("demo.loader.size.md"),
    ),
    specimen(
      {
        contract: "loader",
        signature: "Loader",
        options: { size: "lg", label: t("demo.loader.loadingResults") },
      },
      "lg",
      t("demo.loader.size.lg"),
    ),
  ],
});

/** fast · normal · slow on the bars variant. */
export const loaderSpeedsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  attrs: { role: "group", "aria-label": t("demo.loader.speedsLabel") },
  children: [
    specimen(
      {
        contract: "loader",
        signature: "Loader",
        options: { size: "lg", variant: "bars", speed: "fast" },
      },
      "fast",
      t("demo.loader.speed.fast"),
    ),
    specimen(
      {
        contract: "loader",
        signature: "Loader",
        options: { size: "lg", variant: "bars", speed: "normal" },
      },
      "normal",
      t("demo.loader.speed.normal"),
    ),
    specimen(
      {
        contract: "loader",
        signature: "Loader",
        options: {
          size: "lg",
          variant: "bars",
          speed: "slow",
          label: t("demo.loader.syncing"),
        },
      },
      "slow",
      t("demo.loader.speed.slow"),
    ),
  ],
});
