import type { Recipe } from "./recipe.js";

/**
 * A table of results with the controls around it.
 *
 * The three non-success states are all "the table is not there", and they are three different
 * things: still coming, came back with nothing, and could not come back. Collapsing them is the
 * most common way a data screen lies: an empty state shown while loading tells the reader to stop
 * waiting, and a spinner shown after a failure tells them to keep waiting forever.
 *
 * The pager is absent from all three for the same reason: paging through nothing is a control that
 * cannot do anything.
 */
export const dataTableRecipe: Recipe = {
  id: "data-table",
  intent: "Una tabla de resultados con su barra de acciones y su paginador.",
  notes: [
    "Cargando, vacío y error son tres pantallas distintas: un vacío mientras carga dice «dejá de esperar» y un spinner después de fallar dice «seguí esperando».",
    "El paginador sólo existe cuando hay páginas: paginar sobre nada es un control que no puede hacer nada.",
    "El caption no es decoración: es el nombre de la tabla, y va primero porque un lector de pantalla lo anuncia antes del contenido.",
  ],

  states: {
    loading: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "toolbar",
          signature: "Toolbar",
          options: { label: "Acciones sobre los gastos" },
          children: {
            contract: "toolbar",
            signature: "ToolbarGroup",
            children: { contract: "button", signature: "Button.action", options: { disabled: true }, children: "Exportar" },
          },
        },
        { contract: "loader", signature: "Loader", options: { size: "lg", label: "Cargando los gastos" } },
      ],
    },

    empty: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "toolbar",
          signature: "Toolbar",
          options: { label: "Acciones sobre los gastos" },
          children: {
            contract: "toolbar",
            signature: "ToolbarGroup",
            children: { contract: "button", signature: "Button.action", children: "Exportar" },
          },
        },
        {
          contract: "empty-state",
          signature: "EmptyState",
          slots: {
            title: "Todavía no hay gastos",
            description: "Cuando cargues el primero va a aparecer acá.",
            actions: {
              contract: "button",
              signature: "Button.action",
              options: { variant: "primary" },
              children: "Cargar un gasto",
            },
          },
        },
      ],
    },

    error: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "toolbar",
          signature: "Toolbar",
          options: { label: "Acciones sobre los gastos" },
          children: {
            contract: "toolbar",
            signature: "ToolbarGroup",
            children: { contract: "button", signature: "Button.action", options: { disabled: true }, children: "Exportar" },
          },
        },
        {
          contract: "callout",
          signature: "Callout",
          options: { tone: "danger" },
          slots: {
            title: "No pudimos cargar los gastos",
            actions: {
              contract: "button",
              signature: "Button.action",
              options: { variant: "subtle" },
              children: "Reintentar",
            },
          },
          children: "El servidor no respondió a tiempo.",
        },
      ],
    },

    success: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "toolbar",
          signature: "Toolbar",
          options: { label: "Acciones sobre los gastos" },
          children: {
            contract: "toolbar",
            signature: "ToolbarGroup",
            children: { contract: "button", signature: "Button.action", children: "Exportar" },
          },
        },
        {
          contract: "table",
          signature: "Table",
          children: [
            { contract: "table", signature: "TableCaption", children: "Gastos de julio" },
            {
              contract: "table",
              signature: "TableHead",
              children: {
                contract: "table",
                signature: "TableRow",
                children: [
                  { contract: "table", signature: "TableHeader", children: "Concepto" },
                  { contract: "table", signature: "TableHeader", children: "Monto" },
                ],
              },
            },
            {
              contract: "table",
              signature: "TableBody",
              children: [
                {
                  contract: "table",
                  signature: "TableRow",
                  children: [
                    { contract: "table", signature: "TableCell", children: "Servidores" },
                    { contract: "table", signature: "TableCell", children: "$120" },
                  ],
                },
                {
                  contract: "table",
                  signature: "TableRow",
                  children: [
                    { contract: "table", signature: "TableCell", children: "Dominios" },
                    { contract: "table", signature: "TableCell", children: "$30" },
                  ],
                },
              ],
            },
            {
              contract: "table",
              signature: "TableFooter",
              children: {
                contract: "table",
                signature: "TableRow",
                children: [
                  { contract: "table", signature: "TableCell", children: "Total" },
                  { contract: "table", signature: "TableCell", children: "$150" },
                ],
              },
            },
          ],
        },
        { contract: "pagination", signature: "Pagination", options: { page: 1, total: 4 } },
      ],
    },
  },
};
