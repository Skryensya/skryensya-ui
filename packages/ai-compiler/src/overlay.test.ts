import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readOverlays } from "./overlay.js";
import { contractIds, getContract } from "@skryensya/core/registry";

/*
 * The overlay is the half of the truth a machine cannot infer: when to reach for a signature and
 * what to reach for instead. What `readOverlays` enforces is that this half and the structural half
 * describe the SAME catalogue, and it refuses to repair a disagreement: it reports both origins and
 * the build stops.
 */
let dir: string;

function overlayDir(files: Record<string, string>): string {
  dir = mkdtempSync(join(tmpdir(), "sk-overlay-"));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return dir;
}

/** An overlay that satisfies one real contract, so a case can add exactly one defect to it. */
function completeOverlayFor(id: string): string {
  return Object.keys(getContract(id)!.signatures)
    .map((signature) => `${signature}:\n  useWhen:\n    - algo\n`)
    .join("");
}

const conflictsAbout = (result: { conflicts: readonly string[] }, needle: string) =>
  result.conflicts.filter((conflict) => conflict.includes(needle));

afterEach(() => {
  if (dir) rmSync(dir, { force: true, recursive: true });
});

describe("readOverlays", () => {
  it("reports every contract that has no overlay at all", () => {
    const result = readOverlays(overlayDir({}));
    // A shape with no reason to choose it is a half-described family, which the policy refuses.
    expect(result.conflicts).toHaveLength(contractIds().length);
    expect(result.conflicts.every((conflict) => conflict.includes("Write one or do not publish it"))).toBe(
      true,
    );
  });

  it("survives a directory that is not there", () => {
    // The build should fail with "no overlay for X", not with ENOENT from a readdir.
    const result = readOverlays(join(tmpdir(), "sk-overlay-does-not-exist"));
    expect(result.semantics).toEqual({});
    expect(result.conflicts.length).toBeGreaterThan(0);
  });

  it("keeps the semantics it read, keyed by contract", () => {
    const result = readOverlays(overlayDir({ "dialog.yaml": completeOverlayFor("dialog") }));
    expect(Object.keys(result.semantics)).toContain("dialog");
    expect(result.semantics.dialog!.Dialog!.useWhen).toEqual(["algo"]);
    expect(conflictsAbout(result, "dialog.yaml")).toEqual([]);
  });

  it("refuses an overlay for a contract nobody publishes", () => {
    const result = readOverlays(overlayDir({ "fantasma.yaml": "Fantasma:\n  useWhen:\n    - algo\n" }));
    expect(conflictsAbout(result, "fantasma.yaml")[0]).toContain("which no published contract declares");
  });

  it("refuses a signature the contract does not declare", () => {
    const result = readOverlays(
      overlayDir({ "dialog.yaml": `${completeOverlayFor("dialog")}Fantasma:\n  useWhen:\n    - algo\n` }),
    );
    expect(conflictsAbout(result, 'describes signature "Fantasma"')).toHaveLength(1);
  });

  it("refuses a signature the overlay left undescribed", () => {
    const result = readOverlays(overlayDir({ "dialog.yaml": "" }));
    // Empty file, so every one of dialog's signatures is missing its reason to exist.
    const missing = conflictsAbout(result, "has no semantics");
    expect(missing.length).toBe(Object.keys(getContract("dialog")!.signatures).length);
  });

  it("refuses an alternative that points at nothing", () => {
    const result = readOverlays(
      overlayDir({
        "dialog.yaml": `${completeOverlayFor("dialog")}  alternatives:\n    - Fantasma\n`,
      }),
    );
    // A dangling pointer costs nothing until an agent follows it and asks for a shape that is not
    // there, which is why this is checked at build time rather than trusted.
    expect(conflictsAbout(result, '"Fantasma" as an alternative')).toHaveLength(1);
  });

  it("accepts an alternative that names a signature from another contract", () => {
    const result = readOverlays(
      overlayDir({
        "dialog.yaml": `${completeOverlayFor("dialog")}  alternatives:\n    - Vaul.drawer\n`,
      }),
    );
    expect(conflictsAbout(result, "as an alternative")).toEqual([]);
  });

  it("reads .yml as readily as .yaml, in a stable order", () => {
    const result = readOverlays(
      overlayDir({ "badge.yml": completeOverlayFor("badge"), "dialog.yaml": completeOverlayFor("dialog") }),
    );
    expect(Object.keys(result.semantics)).toEqual(["badge", "dialog"]);
  });
});
