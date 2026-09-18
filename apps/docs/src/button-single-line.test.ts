import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/*
 * A BUTTON IS ONE LINE, and the docs must not break that from the outside.
 *
 * `button.css` decides a label never wraps (`white-space: nowrap`, a minimum height sized for one
 * line). The docs compose `sk-button` by hand in places (the pager, "report an issue"), and the easy
 * way to add a caption to one of those is to stack it INSIDE the button: a wrapper holding two text
 * spans, plus a docs rule that loosens the height. That turns the caption into part of the hit area
 * and the control into a two-line box. A caption belongs outside the button, above or beside it.
 *
 * Read from source, like the other guards in this app: no render needed for a rule this mechanical.
 */
const srcDir = dirname(fileURLToPath(import.meta.url));

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );

const files = walk(srcDir);
const markupFiles = files.filter((f) => /\.(astro|tsx|ts|svelte)$/.test(f) && !/\.test\.tsx?$/.test(f));
const styleFiles = files.filter((f) => /\.(css|scss)$/.test(f));

const buttonOpenTag = /<(a|button)\b[^>]*\bclass(?:Name)?=["'{`][^"'`}]*\bsk-button(?![\w-])[^>]*>/g;

interface HandRolledButton {
  where: string;
  className: string;
  body: string;
}

const buttons: HandRolledButton[] = markupFiles.flatMap((file) => {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(buttonOpenTag)].flatMap((match) => {
    const [openTag, tag] = match;
    const start = match.index + openTag.length;
    const tags = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
    tags.lastIndex = start;
    let depth = 1;
    for (let next = tags.exec(source); next; next = tags.exec(source)) {
      if (!next[1]) depth++;
      else if (--depth === 0) {
        const line = source.slice(0, match.index).split("\n").length;
        return [
          {
            where: `${relative(srcDir, file)}:${line}`,
            className: openTag.match(/class(?:Name)?=["'{`]([^"'`}]*)/)?.[1] ?? "",
            body: source.slice(start, next.index),
          },
        ];
      }
    }
    return [];
  });
});

/** Literal text or an interpolation, the two ways a label reaches the page. */
const carriesText = (inner: string) =>
  /\{|\$\{/.test(inner) || inner.replace(/<[^>]*>/g, "").trim() !== "";

/** A span directly holding two or more text-bearing spans: a label stacked in lines. */
function stacksText(body: string): boolean {
  for (const wrapper of body.matchAll(/<span\b[^>]*>/g)) {
    let depth = 1;
    let textChildren = 0;
    const spans = /<(\/?)span\b[^>]*>/g;
    spans.lastIndex = wrapper.index + wrapper[0].length;
    let childStart = -1;
    for (let next = spans.exec(body); next; next = spans.exec(body)) {
      if (!next[1]) {
        if (++depth === 2) childStart = next.index + next[0].length;
      } else {
        if (--depth === 0) break;
        if (depth === 1 && carriesText(body.slice(childStart, next.index))) textChildren++;
      }
    }
    if (textChildren >= 2) return true;
  }
  return false;
}

/** Drops `sk-anchored` subtrees: a popover positioned off the button (CopyButton's "copied" bubble)
 *  is not in the button's line box, and its alternate texts show one at a time. */
function withoutAnchored(body: string): string {
  const open = /<span\b[^>]*\bsk-anchored\b[^>]*>/.exec(body);
  if (!open) return body;
  const spans = /<(\/?)span\b[^>]*>/g;
  spans.lastIndex = open.index + open[0].length;
  let depth = 1;
  for (let next = spans.exec(body); next; next = spans.exec(body)) {
    if (!next[1]) depth++;
    else if (--depth === 0) {
      return withoutAnchored(body.slice(0, open.index) + body.slice(next.index + next[0].length));
    }
  }
  return body;
}

describe("hand-composed sk-button markup in the docs", () => {
  it("finds the buttons it guards, so the scan is not passing over nothing", () => {
    expect(buttons.some((b) => b.className.includes("docs-page-nav__link"))).toBe(true);
    expect(buttons.some((b) => b.className.includes("docs-report-issue__link"))).toBe(true);
  });

  it("never puts block content or a stacked label inside a button", () => {
    const offenders = buttons
      .map((b) => ({ ...b, body: withoutAnchored(b.body) }))
      .filter((b) => /<(div|p|br|ul|ol|h[1-6])\b/.test(b.body) || stacksText(b.body))
      .map((b) => b.where);
    expect(offenders).toEqual([]);
  });

  it("keeps the pager's direction caption outside its button", () => {
    const pager = buttons.filter((b) => b.className.includes("docs-page-nav__link"));
    expect(pager.length).toBeGreaterThan(0);
    for (const b of pager) expect(b.body, b.where).not.toContain("docs-page-nav__direction");
  });
});

describe("docs stylesheets", () => {
  /* Only the docs' own classes: a kit class (`sk-*__toggle`) is styled by its component's own CSS. */
  const buttonClasses = [
    "sk-button",
    ...new Set(buttons.flatMap((b) => b.className.split(/\s+/).filter((c) => c.startsWith("docs-")))),
  ];
  const lineBreaking =
    /^(white-space|height|block-size|min-height|min-block-size|max-height|max-block-size|padding-block(-start|-end)?|padding-top|padding-bottom|flex-direction|flex-wrap)$/;

  it("never loosen a button's one-line box", () => {
    const offenders = styleFiles.flatMap((file) => {
      const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
      return [...css.matchAll(/([^{};]+)\{([^{}]*)\}/g)].flatMap(([, selectors, block]) => {
        const targetsButton = selectors!.split(",").some((selector) => {
          const subject = selector.trim().split(/\s+|>|\+|~/).filter(Boolean).pop() ?? "";
          return buttonClasses.some((c) => new RegExp(`\\.${c}(?![\\w-])`).test(subject));
        });
        if (!targetsButton) return [];
        return block!
          .split(";")
          .map((declaration) => declaration.split(":")[0]!.trim())
          .filter((property) => lineBreaking.test(property))
          .map((property) => `${relative(srcDir, file)}: ${selectors!.trim()} { ${property} }`);
      });
    });
    expect(offenders).toEqual([]);
  });
});
