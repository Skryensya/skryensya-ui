import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { snippets } from "@skryensya/snippets";
import { CONTRACTS_BATCH_BYTES, CONTRACTS_BATCH_LIMIT, createAgentService } from "./agent.js";
import { buildManifest } from "./manifest.js";

/*
 * The service answers without a protocol, so the rules of `contracts` are pinned here, where a
 * second frontend (a CLI, the eval harness) would meet them too. `packages/mcp` tests the wire.
 */
const REPO = join(import.meta.dirname, "..", "..", "..");
const built = buildManifest(join(REPO, "contracts", "semantic"));
const service = createAgentService({ index: built.index, manifest: built.manifest }, snippets);

describe("contracts: several families in one answer", () => {
  it("keeps the order asked, lists a repeated id once, and stamps provenance once", () => {
    const result = service.contracts(["typography", "hero", "typography"], "contract");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.contracts.map((contract) => contract.id)).toEqual(["typography", "hero"]);
    expect(result.value.sourceHash).toBe(built.sourceHash);
    expect(result.value.contracts[0]).not.toHaveProperty("sourceHash");
  });

  it("matches `contract` for each family, in both detail modes", () => {
    for (const detail of ["contract", "full"] as const) {
      const batch = service.contracts(["button", "switch"], detail);
      if (!batch.ok) throw new Error(batch.value.detail);
      for (const contract of batch.value.contracts) {
        const single = service.contract(contract.id, detail);
        if (!single.ok) throw new Error(single.value.detail);
        const { schemaVersion: _v, sourceHash: _h, ...rest } = single.value;
        expect(contract).toEqual(rest);
      }
    }
  });

  it("fails whole on unknown ids, naming each, and never returns a partial answer", () => {
    const result = service.contracts(["button", "nonesuch", "nope"], "contract");
    expect(result.ok).toBe(false);
    expect(result.value).toMatchObject({ error: 'No published contract "nonesuch", "nope".', sourceHash: built.sourceHash });
    expect(result.value).not.toHaveProperty("contracts");
  });

  it("refuses an empty batch and one past the bound", () => {
    expect(service.contracts([], "contract").ok).toBe(false);
    const ids = Object.keys(built.manifest.contracts).slice(0, CONTRACTS_BATCH_LIMIT + 1);
    const over = service.contracts(ids, "contract");
    expect(over.ok).toBe(false);
    expect(over.value).toMatchObject({ error: `Too many contract ids: ${CONTRACTS_BATCH_LIMIT + 1}.` });
    expect(service.contracts(ids.slice(0, CONTRACTS_BATCH_LIMIT), "contract").ok).toBe(true);
  });

  it("fails whole past the byte budget, and names a split that fits", () => {
    const bySize = Object.keys(built.manifest.contracts)
      .map((id) => {
        const { semantics: _s, ...rest } = built.manifest.contracts[id]!;
        return [id, JSON.stringify(rest).length] as const;
      })
      .sort((a, b) => b[1] - a[1]);
    const heavy = bySize.slice(0, CONTRACTS_BATCH_LIMIT).map(([id]) => id);
    const result = service.contracts(heavy, "contract");
    expect(result.ok).toBe(false);
    expect(result.value).toMatchObject({ error: expect.stringContaining(`over the ${CONTRACTS_BATCH_BYTES}-byte budget`) });
    const groups = [...(result.value as { detail: string }).detail.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]!.split(", "));
    expect(groups.flat()).toEqual(heavy);
    for (const group of groups) expect(service.contracts(group, "contract").ok, group.join(",")).toBe(true);
  });

  it("serves a page-scale batch of typical families in one call", () => {
    expect(service.contracts(["hero", "layout", "typography", "button", "box", "image-frame", "list", "avatar"], "contract").ok).toBe(true);
  });
});
