import { join } from "node:path";
import { recipes } from "@skryensya/recipes";
import { snippets } from "@skryensya/snippets";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/*
 * Contract tests through a REAL client over stdio, not by calling the handlers directly. What is
 * being tested is the thing an agent actually talks to: the transport, the tool names, the schemas
 * the SDK derives, and the shape of what comes back. A test that imported the functions would pass
 * with a server that fails to start.
 */

let client: Client;

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const result = await client.callTool({ name, arguments: args });
  const content = result.content as { type: string; text: string }[];
  return { isError: result.isError === true, payload: JSON.parse(content[0]!.text) };
};

beforeAll(async () => {
  client = new Client({ name: "contract-tests", version: "1.0.0" });
  await client.connect(
    new StdioClientTransport({
      command: "npx",
      args: ["tsx", join(import.meta.dirname, "index.ts")],
    }),
  );
}, 60_000);

afterAll(async () => {
  await client.close();
});

describe("the shipped binary", () => {
  /*
   * The tests above run the server through tsx. That is NOT what `.mcp.json` starts: it starts
   * `dist/index.js` with plain node, which cannot load a `.ts` file or follow a workspace link. The
   * source passed every test while the built server could not start at all, so this case exists to
   * make the difference visible instead of discovering it in a session.
   */
  it("starts under plain node and answers", async () => {
    const built = new Client({ name: "binary-check", version: "1.0.0" });

    try {
      await built.connect(
        new StdioClientTransport({
          command: "node",
          args: [join(import.meta.dirname, "..", "dist", "index.js")],
        }),
      );

      const { tools } = await built.listTools();
      expect(tools.map((tool) => tool.name).sort()).toEqual([
        "get_catalog",
        "get_contract",
        "get_examples",
        "validate_ui",
      ]);
    } finally {
      await built.close();
    }
  }, 30_000);
});

describe("the surface", () => {
  it("exposes exactly four tools", async () => {
    const { tools } = await client.listTools();

    /*
     * FOUR, not five, and not back to three either.
     *
     * The old surface's sin was one tool per WORKFLOW STEP over the same content — search, then read
     * a schema, then check props — which is exactly what get_catalog -> get_contract -> validate_ui
     * replaced with three. get_examples is not another step over that same content: it is a second
     * KIND of content (a worked tree, not a bare contract) that none of the other three can answer,
     * the same way get_contract answers a question get_catalog cannot. Folding it into get_catalog
     * would mean either shipping every example's full tree on every catalogue read (defeats "small
     * enough to read whole" the moment a recipe's four states are in there) or growing get_catalog a
     * second, unrelated query shape it was never meant to have. A fifth tool is the one to be
     * suspicious of, not this one.
     */
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      "get_catalog",
      "get_contract",
      "get_examples",
      "validate_ui",
    ]);
  });

  it("stamps every response with the artifact it came from", async () => {
    const { payload } = await call("get_catalog");

    expect(payload.sourceHash).toMatch(/^[0-9a-f]{16}$/);
    expect(payload.schemaVersion).toBe("2.0");
  });
});

describe("get_catalog", () => {
  it("pages, small enough per page that a real caller downstream of Claude Code can read it", async () => {
    const { payload } = await call("get_catalog");

    expect(payload.page).toBe(1);
    expect(payload.contracts.length).toBeGreaterThan(0);
    expect(payload.contracts.length).toBeLessThanOrEqual(10);
    expect(payload.totalFamilies).toBeGreaterThan(payload.contracts.length);
    expect(payload.more).toBe(true);
    // The concrete failure this exists to prevent: the full catalogue serialized is ~110KB and
    // trips Claude Code's own fixed large-result threshold, confirmed live against a real recorded
    // eval run. One page has to stay far under that, not just under some formal token count.
    expect(JSON.stringify(payload).length).toBeLessThan(30_000);
  });

  it("names what IS available when asked for a page past the end", async () => {
    const { isError, payload } = await call("get_catalog", { page: 9999 });

    expect(isError).toBe(true);
    expect(payload.detail).toMatch(/\d+ pages?/);
  });

  it("adds up to the whole catalogue across every page, with the reason to choose each signature", async () => {
    const contracts: { id: string; signatures: unknown[] }[] = [];
    let page = 1;
    for (;;) {
      const { payload } = await call("get_catalog", { page });
      contracts.push(...payload.contracts);
      if (!payload.more) {
        expect(page).toBe(payload.totalPages);
        expect(contracts.length).toBe(payload.totalFamilies);
        break;
      }
      page += 1;
    }

    const button = contracts.find((entry) => entry.id === "button") as {
      signatures: { id: string; useWhen: string[]; avoidWhen: string[]; host: string; template?: unknown }[];
    };
    const action = button.signatures.find((s) => s.id === "Button.action")!;

    expect(action.useWhen.length).toBeGreaterThan(0);
    expect(action.avoidWhen.length).toBeGreaterThan(0);
    expect(action.host).toBe("button");
    // Structure is get_contract's job; the index exists to be read whole.
    expect(action.template).toBeUndefined();
  });
});

