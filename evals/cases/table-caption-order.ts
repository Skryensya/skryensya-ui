import type { EvalCase } from "../case.js";

export const tableCaptionOrderCase: EvalCase = {
  id: "table-caption-order",
  prompt: {
    es: "Una tabla con nombre accesible que lista los pedidos recientes, con sus columnas.",
    en: "A table with an accessible name listing recent orders, with its columns.",
  },
  notes: [
    "Guarda la regla de orden y cardinalidad que HTML fija y el contrato ahora declara (`ordered`, " +
      "`cardinality`): el `<caption>` va primero y hay como máximo uno, `<tbody>` es obligatorio. Un " +
      "`<tfoot>` escrito antes del cuerpo es markup que el parser reubica en silencio; el slot lo " +
      "rechaza en vez de dejarlo pasar.",
  ],
  tree: {
    contract: "table",
    signature: "TableScroll",
    children: {
      contract: "table",
      signature: "Table",
      children: [
        { contract: "table", signature: "TableCaption", children: "Pedidos recientes" },
        {
          contract: "table",
          signature: "TableHead",
          children: {
            contract: "table",
            signature: "TableRow",
            children: [
              { contract: "table", signature: "TableHeader", children: "Pedido" },
              { contract: "table", signature: "TableHeader", children: "Cliente" },
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
                  children: "#1042",
                },
                { contract: "table", signature: "TableCell", children: "Marta Ruiz" },
                { contract: "table", signature: "TableCell", children: "Enviado" },
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
                  children: "#1041",
                },
                { contract: "table", signature: "TableCell", children: "Diego Paz" },
                { contract: "table", signature: "TableCell", children: "Pendiente" },
              ],
            },
          ],
        },
      ],
    },
  },
};
