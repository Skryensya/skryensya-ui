import { describe, expect, it } from "vitest";
import { validateUsageTree } from "./validate.js";
import type { UsageTree } from "./usage-tree.js";

const rules = (tree: UsageTree) => validateUsageTree(tree).problems.map((p) => p.rule);
const messageFor = (tree: UsageTree, rule: string) =>
  validateUsageTree(tree).problems.find((p) => p.rule === rule)?.message ?? "";

describe("signatures over one export", () => {
  it("rejects the discriminant on the signature that is not it, and names the one that is", () => {
    const tree: UsageTree = {
      contract: "button",
      signature: "Button.action",
      options: { href: "/docs" },
      children: "Documentación",
    };

    expect(rules(tree)).toEqual(["unknown-option"]);
    expect(messageFor(tree, "unknown-option")).toContain("it is an option of Button.navigation");
  });

  it("requires the discriminant on the signature that is defined by it", () => {
    const tree: UsageTree = { contract: "button", signature: "Button.navigation", children: "Docs" };
    expect(rules(tree)).toContain("missing-required");
  });

  it("forbids the native attributes a link cannot carry", () => {
    const tree: UsageTree = {
      contract: "button",
      signature: "Button.navigation",
      options: { href: "/docs" },
      attrs: { disabled: "" },
      children: "Docs",
    };
    expect(rules(tree)).toContain("forbidden");
  });
});

describe("composition", () => {
  it("catches the link that skips its group, the invalid markup a paragraph used to warn about", () => {
    const tree: UsageTree = {
      contract: "nav-list",
      signature: "NavList",
      children: { contract: "nav-list", signature: "NavListLink", options: { href: "/" }, children: "Inicio" },
    };

    expect(rules(tree)).toContain("slot-accepts");
    expect(rules(tree)).toContain("invalid-parent");
  });

  it("rejects an option that belongs to a different signature of the same contract", () => {
    const tree: UsageTree = {
      contract: "nav-list",
      signature: "NavList",
      options: { current: true },
      children: {
        contract: "nav-list",
        signature: "NavListGroup",
        children: { contract: "nav-list", signature: "NavListLink", options: { href: "/" }, children: "Inicio" },
      },
    };

    expect(messageFor(tree, "unknown-option")).toContain("it is an option of NavListLink");
  });

  it("rejects a value outside the option's enum", () => {
    const tree: UsageTree = {
      contract: "button",
      signature: "Button.action",
      options: { variant: "primario" },
      children: "Guardar",
    };
    expect(rules(tree)).toEqual(["invalid-option-value"]);
  });

  it("requires a slot the signature declares required", () => {
    const tree: UsageTree = { contract: "nav-list", signature: "NavList" };
    expect(rules(tree)).toContain("missing-required-slot");
  });
});

