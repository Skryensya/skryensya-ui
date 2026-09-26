import { join } from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { Client as LegacyClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport as LegacyStdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { snippets } from "@skryensya/snippets";
import { createAgentService } from "@skryensya/ai-compiler/agent";
import { SCHEMA_VERSION } from "@skryensya/ai-compiler/artifact";
import { emitMarkup, emitReactSource } from "@skryensya/ai-compiler/emit";
import { sheetsForTree } from "@skryensya/ai-compiler/sheets-for-tree";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { pair } from "./manifest.js";
import { errorOutput } from "./schemas.js";
import { toolNames, tools } from "./tools.js";

/*
 * Contract tests through a REAL client over stdio, against the BUILT binary (`dist/index.js`, what
 * `.mcp.json` starts with plain node). What is tested is what an agent talks to: the transport, the
 * tool names, the schemas the SDK publishes, and what comes back. A test that imported the handlers
 * would pass with a server that fails to start, and once did.
 *
 * `check` builds before it runs vitest, so the binary is never stale here.
 */

const binary = join(import.meta.dirname, "..", "dist", "index.js");
let client: Client;

type Payload = Record<string, any>;

/*
 * Every call goes through here, and every result is held to the two promises this server makes on
 * every answer: `structuredContent` fits the tool's declared outputSchema (or, on an error, the
 * shared error shape), and the text block is that same value serialized, which is what a client
 * without structured output reads.
 */
const call = async (name: string, args: Record<string, unknown> = {}) => {
  const result = await client.callTool({ name, arguments: args });
  const payload = result.structuredContent as Payload;
  const text = (result.content as { type: string; text: string }[])[0]!.text;
  expect(JSON.parse(text), `${name}: text block mirrors structuredContent`).toEqual(payload);

  const isError = result.isError === true;
  const schema = isError ? errorOutput : tools.find((tool) => tool.name === name)!.output;
  const parsed = schema.safeParse(payload);
  expect(parsed.success, `${name}: ${parsed.success ? "" : parsed.error.message}`).toBe(true);

  expect(payload.schemaVersion, `${name}: provenance`).toBe(SCHEMA_VERSION);
  expect(payload.sourceHash, `${name}: provenance`).toMatch(/^[0-9a-f]{16}$/);
  return { isError, payload };
};

beforeAll(async () => {
  client = new Client({ name: "contract-tests", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: "node", args: [binary] }));
}, 60_000);

afterAll(async () => {
  await client.close();
});

describe("the surface", () => {
  it("exposes exactly the declared inventory, in workflow order", async () => {
    const { tools: listed } = await client.listTools();
    expect(listed.map((tool) => tool.name)).toEqual([...toolNames]);
    expect(toolNames).toEqual(["discover_ui", "get_examples", "get_contract", "get_contracts", "validate_ui", "get_catalog"]);
  });

  it("declares an outputSchema and read-only annotations on every tool", async () => {
    const { tools: listed } = await client.listTools();
    for (const tool of listed) {
      expect(tool.outputSchema?.type, tool.name).toBe("object");
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(true);
    }
  });

  it("teaches the discovery workflow and no longer makes a full scan or examples mandatory", () => {
    const text = client.getInstructions() ?? "";
    for (const name of toolNames) expect(text).toContain(name);
    expect(text).not.toMatch(/page through ALL|EVERY time|IS NOT OPTIONAL/);
    // Significantly shorter than the ~4,500 characters it replaced.
    expect(text.length).toBeLessThan(2_000);
  });
});

