import type { Recipe } from "./recipe.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/**
 * The frame every screen inside an application sits in: a navbar across the top, a sidebar of
 * destinations down the side, and the column of content between them.
 *
 * The four states are the SHELL's, not the page's, which is the distinction worth carrying. The
 * navigation is the last thing to go: a shell that replaces itself with a spinner takes away the
 * only way out of a page that is failing, and the reader is left with a screen they cannot leave.
 * So loading, empty and error all keep the navbar and the sidebar; only the column changes.
 */
export const appShellRecipe: Recipe = {
  id: "app-shell",
  intent: "El marco de una aplicación: navbar arriba, sidebar al costado, contenido en el medio.",
  notes: [
    "La navegación es lo último que se va: un shell que se reemplaza por un spinner le saca a la persona la única salida de una página que está fallando.",
    "El sidebar hospeda la NavList, no la define: la misma lista sirve en un navbar o en un drawer (decisión 17).",
    "El destino actual se marca con `current`, que escribe `aria-current`: sin eso la barra dice dónde se puede ir, pero no dónde se está.",
  ],

  states: {
    loading: shell({
      contract: "loader",
      signature: "Loader",
      options: { size: "lg", label: "Cargando el proyecto" },
    }),

    empty: shell({
      contract: "empty-state",
      signature: "EmptyState",
      slots: {
        title: "Todavía no hay nada acá",
        description: "Creá tu primer proyecto para empezar.",
        actions: {
          contract: "button",
          signature: "Button.action",
          options: { variant: "primary" },
          children: "Crear proyecto",
        },
      },
    }),

    error: shell({
      contract: "callout",
      signature: "Callout",
      options: { tone: "danger" },
      slots: {
        title: "No pudimos cargar el proyecto",
        actions: {
          contract: "button",
          signature: "Button.action",
          options: { variant: "subtle" },
          children: "Reintentar",
        },
      },
      children: "Volvé a intentar en unos segundos.",
    }),

    success: shell({
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Atlas" },
        {
          contract: "layout",
          signature: "Grid",
          options: { columns: "3", gap: "md" },
          children: [
            { contract: "stat", signature: "Stat", slots: { label: "Tareas abiertas", value: "12" } },
            {
              contract: "stat",
              signature: "Stat",
              options: { trend: "up" },
              slots: { label: "Cerradas esta semana", value: "8", change: "+3" },
            },
            { contract: "stat", signature: "Stat", slots: { label: "Personas", value: "5" } },
          ],
        },
      ],
    }),
  },
};

/*
 * The shell around whatever the column holds. A local helper rather than four copies: the navbar and
 * the sidebar are IDENTICAL in every state (that is the claim the recipe is making), and writing
 * them out four times would let one of them drift and quietly stop making it.
 */
function shell(content: UsageTree): UsageTree {
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
    children: [
      {
        contract: "navbar",
        signature: "Navbar",
        children: [
          { contract: "navbar", signature: "NavbarBrand", children: "Skryensya" },
          {
            contract: "navbar",
            signature: "NavbarActions",
            children: { contract: "theme-toggle", signature: "ThemeToggle" },
          },
        ],
      },
      {
        contract: "layout",
        signature: "Inline",
        /*
         * `wrap: false`: the shell is a rail beside a column, and the default (items fall to a
         * second line) put the content UNDER the sidebar instead of next to it. It rendered, it
         * validated, and it was the wrong screen, which is why a recipe has to be looked at.
         */
        options: { gap: "lg", inlineAlign: "start", wrap: false },
        children: [
          {
            contract: "sidebar",
            signature: "Sidebar",
            children: [
              {
                contract: "sidebar",
                signature: "SidebarHeader",
                children: {
                  contract: "sidebar",
                  signature: "SidebarTrigger",
                  options: { label: "Angostar la barra" },
                  slots: { icon: { contract: "icon", signature: "Icon", options: { name: "menu" } } },
                },
              },
              {
                contract: "sidebar",
                signature: "SidebarContent",
                children: {
                  contract: "nav-list",
                  signature: "NavList",
                  children: {
                    contract: "nav-list",
                    signature: "NavListGroup",
                    children: [
                      {
                        contract: "nav-list",
                        signature: "NavListLink",
                        options: { href: "/proyectos", current: true },
                        children: "Proyectos",
                      },
                      {
                        contract: "nav-list",
                        signature: "NavListLink",
                        options: { href: "/equipo" },
                        children: "Equipo",
                      },
                    ],
                  },
                },
              },
              { contract: "sidebar", signature: "SidebarSeparator" },
              { contract: "sidebar", signature: "SidebarFooter", children: "John Doe" },
            ],
          },
          { contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "md" }, children: content },
        ],
      },
    ],
  };
}