describe("get_contract", () => {
  it("returns the options, their attributes and the constraints", async () => {
    const { payload } = await call("get_contract", { id: "button" });

    expect(payload.options.variant.values).toContain("danger");
    expect(payload.options.variant.attr).toBe("data-variant");
    expect(payload.signatures["Button.navigation"].requires).toEqual(["href"]);
    expect(payload.css).toBe("@skryensya/core/components/button.css");
  });

  it("names what IS published when asked for something that is not", async () => {
    // Deliberately a name nothing will ever publish. This asked for `combobox` until combobox was
    // published, at which point the test was proving the opposite of what it claims.
    const { isError, payload } = await call("get_contract", { id: "nonesuch" });

    expect(isError).toBe(true);
    expect(payload.detail).toContain("button");
  });
});

describe("get_examples", () => {
  it("lists every snippet and recipe, without shipping a tree nobody asked for yet", async () => {
    const { payload } = await call("get_examples");

    expect(payload.examples.length).toBe(snippets.length + recipes.length);
    const productCard = payload.examples.find((entry: { id: string }) => entry.id === "product-card-in-grid");
    expect(productCard.level).toBe("molecule");
    expect(productCard.contracts).toEqual(
      expect.arrayContaining(["box", "image-frame", "layout", "typography"]),
    );
    // The index exists to be read whole and cheaply — the tree is get_examples(id)'s job.
    expect(productCard.tree).toBeUndefined();
  });

  it("returns one snippet's full tree by id", async () => {
    const { payload } = await call("get_examples", { id: "pagination-standalone" });

    expect(payload.level).toBe("component");
    expect(payload.tree.contract).toBe("pagination");
    expect(payload.tree.options.total).toBe(9);
  });

  it("returns a recipe's all four states by id, tagged as a screen", async () => {
    const { payload } = await call("get_examples", { id: recipes[0]!.id });

    expect(payload.level).toBe("screen");
    expect(Object.keys(payload.states).sort()).toEqual(["empty", "error", "loading", "success"]);
  });

  it("names what IS published when asked for an id that is not", async () => {
    const { isError, payload } = await call("get_examples", { id: "nonesuch" });

    expect(isError).toBe(true);
    expect(payload.detail).toContain("pagination-standalone");
  });

  /*
   * Every snippet, through the real door — same discipline as "accepts every recipe" below, and the
   * same two bugs that check exists because of are exactly what a snippet is small enough to slip
   * past by accident: a collection item missing `slots: {}`, an option sent as the wrong type.
   */
  it("every snippet's tree is a tree validate_ui actually accepts", async () => {
    for (const snippet of snippets) {
      const { payload } = await call("validate_ui", { tree: snippet.tree });
      expect(payload.valid, snippet.id).toBe(true);
    }
  });
});

describe("validate_ui", () => {
  it("returns the code for both bindings when the tree holds", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "button",
        signature: "Button.navigation",
        options: { variant: "accent", href: "/docs" },
        children: "Documentación",
      },
    });

    expect(payload.valid).toBe(true);
    // Not the exact opening tag: it wraps one attribute per line past the print width, same as
    // the React snippet beside it, so a long class list has no host to be a substring of.
    expect(payload.emitted.vanilla).toContain('class="sk-button sk-interactive"');
    expect(payload.emitted.react).toContain('import { Button } from "@skryensya/react/button";');
    expect(payload.css).toEqual(["@skryensya/core/components/button.css"]);
  });

  it("emits NOTHING for an invalid tree", async () => {
    // The emitter is a renderer, not a checker: this tree would produce an empty <button> that looks
    // fine. Returning it would hand the agent plausible, wrong code.
    const { payload } = await call("validate_ui", {
      tree: { contract: "button", signature: "Button.action" },
    });

    expect(payload.valid).toBe(false);
    expect(payload.emitted).toBeNull();
    expect(payload.problems.map((p: { rule: string }) => p.rule)).toContain("missing-required-slot");
  });

  it("locates a problem inside a composition", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "nav-list",
        signature: "NavList",
        children: {
          contract: "nav-list",
          signature: "NavListGroup",
          children: { contract: "nav-list", signature: "NavListLink", children: "Inicio" },
        },
      },
    });

    const missing = payload.problems.find((p: { rule: string }) => p.rule === "missing-required");
    expect(missing.path).toBe("NavList > NavListGroup > NavListLink");
  });

  it("collects every stylesheet a composition needs", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "nav-list",
        signature: "NavList",
        attrs: { "aria-label": "Principal" },
        children: {
          contract: "nav-list",
          signature: "NavListGroup",
          children: {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: "/" },
            children: "Inicio",
          },
        },
      },
    });

    expect(payload.valid).toBe(true);
    expect(payload.css).toEqual(["@skryensya/core/patterns/nav-list.css"]);
  });

  it("reports an advisory without failing the tree", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "nav-list",
        signature: "NavList",
        children: {
          contract: "nav-list",
          signature: "NavListGroup",
          children: {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: "/" },
            children: "Inicio",
          },
        },
      },
    });

    expect(payload.valid).toBe(true);
    expect(payload.problems.some((p: { severity: string }) => p.severity === "advisory")).toBe(true);
    expect(payload.emitted).not.toBeNull();
  });

  it("catches the empty frame; the bug a static check used to bless", async () => {
    const { payload } = await call("validate_ui", {
      tree: { contract: "image-frame", signature: "ImageFrame" },
    });

    expect(payload.valid).toBe(false);
    expect(payload.problems.map((p: { rule: string }) => p.rule)).toContain("missing-exactly-one");
  });
});

