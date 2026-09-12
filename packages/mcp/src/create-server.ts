import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { OptionInput, UsageTree } from "@skryensya/core/usage-tree";
import { recipes } from "@skryensya/recipes";
import { snippets } from "@skryensya/snippets";
import { catalogueIndex, manifest, provenance } from "./manifest.js";

/*
 * Four tools over a compiled manifest, factored out from the transport that carries them: `index.ts`
 * (stdio, one process per client, the shape `.mcp.json` starts) and `http.ts` (Streamable HTTP,
 * reachable over a network) both call `createServer()` for their own fresh `McpServer`. Stateless
 * HTTP needs a NEW server per request (the SDK's own stateless example does the same, see that
 * file's header comment on why: one low-level protocol `Server` cannot serve two concurrent
 * transports at once); stdio needs exactly one, for the process's one connection. Splitting this
 * file from a transport main() is what lets both ask for that without duplicating four tool
 * registrations.
 *
 * The shape of the old server was: search by keyword, read a schema, check some props; then the
 * agent typed the markup itself, which is where correctness leaked out. This one closes that: the
 * agent proposes a composition as DATA, and gets the code back. It never types kit markup.
 *
 * There is no search tool. The catalogue is small enough to read whole (decision 31), and the ranker
 * it replaces documented its own failure by telling clients to list everything instead.
 */

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "skryensya-ui",
      version: "1.0.0",
      description:
        "Compose interfaces with @skryensya/ui. Read the catalogue, read a contract, then propose a " +
        "usage tree and receive the emitted code for either binding.",
    },
    {
      instructions:
        "Workflow: get_catalog (page through ALL of it  -  call again with page: 2, 3, ... while the " +
        "response says more: true; the catalogue is meant to be read whole, paging is only how the " +
        "bytes arrive) -> get_examples with NO id, EVERY time, before composing anything, even a " +
        "single simple control you're confident about -> get_contract(id) for the signatures you " +
        "picked -> validate_ui with the composition you intend to build. validate_ui returns the CODE " +
        "when the tree is valid: paste that, never retype it. Typing it yourself reintroduces the gap " +
        "between what was validated and what was written.\n\n" +
        "CALLING get_examples IS NOT OPTIONAL, even when you already know which signature you'd pick. " +
        "Measured directly, on the identical prompt: a run that called get_examples adapted the " +
        "established two-box pattern (an outer surface with no padding so an image sits flush to its " +
        "edge, an inner box padding only the text)  -  a run that skipped straight from the catalogue to " +
        "composing wrapped ONE box around everything, padding the image too, exactly the mistake that " +
        "pattern's own notes warn against. Both trees validated. Only one was right. \"I already know " +
        "the signature\" is not a reason to skip this  -  knowing the right SIGNATURE and knowing the " +
        "right SHAPE are different things, and get_examples is where the shape lives.\n\n" +
        "get_examples publishes established trees below the whole-catalogue scale: one component " +
        "well-composed (\"component\"), a few components as one small piece of UI (\"molecule\"), or a " +
        "whole screen across its loading/empty/error/success states (\"screen\"). Call it with no id " +
        "first for the index (every example's id, level and intent, so you know what exists), then " +
        "call it again with an id for the one that fits. If one fits the task, adapt its CONTENT, not " +
        "just its shape, rather than composing the same thing from nothing  -  then validate whatever " +
        "you adapted through validate_ui the same as anything else: an example proves its tree matched " +
        "a contract at the moment it was written, not that it still does. Only once the index has no " +
        "match, compose straight from get_catalog's signatures: prefer one whose useWhen matches over " +
        "forcing one that doesn't (avoidWhen exists for exactly that mistake), reach for a layout " +
        "primitive (Stack/Inline/Grid/Box) with an intentional gap when nothing named fits the shape " +
        "rather than a fixed size guessed to look right, and give every icon-only control its own " +
        "accessible name  -  validate_ui enforces that one, but it is cheaper to compose it correctly the " +
        "first time than to fix it after a rejection.\n\n" +
        "A usage tree has three distinct fields, and confusing them is the common mistake:\n" +
        "  - options  what the contract maps to an attribute (variant, href, current)\n" +
        "  - attrs    what you pass to the host element untouched (aria-label, id, rel, target)\n" +
        "  - slots    where content goes; `children` is the usual one and can be written directly\n\n" +
        "validate_ui proves the tree matches its contract. It does NOT prove the page looks right: a " +
        "valid tree can still render an empty region, a wrong layout or unreadable content. When the " +
        "task is visual, render it and look at the result before calling the work done.",
    },
  );

  server.registerTool(
    "get_catalog",
    {
      title: "Read the whole published catalogue, one page at a time",
      description:
        "Every published family and signature with what it is for (useWhen), what it is NOT for " +
        "(avoidWhen), its HTML host, valid parents, alternatives and deprecations. Still meant to be " +
        "read WHOLE, not searched or ranked  -  choosing is your job. PAGED only because the full " +
        "catalogue is too large for one response to arrive intact: call with no `page` for page 1, " +
        "keep incrementing `page` while the response says `more: true`. A family absent from every " +
        "page is not published, whatever the kit may contain.",
      inputSchema: {
        page: z.number().int().min(1).default(1).describe("1-indexed. Start at 1; keep going while `more` is true."),
      },
    },
    async ({ page }) => {
      const totalFamilies = catalogueIndex.contracts.length;
      const totalPages = Math.max(1, Math.ceil(totalFamilies / CATALOG_PAGE_SIZE));

      if (page > totalPages) {
        return problem(
          `No page ${page}.`,
          `There ${totalPages === 1 ? "is" : "are"} only ${totalPages} page${totalPages === 1 ? "" : "s"} (${totalFamilies} families total, ${CATALOG_PAGE_SIZE} per page).`,
        );
      }

      const start = (page - 1) * CATALOG_PAGE_SIZE;
      const contracts = catalogueIndex.contracts.slice(start, start + CATALOG_PAGE_SIZE);

      // `schemaVersion`/`sourceHash` come from `provenance`, stamped by `ok()` below  -  not repeated
      // from `catalogueIndex` here, which would mean carrying the same two fields two different ways.
      return ok({ contracts, page, totalPages, totalFamilies, more: page < totalPages });
    },
  );

  server.registerTool(
    "get_contract",
    {
      title: "Read one family's compiled contract",
      description:
        "The full contract for one family: every signature, the options it takes and the attribute " +
        "each maps to, its part template, slots, constraints (requires / forbids / exactlyOneOf), the " +
        "accessibility it owes, and the CSS a consumer must import. This is the authority for how a " +
        "component is configured and composed; do not infer an option, a class or an import path " +
        "beyond what it returns.",
      inputSchema: {
        id: z.string().min(1).describe("A family id from get_catalog, e.g. 'button', 'nav-list'."),
        detail: z
          .enum(["contract", "full"])
          .default("contract")
          .describe("'contract' omits the semantic overlay you already read in get_catalog."),
      },
    },
    async ({ id, detail }) => {
      const contract = manifest.contracts[id];

      if (!contract) {
        return problem(
          `No published contract "${id}".`,
          `Published: ${Object.keys(manifest.contracts).join(", ")}. A family the kit ships but this ` +
            `list omits has no contract yet, and composing against it would be guessing.`,
        );
      }

      if (detail === "contract") {
        const { semantics: _semantics, ...rest } = contract;
        return ok(rest);
      }

      return ok(contract);
    },
  );

  server.registerTool(
    "get_examples",
    {
      title: "Browse established example trees, or fetch one by id  -  call before composing, always",
      description:
        "Call this BEFORE composing anything, even something you're confident you already know how to " +
        "build  -  knowing the right signature and knowing the right SHAPE are different things, and " +
        "this is where the shape lives. Established trees below the whole-catalogue scale: one " +
        "component well-composed, a few as one small molecule, or a whole screen across its " +
        "loading/empty/error/success states. Call with no id for the index (id, level, intent, notes, " +
        "which contract families it touches, no trees). Call again with an id for that example's full " +
        "tree(s)  -  a snippet returns one tree, a screen returns all four states. Adapt an example's " +
        "content rather than composing the same shape from nothing, then validate whatever you " +
        "adapted through validate_ui same as any tree: an example proves its tree matched a contract " +
        "when it was written, not that it still does.",
      inputSchema: {
        id: z.string().optional().describe("An id from a previous no-id call. Omit to list every example."),
      },
    },
    async ({ id }) => {
      if (!id) return ok({ examples: exampleIndex });

      const snippet = snippets.find((entry) => entry.id === id);
      if (snippet) {
        return ok({
          id: snippet.id,
          level: snippet.level,
          intent: snippet.intent,
          notes: snippet.notes,
          contracts: collectContracts(snippet.tree),
          tree: snippet.tree,
        });
      }

      const recipe = recipes.find((entry) => entry.id === id);
      if (recipe) {
        return ok({
          id: recipe.id,
          level: "screen",
          intent: recipe.intent,
          notes: recipe.notes,
          contracts: [...new Set(Object.values(recipe.states).flatMap((tree) => collectContracts(tree)))].sort(),
          states: recipe.states,
        });
      }

      return problem(
        `No example "${id}".`,
        `Published: ${exampleIndex.map((entry) => entry.id).join(", ")}.`,
      );
    },
  );

  server.registerTool(
    "validate_ui",
    {
      title: "Validate a composition and, if it holds, return its code",
      description:
        "Checks a usage tree against its contracts; signatures, option values, requires / forbids / " +
        "exactlyOneOf, valid parents, slots and declared accessibility; when it is valid, returns " +
        "the emitted markup AND the emitted TSX, which is `react` plus, when the composition carries " +
        "a collection, `reactData`: a second file the component imports, to be written beside it. " +
        "Use the returned code; it is the only way what you " +
        "write and what was validated stay the same artifact. Problems come back with a path into the " +
        "tree, a rule and a severity: an `advisory` is something no static check can settle (a page " +
        "with two navs) and does not make the tree invalid.",
      inputSchema: {
        tree: usageTreeSchema.describe("The composition to check, written in signatures."),
      },
    },
    async ({ tree }) => {
      const { valid, problems } = validateUsageTree(tree);

      /*
       * Emitting only when valid is not a nicety. The emitter is a renderer, not a checker: given a
       * tree with an unmet required slot it will happily produce an empty <button>, and given an option
       * the signature does not take it drops it silently. Code produced from an invalid tree would look
       * plausible and be wrong.
       */
      if (!valid) {
        return ok({
          valid,
          problems,
          emitted: null,
          hint: "Fix the errors and validate again. Nothing was emitted: code built from an invalid tree looks plausible and is wrong.",
        });
      }

      /*
       * React comes back as up to TWO files: the component, and the module its collections were moved
       * to. Both are returned under their own names because both have to be WRITTEN. A component
       * importing `./menu-items` from a caller that never received `menu-items.ts` does not build.
       */
      const react = emitReactSource(tree);

      return ok({
        valid,
        problems,
        emitted: {
          vanilla: emitMarkup(tree),
          react: react.component,
          reactData: react.data
            ? { file: react.data.file, source: react.data.source }
            : null,
        },
        css: cssFor(tree),
      });
    },
  );

  return server;
}

