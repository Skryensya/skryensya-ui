import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(fileURLToPath(new URL("./ComponentPreview.astro", import.meta.url)), "utf8");

describe("ComponentPreview.astro", () => {
  it("renders source tab lists as siblings below the shared code toggle", () => {
    const siblingPattern = /<div class=\{codePreviewParts\.more\}[\s\S]*?\n\s*<\/div>\n\s*<div class="sk-tabs__list"/g;

    expect([...source.matchAll(siblingPattern)]).toHaveLength(2);
  });
});
