import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { withToolTable } from "./docs.js";
import { instructions } from "./instructions.js";
import { toolNames } from "./tools.js";

/*
 * DOCUMENTATION DRIFT, caught mechanically. The previous README described three tools after the
 * server had four, the eval system prompt taught a catalogue-first workflow, and nothing noticed.
 * Each check below compares prose against the declaration it describes.
 */

const repo = join(import.meta.dirname, "..", "..", "..");
const read = (path: string) => readFileSync(join(repo, path), "utf8");

/*
 * Files that describe the CURRENT MCP surface to a person or to a model. `docs/ai-ui-platform.md` is
 * mostly a dated log (what shipped in which phase, what a run measured), and history is not drift, so
 * only its section on the current API is held to this.
 */
const describing: Record<string, (text: string) => string> = {
  "packages/mcp/README.md": (text) => text,
  "evals/README.md": (text) => text,
  "evals/agent/system-prompt.ts": (text) => text,
  "evals/case.ts": (text) => text,
  "evals/agent/harness.ts": (text) => text,
  "evals/agent/providers.ts": (text) => text,
  "evals/agent/claude-code-provider.ts": (text) => text,
  "README.md": (text) => text,
  "docs/ai-ui-platform.md": (text) => {
    const start = text.indexOf("## 6. La API del MCP");
    expect(start, "ai-ui-platform.md lost its MCP API section").toBeGreaterThan(-1);
    return text.slice(start, text.indexOf("\n## ", start + 1));
  },
};
const currentText = (file: string) => describing[file]!(read(file));

describe("the README", () => {
  it("carries the tool table rendered from the declarations (run `pnpm --filter @skryensya/mcp docs`)", () => {
    const readme = read("packages/mcp/README.md");
    expect(readme).toBe(withToolTable(readme));
  });

  it("documents every environment variable the HTTP server reads", () => {
    const source = read("packages/mcp/src/http-app.ts");
    const readme = read("packages/mcp/README.md");
    const variables = [...new Set([...source.matchAll(/env\.([A-Z_]+)/g)].map((match) => match[1]!))];
    expect(variables.length).toBeGreaterThan(4);
    for (const variable of variables) expect(readme, variable).toContain(`\`${variable}\``);
  });
});

describe("what a model is told", () => {
  it("names every public tool in the server instructions", () => {
    for (const name of toolNames) expect(instructions).toContain(name);
  });

  it("names every public tool in the eval system prompt, so the measurement sees the real surface", () => {
    const prompt = read("evals/agent/system-prompt.ts");
    for (const name of toolNames) expect(prompt, name).toContain(name);
  });
});

describe("stale descriptions", () => {
  it("no document counts the tools, since the count is what went stale", () => {
    for (const file of Object.keys(describing)) {
      expect(currentText(file), file).not.toMatch(/\b(two|three|four|five|tres|cuatro|cinco)\s+(MCP\s+)?tools\b/i);
    }
  });

  it("no document makes a full catalogue read or an examples call mandatory", () => {
    for (const file of Object.keys(describing)) {
      expect(currentText(file), file).not.toMatch(/page through ALL|get_examples with NO id|EVERY time, before composing/);
    }
  });
});
