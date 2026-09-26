import type { EvalCase } from "../case.js";

export const ctaNavigatesToPricingCase: EvalCase = {
  id: "cta-navigates-to-pricing",
  prompt: {
    es: "Un botón destacado \"Ver precios\" que lleva al visitante a la página /precios.",
    en: "A prominent \"See pricing\" button that takes the visitor to the /pricing page.",
  },
  notes: [
    "Action vs navigation. The prompt says BUTTON, and a Button.action with an onclick that changes " +
      "location validates just as well. The requirement is that it goes somewhere, which is a link " +
      "that looks like a button: Button.navigation, an `<a href>`.",
  ],
  invariants: [
    { uses: ["Button.navigation", "Link"], because: "it takes the visitor to another page, so it is a link" },
    { avoids: ["Button.action"], because: "Button.action's avoidWhen: it leads to another URL" },
  ],
  tree: {
    contract: "button",
    signature: "Button.navigation",
    options: { tone: "accent", href: "/pricing" },
    children: "See pricing",
  },
};
