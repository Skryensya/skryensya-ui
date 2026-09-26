import type { UsageTree } from "@skryensya/core/usage-tree";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { loadTree, renderTree } from "./render-tree.js";

describe("renderTree", () => {
  it("hands an unwrapped collection to React as bare values, not entry objects", async () => {
    // Tags input declares `unwrap: "label"`: its `defaultValue` is `string[]`, and an entry object
    // there threw "Objects are not valid as a React child" and took every browser gate down with it.
    const tree: UsageTree = {
      contract: "tags-input",
      signature: "TagsInput",
      options: { label: "Temas" },
      slots: { items: [{ slots: { label: "react" } }, { slots: { label: "svelte" } }] },
    };
    await loadTree(tree);
    const ui = render(<>{renderTree(tree)}</>);
    expect(ui.getByText("react")).toBeTruthy();
    expect(ui.getByText("svelte")).toBeTruthy();
  });

  it("refuses to render a family loadTree has not loaded, and says what to do", () => {
    const tree: UsageTree = { contract: "kbd", signature: "Kbd", children: "K" };
    expect(() => renderTree(tree)).toThrow(/await loadTree\(tree\)/);
  });

  it("loads the families of trees nested inside other trees' slots", async () => {
    // Badge lives only in a slot of the Callout; the walk has to reach it, or render throws.
    const tree: UsageTree = {
      contract: "callout",
      signature: "Callout",
      slots: {
        children: [{ contract: "badge", signature: "Badge", children: "New" }],
      },
    };
    await loadTree(tree);
    const ui = render(<>{renderTree(tree)}</>);
    expect(ui.container.querySelector(".sk-badge")?.textContent).toBe("New");
  });
});
