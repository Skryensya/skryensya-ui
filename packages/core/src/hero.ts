import type { ComponentContract } from "./contract.js";
import type { BoxSurface, Space } from "./layout.js";

/*
 * HERO: the page's own opening moment, distinguished from the sections that follow it by a surface
 * of its own and generous vertical room. Nothing more.
 *
 * MINIMAL ON PURPOSE, still. This does not own a headline, a sub-line or a call-to-action: those
 * stay `typography.Heading`/`Text` and `button.Button` composed inside, same as any other section. A
 * hero's content varies too much (a product pitch, a portfolio one-liner, a split layout with a
 * screenshot, a login screen's own welcome) to fit one fixed anatomy, and forcing named slots onto it
 * would mean rejecting valid heroes that don't happen to have all of them. Five real compositions
 * this stays open to, all valid against the SAME contract below, are published as snippets
 * (`contracts/snippets/hero-*.ts`): a left-aligned pitch with two actions, a centered minimal
 * headline with no actions at all, a small "eyebrow" label above the headline, a split layout with a
 * screenshot beside the text, and a centered pitch backed by a group of avatars and a trust count.
 * "Free" was never "unclear": it means the anatomy varies while the SURFACE, the accessible-name
 * expectations and the content limits (below) do not.
 *
 * What IS fixed, because it's true of every hero regardless of content:
 *   - It reads as a distinct block. `surface` defaults to `"surface"` (not `"none"`, unlike `Box`)
 *     and `padding` defaults to `"xl"` (not `"none"`), so a hero a consumer forgot to configure still
 *     looks like one, rather than defaulting to invisible the way a generic `Box` correctly does for
 *     ITS use case.
 *   - `align` (new): most heroes read one of two ways, content pinned to the start edge (the common
 *     shape once a hero sits beside other left-aligned page content) or centered (the shape a
 *     standalone, no-visual-neighbor hero, a portfolio, a login screen, an empty state, reads best
 *     in). Both are real, common shapes; this is a visual lever, not new anatomy, the same way
 *     `layout.Inline`'s own `align` option is a lever and not a slot.
 *
 * CONTENT RULES (enforced by convention and by example, not by the schema, since `children` has to
 * stay `accepts: "node"` for a hero to compose freely, see below):
 *   - Exactly one REAL heading inside, always. Not styled-large text: an actual `typography.Heading`.
 *     If this hero opens the whole page, that heading IS the page's own `<h1>`; if it opens a section
 *     mid-page, it is that section's own heading, at whatever level nesting already puts it at.
 *     `Heading`'s host stays `<h2>` regardless of visual `size` (`get_contract`'s own `host.element`),
 *     so a big `display-sm` hero heading never silently claims the page's h1 slot by accident.
 *   - At most ONE primary action, plus at most one quieter secondary action. A hero's whole job is to
 *     point at ONE next step; a row of equal-weight buttons undoes that.
 *   - Any image inside is either genuinely informative (a real `alt`, `ImageFrame`'s own a11y rule
 *     already requires one whenever `src` is given) or purely decorative (`alt=""`), never a stand-in
 *     for the headline's own text.
 *
 * ACCESSIBILITY RULES:
 *   - `Hero`'s own host is a plain, non-landmark `div` (`div`/`section`/whatever in vanilla; `as` in
 *     React) ON PURPOSE: most pages have exactly one hero, and giving it a `role="region"` landmark
 *     with no name would just be one more stop a screen-reader's landmark list has to skip past.
 *   - It becomes a landmark ONLY if the composer explicitly turns it into one (`as="section"` in
 *     React, or authoring `<section>` by hand in HTML). The moment it is one, WAI's own rule for
 *     an UNNAMED landmark applies: give it `aria-label` or `aria-labelledby` pointing at the heading
 *     inside, the same as any other named landmark region a page happens to have more than one of.
 *   - `Hero` cannot enforce "there is a real heading inside" or "the image has real alt text"
 *     structurally: `children` accepts free-form content, the same reason it has no fixed anatomy.
 *     What it CAN enforce, and does, are its own options (`padding`/`surface`/`align`) via the usual
 *     schema; the content rules above are enforced by every published snippet demonstrating them, not
 *     by a check this composition could silently dodge by shaping the tree differently.
 *
 * Same `padding`/`surface` vocabulary as `Box` (same values, same attrs): a consumer who already
 * knows Box's options already knows Hero's; only the defaults differ, and differ because a hero's
 * whole job is to NOT read like ordinary content by default.
 */
export const heroParts = {
  hero: "sk-hero",
} as const;

export type HeroAlign = "start" | "center";

export const heroContract = {
  id: "hero",
  css: "@skryensya/core/patterns/hero.css",
  parts: heroParts,

  options: {
    padding: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl"], default: "xl", attr: "data-padding" },
    surface: { type: "enum", values: ["none", "sunken", "surface", "raised"], default: "surface", attr: "data-surface" },
    align: { type: "enum", values: ["start", "center"], default: "start", attr: "data-align" },
  },

  signatures: {
    Hero: {
      intent: ["page-intro", "banner", "landing-page-opener", "primary-call-to-action-block"],
      host: { element: "div" },
      options: ["padding", "surface", "align"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "hero", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Hero" },
    },
  },
} as const satisfies ComponentContract;

export type HeroPadding = Space;
export type HeroSurface = BoxSurface;
