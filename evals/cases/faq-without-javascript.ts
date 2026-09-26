import type { EvalCase } from "../case.js";

export const faqWithoutJavascriptCase: EvalCase = {
  id: "faq-without-javascript",
  prompt: {
    es: "Unas preguntas frecuentes con tres preguntas, donde abrir una cierra las demás, y que funcionen con JavaScript desactivado.",
    en: "An FAQ with three questions where opening one closes the others, and it must work with JavaScript disabled.",
  },
  notes: [
    "Accordion vs native Details. Both render an exclusive FAQ and both validate. The requirement " +
      "that it works without JavaScript decides it: DetailsGroup of Details sharing a `name` is " +
      "exclusive in the browser itself, while Accordion needs its enhancer.",
  ],
  invariants: [
    { uses: ["Details", "DetailsGroup"], because: "it has to work without JavaScript" },
    { avoids: ["Accordion"], because: "Accordion's exclusivity comes from an enhancer" },
  ],
  tree: {
    contract: "accordion",
    signature: "DetailsGroup",
    attrs: { "aria-label": "Frequently asked questions" },
    children: [
      ["Can I cancel anytime?", "Yes, from your account settings."],
      ["Do you offer refunds?", "Within 30 days of purchase."],
      ["Is there a free plan?", "Yes, with up to three projects."],
    ].map(([question, answer]) => ({
      contract: "accordion",
      signature: "Details",
      options: { name: "faq" },
      children: [
        { contract: "accordion", signature: "Details.Summary", children: question! },
        { contract: "accordion", signature: "Details.Content", children: answer! },
      ],
    })),
  },
};
