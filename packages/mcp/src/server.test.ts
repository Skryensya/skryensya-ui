import { join } from "node:path";
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
        "validate_ui",
      ]);
    } finally {
      await built.close();
    }
  }, 30_000);
});

describe("the surface", () => {
  it("exposes exactly three tools", async () => {
    const { tools } = await client.listTools();

    // Not four. Emitting is the result of validating, not a tool of its own — adding one per
    // workflow need is how the old surface grew.
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      "get_catalog",
      "get_contract",
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
  it("returns the whole catalogue, with the reason to choose each signature", async () => {
    const { payload } = await call("get_catalog");

    const button = payload.contracts.find((entry: { id: string }) => entry.id === "button");
    const action = button.signatures.find((s: { id: string }) => s.id === "Button.action");

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
    const { isError, payload } = await call("get_contract", { id: "combobox" });

    expect(isError).toBe(true);
    expect(payload.detail).toContain("button");
  });
});

describe("validate_ui", () => {
  it("returns the code for both bindings when the tree holds", async () => {
    const { payload } = await call("validate_ui", {
      tree: {
        contract: "button",
        signature: "Button.navigation",
        options: { variant: "primary", href: "/docs" },
        children: "Documentación",
      },
    });

    expect(payload.valid).toBe(true);
    expect(payload.emitted.vanilla).toContain('<a class="sk-button sk-interactive"');
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

  it("catches the empty frame — the bug a static check used to bless", async () => {
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
   * of one shape, which is the duplication this whole system exists to argue against — and it drifted
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
