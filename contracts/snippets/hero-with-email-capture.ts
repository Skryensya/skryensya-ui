import type { Snippet } from "./snippet.js";

export const heroWithEmailCaptureSnippet: Snippet = {
  id: "hero-with-email-capture",
  level: "molecule",
  intent: "A waitlist or early-access pitch, set inside a full-width highlighted band with the email field balanced against it.",
  notes: [
    "`box.Box` (`surface: \"sunken\"`, `padding: \"lg\"`), not `wrapper.Wrapper` alone, wraps the " +
      "whole row: a first version put the pitch and the form in a plain column, same background as " +
      "the rest of the hero, and it read as one more paragraph rather than the one thing this hero " +
      "actually wants a reader to do. A distinct surface says \"this part is different\" the way a " +
      "flat column cannot; `Box` is the system's own lever for that, not a hand-built card component. " +
      "`sunken`, not `raised`: `Hero` itself already sits on `surface: \"surface\"`, and a raised " +
      "panel would be reaching for elevation ON TOP OF a hero that is already the page's own raised " +
      "moment; a sunken panel reads as a distinct region without competing with the hero's own " +
      "surface for attention.",
    "`Box` spans the Hero's FULL width (no `Wrapper` around the `Box` itself), `Wrapper` moves " +
      "INSIDE it instead, centering only the row of content at the page's own main measure: the " +
      "highlighted band reads as a deliberate, page-width section, the same way a real newsletter " +
      "band on a marketing page rarely stops at a narrow column, while the actual pitch and form " +
      "still line up with everything else on the page rather than stretching edge to edge " +
      "themselves.",
    "The pitch and the form sit side by side (`layout.Inline`, `justify: \"between\"`), not stacked: " +
      "a single narrow column read as thin and unbalanced inside a wide band; splitting the row so " +
      "the words are on one side and the action is on the other uses the band's own width instead of " +
      "leaving it mostly empty, the same shape a real newsletter-signup band almost always takes.",
    "A real `form-field.FormField` (visible label \"Email address\"), not a placeholder standing in " +
      "for one: a search or email field that leans on its placeholder alone as its only label is a " +
      "real, common accessibility miss, not a stylistic choice this system repeats.",
    "`inlineAlign: \"end\"` on the form's own `Inline`: `FormField` stacks a label above its input, " +
      "so the input's own baseline sits lower than a bare button's would at `\"center\"`. Aligning to " +
      "`\"end\"` puts the button's baseline level with the input's, the same reasoning every other " +
      "email/search snippet in this catalogue gives for the identical lever.",
    "One `Button.action` (`variant: \"accent\"`), not `Button.navigation`: the row submits a form, it " +
      "does not link anywhere, and `Hero`'s own content rule (\"como mucho una acción primaria\") is " +
      "satisfied by this being the ONE action in the whole hero.",
  ],
  tree: {
    contract: "hero",
    signature: "Hero",
    children: [
      {
        contract: "box",
        signature: "Box",
        options: { surface: "sunken", padding: "lg" },
        children: [
          {
            contract: "wrapper",
            signature: "Wrapper",
            children: [
              {
                contract: "layout",
                signature: "Inline",
                options: { gap: "lg", inlineAlign: "center", justify: "between", wrap: true },
                children: [
                  {
                    contract: "layout",
                    signature: "Stack",
                    options: { gap: "xs", align: "start" },
                    children: [
                      {
                        contract: "typography",
                        signature: "Heading",
                        options: { headingSize: "display-sm", flush: true },
                        children: "Be one of the first to try it.",
                      },
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { tone: "secondary", size: "lg" },
                        children: "Leave your email and we'll let you know the moment early access opens.",
                      },
                    ],
                  },
                  {
                    contract: "layout",
                    signature: "Inline",
                    options: { gap: "sm", inlineAlign: "end", wrap: false },
                    children: [
                      {
                        contract: "form-field",
                        signature: "FormField",
                        slots: {
                          label: "Email address",
                          children: {
                            contract: "input",
                            signature: "Input",
                            options: { type: "email", placeholder: "you@company.com" },
                          },
                        },
                      },
                      {
                        contract: "button",
                        signature: "Button.action",
                        options: { tone: "accent" },
                        children: "Join the waitlist",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