describe("discover_ui", () => {
  it("is deterministic over the wire", async () => {
    const args = { query: "a switch that applies a setting immediately" };
    const first = await call("discover_ui", args);
    const second = await call("discover_ui", args);
    expect(second.payload).toEqual(first.payload);
  });

  it("explains every candidate and links the related examples", async () => {
    const { payload } = await call("discover_ui", { query: "switch setting" });
    const sw = payload.candidates.find((c: Payload) => c.signature === "Switch");
    expect(sw.matched).toContainEqual({ field: "signature", term: "switch", value: "Switch" });
    expect(sw.examples).toContain("settings-row-with-switch");
    expect(payload.examples.map((e: Payload) => e.id)).toContain("settings-row-with-switch");
    for (const candidate of payload.candidates) expect(candidate.matched.length).toBeGreaterThan(0);
  });

  it("sends the caller to get_catalog when nothing matches", async () => {
    const { isError, payload } = await call("discover_ui", { query: "zzqx" });
    expect(isError).toBe(false);
    expect(payload.coverage).toBe("none");
    expect(payload.guidance).toContain("get_catalog");
  });

  it("reports negated terms, and never lets them admit a candidate", async () => {
    const { payload } = await call("discover_ui", { query: "a switch that applies at once, with no save button" });
    expect(payload.input.negated).toEqual(["save", "button"]);
    expect(payload.candidates[0].signature).toBe("Switch");
    expect(payload.candidates.map((c: Payload) => c.signature)).not.toContain("SplitButton");
  });

  it("returns the vocabulary when called with nothing", async () => {
    const { payload } = await call("discover_ui");
    expect(payload.coverage).toBe("browse");
    expect(payload.vocabulary.intents.length).toBeGreaterThan(100);
  });
});

describe("get_catalog, the exhaustive fallback", () => {
  it("pages, small enough per page that a real caller downstream of Claude Code can read it", async () => {
    const { payload } = await call("get_catalog");
    expect(payload.page).toBe(1);
    expect(payload.contracts.length).toBeLessThanOrEqual(10);
    expect(payload.more).toBe(true);
    expect(JSON.stringify(payload).length).toBeLessThan(30_000);
  });

  it("names what IS available when asked for a page past the end, with provenance", async () => {
    const { isError, payload } = await call("get_catalog", { page: 9999 });
    expect(isError).toBe(true);
    expect(payload.detail).toMatch(/\d+ pages?/);
  });

  it("adds up to the whole catalogue, and discovery can reach nothing it does not list", async () => {
    const signatures = new Set<string>();
    let families = 0;
    for (let page = 1; ; page += 1) {
      const { payload } = await call("get_catalog", { page });
      families += payload.contracts.length;
      for (const entry of payload.contracts) for (const s of entry.signatures) signatures.add(s.id);
      if (!payload.more) {
        expect(families).toBe(payload.totalFamilies);
        break;
      }
    }
    const { payload } = await call("discover_ui", { category: "forms", limit: 60, includeDeprecated: true });
    for (const candidate of payload.candidates) expect(signatures.has(candidate.signature)).toBe(true);
  });
});

describe("get_contract", () => {
  it("returns the options, their attributes and the constraints", async () => {
    const { payload } = await call("get_contract", { id: "button" });
    expect(payload.options.variant.attr).toBe("data-variant");
    expect(payload.options.tone.values).toContain("danger");
    expect(payload.signatures["Button.navigation"].requires).toEqual(["href"]);
    expect(payload.css).toBe("@skryensya/core/components/button.css");
    expect(payload.semantics).toBeUndefined();
    expect((await call("get_contract", { id: "button", detail: "full" })).payload.semantics).toBeDefined();
  });

  it("names what IS published when asked for something that is not", async () => {
    const { isError, payload } = await call("get_contract", { id: "nonesuch" });
    expect(isError).toBe(true);
    expect(payload.detail).toContain("button");
  });
});

