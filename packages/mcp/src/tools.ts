import { z } from "zod";
import { CONTRACTS_BATCH_LIMIT, type AgentResult, type AgentService } from "@skryensya/ai-compiler/agent";
import { DISCOVER_DEFAULT_LIMIT, DISCOVER_MAX_LIMIT } from "@skryensya/ai-compiler/discover";
import type { UsageTree } from "@skryensya/core/usage-tree";
import {
  catalogOutput,
  contractOutput,
  contractsOutput,
  discoverOutput,
  examplesOutput,
  usageTree,
  validateOutput,
} from "./schemas.js";

/*
 * THE PUBLIC TOOL INVENTORY, declared once. `create-server.ts` registers exactly this list, the
 * README's tool table is rendered from it (`pnpm --filter @skryensya/mcp docs`), and
 * `docs.test.ts` fails when either drifts. A tool that exists here and nowhere in the docs, or the
 * reverse, is caught by a test rather than by a confused client.
 *
 * Each `run` is a one-line delegation to `@skryensya/ai-compiler/agent`. If a handler here ever needs
 * more than that, the knowledge it needs belongs in the service, not in the protocol adapter.
 */

type ToolDefinition<Input extends z.ZodObject, Output extends z.ZodType> = {
  readonly name: string;
  readonly title: string;
  /** One line for the README table. The full `description` is what a client sees. */
  readonly summary: string;
  readonly description: string;
  readonly input: Input;
  readonly output: Output;
  readonly run: (service: AgentService, args: z.infer<Input>) => AgentResult<object>;
};

const define = <Input extends z.ZodObject, Output extends z.ZodType>(tool: ToolDefinition<Input, Output>) => tool;

