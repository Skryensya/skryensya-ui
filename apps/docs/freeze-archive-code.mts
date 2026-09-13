/*
 * FREEZE A PAGE INTO AN ARCHIVE: its words and its generated code, both captured the day of the cut.
 *
 * A docs archive has to show what that version showed, and neither half of a page survives on its
 * own. The PROSE lives in the message tree, which people keep editing; the CODE is not stored
 * anywhere at all, because a usage tree is INPUT to the emitter and the emitter and the contract it
 * reads both move forward with the repository. Rendering an archived page from either of those live
 * sources would print today's answer under an old URL, which is the one thing the version axis
 * exists to prevent (ADR-0022).
 *
 * So this captures both, once, into a JSON the archived page reads and nothing else writes. It is
 * the miniature of the cut script: a real cut BUILDS the whole site at a tag, where every page comes
 * out frozen for free. Until that exists, this freezes the one page we archive by hand.
 *
 *   pnpm --filter @skryensya/docs exec tsx freeze-archive-code.mts
 *   pnpm --filter @skryensya/docs exec tsx freeze-archive-code.mts --check
 *
 * `--check` reports when the stored capture no longer matches the living page. On a real archive
 * that is NOT a thing to fix by re-running: it means the page moved on since the cut, which is what
 * an archive is for. It exists so a deliberate re-freeze (this version is still the working one) is
 * a decision someone takes rather than a drift nobody notices.
 */
import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as buttonDemos from "./src/demos/button.ts";
import { defaultLocale, locales, ui, type Locale } from "./src/i18n/ui.ts";

/*
 * The translator, rebuilt here rather than imported from `src/i18n`. That module reaches the page
 * directory through `import.meta.glob`, which is Vite's and does not exist under plain `tsx`; this
 * script only needs the dictionary lookup, which is the whole of `useTranslations` minus the glob.
 * Kept identical on purpose, fallback included, so a snippet captures the same string the page
 * renders.
 */
type Translate = (key: string, vars?: Record<string, string>) => string;
const translator = (locale: Locale): Translate =>
  function t(key, vars) {
    const table = ui[locale] as Record<string, string>;
    const fallback = ui[defaultLocale] as Record<string, string>;
    const value = table[key] ?? fallback[key] ?? key;
    return vars ? value.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match) : value;
  };

/** One archived page: where its content comes from, and where the capture goes. */
const ARCHIVES = [
  {
    version: "0.0.1-dev",
    id: "button",
    out: "src/components/pages/frozen/v0.0.1-dev/button.frozen.json",
    /** The live demos module. Every exported tree factory is emitted. */
    demos: buttonDemos as Record<string, unknown>,
    /** The message keys this page shows, captured verbatim in every locale. */
    keyPrefix: "button.",
    /*
     * Some factories take a second argument, a locale-owned href the page passes in. The value is
     * the one the live page uses, so the emitted snippet says what the real page said.
     */
    extraArg: "/first-component",
  },
];

const check = process.argv.includes("--check");
const here = import.meta.dirname;
let stale = false;

/** A tree factory's output, whichever of the two shapes the module exports. */
function buildTree(value: unknown, t: Translate, extraArg: string): UsageTree | undefined {
  if (typeof value !== "function") return undefined;
  for (const args of [[t], [t, extraArg]]) {
    try {
      const tree = (value as (...a: unknown[]) => UsageTree)(...args);
      if (tree && typeof tree === "object" && "contract" in tree) return tree;
    } catch {
      /* Wrong arity for this factory: try the other shape before giving up. */
    }
  }
  return undefined;
}

for (const archive of ARCHIVES) {
  /* THE WORDS, per locale, exactly as they read today. */
  const copy = Object.fromEntries(
    locales.map((locale) => [
      locale,
      Object.fromEntries(
        Object.entries(ui[locale] as Record<string, string>).filter(([key]) => key.startsWith(archive.keyPrefix)),
      ),
    ]),
  ) as Record<Locale, Record<string, string>>;

  /*
   * THE CODE, per locale too, and that is not redundancy: a snippet carries the demo's own labels
   * ("Acción" / "Action"), so the emitted source genuinely differs between the two.
   */
  const snippets: Record<string, Record<string, { html: string; react: string }>> = {};
  for (const locale of locales) {
    const t = translator(locale);
    const perTree: Record<string, { html: string; react: string }> = {};
    for (const [name, value] of Object.entries(archive.demos)) {
      const tree = buildTree(value, t, archive.extraArg);
      if (!tree) continue;
      perTree[name] = {
        /* `fillDefaults: false` for the reason ComponentPreview uses it: the panel shows what an
         * author WRITES, not the fully expanded attribute set. */
        html: emitMarkup(tree, { fillDefaults: false }),
        react: emitReactSource(tree, { component: `${name.replace(/Tree$/, "")}Example` }).component,
      };
    }
    snippets[locale] = perTree;
  }

  const document = {
    /* Stamped, because the whole value of this file is that it is old on purpose. */
    version: archive.version,
    id: archive.id,
    capturedAt: new Date().toISOString().slice(0, 10),
    copy,
    snippets,
  };

  const path = join(here, archive.out);
  const next = `${JSON.stringify(document, null, 2)}\n`;
  const current = (() => {
    try {
      return readFileSync(path, "utf8");
    } catch {
      return "";
    }
  })();

  /* `capturedAt` is the one field allowed to differ: re-running on another day must not read as a
   * change to the content, or `--check` would fail every morning. */
  const withoutDate = (value: string) => value.replace(/"capturedAt": "[^"]*",\n/, "");

  if (check) {
    if (withoutDate(current) !== withoutDate(next)) {
      console.error(`  moved on: ${archive.out} no longer matches the living page.`);
      stale = true;
    } else {
      console.log(`  ${archive.out}: matches the living page.`);
    }
    continue;
  }

  writeFileSync(path, next);
  const count = Object.keys(snippets[locales[0]!] ?? {}).length;
  console.log(`  ${archive.out}: ${count} trees x ${locales.length} locales, plus the copy.`);
}

if (stale) process.exit(1);
