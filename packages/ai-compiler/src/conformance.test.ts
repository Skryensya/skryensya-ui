import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkBindingConformance } from "./conformance.js";

const REPO = join(import.meta.dirname, "..", "..", "..");
const BUTTON = join("packages", "react", "src", "components", "button.tsx");

/** A copy of the repo's React bindings, with one file rewritten. */
function repoWith(replacement: (source: string) => string): string {
  const root = mkdtempSync(join(tmpdir(), "sk-binding-"));
  const dest = join(root, "packages", "react", "src", "components");
  cpSync(join(REPO, "packages", "react", "src", "components"), dest, { recursive: true });

  const path = join(root, BUTTON);
  writeFileSync(path, replacement(readFileSync(path, "utf8")));
  return root;
}

describe("G1 — the bindings realize their contracts", () => {
  it("passes the bindings this repo ships", () => {
    expect(checkBindingConformance(REPO)).toEqual([]);
  });

  it("catches an option whose values are written out again", () => {
    // Exactly the shape button.tsx had before decision 28, and exactly what goes stale when a fifth
    // variant is added to the contract.
    const root = repoWith((source) =>
      source.replace(
        "type ButtonAppearanceProps = SignatureOptionsOf<typeof buttonContract, \"Button.action\"> & {",
        'type ButtonAppearanceProps = { variant?: "neutral" | "primary" | "danger" | "ghost" } & {',
      ),
    );

    // Scoped to the file this case rewrote, so an unrelated binding cannot make it pass or fail.
    const problems = checkBindingConformance(root).filter((p) => p.contract === "button");

    expect(problems).toHaveLength(1);
    expect(problems[0]!.option).toBe("variant");
  });

  it("allows the discriminant a union has to write in both branches", () => {
    // `href?: undefined` / `href: string` is how the tag switch is typed. It restates no value set,
    // so it is narrowing, not drift — the distinction this gate exists to make.
    const root = repoWith((source) => source);

    expect(checkBindingConformance(root).filter((p) => p.option === "href")).toEqual([]);
  });
});