/*
 * PAGED, not searched. The catalogue is still meant to be read WHOLE (decision 31 stands: no
 * ranker, no keyword filter, choosing is the caller's job)  -  this only changes how many bytes
 * arrive in one response, not what "whole" means or what the caller has to ask for.
 *
 * Confirmed live as a real failure, not a theoretical one: the FULL catalogue (69 families, ~110KB)
 * trips Claude Code's own fixed large-tool-result threshold  -  separate from, and not moved by,
 * `MAX_MCP_OUTPUT_TOKENS`  -  which persists the response to a file and hands the caller a truncated
 * preview instead. Traced through a real recorded eval run: `get_catalog` came back as that
 * preview, the model never saw a single real `useWhen`/`avoidWhen`, and the next three calls were
 * `get_contract` against family names that sound plausible and do not exist ("card", "grid",
 * "link") before it found the real ones by trial and error. That is not a ranking problem a search
 * tool would fix; it is this tool answering with something no caller downstream of Claude Code can
 * actually read. `CATALOG_PAGE_SIZE` families per page keeps every page comfortably under that
 * threshold regardless of which families land on it.
 */
const CATALOG_PAGE_SIZE = 10;

/*
 * EXAMPLES: established trees below the whole-catalogue scale, so composing does not start from a
 * blank tree every time. Two sources, one response shape:
 *   - `@skryensya/snippets` ("component"/"molecule")  -  one family well-composed, or a few families
 *     as one small piece of UI. Single tree each.
 *   - `@skryensya/recipes` ("screen")  -  a whole screen across its four states. Already published
 *     for humans (`apps/docs`'s recetas page) and stress-tested against this very server
 *     (`server.test.ts`); this is the same data, reachable by the thing recipes were always meant
 *     for copying by, not just reading.
 *
 * Two calls, same shape as `get_catalog` -> `get_contract`: no `id` lists everything WITHOUT trees
 * (an index to scan, the same reason `get_catalog` has no search  -  small enough to read whole); an
 * `id` returns that one example's full tree(s). Trees are not returned in the list on purpose: a
 * recipe alone can run to several KB across its four states, and a model with a small context budget
 * (this exists partly FOR those) pays for every example's full tree on every call otherwise, most of
 * which it will not use.
 *
 * Computed ONCE at module scope, not inside `createServer()`: it is pure, static data derived from
 * `snippets`/`recipes`, shared safely by every server instance a stateless HTTP request creates.
 * Rebuilding it per request would be pure waste for the same result every time.
 */
