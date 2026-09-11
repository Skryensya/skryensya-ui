import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Layout demos shared by both locales, including the masonry-style multicolumn Grid. */

/** A surface with a heading, a line of prose and an action: the three things Box has to hold up. */
export const boxTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "lg" },
  children: [
    { contract: "typography", signature: "Heading", children: t("demo.box.title") },
    { contract: "typography", signature: "Text", children: t("demo.box.body") },
    { contract: "button", signature: "Button.action", children: t("demo.box.action") },
  ],
});

/**
 * FIVE real hero patterns, all valid against the SAME minimal contract (no anatomy of Hero's own
 * beyond `padding`/`surface`/`align`). Everything else in each is ordinary Stack/Heading/Text/Button
 * composition, mirroring `contracts/snippets/hero-*.ts`, the trees an agent actually reaches via
 * `get_examples`. The docs page renders all five so a person sees the same range an agent does.
 */

/*
 * Every pattern shells its content in `wrapper.Wrapper` with no `wrapperSize` given, so its own
 * default (`"md"`) applies: `Hero`'s own surface stays full-bleed, same as `Navbar`, but a headline
 * left to stretch that width reads as a stray sentence lost in the box rather than a deliberate
 * column matching the same measure the rest of the page's own main content already reads at.
 */

/** Pattern 1: a pitch, left-aligned, with a primary and a quieter secondary action. */
export const heroTree = (t: Translate): UsageTree => ({
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
          options: { gap: "md", align: "start" },
          children: [
            { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.title") },
            { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.body") },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm" },
              children: [
                { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.action") },
                { contract: "button", signature: "Button.action", options: { variant: "ghost" }, children: t("demo.hero.secondaryAction") },
              ],
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Pattern 2: centered, headline and sub-line only, no action at all. Also the one pattern in this
 * file that asks Hero for `surface: "raised"`: every other one here leaves Hero at its transparent
 * default, which meant nothing in the docs ever demonstrated the raised tier `--elevation-raised`
 * actually promises (confirmed missing live while auditing /elevacion's own "Dónde vive" table).
 */
export const heroCenteredTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  options: { align: "center", surface: "raised" },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm", align: "center" },
          children: [
            { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.centeredTitle") },
            { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.centeredBody") },
          ],
        },
      ],
    },
  ],
});

/** Pattern 3: a short accent-toned label above the headline. */
export const heroEyebrowTree = (t: Translate): UsageTree => ({
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
          options: { gap: "sm", align: "start" },
          children: [
            { contract: "badge", signature: "Badge", options: { tone: "accent" }, children: t("demo.hero.eyebrowLabel") },
            { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.eyebrowTitle") },
            { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.eyebrowBody") },
            { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.action") },
          ],
        },
      ],
    },
  ],
});

/** Pattern 4: the pitch beside a supporting screenshot, in the same wrapper measure as the rest. */
export const heroSplitTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "lg", inlineAlign: "center", wrap: false },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "md", align: "start" },
              children: [
                { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.splitTitle") },
                { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.splitBody") },
                { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.action") },
              ],
            },
            {
              contract: "image-frame",
              signature: "ImageFrame",
              options: {
                src: "https://picsum.photos/seed/product-screenshot/720/480",
                alt: t("demo.hero.splitImageAlt"),
                aspect: "3/2",
                radius: "surface",
              },
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Pattern 5: a centered pitch backed by a group of real avatars and a trust count. Replaces an
 * earlier stat-row pattern; see `contracts/snippets/hero-with-social-proof.ts`'s own notes for why
 * (the docs page never loaded `components/stat.css`, so every number rendered with zero styling,
 * and a KPI row is proof content a page earns AFTER the pitch, not something a hero's own three
 * seconds can establish on its own).
 */
export const heroSocialProofTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  options: { align: "center" },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "lg", align: "center" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm", align: "center" },
              children: [
                { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.proofTitle") },
                { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.proofBody") },
                { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.action") },
              ],
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm", inlineAlign: "center" },
              children: [
                {
                  contract: "avatar",
                  signature: "AvatarGroup",
                  slots: {
                    overflow: t("demo.hero.proofOverflow"),
                    children: [
                      { contract: "avatar", signature: "Avatar.initials", options: { name: t("demo.hero.proofName1") }, children: t("demo.hero.proofInitials1") },
                      { contract: "avatar", signature: "Avatar.initials", options: { name: t("demo.hero.proofName2") }, children: t("demo.hero.proofInitials2") },
                      { contract: "avatar", signature: "Avatar.initials", options: { name: t("demo.hero.proofName3") }, children: t("demo.hero.proofInitials3") },
                    ],
                  },
                },
                { contract: "typography", signature: "Text", options: { tone: "secondary", size: "sm" }, children: t("demo.hero.proofText") },
              ],
            },
          ],
        },
      ],
    },
  ],
});

