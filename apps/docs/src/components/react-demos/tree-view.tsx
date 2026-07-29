/*
 * Live React demo for /components/tree-view. Self-contained island (no function props crossing
 * the Astro boundary), mounted directly from the page with a bare `<TreeViewSettingsDemo client:load />`.
 */
import { Icon } from "@skryensya/react/icon";
import { TreeView } from "@skryensya/react/tree-view";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const nodes = [
  {
    id: "cuenta",
    label: "Cuenta",
    children: [
      { id: "perfil", label: "Perfil" },
      {
        id: "seguridad",
        label: "Seguridad",
        children: [
          { id: "sesiones", label: "Sesiones" },
          { id: "claves", label: "Claves", disabled: true },
        ],
      },
    ],
  },
  { id: "facturacion", label: "Billing" },
];

export const TreeViewSettingsDemo = framed(function TreeViewSettingsDemo() {
  return (
    <TreeView
      label="Settings"
      nodes={nodes}
      selectionMode="multiple"
      defaultExpandedValue={["cuenta", "seguridad"]}
      defaultSelectedValue={["perfil"]}
      branchIndicator={<Icon name="chevron-right" />}
      onSelectionChange={() => {}}
    />
  );
});
