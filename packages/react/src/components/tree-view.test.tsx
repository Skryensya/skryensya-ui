import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeView } from "./tree-view.js";
import type { TreeNode } from "@skryensya/core/tree-view";

const nodes: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "src/index.ts", label: "index.ts" },
      { id: "src/app.ts", label: "app.ts" },
    ],
  },
  { id: "README.md", label: "README.md" },
];

const disabledNodes: TreeNode[] = [
  {
    id: "src",
    label: "src",
    disabled: true,
    children: [{ id: "src/index.ts", label: "index.ts" }],
  },
  { id: "README.md", label: "README.md" },
];

const node = (value: string) => document.querySelector<HTMLElement>(`[data-value="${value}"]`)!;
const control = (value: string) => node(value).querySelector<HTMLElement>("button")!;

describe("TreeView (React)", () => {
  it("wires tree semantics onto the rendered nodes", () => {
    render(<TreeView label="Archivos" nodes={nodes} />);

    const tree = document.querySelector("ul[role='tree']")!;
    expect(tree.getAttribute("aria-label")).toBe("Archivos");
    expect(node("src").getAttribute("role")).toBe("treeitem");
    expect(node("README.md").getAttribute("role")).toBe("treeitem");
    expect(node("src").getAttribute("aria-expanded")).toBe("false");
  });

  it("expands a branch from its control and calls onExpandedChange", async () => {
    const onExpandedChange = vi.fn();
    render(<TreeView label="Archivos" nodes={nodes} onExpandedChange={onExpandedChange} />);

    fireEvent.click(control("src"));

    await waitFor(() => expect(node("src").getAttribute("aria-expanded")).toBe("true"));
    expect(onExpandedChange).toHaveBeenCalledWith({ expandedValue: ["src"] });
  });

  it("seeds the open branches from defaultExpandedValue", () => {
    render(<TreeView label="Archivos" nodes={nodes} defaultExpandedValue={["src"]} />);
    expect(node("src").getAttribute("aria-expanded")).toBe("true");
  });

  it("selects a leaf and calls onSelectionChange", async () => {
    const onSelectionChange = vi.fn();
    render(<TreeView label="Archivos" nodes={nodes} onSelectionChange={onSelectionChange} />);

    fireEvent.click(node("README.md"));

    await waitFor(() =>
      expect(onSelectionChange).toHaveBeenCalledWith({ selectedValue: ["README.md"] }),
    );
    expect(node("README.md").getAttribute("aria-selected")).toBe("true");
  });

  it("replaces the selection in single mode", async () => {
    render(
      <TreeView
        label="Archivos"
        nodes={nodes}
        defaultExpandedValue={["src"]}
        defaultSelectedValue={["README.md"]}
      />,
    );
    expect(node("README.md").getAttribute("aria-selected")).toBe("true");

    fireEvent.click(node("src/index.ts"));

    await waitFor(() => expect(node("src/index.ts").getAttribute("aria-selected")).toBe("true"));
    expect(node("README.md").getAttribute("aria-selected")).toBe("false");
  });

  it("extends the selection in multiple mode with the platform's own modifier", async () => {
    render(
      <TreeView
        label="Archivos"
        nodes={nodes}
        selectionMode="multiple"
        defaultExpandedValue={["src"]}
        defaultSelectedValue={["README.md"]}
      />,
    );

    // A plain click still replaces, the way a file browser does; the modifier is what adds.
    fireEvent.click(node("src/index.ts"), { ctrlKey: true });

    await waitFor(() => expect(node("src/index.ts").getAttribute("aria-selected")).toBe("true"));
    expect(node("README.md").getAttribute("aria-selected")).toBe("true");
  });

  it("leaves a disabled node out of the selection", async () => {
    const onSelectionChange = vi.fn();
    render(<TreeView label="Archivos" nodes={disabledNodes} onSelectionChange={onSelectionChange} />);

    expect(node("src").getAttribute("data-disabled")).toBe("");
    fireEvent.click(control("src"));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(node("src").getAttribute("aria-expanded")).toBe("false");
  });
});
