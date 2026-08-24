import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { describe, expect, it } from "vitest";
import { useTranslations, type Translate } from "../../i18n";
import { appShellExplorerTree, appShellTree } from "../app-shell";
import { checkoutTree } from "./checkout";
import { dashboardTree } from "./dashboard";
import { docsSiteTree } from "./docs-site";
import { marketingTree } from "./marketing";

/*
 * EVERY TEMPLATE, AGAINST ITS CONTRACTS.
 *
 * `emitMarkup` is not this check. The emitter's job is to turn a tree into markup and it will
 * happily emit a tree the contracts reject — which is exactly how `docs-site` shipped with three
 * `ListItem.leading` slots holding text, a slot that only accepts `Icon` or `Avatar.initials`. It
 * rendered, it looked right, and it was invalid. `validateUsageTree` is the authority, so it runs
 * here rather than being something someone remembers to do by hand.
 *
 * ADVISORIES ARE NOT FAILURES, deliberately. An advisory is the validator saying a rule cannot be
 * settled from the tree alone (the table one below fires on every node of any `Table`, asking for
 * the `resizeLabel` that only a `resizableColumns` table actually needs). Failing on those would
 * make this gate noise, and noise gets deleted.
 */
const t: Translate = useTranslations("es");

const templates: Record<string, () => ReturnType<typeof marketingTree>> = {
  "app-shell": () => appShellTree(t),
  "app-shell-explorer": () => appShellExplorerTree(t),
  marketing: () => marketingTree(t),
  "docs-site": () => docsSiteTree(t),
  dashboard: () => dashboardTree(t, "es"),
  checkout: () => checkoutTree(t, "es"),
};

describe("templates", () => {
  for (const [name, build] of Object.entries(templates)) {
    it(`${name} is a valid usage tree`, () => {
      const result = validateUsageTree(build());
      const errors = (result.problems ?? []).filter((problem) => problem.severity === "error");
      // The formatted list, not a bare boolean: a failure here should say WHICH slot and where.
      expect(errors.map((problem) => `${problem.path}: ${problem.message}`)).toEqual([]);
      expect(result.valid).toBe(true);
    });
  }

  /*
   * The English render is a real second consumer, not a formality: a template that reads its copy
   * through `t` can only break here by a key that exists in Spanish and not in English, and `t`
   * falls back silently to the Spanish string rather than throwing. Comparing the two trees catches
   * the case where the fallback fired for every string — a template nobody translated at all.
   */
  it("every template renders in both locales", () => {
    const en = useTranslations("en");
    const built = {
      marketing: [marketingTree(t), marketingTree(en)],
      "docs-site": [docsSiteTree(t), docsSiteTree(en)],
      dashboard: [dashboardTree(t, "es"), dashboardTree(en, "en")],
      checkout: [checkoutTree(t, "es"), checkoutTree(en, "en")],
    };
    for (const [name, [spanish, english]] of Object.entries(built)) {
      expect(JSON.stringify(english), `${name} is not translated`).not.toEqual(
        JSON.stringify(spanish),
      );
    }
  });
});
