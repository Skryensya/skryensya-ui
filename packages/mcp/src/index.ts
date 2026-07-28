#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { checkUsage } from "./check.js";
import { getSchema, listIds, listSurfaces } from "./catalog.js";
import { rankByIntent } from "./search.js";

const server = new McpServer(
  {
    name: "skryensya-ui",
    version: "0.3.0",
    description:
      "Discover, compose and validate @skryensya/ui components by intent. This server never authors " +
      "new components: it only teaches how to import, choose a surface, and configure the ones that " +
      "already exist, from the same guides a human author would read in docs/ai.",
  },
  {
    instructions:
      "Workflow: find_component (search or, with no intent, full catalog) -> get_component(id) for " +
      "the composition guide -> check_usage before writing code that uses an unusual prop combo. " +
      "Never guess an id, surface name, or prop value; these three tools are the only source of truth.\n\n" +
      "find_component ranks by literal keyword overlap over {id, surface, use} — it is not semantic " +
      "search, so word choice matters:\n" +
      "  - Prefer the words you'd expect IN THE COMPONENT'S OWN NAME or its short 'use' description " +
      "(e.g. 'navigation list', 'popover', 'tag') over generic UI vocabulary ('a widget for links at " +
      "the top', 'some kind of label').\n" +
      "  - A miss does not mean the component doesn't exist. If your first query returns nothing " +
      "relevant, or you're not confident the top match is right, call find_component again with NO " +
      "intent to read the full catalog directly rather than guessing an id from memory or trying " +
      "several rephrasings blind.\n" +
      "  - The ranker can rank a related-but-wrong surface above the one you want when they share " +
      "more literal words — skim past the #1 result if it doesn't quite fit; the right one is often " +
      "still in the top 5.\n\n" +
      "check_usage takes a `usages` array — validate every surface a page/component composes in ONE " +
      "call, not one call per surface. Skipping the ones that 'feel obviously fine' is exactly how a " +
      "bad prop combination ships; batching removes the excuse to skip any of them.\n\n" +
      "Root contract — before composing any component in a NEW consuming app, set up three things " +
      "these three tools never mention because they are per-app, not per-component:\n" +
      "  1. Import `@skryensya/core/tokens.scss` once (or the equivalent CSS entry) — it brings " +
      "every tier-1 primitive, tier-2 semantic token, the state layer and the icon base.\n" +
      "  2. Typography: Core names a default (`--scale-font-family-sans: Inter, system-ui, " +
      "sans-serif`) but ships no font file — same contract as a brand ramp (Core exposes the tier-1 " +
      "hook, never the asset). Left alone, the browser silently falls back to system-ui, which is " +
      "NOT a bug to fix by linking a Google Fonts (or any) CDN uninvited — that is a real dependency " +
      "and a real request, ask the user first. If they want the named face actually rendered, they " +
      "supply it (self-hosted files, a font package, whatever they choose) and override " +
      "`--scale-font-family-sans` from their own UNLAYERED stylesheet, the exact mechanism " +
      "brand-ramps.css uses for color. Otherwise the system-ui fallback is a legitimate, working " +
      "choice — not a broken state.\n" +
      "  3. Color-mode flash: ONLY needed once the app persists a mode preference (composes a " +
      "ThemeToggle, or otherwise writes to the shared `sk` localStorage entry). If it does, add a " +
      "synchronous inline script before first paint that reads the stored `scheme` slot and sets " +
      "`document.documentElement.style.colorScheme` — the one sanctioned inline-script exception in " +
      "this system, because it must run before any module can load. An app with no preference-writing " +
      "control does not need this; the `color-scheme: light dark` meta tag alone is enough.\n\n" +
      "Rendered result: check_usage proves a usage matches its schema — it has NO visibility into " +
      "whether the resulting page looks right or has real content. A component can pass every check " +
      "and still render broken (e.g. an ImageFrame with neither `src` nor `children` passes cleanly " +
      "and renders as an empty box). After composing a page with real content, actually render it " +
      "(dev server + a browser, headless is fine) and look at the result before calling the work " +
      "done. \"It builds\" and \"no console errors\" are not a substitute for looking at the output.",
  },
);