/**
 * TEN more real hero patterns, added after the original five (see `contracts/snippets/hero-*.ts`
 * for the same trees, agent-facing): common shapes surveyed against real hero-section galleries
 * (Saaspo's own catalogue, browsed via web search: "Email CTA", "Logos", "Tabs" are all named
 * categories there, not invented here) plus a few less common but still useful ones. Same rule as
 * the first five: every pattern still validates against Hero's own minimal contract
 * (`padding`/`surface`/`align`), nothing here grew Hero's own anatomy.
 */

/**
 * Pattern 6: a waitlist pitch inside a full-width highlighted band, the pitch and the email field
 * balanced side by side. `box.Box` (`surface: "sunken"`), not `wrapper.Wrapper` alone: an earlier
 * version put the pitch and field in a plain column, same background as the rest of the hero, and
 * it read as one more paragraph rather than the one thing this hero wants a reader to do. The
 * `Box` spans the Hero's FULL width; `Wrapper` moves INSIDE it to center only the row of content
 * at the page's own main measure, so the band itself reads as a deliberate, page-width section
 * while the pitch and form still line up with the rest of the page. `justify: "between"` splits
 * the row (words on one side, the form on the other) instead of stacking it, so the band's own
 * width gets used rather than left mostly empty above a single narrow column.
 */
export const heroEmailCaptureTree = (t: Translate): UsageTree => ({
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
                    { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.emailTitle") },
                    { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.emailBody") },
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
                        label: t("demo.hero.emailFieldLabel"),
                        children: { contract: "input", signature: "Input", options: { type: "email", placeholder: t("demo.hero.emailPlaceholder") } },
                      },
                    },
                    { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.emailAction") },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

/** Pattern 7: a mobile app pitch, closing on the two store destinations that actually install it. */
export const heroAppBadgesTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  options: { align: "start" },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "md", align: "start" },
          children: [
            { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.appTitle") },
            { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.appBody") },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm", inlineAlign: "center", wrap: true },
              children: [
                { contract: "button", signature: "Button.navigation", options: { variant: "solid", href: "#app-store" }, children: t("demo.hero.appStoreLabel") },
                { contract: "button", signature: "Button.navigation", options: { variant: "solid", href: "#google-play" }, children: t("demo.hero.googlePlayLabel") },
              ],
            },
          ],
        },
      ],
    },
  ],
});

