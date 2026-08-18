<script lang="ts">
  import { treeView } from "@skryensya/core/machines";
  import type { TreeNode } from "@skryensya/core/tree-view";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TREE VIEW, enhancer machine-backed sobre `@zag-js/tree-view` (la MISMA máquina que usa React,
   * vía `@skryensya/core/machines`). No renderiza estructura: escanea su markup autorado
   * (ramas/hojas anidadas) y parchea los atributos que devuelve `connect` sobre esos nodos.
   */
  const root = getRoot();

  const selector = {
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

  const direct = <T extends Element>(parent: Element, query: string): T | null =>
    (Array.from(parent.children).find((child) => child.matches(query)) as T | undefined) ?? null;

  /** `data-expanded-value="src docs"` o `"src, docs"`: ambos separadores se aceptan. */
  const values = (raw: string | undefined): string[] | undefined => raw?.split(/[\s,]+/).filter(Boolean);

  function readNodes(parent: HTMLElement, path: number[] = []): AuthoredNode[] {
    const candidates = Array.from(parent.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && (child.matches(selector.branch) || child.matches(selector.item)),
    );
    return candidates.map((element, index) => {
      const branch = element.matches(selector.branch);
      const control = branch ? (direct<HTMLElement>(element, selector.branchControl) ?? undefined) : undefined;
      const content = branch ? (direct<HTMLElement>(element, selector.branchContent) ?? undefined) : undefined;
      const text = branch
        ? (control?.querySelector<HTMLElement>(selector.branchText) ?? undefined)
        : (element.querySelector<HTMLElement>(selector.itemText) ?? undefined);
      const id = element.dataset.value ?? `node-${[...path, index].join("-")}`;
      const children = content ? readNodes(content, [...path, index]) : [];
      const node: TreeNode = {
        id,
        label: element.dataset.valueText ?? text?.textContent?.trim() ?? id,
        disabled: element.hasAttribute("disabled"),
        children: children.length ? children.map((child) => child.node) : undefined,
      };
      return {
        node,
        element,
        control,
        text,
        indicator: control?.querySelector<HTMLElement>(selector.branchIndicator) ?? undefined,
        content,
        children,
        indexPath: [...path, index],
      };
    });
  }

  const tree = root.querySelector<HTMLElement>(selector.tree);
  const authored = tree ? readNodes(tree) : [];
  const flat = (nodes: AuthoredNode[]): AuthoredNode[] => nodes.flatMap((node) => [node, ...flat(node.children)]);
  const all = flat(authored);

  // Capturado UNA vez, nunca releído del DOM: `getRootProps().id` devuelve un id namespaced que
  // `applyZagProps` escribe de vuelta sobre `root.id`. Leerlo en vivo desde el factory reactivo de
  // `useMachine` retroalimentaría ese prefijo en cada recomputación.
  const machineId = root.id || uniqueId("sk-tree-view");

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

  const service = useMachine(treeView.machine, () => ({
    id: machineId,
    collection,
    selectionMode: (root.dataset.selectionMode === "multiple" ? "multiple" : "single") as "single" | "multiple",
    defaultExpandedValue: values(root.dataset.expandedValue),
    defaultSelectedValue: values(root.dataset.selectedValue),
    translations: { treeLabel: root.getAttribute("aria-label") ?? "Árbol" },
    onSelectionChange(details: { selectedValue: string[] }) {
      root.dispatchEvent(
        new CustomEvent("sk-selection-change", { bubbles: true, detail: { selectedValue: details.selectedValue } }),
      );
    },
    onExpandedChange(details: { expandedValue: string[] }) {
      root.dispatchEvent(
        new CustomEvent("sk-expanded-change", { bubbles: true, detail: { expandedValue: details.expandedValue } }),
      );
    },
  }));

  const api = $derived(treeView.connect(service, normalizeProps));

  // Un solo `connect` por effect: cada llamada arma de nuevo el api completo, así que pedirlo por
  // nodo haría el patch O(nodos²) en árboles grandes.
  $effect(() => {
    if (!tree) return;
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(tree, api.getTreeProps() as DomProps);
    for (const entry of all) {
      const props = { indexPath: entry.indexPath, node: entry.node };
      applyZagProps(
        entry.element,
        entry.children.length ? (api.getBranchProps(props) as DomProps) : (api.getItemProps(props) as DomProps),
      );
      if (entry.children.length && entry.control && entry.content) {
        applyZagProps(entry.control, api.getBranchControlProps(props) as DomProps);
        applyZagProps(entry.content, api.getBranchContentProps(props) as DomProps);
        if (entry.text) applyZagProps(entry.text, api.getBranchTextProps(props) as DomProps);
        if (entry.indicator) applyZagProps(entry.indicator, api.getBranchIndicatorProps(props) as DomProps);
      } else if (entry.text) {
        applyZagProps(entry.text, api.getItemTextProps(props) as DomProps);
      }
    }
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (!tree) return;
    cleanups.push(bindZagEvents(tree, () => api.getTreeProps() as DomProps));
    for (const entry of all) {
      const target = entry.children.length && entry.control ? entry.control : entry.element;
      cleanups.push(
        bindZagEvents(target, () => {
          const props = { indexPath: entry.indexPath, node: entry.node };
          return entry.children.length
            ? (api.getBranchControlProps(props) as DomProps)
            : (api.getItemProps(props) as DomProps);
        }),
      );
    }
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
