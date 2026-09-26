import type { EvalCase } from "../case.js";

export const viewSwitcherExclusiveCase: EvalCase = {
  id: "view-switcher-exclusive",
  prompt: {
    es: "Un selector de vista Lista / Cuadrícula sobre una lista de resultados: siempre hay exactamente una vista activa.",
    en: "A List / Grid view switcher above a list of results: exactly one view is active at a time.",
  },
  notes: [
    "A component vs the alternative its avoidWhen names. Two Button.action with `pressed` validate " +
      "and look right, and Button.action's avoidWhen says exactly this is not its job: an exclusive " +
      "choice is Segmented or RadioGroup, which also bring the arrow keys.",
  ],
  invariants: [
    { uses: ["Segmented", "RadioGroup", "TileRadioGroup"], because: "one of a small exclusive set is a single-choice control" },
    { avoids: ["Button.action", "StateButton"], because: "Button.action's avoidWhen: `pressed` for the chosen item of an exclusive group" },
  ],
  counterexamples: [
    {
      tree: {
        contract: "layout",
        signature: "Inline",
        options: { gap: "xs" },
        attrs: { role: "group", "aria-label": "View" },
        children: [
          { contract: "button", signature: "Button.action", options: { pressed: true }, children: "List" },
          { contract: "button", signature: "Button.action", options: { pressed: false }, children: "Grid" },
        ],
      },
      because: "two pressed toggles, which do not make each other un-pressed or share arrow keys",
    },
  ],
  tree: {
    contract: "segmented",
    signature: "Segmented",
    options: { value: "list", label: "View" },
    slots: {
      items: [
        { options: { value: "list" }, slots: { label: "List" } },
        { options: { value: "grid" }, slots: { label: "Grid" } },
      ],
    },
  },
};
