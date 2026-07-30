#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { emitMarkup, emitReact } from "@skryensya/ai-compiler/emit";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { OptionInput, UsageTree } from "@skryensya/ai-compiler/usage-tree";
import { catalogueIndex, manifest, provenance } from "./manifest.js";

/*
 * Three tools over a compiled manifest.
 *
 * The shape of the old server was: search by keyword, read a schema, check some props — and then the
 * agent typed the markup itself, which is where correctness leaked out. This one closes that: the
 * agent proposes a composition as DATA, and gets the code back. It never types kit markup.
 *
 * There is no search tool. The catalogue is small enough to read whole (decision 31), and the ranker
 * it replaces documented its own failure by telling clients to list everything instead.
 */

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
      "Workflow: get_catalog -> get_contract(id) for the signatures you picked -> validate_ui with " +
      "the composition you intend to build. validate_ui returns the CODE when the tree is valid: " +
      "paste that, never retype it. Typing it yourself reintroduces the gap between what was " +
      "validated and what was written.\n\n" +
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
    title: "Read the whole published catalogue",
    description:
      "Returns every published family and signature with what it is for (useWhen), what it is NOT " +
      "for (avoidWhen), its HTML host, valid parents, alternatives and deprecations. Takes no " +
      "query: the catalogue is meant to be read whole, and choosing from it is your job, not a " +
      "ranker's. Start here — a family absent from this list is not published, whatever the kit may " +
      "contain.",
    inputSchema: {},
  },
  async () => ok(catalogueIndex),
);

server.registerTool(
  "get_contract",
  {
    title: "Read one family's compiled contract",
    description:
      "The full contract for one family: every signature, the options it takes and the attribute " +
      "each maps to, its part template, slots, constraints (requires / forbids / exactlyOneOf), the " +
      "accessibility it owes, and the CSS a consumer must import. This is the authority for how a " +
      "component is configured and composed — do not infer an option, a class or an import path " +
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
 * rejected EVERY numeric option — an agent could not compose a Pagination, a Progress, a Slider, a
 * NumberField or a TimeField at all, and no test noticed because none of the fourteen used a number.
 *
 * The type below is the authority; the guard under `optionValueSchema` fails to COMPILE if it ever
 * grows again without this following. That is the only mechanism that works here: zod cannot be
 * derived from a TypeScript type, so what is left is making the drift impossible to commit.
 */
const optionValueSchema = z.union([z.string(), z.boolean(), z.number()]);

/*
 * Compile-time proof that the union above covers `OptionInput`. Widen the type in Core and this
 * stops building until the schema follows — which is exactly what nothing did the first two times.
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

server.registerTool(
  "validate_ui",
  {
    title: "Validate a composition and, if it holds, return its code",
    description:
      "Checks a usage tree against its contracts — signatures, option values, requires / forbids / " +
      "exactlyOneOf, valid parents, slots and declared accessibility — and when it is valid, returns " +
      "the emitted markup AND the emitted TSX. Use the returned code; it is the only way what you " +
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

    return ok({
      valid,
      problems,
      emitted: { vanilla: emitMarkup(tree), react: emitReact(tree) },
      css: cssFor(tree),
    });
  },
);

/** Every stylesheet the composition needs, so a consumer is not left to guess the imports. */
function cssFor(tree: UsageTree, into = new Set<string>()): readonly string[] {
  const contract = manifest.contracts[tree.contract];
  if (contract && typeof contract.css === "string") into.add(contract.css);

  const branches = [...Object.values(tree.slots ?? {}), tree.children];
  for (const branch of branches) {
    for (const item of Array.isArray(branch) ? branch : [branch]) {
      if (item && typeof item === "object") cssFor(item, into);
    }
  }

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

async function main(): Promise<void> {
  await server.connect(new StdioServerTransport());
}

main().catch((error: unknown) => {
  console.error("skryensya-ui MCP server failed to start:", error);
  process.exit(1);
});