/** Pattern 8: a trust row of company wordmarks, read as names rather than a stat. */
export const heroLogoWallTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  options: { align: "center" },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "lg", align: "center" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm", align: "center" },
              children: [
                { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.logoWallTitle") },
                { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.logoWallBody") },
              ],
            },
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm", align: "center" },
              children: [
                { contract: "typography", signature: "Text", options: { tone: "tertiary", size: "sm", weight: "label" }, children: t("demo.hero.logoWallEyebrow") },
                {
                  contract: "layout",
                  signature: "Inline",
                  options: { gap: "lg", inlineAlign: "center", justify: "center", wrap: true },
                  children: ["ACME", "GLOBEX", "INITECH", "UMBRELLA"].map((name) => ({
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "tertiary", size: "lg", weight: "label" },
                    children: name,
                  })),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

/** Pattern 10: a pricing-led hero, a monthly/annual switch beside the number it actually changes. */
export const heroPricingToggleTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  options: { align: "center" },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "lg", align: "center" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm", align: "center" },
              children: [
                { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.pricingTitle") },
                { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.pricingBody") },
              ],
            },
            {
              contract: "segmented",
              signature: "Segmented",
              options: { value: "annual", label: t("demo.hero.pricingSegmentedLabel") },
              slots: {
                items: [
                  { options: { value: "monthly" }, slots: { label: t("demo.hero.pricingMonthlyLabel") } },
                  { options: { value: "annual" }, slots: { label: t("demo.hero.pricingAnnualLabel") } },
                ],
              },
            },
            { contract: "typography", signature: "Text", options: { tone: "primary", size: "lg", weight: "emphasis" }, children: t("demo.hero.pricingPrice") },
            { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.pricingAction") },
          ],
        },
      ],
    },
  ],
});

/** Pattern 11: a developer-tool hero, the pitch beside the exact command that gets someone running. */
export const heroCodePreviewTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "lg", inlineAlign: "center", wrap: false },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "md", align: "start" },
              children: [
                { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.codeTitle") },
                { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.codeBody") },
                { contract: "button", signature: "Button.navigation", options: { tone: "accent", href: "#docs" }, children: t("demo.hero.codeAction") },
              ],
            },
            {
              contract: "code-preview",
              signature: "CodePreview",
              slots: { label: "terminal", children: "pnpm add @skryensya/core @skryensya/react" },
            },
          ],
        },
      ],
    },
  ],
});

/** Pattern 13: a pitch that closes on watching the product work, a paused thumbnail and one action. */
export const heroVideoDemoTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  options: { align: "center" },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "lg", align: "center" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm", align: "center" },
              children: [
                { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.videoTitle") },
                { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.videoBody") },
              ],
            },
            { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.videoAction") },
            {
              contract: "image-frame",
              signature: "ImageFrame",
              options: { src: "https://picsum.photos/seed/video-demo-thumb/960/540", alt: t("demo.hero.videoImageAlt"), aspect: "16/9", radius: "surface" },
            },
          ],
        },
      ],
    },
  ],
});

/** A single checkmark + short phrase row, used by `heroAudienceTabsTree`'s two feature lists below. */
function heroFeatureRow(label: string): UsageTree {
  return {
    contract: "layout",
    signature: "Inline",
    options: { gap: "xs", inlineAlign: "center" },
    children: [
      { contract: "icon", signature: "Icon", options: { name: "check", size: "sm" } },
      { contract: "typography", signature: "Text", options: { size: "sm" }, children: label },
    ],
  };
}

/**
 * Pattern 14: one shared headline, a short feature list and action switching per audience below
 * it. Left-aligned (`Hero`'s own default, not `align: "center"`): confirmed live, centering a tab
 * switcher reads wrong here for two reasons a short centered hero does not run into. First,
 * `.sk-tabs__list`'s own underline runs the full width of whichever panel happens to be widest,
 * not the width of the two labels sitting on it, so a centered `Hero` draws that line visibly off-
 * center from its own labels. Second, a feature list reads left-to-right as a scannable list of
 * facts; centered text turns a list into a ragged block instead. Each panel is the SAME shape (one
 * line of pitch, exactly three feature rows, one button): confirmed live, switching `Tabs` unmounts
 * one panel and mounts the other, so two panels of different heights make the page's own content
 * below the hero visibly jump the instant a reader switches (a real, measurable layout shift, not
 * a hypothetical one). Matching the shape exactly, not approximately, keeps that jump effectively
 * at zero.
 *
 * Each feature row is a plain `layout.Inline` (`Icon` "check" + `Text`), not `list.List`/
 * `ListItem`: tried first, `List`'s own `dividers` option turned out not to be wired to its `List`
 * signature at all (`get_contract("list")`'s own `List.options` is only `["density"]`), so
 * `dividers: false` did nothing, every row still drew its divider. `validate_ui` still accepted the
 * tree: confirmed separately that it does not check options on content nested inside a
 * `Tabs.items[].slots.children` panel the way it does everywhere else, which is how the invalid
 * option passed silently. Three plain rows sidestep the broken lever entirely.
 */
