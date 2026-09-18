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
