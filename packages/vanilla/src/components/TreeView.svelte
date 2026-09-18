<script lang="ts">
  import { treeView } from "@skryensya/core/machines";
  import { treeViewAttrs, treeViewEvents } from "@skryensya/core/tree-view";
  import type { TreeNode } from "@skryensya/core/tree-view";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { selectorsFor } from "@skryensya/core/selectors";

  /*
   * TREE VIEW, a machine-backed enhancer over `@zag-js/tree-view` (the SAME machine React uses, via
   * `@skryensya/core/machines`). It renders no structure: it scans its authored markup (nested
   * branches/leaves) and patches the attributes `connect` returns onto those nodes.
   */
  const root = getRoot();

  /* Derived from the contract's own mount attributes; see `selectorsFor`. */

  const selector = selectorsFor(treeViewAttrs);

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

  /** `data-expanded-value="src docs"` or `"src, docs"`: both separators are accepted. */
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
        disabled: element.hasAttribute("data-disabled"),
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

  // Captured ONCE, never re-read from the DOM: `getRootProps().id` returns a namespaced id that
  // `applyZagProps` writes back onto `root.id`. Reading it live from `useMachine`'s reactive factory
  // would feed that prefix back on every recomputation.
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
        new CustomEvent(treeViewEvents.selectionChange, { bubbles: true, detail: { selectedValue: details.selectedValue } }),
      );
    },
    onExpandedChange(details: { expandedValue: string[] }) {
      root.dispatchEvent(
        new CustomEvent(treeViewEvents.expandedChange, { bubbles: true, detail: { expandedValue: details.expandedValue } }),
      );
    },
  }));

  const api = $derived(treeView.connect(service, normalizeProps));

  /*
   * A BRANCH AND A LEAF ARE DIFFERENT ANATOMIES, so each entry contributes the bindings its own shape
   * has. Which shape it is comes from the authored markup and is read once, at initialisation: an
   * entry does not become a branch while mounted.
   *
   * The wiring target follows from that and no longer has to be computed separately: a branch's events
   * belong on its control (which is also where `getBranchControlProps` is patched) and a leaf's on its
   * element. Those two used to be worked out in a second loop, from a second expression.
   */
  const propsFor = (entry: (typeof all)[number]) => ({
    indexPath: entry.indexPath,
    node: entry.node,
  });

  const bindings: PartBinding[] = [
    { part: "root", node: () => (tree ? root : null), props: () => api.getRootProps() },
    { part: "tree", node: () => tree, props: () => api.getTreeProps(), events: true },

    ...all.flatMap((entry): PartBinding[] => {
      /*
       * THREE CONDITIONS, NOT ONE, because the original drew the line in three different places and
       * collapsing them would be a behaviour change wearing a refactor's clothes:
       *
       *   `hasChildren`   decides the ELEMENT's props (branch or item). Children alone.
       *   `full`          decides whether the branch SUB-PARTS are patched at all. A node with
       *                   children but no authored control/content is a branch whose chrome was never
       *                   written, and it gets branch props on the element and nothing else.
       *   `wiresControl`  decides WHERE the events land - the control when there is one, else the
       *                   element. `control && children` is the original's own test, and it is not
       *                   the same as `full`: it does not ask about content.
       */
      const hasChildren = entry.children.length > 0;
      const full = hasChildren && Boolean(entry.control) && Boolean(entry.content);
      const wiresControl = hasChildren && Boolean(entry.control);

      const element: PartBinding = {
        part: hasChildren ? "branch" : "item",
        node: () => (tree ? entry.element : null),
        props: () => (hasChildren ? api.getBranchProps(propsFor(entry)) : api.getItemProps(propsFor(entry))),
        events: !wiresControl,
      };

      if (!full) {
        return [
          element,
          {
            part: "item-text",
            node: () => (tree ? entry.text : null),
            props: () => api.getItemTextProps(propsFor(entry)),
          },
        ];
      }

      return [
        element,
        {
          part: "branch-control",
          node: () => (tree ? entry.control : null),
          props: () => api.getBranchControlProps(propsFor(entry)),
          events: true,
        },
        {
          part: "branch-content",
          node: () => (tree ? entry.content : null),
          props: () => api.getBranchContentProps(propsFor(entry)),
        },
        {
          part: "branch-text",
          node: () => (tree ? entry.text : null),
          props: () => api.getBranchTextProps(propsFor(entry)),
        },
        {
          part: "branch-indicator",
          node: () => (tree ? entry.indicator : null),
          props: () => api.getBranchIndicatorProps(propsFor(entry)),
        },
      ];
    }),
  ];

  bindParts(bindings);
</script>
