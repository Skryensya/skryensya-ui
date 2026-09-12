/*
 * ONE-SHOT SEED for `ComponentContract.hooks`.
 *
 * Q3 settled that the hook list is AUTHORED, not generated: a list derived from the stylesheet can
 * never disagree with it, and a check that cannot fail is not a check. This script writes the FIRST
 * draft only, so 1,105 hook names do not have to be typed by hand with omissions nobody can see.
 * The moment it lands the list is authored. It is deliberately NOT wired into any build: re-running
 * it would overwrite edits rather than reconcile them, which is exactly the failure `hooks` exists
 * to prevent. Same shape, and the same reasoning, as `seed-changelogs.ts` next door.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseTokens, CSS_DIR } from "@skryensya/core/parse";
import { publishedBySheet } from "./hooks.js";

const root = process.argv[2] ?? process.cwd();
const dry = process.argv.includes("--dry");
const srcDir = join(root, "packages/core/src");

/*
 * PUBLISHED, not merely declared, and it shares that definition with the gate rather than keeping
 * its own. The first version of this script had its own, looser rule ("every `--sk-*` the sheet
 * declares"), which recorded a component tuning someone else's hook as publishing it: 17 contracts
 * ended up claiming `--sk-icon-size`. Correcting the data without correcting this script would have
 * left a landmine that silently re-introduced the bug the next time anyone ran it.
 */
const corpus = parseTokens(CSS_DIR);
const published = publishedBySheet(corpus.files as readonly { rel?: string; css?: string }[]);
const hooksBySheet = new Map<string, string[]>();
for (const [rel, hooks] of published) hooksBySheet.set(rel, [...hooks].sort());

/** The end of the object literal that starts at `open`. */
function closeOf(source: string, open: number): number {
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return i;
  }
  return -1;
}

let files = 0, seeded = 0, total = 0;
const skipped: string[] = [];

for (const name of readdirSync(srcDir).filter((f) => f.endsWith(".ts") && !f.includes(".test."))) {
  const path = join(srcDir, name);
  let source = readFileSync(path, "utf8");
  let changed = false;

  /* Re-scan per contract: every insertion moves the offsets after it. */
  for (;;) {
    const consts = [...source.matchAll(/export const (\w+Contract) = \{/g)];
    let didOne = false;

    for (const m of consts) {
      const open = source.indexOf("{", m.index!);
      const end = closeOf(source, open);
      const body = source.slice(open, end);
      if (/\n\s{2}hooks:/.test(body)) continue; // already seeded

      const idM = body.match(/\n\s{2}id:\s*"([^"]+)"/);
      const cssM = body.match(/\n\s{2}css:\s*"@skryensya\/core\/([^"]+)"/);
      if (!idM || !cssM) { skipped.push(`${name} ${m[1]}: no id or css`); continue; }

      const names = hooksBySheet.get(cssM[1]);
      if (!names?.length) { skipped.push(`${idM[1]}: ${cssM[1]} declares no --sk-* hook`); continue; }

      /*
       * Anchor to where the `parts` VALUE ends, not to its first line. `parts: badgeParts,` is one
       * line, but `parts: { ... }` spans many, and matching the line put `hooks` INSIDE the parts
       * object, where it typechecks as a part whose value is an array.
       */
      const partsM = body.match(/\n(\s{2})parts:[ \t]*/);
      if (!partsM) { skipped.push(`${idM[1]}: no parts: line to anchor to`); continue; }

      const indent = partsM[1];
      let cursor = partsM.index! + partsM[0].length;
      let depth = 0;
      while (cursor < body.length) {
        const ch = body[cursor];
        if (ch === "{" || ch === "[" || ch === "(") depth++;
        else if (ch === "}" || ch === "]" || ch === ")") depth--;
        else if (ch === "," && depth === 0) break;
        cursor++;
      }
      const eol = body.indexOf("\n", cursor);
      if (eol === -1) { skipped.push(`${idM[1]}: parts value never closes`); continue; }

      const list = names.map((h) => `${indent}  "${h}",`).join("\n");
      const insertAt = open + eol + 1;
      source = source.slice(0, insertAt) + `${indent}hooks: [\n${list}\n${indent}],\n` + source.slice(insertAt);
      seeded++; total += names.length; changed = true; didOne = true;
      break;
    }
    if (!didOne) break;
  }

  if (changed) { files++; if (!dry) writeFileSync(path, source); }
}

console.log(`${dry ? "[dry] " : ""}files: ${files}   contracts seeded: ${seeded}   hooks written: ${total}`);
for (const s of skipped) console.log("   skipped " + s);
