export type TreeNode = {
  id: string;
  label: string;
  disabled?: boolean;
  children?: readonly TreeNode[];
};

export const treeViewParts = {
  root: "sk-tree-view",
  tree: "sk-tree-view__tree",
  item: "sk-tree-view__item",
  itemText: "sk-tree-view__item-text",
  branch: "sk-tree-view__branch",
  branchControl: "sk-tree-view__branch-control",
  branchIndicator: "sk-tree-view__branch-indicator",
  branchText: "sk-tree-view__branch-text",
  branchContent: "sk-tree-view__branch-content",
} as const;

export const treeViewAttrs = {
  root: "data-sk-tree-view",
  tree: "data-sk-tree-view-tree",
  item: "data-sk-tree-view-item",
  branch: "data-sk-tree-view-branch",
  branchControl: "data-sk-tree-view-branch-control",
  branchIndicator: "data-sk-tree-view-branch-indicator",
  branchContent: "data-sk-tree-view-branch-content",
} as const;

export type TreeViewSelectionDetails = { selectedValue: string[] };
export type TreeViewExpandedDetails = { expandedValue: string[] };
