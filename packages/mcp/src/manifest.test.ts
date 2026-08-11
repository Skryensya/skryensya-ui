import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The runtime reads ONE compiled pair and never walks a directory of authored files, so the two
 * things that can go wrong are both about the artifact rather than about a request: it is not there,
 * or the two halves came from different builds. Both have to fail at STARTUP, loudly, because a
 * server that starts on a mismatched pair answers two questions about two different catalogues.
 *
 * `vi.resetModules()` between cases because the module reads its artifacts once, at import.
 */
let dir: string;

function artifacts({ indexHash = "abc123", manifestHash = "abc123", write = true } = {}) {
  dir = mkdtempSync(join(tmpdir(), "sk-artifacts-"));
  if (write) {
    writeFileSync(
      join(dir, "ai-index.json"),
      JSON.stringify({ contracts: [], schemaVersion: "1", sourceHash: indexHash }),
    );
    writeFileSync(
      join(dir, "ai-manifest.json"),
      JSON.stringify({ contracts: {}, schemaVersion: "1", sourceHash: manifestHash }),
    );
  }
  vi.stubEnv("SK_ARTIFACTS", dir);
  return dir;
}

/** A fresh evaluation each time: `vi.resetModules()` in `beforeEach` is what makes this re-run. */
const load = () => import("./manifest.js");

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  if (dir) rmSync(dir, { force: true, recursive: true });
});

describe("manifest", () => {
  it("serves the compiled pair and stamps its provenance", async () => {
    artifacts({ indexHash: "deadbeef", manifestHash: "deadbeef" });
    const loaded = await load();

    // Every response carries this, so a report can be reproduced against the same artifact
    // rather than against "whatever was on disk".
    expect(loaded.provenance).toEqual({ schemaVersion: "1", sourceHash: "deadbeef" });
    expect(loaded.catalogueIndex.contracts).toEqual([]);
    expect(loaded.manifest.contracts).toEqual({});
  });

  it("refuses a pair from two different builds", async () => {
    artifacts({ indexHash: "aaa", manifestHash: "bbb" });
    await expect(load()).rejects.toThrow(/come from different builds/);
  });

  it("says how to produce the artifact rather than that a file was missing", async () => {
    artifacts({ write: false });
    // The server never falls back to reading source, so the error has to point at the build.
    await expect(load()).rejects.toThrow(/pnpm --filter @skryensya\/ai-compiler build/);
  });

  it("treats an unreadable artifact the same as an absent one", async () => {
    const path = artifacts({ write: false });
    writeFileSync(join(path, "ai-index.json"), "{no es json");
    writeFileSync(join(path, "ai-manifest.json"), "{}");
    await expect(load()).rejects.toThrow(/Could not read/);
  });
});