describe("get_contracts", () => {
  it("returns several contracts in the order asked, provenance once at the top", async () => {
    const { isError, payload } = await call("get_contracts", { ids: ["hero", "layout", "typography", "button", "hero"] });
    expect(isError).toBe(false);
    expect(payload.contracts.map((c: Payload) => c.id)).toEqual(["hero", "layout", "typography", "button"]);
    for (const contract of payload.contracts) {
      expect(contract.schemaVersion).toBeUndefined();
      expect(contract.sourceHash).toBeUndefined();
      expect(contract.semantics).toBeUndefined();
    }
    expect(payload.contracts[0].signatures.Hero.descendants).toEqual([expect.objectContaining({ of: ["Heading"], min: 1 })]);
  });

  it("returns exactly what get_contract returns for each family", async () => {
    const batch = (await call("get_contracts", { ids: ["button", "switch"], detail: "full" })).payload;
    for (const contract of batch.contracts) {
      const { schemaVersion: _v, sourceHash: _h, ...single } = (await call("get_contract", { id: contract.id, detail: "full" })).payload;
      expect(contract).toEqual(single);
    }
  });

  it("fails the whole call on an unknown id, naming every unknown one", async () => {
    const { isError, payload } = await call("get_contracts", { ids: ["button", "nonesuch", "nope"] });
    expect(isError).toBe(true);
    expect(payload.error).toBe('No published contract "nonesuch", "nope".');
    expect(payload.detail).toContain("button");
    expect(payload.contracts).toBeUndefined();
  });

  it("bounds the batch, and answers the bound like any invalid argument", async () => {
    const ids = ["button", "switch", "hero", "layout", "typography", "box", "list", "avatar", "navbar"];
    const { isError, payload } = await call("get_contracts", { ids });
    expect(isError).toBe(true);
    expect(payload.error).toBe("Invalid arguments for get_contracts.");
    expect(payload.detail).toMatch(/^ids: /);
    expect((await call("get_contracts", { ids: [] })).isError).toBe(true);
  });

  it("is the service's answer, unchanged: the adapter adds nothing", async () => {
    const service = createAgentService(pair, snippets);
    const { payload } = await call("get_contracts", { ids: ["navbar", "wrapper"] });
    expect(payload).toEqual(JSON.parse(JSON.stringify(service.contracts(["navbar", "wrapper"], "contract").value)));
  });
});

describe("get_examples", () => {
  it("lists every snippet without shipping a tree", async () => {
    const { payload } = await call("get_examples");
    expect(payload.examples.length).toBe(snippets.length);
    const card = payload.examples.find((entry: Payload) => entry.id === "product-card-in-grid");
    expect(card.contracts).toEqual(expect.arrayContaining(["box", "image-frame", "layout", "typography"]));
    expect(card.tree).toBeUndefined();
  });

  it("returns one snippet's full tree by id", async () => {
    const { payload } = await call("get_examples", { id: "pagination-standalone" });
    expect(payload.tree.contract).toBe("pagination");
    expect(payload.tree.options.total).toBe(9);
  });

  it("names what IS published when asked for an id that is not", async () => {
    const { isError, payload } = await call("get_examples", { id: "nonesuch" });
    expect(isError).toBe(true);
    expect(payload.detail).toContain("pagination-standalone");
  });
});