export const heroAudienceTabsTree = (t: Translate): UsageTree => ({
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
            { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.tabsTitle") },
            {
              contract: "tabs",
              signature: "Tabs",
              attrs: { "aria-label": t("demo.hero.tabsAriaLabel") },
              options: { value: "design" },
              slots: {
                items: [
                  {
                    options: { value: "design" },
                    slots: {
                      label: t("demo.hero.tabsDesignLabel"),
                      children: {
                        contract: "layout",
                        signature: "Stack",
                        options: { gap: "sm", align: "start" },
                        children: [
                          { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.tabsDesignBody") },
                          {
                            contract: "layout",
                            signature: "Stack",
                            options: { gap: "xs", align: "start" },
                            children: [
                              heroFeatureRow(t("demo.hero.tabsDesignFeature1")),
                              heroFeatureRow(t("demo.hero.tabsDesignFeature2")),
                              heroFeatureRow(t("demo.hero.tabsDesignFeature3")),
                            ],
                          },
                          { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.tabsDesignAction") },
                        ],
                      },
                    },
                  },
                  {
                    options: { value: "dev" },
                    slots: {
                      label: t("demo.hero.tabsDevLabel"),
                      children: {
                        contract: "layout",
                        signature: "Stack",
                        options: { gap: "sm", align: "start" },
                        children: [
                          { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.tabsDevBody") },
                          {
                            contract: "layout",
                            signature: "Stack",
                            options: { gap: "xs", align: "start" },
                            children: [
                              heroFeatureRow(t("demo.hero.tabsDevFeature1")),
                              heroFeatureRow(t("demo.hero.tabsDevFeature2")),
                              heroFeatureRow(t("demo.hero.tabsDevFeature3")),
                            ],
                          },
                          { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.hero.tabsDevAction") },
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
});

/**
 * Pattern 15: a pull-quote hero, one testimonial standing in for a pitch of its own. The quote is
 * the `Heading` itself (`headingSize: "h1"`), not a plain `Text`: an earlier version used large
 * `Text` on the theory that quoting someone else's words was a deliberate exception to Hero's own
 * "a real heading always inside" rule. It was not; that rule reads exactly that shape as the
 * mistake it names, and it looked the part too, a quote at plain body size read as a caption under
 * an empty hero, not as the thing the hero opens with. `h1` rather than `display-sm`: the other
 * patterns' short titles carry the biggest display size without wrapping; a whole quoted sentence
 * at that size would wrap across three or four lines and read as shouting.
 */
export const heroTestimonialTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  options: { align: "center" },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "lg", align: "center" },
          children: [
            { contract: "typography", signature: "Heading", options: { headingSize: "h1", flush: true }, children: t("demo.hero.testimonialQuote") },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm", inlineAlign: "center" },
              children: [
                { contract: "avatar", signature: "Avatar.initials", options: { size: "lg", name: t("demo.hero.testimonialName") }, children: "JC" },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "none", align: "start" },
                  children: [
                    { contract: "typography", signature: "Text", options: { size: "sm", weight: "emphasis" }, children: t("demo.hero.testimonialName") },
                    { contract: "typography", signature: "Text", options: { tone: "secondary", size: "sm" }, children: t("demo.hero.testimonialRole") },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

/** A short status summary with a locale-owned destination. */
export const stackTree = (t: Translate, href: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "start" },
  attrs: { "aria-labelledby": "stack-demo-title" },
  children: [
    {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h2" },
      attrs: { id: "stack-demo-title" },
      children: t("demo.stack.title"),
    },
    { contract: "typography", signature: "Text", children: t("demo.stack.body") },
    {
      contract: "typography",
      signature: "Link",
      options: { href },
      children: t("demo.stack.action"),
    },
  ],
});

/** A project summary and its actions, composed from the three flow primitives. */
export const inlineTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "lg" },
  attrs: { "aria-labelledby": "project-title" },
  children: {
    contract: "layout",
    signature: "Inline",
    options: { gap: "md", inlineAlign: "center", justify: "between" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "none" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h4" },
            attrs: { id: "project-title" },
            children: t("demo.inline.title"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", tone: "secondary" },
            children: t("demo.inline.status"),
          },
        ],
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", wrap: false },
        children: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost" },
            children: t("demo.inline.preview"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { tone: "accent" },
            children: t("demo.inline.publish"),
          },
        ],
      },
    ],
  },
});

/** Two cards of different copy lengths; `blockStart: "auto"` pins both action rows to the floor. */
export const inlineCardFloorTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "md" },
  attrs: { "aria-label": t("inlinePage.floorPreviewLabel") },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "raised", border: "subtle", padding: "lg" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "xs" },
          children: [
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h4", flush: true },
              children: t("demo.inline.floorShortTitle"),
            },
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.inline.floorShortBody"),
            },
          ],
        },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", blockStart: "auto" },
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "ghost" },
              children: t("demo.inline.floorSecondary"),
            },
            {
              contract: "button",
              signature: "Button.action",
              options: { tone: "accent" },
              children: t("demo.inline.floorPrimary"),
            },
          ],
        },
      ],
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "raised", border: "subtle", padding: "lg" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "xs" },
          children: [
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h4", flush: true },
              children: t("demo.inline.floorLongTitle"),
            },
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.inline.floorLongBody"),
            },
          ],
        },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", blockStart: "auto" },
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "ghost" },
              children: t("demo.inline.floorSecondary"),
            },
            {
              contract: "button",
              signature: "Button.action",
              options: { tone: "accent" },
              children: t("demo.inline.floorPrimary"),
            },
          ],
        },
      ],
    },
  ],
});

