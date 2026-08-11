import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountTreeView } from "./tree-view.js";

/*
 * The authored markup is the same shape `validate_ui` emits (see apps/docs/src/lib/source-tree.ts):
 * branches are `<li>` with a control and a content list, items are leaf `<li>`s. The enhancer scans
 * it and patches Zag's props on top; it never renders structure of its own.
 */
function markup({ root = "", tree = "" } = {}) {
  document.body.innerHTML = `<div class="sk-tree-view" data-sk-tree-view aria-label="Archivos" ${root}>
    <ul class="sk-tree-view__tree" data-sk-tree-view-tree>
      <li class="sk-tree-view__branch" data-sk-tree-view-branch data-value="src" ${tree}>
        <button class="sk-tree-view__branch-control" data-sk-tree-view-branch-control type="button">
          <span class="sk-tree-view__branch-indicator" data-sk-tree-view-branch-indicator aria-hidden="true">›</span>
          <span class="sk-tree-view__branch-text" data-sk-tree-view-branch-text>src</span>
        </button>
        <ul class="sk-tree-view__branch-content" data-sk-tree-view-branch-content>
          <li class="sk-tree-view__item" data-sk-tree-view-item data-value="src/index.ts">
            <span class="sk-tree-view__item-text" data-sk-tree-view-item-text>index.ts</span>
          </li>
          <li class="sk-tree-view__item" data-sk-tree-view-item data-value="src/app.ts">
            <span class="sk-tree-view__item-text" data-sk-tree-view-item-text>app.ts</span>
          </li>
        </ul>
      </li>
      <li class="sk-tree-view__item" data-sk-tree-view-item data-value="README.md">
        <span class="sk-tree-view__item-text" data-sk-tree-view-item-text>README.md</span>
      </li>
    </ul>
  </div>`;
  const element = document.querySelector<HTMLElement>("[data-sk-tree-view]")!;
  expect(mountTreeView(document)).toBe(1);
  return element;
}

const node = (value: string) => document.querySelector<HTMLElement>(`[data-value="${value}"]`)!;
const control = (value: string) =>
  node(value).querySelector<HTMLElement>("[data-sk-tree-view-branch-control]")!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-tree-view]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("TreeView Vanilla contracts", () => {
  it("patches tree semantics onto authored markup and mounts once", () => {
    const root = markup();
    expect(mountTreeView(document)).toBe(0);

    const tree = root.querySelector("[data-sk-tree-view-tree]")!;
    expect(tree.getAttribute("role")).toBe("tree");
    // The root's own `aria-label` becomes the tree's name rather than a second one being invented.
    expect(tree.getAttribute("aria-label")).toBe("Archivos");
    expect(node("src").getAttribute("role")).toBe("treeitem");
    expect(node("README.md").getAttribute("role")).toBe("treeitem");
    expect(node("src").getAttribute("aria-expanded")).toBe("false");
  });

  it("expands a branch from its control and says so", async () => {
    const root = markup();
    const onExpanded = vi.fn();
    root.addEventListener("sk-expanded-change", onExpanded);

    fireEvent.click(control("src"));

    await waitFor(() => expect(node("src").getAttribute("aria-expanded")).toBe("true"));
    expect(onExpanded).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { expandedValue: ["src"] } }),
    );
  });

  it("seeds the open branches from the authored value", () => {
    // Both separators are accepted, so an author can write either one.
    markup({ root: 'data-expanded-value="src, otro"' });
    expect(node("src").getAttribute("aria-expanded")).toBe("true");
  });

  it("selects a leaf and reports the value the composition wrote", async () => {
    const root = markup();
    const onSelection = vi.fn();
    root.addEventListener("sk-selection-change", onSelection);

    fireEvent.click(node("README.md"));

    await waitFor(() =>
      expect(onSelection).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { selectedValue: ["README.md"] } }),
      ),
    );
    expect(node("README.md").getAttribute("aria-selected")).toBe("true");
  });

  it("replaces the selection in single mode", async () => {
    markup({ root: 'data-expanded-value="src" data-selected-value="README.md"' });
    expect(node("README.md").getAttribute("aria-selected")).toBe("true");

    fireEvent.click(node("src/index.ts"));

    await waitFor(() => expect(node("src/index.ts").getAttribute("aria-selected")).toBe("true"));
    expect(node("README.md").getAttribute("aria-selected")).toBe("false");
  });

  it("extends the selection in multiple mode with the platform's own modifier", async () => {
    markup({ root: 'data-selection-mode="multiple" data-expanded-value="src" data-selected-value="README.md"' });

    // A plain click still replaces, the way a file browser does; the modifier is what adds.
    fireEvent.click(node("src/index.ts"), { ctrlKey: true });

    await waitFor(() => expect(node("src/index.ts").getAttribute("aria-selected")).toBe("true"));
    expect(node("README.md").getAttribute("aria-selected")).toBe("true");
  });

  it("leaves a disabled node out of the selection", async () => {
    const root = markup({ tree: "disabled" });
    const onSelection = vi.fn();
    root.addEventListener("sk-selection-change", onSelection);

    expect(node("src").getAttribute("data-disabled")).toBe("");
    fireEvent.click(control("src"));

    await waitFor(() => expect(onSelection).not.toHaveBeenCalled());
    expect(node("src").getAttribute("aria-expanded")).toBe("false");
  });

  it("does nothing without an authored tree to scan", () => {
    document.body.innerHTML = `<div class="sk-tree-view" data-sk-tree-view aria-label="Archivos"></div>`;
    // The mount still runs; it simply has nothing to connect, and must not throw doing it.
    expect(mountTreeView(document)).toBe(1);
  });

  it("stops the machine when the mount is destroyed", async () => {
    const root = markup();
    const onSelection = vi.fn();
    root.addEventListener("sk-selection-change", onSelection);

    destroyMount(root);
    fireEvent.click(node("README.md"));

    await waitFor(() => expect(onSelection).not.toHaveBeenCalled());
  });
});
