import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildManifest, canonical } from "./manifest.js";
import { contractIds } from "@skryensya/core/registry";

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
    // Deliberately a name nothing will ever publish. This read `combobox.yaml` until combobox was
    // published, at which point the test was asserting about a contract that now exists: the
    // example has to be fictional or it stops testing what it says.
    const files = { ...complete(), "nonesuch.yaml": "Nonesuch:\n  useWhen: [pick]\n" };

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

/*
 * A conditional node names something, and nothing checked that the something exists.
 *
 * Steps' description span said `whenItemGiven: "description"` while `description` is a SLOT, so the
 * option lookup was permanently undefined and the span never emitted. Nothing failed: the tree
 * validated, React rendered the descriptions from its `steps` prop, and only the markup lost them.
 * One tree, two bindings, two different answers: the one thing this compiler exists to
 * make impossible. A misspelling would do exactly the same, silently.
 */
describe("a conditional names something that exists", () => {
  const conditionals = [
    { key: "whenItemGiven", from: "options" },
    { key: "whenItemMissing", from: "options" },
    { key: "whenItemSlotGiven", from: "slots" },
    { key: "whenItemSlotMissing", from: "slots" },
  ] as const;

  /** Only the parts this test walks; the manifest is emitted as data, not as a typed graph. */
  type Item = { options?: Record<string, unknown>; slots?: Record<string, unknown> };
  type Signature = { slots?: Record<string, { item?: Item }>; template?: unknown };
  type Contracts = Record<string, { signatures?: Record<string, Signature> }>;

  it("resolves every item conditional against the entry's own options and slots", () => {
    const { manifest } = buildManifest(OVERLAYS);
    const contracts = (manifest as { contracts: Contracts }).contracts;
    const problems: string[] = [];

    for (const [contractId, contract] of Object.entries(contracts)) {
      for (const [signatureId, signature] of Object.entries(contract.signatures ?? {})) {
        const item = Object.values(signature.slots ?? {}).find((slot) => slot.item)?.item;
        if (!item) continue;

        const declared = {
          options: Object.keys(item.options ?? {}),
          slots: Object.keys(item.slots ?? {}),
        };

        const walk = (node: unknown): void => {
          if (!node || typeof node !== "object") return;
          const record = node as Record<string, unknown> & { children?: unknown[] };
          for (const { key, from } of conditionals) {
            const named = record[key];
            if (typeof named === "string" && !declared[from].includes(named)) {
              problems.push(
                `${contractId}/${signatureId}: ${key}="${named}" names no item ${from.slice(0, -1)} ` +
                  `(has ${from}: ${declared[from].join(", ") || "none"})`,
              );
            }
          }
          for (const child of record.children ?? []) walk(child);
        };

        walk(signature.template);
      }
    }

    expect(problems).toEqual([]);
  });
});