describe("the tool schema accepts everything the compiler's model does", () => {
  /*
   * The MCP describes a usage tree in zod; the compiler describes it in TypeScript. Two declarations
   * of one shape, which is the duplication this whole system exists to argue against; it drifted
   * the moment collections were added: every Tabs composition was rejected at the door by the one
   * tool meant to validate it, and nothing caught it until the server was driven as a client.
   *
   * Every canonical shape the catalogue publishes has to survive the door.
   */
  it("accepts a collection, which is how a tab set is written", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "tabs",
        signature: "Tabs",
        attrs: { "aria-label": "Cuenta" },
        slots: {
          items: [
            { options: { value: "perfil" }, slots: { label: "Perfil", children: "Tu nombre." } },
            { options: { value: "seguridad" }, slots: { label: "Seguridad", children: "Sesiones." } },
          ],
        },
      },
    });

    expect(payload.valid).toBe(true);
    expect(payload.emitted.vanilla).toContain('data-value="perfil"');
    expect(payload.emitted.react).toContain("items={");
  });

  /*
   * The SECOND time the same duplication bit, and it bit the same way: the schema at the door said an
   * option is a string or a boolean, while the type it mirrors has said `string | boolean | number`
   * for as long as there have been numeric options. So the server rejected every Pagination, every
   * Progress, every Slider, every NumberField; the whole numeric half of the catalogue; and none of
   * the fourteen tests above noticed, because not one of them passed a number.
   *
   * A guard in `index.ts` now fails to COMPILE when the type widens. This is the runtime half: the
   * shapes an agent actually sends, through the real server.
   */
  /*
   * Every recipe, through the real door.
   *
   * The two bugs this file exists because of: collections, then numbers; were both found by driving
   * the server as a CLIENT after everything else was green, and both were shapes the catalogue
   * publishes and no test happened to send. So rather than add a case per shape and hope the next gap
   * is one somebody predicted, this sends the richest compositions there are: nine screens, thirty-six
   * states, collections nested in collections, numbers, signatures inside named slots.
   *
   * A recipe that the door rejects is a recipe an agent cannot copy, which is the whole point of
   * publishing them.
   */
  it("accepts every recipe, which is every shape the catalogue publishes at once", async () => {
    for (const recipe of recipes) {
      for (const [state, tree] of Object.entries(recipe.states)) {
        const { payload } = await call("validate_ui", { tree });
        expect(payload.valid, `${recipe.id} · ${state}`).toBe(true);
      }
    }
  });

  it("accepts numeric options, which half the catalogue is made of", async () => {
    for (const tree of [
      { contract: "pagination", signature: "Pagination", options: { page: 4, total: 12 } },
      { contract: "progress", signature: "Progress", options: { value: 68, label: "Subida" } },
      { contract: "slider", signature: "Slider", options: { value: 40, min: 0, max: 100 } },
      {
        contract: "number-field",
        signature: "NumberField",
        options: { name: "noches", min: 1, max: 14 },
        slots: { label: "Noches" },
      },
    ]) {
      const { payload } = await call("validate_ui", { tree });
      expect(payload.valid, `${tree.signature} con opciones numéricas`).toBe(true);
    }
  });

  it("accepts a signature nested in a named slot, which is how an icon is written", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "nav-list",
        signature: "NavList",
        attrs: { "aria-label": "Ajustes" },
        children: {
          contract: "nav-list",
          signature: "NavListGroup",
          children: {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: "/ajustes" },
            slots: { icon: { contract: "icon", signature: "Icon", options: { name: "settings" } } },
            children: "Ajustes",
          },
        },
      },
    });

    expect(payload.valid).toBe(true);
    expect(payload.emitted.vanilla).toContain('data-sk-icon="settings"');
    expect(payload.emitted.react).toContain("<Icon name=");
  });
});
