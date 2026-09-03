import { describe, expect, it } from "vitest";
import { ui } from "./ui";

/*
 * THE PARITY SEAM `t()` NEVER HAD. `useTranslations`'s own fallback (`ui[locale][key] ?? ui[
 * defaultLocale][key] ?? key`, i18n/index.ts) means a key present in `es` but absent from `en`
 * degrades SILENTLY: an English reader gets the Spanish sentence, with no build error, no type
 * error, and — until this file — no test. That is not hypothetical: the entire `switchPage.*`
 * group (description, lede, body, tileTitle, tileBody1/2, contractItem1-5, nine keys) existed in
 * `es` and was missing from `en` outright, caught only by writing this test and reading the diff
 * it produced. The fallback stays (a partially-translated page is better than a missing string),
 * but the drift that fallback was silently absorbing should fail a build instead.
 */
describe("ui.ts locale parity", () => {
  it("es and en declare exactly the same keys", () => {
    const esKeys = new Set(Object.keys(ui.es));
    const enKeys = new Set(Object.keys(ui.en));

    const missingFromEn = [...esKeys].filter((key) => !enKeys.has(key)).sort();
    const missingFromEs = [...enKeys].filter((key) => !esKeys.has(key)).sort();

    expect(missingFromEn, "keys present in es, missing from en").toEqual([]);
    expect(missingFromEs, "keys present in en, missing from es").toEqual([]);
  });

  /*
   * A key that exists on both sides but reads IDENTICAL in both is usually not "correctly
   * untranslated" (a code sample, a proper noun, a shared component name like "BackToTop") — it's
   * the other half of the same failure the test above catches: someone pasted the Spanish string
   * into the English slot, or vice versa, and both blocks end up with the SAME text instead of one
   * being absent. That failure mode wouldn't trip the key-parity check above (both keys exist), so
   * it needs its own, narrower one: flag an identical value once it is long enough that an
   * accidental duplicate is far more likely than a genuinely identical short label ("OK", "Kbd").
   *
   * NO LINGUISTIC HEURISTIC beyond length: a first pass tried excluding `<code>` spans and
   * `·`/`+`-joined lists, and every "fix" either let a real duplicate back through or excluded a
   * legitimate one by coincidence of shape. An ALLOWLIST is more honest about what it is: every
   * entry below was read once and confirmed locale-invariant on purpose (a component-name list, an
   * aspect-ratio/value enumeration, a filename), and a NEW identical-and-long key that isn't on it
   * fails loudly instead of matching a pattern by luck. Adding to this list is itself the review
   * the fuzzy version was trying to automate away.
   */
  const identicalByDesign: readonly string[] = [
    // Component-name / feature lists, `·` or `+`-joined: naming is locale-invariant on purpose.
    "cardPage.gradientNote",
    "carousel.multiNote",
    "chartsPage.analyticsNote",
    "landing.needs.data.items",
    "landing.needs.forms.items",
    "landing.needs.nav.items",
    "landing.needs.overlays.items",
    "landing.needs.selection.items",
    "landing.patterns.appNav.body",
    "landing.patterns.search.body",
    "landing.start.components.items",
    "landing.start.foundations.items",
    "landing.start.patterns.items",
    // `<code>` value/attribute enumerations: the values themselves don't translate.
    "imageFrame.contractItem2",
    "imageFrame.contractItem3",
    "imageFrame.contractItem5",
    "imageFrame.contractItem6",
    "imageFrame.contractItem7",
    // A literal filename shown as a demo prop.
    "demo.treegridStress.formatUtil",
  ];

  it("flags long strings that are byte-identical across locales, a likely copy-paste", () => {
    const MIN_SUSPICIOUS_LENGTH = 40;
    const allowed = new Set(identicalByDesign);
    const esKeys = Object.keys(ui.es) as (keyof typeof ui.es)[];

    const suspicious = esKeys
      .filter((key) => key in ui.en)
      .filter((key) => ui.es[key] === ui.en[key])
      .filter((key) => ui.es[key].length >= MIN_SUSPICIOUS_LENGTH)
      .filter((key) => !allowed.has(key))
      .sort();

    expect(suspicious, "keys whose es and en values are identical and look untranslated").toEqual([]);
  });

  it("keeps the allowlist itself honest: every entry is still identical and still present", () => {
    const stale = identicalByDesign.filter((key) => {
      const typedKey = key as keyof typeof ui.es;
      return !(typedKey in ui.es) || !(typedKey in ui.en) || ui.es[typedKey] !== ui.en[typedKey];
    });

    expect(stale, "allowlist entries that no longer exist or no longer match — remove them").toEqual([]);
  });
});
