import type { UsageTree } from "@skryensya/core/usage-tree";
import type { CompiledContract, CompiledIndexEntry, CompiledPair } from "./artifact.js";
import { discover, type DiscoverInput, type DiscoverResult, type DiscoverSnippet } from "./discover.js";
import { emitMarkup, emitReactSource } from "./emit.js";
import { sheetsForTree } from "./sheets-for-tree.js";
import { contractsIn } from "./usage-walk.js";
import { validateUsageTree, type Problem } from "./validate.js";

/*
 * THE AGENT-FACING SERVICE: every deterministic operation an agent performs against the kit, as
 * plain functions over a compiled artifact. No protocol, no schema library, no transport.
 *
 * `packages/mcp` used to own this knowledge: its own tree walk, its own stylesheet resolver (which
 * missed `hookSheets` and `compose[].sheets`, so eleven of the canonical trees came back with an
 * incomplete CSS list), its own example index. It is a protocol adapter now. Deleting it should
 * delete a frontend, and whatever a second frontend (a CLI, a plain JSON endpoint, the eval
 * harness) needs is here, once.
 *
 * PROVENANCE IS STAMPED HERE, not by the adapter, because it is a fact about the artifact: every
 * result, success or failure, names the `schemaVersion` and `sourceHash` it was computed from.
 */

export type Provenance = { readonly schemaVersion: string; readonly sourceHash: string };

export type AgentError = Provenance & { readonly error: string; readonly detail: string };

export type AgentResult<T> =
  | { readonly ok: true; readonly value: Provenance & T }
  | { readonly ok: false; readonly value: AgentError };

export type AgentSnippet = DiscoverSnippet & { readonly notes: readonly string[] };

export type CatalogPage = {
  readonly contracts: readonly CompiledIndexEntry[];
  readonly page: number;
  readonly totalPages: number;
  readonly totalFamilies: number;
  readonly more: boolean;
};

export type ExampleIndexEntry = {
  readonly id: string;
  readonly level: string;
  readonly intent: string;
  readonly notes: readonly string[];
  readonly contracts: readonly string[];
};

export type Example = ExampleIndexEntry & { readonly tree: UsageTree };

export type ValidateOutcome =
  | {
      readonly valid: false;
      readonly problems: readonly Problem[];
      readonly emitted: null;
      readonly hint: string;
    }
  | {
      readonly valid: true;
      readonly problems: readonly Problem[];
      readonly emitted: {
        readonly vanilla: string;
        readonly react: string;
        readonly reactData: { readonly file: string; readonly source: string } | null;
      };
      /** Every stylesheet the composition needs, from `sheetsForTree`: the closure, not a guess. */
      readonly css: readonly string[];
    };

/*
 * Families per `get_catalog` page. The full index is ~190KB; Claude Code persists any tool result
 * past a fixed size to a file and hands the model a truncated preview, and a recorded eval run
 * showed the model then guessing family names that do not exist. Ten families keeps every page far
 * under that line whichever families land on it.
 */
export const CATALOG_PAGE_SIZE = 10;

export type AgentService = ReturnType<typeof createAgentService>;