/**
 * A raised summary beside a three-column grid: the layout + typography vocabulary on one stage.
 * Locale-owned destination comes from the page.
 */
export const primitivesTree = (t: Translate, href: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "raised", border: "subtle", padding: "lg" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "sm" },
            children: t("demo.primitives.title"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { tone: "secondary" },
            children: t("demo.primitives.body"),
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "baseline" },
            children: [
              {
                contract: "typography",
                signature: "Link",
                options: { href },
                children: t("demo.primitives.action"),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "caption" },
                children: t("demo.primitives.updated"),
              },
            ],
          },
        ],
      },
    },
    {
      contract: "layout",
      signature: "Grid",
      options: { columns: "3", gap: "md" },
      children: [
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.first"),
        },
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.second"),
        },
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", border: "subtle", padding: "md" },
          children: t("demo.primitives.cell.third"),
        },
      ],
    },
  ],
});

/** Three equal columns of project cards. Product names stay written. */
export const gridTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  attrs: { "aria-label": t("demo.grid.label") },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Atlas",
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Brisa",
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: "Cauce",
    },
  ],
});

/**
 * One card per named width, in the same order the page's own bullet list explains them: narrow,
 * content (the default, so its own child carries no `data-width`), breakout, full-width. Real
 * children throughout. Box and Text, the same contracts every other demo on the site composes
 * with, so what this teaches is exactly what a reader can compose themselves, unlike a page-local
 * mockup with no contract behind it. No heading: the preview's own label already names it, and the
 * page's prose right below carries the same words a heading here would only repeat.
 */