const exampleIndex: readonly ExampleIndexEntry[] = [
  ...snippets.map((snippet) => ({
    id: snippet.id,
    level: snippet.level,
    intent: snippet.intent,
    notes: snippet.notes,
    contracts: collectContracts(snippet.tree),
  })),
  ...recipes.map((recipe) => ({
    id: recipe.id,
    level: "screen" as const,
    intent: recipe.intent,
    notes: recipe.notes,
    contracts: [...new Set(Object.values(recipe.states).flatMap((tree) => collectContracts(tree)))].sort(),
  })),
];

type ExampleIndexEntry = {
  readonly id: string;
  readonly level: "component" | "molecule" | "screen";
  readonly intent: string;
  readonly notes: readonly string[];
  readonly contracts: readonly string[];
};

/*
 * ONE walk, shared by everything that needs to visit every real node in a tree once: `cssFor` (below,
 * every stylesheet) and `collectContracts` (every family id, for `get_examples`' index). Both used to
 * write this descent by hand, close enough to look identical and different enough that only one of
 * the two actually handled a collection item's own `slots` (a tab's label/children pane) correctly  - 
 * exactly the kind of drift a shared walk exists to make impossible.
 *
 * Recurses into anything object-shaped generically rather than branching on "is this a node or a
 * collection item": a collection item (`{ options, slots }`) and a real tree node both keep whatever
 * they nest under `slots`, so walking `Object.values(node.slots ?? {})` plus `node.children` (absent
 * on a collection item, harmlessly `undefined`) reaches both without a separate code path for either.
 * `visit` only fires for an actual tree node (`"contract" in node`); a bare collection-item wrapper is
 * never itself a stylesheet or a family id, only a shape to walk through.
 */
