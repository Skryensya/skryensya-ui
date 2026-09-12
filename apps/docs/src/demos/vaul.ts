import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * Root plus handle: Vaul's own parts. Children stay free-form composition (no `sk-vaul__content`),
 * so the specimen only needs enough body for the panel to read as a panel. `open` paints it
 * non-modally; anatomy CSS puts the fixed edge panel back in flow so Annotated can measure it.
 */
export const vaulAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("vaulPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "vaul",
      signature: "Vaul",
      options: {
        edge: "block-end",
        open: true,
        label: t("vaulPage.anatomyPanelLabel"),
      },
      children: [
        {
          contract: "typography",
          signature: "Heading",
          options: { headingSize: "h4", flush: true },
          children: t("vaulPage.anatomyTitle"),
        },
        {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("vaulPage.anatomyBodyText"),
        },
      ],
    },
    items: [
      namePart(".sk-vaul", "block-start"),
      namePart(".sk-vaul__handle", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * Fixed edge panel → static box. Also keep the handle visible past the desktop breakpoint that
 * normally hides it: this drawing is about the handle, and a diagram that omits the part it names
 * is worse than a diagram that forces it on for the specimen.
 */
export const vaulAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-vaul {
  position: static;
  inset: auto;
  translate: none;
  inline-size: min(100%, 20rem);
  block-size: auto;
  max-block-size: none;
  border-radius: var(--radius-surface);
  border: var(--sk-vaul-border-width, 1px) solid var(--sk-vaul-border-color, var(--color-border-subtle));
  padding: var(--space-inset-md);
  display: grid;
  gap: var(--space-stack-sm);
  box-shadow: var(--elevation-modal);
}

.sk-annotated__subject > .sk-vaul > .sk-vaul__handle {
  display: grid;
}
`;
