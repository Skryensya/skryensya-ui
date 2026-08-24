import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * One Wrapper, not four. `size="sm"` is the only ceiling that reads as a ceiling inside this
 * page's own stage: `md`, `lg` and `full` all just fill it, because `<main>` is itself
 * `data-size="md"` and tops out around 907px, so a demo built to compare all four ends up
 * showing three identical boxes. A single `sm` column with real content shows the one thing a
 * usage tree can actually demonstrate: a centred measure with visible gutters on either side.
 * The other three sizes are a fact about a number, not about layout, and stay a table below.
 */
export const wrapperTree = (t: Translate): UsageTree => ({
  contract: "wrapper",
  signature: "Wrapper",
  options: { wrapperSize: "sm" },
  children: {
    contract: "box",
    signature: "Box",
    options: { surface: "raised", border: "subtle", padding: "lg" },
    children: [
      { contract: "typography", signature: "Heading", children: t("demo.wrapper.title") },
      { contract: "typography", signature: "Text", children: t("demo.wrapper.body") },
    ],
  },
});