function walkTree(node: unknown, visit: (tree: UsageTree) => void): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) walkTree(item, visit);
    return;
  }

  if ("contract" in node) visit(node as UsageTree);

  const record = node as { slots?: Record<string, unknown>; children?: unknown };
  for (const branch of [...Object.values(record.slots ?? {}), record.children]) {
    walkTree(branch, visit);
  }
}

/** Every family id a tree touches, anywhere in it. */
function collectContracts(tree: UsageTree): readonly string[] {
  const into = new Set<string>();
  walkTree(tree, (node) => into.add(node.contract));
  return [...into].sort();
}

/*
 * One entry of a collection slot. Data, not a child node: a tab's label goes in the trigger and its
 * body in a panel the markup keeps far away, and the key is what pairs them.
 *
 * This existed in the compiler's types before it existed here, and the gap was invisible until the
 * server was driven as a client: every Tabs composition was rejected at the door by the one tool
 * meant to validate it. Two declarations of one shape is the duplication this whole system argues
 * against, so `usage-tree.contract.test.ts` now fails when they drift.
 */
/*
 * What an option may hold, and the second time this exact duplication bit.
 *
 * `OptionInput` in Core is `string | boolean | number`. This said `string | boolean`, so the server
 * rejected EVERY numeric option; an agent could not compose a Pagination, a Progress, a Slider, a
 * NumberField or a TimeField at all, and no test noticed because none of the fourteen used a number.
 *
 * The type below is the authority; the guard under `optionValueSchema` fails to COMPILE if it ever
 * grows again without this following. That is the only mechanism that works here: zod cannot be
 * derived from a TypeScript type, so what is left is making the drift impossible to commit.
 */