describe("validate_ui, the hard boundary", () => {
  /*
   * Behavioural compatibility, stated as equality with the compiler: every snippet's tree comes back
   * valid, with exactly the markup, React source and problems the compiler produces for it, and a
   * stylesheet list that IS `sheetsForTree` rather than a second resolver that can drift from it.
   */
  it("returns the compiler's own verdict, code and stylesheet closure for every snippet", async () => {
    for (const snippet of snippets) {
      const { payload } = await call("validate_ui", { tree: snippet.tree });
      const tree = snippet.tree as UsageTree;
      expect(payload.valid, snippet.id).toBe(true);
      expect(payload.problems, snippet.id).toEqual(validateUsageTree(tree).problems);
      expect(payload.emitted.vanilla, snippet.id).toBe(emitMarkup(tree));
      expect(payload.emitted.react, snippet.id).toBe(emitReactSource(tree).component);
      expect(payload.css, snippet.id).toEqual(sheetsForTree(tree).sheets);
    }
  });

  it("includes the sheets the old MCP-local resolver missed (hookSheets, compose sheets)", async () => {
    const tooltip = snippets.find((s) => s.id === "icon-only-button-tooltip")!;
    expect((await call("validate_ui", { tree: tooltip.tree })).payload.css).toContain("@skryensya/core/patterns/anchored.css");
    const card = snippets.find((s) => s.id === "product-card-in-grid")!;
    expect((await call("validate_ui", { tree: card.tree })).payload.css).toContain("@skryensya/core/patterns/media-gradient.css");
  });

  it("returns the code for both bindings when the tree holds", async () => {
    const { payload } = await call("validate_ui", {
      tree: { contract: "button", signature: "Button.navigation", options: { tone: "accent", href: "/docs" }, children: "Docs" },
    });
    expect(payload.valid).toBe(true);
    expect(payload.emitted.vanilla).toContain('class="sk-button sk-interactive"');
    expect(payload.emitted.react).toContain('import { Button } from "@skryensya/react/button";');
    expect(payload.emitted.reactData).toBeNull();
    expect(payload.css).toEqual(["@skryensya/core/components/button.css"]);
  });

  it("emits NOTHING for an invalid tree", async () => {
    const { isError, payload } = await call("validate_ui", { tree: { contract: "button", signature: "Button.action" } });
    expect(isError).toBe(false);
    expect(payload.valid).toBe(false);
    expect(payload.emitted).toBeNull();
    expect(payload.css).toBeUndefined();
    expect(payload.problems.map((p: Payload) => p.rule)).toContain("missing-required-slot");
  });

  it("locates a problem inside a composition", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "nav-list",
        signature: "NavList",
        children: {
          contract: "nav-list",
          signature: "NavListGroup",
          children: { contract: "nav-list", signature: "NavListLink", children: "Home" },
        },
      },
    });
    expect(payload.problems.find((p: Payload) => p.rule === "missing-required").path).toBe("NavList > NavListGroup > NavListLink");
  });

  it("reports an advisory without failing the tree", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "nav-list",
        signature: "NavList",
        children: {
          contract: "nav-list",
          signature: "NavListGroup",
          children: { contract: "nav-list", signature: "NavListLink", options: { href: "/" }, children: "Home" },
        },
      },
    });
    expect(payload.valid).toBe(true);
    expect(payload.problems.some((p: Payload) => p.severity === "advisory")).toBe(true);
  });

  it("catches the empty frame", async () => {
    const { payload } = await call("validate_ui", { tree: { contract: "image-frame", signature: "ImageFrame" } });
    expect(payload.valid).toBe(false);
    expect(payload.problems.map((p: Payload) => p.rule)).toContain("missing-exactly-one");
  });
});

describe("the tool schema accepts everything the compiler's model does", () => {
  it("accepts a collection, and returns the data module it needs", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "tabs",
        signature: "Tabs",
        attrs: { "aria-label": "Account" },
        slots: {
          items: [
            { options: { value: "profile" }, slots: { label: "Profile", children: "Your name." } },
            { options: { value: "security" }, slots: { label: "Security", children: "Sessions." } },
          ],
        },
      },
    });
    expect(payload.valid).toBe(true);
    expect(payload.emitted.vanilla).toContain('data-value="profile"');
    expect(payload.emitted.react).toContain("items={");
    expect(payload.emitted.reactData.file).toMatch(/\.ts$/);
  });

  it("accepts numeric options", async () => {
    for (const tree of [
      { contract: "pagination", signature: "Pagination", options: { page: 4, total: 12 } },
      { contract: "progress", signature: "Progress", options: { value: 68, label: "Upload" } },
      { contract: "slider", signature: "Slider", options: { value: 40, min: 0, max: 100 }, attrs: { "aria-label": "Volume" } },
    ]) {
      expect((await call("validate_ui", { tree })).payload.valid, tree.signature).toBe(true);
    }
  });

  it("accepts a signature nested in a named slot", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "nav-list",
        signature: "NavList",
        attrs: { "aria-label": "Settings" },
        children: {
          contract: "nav-list",
          signature: "NavListGroup",
          children: {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: "/settings" },
            slots: { icon: { contract: "icon", signature: "Icon", options: { name: "settings" } } },
            children: "Settings",
          },
        },
      },
    });
    expect(payload.valid).toBe(true);
    expect(payload.emitted.vanilla).toContain('data-sk-icon="settings"');
  });
});

