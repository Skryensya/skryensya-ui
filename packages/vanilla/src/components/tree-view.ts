import { treeView } from "@skryensya/core/machines";
import type { TreeNode } from "@skryensya/core/tree-view";
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla";
import {
  applyZagProps,
  bindZagEvents,
  type DomProps,
} from "../runtime/apply.js";
import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

const selector = {
  root: "[data-sk-tree-view]",
  tree: "[data-sk-tree-view-tree]",
  branch: "[data-sk-tree-view-branch]",
  branchControl: "[data-sk-tree-view-branch-control]",
  branchText: "[data-sk-tree-view-branch-text]",
  branchIndicator: "[data-sk-tree-view-branch-indicator]",
  branchContent: "[data-sk-tree-view-branch-content]",
  item: "[data-sk-tree-view-item]",
  itemText: "[data-sk-tree-view-item-text]",
} as const;
type AuthoredNode = {
  node: TreeNode;
  element: HTMLElement;
  control?: HTMLElement;
  text?: HTMLElement;
  indicator?: HTMLElement;
  content?: HTMLElement;
  children: AuthoredNode[];
  indexPath: number[];
};
const direct = <T extends Element>(root: Element, query: string): T | null =>
  (Array.from(root.children).find((child) => child.matches(query)) as
    | T
    | undefined) ?? null;
const emit = <T>(root: HTMLElement, name: string, detail: T) =>
  root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

/** `data-expanded-value="src docs"` o `"src, docs"`: ambos separadores se aceptan. */
const values = (raw: string | undefined): string[] | undefined =>
  raw?.split(/[\s,]+/).filter(Boolean);

function readNodes(parent: HTMLElement, path: number[] = []): AuthoredNode[] {
  const candidates = Array.from(parent.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      (child.matches(selector.branch) || child.matches(selector.item)),
  );
  return candidates.map((element, index) => {
    const branch = element.matches(selector.branch);
    const control = branch
      ? (direct<HTMLElement>(element, selector.branchControl) ?? undefined)
      : undefined;
    const content = branch
      ? (direct<HTMLElement>(element, selector.branchContent) ?? undefined)
      : undefined;
    const text = branch
      ? (control?.querySelector<HTMLElement>(selector.branchText) ?? undefined)
      : (element.querySelector<HTMLElement>(selector.itemText) ?? undefined);
    const id = element.dataset.value ?? `node-${[...path, index].join("-")}`;
    const children = content ? readNodes(content, [...path, index]) : [];
    const node: TreeNode = {
      id,
      label: element.dataset.valueText ?? text?.textContent?.trim() ?? id,
      disabled: element.hasAttribute("disabled"),
      children: children.length
        ? children.map((child) => child.node)
        : undefined,
    };
    return {
      node,
      element,
      control,
      text,
      indicator:
        control?.querySelector<HTMLElement>(selector.branchIndicator) ??
        undefined,
      content,
      children,
      indexPath: [...path, index],
    };
  });
}

function connect(root: HTMLElement): () => void {
  const tree = root.querySelector<HTMLElement>(selector.tree);
  if (!tree) return () => {};
  const authored = readNodes(tree);
  const flat = (nodes: AuthoredNode[]): AuthoredNode[] =>
    nodes.flatMap((node) => [node, ...flat(node.children)]);
  const all = flat(authored);
  const collection = treeView.collection<TreeNode>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.label,
    isNodeDisabled: (node) => Boolean(node.disabled),
    rootNode: {
      id: "__root__",
      label: "",
      children: authored.map((entry) => entry.node),
    },
  });
  const machine = new VanillaMachine(treeView.machine, {
    id: root.id || uniqueId("sk-tree-view"),
    collection,
    selectionMode:
      root.dataset.selectionMode === "multiple" ? "multiple" : "single",
    defaultExpandedValue: values(root.dataset.expandedValue),
    defaultSelectedValue: values(root.dataset.selectedValue),
    translations: { treeLabel: root.getAttribute("aria-label") ?? "Árbol" },
    onSelectionChange(details) {
      emit(root, "sk-selection-change", {
        selectedValue: details.selectedValue,
      });
    },
    onExpandedChange(details) {
      emit(root, "sk-expanded-change", {
        expandedValue: details.expandedValue,
      });
    },
  });
  machine.start();
  type TreeApi = ReturnType<typeof treeView.connect>;
  const getApi = (): TreeApi =>
    treeView.connect(machine.service, normalizeProps);
  const sync = () => {
    // Un solo `connect` por sync: cada llamada arma de nuevo el api completo, así que
    // pedirlo por nodo hacía el patch O(nodos²) en árboles grandes.
    const api = getApi();
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(tree, api.getTreeProps() as DomProps);
    for (const entry of all) {
      const props = { indexPath: entry.indexPath, node: entry.node };
      applyZagProps(
        entry.element,
        entry.children.length
          ? (api.getBranchProps(props) as DomProps)
          : (api.getItemProps(props) as DomProps),
      );
      if (entry.children.length && entry.control && entry.content) {
        applyZagProps(
          entry.control,
          api.getBranchControlProps(props) as DomProps,
        );
        applyZagProps(
          entry.content,
          api.getBranchContentProps(props) as DomProps,
        );
        if (entry.text)
          applyZagProps(entry.text, api.getBranchTextProps(props) as DomProps);
        if (entry.indicator)
          applyZagProps(
            entry.indicator,
            api.getBranchIndicatorProps(props) as DomProps,
          );
      } else if (entry.text)
        applyZagProps(entry.text, api.getItemTextProps(props) as DomProps);
    }
  };
  const cleanups = [
    bindZagEvents(tree, () => getApi().getTreeProps() as DomProps),
    ...all.map((entry) =>
      bindZagEvents(
        entry.children.length && entry.control ? entry.control : entry.element,
        () => {
          const props = { indexPath: entry.indexPath, node: entry.node };
          return entry.children.length
            ? (getApi().getBranchControlProps(props) as DomProps)
            : (getApi().getItemProps(props) as DomProps);
        },
      ),
    ),
  ];
  const unsubscribe = machine.subscribe(sync);
  sync();
  return () => {
    unsubscribe();
    for (const cleanup of cleanups) cleanup();
    machine.stop();
  };
}
export const mountTreeView = createConnectMount({
  key: "tree-view",
  rootSelector: selector.root,
  connect,
});
