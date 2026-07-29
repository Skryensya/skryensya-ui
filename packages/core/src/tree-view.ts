import type { ComponentContract } from "./contract.js";

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
  branchText: "data-sk-tree-view-branch-text",
  itemText: "data-sk-tree-view-item-text",
  branchContent: "data-sk-tree-view-branch-content",
} as const;

export type TreeViewSelectionDetails = { selectedValue: string[] };
export type TreeViewExpandedDetails = { expandedValue: string[] };

/**
 * A hierarchy you can walk: files, an org chart, a table of contents.
 *
 * The one family whose data RECURSES — a folder holds folders — and the reason the collection model
 * grew `recursive`. Everything else in the catalogue is a flat list of entries; here an entry's
 * children are entries of the same shape, at any depth, and a template that had to state each level
 * would state them forever.
 *
 * A node is a branch or a leaf, and nobody sets which: it is whether it has children. That is what
 * decides the element, the control, the chevron and the role, so it is asked of the CONTENT rather
 * than of an option.
 *
 * Zag owns `aria-level`, `aria-posinset` and the roving focus, and writes them onto whichever markup
 * it is given — so the authored tree carries structure and the machine carries position.
 */
export const treeViewContract = {
  id: "tree-view",
  css: "@skryensya/core/components/tree-view.css",
  parts: treeViewParts,

  options: {
    /** The tree's accessible name. A tree with no name is a list of words with no subject. */
    label: { type: "string", attr: "aria-label", machineInput: true },
    selectionMode: {
      type: "enum",
      values: ["single", "multiple"],
      default: "single",
      attr: "data-selection-mode",
      machineInput: true,
    },
  },

  signatures: {
    TreeView: {
      intent: ["tree", "file-explorer", "hierarchy", "nested-list", "folder-structure"],
      host: { element: "div" },
      options: ["label", "selectionMode"],
      requires: ["label"],
      slots: {
        items: {
          accepts: "items",
          prop: "nodes",
          required: true,
          item: {
            options: {
              /** The node's identity. It is what selection and expansion are expressed in. */
              id: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
            },
            slots: {
              label: { accepts: "text", required: true },
              /** Same shape, one level down. A folder holds folders. */
              children: { accepts: "items", recursive: true },
            },
            key: "id",
          },
        },
      },
      mount: "data-sk-tree-view",
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "ul",
            part: "tree",
            mount: "data-sk-tree-view-tree",
            children: [
              {
                repeat: "items",
                children: [
                  /*
                   * The shape, written once and named. Everything below points back at this rather
                   * than restating it, which is the only way a fixed template renders a structure
                   * of unbounded depth.
                   */
                  {
                    name: "node",
                    children: [
                      {
                        element: "li",
                        part: "branch",
                        // A branch is a node that HAS children. Nobody sets that; it is the content.
                        whenItemSlotGiven: "children",
                        mount: "data-sk-tree-view-branch",
                        itemOptions: ["id", "disabled"],
                        children: [
                          {
                            element: "button",
                            part: "branchControl",
                            also: ["sk-interactive"],
                            mount: "data-sk-tree-view-branch-control",
                            attrs: { type: "button" },
                            children: [
                              {
                                element: "span",
                                part: "branchIndicator",
                                mount: "data-sk-tree-view-branch-indicator",
                                attrs: { "aria-hidden": "true" },
                                text: "›",
                              },
                              { element: "span", part: "branchText", mount: "data-sk-tree-view-branch-text", itemSlot: "label" },
                            ],
                          },
                          {
                            element: "ul",
                            part: "branchContent",
                            mount: "data-sk-tree-view-branch-content",
                            children: [{ repeatItemSlot: "children", recurse: "node" }],
                          },
                        ],
                      },
                      {
                        element: "li",
                        part: "item",
                        also: ["sk-interactive"],
                        whenItemSlotMissing: "children",
                        mount: "data-sk-tree-view-item",
                        itemOptions: ["id", "disabled"],
                        children: [
                          /*
                           * The chevron's column, kept empty on a leaf. Without it the labels of one
                           * level do not line up with the labels of the level above.
                           */
                          { element: "span", attrs: { "aria-hidden": "true" } },
                          { element: "span", part: "itemText", mount: "data-sk-tree-view-item-text", itemSlot: "label" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/tree-view", name: "TreeView" },
    },
  },
} as const satisfies ComponentContract;