const discoverUi = define({
  name: "discover_ui",
  title: "Find candidate signatures for a piece of UI",
  summary: "Narrows the catalogue to candidate signatures, each with the evidence that matched it.",
  description:
    "Start here. Describe the UI you need and get a small set of candidate signatures, each with its " +
    "useWhen, avoidWhen, alternatives, related example ids, and `matched`: the exact field, term and " +
    "value that made it a candidate. Deterministic and LEXICAL: words are compared to compiled " +
    "fields, nothing is interpreted, and there is no score; choosing is your job. The catalogue is " +
    "written in English, so describe the UI in English words even when the user wrote another language. Narrow with " +
    "`category`, `host` or `parent`, or pass `intents` spelled as the index spells them (call with " +
    "no arguments to list the vocabulary). When `coverage` is `none` or `partial` and nothing fits, " +
    "page through get_catalog, which is exhaustive.",
  input: z.object({
    query: z
      .string()
      .max(500)
      .optional()
      .describe("Words describing the UI, matched word by word against an English catalogue."),
    intents: z
      .array(z.string().max(80))
      .max(20)
      .optional()
      .describe("Intent terms exactly as the index spells them (`on-off`, `navigation`)."),
    category: z
      .enum(["actions", "forms", "navigation", "overlays", "feedback", "data", "content", "layout"])
      .optional()
      .describe("Only families in this category."),
    host: z.string().max(40).optional().describe("Only signatures whose host element is this tag: `a`, `button`, `input`."),
    parent: z.string().max(80).optional().describe("Only signatures that declare this signature id as a valid parent."),
    includeDeprecated: z.boolean().optional().describe("Include deprecated signatures. Default false."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(DISCOVER_MAX_LIMIT)
      .optional()
      .describe(`Most candidates to return. Default ${DISCOVER_DEFAULT_LIMIT}.`),
  }),
  output: discoverOutput,
  run: (service, args) => service.discover(args),
});

const getCatalog = define({
  name: "get_catalog",
  title: "Read the whole published catalogue, one page at a time",
  summary: "The exhaustive catalogue, paged: every family and signature with useWhen and avoidWhen.",
  description:
    "The exhaustive authority on what is published: every family and signature with what it is for " +
    "(useWhen), what it is NOT for (avoidWhen), its HTML host, valid parents, alternatives and " +
    "deprecations. Use it when discover_ui finds nothing that fits, or to browse. Paged because the " +
    "whole catalogue does not arrive intact in one response: call with no `page` for page 1 and keep " +
    "incrementing while `more` is true. A family absent from every page is not published.",
  input: z.object({
    page: z.number().int().min(1).default(1).describe("1-indexed. Keep going while `more` is true."),
  }),
  output: catalogOutput,
  run: (service, { page }) => service.catalogPage(page),
});

const getExamples = define({
  name: "get_examples",
  title: "Browse established example trees, or fetch one by id",
  summary: "Established example trees: the index with no id, one full tree with an id.",
  description:
    "Established, known-good trees below page scale: one component well-composed (`component`) or a " +
    "few as one small piece of UI (`molecule`). discover_ui already lists the ones related to its " +
    "candidates; call this with an id to read one, or with no id for the whole index (id, level, " +
    "intent, notes, families used; no trees). When one fits, adapt its CONTENT, not just its shape: " +
    "an example records a composition decision, such as which box pads what. Then validate what you " +
    "adapted: an example proves its tree matched a contract when it was written, not that it still does.",
  input: z.object({
    id: z.string().max(120).optional().describe("An example id. Omit to list every example."),
  }),
  output: examplesOutput,
  run: (service, { id }) => (id ? service.example(id) : service.examples()),
});

const detail = z
  .enum(["contract", "full"])
  .default("contract")
  .describe("'contract' omits the semantic overlay (useWhen/avoidWhen) you already have.");

const getContract = define({
  name: "get_contract",
  title: "Read one family's compiled contract",
  summary: "One family's contract: options, slots, constraints, accessibility and CSS.",
  description:
    "The full contract for one family: every signature, the options it takes and the attribute each " +
    "maps to, its part template, slots, constraints (requires / forbids / exactlyOneOf / " +
    "atLeastOneOf / descendants), the accessibility it owes, and the CSS a consumer must import. The authority for " +
    "how a component is configured and composed; do not infer an option, a class or an import path " +
    "beyond what it returns.",
  input: z.object({
    id: z.string().min(1).max(80).describe("A family id, e.g. 'button', 'nav-list' (the `contract` of a candidate)."),
    detail,
  }),
  output: contractOutput,
  run: (service, { id, detail }) => service.contract(id, detail),
});

const getContracts = define({
  name: "get_contracts",
  title: "Read several families' compiled contracts at once",
  summary: `Up to ${CONTRACTS_BATCH_LIMIT} contracts in one call, in the order asked, for one composition.`,
  description:
    `The same contracts get_contract returns, for up to ${CONTRACTS_BATCH_LIMIT} families in one call: ` +
    "use it when one composition needs several families (a page, a card with media and actions). " +
    "Returned in the order asked, a repeated id once. All or nothing: if any id is not published " +
    "the call fails and names every unknown id; if the contracts together are too large for one " +
    "answer, it fails and names the groups to ask for instead.",
  input: z.object({
    ids: z
      .array(z.string().min(1).max(80))
      .min(1)
      .max(CONTRACTS_BATCH_LIMIT)
      .describe("Family ids, e.g. ['hero', 'layout', 'typography', 'button'] (the `contract` of each candidate)."),
    detail,
  }),
  output: contractsOutput,
  run: (service, { ids, detail }) => service.contracts(ids, detail),
});

const validateUi = define({
  name: "validate_ui",
  title: "Validate a composition and, if it holds, return its code",
  summary: "Validates a usage tree; when valid, returns Vanilla markup, React source, data module and CSS.",
  description:
    "The hard boundary. Checks a usage tree against its contracts: signatures, option values, " +
    "requires / forbids / exactlyOneOf / atLeastOneOf, valid parents, required descendants, slots and declared " +
    "accessibility. When valid it returns the emitted Vanilla markup, the React component, `reactData` " +
    "(a second file the component imports, when there is a collection) and every stylesheet to " +
    "import. Use that code as returned: it is the only way what you write and what was validated " +
    "stay the same artifact. When invalid, nothing is emitted; problems come back with a path into " +
    "the tree, a rule and a severity. An `advisory` is something no static check can settle and does " +
    "not make the tree invalid.",
  input: z.object({
    tree: usageTree.describe("The composition to check, written in signatures."),
  }),
  output: validateOutput,
  run: (service, { tree }) => service.validate(tree as UsageTree),
});

/** In workflow order, which is also the order `tools/list` returns and the README shows. */
export const tools = [discoverUi, getExamples, getContract, getContracts, validateUi, getCatalog] as const;

export const toolNames: readonly string[] = tools.map((tool) => tool.name);
