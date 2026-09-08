import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Snippet } from "./snippet.js";

function featureRow(label: string): UsageTree {
  return {
    contract: "layout" as const,
    signature: "Inline" as const,
    options: { gap: "xs" as const, inlineAlign: "center" as const },
    children: [
      { contract: "icon" as const, signature: "Icon" as const, options: { name: "check" as const, size: "sm" as const } },
      { contract: "typography" as const, signature: "Text" as const, options: { size: "sm" as const }, children: label },
    ],
  };
}

export const heroWithAudienceTabsSnippet: Snippet = {
  id: "hero-with-audience-tabs",
  level: "molecule",
  intent: "One product, two audiences: a shared headline with the supporting pitch, a short feature list and action switching underneath it.",
  notes: [
    "Exactly one `Heading`, ABOVE the tabs, shared by both panels: putting a `Heading` inside EACH " +
      "`Tabs.items` panel (one pitch per audience) would put two `<h2>` elements in the document at " +
      "once, only one of them visible at a time, still a doubled heading `Hero`'s own content rule " +
      "warns against, the same reasoning `hero-with-eyebrow`'s own notes give for keeping a badge " +
      "from growing into a second heading. Only the supporting `Text`, the feature rows and the " +
      "action change per audience; the one headline stays constant across both.",
    "`align: \"start\"` on `Hero` (its own default, not overridden here), not `\"center\"`: this " +
      "pattern replaces an earlier centered version. Confirmed live, centering a tab switch reads " +
      "wrong for two reasons a short centered hero does not have: the tab list's own underline " +
      "(`.sk-tabs__list`'s `border-block-end`) runs the full width of whichever panel happens to be " +
      "widest, not the width of the two labels, so a centered `Hero` draws that line visibly off-" +
      "center from the labels sitting on it; and a feature list (below) reads left-to-right as a " +
      "list of facts, which centered text turns into a ragged, harder-to-scan block.",
    "Each panel is the SAME shape (one line of pitch, exactly three feature rows, one button), not " +
      "just similar length: confirmed live, switching `Tabs` unmounts one panel and mounts the " +
      "other, so two panels of different heights make the page's own content below the hero jump " +
      "(a real, measurable layout shift) the instant a reader switches. Matching the shape exactly, " +
      "not just approximately, is what keeps both panels close enough in height that the switch " +
      "reads as a content change, not a resize.",
    "Each feature row is a plain `layout.Inline` (`Icon` `name: \"check\"` + `Text`), NOT " +
      "`list.List`/`ListItem`: tried first, `list.List`'s own `dividers` option turned out to not " +
      "actually be wired to its `List` signature (`get_contract(\"list\")`'s own `List.options` is " +
      "only `[\"density\"]`; `dividers` sits in the file's shared options catalog but no signature " +
      "exposes it), so `dividers: false` was silently accepted by `validate_ui` while doing nothing, " +
      "confirmed live: the CSS rule it should have toggled (`.sk-list[data-dividers=\"none\"]`) never " +
      "matched, and every row kept its divider anyway. Confirmed separately that `validate_ui` " +
      "doesn't actually check options on content nested inside a `Tabs.items[].slots.children` " +
      "panel the way it does everywhere else, which is how the invalid option passed silently in the " +
      "first place; a `List` used directly (not inside a tab panel) correctly rejects the same tree. " +
      "That validator gap is a real bug worth its own fix, but not one this snippet should paper " +
      "over by depending on a lever that does not work. Three plain rows sidestep the broken option " +
      "entirely and read just as clearly as a checklist would.",
    "`tabs.Tabs`, not `segmented.Segmented`: the two values here are full, DIFFERENT panels of " +
      "content (a different pitch, a different feature set, a different action, per audience), " +
      "which is `Tabs`'s own `useWhen` (\"sections-in-one-region\"); `Segmented` is for a single " +
      "value that changes what ONE piece of content reads, the shape `hero-with-pricing-toggle`'s " +
      "own notes use it for instead.",
    "`aria-label` (\"Elegí tu perfil\") on the `Tabs` host, not left implicit: this contract's own " +
      "a11y rule requires one whenever the tab list needs distinguishing from any other region on " +
      "the page, and a hero's own tab switcher has no visible page heading of its own to borrow one " +
      "from otherwise.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies) shells the whole " +
      "column, same reasoning as every other hero snippet.",
  ],
  tree: {
    contract: "hero",
    signature: "Hero",
    children: [
      {
        contract: "wrapper",
        signature: "Wrapper",
        children: [
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "lg", align: "start" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "display-sm", flush: true },
                children: "One system, built for every role.",
              },
              {
                contract: "tabs",
                signature: "Tabs",
                attrs: { "aria-label": "Choose your role" },
                options: { value: "design" },
                slots: {
                  items: [
                    {
                      options: { value: "design" },
                      slots: {
                        label: "For designers",
                        children: {
                          contract: "layout",
                          signature: "Stack",
                          options: { gap: "sm", align: "start" },
                          children: [
                            {
                              contract: "typography",
                              signature: "Text",
                              options: { tone: "secondary", size: "lg" },
                              children: "Ready-made components, tokens your design file already understands.",
                            },
                            {
                              contract: "layout",
                              signature: "Stack",
                              options: { gap: "xs", align: "start" },
                              children: [
                                featureRow("Every token round-trips to Figma, no hand-copied hex"),
                                featureRow("Visual regression coverage on every release"),
                                featureRow("One source of truth, not a screenshot someone forgot to update"),
                              ],
                            },
                            {
                              contract: "button",
                              signature: "Button.action",
                              options: { tone: "accent" },
                              children: "Browse components",
                            },
                          ],
                        },
                      },
                    },
                    {
                      options: { value: "dev" },
                      slots: {
                        label: "For developers",
                        children: {
                          contract: "layout",
                          signature: "Stack",
                          options: { gap: "sm", align: "start" },
                          children: [
                            {
                              contract: "typography",
                              signature: "Text",
                              options: { tone: "secondary", size: "lg" },
                              children: "Versioned contracts, with bindings for both Vanilla and React.",
                            },
                            {
                              contract: "layout",
                              signature: "Stack",
                              options: { gap: "xs", align: "start" },
                              children: [
                                featureRow("Full TypeScript coverage, source to bindings"),
                                featureRow("One contract, two runtimes, zero drift"),
                                featureRow("Every prop validated before it ships"),
                              ],
                            },
                            {
                              contract: "button",
                              signature: "Button.action",
                              options: { tone: "accent" },
                              children: "Read the docs",
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