const optionValueSchema = z.union([z.string(), z.boolean(), z.number()]);

/*
 * Compile-time proof that the union above covers `OptionInput`. Widen the type in Core and this
 * stops building until the schema follows; which is exactly what nothing did the first two times.
 */
type CoveredOptionInput = z.infer<typeof optionValueSchema>;
type UncoveredOptionInput = Exclude<OptionInput, CoveredOptionInput>;
const _everyOptionInputIsAccepted: UncoveredOptionInput extends never ? true : never = true;
void _everyOptionInputIsAccepted;

const itemSchema = z.lazy(() =>
  z.object({
    options: z
      .record(z.string(), optionValueSchema)
      .optional()
      .describe("Entry values that land on an attribute, including the key that pairs its parts."),
    slots: z
      .record(z.string(), slotContentSchema)
      .describe("Entry content by slot name, e.g. a tab's `label` and `children`."),
  }),
);

const slotContentSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    usageTreeSchema,
    z.array(z.union([z.string(), usageTreeSchema])),
    z.array(itemSchema),
  ]),
);

const usageTreeSchema: z.ZodType<UsageTree> = z.lazy(() =>
  z.object({
    contract: z.string().min(1).describe("Family id, from get_catalog."),
    signature: z.string().min(1).describe("Signature id within that family."),
    options: z
      .record(z.string(), optionValueSchema)
      .optional()
      .describe("Values for options the signature declares. Anything else is rejected, not ignored."),
    attrs: z
      .record(z.string(), z.string())
      .optional()
      .describe("Attributes passed to the host element as-is: aria-label, id, rel, target."),
    slots: z
      .record(z.string(), slotContentSchema)
      .optional()
      .describe(
        "Named slots other than children: a group's `label`, a link's `icon`, or a collection like " +
          "a tab set's `items`, whose entries are {options, slots} objects rather than nodes.",
      ),
    children: z.lazy(() => slotContentSchema).optional().describe("The `children` slot, written directly."),
  }),
) as z.ZodType<UsageTree>;

