import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Loader specimens use only published surface, layout and typography vocabulary. */

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

/** sm · md · lg: decorative until the large one, which owns the status announcement. */
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

export const loaderSimulationTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "center" },
  attrs: { "aria-label": t("demo.loader.simulation"), "data-loader-demo": "" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "lg" },
      attrs: { "data-loader-busy": "" },
      children: {
        contract: "loader",
        signature: "Loader",
        options: { size: "lg", label: t("demo.loader.busy") },
      },
    },
    {
      contract: "typography",
      signature: "Text",
      attrs: { "data-loader-ready": "", hidden: "" },
      children: t("demo.loader.ready"),
    },
    {
      contract: "button",
      signature: "Button.action",
      attrs: { "data-loader-start": "", hidden: "" },
      children: t("demo.loader.start"),
    },
  ],
});

export { default as loaderSimulationScript } from "./scripts/loader-simulation.ts?raw";

export const loaderContextsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", multicol: true },
  attrs: { "aria-label": t("demo.loader.contexts") },
  children: [
    specimen(
      {
        contract: "loader",
        signature: "Loader",
        options: { size: "lg", label: t("demo.loader.busy") },
      },
      t("demo.loader.page.title"),
      t("demo.loader.page.body"),
    ),
    specimen(
      {
        contract: "loader",
        signature: "Loader.status",
        options: { label: t("demo.loader.busy") },
      },
      t("demo.loader.card.title"),
      t("demo.loader.card.body"),
    ),
    specimen(
      {
        contract: "loader",
        signature: "Loader",
        options: { size: "sm" },
      },
      t("demo.loader.control.title"),
      t("demo.loader.control.body"),
    ),
  ],
});
