import type { Snippet } from "./snippet.js";

export const formFieldHintAndErrorSnippet: Snippet = {
  id: "form-field-hint-and-error",
  level: "component",
  intent: "A field that carries a standing hint AND, once invalid, an error  -  both wired to the control.",
  notes: [
    "`hint` and `error` are both optional and both independent  -  a field can carry neither, either, " +
      "or both at once, which is exactly this case: \"must match the password above\" is worth " +
      "saying before the reader ever gets it wrong, and \"passwords don't match\" only appears once " +
      "they have.",
    "Nothing here writes `aria-describedby` or `aria-invalid` by hand: `get_contract`'s own " +
      "`wiring` array does it  -  `aria-describedby` on the control references BOTH `hint` and " +
      "`error` whenever they're given, and `aria-invalid=\"true\"` appears the moment `error` does. " +
      "Composing the tree with both slots filled is the whole job; the control's own attributes " +
      "follow from that, not from anything authored here directly.",
    "`Input`'s `parents: [\"FormField\"]` (get_contract) means this pairing isn't a convention this " +
      "snippet invented  -  an `Input` outside a `FormField` is a different, unlabelled thing.",
  ],
  tree: {
    contract: "form-field",
    signature: "FormField",
    options: { required: true },
    slots: {
      label: "Confirm password",
      hint: "Must match the password above.",
      error: "Passwords don't match.",
    },
    children: {
      contract: "input",
      signature: "Input",
      options: { type: "password", controlSize: "md" },
    },
  },
};
