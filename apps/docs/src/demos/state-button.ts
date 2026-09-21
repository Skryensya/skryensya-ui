import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

export { default as stateButtonDemoScript } from "./scripts/state-button-demos.ts?raw";

export const stateButtonBasicTree = (t: Translate): UsageTree => ({
  contract: "state-button",
  signature: "StateButton",
  options: { current: "grid" },
  attrs: {
    id: "demo-state-button-view-mode",
    "aria-label": t("demo.state-button.viewMode.grid"),
    "data-variant": "ghost",
    "data-size": "sm",
  },
  slots: {
    faces: [
      { options: { name: "grid", icon: "calendar" }, slots: {} },
      { options: { name: "list", icon: "menu" }, slots: {} },
      { options: { name: "compact", icon: "zoom-out" }, slots: {} },
    ],
  },
});

export const stateButtonThemeToggleTree = (t: Translate): UsageTree => ({
  contract: "state-button",
  signature: "StateButton",
  options: { current: "light" },
  attrs: {
    id: "demo-state-button-theme",
    "aria-label": t("demo.state-button.themeToggle.title"),
    "data-variant": "ghost",
    "data-size": "sm",
  },
  slots: {
    faces: [
      { options: { name: "light", icon: "mode-light" }, slots: {} },
      { options: { name: "dark", icon: "mode-dark" }, slots: {} },
      { options: { name: "system", icon: "mode-system" }, slots: {} },
    ],
  },
});

export const stateButtonCopyTree = (t: Translate): UsageTree => ({
  contract: "state-button",
  signature: "StateButton",
  options: { current: "ready" },
  attrs: {
    id: "demo-state-button-copy",
    "aria-label": t("demo.state-button.copy.title"),
    "data-variant": "ghost",
    "data-size": "sm",
  },
  slots: {
    faces: [
      { options: { name: "ready", icon: "copy" }, slots: {} },
      { options: { name: "copied", icon: "check" }, slots: {} },
    ],
  },
});
