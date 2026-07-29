/*
 * Live React demos for /components/menu. Each export is a self-contained island (no function props
 * crossing the Astro boundary), mounted directly from the page with a bare `<MenuBasicDemo client:load />`.
 */
import { Icon } from "@skryensya/react/icon";
import { Menu } from "@skryensya/react/menu";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const MenuBasicDemo = framed(function MenuBasicDemo() {
  return (
    <Menu
      label="File Actions"
      trigger="Acciones"
      indicator={<Icon name="chevron-down" />}
      itemIndicator={<Icon name="check" />}
      submenuIndicator={<Icon name="chevron-right" />}
      items={[
        { label: "Renombrar", value: "rename" },
        {
          kind: "checkbox",
          label: "Favorito",
          value: "favorite",
        },
        {
          label: "Exportar",
          value: "export",
          children: [{ label: "PDF", value: "export-pdf" }],
        },
      ]}
    />
  );
}, {viewport: "menu"});