export const layoutGridTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [
    {
      contract: "box",
      signature: "Box",
      attrs: { "data-width": "narrow" },
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: t("demo.layoutGrid.narrow"),
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "md" },
      children: t("demo.layoutGrid.content"),
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { "data-width": "breakout" },
      options: { surface: "raised", border: "subtle", padding: "lg" },
      children: t("demo.layoutGrid.breakout"),
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { "data-width": "full-width" },
      /* No `padding` (defaults to "none"): a full-bleed band's BACKGROUND has to reach the true
         edge, and the box's own inline padding was fighting the nested content-track inset that
         already keeps the LABEL readable. The two together read as a band with a stray extra
         margin on top of its normal one. Vertical breathing room instead comes from the scoped
         `padding-block` rule in the preview's own CSS (LayoutGridPage.astro), which only touches
         this one box rather than every Box on the page.
         `surface: "raised"` still marks it correctly (`data-surface="raised"`), but that token
         alone reads as flat white next to the page's own canvas in light mode. The same
         near-invisible pairing the stack demo hit earlier. The preview's CSS repaints it with an
         actually visible tint; the attribute stays honest about what the box IS regardless. */
      options: { surface: "raised" },
      /* A `full-width` child becomes its OWN nested `sk-layout-grid` (layout.css), so ITS children
         need the same default placement rule any other layout-grid content gets, which only ever
         matches real elements, not a bare text node. A plain string here left the label with no
         `content-start`/`content-end` assignment at all, so it fell back to grid auto-placement's
         narrowest available track instead of the width the box is meant to demonstrate. */
      children: {
        contract: "typography",
        signature: "Text",
        children: t("demo.layoutGrid.fullWidth"),
      },
    },
  ],
});

/**
 * Rail compositions, kept to the SAME vocabulary as the width-levels demo above: plain Box
 * children, one unlabeled (content measure) and one or two with \`data-width="rail"\` /
 * \`"rail-start"\`. \`sk-layout-grid\`'s own PUBLISHED rail capability
 * (\`packages/core/css/patterns/layout.css\`), not page-local CSS. No real \`/componentes/toc\`
 * composition here: this section teaches the GRID's rail mechanism, not Toc's own anatomy.
 *
 * Three trees, one per placement the pattern actually publishes: after the content (\`rail\`),
 * before it (\`rail-start\`), and both at once in the same grid.
 */
function layoutGridRailBox(
  t: Translate,
  role: "content" | "rail" | "rail-start",
): UsageTree {
  const copy = {
    content: t("demo.layoutGridRail.content"),
    rail: t("demo.layoutGridRail.rail"),
    "rail-start": t("demo.layoutGridRail.railStart"),
  } as const;
  return {
    contract: "box",
    signature: "Box",
    attrs: role === "content" ? { "data-role": "main" } : { "data-width": role, "data-role": role },
    options: { padding: "lg", surface: "surface", border: "subtle" },
    children: copy[role],
  };
}

export const layoutGridTocTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [layoutGridRailBox(t, "content"), layoutGridRailBox(t, "rail")],
});

export const layoutGridRailStartTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [layoutGridRailBox(t, "rail-start"), layoutGridRailBox(t, "content")],
});

export const layoutGridRailsBothTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "LayoutGrid",
  children: [
    layoutGridRailBox(t, "rail-start"),
    layoutGridRailBox(t, "content"),
    layoutGridRailBox(t, "rail"),
  ],
});

export const gridMulticolTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", multicol: true },
  attrs: { "aria-label": t("demo.grid.label") },
  children: ["Atlas", "Brisa", "Cauce", "Delta", "Estuario", "Faro", "Greda", "Hiedra"].map(
    (name, index) => ({
      contract: "box",
      signature: "Box",
      options: {
        surface: index % 2 === 0 ? "raised" : "surface",
        border: "subtle",
        padding: index % 3 === 0 ? "lg" : "md",
      },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Text",
            options: { weight: "label" },
            children: name,
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", tone: "secondary" },
            children: `${index + 1}`,
          },
        ],
      },
    }),
  ),
});