export function createAgentService(pair: CompiledPair, snippets: readonly AgentSnippet[]) {
  const provenance: Provenance = {
    schemaVersion: pair.index.schemaVersion,
    sourceHash: pair.index.sourceHash,
  };

  const ok = <T extends object>(value: T): AgentResult<T> => ({ ok: true, value: { ...provenance, ...value } });
  const fail = (error: string, detail: string): AgentResult<never> => ({
    ok: false,
    value: { ...provenance, error, detail },
  });

  // Pure functions of the artifact and the snippets, so computed once per service, not per call.
  const exampleIndex: readonly ExampleIndexEntry[] = snippets.map((snippet) => ({
    id: snippet.id,
    level: snippet.level,
    intent: snippet.intent,
    notes: snippet.notes,
    contracts: contractsIn(snippet.tree),
  }));

  return {
    provenance,

    /*
     * Arguments that do not fit a tool's input schema. The protocol adapter validates them, and
     * answers through here so a malformed call gets the same machine-readable, provenance-stamped
     * error as every other failure instead of a bare line of text.
     */
    invalidInput(tool: string, issues: string): AgentResult<never> {
      return fail(`Invalid arguments for ${tool}.`, issues);
    },

    catalogPage(page: number): AgentResult<CatalogPage> {
      const totalFamilies = pair.index.contracts.length;
      const totalPages = Math.max(1, Math.ceil(totalFamilies / CATALOG_PAGE_SIZE));
      if (!Number.isInteger(page) || page < 1 || page > totalPages) {
        return fail(
          `No page ${page}.`,
          `There ${totalPages === 1 ? "is" : "are"} only ${totalPages} page${totalPages === 1 ? "" : "s"} ` +
            `(${totalFamilies} families total, ${CATALOG_PAGE_SIZE} per page).`,
        );
      }
      const start = (page - 1) * CATALOG_PAGE_SIZE;
      return ok({
        contracts: pair.index.contracts.slice(start, start + CATALOG_PAGE_SIZE),
        page,
        totalPages,
        totalFamilies,
        more: page < totalPages,
      });
    },

    contract(id: string, detail: "contract" | "full"): AgentResult<Omit<CompiledContract, "semantics"> & Partial<Pick<CompiledContract, "semantics">>> {
      const contract = pair.manifest.contracts[id];
      if (!contract) {
        return fail(
          `No published contract "${id}".`,
          `Published: ${Object.keys(pair.manifest.contracts).join(", ")}. A family the kit ships but ` +
            "this list omits has no contract yet, and composing against it would be guessing.",
        );
      }
      if (detail === "full") return ok(contract);
      const { semantics: _semantics, ...rest } = contract;
      return ok(rest);
    },

    examples(): AgentResult<{ readonly examples: readonly ExampleIndexEntry[] }> {
      return ok({ examples: exampleIndex });
    },

    example(id: string): AgentResult<Example> {
      const at = snippets.findIndex((entry) => entry.id === id);
      if (at === -1) {
        return fail(`No example "${id}".`, `Published: ${exampleIndex.map((entry) => entry.id).join(", ")}.`);
      }
      return ok({ ...exampleIndex[at]!, tree: snippets[at]!.tree });
    },

    discover(input: DiscoverInput): AgentResult<DiscoverResult> {
      return ok(discover(pair.index, snippets, input));
    },

    /*
     * THE HARD BOUNDARY. Emitting only when valid is not a nicety: the emitter is a renderer, not a
     * checker. Given an unmet required slot it produces an empty <button>; given an option the
     * signature does not take it drops it silently. Code emitted from an invalid tree looks
     * plausible and is wrong, so an invalid tree gets problems and nothing else.
     */
    validate(tree: UsageTree): AgentResult<ValidateOutcome> {
      const { valid, problems } = validateUsageTree(tree);
      if (!valid) {
        return ok({
          valid: false,
          problems,
          emitted: null,
          hint:
            "Fix the errors and validate again. Nothing was emitted: code built from an invalid " +
            "tree looks plausible and is wrong.",
        });
      }

      /*
       * React comes back as up to TWO files: the component, and the module its collections were
       * moved to. Both have to be WRITTEN; a component importing `./menu-items` from a caller that
       * never received `menu-items.ts` does not build.
       */
      let vanilla: string;
      let react: ReturnType<typeof emitReactSource>;
      try {
        vanilla = emitMarkup(tree);
        react = emitReactSource(tree);
      } catch (error) {
        return fail(
          "The tree validated but could not be emitted.",
          `${error instanceof Error ? error.message : String(error)} This is a defect in the kit, ` +
            "not in the tree: a valid tree the emitter cannot render means a contract's part " +
            "template is incomplete.",
        );
      }

      return ok({
        valid: true,
        problems,
        emitted: {
          vanilla,
          react: react.component,
          reactData: react.data ? { file: react.data.file, source: react.data.source } : null,
        },
        css: sheetsForTree(tree).sheets,
      });
    },
  };
}