describe("accessibility", () => {
  it("fails an icon-only control with no accessible name", () => {
    const tree: UsageTree = {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true },
      children: "★",
    };
    expect(rules(tree)).toEqual(["missing-accessible-name"]);
  });

  it("passes once the host is named", () => {
    const tree: UsageTree = {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true },
      attrs: { "aria-label": "Descargar" },
      children: "★",
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("reports a page-scoped rule as advisory, on the signature it is about and no other", () => {
    const list: UsageTree = {
      contract: "nav-list",
      signature: "NavList",
      children: {
        contract: "nav-list",
        signature: "NavListGroup",
        children: { contract: "nav-list", signature: "NavListLink", options: { href: "/" }, children: "Inicio" },
      },
    };

    const advisories = validateUsageTree(list).problems.filter((p) => p.severity === "advisory");

    // The landmark rule is the <nav>'s, not every signature of the contract's.
    expect(advisories).toHaveLength(1);
    expect(advisories[0]!.path).toBe("NavList");
    // Advisory never fails the tree: it says what a static check cannot settle.
    expect(validateUsageTree(list).valid).toBe(true);
  });
});

describe("the empty frame: the bug a static check used to bless", () => {
  it("rejects a frame with no source of content at all", () => {
    // This exact tree passed every requires/forbids/enum check the old system had, and rendered an
    // empty box. `exactlyOneOf` is what makes it an error instead of a clean result.
    const tree: UsageTree = { contract: "image-frame", signature: "ImageFrame" };

    expect(rules(tree)).toContain("missing-exactly-one");
    expect(messageFor(tree, "missing-exactly-one")).toContain("renders an empty box");
  });

  it("rejects a frame given both sources", () => {
    const tree: UsageTree = {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { src: "/foto.jpg", alt: "Una foto" },
      children: { contract: "image-frame", signature: "ImageFrame", options: { src: "/x.jpg", alt: "" } },
    };

    expect(rules(tree)).toContain("ambiguous-exactly-one");
  });

  it("accepts either source on its own", () => {
    const withSrc: UsageTree = {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { src: "/foto.jpg", alt: "Una foto" },
    };

    expect(validateUsageTree(withSrc).valid).toBe(true);
  });

  it("requires an alt once there is an image to describe", () => {
    const tree: UsageTree = {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { src: "/foto.jpg" },
    };

    expect(rules(tree)).toContain("missing-accessible-name");
  });
});

describe("advisories stay signal", () => {
  it("says nothing when the author already satisfied the rule", () => {
    const named: UsageTree = {
      contract: "nav-list",
      signature: "NavList",
      attrs: { "aria-label": "Principal" },
      children: {
        contract: "nav-list",
        signature: "NavListGroup",
        children: { contract: "nav-list", signature: "NavListLink", options: { href: "/" }, children: "Inicio" },
      },
    };

    // The landmark rule cannot be settled from a tree, so it is advisory, but firing it at someone
    // who already passed aria-label is how an agent learns to ignore advisories.
    expect(validateUsageTree(named).problems).toEqual([]);
  });
});

describe("collections: entries are checked, not just counted", () => {
  const tabs = (items: unknown): UsageTree =>
    ({ contract: "tabs", signature: "Tabs", attrs: { "aria-label": "X" }, slots: { items } }) as UsageTree;

  it("requires the key that pairs an entry's parts", () => {
    // Without a value, the enhancer cannot find the panel that belongs to this trigger and drops it.
    expect(rules(tabs([{ slots: { label: "Uno", children: "…" } }]))).toContain("missing-item-key");
  });

  it("catches two entries sharing a key", () => {
    const duplicated = tabs([
      { options: { value: "a" }, slots: { label: "Uno", children: "…" } },
      { options: { value: "a" }, slots: { label: "Dos", children: "…" } },
    ]);

    // Two triggers, one panel: the second silently wins and the first tab does nothing.
    expect(rules(duplicated)).toContain("duplicate-item-key");
  });

  it("requires each entry's content", () => {
    expect(rules(tabs([{ options: { value: "a" }, slots: { label: "Uno" } }]))).toContain(
      "missing-required-slot",
    );
  });

  it("rejects an option an entry does not have", () => {
    const tree = tabs([{ options: { value: "a", variant: "primary" }, slots: { label: "U", children: "…" } }]);
    expect(rules(tree)).toContain("unknown-item-option");
  });

  it("accepts a well-formed collection", () => {
    const tree = tabs([
      { options: { value: "a" }, slots: { label: "Uno", children: "Primero" } },
      { options: { value: "b", disabled: true }, slots: { label: "Dos", children: "Segundo" } },
    ]);
    expect(validateUsageTree(tree).valid).toBe(true);
  });
});

describe("order and cardinality: what a list of allowed signatures cannot say", () => {
  const table = (children: unknown): UsageTree =>
    ({ contract: "table", signature: "Table", children }) as UsageTree;

  const body = {
    contract: "table",
    signature: "TableBody",
    children: {
      contract: "table",
      signature: "TableRow",
      children: { contract: "table", signature: "TableCell", children: "x" },
    },
  };

  const caption = { contract: "table", signature: "TableCaption", children: "Planes" };

  it("catches a caption written after the rows", () => {
    // The page looks identical. A screen reader announces the table's name after its contents.
    expect(rules(table([body, caption]))).toContain("out-of-order");
  });

  it("catches a second caption", () => {
    expect(rules(table([caption, caption, body]))).toContain("wrong-cardinality");
  });

  it("catches a table with no body", () => {
    expect(rules(table([caption]))).toContain("wrong-cardinality");
  });

  it("accepts caption, head, body in order", () => {
    const head = {
      contract: "table",
      signature: "TableHead",
      children: {
        contract: "table",
        signature: "TableRow",
        children: { contract: "table", signature: "TableHeader", children: "Plan" },
      },
    };

    expect(validateUsageTree(table([caption, head, body])).valid).toBe(true);
  });
});
