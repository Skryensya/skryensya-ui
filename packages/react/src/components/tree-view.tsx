import { treeViewContract, treeViewParts, type TreeNode } from "@skryensya/core/tree-view";
import type { OptionValue } from "@skryensya/core/contract";
import { treeView } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useMemo, type ReactNode } from "react";

export type TreeViewProps = {
  id?: string;
  label: string;
  nodes: readonly TreeNode[];
  // Derived: Core owns the modes, and a copy here goes stale the day a third one appears.
  selectionMode?: OptionValue<typeof treeViewContract.options.selectionMode>;
  selectedValue?: string[];
  defaultSelectedValue?: string[] | string;
  expandedValue?: string[];
  defaultExpandedValue?: string[] | string;
  branchIndicator?: ReactNode;
  leafIndicator?: ReactNode;
  onSelectionChange?: (details: { selectedValue: string[] }) => void;
  onExpandedChange?: (details: { expandedValue: string[] }) => void;
};

type TreeApi = ReturnType<typeof treeView.connect>;

function NodeView({
  api,
  branchIndicator,
  indexPath,
  leafIndicator,
  node,
}: {
  api: TreeApi;
  branchIndicator?: ReactNode;
  indexPath: number[];
  leafIndicator?: ReactNode;
  node: TreeNode;
}) {
  const nodeProps = { indexPath, node };
  const state = api.getNodeState(nodeProps);
  if (state.isBranch) {
    return (
      <li {...api.getBranchProps(nodeProps)} className={treeViewParts.branch}>
        <button
          type="button"
          {...api.getBranchControlProps(nodeProps)}
          className={`${treeViewParts.branchControl} sk-interactive`}
        >
          <span
            {...api.getBranchIndicatorProps(nodeProps)}
            className={treeViewParts.branchIndicator}
            aria-hidden="true"
          >
            {branchIndicator ?? "›"}
          </span>
          <span
            {...api.getBranchTextProps(nodeProps)}
            className={treeViewParts.branchText}
          >
            {node.label}
          </span>
        </button>
        <ul
          {...api.getBranchContentProps(nodeProps)}
          className={treeViewParts.branchContent}
        >
          {node.children?.map((child, index) => (
            <NodeView
              api={api}
              branchIndicator={branchIndicator}
              indexPath={[...indexPath, index]}
              key={child.id}
              leafIndicator={leafIndicator}
              node={child}
            />
          ))}
        </ul>
      </li>
    );
  }
  return (
    <li
      {...api.getItemProps(nodeProps)}
      className={`${treeViewParts.item} sk-interactive`}
    >
      {/* La columna del chevron, reservada también en la hoja (vacía si no hay
          leafIndicator): sin ella los labels de un nivel no alinean. */}
      <span aria-hidden="true">{leafIndicator}</span>
      <span
        {...api.getItemTextProps(nodeProps)}
        className={treeViewParts.itemText}
      >
        {node.label}
      </span>
    </li>
  );
}

export function TreeView({
  branchIndicator,
  defaultExpandedValue: defaultExpandedValueProp,
  defaultSelectedValue: defaultSelectedValueProp,
  expandedValue,
  id,
  label,
  leafIndicator,
  nodes,
  onExpandedChange,
  onSelectionChange,
  selectedValue,
  selectionMode = "single",
}: TreeViewProps) {
  const generatedId = useId();
  const defaultExpandedValue =
    typeof defaultExpandedValueProp === "string"
      ? defaultExpandedValueProp.split(/[\s,]+/).filter(Boolean)
      : defaultExpandedValueProp;
  const defaultSelectedValue =
    typeof defaultSelectedValueProp === "string"
      ? defaultSelectedValueProp.split(/[\s,]+/).filter(Boolean)
      : defaultSelectedValueProp;
  const collection = useMemo(
    () =>
      treeView.collection<TreeNode>({
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.label,
        isNodeDisabled: (node) => Boolean(node.disabled),
        rootNode: { id: "__root__", label: "", children: [...nodes] },
      }),
    [nodes],
  );
  const service = useMachine(treeView.machine, {
    id: id ?? generatedId,
    collection,
    selectionMode,
    selectedValue,
    defaultSelectedValue,
    expandedValue,
    defaultExpandedValue,
    translations: { treeLabel: label },
    onSelectionChange(details) {
      onSelectionChange?.({ selectedValue: details.selectedValue });
    },
    onExpandedChange(details) {
      onExpandedChange?.({ expandedValue: details.expandedValue });
    },
  });
  const api = treeView.connect(service, normalizeProps);

  return (
    <div {...api.getRootProps()} className={treeViewParts.root}>
      <ul {...api.getTreeProps()} className={treeViewParts.tree}>
        {nodes.map((node, index) => (
          <NodeView
            api={api}
            branchIndicator={branchIndicator}
            indexPath={[index]}
            key={node.id}
            leafIndicator={leafIndicator}
            node={node}
          />
        ))}
      </ul>
    </div>
  );
}