/*
 * Every part class name, reverse-mapped to the ONE stylesheet that owns it  -  built once from the
 * compiled manifest's own `parts` maps (`{ root: "sk-button", interactive: "sk-interactive", ... }`
 * per contract). What `cssFor` needs to resolve a template's `also` classes back to a stylesheet:
 * `also` names CSS classes borrowed from ANOTHER contract's template (`IconStateButton`'s
 * `also: ["sk-button", "sk-interactive", "sk-icon-toggle"]`, borrowing `Button`'s own root class),
 * not a contract id  -  nothing walking `tree.contract` alone can ever resolve it.
 *
 * ONLY WHEN UNAMBIGUOUS. A `parts` entry means "this template names this class", not "this
 * contract's own stylesheet defines it"  -  the two came apart in exactly the class this exists to
 * resolve: `sk-interactive` (the shared state-layer pattern, defined once in `patterns/state-layer.
 * css` and loaded unconditionally by every consumer's `tokens.scss`) is listed as a named part by
 * MANY different contracts that borrow it via their own `also`, `button` among them  -  so indexing
 * every `parts` entry blindly pointed `sk-interactive` at whichever contract's manifest entry
 * happened to iterate last (confirmed live: `button.css`  -  right  -  then `list.css`  -  wrong  -  on
 * successive runs, since object key order is not a stable ownership signal). A class more than one
 * contract's `parts` map claims is excluded rather than guessed at: `sk-button` has exactly one
 * claimant (`button` itself) and resolves correctly; `sk-interactive` has several and resolves to
 * nothing, which is correct too  -  it never needed an entry, since every consumer already loads it.
 */
const classToCss: ReadonlyMap<string, string> = (() => {
  const claimants = new Map<string, Set<string>>();
  for (const contract of Object.values(manifest.contracts)) {
    const css = (contract as { css?: unknown }).css;
    const parts = (contract as { parts?: unknown }).parts;
    if (typeof css !== "string" || !parts || typeof parts !== "object") continue;
    for (const className of Object.values(parts as Record<string, unknown>)) {
      if (typeof className !== "string") continue;
      const owners = claimants.get(className) ?? new Set<string>();
      owners.add(css);
      claimants.set(className, owners);
    }
  }

  const index = new Map<string, string>();
  for (const [className, owners] of claimants) {
    if (owners.size === 1) index.set(className, [...owners][0]!);
  }
  return index;
})();

/** The `also` classes a node's own signature borrows from another contract's template, if any. */
function alsoClassesFor(node: UsageTree): readonly string[] {
  const contract = manifest.contracts[node.contract] as
    | { signatures?: Record<string, { template?: { also?: readonly string[] } }> }
    | undefined;
  return contract?.signatures?.[node.signature]?.template?.also ?? [];
}

/*
 * Every stylesheet the composition needs, so a consumer is not left to guess the imports.
 *
 * Confirmed live as a real gap, not a hypothetical: composing `IconStateButton` (whose template
 * borrows `also: ["sk-button", ...]`) and asking `validate_ui` for its `css` returned
 * `icon-state-button.css` alone. `button.css`  -  the stylesheet `.sk-button` actually needs  -  was
 * missing, because nothing here ever looked at `also` before. The button rendered as a real,
 * correctly-classed `<button>` with the browser's bare UA chrome instead of the kit's own: valid
 * markup, silently unstyled. `classToCss`/`alsoClassesFor` above are what closes it.
 */
function cssFor(tree: UsageTree): readonly string[] {
  const into = new Set<string>();
  walkTree(tree, (node) => {
    const contract = manifest.contracts[node.contract];
    if (contract && typeof contract.css === "string") into.add(contract.css);

    for (const className of alsoClassesFor(node)) {
      const owner = classToCss.get(className);
      if (owner) into.add(owner);
    }
  });
  return [...into].sort();
}

function ok(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ ...provenance, ...(payload as object) }, undefined, 2) }],
  };
}

function problem(error: string, detail: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: JSON.stringify({ ...provenance, error, detail }, undefined, 2) }],
  };
}
