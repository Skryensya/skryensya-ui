import type { UsageTree } from "@skryensya/core/usage-tree";
import type { HookControl } from "../lib/hook-control";
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
  children: {
    contract: "box",
    signature: "Box",
    options: { surface: "surface", border: "subtle", padding: "lg" },
    /*
     * Busy and ready are stacked in the same grid cell (loader.css) instead of hidden siblings:
     * the box then always sizes to the taller of the two, so the stage never resizes between them.
     */
    attrs: { "data-loader-stage": "", "data-loader-state": "busy" },
    children: [
      {
        contract: "loader",
        signature: "Loader",
        options: { size: "lg", label: t("demo.loader.busy") },
        attrs: { "data-loader-busy": "" },
      },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm", align: "center" },
        attrs: { "data-loader-ready": "" },
        children: [
          {
            contract: "typography",
            signature: "Text",
            children: t("demo.loader.ready"),
          },
          {
            contract: "button",
            signature: "Button.action",
            attrs: { "data-loader-start": "" },
            children: t("demo.loader.start"),
          },
        ],
      },
    ],
  },
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

/** `HookPlayground` proof of concept: the plain Loader (no size option, so it starts at the same
 *  20px / 2px / 0.96s the Style hooks table already shows resolved above it). */
export const loaderHookPlaygroundTree = (t: Translate): UsageTree => ({
  contract: "loader",
  signature: "Loader",
  options: { label: t("demo.loader.busy") },
});

export const loaderHookPlaygroundControls: readonly HookControl[] = [
  { hook: "--sk-loader-size", label: "--sk-loader-size", type: "range", unit: "px", min: 12, max: 64, step: 2, default: "20" },
  { hook: "--sk-loader-stroke-width", label: "--sk-loader-stroke-width", type: "range", unit: "px", min: 1, max: 8, step: 1, default: "2" },
  { hook: "--sk-loader-track-color", label: "--sk-loader-track-color", type: "color", default: "#94a3b8" },
  /* 1s, not the token's exact 0.96s: a value off the 0.1 step gets silently snapped by the input
     on parse, and the output would then show a number the slider itself never lands on again. */
  { hook: "--sk-loader-duration", label: "--sk-loader-duration", type: "range", unit: "s", min: 0.2, max: 3, step: 0.1, default: "1" },
];
