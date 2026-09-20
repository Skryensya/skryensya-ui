import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Selector traps the token linter cannot see: it reads TOKENS (refs, tiers, modes, contrast, names),
 * not the shape of a selector. These are the few selector mistakes that look right, pass every type
 * check and are only visible on a real page, so they are guarded from the source instead.
 */

const CSS_DIR = join(import.meta.dirname, "..", "css");

function stylesheets(dir: string): { path: string; css: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return stylesheets(path);
    if (!entry.isFile() || !/\.(css|scss)$/.test(entry.name)) return [];
    // Comments out first: these files explain the very traps below, in prose that would match them.
    const css = readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/[^\n]*/g, "$1");
    return [{ path, css }];
  });
}

/** `:indeterminate`, with whatever the selector said the input was. */
const INDETERMINATE = /([\w[\]="'-]*)\s*:indeterminate/g;

describe("stylesheet selectors", () => {
  /*
   * A RADIO matches `:indeterminate` while NO radio in its group is checked, which is the resting
   * state of every radio group before the reader picks anything. So a rule meant for a checkbox's
   * third state has to say `input[type="checkbox"]:indeterminate`; unqualified, it paints every
   * option of an untouched radio group as if it were the chosen one (measured on Tile, 2026-09-17:
   * all three options of a TileRadioGroup took the selected border until one was picked).
   */
  it("only asks for :indeterminate on something that says it is a checkbox", () => {
    const offenders: string[] = [];
    for (const { path, css } of stylesheets(CSS_DIR)) {
      for (const [match, subject] of css.matchAll(INDETERMINATE)) {
        if (/checkbox/i.test(subject)) continue;
        offenders.push(`${path.slice(CSS_DIR.length + 1)}: ${match.trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

/*
 * A DELIBERATE DUPLICATE, HELD TO ITS COPY.
 *
 * Steps draws bars instead of discs down two paths: the `segments` appearance, which is a selector,
 * and a pinned horizontal rail on a phone, which is a media query. The look is the same look, but a
 * selector and a media query cannot be joined into one rule, so it is written twice.
 *
 * Both ways out were measured and cost more than the duplication. A `@container style()` on a flag
 * property does join them, and Lightning CSS passes it through untouched - but `@container` adds no
 * specificity, and the rules these must beat are `(0,3,0)`, so every selector inside would have to
 * be inflated past what it means. Routing the differences through custom properties instead moves
 * the indirection onto the base rules, where fifteen declarations would grow a `var()` to serve one
 * appearance. Both trade a duplication a reader can see for a mechanism they cannot.
 *
 * So the copies stay, and this holds them level: the risk duplication actually carries is that one
 * side is edited and the other is not, and that is the part a test can own.
 */
const STEPS = join(CSS_DIR, "components", "steps.css");

/** Every `selector { ... }` in source order, tagged with the at-rules it sits inside. */
function flatRules(src: string): { selector: string; body: string; inside: string[] }[] {
  const out: { selector: string; body: string; inside: string[] }[] = [];
  const walk = (text: string, inside: string[]): void => {
    let head = "";
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== "{") {
        if (text[i] === "}") head = "";
        else head += text[i];
        continue;
      }
      let depth = 1;
      const start = ++i;
      while (i < text.length && depth > 0) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}" && --depth === 0) break;
        i++;
      }
      const block = text.slice(start, i);
      const selector = head.trim();
      head = "";
      if (selector.startsWith("@")) walk(block, [...inside, selector]);
      else out.push({ selector, body: block, inside });
    }
  };
  walk(src, []);
  return out;
}

const declarations = (body: string): string[] =>
  body
    .split(";")
    .map((d) => d.trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .sort();

describe("steps bars are written twice and must say the same thing", () => {
  it("the phone rail's segment rules match the segments appearance, rule for rule", () => {
    const css = readFileSync(STEPS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const byAppearance = new Map<string, string[]>();
    const onPhone = new Map<string, string[]>();

    for (const { selector, body, inside } of flatRules(css)) {
      const phone = inside.some((at) => /@media[^{]*width\s*<\s*36rem/.test(at));
      // `(?!\[)` drops `[data-appearance="segments"][data-orientation="vertical"]`, which turns the
      // bar on its side. That is the appearance's own variant and has no rail twin by design.
      const appearance = selector.match(/^\.sk-steps\[data-appearance="segments"\](?!\[)(.*)$/s);
      const rail = selector.match(/^\.sk-steps\[data-orientation="horizontal"\](.*)$/s);
      if (!phone && appearance) byAppearance.set(appearance[1].trim(), declarations(body));
      if (phone && rail) onPhone.set(rail[1].trim(), declarations(body));
    }

    // If either side stops being found the guard has gone blind, which is worse than a drift.
    expect(onPhone.size).toBeGreaterThan(5);
    expect([...onPhone.keys()].sort()).toEqual([...byAppearance.keys()].sort());
    for (const [suffix, phoneDecls] of onPhone) {
      expect({ suffix, decls: phoneDecls }).toEqual({ suffix, decls: byAppearance.get(suffix) });
    }
  });
});
