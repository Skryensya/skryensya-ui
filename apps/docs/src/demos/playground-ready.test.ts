import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { describe, expect, it } from "vitest";
import { locales, useTranslations } from "../i18n";

/*
 * EVERY DEMO TREE STANDS ON ITS OWN, because the playground calls it that way.
 *
 * `apps/playground` globs this directory and calls each `*Tree` export with `t` alone: it has no
 * page to borrow hrefs, a locale or options from. A factory that needs a second argument and has no
 * default for it throws, or returns a tree with `href: undefined`, and the playground drops it
 * silently. That is how Combobox, Megamenu, three NavLists and a dozen more went missing from it:
 * a hand-kept table of extra arguments there had stopped keeping up.
 *
 * So the rule lives here, next to the demos: defaults for everything past `t` (`placeholderHrefs`,
 * `localeOf(t)`), and this test fails the moment a new demo forgets.
 *
 * `card` is the one module whose factories take card DATA rather than `t`; the playground hands it
 * that data by module, so it is not held to this.
 */
const modules = import.meta.glob<Record<string, unknown>>(["./*.ts", "!./*.test.ts"], { eager: true });
const EXEMPT_MODULES = new Set(["card"]);

const cases = Object.entries(modules)
  .map(([path, module]) => [path.slice(2, -3), module] as const)
  .filter(([id]) => !EXEMPT_MODULES.has(id))
  .flatMap(([id, module]) =>
    Object.entries(module)
      .filter(([name, value]) => name.endsWith("Tree") && typeof value === "function")
      .map(([name, value]) => [`${id}:${name}`, value as (t: unknown) => UsageTree] as const),
  );

describe("every demo tree works when called with t alone", () => {
  it.each(locales.flatMap((locale) => cases.map(([name, factory]) => [locale, name, factory] as const)))(
    "%s %s",
    (locale, _name, factory) => {
      const tree = factory(useTranslations(locale));
      expect(tree && typeof tree === "object" && "contract" in tree).toBe(true);
      const errors = validateUsageTree(tree).problems.filter((problem) => problem.severity === "error");
      expect(errors.map((problem) => problem.message)).toEqual([]);
    },
  );
});
