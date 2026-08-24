import type { EvalCase } from "../case.js";

export const paginatedDataTableCase: EvalCase = {
  id: "paginated-data-table",
  prompt: {
    es: "Una tabla de datos larga con paginación para navegar los resultados.",
    en: "A long data table with pagination to browse the results.",
  },
  notes: [
    "Amplitud: Table envuelta en TableScroll (obligatorio para que una tabla más ancha que su " +
      "contenedor se desplace en vez de romper la superficie que la aloja) más Pagination como " +
      "control aparte. El catálogo no tiene una firma que combine ambas.",
  ],
  tree: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      {
        contract: "table",
        signature: "TableScroll",
        children: {
          contract: "table",
          signature: "Table",
          children: [
            { contract: "table", signature: "TableCaption", children: "Actividad reciente" },
            {
              contract: "table",
              signature: "TableHead",
              children: {
                contract: "table",
                signature: "TableRow",
                children: [
                  { contract: "table", signature: "TableHeader", children: "Servicio" },
                  { contract: "table", signature: "TableHeader", children: "Estado" },
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
                    {
                      contract: "table",
                      signature: "TableHeader",
                      options: { scope: "row" },
                      children: "API",
                    },
                    { contract: "table", signature: "TableCell", children: "Activo" },
                  ],
                },
                {
                  contract: "table",
                  signature: "TableRow",
                  children: [
                    {
                      contract: "table",
                      signature: "TableHeader",
                      options: { scope: "row" },
                      children: "Worker",
                    },
                    { contract: "table", signature: "TableCell", children: "Activo" },
                  ],
                },
              ],
            },
          ],
        },
      },
      {
        contract: "pagination",
        signature: "Pagination",
        options: { page: 2, total: 8, label: "Paginación de resultados" },
      },
    ],
  },
};
