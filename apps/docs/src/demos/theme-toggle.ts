import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The two sizes, md and sm.
 *
 * The three face labels reuse `prefs.mode*`: the same strings the site's own toggle announces in the
 * navbar. A demo of the color mode should say what the reader has already read on the real control,
 * not a second translation of it.
 */
export const themeToggleTree = (t: Translate): UsageTree => {
  const labels = {
    labelSystem: t("prefs.modeSystem"),
    labelLight: t("prefs.modeLight"),
    labelDark: t("prefs.modeDark"),
  };

  return {
    contract: "layout",
    signature: "Inline",
    options: { gap: "md" },
    children: [
      { contract: "theme-toggle", signature: "ThemeToggle", options: labels },
      { contract: "theme-toggle", signature: "ThemeToggle", options: { size: "sm", ...labels } },
    ],
  };
};
