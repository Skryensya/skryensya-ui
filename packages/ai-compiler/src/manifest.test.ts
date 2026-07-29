import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildManifest, canonical } from "./manifest.js";
import { contractIds } from "./registry.js";

/*
 * What makes the compiled artifact trustworthy: it is reproducible, and it refuses to emit when two
 * sources disagree. A compiler that quietly picked a winner would be a third source of truth.
 */

const REPO = join(import.meta.dirname, "..", "..", "..");
const OVERLAYS = join(REPO, "contracts", "semantic");

/** An overlay directory holding exactly the files given, for the conflict cases. */
function overlayDir(files: Readonly<Record<string, string>>): string {
  const dir = mkdtempSync(join(tmpdir(), "sk-overlay-"));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return dir;
}

const complete = () =>
  Object.fromEntries(
    contractIds().map((id) => [
      `${id}.yaml`,
      id === "button"
        ? "Button.action:\n  useWhen: [act]\nButton.navigation:\n  useWhen: [go]\n"
        : "NavList:\n  useWhen: [nav]\nNavListGroup:\n  useWhen: [group]\nNavListLink:\n  useWhen: [link]\n",
    ]),
  );

describe("determinism", () => {
  it("produces the same bytes from the same sources", () => {
    const first = buildManifest(OVERLAYS);
    const second = buildManifest(OVERLAYS);

    expect(canonical(first.manifest)).toBe(canonical(second.manifest));
    expect(first.sourceHash).toBe(second.sourceHash);
  });

  it("changes the hash when the semantics change", () => {
    const base = buildManifest(overlayDir(complete()));

    const edited = complete();
    edited["button.yaml"] = "Button.action:\n  useWhen: [otra cosa]\nButton.navigation:\n  useWhen: [go]\n";

    expect(buildManifest(overlayDir(edited)).sourceHash).not.toBe(base.sourceHash);
  });
});

describe("reconciliation", () => {
  it("emits nothing for a contract with no overlay", () => {
    const files = complete();
    delete files["button.yaml"];

    const { conflicts } = buildManifest(overlayDir(files));

    expect(conflicts.some((c) => c.includes('contract "button" has no overlay'))).toBe(true);
  });

  it("reports an overlay describing a signature the contract does not declare", () => {
    const files = complete();
    files["button.yaml"] += "ButtonLink:\n  useWhen: [legacy]\n";

    const { conflicts } = buildManifest(overlayDir(files));

    // The deprecated wrapper was resolved in code; an overlay outliving it is a conflict, not a hint.
    expect(conflicts.some((c) => c.includes('signature "ButtonLink"'))).toBe(true);
  });

  it("reports a signature nobody wrote semantics for", () => {
    const files = complete();
    files["button.yaml"] = "Button.action:\n  useWhen: [act]\n";

    const { conflicts } = buildManifest(overlayDir(files));

    expect(conflicts.some((c) => c.includes('"Button.navigation" has no semantics'))).toBe(true);
  });

  it("reports an overlay for a contract that is not published", () => {
    const files = { ...complete(), "combobox.yaml": "Combobox:\n  useWhen: [pick]\n" };

    const { conflicts } = buildManifest(overlayDir(files));

    expect(conflicts.some((c) => c.includes("no published contract declares"))).toBe(true);
  });

  it("is clean for the overlays this repo actually ships", () => {
    expect(buildManifest(OVERLAYS).conflicts).toEqual([]);
  });
});

describe("the index is what discovery reads", () => {
  it("carries the reason to choose a signature, not its structure", () => {
    const { index } = buildManifest(OVERLAYS);
    const entry = (index as { contracts: { id: string; signatures: unknown[] }[] }).contracts.find(
      (c) => c.id === "button",
    );

    const action = entry!.signatures.find(
      (s) => (s as { id: string }).id === "Button.action",
    ) as Record<string, unknown>;

    expect(action.useWhen).toBeDefined();
    expect(action.avoidWhen).toBeDefined();
    expect(action.host).toBe("button");
    // Structure belongs to the manifest; the index exists to be read whole.
    expect(action.template).toBeUndefined();
    expect(action.slots).toBeUndefined();
  });
});
