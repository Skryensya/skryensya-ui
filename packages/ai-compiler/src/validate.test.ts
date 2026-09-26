import { describe, expect, it } from "vitest";
import { validateUsageTree } from "./validate.js";
import { bindingsOf, hookDetailsOf } from "./contract-details.js";
import { checkCompose } from "./compose.js";
import { vocabulary } from "./vocabulary.js";
import { emitMarkup, emitReactSource } from "./emit.js";
import { sheetsForTree } from "./sheets-for-tree.js";
import { contractIds, getContract } from "@skryensya/core/registry";
import type { UsageTree } from "@skryensya/core/usage-tree";

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

  it("forbids pressed on Button.navigation and accepts it on Button.action", () => {
    expect(
      rules({
        contract: "button",
        signature: "Button.navigation",
        options: { href: "/docs", pressed: true },
        children: "Docs",
      }),
    ).toEqual(expect.arrayContaining(["forbidden", "unknown-option"]));

    expect(
      validateUsageTree({
        contract: "button",
        signature: "Button.action",
        options: { pressed: false },
        children: "Bold",
      }).valid,
    ).toBe(true);
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

  it("rejects an unconditional rule (when: {}) as a hard error, not an advisory", () => {
    // Carousel's root gets role="region" + aria-roledescription="carousel" from the machine, but
    // neither NAMES it. Unlike nav-list's landmark rule (gated on `landmarkCount`, a page-scoped
    // signal no static check can settle), this one applies to EVERY Carousel, so it is decidable
    // from the tree alone and must fail loud, not just advise.
    const tree: UsageTree = {
      contract: "carousel",
      signature: "Carousel",
      children: { contract: "carousel", signature: "CarouselSlide", children: "Uno" },
    };

    expect(rules(tree)).toContain("missing-accessible-name");
    expect(validateUsageTree(tree).valid).toBe(false);
  });

  it("passes an unconditional rule once the root is named", () => {
    const tree: UsageTree = {
      contract: "carousel",
      signature: "Carousel",
      attrs: { "aria-label": "Productos destacados" },
      children: { contract: "carousel", signature: "CarouselSlide", children: "Uno" },
    };

    expect(rules(tree)).not.toContain("missing-accessible-name");
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

describe("the invisible box: a surface signature that paints nothing", () => {
  const text: UsageTree = { contract: "typography", signature: "Text", children: "Hola" };

  it("rejects a Box with no padding, surface or border", () => {
    const tree: UsageTree = { contract: "box", signature: "Box", children: [text] };

    expect(rules(tree)).toContain("missing-at-least-one");
  });

  it("rejects a Box whose visual options are all spelled out as none", () => {
    // Present is not the same as effective: writing the default down still paints nothing.
    const tree: UsageTree = {
      contract: "box",
      signature: "Box",
      options: { padding: "none", surface: "none", border: "none" },
      children: [text],
    };

    expect(rules(tree)).toContain("missing-at-least-one");
  });

  it("accepts a Box carrying any one visual decision, or several", () => {
    /*
     * Annotated rather than inferred: a bare array literal of differently-shaped objects infers a
     * UNION whose members carry the other keys as `?: undefined`, and `undefined` is not an
     * `OptionInput`, so every entry fails to be a `UsageTree["options"]`.
     */
    const cases: Readonly<Record<string, string>>[] = [
      { padding: "lg" },
      { surface: "sunken" },
      { border: "subtle" },
      { surface: "surface", border: "subtle", padding: "lg" },
    ];

    for (const options of cases) {
      const tree: UsageTree = { contract: "box", signature: "Box", options, children: [text] };
      expect(rules(tree), JSON.stringify(options)).not.toContain("missing-at-least-one");
    }
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

describe("accordion: coordination and structure", () => {
  const trigger = (label: string) => ({
    contract: "accordion",
    signature: "Accordion.Trigger",
    children: label,
  });
  const content = (body: string) => ({
    contract: "accordion",
    signature: "Accordion.Content",
    children: body,
  });
  const item = (value: string, label: string, body: string, options: Record<string, string | boolean> = {}) => ({
    contract: "accordion",
    signature: "Accordion.Item",
    options: { value, ...options },
    children: [trigger(label), content(body)],
  });

  it("requires Accordion.Item children", () => {
    const tree: UsageTree = { contract: "accordion", signature: "Accordion" };
    expect(rules(tree)).toContain("missing-required-slot");
  });

  it("requires each item's value and Trigger before Content", () => {
    expect(
      rules({
        contract: "accordion",
        signature: "Accordion",
        children: {
          contract: "accordion",
          signature: "Accordion.Item",
          children: [content("body"), trigger("Title")],
        },
      }),
    ).toEqual(expect.arrayContaining(["missing-required", "out-of-order"]));
  });

  it("rejects a trigger outside an item", () => {
    const tree: UsageTree = {
      contract: "accordion",
      signature: "Accordion",
      children: trigger("Orphan"),
    };
    expect(rules(tree)).toEqual(expect.arrayContaining(["slot-accepts", "invalid-parent"]));
  });

  it("accepts defaultValue on the root and defaultOpen on an item", () => {
    const tree: UsageTree = {
      contract: "accordion",
      signature: "Accordion",
      options: { type: "single", collapsible: true, defaultValue: "runtime" },
      children: [
        item("runtime", "Runtime", "Node 24"),
        item("rollout", "Rollout", "10%", { defaultOpen: true }),
      ],
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("accepts multiple type with a comma-separated defaultValue string", () => {
    const tree: UsageTree = {
      contract: "accordion",
      signature: "Accordion",
      options: { type: "multiple", defaultValue: "runtime,rollout" },
      children: [item("runtime", "Runtime", "Node 24"), item("rollout", "Rollout", "10%")],
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("excludes collapsible when type is multiple", () => {
    const tree: UsageTree = {
      contract: "accordion",
      signature: "Accordion",
      options: { type: "multiple", collapsible: true, defaultValue: "runtime" },
      children: [item("runtime", "Runtime", "Node 24")],
    };
    expect(rules(tree)).toContain("excluded-option");
    expect(messageFor(tree, "excluded-option")).toContain("collapsible");
    expect(
      validateUsageTree({
        contract: "accordion",
        signature: "Accordion",
        options: { type: "single", collapsible: false, defaultValue: "runtime" },
        children: [item("runtime", "Runtime", "Node 24")],
      }).valid,
    ).toBe(true);
  });

  it("rejects an unknown root option that belongs only to items", () => {
    const tree: UsageTree = {
      contract: "accordion",
      signature: "Accordion",
      options: { value: "runtime" },
      children: item("runtime", "Runtime", "Node 24"),
    };
    expect(messageFor(tree, "unknown-option")).toContain("Accordion.Item");
  });
});

describe("tile: surfaces and expandable structure", () => {
  it("requires href on TileLink", () => {
    const tree: UsageTree = {
      contract: "tile",
      signature: "TileLink",
      children: "Docs",
    };
    expect(rules(tree)).toContain("missing-required");
  });

  it("requires name on TileRadioGroup", () => {
    const tree: UsageTree = {
      contract: "tile",
      signature: "TileRadioGroup",
      slots: {
        items: [{ options: { value: "basic" }, slots: { label: "Basic" } }],
      },
    };
    expect(rules(tree)).toContain("missing-required");
  });

  it("requires ExpandableTileTrigger before Content", () => {
    const tree: UsageTree = {
      contract: "tile",
      signature: "ExpandableTile",
      children: [
        { contract: "tile", signature: "ExpandableTileContent", children: "Body" },
        { contract: "tile", signature: "ExpandableTileTrigger", children: "Summary" },
      ],
    };
    expect(rules(tree)).toContain("out-of-order");
  });

  it("accepts a complete ExpandableTile with defaultOpen", () => {
    const tree: UsageTree = {
      contract: "tile",
      signature: "ExpandableTile",
      options: { defaultOpen: true },
      children: [
        { contract: "tile", signature: "ExpandableTileTrigger", children: "Summary" },
        { contract: "tile", signature: "ExpandableTileContent", children: "Details" },
      ],
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("rejects TileChevron outside an expandable trigger", () => {
    const tree: UsageTree = {
      contract: "tile",
      signature: "TileButton",
      children: { contract: "tile", signature: "TileChevron" },
    };
    expect(rules(tree)).toContain("invalid-parent");
  });
});

describe("tag: removable structure and naming", () => {
  it("requires removeLabel when removable is true", () => {
    const tree: UsageTree = {
      contract: "tag",
      signature: "Tag",
      options: { removable: true },
      children: "react",
    };
    expect(rules(tree)).toContain("missing-accessible-name");
    expect(validateUsageTree(tree).valid).toBe(false);
  });

  it("accepts a removable tag once removeLabel names the control", () => {
    const tree: UsageTree = {
      contract: "tag",
      signature: "Tag",
      options: { removable: true, removeLabel: "Remove react" },
      children: "react",
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("rejects nested signatures in the label slot", () => {
    const tree: UsageTree = {
      contract: "tag",
      signature: "Tag",
      children: {
        contract: "icon",
        signature: "Icon",
        options: { name: "close" },
      },
    };
    expect(rules(tree)).toContain("slot-accepts");
  });

  it("forbids removable on Tag.link", () => {
    const tree: UsageTree = {
      contract: "tag",
      signature: "Tag.link",
      options: { href: "/topics/design", removable: true },
      children: "design",
    };
    expect(rules(tree)).toContain("forbidden");
  });
});

describe("badge holder: anchor then badge", () => {
  const settingsButton = {
    contract: "button",
    signature: "Button.action",
    options: { iconOnly: true, variant: "ghost" },
    attrs: { "aria-label": "Settings" },
    children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
  };

  it("rejects a badge before its anchor", () => {
    const tree: UsageTree = {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        { contract: "badge", signature: "BadgeDot", options: { label: "Unread", tone: "danger" } },
        settingsButton,
      ],
    };
    expect(rules(tree)).toContain("out-of-order");
  });

  it("accepts a status dot after a button", () => {
    const tree: UsageTree = {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        settingsButton,
        { contract: "badge", signature: "BadgeDot", options: { label: "Unread", tone: "danger" } },
      ],
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("accepts a count pill after a button", () => {
    const tree: UsageTree = {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        settingsButton,
        { contract: "badge", signature: "Badge", options: { tone: "danger", size: "sm" }, children: "9" },
      ],
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("accepts a presence dot on a photo avatar", () => {
    const tree: UsageTree = {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        {
          contract: "avatar",
          signature: "Avatar.image",
          options: { src: "/ana.jpg", imageName: "Ana Solís" },
        },
        { contract: "badge", signature: "BadgeDot", options: { label: "Online", tone: "success" } },
      ],
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("rejects a second badge of the same signature", () => {
    const tree: UsageTree = {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        settingsButton,
        { contract: "badge", signature: "BadgeDot", options: { label: "A", tone: "danger" } },
        { contract: "badge", signature: "BadgeDot", options: { label: "B", tone: "accent" } },
      ],
    };
    expect(rules(tree)).toContain("wrong-cardinality");
  });
});

describe("wrapper: a page column that owns only its own measure", () => {
  const text: UsageTree = { contract: "typography", signature: "Text", children: "Hola" };
  const wrapper = (options?: Readonly<Record<string, string>>): UsageTree => ({
    contract: "wrapper",
    signature: "Wrapper",
    ...(options ? { options } : {}),
    children: text,
  });

  it("accepts every step of the size scale", () => {
    for (const wrapperSize of ["sm", "md", "lg", "full"]) {
      expect(validateUsageTree(wrapper({ wrapperSize })).valid, wrapperSize).toBe(true);
    }
  });

  it("rejects a size off the scale", () => {
    expect(rules(wrapper({ wrapperSize: "xl" }))).toContain("invalid-option-value");
  });

  it("names the option wrapperSize, not the React prop size", () => {
    const tree = wrapper({ size: "sm" });
    expect(rules(tree)).toContain("unknown-option");
    expect(messageFor(tree, "unknown-option")).toContain("wrapperSize");
  });

  it("requires children", () => {
    expect(rules({ contract: "wrapper", signature: "Wrapper" })).toContain("missing-required-slot");
  });

  it("publishes only its own part and hooks, so a Wrapper tree does not load box.css", () => {
    // It used to share `layoutParts` and claim Box's hooks through box.css, a sheet it never paints from.
    const contract = getContract("wrapper")!;
    expect(Object.values(contract.parts)).toEqual(["sk-wrapper"]);
    expect(contract.hooks?.every((hook) => hook.startsWith("--sk-wrapper-"))).toBe(true);

    const { sheets, unplaced } = sheetsForTree(wrapper());
    expect(sheets).toContain("@skryensya/core/patterns/wrapper.css");
    expect(sheets).not.toContain("@skryensya/core/patterns/box.css");
    expect(unplaced).toEqual([]);
  });
});

describe("box: surface that owns only its own paint", () => {
  const box = (options?: Readonly<Record<string, string>>): UsageTree => ({
    contract: "box",
    signature: "Box",
    ...(options ? { options } : {}),
    children: "contenido",
  });

  it("requires at least one of padding, surface, or border away from none", () => {
    expect(rules(box())).toContain("missing-at-least-one");
    expect(rules(box({ padding: "none", surface: "none", border: "none" }))).toContain(
      "missing-at-least-one",
    );
    expect(validateUsageTree(box({ padding: "md" })).valid).toBe(true);
    expect(validateUsageTree(box({ surface: "raised" })).valid).toBe(true);
    expect(validateUsageTree(box({ border: "subtle" })).valid).toBe(true);
  });

  it("requires children", () => {
    expect(rules({ contract: "box", signature: "Box", options: { padding: "sm" } })).toContain(
      "missing-required-slot",
    );
  });

  it("publishes only sk-box and its hooks, so a Box tree does not load wrapper.css", () => {
    const contract = getContract("box")!;
    expect(Object.values(contract.parts)).toEqual(["sk-box"]);
    expect(contract.hooks?.every((hook) => hook.startsWith("--sk-box-"))).toBe(true);
    expect(contract.hookSheets ?? []).toEqual([]);

    const { sheets, unplaced } = sheetsForTree(box({ padding: "md" }));
    expect(sheets).toEqual(["@skryensya/core/patterns/box.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("breadcrumb: trail items and collapse sheets", () => {
  const trail = (items: unknown, separator?: unknown): UsageTree =>
    ({
      contract: "breadcrumb",
      signature: "Breadcrumb",
      slots: { items, ...(separator !== undefined ? { separator } : {}) },
    }) as unknown as UsageTree;

  it("requires items with a text label each", () => {
    expect(rules({ contract: "breadcrumb", signature: "Breadcrumb" })).toContain(
      "missing-required-slot",
    );
    expect(rules(trail([{ options: { href: "/" }, slots: {} }]))).toContain("missing-required-slot");
    expect(
      validateUsageTree(
        trail([
          { options: { href: "/" }, slots: { label: "Inicio" } },
          { options: { current: true }, slots: { label: "Aquí" } },
        ]),
      ).valid,
    ).toBe(true);
  });

  it("accepts an Icon separator and rejects an arbitrary control", () => {
    const items = [
      { options: { href: "/" }, slots: { label: "Inicio" } },
      { options: { current: true }, slots: { label: "Aquí" } },
    ];
    expect(
      validateUsageTree(
        trail(items, { contract: "icon", signature: "Icon", options: { name: "chevron-right" } }),
      ).valid,
    ).toBe(true);
    expect(
      rules(trail(items, { contract: "button", signature: "Button.action", children: "x" })),
    ).toContain("slot-accepts");
  });

  it("loads menu.css and anchored.css via hookSheets for the collapse Menu", () => {
    const { sheets, unplaced } = sheetsForTree(
      trail([
        { options: { href: "/" }, slots: { label: "Inicio" } },
        { options: { href: "/a" }, slots: { label: "A" } },
        { options: { href: "/b" }, slots: { label: "B" } },
        { options: { current: true }, slots: { label: "Aquí" } },
      ]),
    );
    expect(sheets).toContain("@skryensya/core/components/breadcrumb.css");
    expect(sheets).toContain("@skryensya/core/components/menu.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(unplaced).toEqual([]);
  });
});

describe("icon: stable vocabulary and sheets", () => {
  it("requires a stable name from the vocabulary", () => {
    expect(rules({ contract: "icon", signature: "Icon" })).toContain("missing-required");
    expect(
      rules({ contract: "icon", signature: "Icon", options: { name: "inbox" } }),
    ).toContain("invalid-option-value");
  });

  it("accepts a named icon with size and label", () => {
    expect(
      validateUsageTree({
        contract: "icon",
        signature: "Icon",
        options: { name: "close", size: "sm", label: "Cerrar" },
      }).valid,
    ).toBe(true);
  });

  it("loads only icon.css for a lone Icon tree", () => {
    const { sheets, unplaced } = sheetsForTree({
      contract: "icon",
      signature: "Icon",
      options: { name: "check" },
    });
    expect(sheets).toEqual(["@skryensya/core/patterns/icon.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("calendar: named grid and valueChange", () => {
  it("requires a text label naming the grid", () => {
    expect(rules({ contract: "calendar", signature: "Calendar" })).toContain("missing-required-slot");
    expect(
      validateUsageTree({
        contract: "calendar",
        signature: "Calendar",
        options: { value: "2026-09-16" },
        slots: { label: "Fecha" },
      }).valid,
    ).toBe(true);
  });

  it("publishes valueChange for DOM parity", () => {
    expect(getContract("calendar")!.events).toEqual({ valueChange: "sk:calendarvaluechange" });
  });

  it("pins value/min/max to ISO calendar days", () => {
    expect(
      rules({
        contract: "calendar",
        signature: "Calendar",
        options: { value: "16/09/2026" },
        slots: { label: "Fecha" },
      }),
    ).toContain("invalid-option-value");
    expect(
      rules({
        contract: "calendar",
        signature: "Calendar",
        options: { value: "2026-09-16 2026-09-20", min: "2026-09-01", max: "2026-09-30" },
        slots: { label: "Fecha" },
      }),
    ).not.toContain("invalid-option-value");
    const value = getContract("calendar")!.options.value!;
    expect(new RegExp(value.pattern!.source).test("2026-09-16")).toBe(true);
    expect(new RegExp(value.pattern!.source).test("2026-09-16 2026-09-20")).toBe(true);
    expect(new RegExp(value.pattern!.source).test("09-16-2026")).toBe(false);
  });
});

describe("callout: tone live region and action tone gate", () => {
  it("accepts a danger callout with a restricted recovery action", () => {
    expect(
      validateUsageTree({
        contract: "callout",
        signature: "Callout",
        options: { tone: "danger" },
        slots: {
          title: "Error",
          icon: { contract: "icon", signature: "Icon", options: { name: "danger" } },
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { tone: "danger" },
            children: "Reintentar",
          },
        },
        children: "No se pudo guardar",
      }).valid,
    ).toBe(true);
  });

  it("rejects an accent action competing with the page CTA", () => {
    expect(
      rules({
        contract: "callout",
        signature: "Callout",
        children: "Nota",
        slots: {
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { tone: "accent" },
            children: "Comprar",
          },
        },
      }),
    ).toContain("restricted-option-value");
  });

  it("requires children", () => {
    expect(rules({ contract: "callout", signature: "Callout" })).toContain("missing-required-slot");
  });
});

describe("chart: named series of labelled values", () => {
  const chart = (items: unknown): UsageTree =>
    ({
      contract: "chart",
      signature: "Chart",
      options: { label: "Ventas" },
      slots: { items },
    }) as UsageTree;

  it("requires a label and at least one point with a text label", () => {
    expect(rules({ contract: "chart", signature: "Chart" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot"]),
    );
    expect(
      validateUsageTree(
        chart([
          { options: { value: 10 }, slots: { label: "Ene" } },
          { options: { value: 20, tone: "warning" }, slots: { label: "Feb", text: "20 u" } },
        ]),
      ).valid,
    ).toBe(true);
  });

  it("rejects a non-number value on a point", () => {
    expect(rules(chart([{ options: { value: "10" }, slots: { label: "Ene" } }]))).toContain(
      "invalid-option-value",
    );
  });

  it("publishes mount on the signature so line/area enhancers attach", () => {
    expect(getContract("chart")!.signatures.Chart.mount).toBe("data-sk-chart");
  });

  it("implies an ISO currency code when format is currency", () => {
    expect(
      rules({
        contract: "chart",
        signature: "Chart",
        options: { label: "Ventas", format: "currency" },
        slots: { items: [{ options: { value: 10 }, slots: { label: "Ene" } }] },
      }),
    ).toContain("missing-implied");
    expect(
      rules({
        contract: "chart",
        signature: "Chart",
        options: { label: "Ventas", format: "currency", currency: "usd" },
        slots: { items: [{ options: { value: 10 }, slots: { label: "Ene" } }] },
      }),
    ).toContain("invalid-option-value");
    expect(
      validateUsageTree({
        contract: "chart",
        signature: "Chart",
        options: { label: "Ventas", format: "currency", currency: "USD" },
        slots: { items: [{ options: { value: 10 }, slots: { label: "Ene" } }] },
      } as UsageTree).valid,
    ).toBe(true);
  });
});

describe("code-preview: chrome around already-highlighted code", () => {
  const preview = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "code-preview",
      signature: "CodePreview",
      children: "const x = 1",
      ...overrides,
    }) as UsageTree;

  it("requires children and accepts collapsible line counts", () => {
    expect(rules({ contract: "code-preview", signature: "CodePreview" })).toContain(
      "missing-required-slot",
    );
    expect(
      validateUsageTree(
        preview({
          options: { collapsible: true, lines: 40, previewLines: 15, moreLabel: "Expand", lessLabel: "Collapse" },
          slots: { label: "button.tsx" },
        }),
      ).valid,
    ).toBe(true);
  });

  it("rejects a non-number lines count", () => {
    expect(rules(preview({ options: { lines: "40" } }))).toContain("invalid-option-value");
  });

  it("requires both density panels and their edge labels", () => {
    expect(rules({ contract: "code-preview", signature: "CodePreview.density" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(
      validateUsageTree({
        contract: "code-preview",
        signature: "CodePreview.density",
        slots: {
          condensed: "corto",
          full: "completo",
          condensedLabel: "Condensed",
          fullLabel: "Full",
          label: "button.tsx",
        },
      } as UsageTree).valid,
    ).toBe(true);
  });

  it("wires lessLabel onto the toggle and loads switch.css for density", () => {
    const html = emitMarkup(
      preview({
        options: { collapsible: true, lessLabel: "Collapse" },
      }),
    );
    expect(html).toContain('data-sk-code-preview-expanded-label="Collapse"');
    expect(html).not.toContain("data-more-label");

    const { sheets, unplaced } = sheetsForTree({
      contract: "code-preview",
      signature: "CodePreview.density",
      slots: {
        condensed: "corto",
        full: "completo",
        condensedLabel: "Condensed",
        fullLabel: "Full",
      },
    } as UsageTree);
    expect(sheets).toContain("@skryensya/core/components/code-preview.css");
    expect(sheets).toContain("@skryensya/core/components/switch.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });

  it("publishes mount on both signatures", () => {
    const contract = getContract("code-preview")!;
    expect(contract.signatures.CodePreview.mount).toBe("data-sk-code-preview");
    expect(contract.signatures["CodePreview.density"].mount).toBe("data-sk-code-preview");
    expect(contract.hookSheets).toEqual(["@skryensya/core/components/switch.css"]);
  });
});

describe("color-picker: swatch field with derived panel", () => {
  it("accepts full, compact, and a labelled native field", () => {
    expect(
      validateUsageTree({
        contract: "color-picker",
        signature: "ColorPicker",
        options: { value: "#3366ff", triggerLabel: "Brand color" },
        slots: { label: "Brand" },
      }).valid,
    ).toBe(true);
    expect(
      validateUsageTree({
        contract: "color-picker",
        signature: "ColorPicker.compact",
        options: { value: "#000000", swatches: "#ff0000 #00ff00" },
      }).valid,
    ).toBe(true);
    expect(rules({ contract: "color-picker", signature: "ColorPicker.native" })).toContain(
      "missing-required-slot",
    );
    expect(
      validateUsageTree({
        contract: "color-picker",
        signature: "ColorPicker.native",
        options: { name: "bg", value: "#ffffff" },
        slots: { label: "Background" },
      }).valid,
    ).toBe(true);
  });

  it("publishes valueChange and portals on the machine signatures", () => {
    const contract = getContract("color-picker")!;
    expect(contract.events).toEqual({ valueChange: "sk:colorpickervaluechange" });
    expect(contract.signatures.ColorPicker.portals).toEqual({ container: true });
    expect(contract.signatures["ColorPicker.compact"].portals).toEqual({ container: true });
    expect(contract.signatures["ColorPicker.native"].portals).toBeUndefined();
  });

  it("loads anchored.css via hookSheets for the floating panel", () => {
    const { sheets, unplaced } = sheetsForTree({
      contract: "color-picker",
      signature: "ColorPicker",
      options: { value: "#3366ff" },
      slots: { label: "Color" },
    });
    expect(sheets).toContain("@skryensya/core/components/color-picker.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });
});

describe("combobox: filterable field with positioned list", () => {
  const combo = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "combobox",
      signature: "Combobox",
      slots: {
        label: "País",
        items: [
          { options: { value: "cl" }, slots: { label: "Chile", description: "América del Sur" } },
          { options: { value: "mx" }, slots: { label: "México" } },
        ],
      },
      ...overrides,
    }) as UsageTree;

  it("requires a label and at least one item", () => {
    expect(rules({ contract: "combobox", signature: "Combobox" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(validateUsageTree(combo()).valid).toBe(true);
  });

  it("rejects an item without a value", () => {
    expect(
      rules(
        combo({
          slots: {
            label: "País",
            items: [{ slots: { label: "Chile" } }],
          },
        }),
      ),
    ).toContain("missing-item-key");
  });

  it("publishes valueChange and inputValueChange, portals, and mount", () => {
    const contract = getContract("combobox")!;
    expect(contract.events).toEqual({
      valueChange: "sk:comboboxvaluechange",
      inputValueChange: "sk:comboboxinputvaluechange",
    });
    expect(contract.signatures.Combobox.portals).toEqual({ container: true });
    expect(contract.signatures.Combobox.mount).toBe("data-sk-combobox");
  });

  it("loads anchored.css and visually-hidden.css via hookSheets", () => {
    const { sheets, unplaced } = sheetsForTree(combo());
    expect(sheets).toContain("@skryensya/core/components/combobox.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(sheets).toContain("@skryensya/core/patterns/visually-hidden.css");
    expect(sheets).toContain("@skryensya/core/components/form-field.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });
});

describe("command-palette: searchable destinations in a dialog", () => {
  const palette = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "command-palette",
      signature: "CommandPalette",
      options: { label: "Buscar", paletteId: "demo-palette" },
      ...overrides,
    }) as UsageTree;

  it("requires label and paletteId", () => {
    expect(rules({ contract: "command-palette", signature: "CommandPalette" })).toEqual(
      expect.arrayContaining(["missing-required"]),
    );
    expect(validateUsageTree(palette()).valid).toBe(true);
  });

  it("rejects an empty required label", () => {
    expect(rules(palette({ options: { label: "", paletteId: "x" } }))).toContain("empty-required");
  });

  it("accepts entries JSON, footer, and closeLabel", () => {
    expect(
      validateUsageTree(
        palette({
          options: {
            label: "Buscar",
            paletteId: "p",
            closeLabel: "Close",
            entries: JSON.stringify([{ label: "Botón", href: "/boton" }]),
            open: true,
            vaul: false,
          },
          slots: { footer: "↵ to open" },
        }),
      ).valid,
    ).toBe(true);
  });

  it("publishes mount and default-ON vaul, and loads dialog-vaul via hookSheets", () => {
    const contract = getContract("command-palette")!;
    expect(contract.signatures.CommandPalette.mount).toBe("data-sk-command-palette");
    expect(contract.options.vaul.default).toBe(true);
    expect(contract.hookSheets).toEqual(["@skryensya/core/patterns/dialog-vaul.css"]);

    const { sheets, unplaced } = sheetsForTree(palette());
    expect(sheets).toContain("@skryensya/core/components/command-palette.css");
    expect(sheets).toContain("@skryensya/core/patterns/dialog-vaul.css");
    expect(sheets).toContain("@skryensya/core/components/dialog.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });
});

describe("comment-thread: nested articles with vote/reply/delete", () => {
  const thread = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "comment-thread",
      signature: "CommentThread",
      options: { label: "Comentarios" },
      slots: {
        children: {
          contract: "comment-thread",
          signature: "Comment",
          options: { commentId: "c1" },
          slots: {
            author: "Ada",
            children: "Hola",
            timestamp: "hace 3h",
          },
        },
      },
      ...overrides,
    }) as UsageTree;

  it("requires a thread label and at least one Comment", () => {
    expect(rules({ contract: "comment-thread", signature: "CommentThread" })).toEqual(
      expect.arrayContaining(["missing-required"]),
    );
    expect(validateUsageTree(thread()).valid).toBe(true);
  });

  it("rejects an empty required label", () => {
    expect(rules(thread({ options: { label: "" } }))).toContain("empty-required");
  });

  it("accepts a composer, vote, actions, and recursive replies", () => {
    const field = {
      contract: "form-field",
      signature: "FormField",
      slots: {
        label: "Comentario",
        children: { contract: "input", signature: "Textarea" },
      },
    };
    expect(
      validateUsageTree(
        thread({
          slots: {
            composer: {
              contract: "comment-thread",
              signature: "CommentComposer",
              slots: { children: field },
            },
            children: {
              contract: "comment-thread",
              signature: "Comment",
              options: { commentId: "c1", collapsible: true },
              slots: {
                author: "Ada",
                children: "Raíz",
                actions: {
                  contract: "comment-thread",
                  signature: "CommentActions",
                  options: { reply: true, deletable: true },
                  slots: {
                    children: {
                      contract: "comment-thread",
                      signature: "CommentVote",
                      options: { voted: "up" },
                      slots: { count: "4" },
                    },
                  },
                },
                replies: {
                  contract: "comment-thread",
                  signature: "Comment",
                  options: { commentId: "c1-r1" },
                  slots: { author: "Grace", children: "Respuesta" },
                },
                replyComposer: {
                  contract: "comment-thread",
                  signature: "CommentComposer",
                  options: { cancellable: true },
                  slots: { children: field },
                },
              },
            },
          },
        }),
      ).valid,
    ).toBe(true);
  });

  it("publishes vote/reply/delete/discard events and CommentThread mount", () => {
    const contract = getContract("comment-thread")!;
    expect(contract.events).toEqual({
      vote: "sk:commentvote",
      reply: "sk:commentreply",
      delete: "sk:commentdelete",
      discard: "sk:commentdiscard",
    });
    expect(contract.signatures.CommentThread.mount).toBe("data-sk-comment-thread");
    expect(contract.signatures.Comment.mount).toBe("data-sk-comment");
  });

  it("loads visually-hidden.css via hookSheets alongside button", () => {
    const { sheets, unplaced } = sheetsForTree(
      thread({
        slots: {
          children: {
            contract: "comment-thread",
            signature: "Comment",
            slots: {
              author: "Ada",
              children: "Hola",
              actions: {
                contract: "comment-thread",
                signature: "CommentVote",
                slots: { count: "1" },
              },
            },
          },
        },
      }),
    );
    expect(sheets).toContain("@skryensya/core/components/comment-thread.css");
    expect(sheets).toContain("@skryensya/core/patterns/visually-hidden.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });
});

describe("comment-thread: CommentVote in like style", () => {
  const vote = (options: Record<string, string>): UsageTree => ({
    contract: "comment-thread",
    signature: "CommentVote",
    options,
    slots: { count: "3" },
  });

  it("requires both labels in like style, since the defaults name a vote", () => {
    expect(rules(vote({ voteStyle: "like" }))).toContain("missing-implied");
    expect(messageFor(vote({ voteStyle: "like", voteUpLabel: "Like" }), "missing-implied")).toContain("voteDownLabel");
    expect(validateUsageTree(vote({ voteStyle: "like", voteUpLabel: "Like", voteDownLabel: "Dislike" })).valid).toBe(true);
  });

  it("leaves the vote style as it was: defaults are enough", () => {
    expect(validateUsageTree(vote({})).valid).toBe(true);
    expect(validateUsageTree(vote({ voteStyle: "vote" })).valid).toBe(true);
    expect(rules(vote({ voteStyle: "thumbs" }))).toContain("invalid-option-value");
  });
});

describe("component-preview: labelled demo with composed source", () => {
  const preview = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "component-preview",
      signature: "ComponentPreview.bare",
      slots: {
        title: "Button",
        stage: "demo",
        code: {
          contract: "code-preview",
          signature: "CodePreview",
          children: "const x = 1;",
        },
      },
      ...overrides,
    }) as UsageTree;

  it("requires title, stage, and a CodePreview", () => {
    expect(rules({ contract: "component-preview", signature: "ComponentPreview.bare" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(validateUsageTree(preview()).valid).toBe(true);
  });

  it("accepts an optional note and CodePreview.density", () => {
    expect(
      validateUsageTree(
        preview({
          slots: {
            title: "Button",
            note: "disabled",
            stage: "demo",
            code: {
              contract: "code-preview",
              signature: "CodePreview.density",
              slots: {
                label: "Fuente",
                condensed: "short",
                full: "long",
                condensedLabel: "Condensed",
                fullLabel: "Full",
              },
            },
          },
        }),
      ).valid,
    ).toBe(true);
  });

  it("publishes mount, document preference events, and composes code-preview sheets", () => {
    const contract = getContract("component-preview")!;
    expect(contract.signatures["ComponentPreview.bare"].mount).toBe("data-sk-component-preview");
    expect(contract.events).toEqual({
      bindingChange: "sk:componentpreviewbindingchange",
      screenChange: "sk:componentpreviewscreenchange",
    });

    const { sheets, unplaced } = sheetsForTree(preview());
    expect(sheets).toContain("@skryensya/core/components/component-preview.css");
    expect(sheets).toContain("@skryensya/core/components/code-preview.css");
    expect(unplaced).toEqual([]);
  });
});

describe("content: transient toast in a live region", () => {
  const toast = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "content",
      signature: "Toast",
      options: { tone: "success", dismissible: true, dismissLabel: "Cerrar aviso" },
      slots: { title: "Guardado", children: "Los cambios quedaron." },
      ...overrides,
    }) as UsageTree;

  const region = (child: UsageTree = toast()): UsageTree =>
    ({
      contract: "content",
      signature: "ToastRegion",
      slots: { children: child },
    }) as UsageTree;

  it("requires Toast children and accepts a dismissible toast in a region", () => {
    expect(rules({ contract: "content", signature: "Toast" })).toContain("missing-required-slot");
    expect(validateUsageTree(region()).valid).toBe(true);
  });

  it("rejects a non-positive timeout and requires dismissLabel when dismissible", () => {
    expect(
      rules(toast({ options: { tone: "success", dismissible: true, dismissLabel: "Cerrar", timeout: 0 } })),
    ).toContain("invalid-option-value");
    expect(
      rules({
        contract: "content",
        signature: "Toast",
        options: { dismissible: true },
        slots: { children: "Guardado." },
      }),
    ).toContain("missing-accessible-name");
  });

  it("accepts ToastTemplate with a required Toast blueprint", () => {
    expect(
      validateUsageTree({
        contract: "content",
        signature: "ToastTemplate",
        slots: { children: toast() },
      } as UsageTree).valid,
    ).toBe(true);
    expect(rules({ contract: "content", signature: "ToastTemplate" })).toContain("missing-required-slot");
  });

  it("publishes dismiss event, Toast mount, and loads callout + button sheets", () => {
    const contract = getContract("content")!;
    expect(contract.events).toEqual({ dismiss: "sk:toastdismiss" });
    expect(contract.signatures.Toast.mount).toBe("data-sk-toast");

    const { sheets, unplaced } = sheetsForTree(region());
    expect(sheets).toContain("@skryensya/core/components/toast.css");
    expect(sheets).toContain("@skryensya/core/components/callout.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });
});

describe("data-grid: 2d roving-tabindex grid", () => {
  const cell = (text: string): UsageTree => ({
    contract: "data-grid",
    signature: "DataGridCell",
    children: text,
  });
  const row = (...cells: UsageTree[]): UsageTree => ({
    contract: "data-grid",
    signature: "DataGridRow",
    children: cells.length === 1 ? cells[0]! : cells,
  });
  const grid = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "data-grid",
      signature: "DataGrid",
      options: { label: "Destinatarios" },
      slots: {
        children: row(cell("Ada"), cell("Quitar")),
      },
      ...overrides,
    }) as UsageTree;

  it("requires a label and at least one row of cells", () => {
    expect(rules({ contract: "data-grid", signature: "DataGrid" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot"]),
    );
    expect(validateUsageTree(grid()).valid).toBe(true);
  });

  it("rejects an empty required label", () => {
    expect(rules(grid({ options: { label: "" } }))).toContain("empty-required");
  });

  it("accepts wrap options and a ragged second row", () => {
    expect(
      validateUsageTree(
        grid({
          options: { label: "Destinatarios", wrapCols: true, wrapRows: true },
          slots: {
            children: [
              row(cell("Ada"), cell("Quitar")),
              row(cell("Grace"), cell("Quitar"), cell("Nota")),
            ],
          },
        }),
      ).valid,
    ).toBe(true);
  });

  it("publishes mount and its own stylesheet", () => {
    expect(getContract("data-grid")!.signatures.DataGrid.mount).toBe("data-sk-data-grid");
    const { sheets, unplaced } = sheetsForTree(grid());
    expect(sheets).toContain("@skryensya/core/components/data-grid.css");
    expect(unplaced).toEqual([]);
  });
});

describe("date-picker: field with derived calendar panel", () => {
  it("accepts an enhanced field and requires a label on the native layer", () => {
    expect(
      validateUsageTree({
        contract: "date-picker",
        signature: "DatePicker",
        options: { value: "2026-09-16", placeholder: "AAAA-MM-DD", invalid: true },
        slots: { label: "Fecha" },
      }).valid,
    ).toBe(true);
    expect(rules({ contract: "date-picker", signature: "DatePicker.native" })).toContain(
      "missing-required-slot",
    );
    expect(
      validateUsageTree({
        contract: "date-picker",
        signature: "DatePicker.native",
        options: { name: "arrival", value: "2026-09-16", min: "2026-01-01", max: "2026-12-31" },
        slots: { label: "Llegada" },
      }).valid,
    ).toBe(true);
  });

  it("publishes valueChange, mount, and portals on the machine signature", () => {
    const contract = getContract("date-picker")!;
    expect(contract.events).toEqual({ valueChange: "sk:datepickervaluechange" });
    expect(contract.signatures.DatePicker.mount).toBe("data-sk-date-picker");
    expect(contract.signatures.DatePicker.portals).toEqual({ container: true });
    expect(contract.signatures["DatePicker.native"].portals).toBeUndefined();
  });

  it("loads anchored.css via hookSheets for the floating calendar", () => {
    const { sheets, unplaced } = sheetsForTree({
      contract: "date-picker",
      signature: "DatePicker",
      options: { value: "2026-09-16" },
      slots: { label: "Fecha" },
    });
    expect(sheets).toContain("@skryensya/core/components/date-picker.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });

  it("pins value/min/max to ISO calendar days", () => {
    expect(
      rules({
        contract: "date-picker",
        signature: "DatePicker",
        options: { value: "Sept 16" },
        slots: { label: "Fecha" },
      }),
    ).toContain("invalid-option-value");
    expect(
      rules({
        contract: "date-picker",
        signature: "DatePicker.native",
        options: { name: "arrival", min: "01/01/2026" },
        slots: { label: "Llegada" },
      }),
    ).toContain("invalid-option-value");
  });
});

/* The platform half of `accordion`. It was its own contract until the two merged; `contract:
   "details"` is now an unknown contract, which the first assertion below pins. */
describe("accordion: platform disclosure without a machine", () => {
  const details = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "accordion",
      signature: "Details",
      options: { name: "faq" },
      children: [
        { contract: "accordion", signature: "Details.Summary", children: "Requisitos" },
        { contract: "accordion", signature: "Details.Content", children: "Node 24" },
      ],
      ...overrides,
    }) as UsageTree;

  it("no longer answers to a contract of its own", () => {
    expect(rules({ contract: "details", signature: "Details" })).toContain("unknown-contract");
    expect(getContract("details")).toBeUndefined();
  });

  it("requires Summary then Content, and rejects a bare Details", () => {
    expect(rules({ contract: "accordion", signature: "Details" })).toContain("missing-required-slot");
    expect(validateUsageTree(details()).valid).toBe(true);
    expect(
      rules({
        contract: "accordion",
        signature: "Details",
        children: [{ contract: "accordion", signature: "Details.Content", children: "Body" }],
      }),
    ).toContain("wrong-cardinality");
  });

  it("accepts an exclusive DetailsGroup of named siblings", () => {
    expect(
      validateUsageTree({
        contract: "accordion",
        signature: "DetailsGroup",
        children: [
          details({ options: { name: "deploy", open: true } }),
          details({ options: { name: "deploy" } }),
        ],
      }).valid,
    ).toBe(true);
    expect(rules({ contract: "accordion", signature: "DetailsGroup" })).toContain("missing-required-slot");
  });

  /* `details.css` is now one of `accordion`'s `hookSheets` rather than a contract's own `css`, and
     this is what makes sure that rewiring still puts the sheet in front of a `<details>` tree: a
     page that composes one and imports nothing else gets it, with nothing left unplaced. */
  it("still reaches its stylesheet, now through accordion's hookSheets", () => {
    expect(getContract("accordion")!.hookSheets ?? []).toContain(
      "@skryensya/core/components/details.css",
    );
    const { sheets, unplaced } = sheetsForTree(details());
    expect(sheets).toContain("@skryensya/core/components/details.css");
    expect(unplaced).toEqual([]);
  });
});

describe("editor: rich-text field with derived toolbar", () => {
  const editor = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "editor",
      signature: "Editor",
      options: { label: "Notas", placeholder: "Escribe algo", toolbarLabel: "Formato" },
      ...overrides,
    }) as UsageTree;

  it("accepts the field options and rejects an unknown command option", () => {
    expect(validateUsageTree(editor()).valid).toBe(true);
    expect(
      rules(
        editor({
          options: { label: "Notas", toolbarCompact: "yes" },
        }),
      ),
    ).toContain("invalid-option-value");
  });

  it("publishes change/ready events, mount, and autoFocus prop alias", () => {
    const contract = getContract("editor")!;
    expect(contract.events).toEqual({ change: "sk:editorchange", ready: "sk:editorready" });
    expect(contract.signatures.Editor.mount).toBe("data-sk-editor");
    expect(contract.options.autofocus.prop).toBe("autoFocus");
  });

  it("loads toolbar/input via also and popover/anchored via hookSheets", () => {
    expect(getContract("editor")!.hookSheets).toEqual([
      "@skryensya/core/components/popover.css",
      "@skryensya/core/patterns/anchored.css",
    ]);
    const { sheets, unplaced } = sheetsForTree(editor());
    expect(sheets).toContain("@skryensya/core/components/editor.css");
    expect(sheets).toContain("@skryensya/core/components/toolbar.css");
    expect(sheets).toContain("@skryensya/core/components/input.css");
    expect(sheets).toContain("@skryensya/core/components/popover.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(unplaced).toEqual([]);
  });
});

describe("empty-state: intentional absence with a next action", () => {
  it("requires a text title and accepts Icon plus Button actions", () => {
    expect(rules({ contract: "empty-state", signature: "EmptyState" })).toContain(
      "missing-required-slot",
    );
    expect(
      validateUsageTree({
        contract: "empty-state",
        signature: "EmptyState",
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "search" } },
          title: "No hay resultados",
          description: "Prueba con otros términos.",
          actions: {
            contract: "button",
            signature: "Button.action",
            children: "Reintentar",
          },
        },
      }).valid,
    ).toBe(true);
  });

  it("rejects a non-Icon in the icon slot", () => {
    expect(
      rules({
        contract: "empty-state",
        signature: "EmptyState",
        slots: {
          title: "Vacío",
          icon: { contract: "badge", signature: "Badge", children: "1" },
        },
      }),
    ).toContain("slot-accepts");
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("empty-state")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree({
      contract: "empty-state",
      signature: "EmptyState",
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "search" } },
        title: "No hay resultados",
      },
    });
    expect(sheets).toContain("@skryensya/core/components/empty-state.css");
    expect(sheets).toContain("@skryensya/core/patterns/icon.css");
    expect(unplaced).toEqual([]);
  });
});

describe("fade-edge: paint-only clipped edge", () => {
  const fade = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "fade-edge",
      signature: "FadeEdge",
      children: "Contenido que se desvanece",
      ...overrides,
    }) as UsageTree;

  it("requires children and accepts mode/direction/size/color", () => {
    expect(rules({ contract: "fade-edge", signature: "FadeEdge" })).toContain(
      "missing-required-slot",
    );
    expect(
      validateUsageTree(
        fade({
          options: {
            mode: "color",
            direction: "to-right",
            size: "7rem",
            color: "rgb(15 23 42 / 85%)",
          },
        }),
      ).valid,
    ).toBe(true);
  });

  it("rejects an unknown mode or direction", () => {
    expect(rules(fade({ options: { mode: "mask" } }))).toContain("invalid-option-value");
    expect(rules(fade({ options: { direction: "down" } }))).toContain("invalid-option-value");
  });

  it("rejects color when mode is the default transparent fade", () => {
    expect(rules(fade({ options: { color: "red" } }))).toContain("excluded-option");
    expect(rules(fade({ options: { mode: "color", color: "red" } }))).not.toContain("excluded-option");
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("fade-edge")!.hookSheets ?? []).toEqual([]);
    expect(getContract("fade-edge")!.hooks).toEqual([
      "--sk-fade-edge-color",
      "--sk-fade-edge-mask-ramp",
      "--sk-fade-edge-ramp",
      "--sk-fade-edge-size",
    ]);
    const { sheets, unplaced } = sheetsForTree(fade());
    expect(sheets).toContain("@skryensya/core/components/fade-edge.css");
    expect(unplaced).toEqual([]);
  });
});

describe("feed: named stream of articles", () => {
  const article = (
    posInset: number,
    setSize: number,
    label = "Ana",
    body = "Publicó.",
  ): UsageTree => ({
    contract: "feed",
    signature: "FeedArticle",
    options: { posInset, setSize },
    slots: { label, children: body },
  });

  const feed = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "feed",
      signature: "Feed",
      options: { label: "Actividad reciente" },
      children: [article(1, 1)],
      ...overrides,
    }) as UsageTree;

  it("requires a label and at least one FeedArticle", () => {
    expect(rules({ contract: "feed", signature: "Feed" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot"]),
    );
    expect(rules(feed({ options: { label: "" } }))).toContain("empty-required");
    expect(validateUsageTree(feed()).valid).toBe(true);
  });

  it("requires article posInset/setSize and rejects out-of-range values", () => {
    expect(
      rules({
        contract: "feed",
        signature: "Feed",
        options: { label: "Actividad" },
        children: [
          {
            contract: "feed",
            signature: "FeedArticle",
            slots: { label: "Ana", children: "Hola" },
          },
        ],
      }),
    ).toEqual(expect.arrayContaining(["missing-required"]));
    expect(rules(feed({ children: [article(0, 1)] }))).toContain("invalid-option-value");
    expect(rules(feed({ children: [article(1, -2)] }))).toContain("invalid-option-value");
    expect(rules(feed({ children: [article(1.5, 1)] }))).toContain("invalid-option-value");
    expect(validateUsageTree(feed({ children: [article(1, -1)] })).valid).toBe(true);
  });

  it("rejects a non-FeedArticle child and a bare FeedArticle", () => {
    expect(
      rules(
        feed({
          children: [
            { contract: "typography", signature: "Text", children: "no es un artículo" },
          ],
        }),
      ),
    ).toContain("slot-accepts");
    expect(
      rules({
        contract: "feed",
        signature: "FeedArticle",
        options: { posInset: 1, setSize: 1 },
        slots: { label: "Ana", children: "Hola" },
      }),
    ).toContain("invalid-parent");
  });

  it("names the feed via a11y and writes busy false explicitly", () => {
    const contract = getContract("feed")!;
    expect(contract.a11y).toEqual([
      expect.objectContaining({
        signatures: ["Feed"],
        requiresOneOf: ["label"],
      }),
    ]);
    expect(contract.options.busy.falseValue).toBe("false");
    expect(emitMarkup(feed({ options: { label: "Actividad", busy: false } }))).toContain(
      'aria-busy="false"',
    );
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("feed")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(feed());
    expect(sheets).toContain("@skryensya/core/components/feed.css");
    expect(unplaced).toEqual([]);
  });
});

describe("file-upload: labelled dropzone shell", () => {
  const upload = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "file-upload",
      signature: "FileUpload",
      options: { name: "attachments", multiple: true, maxFiles: 3 },
      slots: {
        label: "Adjuntos",
        dropzoneLabel: "Arrastra archivos aquí",
        triggerLabel: "Elegir archivos",
      },
      ...overrides,
    }) as UsageTree;

  it("requires label, dropzoneLabel and triggerLabel", () => {
    expect(rules({ contract: "file-upload", signature: "FileUpload" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(
      rules(upload({ slots: { label: "Adjuntos", dropzoneLabel: "Arrastra" } })),
    ).toContain("missing-required-slot");
    expect(validateUsageTree(upload()).valid).toBe(true);
  });

  it("rejects out-of-range maxFiles / maxFileSize", () => {
    expect(rules(upload({ options: { maxFiles: 0 } }))).toContain("invalid-option-value");
    expect(rules(upload({ options: { maxFileSize: 1.5 } }))).toContain("invalid-option-value");
    expect(validateUsageTree(upload({ options: { maxFiles: 1, maxFileSize: 1024 } })).valid).toBe(
      true,
    );
  });

  it("emits clear only when clearLabel is authored, and publishes the change event", () => {
    expect(emitMarkup(upload())).not.toContain("data-sk-file-upload-clear");
    expect(emitMarkup(upload({ slots: { ...upload().slots, clearLabel: "Quitar todos" } }))).toContain(
      "data-sk-file-upload-clear",
    );
    expect(getContract("file-upload")!.events).toEqual({ change: "sk:fileuploadchange" });
    expect(getContract("file-upload")!.signatures.FileUpload.mount).toBe("data-sk-file-upload");
  });

  it("loads button.css via also and keeps its own sheet", () => {
    expect(getContract("file-upload")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(upload());
    expect(sheets).toContain("@skryensya/core/components/file-upload.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });
});

describe("folder: measured tab silhouette", () => {
  const folder = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "folder",
      signature: "Folder",
      slots: { label: "Radio", children: "Una radio personal." },
      ...overrides,
    }) as UsageTree;

  const preview = (child = "1"): UsageTree => ({
    contract: "folder",
    signature: "FolderPreview",
    slots: { children: child },
  });

  it("requires label and children on Folder, and href on FolderLink", () => {
    expect(rules({ contract: "folder", signature: "Folder" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(validateUsageTree(folder()).valid).toBe(true);
    expect(
      rules({
        contract: "folder",
        signature: "FolderLink",
        slots: { label: "Radio", children: "Cuerpo" },
      }),
    ).toContain("missing-required");
    expect(
      validateUsageTree({
        contract: "folder",
        signature: "FolderLink",
        options: { href: "#radio" },
        slots: { label: "Radio", children: "Cuerpo" },
      }).valid,
    ).toBe(true);
  });

  it("keeps FolderPreview under Folder/FolderLink and FolderStack children to folders", () => {
    expect(rules(preview())).toContain("invalid-parent");
    expect(
      validateUsageTree(
        folder({
          slots: {
            label: "Radio",
            children: "Cuerpo",
            previews: [preview("1"), preview("2")],
          },
        }),
      ).valid,
    ).toBe(true);
    expect(
      rules({
        contract: "folder",
        signature: "FolderStack",
        slots: {
          children: [{ contract: "typography", signature: "Text", children: "no" }],
        },
      }),
    ).toContain("slot-accepts");
    expect(
      validateUsageTree({
        contract: "folder",
        signature: "FolderStack",
        options: { overlap: "100px" },
        slots: {
          children: [
            folder(),
            {
              contract: "folder",
              signature: "FolderLink",
              options: { href: "#otro" },
              slots: { label: "Otro", children: "Más." },
            },
          ],
        },
      }).valid,
    ).toBe(true);
  });

  it("publishes mount on Folder/FolderLink and runtime clip/tail outputHooks", () => {
    const contract = getContract("folder")!;
    expect(contract.signatures.Folder.mount).toBe("data-sk-folder");
    expect(contract.signatures.FolderLink.mount).toBe("data-sk-folder");
    expect(contract.outputHooks).toEqual(["--sk-folder-clip", "--sk-folder-tail"]);
    expect(contract.hooks).toEqual(expect.arrayContaining(["--sk-folder-clip", "--sk-folder-tail"]));
    expect(emitMarkup(folder({ options: { active: true } }))).toContain("data-active");
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("folder")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(folder());
    expect(sheets).toContain("@skryensya/core/components/folder.css");
    expect(unplaced).toEqual([]);
  });
});

describe("footer: page closing band", () => {
  const text: UsageTree = { contract: "typography", signature: "Text", children: "Crédito" };
  const footer = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "footer",
      signature: "Footer",
      children: text,
      ...overrides,
    }) as UsageTree;

  it("requires children and defaults to a sunken, divided <footer>", () => {
    expect(rules({ contract: "footer", signature: "Footer" })).toContain("missing-required-slot");
    expect(validateUsageTree(footer()).valid).toBe(true);
    const markup = emitMarkup(footer());
    expect(markup).toMatch(/^<footer\s+class="sk-footer"/);
    expect(markup).toContain('data-padding="lg"');
    expect(markup).toContain('data-surface="sunken"');
    expect(markup).toContain("data-divider");
    expect(markup).not.toContain('data-divider="false"');
  });

  it("writes data-divider=\"false\" when opted out so CSS can drop the hairline", () => {
    expect(emitMarkup(footer({ options: { divider: false } }))).toContain('data-divider="false"');
    expect(getContract("footer")!.options.divider.falseValue).toBe("false");
  });

  it("emits a nested Footer as a div, off the contentinfo landmark", () => {
    const markup = emitMarkup(footer({ options: { footerElement: "div" } }));
    expect(markup).toMatch(/^<div\s+class="sk-footer"/);
    expect(JSON.stringify(emitReactSource(footer({ options: { footerElement: "div" } })))).toContain(
      'as=\\"div\\"',
    );
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("footer")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(footer());
    expect(sheets).toContain("@skryensya/core/patterns/footer.css");
    expect(unplaced).toEqual([]);
  });
});

describe("form-field: labelled control chrome", () => {
  const field = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "form-field",
      signature: "FormField",
      slots: { label: "Email" },
      children: {
        contract: "input",
        signature: "Input",
        options: { name: "email" },
      },
      ...overrides,
    }) as UsageTree;

  it("requires label and a control child", () => {
    expect(rules({ contract: "form-field", signature: "FormField" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(
      rules({
        contract: "form-field",
        signature: "FormField",
        slots: { label: "Email" },
      }),
    ).toContain("missing-required-slot");
    expect(validateUsageTree(field()).valid).toBe(true);
  });

  it("treats the error slot as what makes the field invalid, and wires ids from one name", () => {
    const withError = emitMarkup(
      field({
        options: { required: true },
        slots: { label: "Email", hint: "Sólo boletas.", error: "Falta." },
      }),
    );
    expect(withError).toContain('aria-invalid="true"');
    expect(withError).toContain('aria-describedby="email-hint email-error"');
    expect(withError).toContain('for="email"');
    expect(emitMarkup(field())).not.toContain("aria-invalid");
  });

  it("emits labelHidden and puts required/disabled on the control, not the box", () => {
    const markup = emitMarkup(
      field({ options: { labelHidden: true, required: true, disabled: true } }),
    );
    expect(markup).toContain("data-label-hidden");
    expect(markup).toContain("<input");
    expect(markup).toMatch(/<input[^>]*\srequired/);
    expect(markup).toMatch(/<input[^>]*\sdisabled/);
    expect(markup).toContain('class="sk-form-field__required"');
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("form-field")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(field());
    expect(sheets).toContain("@skryensya/core/components/form-field.css");
    expect(sheets).toContain("@skryensya/core/components/input.css");
    expect(unplaced).toEqual([]);
  });
});

describe("hero: page opening band", () => {
  const text: UsageTree = { contract: "typography", signature: "Text", children: "Hola" };
  const hero = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "hero",
      signature: "Hero",
      children: text,
      ...overrides,
    }) as UsageTree;

  it("requires children and defaults to a surfaced, padded, start-aligned div", () => {
    expect(rules({ contract: "hero", signature: "Hero" })).toContain("missing-required-slot");
    expect(validateUsageTree(hero()).valid).toBe(true);
    const markup = emitMarkup(hero());
    expect(markup).toMatch(/^<div\s+class="sk-hero"/);
    expect(markup).toContain('data-padding="xl"');
    expect(markup).toContain('data-surface="surface"');
    expect(markup).toContain('data-align="start"');
  });

  it("emits a Hero as a named section landmark when heroElement asks", () => {
    const markup = emitMarkup(hero({ options: { heroElement: "section", align: "center" } }));
    expect(markup).toMatch(/^<section\s+class="sk-hero"/);
    expect(markup).toContain('data-align="center"');
    expect(JSON.stringify(emitReactSource(hero({ options: { heroElement: "section" } })))).toContain(
      'as=\\"section\\"',
    );
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("hero")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(hero());
    expect(sheets).toContain("@skryensya/core/patterns/hero.css");
    expect(unplaced).toEqual([]);
  });
});

describe("state-button: multi-face icon control", () => {
  const faces = [
    { options: { name: "idle", icon: "copy" }, slots: {} },
    { options: { name: "copied", icon: "check" }, slots: {} },
  ];
  const button = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "state-button",
      signature: "StateButton",
      options: { current: "idle" },
      attrs: { "aria-label": "Copiar" },
      slots: { faces },
      ...overrides,
    }) as UsageTree;

  it("requires faces and an accessible name", () => {
    expect(rules({ contract: "state-button", signature: "StateButton" })).toEqual(
      expect.arrayContaining(["missing-required-slot", "missing-accessible-name"]),
    );
    expect(rules(button({ attrs: {} }))).toContain("missing-accessible-name");
    expect(validateUsageTree(button()).valid).toBe(true);
  });

  it("rejects a current that names no face, and accepts aria-labelledby", () => {
    expect(rules(button({ options: { current: "missing" } }))).toContain("unknown-key");
    expect(
      rules(
        button({
          attrs: { "aria-labelledby": "copy-title" },
          options: { current: "copied" },
        }),
      ),
    ).not.toContain("missing-accessible-name");
  });

  it("bakes data-icon-only and marks the current face active at emit", () => {
    const markup = emitMarkup(button());
    expect(markup).toContain('class="sk-state-button sk-button sk-interactive sk-icon-toggle"');
    expect(markup).toContain("data-icon-only");
    expect(markup).toContain('data-current="idle"');
    expect(markup).toMatch(/data-face="idle"[^>]*data-active|data-active[^>]*data-face="idle"/);
    expect(markup).toContain('data-sk-icon="copy"');
    expect(markup).toContain('data-face="copied"');
    expect(markup).not.toMatch(/data-face="copied"[^>]*data-active/);
  });

  it("rejects a single face and a face with no icon", () => {
    expect(
      rules(button({ slots: { faces: [{ options: { name: "idle", icon: "copy" }, slots: {} }] } })),
    ).toContain("wrong-cardinality");
    expect(
      rules(
        button({
          slots: {
            faces: [
              { options: { name: "idle", icon: "copy" }, slots: {} },
              { options: { name: "done" }, slots: {} },
            ],
          },
        }),
      ),
    ).toContain("missing-required");
  });

  it("loads button.css via also and its own sheet, with no foreign hookSheets", () => {
    expect(getContract("state-button")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(button());
    expect(sheets).toContain("@skryensya/core/components/state-button.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });
});

describe("image-frame: clipped media box", () => {
  const frame = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "image-frame",
      signature: "ImageFrame",
      options: { src: "/cover.jpg", alt: "Portada" },
      ...overrides,
    }) as UsageTree;

  it("defaults geometry attrs and requires exactly one media source", () => {
    expect(rules({ contract: "image-frame", signature: "ImageFrame" })).toContain("missing-exactly-one");
    expect(validateUsageTree(frame()).valid).toBe(true);
    const markup = emitMarkup(frame());
    expect(markup).toMatch(/^<div\s+class="sk-image-frame"/);
    expect(markup).toContain('data-aspect="auto"');
    expect(markup).toContain('data-fit="cover"');
    expect(markup).toContain('data-position="center"');
    expect(markup).toContain('data-radius="surface"');
    expect(markup).toContain('data-border="none"');
    expect(markup).toContain('class="sk-image-frame__media"');
    expect(markup).toContain('src="/cover.jpg"');
    expect(markup).toContain('alt="Portada"');
  });

  it("emits a figure host and React as when frameElement asks", () => {
    const tree = frame({ options: { src: "/cover.jpg", alt: "Portada", frameElement: "figure" } });
    expect(validateUsageTree(tree).valid).toBe(true);
    expect(emitMarkup(tree)).toMatch(/^<figure\s+class="sk-image-frame"/);
    expect(JSON.stringify(emitReactSource(tree))).toContain('as=\\"figure\\"');
  });

  it("keeps a MediaCaption beside src media and loads media-gradient.css from the caption tree", () => {
    const withCaption = frame({
      options: { src: "/cover.jpg", alt: "Portada", aspect: "16/9", border: "subtle" },
      slots: {
        caption: {
          contract: "media-gradient",
          signature: "MediaCaption",
          options: { edge: "bottom" },
          children: [
            { contract: "media-gradient", signature: "MediaGradient", options: { strength: "md" } },
            "Título",
          ],
        },
      },
    });
    expect(validateUsageTree(withCaption).valid).toBe(true);
    const markup = emitMarkup(withCaption);
    expect(markup).toContain('class="sk-media-caption"');
    expect(markup).toContain('class="sk-media-gradient"');
    expect(markup).toContain("aria-hidden");
    const { sheets, unplaced } = sheetsForTree(withCaption);
    expect(sheets).toContain("@skryensya/core/patterns/image-frame.css");
    expect(sheets).toContain("@skryensya/core/patterns/media-gradient.css");
    expect(unplaced).toEqual([]);
  });

  it("accepts authored children as the other media source, and requires alt when src is present", () => {
    expect(
      validateUsageTree({
        contract: "image-frame",
        signature: "ImageFrame",
        children: {
          contract: "typography",
          signature: "Text",
          children: "not really media, but the slot is node",
        },
      }).valid,
    ).toBe(true);
    expect(rules(frame({ options: { src: "/cover.jpg" } }))).toContain("missing-accessible-name");
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("image-frame")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(frame());
    expect(sheets).toContain("@skryensya/core/patterns/image-frame.css");
    expect(unplaced).toEqual([]);
  });
});

describe("input: native text controls", () => {
  const field = (control: UsageTree, overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "form-field",
      signature: "FormField",
      slots: { label: "Email" },
      children: control,
      ...overrides,
    }) as UsageTree;

  const textInput = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "input",
      signature: "Input",
      options: { name: "email" },
      ...overrides,
    }) as UsageTree;

  it("requires FormField around Input/Textarea, and a type on NativeInput", () => {
    expect(rules(textInput())).toContain("invalid-parent");
    expect(
      rules({ contract: "input", signature: "Textarea", options: { name: "notes" } }),
    ).toContain("invalid-parent");
    expect(rules({ contract: "input", signature: "NativeInput" })).toEqual(
      expect.arrayContaining(["missing-required"]),
    );
    expect(
      validateUsageTree({
        contract: "input",
        signature: "NativeInput",
        options: { type: "time", name: "at" },
      }).valid,
    ).toBe(true);
    expect(validateUsageTree(field(textInput())).valid).toBe(true);
  });

  it("emits type=text by default, controlSize as data-size, and sk-input on every signature", () => {
    const markup = emitMarkup(field(textInput({ options: { name: "email", controlSize: "sm" } })));
    expect(markup).toContain('class="sk-input"');
    expect(markup).toContain('type="text"');
    expect(markup).toContain('data-size="sm"');
    expect(markup).toContain('id="email"');

    const textarea = emitMarkup(
      field({
        contract: "input",
        signature: "Textarea",
        options: { name: "notes", placeholder: "…" },
      }),
    );
    expect(textarea).toMatch(/<textarea\s+class="sk-input"/);
    expect(textarea).toContain('placeholder="…"');

    const native = emitMarkup({
      contract: "input",
      signature: "NativeInput",
      options: { type: "time", name: "at", controlSize: "sm" },
    });
    expect(native).toMatch(/<input\s+class="sk-input"/);
    expect(native).toContain('type="time"');
    expect(native).toContain('data-size="sm"');
  });

  it("publishes its own stylesheet with no foreign hookSheets", () => {
    expect(getContract("input")!.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(field(textInput()));
    expect(sheets).toContain("@skryensya/core/components/input.css");
    expect(sheets).toContain("@skryensya/core/components/form-field.css");
    expect(unplaced).toEqual([]);
  });
});

describe("layout: flow primitives that own only their own parts", () => {
  const text: UsageTree = { contract: "typography", signature: "Text", children: "Hola" };

  it("publishes only stack/inline/grid/layoutGrid parts and layout.css hooks", () => {
    const contract = getContract("layout")!;
    expect(Object.values(contract.parts).sort()).toEqual([
      "sk-grid",
      "sk-inline",
      "sk-layout-grid",
      "sk-stack",
    ]);
    expect(contract.hooks?.every((hook) => /--sk-(stack|inline|grid|layout)-/.test(hook))).toBe(true);
    expect(contract.hookSheets ?? []).toEqual([]);
  });

  it("loads layout.css for a Stack tree (no box/wrapper claim)", () => {
    const tree: UsageTree = { contract: "layout", signature: "Stack", children: text };
    const { sheets, unplaced } = sheetsForTree(tree);
    expect(sheets).toContain("@skryensya/core/patterns/layout.css");
    expect(sheets).not.toContain("@skryensya/core/patterns/box.css");
    expect(sheets).not.toContain("@skryensya/core/patterns/wrapper.css");
    expect(unplaced).toEqual([]);
  });

  it("accepts Stack/Inline/Grid/LayoutGrid/Main shapes and Grid fill", () => {
    expect(validateUsageTree({ contract: "layout", signature: "Stack", children: text }).valid).toBe(true);
    expect(
      validateUsageTree({
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", wrap: false, blockStart: "auto" },
        children: text,
      }).valid,
    ).toBe(true);
    expect(
      validateUsageTree({
        contract: "layout",
        signature: "Grid",
        options: { columns: "3", responsive: true, fill: true },
        children: text,
      }).valid,
    ).toBe(true);
    expect(validateUsageTree({ contract: "layout", signature: "LayoutGrid", children: text }).valid).toBe(true);
    expect(validateUsageTree({ contract: "layout", signature: "Main" }).valid).toBe(true);

    const grid = emitMarkup({
      contract: "layout",
      signature: "Grid",
      options: { columns: "5", responsive: true, fill: true },
      children: text,
    });
    expect(grid).toContain('data-columns="5"');
    expect(grid).toContain("data-responsive");
    expect(grid).toContain("data-fill");
  });

  it("requires children on flow signatures but not on Main", () => {
    expect(rules({ contract: "layout", signature: "Stack" })).toContain("missing-required-slot");
    expect(rules({ contract: "layout", signature: "Main" })).not.toContain("missing-required-slot");
  });
});

describe("list: semantic rows with link and button actions", () => {
  const item = (title: string): UsageTree => ({
    contract: "list",
    signature: "ListItem",
    slots: { title },
  });
  const link = (title: string, href: string): UsageTree => ({
    contract: "list",
    signature: "ListItemLink",
    options: { href },
    slots: { title },
  });
  const button = (title: string): UsageTree => ({
    contract: "list",
    signature: "ListItemButton",
    slots: { title },
  });
  const list = (...children: UsageTree[]): UsageTree => ({
    contract: "list",
    signature: "List",
    children,
  });

  it("accepts inert, link and button rows, and requires href on a link row", () => {
    expect(validateUsageTree(list(item("A"), link("B", "/b"), button("C"))).valid).toBe(true);
    expect(rules({ contract: "list", signature: "ListItemLink", slots: { title: "X" } })).toEqual(
      expect.arrayContaining(["missing-required", "invalid-parent"]),
    );
  });

  it("emits role=list, dividers=none, compact density, and button type=button", () => {
    const tree: UsageTree = {
      contract: "list",
      signature: "OrderedList",
      options: { density: "compact", dividers: false },
      children: [item("Uno"), button("Actuar"), link("Ir", "/ir")],
    };
    expect(validateUsageTree(tree).valid).toBe(true);
    const markup = emitMarkup(tree);
    expect(markup).toMatch(/^<ol\s+class="sk-list"/);
    expect(markup).toContain('role="list"');
    expect(markup).toContain('data-density="compact"');
    expect(markup).toContain('data-dividers="none"');
    expect(markup).toContain('class="sk-list__action sk-interactive"');
    expect(markup).toMatch(/<button[^>]*type="button"/);
    expect(markup).toContain('href="/ir"');
  });

  it("emits native disabled + aria-disabled on ListItemButton, data-disabled on inert rows", () => {
    const tree: UsageTree = {
      contract: "list",
      signature: "List",
      children: [
        { contract: "list", signature: "ListItem", options: { disabled: true }, slots: { title: "Inerte" } },
        {
          contract: "list",
          signature: "ListItemButton",
          options: { disabled: true },
          slots: { title: "Actuar" },
        },
      ],
    };
    expect(validateUsageTree(tree).valid).toBe(true);
    const markup = emitMarkup(tree);
    expect(markup).toMatch(/<li[^>]*data-disabled[^>]*>[\s\S]*Inerte/);
    expect(markup).toMatch(/<button[^>]*\sdisabled/);
    expect(markup).toMatch(/<button[^>]*aria-disabled="true"/);
    expect(markup).not.toMatch(/<button[^>]*data-disabled/);
  });

  it("publishes only list anatomy parts (not sk-interactive) and its own sheet", () => {
    const contract = getContract("list")!;
    expect(Object.values(contract.parts)).not.toContain("sk-interactive");
    expect(contract.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(list(item("A"), button("B")));
    expect(sheets).toEqual(["@skryensya/core/components/list.css"]);
    expect(unplaced).toEqual([]);
  });

  it("rejects a row outside a List and a non-row child", () => {
    expect(rules(item("orphan"))).toContain("invalid-parent");
    expect(
      rules({
        contract: "list",
        signature: "List",
        children: { contract: "typography", signature: "Text", children: "no" },
      }),
    ).toContain("slot-accepts");
  });
});

describe("marquee: requested and automatic continuous strips", () => {
  const manual = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "marquee",
      signature: "Marquee",
      slots: { playLabel: "Reproducir", pauseLabel: "Pausar", children: "NORTHSTAR" },
      ...overrides,
    }) as UsageTree;

  const autoplay = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "marquee",
      signature: "Marquee.autoplay",
      slots: { children: "NORTHSTAR" },
      ...overrides,
    }) as UsageTree;

  it("requires play/pause labels on Marquee and accepts autoplay without a control", () => {
    expect(rules({ contract: "marquee", signature: "Marquee", slots: { children: "X" } })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(validateUsageTree(manual()).valid).toBe(true);
    expect(validateUsageTree(autoplay()).valid).toBe(true);
    expect(
      validateUsageTree(
        autoplay({
          options: { control: true },
          slots: { playLabel: "Reproducir", pauseLabel: "Pausar", children: "NORTHSTAR" },
        }),
      ).valid,
    ).toBe(true);
  });

  it("rejects autoplay control without play and pause labels", () => {
    expect(rules(autoplay({ options: { control: true } }))).toContain("missing-implied");
    expect(
      rules(
        autoplay({
          options: { control: true },
          slots: { playLabel: "Reproducir", children: "NORTHSTAR" },
        }),
      ),
    ).toContain("missing-implied");
  });

  it("emits mount, defaults, dual content copies, and a Button toggle only when required", () => {
    const paused = emitMarkup(manual({ options: { direction: "right", speed: "slow", fade: "none" } }));
    expect(paused).toContain('data-sk-marquee');
    expect(paused).toContain('data-start="manual"');
    expect(paused).toContain('data-state="paused"');
    expect(paused).toContain('data-direction="right"');
    expect(paused).toContain('data-speed="slow"');
    expect(paused).toContain('data-fade="none"');
    expect(paused).toContain('class="sk-marquee__content"');
    expect(paused).toContain('aria-hidden="true"');
    expect(paused).toContain('class="sk-marquee__toggle sk-button sk-interactive"');
    expect(paused).toContain("sk-visually-hidden");

    const ambient = emitMarkup(autoplay({ options: { direction: "up", speed: "fast" } }));
    expect(ambient).toContain('data-start="auto"');
    expect(ambient).toContain('data-state="playing"');
    expect(ambient).not.toContain("sk-marquee__toggle");
    expect(ambient).not.toContain("data-control");

    const withControl = emitMarkup(
      autoplay({
        options: { control: true },
        slots: { playLabel: "Reproducir", pauseLabel: "Pausar", children: "NORTHSTAR" },
      }),
    );
    expect(withControl).toContain("data-control");
    expect(withControl).toContain('aria-pressed="true"');
  });

  it("loads button via also and visually-hidden via hookSheets, and publishes outputHooks", () => {
    const contract = getContract("marquee")!;
    expect(contract.hookSheets).toEqual(["@skryensya/core/patterns/visually-hidden.css"]);
    expect(contract.outputHooks).toEqual(["--sk-marquee-duration", "--sk-marquee-gap-fill"]);
    expect(contract.hooks).toEqual(
      expect.arrayContaining(["--sk-marquee-vertical-size", "--sk-marquee-gap-fill"]),
    );
    expect(contract.signatures.Marquee.mount).toBe("data-sk-marquee");
    expect(contract.signatures["Marquee.autoplay"].options).toContain("control");
    expect(contract.signatures.Marquee.options).not.toContain("control");

    const { sheets, unplaced } = sheetsForTree(manual());
    expect(sheets).toContain("@skryensya/core/components/marquee.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(sheets).toContain("@skryensya/core/patterns/visually-hidden.css");
    expect(unplaced).toEqual([]);
  });
});

describe("media-gradient: caption measure and decorative wash", () => {
  const caption = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "image-frame",
      signature: "ImageFrame",
      options: { src: "/cover.jpg", alt: "Portada" },
      slots: {
        caption: {
          contract: "media-gradient",
          signature: "MediaCaption",
          options: { edge: "bottom" },
          children: [
            { contract: "media-gradient", signature: "MediaGradient", options: { strength: "md" } },
            "Título",
          ],
        },
      },
      ...overrides,
    }) as UsageTree;

  it("requires ImageFrame around MediaCaption and MediaCaption around MediaGradient", () => {
    expect(rules({ contract: "media-gradient", signature: "MediaCaption", children: "Hi" })).toContain(
      "invalid-parent",
    );
    expect(rules({ contract: "media-gradient", signature: "MediaGradient" })).toContain("invalid-parent");
    expect(rules({ contract: "media-gradient", signature: "MediaCaption" })).toContain(
      "missing-required-slot",
    );
    expect(validateUsageTree(caption()).valid).toBe(true);
  });

  it("emits edge/strength defaults and a decorative wash", () => {
    const markup = emitMarkup(caption());
    expect(markup).toContain('class="sk-media-caption"');
    expect(markup).toContain('data-edge="bottom"');
    expect(markup).toContain('class="sk-media-gradient"');
    expect(markup).toContain('data-strength="md"');
    expect(markup).toContain('aria-hidden="true"');
  });

  it("emits a MediaCaption as figcaption when captionElement asks", () => {
    const tree = caption({
      slots: {
        caption: {
          contract: "media-gradient",
          signature: "MediaCaption",
          options: { edge: "bottom", captionElement: "figcaption" },
          children: [
            { contract: "media-gradient", signature: "MediaGradient", options: { strength: "md" } },
            "Título",
          ],
        },
      },
    });
    const markup = emitMarkup(tree);
    expect(markup).toMatch(/<figcaption\s+class="sk-media-caption"/);
    expect(JSON.stringify(emitReactSource(tree))).toContain('as=\\"figcaption\\"');
  });

  it("publishes caption and wash hooks on its own sheet", () => {
    const contract = getContract("media-gradient")!;
    expect(contract.hookSheets ?? []).toEqual([]);
    expect(contract.hooks).toEqual([
      "--sk-media-caption-fg",
      "--sk-media-caption-gap",
      "--sk-media-caption-padding",
      "--sk-media-gradient-base",
      "--sk-media-gradient-direction",
      "--sk-media-gradient-ink",
      "--sk-media-gradient-ink-mid",
      "--sk-media-gradient-mix",
      "--sk-media-gradient-opacity",
      "--sk-media-gradient-tint",
      "--sk-media-gradient-tint-edge",
      "--sk-media-gradient-tint-mid",
    ]);
    const { sheets, unplaced } = sheetsForTree(caption());
    expect(sheets).toContain("@skryensya/core/patterns/media-gradient.css");
    expect(sheets).toContain("@skryensya/core/patterns/image-frame.css");
    expect(unplaced).toEqual([]);
  });
});

describe("megamenu: labelled bar with edge-to-edge columns", () => {
  const column = (label: string, href: string): UsageTree =>
    ({
      contract: "nav-list",
      signature: "NavListGroup",
      slots: {
        label,
        children: {
          contract: "nav-list",
          signature: "NavListLink",
          options: { href },
          children: "Link",
        },
      },
    }) as UsageTree;

  const mega = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "megamenu",
      signature: "Megamenu",
      options: { label: "Productos" },
      slots: {
        children: [
          {
            contract: "megamenu",
            signature: "MegamenuTrigger",
            slots: {
              children: "Producto",
              columns: [column("Features", "/features"), column("Pricing", "/pricing")],
            },
          },
        ],
      },
      ...overrides,
    }) as UsageTree;

  it("requires a landmark label and at least one trigger with columns", () => {
    expect(rules({ contract: "megamenu", signature: "Megamenu" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot"]),
    );
    expect(
      rules({
        contract: "megamenu",
        signature: "Megamenu",
        options: { label: "Nav" },
        slots: {
          children: {
            contract: "megamenu",
            signature: "MegamenuTrigger",
            slots: { children: "Solo" },
          },
        },
      }),
    ).toContain("missing-required-slot");
    expect(validateUsageTree(mega()).valid).toBe(true);
  });

  it("keeps each trigger between two and four columns", () => {
    const one = mega({
      slots: {
        children: {
          contract: "megamenu",
          signature: "MegamenuTrigger",
          slots: { children: "Solo", columns: [column("A", "/a")] },
        },
      },
    });
    const five = mega({
      slots: {
        children: {
          contract: "megamenu",
          signature: "MegamenuTrigger",
          slots: {
            children: "Muchos",
            columns: [
              column("A", "/a"),
              column("B", "/b"),
              column("C", "/c"),
              column("D", "/d"),
              column("E", "/e"),
            ],
          },
        },
      },
    });
    expect(rules(one)).toContain("wrong-cardinality");
    expect(rules(five)).toContain("wrong-cardinality");
  });

  it("emits mount on the root and trigger, anchors the bar, and keeps portals on Megamenu", () => {
    const markup = emitMarkup(mega());
    expect(markup).toContain('data-sk-megamenu');
    expect(markup).toContain('data-sk-megamenu-trigger');
    expect(markup).toContain('aria-label="Productos"');
    expect(markup).toContain("sk-anchor");
    expect(markup).toContain("sk-anchored");
    expect(getContract("megamenu")!.signatures.Megamenu.portals).toEqual({ container: true });
    expect(getContract("megamenu")!.signatures.MegamenuTrigger.portals).toBeUndefined();
  });

  it("publishes openChange and loads anchored.css via hookSheets", () => {
    const contract = getContract("megamenu")!;
    expect(contract.events).toEqual({ openChange: "sk:megamenuopenchange" });
    expect(contract.hookSheets).toEqual(["@skryensya/core/patterns/anchored.css"]);
    expect(contract.hooks).toEqual(
      expect.arrayContaining(["--sk-anchored-size", "--sk-megamenu-bg", "--sk-megamenu-wash"]),
    );
    const { sheets, unplaced } = sheetsForTree(mega());
    expect(sheets).toContain("@skryensya/core/components/megamenu.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(sheets).toContain("@skryensya/core/patterns/nav-list.css");
    expect(unplaced).toEqual([]);
  });
});

describe("menu: labelled trigger with recursive items", () => {
  const menu = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "menu",
      signature: "Menu",
      options: { label: "Acciones del archivo" },
      slots: {
        trigger: "Acciones",
        items: [
          { options: { value: "new" }, slots: { label: "Nuevo" } },
          { options: { value: "wrap", kind: "checkbox" }, slots: { label: "Ajuste" } },
          {
            options: { value: "left", kind: "radio", group: "align" },
            slots: { label: "Izquierda" },
          },
        ],
      },
      ...overrides,
    }) as UsageTree;

  it("requires a menu label and items", () => {
    expect(rules({ contract: "menu", signature: "Menu" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot"]),
    );
    expect(validateUsageTree(menu()).valid).toBe(true);
  });

  it("requires triggerLabel when the trigger is icon-only", () => {
    expect(rules(menu({ options: { label: "Más", triggerIconOnly: true } }))).toContain(
      "missing-accessible-name",
    );
    expect(
      validateUsageTree(
        menu({ options: { label: "Más", triggerIconOnly: true, triggerLabel: "Más acciones" } }),
      ).valid,
    ).toBe(true);
  });

  it("emits mount, group on radio items, and the trigger chevron", () => {
    const markup = emitMarkup(menu());
    expect(markup).toContain('data-sk-menu');
    expect(markup).toContain('data-group="align"');
    expect(markup).toContain('data-type="checkbox"');
    expect(markup).toContain('data-sk-icon="chevron-down"');
    expect(markup).toContain("sk-button");
    expect(markup).toContain("sk-anchored");
  });

  it("publishes events and loads anchored.css via hookSheets alongside button", () => {
    const contract = getContract("menu")!;
    expect(contract.events).toEqual({
      openChange: "sk:menuopenchange",
      checkedChange: "sk:menucheckedchange",
      select: "sk:menuselect",
    });
    expect(contract.hookSheets).toEqual(["@skryensya/core/patterns/anchored.css"]);
    expect(contract.signatures.Menu.mount).toBe("data-sk-menu");
    expect(contract.signatures.Menu.portals).toEqual({ container: true });
    expect(contract.parts).not.toHaveProperty("group");
    expect(contract.parts).not.toHaveProperty("groupLabel");
    const { sheets, unplaced } = sheetsForTree(menu());
    expect(sheets).toContain("@skryensya/core/components/menu.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });
});

describe("menubar: labelled bar of Menu-backed items", () => {
  const bar = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "menubar",
      signature: "Menubar",
      options: { label: "Editor" },
      slots: {
        children: [
          {
            contract: "menubar",
            signature: "MenubarItem",
            slots: {
              children: "Archivo",
              items: [
                { options: { value: "new" }, slots: { label: "Nuevo" } },
                {
                  options: { value: "left", kind: "radio", group: "align" },
                  slots: { label: "Izquierda" },
                },
              ],
            },
          },
          {
            contract: "menubar",
            signature: "MenubarItem",
            slots: { children: "Ayuda" },
          },
        ],
      },
      ...overrides,
    }) as UsageTree;

  it("requires a bar label and at least one MenubarItem", () => {
    expect(rules({ contract: "menubar", signature: "Menubar" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot"]),
    );
    expect(validateUsageTree(bar()).valid).toBe(true);
  });

  it("emits menubar and menu mounts, group on radio items, and the dropdown chevron", () => {
    const markup = emitMarkup(bar());
    expect(markup).toContain('data-sk-menubar');
    expect(markup).toContain('data-sk-menubar-item');
    expect(markup).toContain('data-sk-menu');
    expect(markup).toContain('data-group="align"');
    expect(markup).toContain('data-sk-icon="chevron-down"');
    expect(markup).toContain("sk-button");
    expect(markup).toContain('aria-label="Editor"');
  });

  it("publishes portals on MenubarItem and loads anchored.css via hookSheets", () => {
    const contract = getContract("menubar")!;
    expect(contract.signatures.Menubar.mount).toBe("data-sk-menubar");
    expect(contract.signatures.MenubarItem.portals).toEqual({ container: true });
    expect(contract.hookSheets).toEqual(["@skryensya/core/patterns/anchored.css"]);
    expect(contract.hooks).toEqual(
      expect.arrayContaining(["--sk-anchored-size", "--sk-menubar-gap"]),
    );
    const { sheets, unplaced } = sheetsForTree(bar());
    expect(sheets).toContain("@skryensya/core/components/menubar.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(sheets).toContain("@skryensya/core/components/menu.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });

  it("swaps the trigger to nav-list classes when nav is given", () => {
    const markup = emitMarkup({
      contract: "menubar",
      signature: "Menubar",
      options: { label: "Principal" },
      slots: {
        children: {
          contract: "menubar",
          signature: "MenubarItem",
          options: { nav: true },
          slots: {
            children: "Producto",
            items: [{ options: { value: "overview" }, slots: { label: "Overview" } }],
          },
        },
      },
    });
    expect(markup).toContain("sk-nav-list__link");
    expect(markup).toContain("sk-nav-list__label");
    expect(markup).toContain("data-nav");
    expect(markup).not.toContain('data-variant="ghost"');
  });
});

describe("meter: measurement within a known range", () => {
  const meter = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "meter",
      signature: "Meter",
      options: { label: "Uso de disco", value: 72, min: 0, max: 100, valueText: "72% usado" },
      ...overrides,
    }) as UsageTree;

  it("requires a label and accepts value/min/max/tone", () => {
    expect(rules({ contract: "meter", signature: "Meter" })).toContain("missing-required");
    expect(validateUsageTree(meter()).valid).toBe(true);
    expect(
      rules(meter({ options: { label: "Uso", value: 10, tone: "loud" } })),
    ).toContain("invalid-option-value");
  });

  it("keeps value inside min and max, the defaults counting when omitted", () => {
    expect(rules(meter({ options: { label: "Uso", value: 60 } }))).not.toContain("out-of-range");
    expect(messageFor(meter({ options: { label: "Uso", value: 120 } }), "out-of-range")).toContain(
      'above "max" (100)',
    );
    expect(rules(meter({ options: { label: "Uso", value: 5, min: 10, max: 20 } }))).toContain(
      "out-of-range",
    );
  });

  it("emits role=meter, aria-value attrs, painted header, and the mount attribute", () => {
    const markup = emitMarkup(meter());
    expect(markup).toContain('role="meter"');
    expect(markup).toContain('aria-label="Uso de disco"');
    expect(markup).toContain('aria-valuenow="72"');
    expect(markup).toContain('aria-valuemin="0"');
    expect(markup).toContain('aria-valuemax="100"');
    expect(markup).toContain('aria-valuetext="72% usado"');
    expect(markup).toContain("data-sk-meter");
    expect(markup).toContain("sk-meter-group__label");
    expect(markup).toContain("72% usado");
    expect(markup).toContain('aria-hidden="true"');
  });

  it("publishes mount and its own two fill/color hooks with no foreign hookSheets", () => {
    const contract = getContract("meter")!;
    expect(contract.signatures.Meter.mount).toBe("data-sk-meter");
    expect(contract.hooks).toEqual(["--sk-meter-color", "--sk-meter-fill"]);
    expect(contract.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(meter());
    expect(sheets).toContain("@skryensya/core/components/meter.css");
    expect(unplaced).toEqual([]);
  });

  it("omits the painted value span when valueText is absent", () => {
    const markup = emitMarkup(meter({ options: { label: "Batería", value: 50 } }));
    expect(markup).toContain("Batería");
    expect(markup).not.toContain("sk-meter-group__value");
  });
});

describe("nav-list: landmark of destinations with optional disclosure groups", () => {
  const link = (href: string, label: string, extras: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "nav-list",
      signature: "NavListLink",
      options: { href },
      children: label,
      ...extras,
    }) as UsageTree;

  const group = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "nav-list",
      signature: "NavListGroup",
      slots: {
        label: "Workspace",
        children: link("/", "Inicio"),
      },
      ...overrides,
    }) as UsageTree;

  const list = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "nav-list",
      signature: "NavList",
      attrs: { "aria-label": "Principal" },
      children: group(),
      ...overrides,
    }) as UsageTree;

  it("requires a group under the landmark, href on each link, and accepts orientation/current", () => {
    expect(rules({ contract: "nav-list", signature: "NavList" })).toContain("missing-required-slot");
    expect(rules(link("/", "X"))).toContain("invalid-parent");
    expect(
      rules({
        contract: "nav-list",
        signature: "NavList",
        children: {
          contract: "nav-list",
          signature: "NavListGroup",
          children: { contract: "nav-list", signature: "NavListLink", children: "Sin destino" },
        },
      }),
    ).toContain("missing-required");
    expect(validateUsageTree(list({ options: { orientation: "horizontal" } })).valid).toBe(true);
    expect(
      validateUsageTree(
        list({
          children: group({
            slots: {
              label: "Workspace",
              children: link("/", "Inicio", { options: { href: "/", current: true } }),
            },
          }),
        }),
      ).valid,
    ).toBe(true);
  });

  it("implies label for collapsible and heading, and excludes heading beside collapsible", () => {
    expect(
      rules({
        contract: "nav-list",
        signature: "NavListGroup",
        options: { collapsible: true },
        children: link("/", "X"),
      }),
    ).toContain("missing-implied");
    expect(
      rules({
        contract: "nav-list",
        signature: "NavListGroup",
        options: { heading: true },
        children: link("/", "X"),
      }),
    ).toContain("missing-implied");
    expect(
      rules({
        contract: "nav-list",
        signature: "NavListGroup",
        options: { collapsible: true, heading: true },
        slots: { label: "A", children: link("/", "X") },
      }),
    ).toContain("excluded-option");
    expect(
      validateUsageTree(
        list({
          children: group({
            options: { collapsible: true },
            slots: { label: "A", children: link("/", "X") },
          }),
        }),
      ).valid,
    ).toBe(true);
  });

  it("emits disclosure mounts, data-collapsible, and nested group inside the same li", () => {
    const markup = emitMarkup(
      list({
        children: group({
          options: { collapsible: true, defaultOpen: false },
          slots: {
            label: "Proyecto",
            children: link("/proyecto", "Resumen", {
              slots: {
                nested: {
                  contract: "nav-list",
                  signature: "NavListGroup",
                  slots: {
                    label: "Config",
                    children: link("/proyecto/general", "General"),
                  },
                },
              },
            }),
          },
        }),
      }),
    );
    expect(markup).toContain("data-collapsible");
    expect(markup).toContain("data-sk-nav-list-group-trigger");
    expect(markup).toContain("data-sk-nav-list-group-list");
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("hidden");
    expect(markup).toMatch(/<li class="sk-nav-list__item">[\s\S]*sk-nav-list__group/);
    expect(markup).toContain('href="/proyecto/general"');
  });

  it("publishes its own sheet with no foreign hookSheets and 28 styling hooks", () => {
    const contract = getContract("nav-list")!;
    expect(contract.hookSheets ?? []).toEqual([]);
    expect(contract.hooks).toHaveLength(28);
    expect(contract.css).toBe("@skryensya/core/patterns/nav-list.css");
    const { sheets, unplaced } = sheetsForTree(list());
    expect(sheets).toEqual(["@skryensya/core/patterns/nav-list.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("navbar: header shell for brand, guests, and actions", () => {
  const brand = (): UsageTree => ({
    contract: "navbar",
    signature: "NavbarBrand",
    children: "Skryensya",
  });
  const actions = (): UsageTree => ({
    contract: "navbar",
    signature: "NavbarActions",
    children: "Cuenta",
  });
  const nav = (): UsageTree =>
    ({
      contract: "nav-list",
      signature: "NavList",
      options: { orientation: "horizontal" },
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
    }) as UsageTree;

  const bar = (...children: UsageTree[]): UsageTree => ({
    contract: "navbar",
    signature: "Navbar",
    children,
  });

  it("requires children and accepts Brand, Actions, NavList, and Megamenu guests", () => {
    expect(rules({ contract: "navbar", signature: "Navbar" })).toContain("missing-required-slot");
    expect(validateUsageTree(bar(brand(), nav(), actions())).valid).toBe(true);
    expect(rules(brand())).toContain("invalid-parent");
    expect(rules(actions())).toContain("invalid-parent");
  });

  it("emits a header shell with brand and actions parts", () => {
    const markup = emitMarkup(bar(brand(), actions()));
    expect(markup).toMatch(/^<header\s+class="sk-navbar"/);
    expect(markup).toContain('class="sk-navbar__brand"');
    expect(markup).toContain('class="sk-navbar__actions"');
    expect(markup).toContain("Skryensya");
  });

  it("publishes its own 13 hooks with no foreign hookSheets, and pulls nav-list via guests", () => {
    const contract = getContract("navbar")!;
    expect(contract.hookSheets ?? []).toEqual([]);
    expect(contract.hooks).toHaveLength(13);
    expect(contract.signatures.Navbar.slots.children.of).toEqual([
      "NavbarBrand",
      "NavbarActions",
      "NavList",
      "Megamenu",
    ]);
    const { sheets, unplaced } = sheetsForTree(bar(brand(), nav(), actions()));
    expect(sheets).toContain("@skryensya/core/components/navbar.css");
    expect(sheets).toContain("@skryensya/core/patterns/nav-list.css");
    expect(unplaced).toEqual([]);
  });
});

describe("number-field: labelled stepper with valueChange", () => {
  const field = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "number-field",
      signature: "NumberField",
      options: { defaultValue: "2", min: 0, step: 1 },
      slots: { label: "Cantidad" },
      ...overrides,
    }) as UsageTree;

  it("requires a text label and accepts min/max/step/invalid", () => {
    expect(rules({ contract: "number-field", signature: "NumberField" })).toContain("missing-required-slot");
    expect(validateUsageTree(field()).valid).toBe(true);
    expect(validateUsageTree(field({ options: { invalid: true }, slots: { label: "N", hint: "Entero" } })).valid).toBe(
      true,
    );
  });

  it("emits the mount, stepper buttons, optional hint, and data-invalid", () => {
    const markup = emitMarkup(
      field({ options: { defaultValue: "2", invalid: true }, slots: { label: "Cantidad", hint: "Entero" } }),
    );
    expect(markup).toContain("data-sk-number-field");
    expect(markup).toContain("data-sk-number-field-input");
    expect(markup).toContain("data-sk-number-field-increment");
    expect(markup).toContain("data-sk-number-field-decrement");
    expect(markup).toContain("data-invalid");
    expect(markup).toContain("sk-number-field__hint");
    expect(markup).toContain("Entero");
    expect(markup).toContain('type="text"');
    expect(markup).toContain('inputmode="decimal"');
  });

  it("publishes valueChange, 15 hooks, and loads button.css via also", () => {
    const contract = getContract("number-field")!;
    expect(contract.events).toEqual({ valueChange: "sk:numberfieldvaluechange" });
    expect(contract.signatures.NumberField.mount).toBe("data-sk-number-field");
    expect(contract.hooks).toHaveLength(15);
    expect(contract.hooks).toContain("--sk-number-field-invalid-border-color");
    expect(contract.parts).not.toHaveProperty("scrubber");
    expect(contract.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(field());
    expect(sheets).toContain("@skryensya/core/components/number-field.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });

  it("rejects a min above max", () => {
    expect(rules(field({ options: { min: 10, max: 5 } }))).toContain("out-of-range");
    expect(rules(field({ options: { min: 0, max: 10 } }))).not.toContain("out-of-range");
  });
});

describe("pagination: computed page window with pageChange", () => {
  const pager = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "pagination",
      signature: "Pagination",
      options: { page: 5, total: 12, siblings: 1 },
      ...overrides,
    }) as UsageTree;

  it("accepts page/total/siblings bounds and rejects out-of-range values", () => {
    expect(validateUsageTree(pager()).valid).toBe(true);
    expect(rules(pager({ options: { page: 0, total: 12 } }))).toContain("invalid-option-value");
    expect(rules(pager({ options: { page: 1, total: 0 } }))).toContain("invalid-option-value");
    expect(rules(pager({ options: { page: 1, total: 12, siblings: -1 } }))).toContain("invalid-option-value");
  });

  it("emits a nav landmark with disabled prev on page 1 and a computed window", () => {
    const markup = emitMarkup(pager({ options: { page: 1, total: 12 } }));
    expect(markup).toMatch(/^<nav\s+/);
    expect(markup).toContain('aria-label="Pagination"');
    expect(markup).toContain("sk-pagination__previous");
    expect(markup).toMatch(/sk-pagination__previous[^>]*\sdisabled/);
    expect(markup).toContain("sk-pagination__ellipsis");
    expect(markup).toContain('aria-current="page"');
  });

  it("publishes pageChange and its own hooks with no foreign hookSheets", () => {
    const contract = getContract("pagination")!;
    expect(contract.events).toEqual({ pageChange: "sk:paginationpagechange" });
    expect(contract.hooks).toHaveLength(24);
    expect(contract.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(pager());
    expect(sheets).toEqual(["@skryensya/core/components/pagination.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("placeholder: role-sized skeletons with a clamped paragraph", () => {
  const line = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "placeholder",
      signature: "Placeholder",
      options: { text: "h3", width: "72%" },
      ...overrides,
    }) as UsageTree;

  const paragraph = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "placeholder",
      signature: "Placeholder.paragraph",
      options: { text: "body", lines: 3, lastLine: "62%" },
      ...overrides,
    }) as UsageTree;

  it("accepts each shape with only its own options", () => {
    expect(validateUsageTree(line()).valid).toBe(true);
    expect(validateUsageTree(paragraph()).valid).toBe(true);
    expect(
      validateUsageTree({
        contract: "placeholder",
        signature: "Placeholder.block",
        options: { fill: true, width: "100%", height: "8rem" },
      }).valid,
    ).toBe(true);
    expect(
      validateUsageTree({
        contract: "placeholder",
        signature: "Placeholder.circle",
        options: { size: "sm" },
      }).valid,
    ).toBe(true);
  });

  it("rejects a foreign option and a lines count outside 1..12", () => {
    expect(rules(line({ options: { text: "h3", fill: true } }))).toContain("unknown-option");
    expect(rules(paragraph({ options: { lines: 0 } }))).toContain("invalid-option-value");
    expect(rules(paragraph({ options: { lines: 13 } }))).toContain("invalid-option-value");
    expect(rules(paragraph({ options: { lines: 2.5 } }))).toContain("invalid-option-value");
  });

  it("emits aria-hidden roots, shape attrs, and one line element per count", () => {
    expect(emitMarkup(line())).toContain('aria-hidden="true"');
    expect(emitMarkup(line())).toContain('data-shape="text"');
    expect(emitMarkup(line())).toContain('data-text="h3"');
    const markup = emitMarkup(paragraph({ options: { lines: 4 } }));
    expect(markup).toContain('data-shape="paragraph"');
    expect(markup.match(/sk-placeholder__line/g)).toHaveLength(4);
    expect(emitMarkup({ contract: "placeholder", signature: "Placeholder", options: { shimmer: false } })).toContain(
      'data-shimmer="false"',
    );
  });

  it("publishes 11 hooks and loads only its own stylesheet", () => {
    const contract = getContract("placeholder")!;
    expect(contract.hooks).toHaveLength(11);
    expect(contract.options.lines).toMatchObject({ min: 1, max: 12, integer: true });
    expect(contract.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(paragraph());
    expect(sheets).toEqual(["@skryensya/core/components/placeholder.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("process-list: ordered instructions without progress state", () => {
  const item = (title: string, body?: string): UsageTree => ({
    contract: "process-list",
    signature: "ProcessListItem",
    slots: {
      title,
      ...(body
        ? {
            children: {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: body,
            },
          }
        : {}),
    },
  });

  const list = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "process-list",
      signature: "ProcessList",
      children: [item("Instala el paquete", "Usa el gestor del proyecto."), item("Importa los estilos")],
      ...overrides,
    }) as UsageTree;

  it("requires ProcessListItem children and a text title on each item", () => {
    expect(rules({ contract: "process-list", signature: "ProcessList" })).toContain("missing-required-slot");
    expect(rules({ contract: "process-list", signature: "ProcessListItem" })).toContain("missing-required-slot");
    expect(validateUsageTree(list()).valid).toBe(true);
    expect(
      rules({
        contract: "process-list",
        signature: "ProcessList",
        children: {
          contract: "list",
          signature: "ListItem",
          slots: { title: "No" },
        },
      }),
    ).toContain("slot-accepts");
  });

  it("emits an ol with role=list and title then content per item", () => {
    const markup = emitMarkup(list());
    expect(markup).toMatch(/^<ol\s+/);
    expect(markup).toContain('role="list"');
    expect(markup).toContain("sk-process-list__title");
    expect(markup).toContain("Instala el paquete");
    expect(markup).toContain("sk-process-list__content");
  });

  it("publishes 15 hooks with no foreign hookSheets and rejects status options", () => {
    const contract = getContract("process-list")!;
    expect(contract.hooks).toHaveLength(15);
    expect(contract.options).toEqual({});
    expect(contract.events).toBeUndefined();
    expect(contract.hookSheets ?? []).toEqual([]);
    expect(rules(list({ options: { status: "current" } }))).toContain("unknown-option");
    const { sheets, unplaced } = sheetsForTree(list());
    expect(sheets).toContain("@skryensya/core/components/process-list.css");
    expect(sheets).toContain("@skryensya/core/components/typography.css");
    expect(unplaced).toEqual([]);
  });
});

describe("progress: determinate bar with a known end", () => {
  const bar = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "progress",
      signature: "Progress",
      options: { value: 62, max: 100, label: "Subiendo archivo", tone: "accent" },
      ...overrides,
    }) as UsageTree;

  it("requires a label and rejects a negative value or unknown tone", () => {
    expect(rules({ contract: "progress", signature: "Progress" })).toContain("missing-required");
    expect(validateUsageTree(bar()).valid).toBe(true);
    expect(rules(bar({ options: { label: "X", value: -1 } }))).toContain("invalid-option-value");
    expect(rules(bar({ options: { label: "X", value: 10, tone: "info" } }))).toContain(
      "invalid-option-value",
    );
  });

  it("emits progressbar role, aria-value attrs, tone, and clamped fill style", () => {
    const markup = emitMarkup(bar());
    expect(markup).toContain('role="progressbar"');
    expect(markup).toContain('aria-label="Subiendo archivo"');
    expect(markup).toContain('aria-valuenow="62"');
    expect(markup).toContain('aria-valuemin="0"');
    expect(markup).toContain('aria-valuemax="100"');
    expect(markup).toContain('data-tone="accent"');
    expect(markup).toContain("--sk-progress-fill: 62%");
    expect(markup).toContain("sk-progress__bar");
  });

  it("publishes two fill/color hooks with no mount, events, or foreign hookSheets", () => {
    const contract = getContract("progress")!;
    expect(contract.hooks).toEqual(["--sk-progress-color", "--sk-progress-fill"]);
    expect(contract.events).toBeUndefined();
    expect(contract.signatures.Progress.mount).toBeUndefined();
    expect(contract.hookSheets ?? []).toEqual([]);
    expect(contract.options.value).toMatchObject({ min: 0 });
    const { sheets, unplaced } = sheetsForTree(bar());
    expect(sheets).toEqual(["@skryensya/core/components/progress.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("questionnaire: one question at a time with its own machine", () => {
  const choice = (value: string, label: string) => ({
    options: { value },
    slots: { label },
  });

  const survey = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "questionnaire",
      signature: "Questionnaire",
      options: { progress: "bar", shortcuts: "letters", defaultItem: "channels" },
      attrs: { "aria-label": "Survey" },
      children: [
        {
          contract: "questionnaire",
          signature: "QuestionnaireItem",
          options: { name: "direction", required: true, text: true, textLabel: "Other" },
          slots: {
            title: "What next?",
            choices: [choice("a", "A"), choice("b", "B")],
          },
        },
        {
          contract: "questionnaire",
          signature: "QuestionnaireItem",
          options: { name: "channels", multiple: true },
          slots: {
            title: "Channels",
            choices: [choice("email", "Email"), choice("push", "Push")],
          },
        },
      ],
      ...overrides,
    }) as UsageTree;

  it("requires QuestionnaireItem children with name and title, and implies textLabel / choices", () => {
    expect(rules({ contract: "questionnaire", signature: "Questionnaire" })).toContain("missing-required-slot");
    expect(
      rules({
        contract: "questionnaire",
        signature: "Questionnaire",
        children: { contract: "questionnaire", signature: "QuestionnaireItem", slots: { title: "X" } },
      }),
    ).toContain("missing-required");
    expect(
      rules({
        contract: "questionnaire",
        signature: "Questionnaire",
        children: {
          contract: "questionnaire",
          signature: "QuestionnaireItem",
          options: { name: "x", text: true },
          slots: { title: "X" },
        },
      }),
    ).toContain("missing-implied");
    expect(
      rules({
        contract: "questionnaire",
        signature: "Questionnaire",
        children: {
          contract: "questionnaire",
          signature: "QuestionnaireItem",
          options: { name: "x", multiple: true },
          slots: { title: "X" },
        },
      }),
    ).toContain("missing-implied");
    expect(validateUsageTree(survey()).valid).toBe(true);
    expect(
      rules({
        contract: "questionnaire",
        signature: "QuestionnaireItem",
        options: { name: "x" },
        slots: { title: "Only title" },
      }),
    ).toContain("missing-at-least-one");
    const dup = survey();
    (dup.children as UsageTree[]).push({
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: { name: "direction", text: true, textLabel: "Other" },
      slots: { title: "Duplicate key" },
    });
    expect(rules(dup)).toContain("duplicate-child-option");
  });

  it("emits form mounts, novalidate, tile/button also classes, and defaultItem", () => {
    const markup = emitMarkup(survey());
    expect(markup).toMatch(/^<form\s+/);
    expect(markup).toContain('data-sk-questionnaire');
    expect(markup).toContain('data-default-item="channels"');
    expect(markup).toMatch(/\snovalidate(?:=""|\s|>)/);
    expect(markup).toContain('data-sk-questionnaire-item');
    expect(markup).toContain('data-sk-questionnaire-progress');
    expect(markup).toContain('data-sk-tile-radio-group');
    expect(markup).toContain('data-sk-tile-checkbox');
    expect(markup).toContain("sk-button");
    expect(markup).toContain("sk-form-field");
    expect(markup).toContain('data-sk-questionnaire-submit');
  });

  it("publishes events, mounts, and loads checkbox/progress/steps via hookSheets", () => {
    const contract = getContract("questionnaire")!;
    expect(contract.events).toEqual({
      itemChange: "sk:questionnaireitemchange",
      submit: "sk:questionnairesubmit",
    });
    expect(contract.signatures.Questionnaire.mount).toBe("data-sk-questionnaire");
    expect(contract.signatures.QuestionnaireItem.mount).toBe("data-sk-questionnaire-item");
    expect(contract.hookSheets).toEqual([
      "@skryensya/core/components/checkbox.css",
      "@skryensya/core/components/progress.css",
      "@skryensya/core/components/steps.css",
    ]);
    expect(contract.hooks).toEqual(
      expect.arrayContaining([
        "--sk-questionnaire-gap",
        "--sk-checkbox-group-gap",
        "--sk-progress-fill",
        "--sk-steps-marker-size",
      ]),
    );
    expect(contract.options.defaultItem).toMatchObject({ attr: "data-default-item", machineInput: true });
    const { sheets, unplaced } = sheetsForTree(survey());
    expect(sheets).toContain("@skryensya/core/components/questionnaire.css");
    expect(sheets).toContain("@skryensya/core/components/checkbox.css");
    expect(sheets).toContain("@skryensya/core/components/progress.css");
    expect(sheets).toContain("@skryensya/core/components/steps.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(sheets).toContain("@skryensya/core/components/tile.css");
    expect(unplaced).toEqual([]);
  });
});

describe("qr-code: a string made scannable", () => {
  const code = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "qr-code",
      signature: "QRCode",
      options: { value: "https://ui.skryensya.dev", label: "Abrir el sitio", level: "Q" },
      ...overrides,
    }) as UsageTree;

  it("requires value and label, and rejects logoRatio past 0.5", () => {
    expect(rules({ contract: "qr-code", signature: "QRCode" })).toContain("missing-required");
    expect(validateUsageTree(code()).valid).toBe(true);
    expect(rules(code({ options: { value: "x", label: "y", logoRatio: 0.6 } }))).toContain(
      "invalid-option-value",
    );
    expect(rules(code({ options: { value: "x", label: "y", quietZone: -1 } }))).toContain(
      "invalid-option-value",
    );
  });

  it("emits role=img, computes path/viewBox, and writes module-shape for CSS", () => {
    const markup = emitMarkup(code({ options: { value: "https://ui.skryensya.dev", label: "Abrir", moduleShape: "dot" } }));
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Abrir"');
    expect(markup).toContain('data-module-shape="dot"');
    expect(markup).toMatch(/viewBox="0 0 \d+ \d+"/);
    expect(markup).toMatch(/<path[^>]*d="M/);
    expect(markup).toContain('data-value="https://ui.skryensya.dev"');
  });

  it("publishes five hooks, mounts the runtime enhancer, and has no events or foreign hookSheets", () => {
    const contract = getContract("qr-code")!;
    expect(contract.hooks).toEqual([
      "--sk-qr-code-logo-ratio",
      "--sk-qr-code-modules",
      "--sk-qr-code-paper",
      "--sk-qr-code-radius",
      "--sk-qr-code-size",
    ]);
    expect(contract.events).toBeUndefined();
    expect(contract.signatures.QRCode.mount).toBe("data-sk-qr-code");
    expect(contract.hookSheets ?? []).toEqual([]);
    expect(contract.options.logoRatio).toMatchObject({ min: 0, max: 0.5 });
    expect(contract.options.moduleShape.computedInput).toBeUndefined();
    const { sheets, unplaced } = sheetsForTree(code());
    expect(sheets).toEqual(["@skryensya/core/components/qr-code.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("radio-group: exclusive native radios with a named group", () => {
  const group = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "radio-group",
      signature: "RadioGroup",
      options: { name: "plan", value: "pro", label: "Elige tu plan" },
      slots: {
        items: [
          { options: { value: "basic" }, slots: { label: "Basic" } },
          { options: { value: "pro" }, slots: { label: "Pro" } },
        ],
      },
      ...overrides,
    }) as UsageTree;

  it("requires name, items, and an accessible name", () => {
    expect(rules({ contract: "radio-group", signature: "RadioGroup" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot", "missing-accessible-name"]),
    );
    expect(validateUsageTree(group()).valid).toBe(true);
    expect(
      rules({
        contract: "radio-group",
        signature: "RadioGroup",
        options: { name: "plan", value: "pro" },
        slots: {
          items: [{ options: { value: "pro" }, slots: { label: "Pro" } }],
        },
      }),
    ).toContain("missing-accessible-name");
  });

  it("rejects an unknown initial value and duplicate item keys", () => {
    expect(rules(group({ options: { name: "plan", value: "ghost", label: "Plan" } }))).toContain(
      "unknown-key",
    );
    expect(
      rules(
        group({
          slots: {
            items: [
              { options: { value: "pro" }, slots: { label: "A" } },
              { options: { value: "pro" }, slots: { label: "B" } },
            ],
          },
        }),
      ),
    ).toContain("duplicate-item-key");
  });

  it("emits radiogroup role, aria-label, checked selection, and group disabled on each input", () => {
    const markup = emitMarkup(
      group({ options: { name: "plan", value: "pro", label: "Plan", disabled: true, orientation: "horizontal" } }),
    );
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-label="Plan"');
    expect(markup).toContain('data-orientation="horizontal"');
    expect(markup).toContain('aria-orientation="horizontal"');
    expect(markup).toMatch(/value="pro"[^>]*\schecked|checked[^>]*value="pro"/);
    expect(markup.match(/\sdisabled/g)?.length).toBeGreaterThanOrEqual(2);
    expect(markup).not.toMatch(/<div[^>]*\sdisabled/);
  });

  it("publishes radio parts and --sk-radio-* hooks only, with no events or foreign sheets", () => {
    const contract = getContract("radio-group")!;
    expect(Object.values(contract.parts).every((part) => part.startsWith("sk-radio"))).toBe(true);
    expect(contract.hooks?.every((hook) => hook.startsWith("--sk-radio-"))).toBe(true);
    expect(contract.hooks).toHaveLength(14);
    expect(contract.events).toBeUndefined();
    expect(contract.hookSheets ?? []).toEqual([]);
    expect(contract.signatures.RadioGroup.mount).toBeUndefined();
    const { sheets, unplaced } = sheetsForTree(group());
    expect(sheets).toEqual(["@skryensya/core/components/radio-group.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("segmented: small exclusive choice with a sliding thumb", () => {
  const control = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "segmented",
      signature: "Segmented",
      options: { value: "week", label: "Rango" },
      slots: {
        items: [
          { options: { value: "day" }, slots: { label: "Día" } },
          { options: { value: "week" }, slots: { label: "Semana" } },
          { options: { value: "month" }, slots: { label: "Mes" } },
        ],
      },
      ...overrides,
    }) as UsageTree;

  it("requires value, label, and items, and rejects an unknown value", () => {
    expect(rules({ contract: "segmented", signature: "Segmented" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot"]),
    );
    expect(validateUsageTree(control()).valid).toBe(true);
    expect(rules(control({ options: { value: "ghost", label: "Rango" } }))).toContain("unknown-key");
  });

  it("emits radiogroup mount, indicator, and aria-checked on the selected option", () => {
    const markup = emitMarkup(control());
    expect(markup).toContain('role="radiogroup"');
    expect(markup).toContain('aria-label="Rango"');
    expect(markup).toContain("data-sk-segmented");
    expect(markup).toContain("data-sk-segmented-option");
    expect(markup).toContain("sk-segmented__indicator");
    // selectedBy writes the boolean presence form (`aria-checked`), not `="true"`.
    expect(markup).toMatch(/data-value="week"[^>]*\saria-checked|\saria-checked[^>]*data-value="week"/);
    expect(markup).toContain("sk-interactive");
  });

  it("publishes valueChange and fourteen own hooks with no foreign hookSheets", () => {
    const contract = getContract("segmented")!;
    expect(contract.events).toEqual({ valueChange: "sk:segmentedvaluechange" });
    expect(contract.hooks).toHaveLength(14);
    expect(contract.hooks?.every((hook) => hook.startsWith("--sk-segmented-"))).toBe(true);
    expect(contract.hookSheets ?? []).toEqual([]);
    expect(contract.signatures.Segmented.mount).toBe("data-sk-segmented");
    expect(contract.options.value).toMatchObject({ prop: "defaultValue", keyOf: { slot: "items" } });
    const { sheets, unplaced } = sheetsForTree(control());
    expect(sheets).toEqual(["@skryensya/core/components/segmented.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("select: native platform control and enhanced listbox", () => {
  const enhanced = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "select",
      signature: "Select",
      options: { name: "plan", value: "pro", placeholder: "Elige" },
      slots: {
        label: "Plan",
        items: [
          { options: { value: "basic" }, slots: { label: "Basic" } },
          { options: { value: "pro" }, slots: { label: "Pro" } },
        ],
      },
      ...overrides,
    }) as UsageTree;

  const native = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "select",
      signature: "Select.native",
      options: { name: "plan", value: "pro", disabled: true },
      slots: {
        items: [
          { options: { value: "basic" }, slots: { label: "Basic" } },
          { options: { value: "pro" }, slots: { label: "Pro" } },
        ],
      },
      ...overrides,
    }) as UsageTree;

  it("requires items on both signatures and rejects an unknown value", () => {
    expect(rules({ contract: "select", signature: "Select" })).toContain("missing-required-slot");
    expect(rules({ contract: "select", signature: "Select.native" })).toContain("missing-required-slot");
    expect(validateUsageTree(enhanced()).valid).toBe(true);
    expect(validateUsageTree(native()).valid).toBe(true);
    expect(rules(enhanced({ options: { name: "plan", value: "ghost" } }))).toContain("unknown-key");
  });

  it("emits the enhanced anatomy with mount, hidden select, and selected option", () => {
    const markup = emitMarkup(enhanced());
    expect(markup).toContain("data-sk-select");
    expect(markup).toContain("data-sk-select-hidden");
    expect(markup).toContain("data-sk-select-trigger");
    expect(markup).toContain("sk-anchor");
    expect(markup).toContain("sk-anchored");
    expect(markup).toContain('data-value="pro"');
    expect(markup).toMatch(/value="pro"[^>]*\sselected|\sselected[^>]*value="pro"/);
  });

  it("emits a real native select with selected and disabled, not data-* machine attrs", () => {
    const markup = emitMarkup(native());
    expect(markup).toContain('class="sk-select-native"');
    expect(markup).toContain("<select");
    expect(markup).toMatch(/\sdisabled/);
    expect(markup).not.toContain("data-disabled");
    expect(markup).not.toContain("data-sk-select");
    expect(markup).toMatch(/value="pro"[^>]*\sselected|\sselected[^>]*value="pro"/);
  });

  it("publishes valueChange, anchored hookSheets, and Select mount", () => {
    const contract = getContract("select")!;
    expect(contract.events).toEqual({ valueChange: "sk:selectvaluechange" });
    expect(contract.hookSheets).toEqual(["@skryensya/core/patterns/anchored.css"]);
    expect(contract.signatures.Select.mount).toBe("data-sk-select");
    expect(contract.signatures["Select.native"].mount).toBeUndefined();
    expect(contract.options.value).toMatchObject({ prop: "defaultValue", keyOf: { slot: "items" } });
    const { sheets, unplaced } = sheetsForTree(enhanced());
    expect(sheets).toContain("@skryensya/core/components/select.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(unplaced).toEqual([]);
  });
});

describe("sidebar: app-shell rail with collapse and resize", () => {
  const rail = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "sidebar",
      signature: "Sidebar",
      options: { landmarkLabel: "Navegación", storageKey: "docs" },
      children: [
        {
          contract: "sidebar",
          signature: "SidebarHeader",
          children: [
            {
              contract: "sidebar",
              signature: "SidebarTrigger",
              options: { label: "Contraer" },
            },
          ],
        },
        {
          contract: "sidebar",
          signature: "SidebarContent",
          children: "Índice",
        },
        {
          contract: "sidebar",
          signature: "SidebarResizeHandle",
          options: { label: "Redimensionar" },
        },
      ],
      ...overrides,
    }) as UsageTree;

  it("requires children, and a named trigger and resize handle", () => {
    expect(rules({ contract: "sidebar", signature: "Sidebar" })).toContain("missing-required-slot");
    expect(
      rules({
        contract: "sidebar",
        signature: "Sidebar",
        children: [
          { contract: "sidebar", signature: "SidebarContent", children: "x" },
          { contract: "sidebar", signature: "SidebarTrigger" },
        ],
      }),
    ).toContain("missing-required");
    expect(validateUsageTree(rail()).valid).toBe(true);
  });

  it("emits aside mount, trigger, content, splitter handle, and style bounds", () => {
    const markup = emitMarkup(
      rail({
        options: {
          landmarkLabel: "Navegación",
          storageKey: "docs",
          minInlineSize: "12rem",
          maxInlineSize: "22rem",
          defaultCollapsed: true,
        },
      }),
    );
    expect(markup).toContain("<aside");
    expect(markup).toContain("data-sk-sidebar");
    expect(markup).toContain("data-sk-sidebar-content");
    expect(markup).toContain("data-sk-sidebar-trigger");
    expect(markup).toContain("data-sk-sidebar-resize");
    expect(markup).toContain("sk-splitter");
    expect(markup).toContain('aria-label="Navegación"');
    expect(markup).toContain('aria-label="Contraer"');
    expect(markup).toContain("data-default-collapsed");
    expect(markup).toContain('data-storage-key="docs"');
    expect(markup).toContain("--sk-sidebar-min-inline-size: 12rem");
    expect(markup).toContain("--sk-sidebar-max-inline-size: 22rem");
  });

  it("publishes collapse/resize events and loads splitter.css via hookSheets", () => {
    const contract = getContract("sidebar")!;
    expect(contract.events).toEqual({
      collapsedChange: "sk:sidebarcollapsedchange",
      resizeChange: "sk:sidebarresizechange",
    });
    expect(contract.hookSheets).toEqual(["@skryensya/core/patterns/splitter.css"]);
    expect(contract.signatures.Sidebar.mount).toBe("data-sk-sidebar");
    const { sheets, unplaced } = sheetsForTree(rail());
    expect(sheets).toContain("@skryensya/core/components/sidebar.css");
    expect(sheets).toContain("@skryensya/core/patterns/splitter.css");
    expect(unplaced).toEqual([]);
  });
});

describe("checkbox: boolean choice and group", () => {
  it("accepts a lone Checkbox and a named CheckboxGroup", () => {
    expect(
      validateUsageTree({
        contract: "checkbox",
        signature: "Checkbox",
        options: { name: "terms", value: "yes" },
        children: "Acepto",
      }).valid,
    ).toBe(true);
    expect(
      validateUsageTree({
        contract: "checkbox",
        signature: "CheckboxGroup",
        options: { name: "perms" },
        slots: {
          label: "Permisos",
          items: [
            { options: { value: "read", defaultChecked: true }, slots: { label: "Leer" } },
            { options: { value: "write" }, slots: { label: "Escribir" } },
          ],
        },
      }).valid,
    ).toBe(true);
  });

  it("requires name and items on CheckboxGroup, and unique item values", () => {
    expect(rules({ contract: "checkbox", signature: "CheckboxGroup" })).toEqual(
      expect.arrayContaining(["missing-required", "missing-required-slot"]),
    );
    expect(
      rules({
        contract: "checkbox",
        signature: "CheckboxGroup",
        options: { name: "perms" },
        slots: {
          label: "Permisos",
          items: [
            { options: { value: "read" }, slots: { label: "A" } },
            { options: { value: "read" }, slots: { label: "B" } },
          ],
        },
      }),
    ).toContain("duplicate-item-key");
  });

  it("publishes valueChange for CheckboxGroup DOM parity", () => {
    expect(getContract("checkbox")!.events).toEqual({
      valueChange: "sk:checkboxgroupvaluechange",
    });
  });
});

describe("carousel: named region, slides, and events", () => {
  const carousel = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "carousel",
      signature: "Carousel",
      attrs: { "aria-label": "Galería" },
      children: [
        { contract: "carousel", signature: "CarouselSlide", children: "Uno" },
        { contract: "carousel", signature: "CarouselSlide", children: "Dos" },
      ],
      ...overrides,
    }) as UsageTree;

  it("requires an accessible name and at least one slide", () => {
    expect(rules(carousel({ attrs: {} }))).toContain("missing-accessible-name");
    expect(rules({ contract: "carousel", signature: "Carousel", attrs: { "aria-label": "X" } })).toContain(
      "missing-required-slot",
    );
    expect(validateUsageTree(carousel()).valid).toBe(true);
  });

  it("rejects a slide outside a Carousel", () => {
    expect(
      rules({ contract: "carousel", signature: "CarouselSlide", children: "Huérfano" }),
    ).toContain("invalid-parent");
  });

  it("publishes change and goto events", () => {
    expect(getContract("carousel")!.events).toEqual({
      change: "sk:carouselchange",
      goto: "sk:carouselgoto",
    });
  });
});

describe("changelog: version history shape", () => {
  const release = {
    contract: "changelog",
    signature: "ChangelogRelease",
    options: { date: "2026-09-16" },
    slots: {
      version: "0.1.0",
      date: "16 sep 2026",
      children: {
        contract: "changelog",
        signature: "ChangelogEntry",
        options: { kind: "feature" },
        slots: { kind: "Feature", title: "Algo nuevo", target: "tone" },
        children: "Detalle para el consumidor.",
      },
    },
  } as const;

  it("requires releases and entries with kind/title/body", () => {
    expect(rules({ contract: "changelog", signature: "Changelog" })).toContain("missing-required-slot");
    expect(
      validateUsageTree({
        contract: "changelog",
        signature: "Changelog",
        children: release,
      } as UsageTree).valid,
    ).toBe(true);
  });

  it("loads badge.css via also compose for the kind pill", () => {
    const { sheets, unplaced } = sheetsForTree({
      contract: "changelog",
      signature: "Changelog",
      children: release,
    } as UsageTree);
    expect(sheets).toContain("@skryensya/core/components/changelog.css");
    expect(sheets).toContain("@skryensya/core/components/badge.css");
    expect(unplaced).toEqual([]);
  });

  it("rejects an entry kind outside the five consumer words", () => {
    expect(
      rules({
        contract: "changelog",
        signature: "ChangelogEntry",
        options: { kind: "added" },
        slots: { kind: "Added", title: "X" },
        children: "y",
      }),
    ).toContain("invalid-option-value");
  });

  it("pins release date to YYYY-MM-DD", () => {
    expect(
      rules({
        contract: "changelog",
        signature: "ChangelogRelease",
        options: { date: "16 sep 2026" },
        slots: { version: "0.1.0" },
      }),
    ).toContain("invalid-option-value");
    expect(
      rules({
        contract: "changelog",
        signature: "ChangelogRelease",
        options: { date: "2026-09-16" },
        slots: { version: "0.1.0", date: "16 sep 2026" },
      }),
    ).not.toContain("invalid-option-value");
  });
});

describe("kbd: key legend", () => {
  it("requires text children and accepts tone", () => {
    expect(rules({ contract: "kbd", signature: "Kbd" })).toContain("missing-required-slot");
    expect(
      validateUsageTree({
        contract: "kbd",
        signature: "Kbd",
        options: { tone: "accent" },
        children: "⌘",
      }).valid,
    ).toBe(true);
  });

  it("rejects a nested signature in the legend", () => {
    expect(
      rules({
        contract: "kbd",
        signature: "Kbd",
        children: { contract: "icon", signature: "Icon", options: { name: "close" } },
      }),
    ).toContain("slot-accepts");
  });
});

describe("annotation: specimen, labels, and a11y", () => {
  const annotated = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "annotation",
      signature: "Annotated",
      options: { label: "Partes del botón" },
      slots: {
        subject: { contract: "button", signature: "Button.action", children: "Guardar" },
        items: [
          { options: { for: ".sk-button", side: "inline-end" }, slots: { children: "Trigger" } },
        ],
      },
      ...overrides,
    }) as UsageTree;

  it("accepts a labelled diagram with subject and keyed labels", () => {
    expect(validateUsageTree(annotated()).valid).toBe(true);
  });

  it("requires label when the specimen is inert", () => {
    expect(rules(annotated({ options: { inert: true } }))).toContain("missing-accessible-name");
  });

  it("requires subject, items, and a for selector on every label", () => {
    expect(rules({ contract: "annotation", signature: "Annotated" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(
      rules(
        annotated({
          slots: {
            subject: { contract: "button", signature: "Button.action", children: "Go" },
            items: [{ slots: { children: "Orphan" } }],
          },
        }),
      ),
    ).toContain("missing-item-key");
  });

  it("rejects two labels that share a for selector", () => {
    expect(
      rules(
        annotated({
          slots: {
            subject: { contract: "button", signature: "Button.action", children: "Go" },
            items: [
              { options: { for: ".sk-button" }, slots: { children: "A" } },
              { options: { for: ".sk-button" }, slots: { children: "B" } },
            ],
          },
        }),
      ),
    ).toContain("duplicate-item-key");
  });
});

describe("back-to-top: named return control", () => {
  it("requires text children as the accessible name", () => {
    expect(rules({ contract: "back-to-top", signature: "BackToTop" })).toContain(
      "missing-required-slot",
    );
    expect(
      validateUsageTree({
        contract: "back-to-top",
        signature: "BackToTop",
        options: { threshold: 200 },
        children: "Volver arriba",
      }).valid,
    ).toBe(true);
  });

  it("rejects a nested signature in the label", () => {
    expect(
      rules({
        contract: "back-to-top",
        signature: "BackToTop",
        children: { contract: "icon", signature: "Icon", options: { name: "chevron-up" } },
      }),
    ).toContain("slot-accepts");
  });
});

describe("loader: status naming and visually-hidden sheet", () => {
  it("accepts a labelled Loader and requires label on Loader.status", () => {
    expect(
      validateUsageTree({
        contract: "loader",
        signature: "Loader",
        options: { label: "Cargando", variant: "spokes" },
      }).valid,
    ).toBe(true);
    expect(rules({ contract: "loader", signature: "Loader.status" })).toContain("missing-required");
    expect(
      validateUsageTree({
        contract: "loader",
        signature: "Loader.status",
        options: { label: "Cargando artículos" },
      }).valid,
    ).toBe(true);
  });

  it("loads visually-hidden.css via hookSheets for Loader.status", () => {
    const { sheets, unplaced } = sheetsForTree({
      contract: "loader",
      signature: "Loader.status",
      options: { label: "Cargando" },
    });
    expect(sheets).toContain("@skryensya/core/components/loader.css");
    expect(sheets).toContain("@skryensya/core/patterns/visually-hidden.css");
    expect(unplaced).toEqual([]);
  });
});

describe("avatar: initials, image, and group", () => {
  it("requires name on initials and imageName+src on image", () => {
    expect(
      rules({ contract: "avatar", signature: "Avatar.initials", children: "AL" }),
    ).toContain("missing-required");
    expect(
      rules({
        contract: "avatar",
        signature: "Avatar.image",
        options: { src: "/a.png" },
      }),
    ).toContain("missing-required");
  });

  it("accepts both structures and a group of them", () => {
    expect(
      validateUsageTree({
        contract: "avatar",
        signature: "Avatar.initials",
        options: { name: "Ada Lovelace" },
        children: "AL",
      }).valid,
    ).toBe(true);
    expect(
      validateUsageTree({
        contract: "avatar",
        signature: "Avatar.image",
        options: { src: "/ada.png", imageName: "Ada Lovelace" },
      }).valid,
    ).toBe(true);
    expect(
      validateUsageTree({
        contract: "avatar",
        signature: "AvatarGroup",
        options: { label: "Reviewers" },
        children: [
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { name: "Ada Lovelace" },
            children: "AL",
          },
        ],
      }).valid,
    ).toBe(true);
  });

  it("loads image-frame.css when Avatar.image composes the frame", () => {
    const { sheets, unplaced } = sheetsForTree({
      contract: "avatar",
      signature: "Avatar.image",
      options: { src: "/ada.png", imageName: "Ada Lovelace" },
    });
    expect(sheets).toContain("@skryensya/core/components/avatar.css");
    expect(sheets).toContain("@skryensya/core/patterns/image-frame.css");
    expect(unplaced).toEqual([]);
  });
});

describe("tooltip: content, machine options, and anchored sheet", () => {
  const tip = (options?: Record<string, string | number | boolean>): UsageTree => ({
    contract: "tooltip",
    signature: "Tooltip",
    ...(options ? { options } : {}),
    slots: {
      children: {
        contract: "button",
        signature: "Button.action",
        options: { iconOnly: true },
        attrs: { "aria-label": "Help" },
        children: { contract: "icon", signature: "Icon", options: { name: "info" } },
      },
      content: "More about this",
    },
  });

  it("requires a trigger signature and text content", () => {
    expect(rules({ contract: "tooltip", signature: "Tooltip" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
  });

  it("accepts machine options and arrow", () => {
    expect(
      validateUsageTree(
        tip({ arrow: true, interactive: false, openDelay: 0, disabled: true, defaultOpen: true }),
      ).valid,
    ).toBe(true);
  });

  it("loads anchored.css via hookSheets", () => {
    const { sheets, unplaced } = sheetsForTree(tip({ arrow: true }));
    expect(sheets).toContain("@skryensya/core/components/tooltip.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(unplaced).toEqual([]);
  });

  it("publishes openChange as sk:tooltipopenchange", () => {
    expect(getContract("tooltip")!.events).toEqual({ openChange: "sk:tooltipopenchange" });
  });
});

describe("popover: panelId, trigger naming, and anchored sheet", () => {
  const popover = (
    options?: Record<string, string | boolean>,
    slots?: UsageTree["slots"],
  ): UsageTree => ({
    contract: "popover",
    signature: "Popover",
    options: { panelId: "filters", ...options },
    slots: {
      trigger: "Open",
      children: "Body",
      ...slots,
    },
  });

  it("requires panelId so the platform can link trigger and panel", () => {
    expect(
      rules({
        contract: "popover",
        signature: "Popover",
        slots: { trigger: "Open", children: "Body" },
      }),
    ).toContain("missing-required");
  });

  it("requires triggerLabel when the trigger is icon-only", () => {
    expect(rules(popover({ triggerIconOnly: true }))).toContain("missing-accessible-name");
    expect(
      validateUsageTree(popover({ triggerIconOnly: true, triggerLabel: "Abrir filtros" })).valid,
    ).toBe(true);
  });

  it("loads anchored.css via hookSheets alongside popover and button", () => {
    const { sheets, unplaced } = sheetsForTree(popover({ arrow: true }));
    expect(sheets).toContain("@skryensya/core/components/popover.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });

  it("emits closeLabel as visible text, not a data-close-label attribute", () => {
    const html = emitMarkup(popover({ closeLabel: "Close" }));
    expect(html).toMatch(/>\s*Close\s*<\/button>/);
    expect(html).not.toContain("data-close-label");
  });
});

describe("dialog: required anatomy and Dialog Vaul sheet", () => {
  const dialog = (options?: Record<string, string | boolean>, slots?: UsageTree["slots"]): UsageTree => ({
    contract: "dialog",
    signature: "Dialog",
    ...(options ? { options } : {}),
    slots: {
      title: "Confirmar",
      children: "Contenido",
      ...slots,
    },
  });

  it("requires title and children", () => {
    expect(rules({ contract: "dialog", signature: "Dialog" })).toEqual(
      expect.arrayContaining(["missing-required-slot"]),
    );
    expect(
      rules({
        contract: "dialog",
        signature: "Dialog",
        slots: { title: "Solo título" },
      }),
    ).toContain("missing-required-slot");
  });

  it("accepts alert and vaul options on a complete tree", () => {
    expect(validateUsageTree(dialog({ alert: true, vaul: true, open: true })).valid).toBe(true);
  });

  it("rejects a nested signature in the title slot", () => {
    const tree: UsageTree = {
      contract: "dialog",
      signature: "Dialog",
      slots: {
        title: {
          contract: "icon",
          signature: "Icon",
          options: { name: "close" },
        },
        children: "Contenido",
      },
    };
    expect(rules(tree)).toContain("slot-accepts");
  });

  it("names dialog-vaul.css via hookSheets so a Dialog tree loads the composition sheet", () => {
    const { sheets, unplaced } = sheetsForTree(dialog({ vaul: true }));
    expect(sheets).toContain("@skryensya/core/components/dialog.css");
    expect(sheets).toContain("@skryensya/core/patterns/dialog-vaul.css");
    expect(sheets).toContain("@skryensya/core/components/button.css");
    expect(unplaced).toEqual([]);
  });

  it("publishes closeLabel as aria-label, not a host data attribute", () => {
    const contract = getContract("dialog")!;
    expect(contract.options.closeLabel.attr).toBe("aria-label");
    expect(contract.options.closeLabel.machineInput).toBeUndefined();
    expect(contract.hookSheets).toEqual(["@skryensya/core/patterns/dialog-vaul.css"]);
  });

  it("emits data-footer-align on the host when footerAlign is start", () => {
    expect(emitMarkup(dialog({ footerAlign: "start" }))).toMatch(/data-footer-align="start"/);
    expect(emitMarkup(dialog())).not.toMatch(/data-footer-align/);
  });
});

describe("vaul: an edge panel whose drag is authorable", () => {
  const body: UsageTree = { contract: "typography", signature: "Text", children: "Contenido" };
  const vaul = (options: Readonly<Record<string, string | number | boolean>>, signature = "Vaul"): UsageTree => ({
    contract: "vaul",
    signature,
    options,
    children: body,
  });

  it("requires a name on both signatures: label, or aria-labelledby to a heading inside", () => {
    expect(rules(vaul({}))).toContain("missing-accessible-name");
    expect(rules(vaul({}, "Vaul.drawer"))).toContain("missing-accessible-name");
    expect(rules({ ...vaul({}), attrs: { "aria-labelledby": "titulo" } })).not.toContain("missing-accessible-name");
  });

  it("rejects an edge that is not logical", () => {
    expect(rules(vaul({ label: "Filtros", edge: "bottom" }))).toContain("invalid-option-value");
  });

  it("accepts draggable and dismissThreshold, which the enhancer reads off the DOM", () => {
    const tree = vaul({ label: "Menú", draggable: false, dismissThreshold: 0.6 }, "Vaul.drawer");
    expect(validateUsageTree(tree).valid).toBe(true);

    const markup = emitMarkup(tree);
    expect(markup).toContain('data-draggable="false"');
    expect(markup).toContain('data-dismiss-threshold="0.6"');
  });

  it("writes nothing for draggable when it is on, the enhancer's own default", () => {
    expect(emitMarkup(vaul({ label: "Filtros", draggable: true }))).not.toContain("data-draggable");
  });

  it("hands draggable to React as a prop", () => {
    const source = JSON.stringify(emitReactSource(vaul({ label: "Filtros", draggable: false })));
    expect(source).toContain("draggable={false}");
  });

  it("publishes the openChange event", () => {
    expect(getContract("vaul")!.events).toEqual({ openChange: "sk:vaulopenchange" });
  });
});

describe("typography: roles and outputs a tree can say", () => {
  it("accepts a title-block role on Text and emits it as data-role in both bindings", () => {
    const tree: UsageTree = {
      contract: "typography",
      signature: "Text",
      options: { textRole: "eyebrow" },
      children: "Integración",
    };

    expect(validateUsageTree(tree).valid).toBe(true);
    expect(emitMarkup(tree)).toContain('data-role="eyebrow"');
    expect(JSON.stringify(emitReactSource(tree))).toContain('textRole=\\"eyebrow\\"');
  });

  it("rejects a role the stylesheet does not have", () => {
    const tree: UsageTree = { contract: "typography", signature: "Text", options: { textRole: "lede" }, children: "x" };
    expect(rules(tree)).toContain("invalid-option-value");
  });

  it("keeps textRole off Heading, where a kicker is the wrong element", () => {
    const tree: UsageTree = { contract: "typography", signature: "Heading", options: { textRole: "eyebrow" }, children: "x" };
    expect(rules(tree)).toContain("unknown-option");
  });

  it("links an Output to its inputs as for / htmlFor", () => {
    const tree: UsageTree = {
      contract: "typography",
      signature: "Output",
      options: { outputFor: "qty price" },
      children: "42",
    };

    expect(validateUsageTree(tree).valid).toBe(true);
    expect(emitMarkup(tree)).toContain('for="qty price"');
    expect(JSON.stringify(emitReactSource(tree))).toContain('htmlFor=\\"qty price\\"');
  });

  it("keeps Code children as text only", () => {
    const ok: UsageTree = { contract: "typography", signature: "Code", children: "/status" };
    expect(validateUsageTree(ok).valid).toBe(true);
    const nested: UsageTree = {
      contract: "typography",
      signature: "Code",
      children: { contract: "icon", signature: "Icon", options: { name: "close" } },
    };
    expect(rules(nested)).toContain("slot-accepts");
  });
});

describe("treegrid: identity and cell content", () => {
  const cell = (text: string): UsageTree => ({ contract: "treegrid", signature: "TreegridCell", children: text });
  const grid = (row: UsageTree): UsageTree => ({
    contract: "treegrid",
    signature: "Treegrid",
    options: { label: "Archivos" },
    children: { contract: "treegrid", signature: "TreegridBody", children: row },
  });
  const rowWith = (options: Readonly<Record<string, string | number | boolean>>, children: UsageTree[]): UsageTree => ({
    contract: "treegrid",
    signature: "TreegridRow",
    options,
    children,
  });

  it("accepts a row that states its position and its value", () => {
    const tree = grid(rowWith({ level: 1, setSize: 1, posInset: 1, value: "docs" }, [cell("Documentos")]));
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("requires value on a row: both events report it and React keys state by it", () => {
    const tree = grid(rowWith({ level: 1, setSize: 1, posInset: 1 }, [cell("Documentos")]));
    expect(rules(tree)).toContain("missing-required");
  });

  it("keeps cells to text, the audited treegrid-1 scope", () => {
    const button: UsageTree = { contract: "button", signature: "Button.action", children: "Abrir" };
    const tree = grid(
      rowWith({ level: 1, setSize: 1, posInset: 1, value: "docs" }, [
        { contract: "treegrid", signature: "TreegridCell", children: button },
      ]),
    );
    expect(rules(tree)).toContain("slot-accepts");
  });

  it("publishes both events", () => {
    expect(getContract("treegrid")!.events).toEqual({
      expandedChange: "sk:treegridexpandedchange",
      activate: "sk:treegridactivate",
    });
  });
});

describe("tree-view: node ids are the tree's, not the level's", () => {
  type Node = { options: { id: string }; slots: { label: string; children?: Node[] } };
  const leaf = (id: string, label = id): Node => ({ options: { id }, slots: { label } });
  const folder = (id: string, children: Node[]): Node => ({ options: { id }, slots: { label: id, children } });
  const tree = (items: Node[]): UsageTree => ({
    contract: "tree-view",
    signature: "TreeView",
    options: { label: "Archivos" },
    slots: { items },
  });

  it("accepts ids that are unique across every depth", () => {
    expect(validateUsageTree(tree([folder("src", [leaf("src/index.ts")]), leaf("README.md")])).valid).toBe(true);
  });

  it("rejects an id reused at another depth: the machine addresses nodes tree-wide", () => {
    expect(rules(tree([folder("src", [folder("lib", [leaf("src")])])]))).toContain("duplicate-item-key");
  });

  it("still rejects a nested node with no id", () => {
    const nameless = { slots: { label: "a.ts" } } as unknown as Node;
    expect(rules(tree([folder("src", [nameless])]))).toContain("missing-item-key");
  });

  it("publishes both events", () => {
    expect(getContract("tree-view")!.events).toEqual({
      selectionChange: "sk:treeviewselectionchange",
      expandedChange: "sk:treeviewexpandedchange",
    });
  });
});

describe("element options: a host whose tag is a decision", () => {
  it("renders a Heading at the level the tree states, in both bindings", () => {
    const tree: UsageTree = {
      contract: "typography",
      signature: "Heading",
      options: { headingElement: "h1", headingSize: "display-md" },
      children: "Informe",
    };

    expect(validateUsageTree(tree).valid).toBe(true);
    expect(emitMarkup(tree)).toMatch(/^<h1 class="sk-heading"[^>]*>Informe<\/h1>$/);
    expect(JSON.stringify(emitReactSource(tree))).toContain('as=\\"h1\\"');
  });

  it("keeps the template's element when the option is absent", () => {
    const tree: UsageTree = { contract: "typography", signature: "Heading", children: "Sección" };
    expect(emitMarkup(tree)).toMatch(/^<h2 /);
  });

  it("lets Text be a span inside a line", () => {
    const tree: UsageTree = { contract: "typography", signature: "Text", options: { textElement: "span" }, children: "x" };
    expect(emitMarkup(tree)).toMatch(/^<span[\s>]/);
    expect(emitMarkup(tree)).toMatch(/<\/span>$/);
  });

  it("rejects an element outside the enum", () => {
    const tree: UsageTree = { contract: "typography", signature: "Heading", options: { headingElement: "div" }, children: "x" };
    expect(rules(tree)).toContain("invalid-option-value");
  });

  it("holds every element option in the catalogue to its shape", () => {
    const broken: string[] = [];
    for (const id of contractIds()) {
      const contract = getContract(id)!;
      for (const [name, option] of Object.entries(contract.options)) {
        if (!option.element) continue;
        if (option.type !== "enum" || !option.values?.length) broken.push(`${id}.${name}: not an enum`);
        if (option.attr) broken.push(`${id}.${name}: an element option writes no attribute`);
        for (const [sigName, signature] of Object.entries(contract.signatures)) {
          if (!signature.options.includes(name)) continue;
          if (option.default !== signature.template.element)
            broken.push(`${id}.${name}: default ${String(option.default)} is not ${sigName}'s <${signature.template.element}>`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("keyOf: an option that names entries must name real ones", () => {
  const tab = (value: string) => ({ options: { value }, slots: { label: value, children: `${value} body` } });
  const tabs = (value?: string): UsageTree =>
    ({
      contract: "tabs",
      signature: "Tabs",
      attrs: { "aria-label": "Ajustes" },
      ...(value !== undefined ? { options: { value } } : {}),
      slots: { items: [tab("general"), tab("billing")] },
    }) as UsageTree;

  it("accepts a starting tab that exists", () => {
    expect(rules(tabs("billing"))).not.toContain("unknown-key");
  });

  it("rejects a starting tab no entry has, and lists the ones there are", () => {
    const tree = tabs("biling");
    expect(rules(tree)).toContain("unknown-key");
    expect(messageFor(tree, "unknown-key")).toContain("general, billing");
  });

  /*
   * THE SAME QUESTION, ASKED OF AN ENTRY. A Diagram's edges name nodes of the SAME signature's
   * other collection, which is the one authoring mistake that component really has: `from`/`to` are
   * the only strings in the composition that have to match something else in it. The host-option
   * half above simply happens to be the case that turned up first.
   */
  const diagram = (to: string): UsageTree => ({
    contract: "diagram",
    signature: "Diagram",
    options: { label: "Flujo" },
    slots: {
      nodes: [
        { options: { node: "start" }, slots: { children: "Empieza" } },
        { options: { node: "end" }, slots: { children: "Termina" } },
      ],
      edges: [{ options: { from: "start", to }, slots: {} }],
    },
  });

  it("accepts an edge whose ends both name nodes of the drawing", () => {
    expect(rules(diagram("end"))).not.toContain("unknown-key");
  });

  it("rejects an edge pointing at a node the drawing does not have", () => {
    const tree = diagram("finish");
    expect(rules(tree)).toContain("unknown-key");
    const message = messageFor(tree, "unknown-key");
    /* Named by where it is, since an entry has no name of its own to quote. */
    expect(message).toContain("edges[0].to");
    expect(message).toContain("start, end");
  });

  const treeView = (options: Readonly<Record<string, string>>): UsageTree => ({
    contract: "tree-view",
    signature: "TreeView",
    options: { label: "Archivos", ...options },
    slots: {
      items: [
        { options: { id: "src" }, slots: { label: "src", children: [{ options: { id: "src/lib" }, slots: { label: "lib" } }] } },
        { options: { id: "README.md" }, slots: { label: "README.md" } },
      ],
    },
  });

  it("looks a list up at every depth of a recursive collection", () => {
    expect(rules(treeView({ defaultExpandedValue: "src, src/lib", defaultSelectedValue: "README.md" }))).not.toContain(
      "unknown-key",
    );
  });

  it("reports each missing member of a list", () => {
    const problems = validateUsageTree(treeView({ defaultExpandedValue: "src scr lib" })).problems.filter(
      (p) => p.rule === "unknown-key",
    );
    expect(problems.map((p) => p.message)).toEqual([
      expect.stringContaining('"scr"'),
      expect.stringContaining('"lib"'),
    ]);
  });

  it("points every keyOf in the catalogue at a keyed slot of a signature that takes the option", () => {
    const broken: string[] = [];
    for (const id of contractIds()) {
      const contract = getContract(id)!;
      for (const [name, option] of Object.entries(contract.options)) {
        if (!option.keyOf) continue;
        const users = Object.values(contract.signatures).filter((signature) => signature.options.includes(name));
        const keyed = users.some((signature) => signature.slots[option.keyOf!.slot]?.item?.key !== undefined);
        if (!keyed) broken.push(`${id}.${name} -> ${option.keyOf.slot}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("a required string must say something", () => {
  const body: UsageTree = { contract: "typography", signature: "Text", children: "Contenido" };

  it("rejects an empty or blank name, required or not", () => {
    for (const label of ["", "   "]) {
      const tree: UsageTree = { contract: "vaul", signature: "Vaul", options: { label }, children: body };
      expect(rules(tree), JSON.stringify(label)).toContain("invalid-option-value");
    }
  });

  it("rejects an empty required href", () => {
    const tree: UsageTree = { contract: "typography", signature: "Link", options: { href: "" }, children: "Docs" };
    expect(rules(tree)).toContain("empty-required");
  });

  it("leaves an optional empty string alone", () => {
    const tree: UsageTree = {
      contract: "vaul",
      signature: "Vaul",
      options: { label: "Filtros", dismissThreshold: 0.4 },
      children: body,
    };
    expect(rules(tree)).not.toContain("empty-required");
  });
});

describe("flatHierarchy: treegrid rows tell a screen reader the truth", () => {
  type Row = { level: number; setSize: number; posInset: number; value: string; expanded?: boolean };
  const grid = (rows: Row[]): UsageTree => ({
    contract: "treegrid",
    signature: "Treegrid",
    options: { label: "Archivos" },
    children: {
      contract: "treegrid",
      signature: "TreegridBody",
      children: rows.map((options) => ({
        contract: "treegrid",
        signature: "TreegridRow",
        options,
        children: { contract: "treegrid", signature: "TreegridCell", children: options.value },
      })),
    },
  });
  const hierarchy = (rows: Row[]) =>
    validateUsageTree(grid(rows)).problems.filter((p) => p.rule === "invalid-hierarchy").map((p) => p.message);

  const good: Row[] = [
    { level: 1, setSize: 2, posInset: 1, value: "docs", expanded: true },
    { level: 2, setSize: 2, posInset: 1, value: "docs/a" },
    { level: 2, setSize: 2, posInset: 2, value: "docs/b" },
    { level: 1, setSize: 2, posInset: 2, value: "readme" },
  ];

  it("accepts a consistent hierarchy", () => {
    expect(hierarchy(good)).toEqual([]);
  });

  it("rejects a depth that jumps a level", () => {
    const rows = [good[0]!, { ...good[1]!, level: 3 }, good[2]!, good[3]!];
    expect(hierarchy(rows)).toEqual(expect.arrayContaining([expect.stringContaining("one level at a time")]));
  });

  it("rejects a set size its siblings do not add up to", () => {
    const rows = [good[0]!, { ...good[1]!, setSize: 3 }, { ...good[2]!, setSize: 3 }, good[3]!];
    expect(hierarchy(rows)).toEqual(expect.arrayContaining([expect.stringContaining("holds 2 row(s)")]));
  });

  it("rejects siblings numbered out of order", () => {
    const rows = [good[0]!, good[2]!, good[1]!, good[3]!];
    expect(hierarchy(rows)).toEqual(expect.arrayContaining([expect.stringContaining("numbered in order")]));
  });

  it("rejects a leaf with rows under it", () => {
    const { expanded: _omit, ...leafDocs } = good[0]!;
    expect(hierarchy([leafDocs, good[1]!, good[2]!, good[3]!])).toEqual(
      expect.arrayContaining([expect.stringContaining("must state expanded")]),
    );
  });

  it("rejects a value used twice", () => {
    const rows = [good[0]!, good[1]!, { ...good[2]!, value: "docs/a" }, good[3]!];
    expect(hierarchy(rows)).toEqual(expect.arrayContaining([expect.stringContaining("used by an earlier row")]));
  });

  it("only advises about a branch with no rows under it: an empty folder is real", () => {
    const rows: Row[] = [{ level: 1, setSize: 1, posInset: 1, value: "empty", expanded: false }];
    const result = validateUsageTree(grid(rows));
    expect(result.valid).toBe(true);
    expect(result.problems.map((p) => p.rule)).toContain("empty-branch");
  });
});

describe("content model: what the HTML parser would move", () => {
  const stack: UsageTree = {
    contract: "layout",
    signature: "Stack",
    children: { contract: "typography", signature: "Text", children: "adentro" },
  };

  it("rejects a block inside a Text paragraph", () => {
    const tree: UsageTree = { contract: "typography", signature: "Text", children: [stack] };
    expect(rules(tree)).toContain("content-model");
    expect(validateUsageTree(tree).valid).toBe(false);
  });

  it("only advises about a paragraph inside a Heading: invalid, but the parser keeps it", () => {
    const tree: UsageTree = {
      contract: "typography",
      signature: "Heading",
      children: [{ contract: "typography", signature: "Text", children: "subtítulo" }],
    };
    const result = validateUsageTree(tree);
    expect(result.valid).toBe(true);
    expect(rules(tree)).toContain("content-model");
    expect(messageFor(tree, "content-model")).toContain('textElement: "span"');
  });

  it("errors on a paragraph inside a paragraph: the parser splits them", () => {
    const tree: UsageTree = {
      contract: "typography",
      signature: "Text",
      children: [{ contract: "typography", signature: "Text", children: "adentro" }],
    };
    expect(validateUsageTree(tree).valid).toBe(false);
  });

  it("accepts the same Text as a span, and inline signatures inside a paragraph", () => {
    const heading: UsageTree = {
      contract: "typography",
      signature: "Heading",
      children: [{ contract: "typography", signature: "Text", options: { textElement: "span" }, children: "x" }],
    };
    const paragraph: UsageTree = {
      contract: "typography",
      signature: "Text",
      children: [
        "Ver ",
        { contract: "typography", signature: "Code", children: "/status" },
        " y ",
        { contract: "typography", signature: "Link", options: { href: "/docs" }, children: "la guía" },
      ],
    };
    expect(rules(heading)).not.toContain("content-model");
    expect(rules(paragraph)).not.toContain("content-model");
  });

  it("follows an element option on the parent: a div Text holds blocks", () => {
    const tree: UsageTree = { contract: "typography", signature: "Text", options: { textElement: "div" }, children: [stack] };
    expect(rules(tree)).not.toContain("content-model");
  });

  /*
   * `<summary>` is the strict one. Everything above is either a parser fact (a block closes a `<p>`)
   * or an advisory; this is the one place a merely-invalid nesting is refused outright, because the
   * summary IS the disclosure's control and its content is the accessible name.
   */
  const summary = (child: UsageTree | string): UsageTree => ({
    contract: "accordion",
    signature: "Details",
    children: [
      { contract: "accordion", signature: "Details.Summary", children: child },
      { contract: "accordion", signature: "Details.Content", children: "Body" },
    ],
  });

  it("refuses a block inside a summary, as an error rather than an advisory", () => {
    const tree = summary(stack);
    expect(rules(tree)).toContain("content-model");
    expect(validateUsageTree(tree).valid).toBe(false);
    expect(messageFor(tree, "content-model")).toContain("<summary>");
  });

  it("points a Text in a summary at the span it should have been", () => {
    expect(messageFor(summary({ contract: "typography", signature: "Text", children: "x" }), "content-model")).toContain(
      'textElement: "span"',
    );
  });

  /*
   * HTML §4.11.2: "phrasing content, optionally intermixed with heading content". A heading is the
   * ordinary way to title a disclosure, so it has to pass where the same child inside a `<span>` or
   * a `<button>` would not.
   */
  it("allows a heading, which is the one thing summary takes that other phrasing parents do not", () => {
    const heading: UsageTree = { contract: "typography", signature: "Heading", options: { headingSize: "h3" }, children: "Runtime" };
    expect(rules(summary(heading))).not.toContain("content-model");
    expect(rules(summary("Runtime"))).not.toContain("content-model");
    expect(
      rules(summary({ contract: "typography", signature: "Text", options: { textElement: "span" }, children: "x" })),
    ).not.toContain("content-model");
  });
});

describe("numeric bounds", () => {
  const body: UsageTree = { contract: "typography", signature: "Text", children: "Contenido" };
  const vaul = (dismissThreshold: number): UsageTree => ({
    contract: "vaul",
    signature: "Vaul",
    options: { label: "Filtros", dismissThreshold },
    children: body,
  });

  it("accepts both ends of an inclusive range", () => {
    expect(rules(vaul(0))).not.toContain("invalid-option-value");
    expect(rules(vaul(1))).not.toContain("invalid-option-value");
  });

  it("rejects a value past either end, and says which", () => {
    expect(messageFor(vaul(40), "invalid-option-value")).toContain("at most 1");
    expect(messageFor(vaul(-0.1), "invalid-option-value")).toContain("at least 0");
  });

  it("rejects a fraction where only whole numbers make sense", () => {
    const trigger: UsageTree = {
      contract: "accordion",
      signature: "Accordion.Trigger",
      options: { headingLevel: 2.5 },
      children: "Título",
    };
    expect(messageFor(trigger, "invalid-option-value")).toContain("whole number");
  });

  it("keeps every declared default inside its own bounds", () => {
    const broken: string[] = [];
    for (const id of contractIds()) {
      for (const [name, option] of Object.entries(getContract(id)!.options)) {
        if (typeof option.default !== "number") continue;
        const d = option.default;
        if ((option.min !== undefined && d < option.min) || (option.max !== undefined && d > option.max) || (option.integer && !Number.isInteger(d)))
          broken.push(`${id}.${name}=${d}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("vaul: a trigger outside the panel, paired by id", () => {
  const body: UsageTree = { contract: "typography", signature: "Text", children: "Contenido" };
  const trigger = (opens: string, options: Readonly<Record<string, string | boolean>> = {}): UsageTree => ({
    contract: "vaul",
    signature: "Vaul.Trigger",
    options: { opens, ...options },
    children: "Filtrar",
  });
  const panel = (panelId?: string): UsageTree => ({
    contract: "vaul",
    signature: "Vaul",
    options: { label: "Filtros", ...(panelId ? { panelId } : {}) },
    children: [body, { contract: "vaul", signature: "Vaul.Close", children: "Listo" }],
  });
  const page = (...children: UsageTree[]): UsageTree => ({ contract: "layout", signature: "Stack", children });

  it("accepts a trigger naming a panel in the same tree", () => {
    expect(validateUsageTree(page(trigger("filtros"), panel("filtros"))).valid).toBe(true);
  });

  it("rejects a trigger whose panel is not there", () => {
    const tree = page(trigger("filtro"), panel("filtros"));
    expect(rules(tree)).toContain("unknown-reference");
    expect(messageFor(tree, "unknown-reference")).toContain('panelId="filtro"');
  });

  it("requires the trigger to name a panel at all", () => {
    expect(rules({ contract: "vaul", signature: "Vaul.Trigger", children: "Filtrar" })).toContain("missing-required");
  });

  it("asks an icon-only trigger for a name", () => {
    const tree = page(trigger("filtros", { buttonIconOnly: true }), panel("filtros"));
    expect(rules(tree)).toContain("missing-accessible-name");
  });

  it("emits the pairing both bindings read", () => {
    const tree = page(trigger("filtros", { buttonVariant: "ghost" }), panel("filtros"));
    const markup = emitMarkup(tree);
    expect(markup).toContain('data-sk-vaul-open="filtros"');
    expect(markup).toContain('aria-controls="filtros"');
    expect(markup).toMatch(/<dialog[^>]*id="filtros"/);
    expect(markup).toContain("data-sk-vaul-close");

    const react = JSON.stringify(emitReactSource(tree));
    expect(react).toContain("<Vaul.Trigger");
    expect(react).toContain('opens=\\"filtros\\"');
    expect(react).toContain('id=\\"filtros\\"');
    expect(react).toContain("<Vaul.Close>");
  });
});

describe("layout primitives choose a sectioning element", () => {
  const text: UsageTree = { contract: "typography", signature: "Text", children: "Hola" };

  it("emits a Wrapper as <main> and hands React as=\"main\"", () => {
    const tree: UsageTree = { contract: "wrapper", signature: "Wrapper", options: { wrapperElement: "main" }, children: text };
    expect(validateUsageTree(tree).valid).toBe(true);
    expect(emitMarkup(tree)).toMatch(/^<main class="sk-wrapper"/);
    expect(JSON.stringify(emitReactSource(tree))).toContain('as=\\"main\\"');
  });

  it("emits a Stack as <section> and a Box as <aside>", () => {
    const stack: UsageTree = { contract: "layout", signature: "Stack", options: { layoutElement: "section" }, children: text };
    const box: UsageTree = {
      contract: "box",
      signature: "Box",
      options: { padding: "md", boxElement: "aside" },
      children: text,
    };
    expect(emitMarkup(stack)).toMatch(/^<section\s+class="sk-stack"/);
    expect(emitMarkup(box)).toMatch(/^<aside\s+class="sk-box"/);
    expect(emitMarkup(box)).toMatch(/<\/aside>$/);
  });

  it("keeps lists out: their children would have to be <li>", () => {
    const tree: UsageTree = { contract: "layout", signature: "Stack", options: { layoutElement: "ul" }, children: text };
    expect(rules(tree)).toContain("invalid-option-value");
  });

  it("still catches a sectioning element dropped into a paragraph", () => {
    const tree: UsageTree = {
      contract: "typography",
      signature: "Text",
      children: [{ contract: "layout", signature: "Inline", options: { layoutElement: "section" }, children: text }],
    };
    expect(validateUsageTree(tree).valid).toBe(false);
  });
});

describe("one decision spelled once, kept values, and ancestors", () => {
  it("rejects a Text role alongside the size it already sets", () => {
    const tree: UsageTree = {
      contract: "typography",
      signature: "Text",
      options: { textRole: "eyebrow", size: "lg" },
      children: "Integración",
    };
    expect(rules(tree)).toContain("excluded-option");
    expect(messageFor(tree, "excluded-option")).toContain("drop size");
  });

  it("accepts a role on its own, and size, tone and weight without one", () => {
    expect(rules({ contract: "typography", signature: "Text", options: { textRole: "subtitle" }, children: "x" })).not.toContain(
      "excluded-option",
    );
    expect(
      rules({ contract: "typography", signature: "Text", options: { size: "lg", tone: "secondary" }, children: "x" }),
    ).not.toContain("excluded-option");
  });

  it("advises the rung instead of a legacy Heading alias, without failing the tree", () => {
    const tree: UsageTree = { contract: "typography", signature: "Heading", options: { headingSize: "sm" }, children: "x" };
    expect(validateUsageTree(tree).valid).toBe(true);
    expect(messageFor(tree, "deprecated-value")).toContain('use "h3"');
  });

  it("rejects a Wrapper nested in a Wrapper at any depth", () => {
    const inner: UsageTree = {
      contract: "wrapper",
      signature: "Wrapper",
      children: { contract: "typography", signature: "Text", children: "x" },
    };
    const tree: UsageTree = {
      contract: "wrapper",
      signature: "Wrapper",
      children: { contract: "layout", signature: "Stack", children: inner },
    };
    expect(rules(tree)).toContain("invalid-ancestor");
  });

  it("keeps every outputHook inside its contract's hooks, and every deprecated value in its enum", () => {
    const broken: string[] = [];
    for (const id of contractIds()) {
      const contract = getContract(id)!;
      for (const hook of contract.outputHooks ?? []) if (!contract.hooks?.includes(hook)) broken.push(`${id} ${hook}`);
      for (const [name, option] of Object.entries(contract.options)) {
        for (const [value, replacement] of Object.entries(option.deprecatedValues ?? {})) {
          if (!option.values?.includes(value) || !option.values.includes(replacement)) broken.push(`${id}.${name} ${value}->${replacement}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("event names: one convention across the catalogue", () => {
  it("names every published event sk:<family><event>, lowercase, and never reuses one across families", () => {
    const broken: string[] = [];
    const owner = new Map<string, string>();
    for (const id of contractIds()) {
      const family = id.replaceAll("-", "");
      for (const [key, name] of Object.entries(getContract(id)!.events ?? {})) {
        if (!/^sk:[a-z]+$/.test(name)) broken.push(`${id}.${key}: "${name}" is not sk:<lowercase>`);
        const previous = owner.get(name);
        if (previous && previous !== id) broken.push(`${id}.${key}: "${name}" is already ${previous}'s`);
        owner.set(name, id);
        // The family is the contract id or the name of one of its signatures: Toast lives in `content`.
        const families = [family, ...Object.keys(getContract(id)!.signatures).map((sig) => sig.split(".")[0]!.toLowerCase())];
        if (!families.some((prefix) => name.startsWith(`sk:${prefix}`)))
          broken.push(`${id}.${key}: "${name}" does not start with its family (${families.join(", ")})`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("tree-view: a disabled node is data-disabled", () => {
  it("emits data-disabled on the node, never a bare disabled an <li> has no meaning for", () => {
    const tree: UsageTree = {
      contract: "tree-view",
      signature: "TreeView",
      options: { label: "Archivos" },
      slots: { items: [{ options: { id: "locked", disabled: true }, slots: { label: "locked" } }] },
    };
    const markup = emitMarkup(tree);
    expect(markup).toMatch(/<li[^>]*data-disabled/);
    expect(markup).not.toMatch(/<li[^>]*\sdisabled[\s>=]/);
  });
});

describe("list options: columnWeights", () => {
  const header = (text: string): UsageTree => ({ contract: "treegrid", signature: "TreegridColumnHeader", children: text });
  const grid = (columnWeights: string): UsageTree => ({
    contract: "treegrid",
    signature: "Treegrid",
    options: { label: "Archivos", resizableColumns: true, resizeLabel: "Redimensionar", columnWeights },
    children: [
      {
        contract: "treegrid",
        signature: "TreegridHead",
        children: { contract: "treegrid", signature: "TreegridHeadRow", children: [header("Nombre"), header("Tamaño")] },
      },
      {
        contract: "treegrid",
        signature: "TreegridBody",
        children: {
          contract: "treegrid",
          signature: "TreegridRow",
          options: { level: 1, setSize: 1, posInset: 1, value: "a" },
          children: [
            { contract: "treegrid", signature: "TreegridCell", children: "a" },
            { contract: "treegrid", signature: "TreegridCell", children: "1 KB" },
          ],
        },
      },
    ],
  });

  it("accepts one positive weight per column", () => {
    expect(validateUsageTree(grid("2, 1")).valid).toBe(true);
  });

  it("rejects an entry that is not a positive number", () => {
    expect(messageFor(grid("2,0"), "invalid-option-value")).toContain('"0"');
    expect(messageFor(grid("2,wide"), "invalid-option-value")).toContain('"wide"');
  });

  it("rejects a list whose length does not match the columns", () => {
    expect(messageFor(grid("2,1,1"), "invalid-option-value")).toContain("has 2 columns");
  });
});

describe("toolbar: loopFocus is on unless said otherwise, and groups can be named", () => {
  const bar = (options: Readonly<Record<string, string | boolean>>, group?: Readonly<Record<string, string>>): UsageTree => ({
    contract: "toolbar",
    signature: "Toolbar",
    options: { label: "Formato", ...options },
    children: {
      contract: "toolbar",
      signature: "ToolbarGroup",
      ...(group ? { options: group } : {}),
      children: { contract: "button", signature: "Button.action", children: "B" },
    },
  });

  it("writes nothing for the default loop and data-loop-focus=\"false\" to turn it off", () => {
    expect(emitMarkup(bar({}))).not.toContain("data-loop-focus");
    expect(emitMarkup(bar({ loopFocus: false }))).toContain('data-loop-focus="false"');
  });

  it("names a group with groupLabel, which React calls label", () => {
    const tree = bar({}, { groupLabel: "Estilo" });
    expect(validateUsageTree(tree).valid).toBe(true);
    expect(emitMarkup(tree)).toMatch(/role="group"[^>]*aria-label="Estilo"|aria-label="Estilo"[^>]*role="group"/);
    expect(JSON.stringify(emitReactSource(tree))).toContain('label=\\"Estilo\\"');
  });
});

describe("toc: a named index of real destinations", () => {
  const entry = (href: string | undefined, children: string) =>
    href === undefined ? { slots: { children } } : { options: { href }, slots: { children } };
  const toc = (title: string | undefined, items: ReturnType<typeof entry>[]): UsageTree =>
    ({
      contract: "toc",
      signature: "Toc",
      ...(title !== undefined ? { options: { title } } : {}),
      slots: { items },
    }) as UsageTree;

  it("accepts a titled index with one entry per anchor", () => {
    expect(validateUsageTree(toc("En esta página", [entry("#a", "A"), entry("#b", "B")])).valid).toBe(true);
  });

  it("requires a title: the template always draws the heading and names the nav with it", () => {
    expect(rules(toc(undefined, [entry("#a", "A")]))).toContain("missing-required");
  });

  it("requires every entry's href and keeps them unique", () => {
    expect(rules(toc("Índice", [entry(undefined, "A")]))).toContain("missing-item-key");
    expect(rules(toc("Índice", [entry("#a", "A"), entry("#a", "Otra vez A")]))).toContain("duplicate-item-key");
  });
});

describe("time-field: a seed the parser can read, and an error that is announced", () => {
  const field = (options: Readonly<Record<string, string | boolean>>): UsageTree => ({
    contract: "time-field",
    signature: "TimeField",
    options,
    slots: { label: "Hora de inicio" },
  });

  it("accepts an HH:mm seed and rejects one the parser would drop", () => {
    expect(rules(field({ value: "09:30" }))).not.toContain("invalid-option-value");
    expect(messageFor(field({ value: "9.30" }), "invalid-option-value")).toContain('"14:30"');
    expect(rules(field({ value: "24:00" }))).toContain("invalid-option-value");
  });

  it("writes data-invalid on the root when the field is invalid", () => {
    expect(emitMarkup(field({ invalid: true }))).toMatch(/class="sk-time-field"[^>]*data-invalid/);
  });

  it("pins the pattern to the parser's own expression", () => {
    const option = getContract("time-field")!.options.value!;
    expect(new RegExp(option.pattern!.source).test("23:59")).toBe(true);
    expect(new RegExp(option.pattern!.source).test("23:60")).toBe(false);
  });

  it("loads select.css and anchored.css via hookSheets for the preset listbox", () => {
    const contract = getContract("time-field")!;
    expect(contract.hookSheets).toEqual([
      "@skryensya/core/components/select.css",
      "@skryensya/core/patterns/anchored.css",
    ]);
    expect(contract.hooks).toContain("--sk-select-content-max-block-size");
    expect(contract.hooks).toContain("--sk-anchored-offset");
    const { sheets, unplaced } = sheetsForTree(field({ value: "09:30" }));
    expect(sheets).toContain("@skryensya/core/components/time-field.css");
    expect(sheets).toContain("@skryensya/core/components/select.css");
    expect(sheets).toContain("@skryensya/core/patterns/anchored.css");
    expect(unplaced).toEqual([]);
  });
});

describe("tabs: every tablist is named", () => {
  const tab = (value: string) => ({ options: { value }, slots: { label: value, children: `${value} body` } });
  const tabs = (attrs?: Readonly<Record<string, string>>): UsageTree =>
    ({ contract: "tabs", signature: "Tabs", ...(attrs ? { attrs } : {}), slots: { items: [tab("a"), tab("b")] } }) as UsageTree;

  it("asks for a name even when orientation is left at its default", () => {
    expect(rules(tabs())).toContain("missing-accessible-name");
  });

  it("accepts aria-label or aria-labelledby", () => {
    expect(rules(tabs({ "aria-label": "Ajustes" }))).not.toContain("missing-accessible-name");
    expect(rules(tabs({ "aria-labelledby": "ajustes-titulo" }))).not.toContain("missing-accessible-name");
  });
});

describe("table-pager: one table, then one bar that can move it", () => {
  const scroll: UsageTree = {
    contract: "table",
    signature: "TableScroll",
    children: {
      contract: "table",
      signature: "Table",
      attrs: { "aria-label": "Filas" },
      children: {
        contract: "table",
        signature: "TableBody",
        children: { contract: "table", signature: "TableRow", children: { contract: "table", signature: "TableCell", children: "1" } },
      },
    },
  };
  const nav: UsageTree = { contract: "table-pager", signature: "TablePagerNav", options: { navLabel: "Paginación" } };
  const bar = (endChildren: UsageTree[]): UsageTree => ({
    contract: "table-pager",
    signature: "TablePagerBar",
    children: { contract: "table-pager", signature: "TablePagerEnd", children: endChildren },
  });
  const pager = (children: UsageTree[]): UsageTree => ({ contract: "table-pager", signature: "TablePager", children });

  it("accepts a table followed by a bar with a nav", () => {
    expect(validateUsageTree(pager([scroll, bar([nav])])).valid).toBe(true);
  });

  it("rejects the bar before the table, a pager with no table, and an end with no nav", () => {
    expect(rules(pager([bar([nav]), scroll]))).toContain("out-of-order");
    expect(rules(pager([bar([nav])]))).toContain("wrong-cardinality");
    expect(rules(pager([scroll, bar([{ contract: "table-pager", signature: "TablePagerStatus", children: "1–1" }])]))).toContain(
      "wrong-cardinality",
    );
  });

  it("hands navLabel to React as the nav's label", () => {
    expect(JSON.stringify(emitReactSource(pager([scroll, bar([nav])])))).toContain('<TablePagerNav label=\\"Paginación\\"');
  });
});

describe("table: headers span, and so do cells in both directions", () => {
  const row = (children: UsageTree[]): UsageTree => ({ contract: "table", signature: "TableRow", children });
  const th = (text: string, options: Readonly<Record<string, string | number>> = {}): UsageTree => ({
    contract: "table",
    signature: "TableHeader",
    options,
    children: text,
  });
  const td = (text: string, options: Readonly<Record<string, number>> = {}): UsageTree => ({
    contract: "table",
    signature: "TableCell",
    options,
    children: text,
  });
  const table = (head: UsageTree[], body: UsageTree[]): UsageTree => ({
    contract: "table",
    signature: "Table",
    children: [
      { contract: "table", signature: "TableCaption", children: "Ventas por región" },
      { contract: "table", signature: "TableHead", children: head },
      { contract: "table", signature: "TableBody", children: body },
    ],
  });

  it("accepts a grouped header over its subcolumns and a row header spanning two rows", () => {
    const tree = table(
      [row([th("Región", { rowspan: 2 }), th("Ventas", { colspan: 2 })]), row([th("Q1"), th("Q2")])],
      [row([th("Norte", { scope: "row" }), td("10"), td("12")])],
    );
    expect(validateUsageTree(tree).valid).toBe(true);
    expect(emitMarkup(tree)).toContain('colspan="2"');
    expect(emitMarkup(tree)).toContain('rowspan="2"');
    expect(JSON.stringify(emitReactSource(tree))).toContain("rowSpan={2}");
  });

  it("rejects a span of zero", () => {
    expect(rules(table([row([th("A", { colspan: 0 })])], [row([td("1")])]))).toContain("invalid-option-value");
  });
});

describe("switch: its own surface, a name, and a starting state React can let go of", () => {
  const sw = (options: Readonly<Record<string, string | boolean>>, children?: string, attrs?: Readonly<Record<string, string>>): UsageTree => ({
    contract: "switch",
    signature: "Switch",
    options,
    ...(children !== undefined ? { children } : {}),
    ...(attrs ? { attrs } : {}),
  });

  it("publishes switch parts and --sk-switch-* hooks only", () => {
    const contract = getContract("switch")!;
    expect(Object.values(contract.parts).every((part) => part.startsWith("sk-switch"))).toBe(true);
    expect(contract.hooks?.every((hook) => hook.startsWith("--sk-switch-"))).toBe(true);
    expect(contract.hookSheets ?? []).toEqual([]);
  });

  it("needs a name: visible children or aria-label/labelledby", () => {
    expect(rules(sw({ name: "a" }))).toContain("missing-accessible-name");
    expect(rules(sw({ name: "a" }, "Modo oscuro"))).not.toContain("missing-accessible-name");
    expect(rules(sw({ name: "a" }, undefined, { "aria-label": "Modo oscuro" }))).not.toContain("missing-accessible-name");
  });

  it("starts on through defaultChecked, which React receives uncontrolled", () => {
    const tree = sw({ defaultChecked: true }, "Modo oscuro");
    expect(emitMarkup(tree)).toContain(" checked");
    expect(JSON.stringify(emitReactSource(tree))).toContain("defaultChecked");
    expect(rules(sw({ checked: true }, "Modo oscuro"))).toContain("unknown-option");
  });
});

describe("steps: status alone says where you are", () => {
  const entry = (status: string | undefined, label: string) => ({
    ...(status ? { options: { status } } : {}),
    slots: { marker: label.slice(0, 1), label },
  });
  const steps = (items: ReturnType<typeof entry>[], options?: Readonly<Record<string, string>>): UsageTree =>
    ({ contract: "steps", signature: "Steps", ...(options ? { options } : {}), slots: { items } }) as UsageTree;

  it("puts aria-current on the current stage only, in authored order", () => {
    const markup = emitMarkup(steps([entry("complete", "Carro"), entry("current", "Pago"), entry(undefined, "Envío")]));
    expect(markup.match(/aria-current="step"/g)).toHaveLength(1);
    expect(markup.indexOf("Carro")).toBeLessThan(markup.indexOf("Pago"));
    expect(markup.indexOf("Pago")).toBeLessThan(markup.indexOf("Envío"));
    expect(markup).toMatch(/data-status="current"[^>]*aria-current="step"|aria-current="step"[^>]*data-status="current"/);
  });

  it("no longer takes a separate current flag", () => {
    const tree = steps([{ options: { status: "current", current: true }, slots: { marker: "1", label: "Pago" } } as never]);
    expect(rules(tree)).toContain("unknown-item-option");
  });

  it("pins the rail direction with orientation", () => {
    const tree = steps([entry("current", "Pago")], { orientation: "vertical" });
    expect(emitMarkup(tree)).toContain('data-orientation="vertical"');
    expect(JSON.stringify(emitReactSource(tree))).toContain('data-orientation=\\"vertical\\"');
  });
});

describe("implies: stat's count-up needs a number, its trend needs a change", () => {
  const stat = (options: Readonly<Record<string, string | number | boolean>>, change?: string): UsageTree => ({
    contract: "stat",
    signature: "Stat",
    options,
    slots: { label: "Usuarios", value: "1.204", ...(change ? { change } : {}) },
  });

  it("rejects animate with no count, which the enhancer would throw on", () => {
    expect(messageFor(stat({ animate: true }), "missing-implied")).toContain("count");
    expect(rules(stat({ animate: true, count: 1204 }))).not.toContain("missing-implied");
  });

  it("does not treat animate: false as on", () => {
    expect(rules(stat({ animate: false }))).not.toContain("missing-implied");
  });

  it("rejects a trend with no change text to paint", () => {
    expect(rules(stat({ trend: "up" }))).toContain("missing-implied");
    expect(rules(stat({ trend: "up" }, "+12%"))).not.toContain("missing-implied");
  });

  it("writes the neutral trend React always wrote", () => {
    expect(emitMarkup(stat({}, "0%"))).toContain('data-trend="neutral"');
  });
});

describe("split-button: the two halves are welded, not left to memory", () => {
  const action = (options: Readonly<Record<string, string | boolean>>): UsageTree => ({
    contract: "button",
    signature: "Button.action",
    options,
    children: "Guardar",
  });
  const menu = (options: Readonly<Record<string, string | boolean>>): UsageTree => ({
    contract: "menu",
    signature: "Menu",
    options: { triggerIconOnly: true, triggerLabel: "Más opciones de guardado", ...options },
    slots: { trigger: { contract: "icon", signature: "Icon", options: { name: "chevron-down" } }, items: [{ options: { value: "as" }, slots: { label: "Guardar como" } }] },
  } as UsageTree);
  const split = (a: UsageTree, m: UsageTree): UsageTree => ({
    contract: "split-button",
    signature: "SplitButton",
    options: { label: "Guardar" },
    slots: { action: a, menu: m },
  });

  it("accepts an action welded at its end and a trigger welded at its start", () => {
    expect(rules(split(action({ weldEnd: true }), menu({ triggerWeldStart: true })))).not.toContain("restricted-option-value");
  });

  it("rejects either half left unwelded, which leaves a gap between them", () => {
    expect(rules(split(action({}), menu({ triggerWeldStart: true })))).toContain("restricted-option-value");
    expect(rules(split(action({ weldEnd: true }), menu({})))).toContain("restricted-option-value");
  });
});

describe("slider: a named thumb whose value sits inside its own range", () => {
  const slider = (options: Readonly<Record<string, number | string>>, named = true): UsageTree => ({
    contract: "slider",
    signature: "Slider",
    options,
    ...(named ? { attrs: { "aria-label": "Volumen" } } : {}),
  });
  const range = (options: Readonly<Record<string, number | string>>): UsageTree => ({
    contract: "slider",
    signature: "SliderRange",
    options: { lowLabel: "Mínimo", highLabel: "Máximo", ...options },
  });

  it("requires a name", () => {
    expect(rules(slider({ value: 10 }, false))).toContain("missing-accessible-name");
  });

  it("keeps value inside min and max, the defaults counting when omitted", () => {
    expect(rules(slider({ value: 60 }))).not.toContain("out-of-range");
    expect(messageFor(slider({ value: 120 }), "out-of-range")).toContain('above "max" (100)');
    expect(rules(slider({ value: 5, min: 10, max: 20 }))).toContain("out-of-range");
  });

  it("keeps a range's low end at most its high end", () => {
    expect(rules(range({ lowValue: 20, highValue: 80 }))).not.toContain("out-of-range");
    expect(rules(range({ lowValue: 90, highValue: 30 }))).toContain("out-of-range");
  });

  it("requires both thumb labels on SliderRange", () => {
    expect(rules({ contract: "slider", signature: "SliderRange" })).toContain("missing-required");
    expect(
      rules({
        contract: "slider",
        signature: "SliderRange",
        options: { lowLabel: "Mínimo" },
      }),
    ).toContain("missing-required");
    expect(validateUsageTree(range({})).valid).toBe(true);
  });

  it("emits mount anatomy for Slider and SliderRange", () => {
    const single = emitMarkup(slider({ value: 20, min: 0, max: 100, name: "vol" }));
    expect(single).toContain("data-sk-slider");
    expect(single).toContain("data-sk-slider-control");
    expect(single).toContain("data-sk-slider-thumb");
    expect(single).toContain('data-value="20"');
    expect(single).toContain('data-name="vol"');

    const dual = emitMarkup(range({ lowValue: 20, highValue: 80 }));
    expect(dual).toContain("data-sk-slider-range");
    expect(dual).toContain("data-sk-slider-range-low");
    expect(dual).toContain("data-sk-slider-range-high");
    expect(dual).toContain('aria-label="Mínimo"');
    expect(dual).toContain('aria-label="Máximo"');
  });

  it("publishes valueChange, mounts, and its own eight hooks", () => {
    const contract = getContract("slider")!;
    expect(contract.events).toEqual({ valueChange: "sk:slidervaluechange" });
    expect(contract.signatures.Slider.mount).toBe("data-sk-slider");
    expect(contract.signatures.SliderRange.mount).toBe("data-sk-slider-range");
    expect(contract.hooks).toHaveLength(8);
    expect(contract.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(slider({ value: 10 }));
    expect(sheets).toEqual(["@skryensya/core/components/slider.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("skip-link: in-page jump past repeated chrome", () => {
  const link = (overrides: Partial<UsageTree> = {}): UsageTree =>
    ({
      contract: "skip-link",
      signature: "SkipLink",
      options: { href: "#main" },
      children: "Ir al contenido",
      ...overrides,
    }) as UsageTree;

  it("requires href and text children", () => {
    expect(rules({ contract: "skip-link", signature: "SkipLink" })).toContain("missing-required");
    expect(rules({ contract: "skip-link", signature: "SkipLink", options: { href: "#main" } })).toContain(
      "missing-required-slot",
    );
    expect(validateUsageTree(link()).valid).toBe(true);
  });

  it("rejects a destination that is not an in-page id", () => {
    expect(rules(link({ options: { href: "/docs" } }))).toContain("invalid-option-value");
    expect(messageFor(link({ options: { href: "main" } }), "invalid-option-value")).toContain("#main-nav");
    expect(rules(link({ options: { href: "#" } }))).toContain("invalid-option-value");
  });

  it("rejects a nested signature in the label", () => {
    expect(
      rules(
        link({
          children: { contract: "icon", signature: "Icon", options: { name: "arrow-down" } },
        }),
      ),
    ).toContain("slot-accepts");
  });

  it("emits an anchor with the part class and interactive paint", () => {
    const markup = emitMarkup(link());
    expect(markup).toContain("<a");
    expect(markup).toContain('href="#main"');
    expect(markup).toContain("sk-skip-link");
    expect(markup).toContain("sk-interactive");
    expect(markup).toContain("Ir al contenido");
  });

  it("publishes twelve hooks and no mount or events", () => {
    const contract = getContract("skip-link")!;
    expect(contract.hooks).toHaveLength(12);
    expect(contract.events).toBeUndefined();
    expect(contract.signatures.SkipLink.mount).toBeUndefined();
    expect(contract.hookSheets ?? []).toEqual([]);
    const { sheets, unplaced } = sheetsForTree(link());
    expect(sheets).toEqual(["@skryensya/core/components/skip-link.css"]);
    expect(unplaced).toEqual([]);
  });
});

describe("an accessible name is never an empty string", () => {
  it("rejects an optional label given as empty, which would still flip the named branch", () => {
    const tree: UsageTree = { contract: "loader", signature: "Loader", options: { label: "" } };
    expect(messageFor(tree, "invalid-option-value")).toContain("cannot be empty");
  });

  it("leaves the label out entirely alone", () => {
    expect(validateUsageTree({ contract: "loader", signature: "Loader" }).valid).toBe(true);
  });
});

describe("generic rules: groups, pairs, counts, positions, conditions, vocabularies", () => {
  const button: UsageTree = { contract: "button", signature: "Button.action", children: "Ajustes" };
  const dot: UsageTree = { contract: "badge", signature: "BadgeDot", options: { label: "Nuevo", tone: "accent" } };

  it("groupCardinality: a badge holder needs exactly one anchor and one badge", () => {
    const holder = (children: UsageTree[]): UsageTree => ({ contract: "badge", signature: "BadgeHolder", children });
    expect(rules(holder([button, dot]))).not.toContain("wrong-cardinality");
    expect(rules(holder([button]))).toContain("wrong-cardinality");
    expect(rules(holder([button, { contract: "avatar", signature: "Avatar.initials", options: { name: "Ana" }, children: "AS" }, dot]))).toContain(
      "wrong-cardinality",
    );
  });

  it("countWhere: at most one current step, and none is fine", () => {
    const step = (status: string) => ({ options: { status }, slots: { marker: "1", label: status } });
    const steps = (items: ReturnType<typeof step>[]): UsageTree => ({ contract: "steps", signature: "Steps", slots: { items } }) as UsageTree;
    expect(rules(steps([step("complete"), step("complete")]))).not.toContain("wrong-cardinality");
    expect(rules(steps([step("current"), step("current")]))).toContain("wrong-cardinality");
  });

  it("positions: feed articles agree on the set size and never share a position", () => {
    const article = (posInset: number, setSize: number): UsageTree => ({
      contract: "feed",
      signature: "FeedArticle",
      options: { posInset, setSize },
      children: "Hola",
    });
    const feed = (children: UsageTree[]): UsageTree => ({ contract: "feed", signature: "Feed", options: { label: "Actividad" }, children });
    expect(rules(feed([article(1, 2), article(2, 2)]))).not.toContain("invalid-hierarchy");
    expect(rules(feed([article(1, 2), article(1, 3)]))).toContain("invalid-hierarchy");
    expect(rules(feed([article(1, -1), article(2, -1)]))).not.toContain("invalid-hierarchy");
  });

  it("implies from a slot, and excludes keyed on a value (defaults counting)", () => {
    const qr: UsageTree = {
      contract: "qr-code",
      signature: "QRCode",
      options: { value: "https://ejemplo.cl", label: "Ir al sitio" },
      slots: { logo: { contract: "icon", signature: "Icon", options: { name: "info" } } },
    };
    expect(rules(qr)).toContain("missing-implied");
    const fade: UsageTree = { contract: "fade-edge", signature: "FadeEdge", options: { color: "red" }, children: "x" };
    expect(rules(fade)).toContain("excluded-option");
    expect(rules({ ...fade, options: { mode: "color", color: "red" } })).not.toContain("excluded-option");
  });

  it("valuesFrom: a forwarded Button look only takes Button's own words", () => {
    const menu = (options: Readonly<Record<string, string>>): UsageTree =>
      ({
        contract: "menu",
        signature: "Menu",
        options: { label: "Más", ...options },
        slots: { trigger: "Más", items: [{ options: { value: "a" }, slots: { label: "A" } }] },
      }) as UsageTree;
    expect(messageFor(menu({ triggerVariant: "accent" }), "invalid-option-value")).toContain("solid, soft, ghost, translucent");
    expect(rules(menu({ triggerVariant: "soft", triggerTone: "danger", triggerSize: "sm" }))).not.toContain("invalid-option-value");
  });

  it("pairs: a split button's halves share variant, tone and size", () => {
    const split = (action: Readonly<Record<string, string | boolean>>, trigger: Readonly<Record<string, string | boolean>>): UsageTree =>
      ({
        contract: "split-button",
        signature: "SplitButton",
        options: { label: "Guardar" },
        slots: {
          action: { contract: "button", signature: "Button.action", options: { weldEnd: true, ...action }, children: "Guardar" },
          menu: {
            contract: "menu",
            signature: "Menu",
            options: { label: "Más", triggerLabel: "Más", triggerIconOnly: true, triggerWeldStart: true, ...trigger },
            slots: { trigger: { contract: "icon", signature: "Icon", options: { name: "chevron-down" } }, items: [{ options: { value: "a" }, slots: { label: "A" } }] },
          },
        },
      }) as UsageTree;
    expect(rules(split({}, {}))).not.toContain("unpaired-options");
    expect(rules(split({ tone: "danger" }, { triggerTone: "danger" }))).not.toContain("unpaired-options");
    expect(rules(split({ tone: "danger" }, {}))).toContain("unpaired-options");
  });

  it("minItems and item requires", () => {
    const faces = (items: unknown[]): UsageTree =>
      ({ contract: "state-button", signature: "StateButton", attrs: { "aria-label": "Copiar" }, slots: { faces: items } }) as UsageTree;
    expect(rules(faces([{ options: { name: "idle", icon: "copy" }, slots: {} }]))).toContain("wrong-cardinality");
    expect(rules(faces([{ options: { name: "idle", icon: "copy" }, slots: {} }, { options: { name: "done" }, slots: {} }]))).toContain(
      "missing-required",
    );
  });

  it("a table is named by its caption, or by aria-label", () => {
    const body: UsageTree = {
      contract: "table",
      signature: "TableBody",
      children: { contract: "table", signature: "TableRow", children: { contract: "table", signature: "TableCell", children: "1" } },
    };
    expect(rules({ contract: "table", signature: "Table", children: [body] })).toContain("missing-accessible-name");
    expect(
      rules({ contract: "table", signature: "Table", children: [{ contract: "table", signature: "TableCaption", children: "Totales" }, body] }),
    ).not.toContain("missing-accessible-name");
  });

  it("blank text in a required slot is an advisory, and a null child is reported instead of crashing", () => {
    const blank = validateUsageTree({ contract: "typography", signature: "Text", children: "  " });
    expect(blank.valid).toBe(true);
    expect(blank.problems.map((p) => p.rule)).toContain("blank-required-slot");
    const nulled = { contract: "layout", signature: "Stack", children: [null, { contract: "typography", signature: "Text", children: "x" }] } as unknown as UsageTree;
    expect(rules(nulled)).toContain("invalid-child");
  });
});

describe("attributes an option already writes", () => {
  it("rejects a raw type on a Button and accepts the option, which a dialog's submit needs", () => {
    const raw: UsageTree = { contract: "button", signature: "Button.action", attrs: { type: "submit" }, children: "Enviar" };
    expect(messageFor(raw, "shadowed-attr")).toContain("options.type");
    const option: UsageTree = { contract: "button", signature: "Button.action", options: { type: "submit" }, children: "Enviar" };
    expect(validateUsageTree(option).valid).toBe(true);
    expect(emitMarkup(option).match(/type=/g)).toHaveLength(1);
  });

  it("drops the controlled checked from Checkbox in favour of defaultChecked", () => {
    const tree: UsageTree = { contract: "checkbox", signature: "Checkbox", options: { checked: true }, children: "Acepto" };
    expect(rules(tree)).toContain("unknown-option");
    expect(Object.values(getContract("checkbox")!.parts).every((part) => part.startsWith("sk-checkbox"))).toBe(true);
    expect(getContract("checkbox")!.hooks?.every((hook) => hook.startsWith("--sk-checkbox-"))).toBe(true);
  });
});

describe("schema 2.3: what the manifest derives and publishes", () => {
  it("gives every contract a category from the eight job groups", () => {
    const allowed = new Set(["actions", "forms", "navigation", "overlays", "feedback", "data", "content", "layout"]);
    const missing = contractIds().filter((id) => !allowed.has(getContract(id)!.category ?? ""));
    expect(missing).toEqual([]);
  });

  it("derives bindings: React export, enhancer mount or none, portals", () => {
    const bindings = bindingsOf(getContract("vaul")!);
    expect(bindings.Vaul).toEqual({ markup: true, react: "@skryensya/react/vaul#Vaul", enhancer: "data-sk-vaul", portals: false });
    expect(bindings["Vaul.Close"]?.enhancer).toBeNull();
  });

  it("resolves every published hook to a default and a declaring sheet, flagging output hooks", () => {
    const unresolved: string[] = [];
    for (const id of contractIds()) {
      for (const [hook, detail] of Object.entries(hookDetailsOf(getContract(id)!))) if (detail.default === null) unresolved.push(`${id} ${hook}`);
    }
    expect(unresolved).toEqual([]);
    expect(hookDetailsOf(getContract("vaul")!)["--sk-vaul-drag-offset"]?.output).toBe(true);
  });

  it("documents every constraint operator the contracts use", () => {
    for (const key of ["implies", "excludes", "pairs", "between", "keyOf", "refersTo", "valuesFrom", "pattern", "list", "element", "notInside"])
      expect(vocabulary, key).toHaveProperty(key);
    for (const key of ["groupCardinality", "minItems", "maxItems", "countWhere", "positions", "flatHierarchy", "restrictOptions"])
      expect(vocabulary.slotRules, key).toHaveProperty(key);
    for (const key of ["name", "detail", "direction", "reactProp", "reactDetail", "source", "trigger"])
      expect(vocabulary.events, key).toHaveProperty(key);
    expect(vocabulary).toHaveProperty("optionAttrs");
    expect(vocabulary).toHaveProperty("childAttrs");
    expect(vocabulary).toHaveProperty("forward");
    expect(vocabulary).toHaveProperty("compose");
    expect(vocabulary).toHaveProperty("systemOwned");
    expect(vocabulary).toHaveProperty("hitTesting");
    expect(vocabulary).toHaveProperty("portals");
    expect(vocabulary).toHaveProperty("contractSurface");
  });
});

describe("forward: host attr allowlists", () => {
  it("publishes Button, Input, StateButton, Select, ListItemButton, Tag, Checkbox, Switch, RadioGroup, and form peers", () => {
    expect(getContract("button")!.signatures["Button.action"].forward).toContain("name");
    expect(getContract("button")!.signatures["Button.action"].forward).toContain("form");
    expect(getContract("button")!.signatures["Button.navigation"].forward).toContain("target");
    expect(getContract("input")!.signatures.Input.forward).toContain("readonly");
    expect(getContract("input")!.signatures.Input.forward).toContain("value");
    expect(getContract("state-button")!.signatures.StateButton.forward).toContain("data-variant");
    expect(getContract("state-button")!.signatures.StateButton.forward).toContain("data-size");
    expect(getContract("select")!.signatures["Select.native"].forward).toContain("form");
    expect(getContract("select")!.signatures["Select.native"].forward).toContain("autocomplete");
    expect(getContract("select")!.signatures.Select.forward).toContain("id");
    expect(getContract("list")!.signatures.ListItemButton.forward).toContain("name");
    expect(getContract("tag")!.signatures.Tag.forward).toContain("id");
    expect(getContract("tag")!.signatures["Tag.link"].forward).toContain("target");
    expect(getContract("checkbox")!.signatures.Checkbox.forward).toContain("form");
    expect(getContract("switch")!.signatures.Switch.forward).toContain("form");
    expect(getContract("radio-group")!.signatures.RadioGroup.forward).toContain("id");
    expect(getContract("number-field")!.signatures.NumberField.forward).toContain("aria-*");
    expect(getContract("file-upload")!.signatures.FileUpload.forward).toContain("id");
    expect(getContract("slider")!.signatures.Slider.forward).toContain("aria-*");
  });

  it("publishes catalogue interactive and form-host forward coverage", () => {
    expect(getContract("back-to-top")!.signatures.BackToTop.forward).toEqual(
      expect.arrayContaining(["id", "aria-*"]),
    );
    expect(getContract("list")!.signatures.ListItemLink.forward).toContain("target");
    expect(getContract("nav-list")!.signatures.NavListLink.forward).toContain("rel");
    expect(getContract("folder")!.signatures.FolderLink.forward).toContain("download");
    expect(getContract("skip-link")!.signatures.SkipLink.forward).toContain("id");
    expect(getContract("sidebar")!.signatures.SidebarTrigger.forward).toContain("id");
    expect(getContract("tile")!.signatures.TileButton.forward).toContain("form");
    expect(getContract("tile")!.signatures.TileLink.forward).toContain("target");
    expect(getContract("tile")!.signatures.TileCheckbox.forward).toContain("form");
    expect(getContract("tile")!.signatures.ExpandableTileTrigger.forward).toContain("aria-*");
    expect(getContract("accordion")!.signatures["Details.Summary"].forward).toContain("id");
    expect(getContract("typography")!.signatures.Link.forward).toContain("download");
    expect(getContract("vaul")!.signatures["Vaul.Trigger"].forward).toContain("name");
    expect(getContract("vaul")!.signatures["Vaul.Close"].forward).toContain("form");
    expect(getContract("vaul")!.signatures.Vaul.forward).toEqual(["aria-*"]);
    expect(getContract("combobox")!.signatures.Combobox.forward).toContain("autocomplete");
    expect(getContract("tabs")!.signatures.Tabs.forward).toContain("id");
    expect(getContract("dialog")!.signatures.Dialog.forward).toContain("aria-*");
    expect(getContract("popover")!.signatures.Popover.forward).toEqual(["aria-*"]);
    expect(getContract("popover")!.signatures.Popover.portals).toBeUndefined();
    expect(getContract("command-palette")!.signatures.CommandPalette.forward).toEqual(["aria-*"]);
    expect(getContract("segmented")!.signatures.Segmented.forward).toContain("id");
    expect(getContract("checkbox")!.signatures.CheckboxGroup.forward).toContain("form");
    expect(getContract("data-grid")!.signatures.DataGridCell.forward).toContain("aria-*");
    expect(getContract("treegrid")!.signatures.TreegridCell.forward).toContain("id");
    expect(getContract("meter")!.signatures.Meter.forward).toContain("id");
    expect(getContract("progress")!.signatures.Progress.forward).toContain("aria-*");
    expect(getContract("toolbar")!.signatures.Toolbar.forward).toContain("id");
  });

  it("rejects an attr outside the allowlist", () => {
    const tree: UsageTree = {
      contract: "button",
      signature: "Button.action",
      attrs: { title: "nope" },
      children: "Save",
    };
    expect(rules(tree)).toContain("unknown-attr");
  });

  it("leaves the author's own data-* alone, and keeps data-sk-* for the kit", () => {
    const withHook = (attr: string): UsageTree => ({
      contract: "button",
      signature: "Button.action",
      attrs: { [attr]: "" },
      children: "Save",
    });

    /* A demo finding its own button from a script: `data-` is the author's namespace, not ours. */
    expect(rules(withHook("data-emit-toast"))).not.toContain("unknown-attr");
    /* Inside our prefix, an undeclared hook is a typo against an enhancer that never answers. */
    expect(rules(withHook("data-sk-vaul-clsoe"))).toContain("unknown-attr");
    /* Declared by Vaul's `authoredAttrs`, and therefore writable on a host Vaul does not own. */
    expect(rules(withHook("data-sk-vaul-close"))).not.toContain("unknown-attr");
  });

  it("publishes the cross-family hooks a tree is allowed to author", () => {
    expect(getContract("vaul")!.authoredAttrs).toEqual(["data-sk-vaul-close"]);
    expect(getContract("megamenu")!.authoredAttrs).toEqual([
      "data-sk-megamenu-preview",
      "data-sk-megamenu-preview-alt",
    ]);
    /* `value` travels with `name`; `autofocus` is the platform's on any focusable host. */
    expect(getContract("button")!.signatures["Button.action"]!.forward).toContain("value");
    expect(getContract("button")!.signatures["Button.action"]!.forward).toContain("autofocus");
  });

  it("accepts StateButton Button look attrs and rejects unknowns", () => {
    expect(
      validateUsageTree({
        contract: "state-button",
        signature: "StateButton",
        attrs: { "aria-label": "Copy", "data-variant": "ghost", "data-size": "sm" },
        slots: {
          faces: [
            { options: { name: "idle", icon: "copy" }, slots: {} },
            { options: { name: "done", icon: "check" }, slots: {} },
          ],
        },
      } as UsageTree).valid,
    ).toBe(true);
    expect(
      rules({
        contract: "state-button",
        signature: "StateButton",
        attrs: { "aria-label": "Copy", title: "nope" },
        slots: {
          faces: [
            { options: { name: "idle", icon: "copy" }, slots: {} },
            { options: { name: "done", icon: "check" }, slots: {} },
          ],
        },
      } as UsageTree),
    ).toContain("unknown-attr");
  });

  it("accepts a forwarded attr and aria-* prefix", () => {
    expect(
      validateUsageTree({
        contract: "button",
        signature: "Button.action",
        attrs: { name: "save", form: "checkout", "aria-label": "Save draft" },
        children: "Save",
      }).valid,
    ).toBe(true);
    expect(
      validateUsageTree({
        contract: "button",
        signature: "Button.navigation",
        options: { href: "/docs" },
        attrs: { target: "_blank", rel: "noopener" },
        children: "Docs",
      }).valid,
    ).toBe(true);
  });

  it("keeps class and style free even when forward is set", () => {
    expect(
      validateUsageTree({
        contract: "input",
        signature: "NativeInput",
        options: { type: "text", name: "q" },
        attrs: { class: "search", style: "inline-size: 12rem", readonly: "" },
      }).valid,
    ).toBe(true);
  });

  it("never lists a forwarded name that an option already writes", () => {
    const collisions: string[] = [];
    for (const id of contractIds()) {
      const contract = getContract(id)!;
      for (const [sigName, signature] of Object.entries(contract.signatures)) {
        const owned = new Set(
          signature.options.map((name) => contract.options[name]?.attr).filter(Boolean),
        );
        for (const entry of signature.forward ?? []) {
          if (entry.endsWith("*")) continue;
          if (owned.has(entry)) collisions.push(`${id}.${sigName}: forward "${entry}" shadows an option attr`);
        }
      }
    }
    expect(collisions).toEqual([]);
  });
});

describe("compose / systemOwned", () => {
  it("publishes Dialog, Breadcrumb, and Details compose targets", () => {
    expect(getContract("dialog")!.signatures.Dialog.compose?.map((c) => c.of)).toEqual(
      expect.arrayContaining(["button", "icon"]),
    );
    expect(getContract("breadcrumb")!.signatures.Breadcrumb.compose?.[0]).toMatchObject({
      of: "menu",
      systemOwned: true,
    });
    expect(getContract("accordion")!.signatures["Details.Summary"].compose).toEqual([
      { of: "icon", systemOwned: true },
    ]);
    expect(getContract("tag")!.signatures.Tag.compose?.map((c) => c.of)).toEqual(
      expect.arrayContaining(["button", "icon"]),
    );
  });

  it("publishes catalogue compose coverage beyond the seed families", () => {
    expect(getContract("back-to-top")!.signatures.BackToTop.compose).toEqual([
      { of: "icon", systemOwned: true },
    ]);
    expect(getContract("avatar")!.signatures["Avatar.image"].compose?.[0]).toMatchObject({
      of: "image-frame",
      systemOwned: true,
    });
    expect(getContract("folder")!.signatures.Folder.hitTesting).toEqual({
      childrenNone: ["FolderPreview"],
    });
    expect(getContract("loader")!.systemOwned).toEqual(["tick"]);
    expect(getContract("color-picker")!.systemOwned).toEqual(
      expect.arrayContaining(["area", "hueSlider", "eyedropper"]),
    );
  });

  it("publishes Calendar and Carousel systemOwned parts", () => {
    expect(getContract("calendar")!.systemOwned).toEqual(
      expect.arrayContaining(["header", "cell", "monthGrid"]),
    );
    expect(getContract("carousel")!.systemOwned).toEqual(
      expect.arrayContaining(["controls", "dots", "dot"]),
    );
  });

  it("passes the catalogue compose / systemOwned gate", () => {
    expect(checkCompose()).toEqual([]);
  });
});

describe("layout childAttrs: LayoutGrid span vocabulary", () => {
  it("publishes data-width values on the children slot", () => {
    const width = getContract("layout")!.signatures.LayoutGrid.slots.children.childAttrs?.width;
    expect(width?.attr).toBe("data-width");
    expect(width?.values).toEqual(["narrow", "content", "breakout", "full-width", "rail", "rail-start"]);
  });

  it("accepts data-width on a direct child via attrs", () => {
    const tree: UsageTree = {
      contract: "layout",
      signature: "LayoutGrid",
      children: {
        contract: "typography",
        signature: "Heading",
        attrs: { "data-width": "breakout" },
        children: "Title",
      },
    };
    expect(validateUsageTree(tree).valid).toBe(true);
  });

  it("rejects an unknown data-width value", () => {
    const tree: UsageTree = {
      contract: "layout",
      signature: "LayoutGrid",
      children: {
        contract: "typography",
        signature: "Heading",
        attrs: { "data-width": "wide" },
        children: "Title",
      },
    };
    expect(rules(tree)).toContain("invalid-attr-value");
  });
});

describe("hitTesting: pointer hit-testing traits", () => {
  it("publishes BadgeHolder's anchored-badge pass-through", () => {
    expect(getContract("badge")!.signatures.BadgeHolder.hitTesting).toEqual({
      childrenNone: ["Badge", "BadgeDot"],
    });
  });

  it("points every childrenNone name at a signature allowed in a slot of that host", () => {
    const broken: string[] = [];
    for (const id of contractIds()) {
      const contract = getContract(id)!;
      for (const [sigName, signature] of Object.entries(contract.signatures)) {
        const allowed = new Set(
          Object.values(signature.slots).flatMap((slot) => slot.of ?? []),
        );
        for (const entry of signature.compose ?? []) {
          const composed = getContract(entry.of);
          if (composed) for (const name of Object.keys(composed.signatures)) allowed.add(name);
        }
        for (const name of signature.hitTesting?.childrenNone ?? []) {
          if (!allowed.has(name)) broken.push(`${id}.${sigName}: childrenNone "${name}" is not in any slot.of or compose.of`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
});

describe("events publish what they carry", () => {
  it("declares a detail shape for every published event", () => {
    const missing: string[] = [];
    for (const id of contractIds()) {
      const contract = getContract(id)!;
      for (const key of Object.keys(contract.events ?? {})) if (!contract.eventDetails?.[key]) missing.push(`${id}.${key}`);
      for (const key of Object.keys(contract.eventDetails ?? {})) if (!contract.events?.[key]) missing.push(`${id}.${key} (detail with no event)`);
    }
    expect(missing).toEqual([]);
  });

  it("says which way a command event travels", () => {
    expect(getContract("carousel")!.eventDetails?.goto?.direction).toBe("in");
    expect(getContract("carousel")!.eventDetails?.change?.direction).toBeUndefined();
  });

  it("names the React prop (or marks DOM-only) for every outbound event", () => {
    const missing: string[] = [];
    for (const id of contractIds()) {
      /* Questionnaire second-pass leftovers are deferred; do not gate its reactProp yet. */
      if (id === "questionnaire") continue;
      const contract = getContract(id)!;
      for (const [key, detail] of Object.entries(contract.eventDetails ?? {})) {
        if (detail.direction === "in") continue;
        if (detail.reactProp === undefined) missing.push(`${id}.${key}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("records when React takes a bare argument instead of the detail object", () => {
    expect(getContract("segmented")!.eventDetails?.valueChange?.reactProp).toBe("onValueChange");
    expect(getContract("segmented")!.eventDetails?.valueChange?.reactDetail).toBe("string");
    expect(getContract("pagination")!.eventDetails?.pageChange?.reactDetail).toBe("number");
    expect(getContract("carousel")!.eventDetails?.change?.reactProp).toBe(false);
  });

  it("names the source part (and trigger when clear) for every event", () => {
    const missingSource: string[] = [];
    const badPart: string[] = [];
    for (const id of contractIds()) {
      if (id === "questionnaire") continue;
      const contract = getContract(id)!;
      const parts = new Set(Object.keys(contract.parts));
      for (const [key, detail] of Object.entries(contract.eventDetails ?? {})) {
        if (!detail.source) missingSource.push(`${id}.${key}`);
        else if (!parts.has(detail.source)) badPart.push(`${id}.${key}.source=${detail.source}`);
        if (detail.trigger && !parts.has(detail.trigger)) badPart.push(`${id}.${key}.trigger=${detail.trigger}`);
      }
    }
    expect(missingSource).toEqual([]);
    expect(badPart).toEqual([]);
  });

  it("wires major families: tabs trigger, tag remove, tooltip open, menu select", () => {
    expect(getContract("tabs")!.eventDetails?.valueChange).toMatchObject({ source: "root", trigger: "trigger" });
    expect(getContract("tag")!.eventDetails?.remove).toMatchObject({ source: "root", trigger: "remove" });
    expect(getContract("tooltip")!.eventDetails?.openChange).toMatchObject({ source: "root", trigger: "trigger" });
    expect(getContract("menu")!.eventDetails?.select).toMatchObject({ source: "root", trigger: "item" });
    expect(getContract("carousel")!.eventDetails?.goto).toMatchObject({ source: "root", direction: "in" });
    expect(getContract("carousel")!.eventDetails?.goto?.trigger).toBeUndefined();
  });
});

describe("portals: container scoping", () => {
  it("publishes container on React-portalled overlays that take a container ref", () => {
    expect(getContract("tooltip")!.signatures.Tooltip.portals).toEqual({ container: true });
    expect(getContract("combobox")!.signatures.Combobox.portals).toEqual({ container: true });
    expect(getContract("color-picker")!.signatures.ColorPicker.portals).toEqual({ container: true });
    expect(getContract("date-picker")!.signatures.DatePicker.portals).toEqual({ container: true });
    expect(getContract("select")!.signatures.Select.portals).toEqual({ container: true });
    expect(getContract("menu")!.signatures.Menu.portals).toEqual({ container: true });
  });

  it("keeps Popover on native popover (no portals declaration; container prop unused)", () => {
    expect(getContract("popover")!.signatures.Popover.portals).toBeUndefined();
    expect(getContract("popover")!.signatures["Popover.bare"].portals).toBeUndefined();
  });
});