describe("arguments that do not fit the schema", () => {
  /*
   * Answered like every other failure: an error result with provenance and a detail naming the
   * offending path, not the SDK's bare line of text. `call` also checks it fits `errorOutput`.
   */
  it("answers an out-of-range argument with a machine-readable, stamped error", async () => {
    const { isError, payload } = await call("get_catalog", { page: 0 });
    expect(isError).toBe(true);
    expect(payload.error).toBe("Invalid arguments for get_catalog.");
    expect(payload.detail).toMatch(/^page: /);
  });

  it("rejects an unknown key in a tree instead of silently dropping it", async () => {
    const { isError, payload } = await call("validate_ui", {
      tree: { contract: "button", signature: "Button.navigation", option: { href: "/" }, children: "Docs" },
    });
    expect(isError).toBe(true);
    expect(payload.detail).toContain('"option"');
  });

  it("rejects an unknown key nested in a slot or a collection entry too", async () => {
    const nested = await call("validate_ui", {
      tree: { contract: "layout", signature: "Stack", children: { contract: "typography", signature: "Text", child: "x" } },
    });
    expect(nested.payload.detail).toContain('"child"');
    const entry = await call("validate_ui", {
      tree: { contract: "tabs", signature: "Tabs", slots: { items: [{ options: { value: "a" }, slots: { label: "A" }, extra: 1 }] } },
    });
    expect(entry.isError).toBe(true);
  });
});

describe("a client of the previous server", () => {
  /*
   * The v1 SDK client, speaking the 2025 `initialize` handshake, reading results the way every
   * client of the old server did: the first text block, parsed as JSON. The server answers it
   * through the SDK's legacy path, from the same factory, with the same tools.
   */
  it("still lists and calls the tools it knew, and reads them from the text block", async () => {
    const legacy = new LegacyClient({ name: "v1-client", version: "1.0.0" });
    await legacy.connect(new LegacyStdioClientTransport({ command: "node", args: [binary] }));
    try {
      const { tools: listed } = await legacy.listTools();
      expect(listed.map((tool) => tool.name)).toEqual(expect.arrayContaining(["get_catalog", "get_contract", "get_examples", "validate_ui"]));

      const result = await legacy.callTool({
        name: "validate_ui",
        arguments: { tree: { contract: "button", signature: "Button.action", children: "Save" } },
      });
      const payload = JSON.parse((result.content as { text: string }[])[0]!.text);
      expect(payload.valid).toBe(true);
      expect(payload.emitted.vanilla).toContain("sk-button");
      expect(payload.sourceHash).toMatch(/^[0-9a-f]{16}$/);

      const catalog = await legacy.callTool({ name: "get_catalog", arguments: {} });
      expect(JSON.parse((catalog.content as { text: string }[])[0]!.text).page).toBe(1);

      const contract = await legacy.callTool({ name: "get_contract", arguments: { id: "button" } });
      expect(JSON.parse((contract.content as { text: string }[])[0]!.text).id).toBe("button");
      const batch = await legacy.callTool({ name: "get_contracts", arguments: { ids: ["button", "hero"] } });
      expect(JSON.parse((batch.content as { text: string }[])[0]!.text).contracts.map((c: Payload) => c.id)).toEqual(["button", "hero"]);
    } finally {
      await legacy.close();
    }
  }, 30_000);
});
