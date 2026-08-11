/*
 * A `sk-tree-view` file browser, built from a plain list of paths.
 *
 * `AccordionSourceViewer` used to carry this same markup hand-generated once, by calling
 * `skryensya-ui`'s `validate_ui` against a tree written out for Accordion's nine files. That is a
 * valid way to author ONE tree; it is not a way to give every component page a "Referencia" tab,
 * because it would mean re-running the tool and re-pasting a few hundred lines of HTML per
 * component. The shape a `sk-tree-view` wants from a folder is mechanical (branch when a path has
 * more segments after it, item when it does not, folders opened before the files inside them,
 * insertion order preserved), so this builds it directly rather than asking the tool to validate
 * the same shape over and over. What still MUST come from `validate_ui` is the shape itself: the
 * class names and data attributes below are copied from the markup it produced for Accordion, and
 * changing what a branch or an item renders as belongs there, not here.
 */

type TreeNode =
  | { readonly type: "file"; readonly name: string; readonly path: string }
  | { readonly type: "folder"; readonly name: string; readonly path: string; readonly children: Map<string, TreeNode> };

function buildTree(paths: readonly string[]): Map<string, TreeNode> {
  const root = new Map<string, TreeNode>();
  for (const path of paths) {
    const segments = path.split("/");
    let level = root;
    let acc = "";
    segments.forEach((segment, i) => {
      acc = acc ? `${acc}/${segment}` : segment;
      const isFile = i === segments.length - 1;
      let node = level.get(segment);
      if (!node) {
        node = isFile
          ? { type: "file", name: segment, path: acc }
          : { type: "folder", name: segment, path: acc, children: new Map() };
        level.set(segment, node);
      }
      if (node.type === "folder") level = node.children;
    });
  }
  return root;
}

function renderItem(node: Extract<TreeNode, { type: "file" }>): string {
  return `<li class="sk-tree-view__item sk-interactive" data-sk-tree-view-item data-value="${node.path}">
  <span class="sk-tree-view__item-indicator" aria-hidden="true"></span>
  <span class="sk-tree-view__item-icon" aria-hidden="true"><span data-sk-icon="file" data-sk-icon-size="sm"></span></span>
  <span class="sk-tree-view__item-text" data-sk-tree-view-item-text>${node.name}</span>
</li>`;
}

function renderBranch(node: Extract<TreeNode, { type: "folder" }>, expanded: string[]): string {
  expanded.push(node.path);
  const children = [...node.children.values()]
    .map((child) => (child.type === "folder" ? renderBranch(child, expanded) : renderItem(child)))
    .join("\n");
  return `<li class="sk-tree-view__branch" data-sk-tree-view-branch data-value="${node.path}">
  <button class="sk-tree-view__branch-control sk-interactive" data-sk-tree-view-branch-control type="button">
    <span class="sk-tree-view__branch-indicator" data-sk-tree-view-branch-indicator aria-hidden="true">›</span>
    <span class="sk-tree-view__branch-icon" aria-hidden="true"><span data-sk-icon="folder" data-sk-icon-size="sm"></span></span>
    <span class="sk-tree-view__branch-text" data-sk-tree-view-branch-text>${node.name}</span>
  </button>
  <ul class="sk-tree-view__branch-content" data-sk-tree-view-branch-content>
${children}
  </ul>
</li>`;
}

export interface SourceTree {
  /** `<ul class="sk-tree-view__tree" ...>...</ul>`, ready to sit inside the `sk-tree-view` root. */
  readonly treeHtml: string;
  /** Every folder path, pre-order: the tree's `data-expanded-value`, all branches open by default. */
  readonly expandedValue: string;
}

/** Paths in the order files should be discovered, e.g. `"packages/core/src/dialog.ts"`. */
export function buildSourceTree(paths: readonly string[]): SourceTree {
  const root = buildTree(paths);
  const expanded: string[] = [];
  const html = [...root.values()]
    .map((node) => (node.type === "folder" ? renderBranch(node, expanded) : renderItem(node)))
    .join("\n");
  return {
    treeHtml: `<ul class="sk-tree-view__tree" data-sk-tree-view-tree>\n${html}\n</ul>`,
    expandedValue: expanded.join(" "),
  };
}