/**
 * Same lane progression as `data-multicol`, but real CSS Grid rows: every row's height matches
 * its tallest cell, and Atlas opts into a wider footprint with `data-span="2"` instead of an
 * independent column height. `data-span` has no contract option (it lives on the CHILD, not the
 * Grid), so it travels as a raw `attrs` passthrough, the same channel `aria-label`/`id` use.
 */
export const gridResponsiveTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", responsive: true },
  attrs: { "aria-label": t("demo.grid.label") },
  children: ["Atlas", "Brisa", "Cauce", "Delta", "Estuario"].map((name, index) => ({
    contract: "box",
    signature: "Box",
    options: {
      surface: index === 0 ? "raised" : "surface",
      border: "subtle",
      padding: index === 0 ? "lg" : "md",
    },
    ...(index === 0 ? { attrs: { "data-span": "2" } } : {}),
    children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          options: { weight: "label" },
          children: name,
        },
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          children: index === 0 ? t("grid.responsiveFeaturedLabel") : `${index + 1}`,
        },
      ],
    },
  })),
});

/*
 * FOOTER demos. Footer owns no anatomy of its own beyond `padding`/`surface`/`divider` (see
 * `packages/core/src/footer.ts`): everything below is ordinary Wrapper/Grid/Stack/Text/Link
 * composition inside its `children`, the same way the hero patterns above compose inside Hero.
 * Mirrors `contracts/snippets/footer-credit-line.ts`, the tree an agent reaches via `get_examples`.
 */

/** A full site footer: a row of link columns over a legal line. `Wrapper` holds it at the page's
 *  own measure; `Grid` gives the columns; each column is a `Stack` of `Link`s under a heading. */
export const footerColumnsTree = (t: Translate, href: string): UsageTree => ({
  contract: "footer",
  signature: "Footer",
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "lg" },
          children: [
            {
              contract: "layout",
              signature: "Grid",
              options: { columns: "3", gap: "lg" },
              children: [
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "sm" },
                  children: [
                    { contract: "typography", signature: "Heading", options: { headingSize: "h5", flush: true }, children: t("demo.footer.colProduct") },
                    { contract: "typography", signature: "Link", options: { href }, children: t("demo.footer.linkOverview") },
                    { contract: "typography", signature: "Link", options: { href }, children: t("demo.footer.linkChangelog") },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "sm" },
                  children: [
                    { contract: "typography", signature: "Heading", options: { headingSize: "h5", flush: true }, children: t("demo.footer.colResources") },
                    { contract: "typography", signature: "Link", options: { href }, children: t("demo.footer.linkDocs") },
                    { contract: "typography", signature: "Link", options: { href }, children: t("demo.footer.linkRepo") },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "sm" },
                  children: [
                    { contract: "typography", signature: "Heading", options: { headingSize: "h5", flush: true }, children: t("demo.footer.colLegal") },
                    { contract: "typography", signature: "Link", options: { href }, children: t("demo.footer.linkLicense") },
                    { contract: "typography", signature: "Link", options: { href }, children: t("demo.footer.linkPrivacy") },
                  ],
                },
              ],
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm", justify: "between", inlineAlign: "center", wrap: true },
              children: [
                { contract: "typography", signature: "Text", options: { tone: "tertiary", size: "sm" }, children: t("demo.footer.legal") },
                { contract: "typography", signature: "Text", options: { tone: "tertiary", size: "sm" }, children: t("demo.footer.built") },
              ],
            },
          ],
        },
      ],
    },
  ],
});

/** The whole footer is one line of credit: a personal or portfolio page's close. Mirrors the
 *  `footer-credit-line` snippet. */
export const footerCreditTree = (t: Translate): UsageTree => ({
  contract: "footer",
  signature: "Footer",
  options: { padding: "md" },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      children: [
        { contract: "typography", signature: "Text", options: { tone: "tertiary", size: "sm" }, children: t("demo.footer.credit") },
      ],
    },
  ],
});