server.registerTool(
  "find_component",
  {
    title: "Find the component surface(s) that match a UI intent, or list the whole catalog",
    description:
      "Given a free-text description of what the interface needs to DO (e.g. 'navigate to another " +
      "page', 'let the user pick one option from a list', 'show destructive action'), ranks the " +
      "catalog's surfaces by relevance and returns the top matches with their {id, surface, use}. " +
      "Omit intent to get the FULL catalog instead — every surface across every component, " +
      "untranked — useful for a first browse or when nothing you tried matched. Cheap either way: " +
      "no props, examples or rules, just the index. Always call this before assuming a component " +
      "exists — never guess a name or import path. Follow up with get_component(id) to load the " +
      "full composition guide for the surface you pick.",
    inputSchema: {
      intent: z
        .string()
        .min(1)
        .optional()
        .describe(
          "What the UI element should accomplish, in terms of user intent, e.g. 'save changes', " +
            "'go to the docs page', 'pick a date', 'toggle a checkbox tile'. Describe the behavior, " +
            "not a visual style — this is not a search over component names. Omit to list everything.",
        ),
    },
  },
  async ({ intent }) => {
    const surfaces = await listSurfaces();

    if (intent === undefined) {
      return {
        content: [{ type: "text", text: JSON.stringify(surfaces, null, 2) }],
      };
    }

    const matches = rankByIntent(intent, surfaces).slice(0, 5);

    if (matches.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              matches: [],
              hint: "No surface matched. Call find_component with no intent to see the full catalog before concluding nothing fits.",
            }),
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify({ matches }, null, 2) }],
    };
  },
);

server.registerTool(
  "get_component",
  {
    title: "Get the full composition guide for one component",
    description:
      "Returns the complete docs/ai/schemas guide for one component id: every surface, its required " +
      "CSS import, framework binding, requires/forbids, prop meanings, composition rules and worked " +
      "examples. This is the authority for how to import and configure the component — do not invent " +
      "props, class names or import paths beyond what this returns. If the id is unknown, call " +
      "find_component first.",
    inputSchema: {
      id: z
        .string()
        .min(1)
        .describe("The component id, e.g. 'button', 'tabs', 'tile' — from find_component."),
    },
  },
  async ({ id }) => {
    const schema = await getSchema(id);

    if (!schema) {
      const known = await listIds();
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: `No component with id "${id}".`,
              knownIds: known,
            }),
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(schema, null, 2) }],
    };
  },
);

const usageInput = z.object({
  id: z.string().min(1).describe("The component id, e.g. 'button' — from find_component."),
  surface: z.string().min(1).describe("The surface name, e.g. 'ButtonLink' — from get_component(id)."),
  props: z
    .record(z.string(), z.unknown())
    .default({})
    .describe(
      "The prop names and values you intend to pass, e.g. { variant: \"primary\", href: \"/docs\" }. " +
        "Include a key even for a prop whose value doesn't matter for the check (e.g. an event " +
        "handler) — presence is what requires/forbids look at.",
    ),
});

server.registerTool(
  "check_usage",
  {
    title: "Validate one or more proposed surface usages against their composition guides",
    description:
      "Given a list of {id, surface, props}, checks each one's props against exactly what " +
      "get_component(id) would return for that surface: requires (must be present), forbids (must " +
      "be absent), and any prop with a declared enum (must be one of the listed values). Returns " +
      "{results: [{id, surface, valid, problems}, ...]} in the same order as the input. Pass every " +
      "surface you are about to use in ONE call — a page composed from 6 components is 1 call with " +
      "6 entries, not 6 calls; batching removes the temptation to validate only the ones that felt " +
      "risky and skip the rest. Call this BEFORE writing code that composes an unusual prop " +
      "combination (iconOnly, a navigation surface, disabled state) — catching a forbidden/missing " +
      "prop here is cheaper than a review round-trip. This checks only what the schema declares; a " +
      "clean result is not a guarantee of correctness beyond that guide (e.g. it will not catch a " +
      "missing aria-label — read the guide's own rules for those).",
    inputSchema: {
      usages: z
        .array(usageInput)
        .min(1)
        .describe("Every surface usage to validate in this call, e.g. every component a page composes."),
    },
  },
  async ({ usages }) => {
    const knownIds = await listIds();

    const results = await Promise.all(
      usages.map(async ({ id, surface, props }) => {
        const schema = await getSchema(id);
        if (!schema) {
          return {
            id,
            surface,
            valid: false,
            problems: [{ rule: "unknown-id", msg: `No component with id "${id}". Known ids: ${knownIds.join(", ")}.` }],
          };
        }
        const problems = checkUsage(schema, surface, props);
        return { id, surface, valid: problems.length === 0, problems };
      }),
    );

    return {
      content: [{ type: "text", text: JSON.stringify({ results }, null, 2) }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("skryensya-ui MCP server failed to start:", error);
  process.exit(1);
});
