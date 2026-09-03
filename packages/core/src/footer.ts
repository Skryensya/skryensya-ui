import type { ComponentContract } from "./contract.js";
import type { BoxSurface, Space } from "./layout.js";

/*
 * FOOTER: the page's closing band, the thing a `<footer>` at document level already IS. A surface
 * of its own, room to breathe, and the `contentinfo` landmark that comes free with the element.
 * Nothing else.
 *
 * FREE ANATOMY, exactly like `Hero` (see `hero.ts` for the full argument). A footer's contents vary
 * far too much to fit one fixed shape: a docs site wants columns of navigation plus a legal line; a
 * marketing site wants a newsletter form and social links; a personal page wants one line of credit
 * and nothing more. So this owns no named "columns" part, no "bottom bar" slot, no "brand" slot.
 * You compose what the footer needs inside `children` with the pieces that already exist,
 * `layout.Grid` for the column row, `nav-list.NavList` for each column, `typography.Text` for the
 * legal line, `wrapper.Wrapper` to hold it all at the page's own measure. Three real compositions
 * this stays open to, all valid against the SAME contract below, ship as snippets
 * (`contracts/snippets/footer-*.ts`): a full site footer (column row + legal bar), a minimal
 * legal-only bar, and a two-tier footer with a brand block above a credit line.
 *
 * What IS fixed, because it's true of every footer regardless of contents:
 *   - It reads as a distinct band, separate from the content above it. `surface` defaults to
 *     `"sunken"` (not `"none"`, unlike `Box`): a footer that shares the page background reads as
 *     "more content", which is the one thing a footer is not. `sunken` is the quiet, recessed
 *     reading; `raised` would compete with the content it sits under for attention.
 *   - `divider` (default `true`): a hairline `border-block-start`. The rule between the last of the
 *     content and the start of the footer is what actually says "the page ends here" at a glance,
 *     even more than the surface tint does. A consumer who wants the tint alone opts out with
 *     `divider={false}` / `data-divider="false"`.
 *   - `padding` defaults to `"lg"` (not `"none"`): a footer crammed to its own content height reads
 *     as a stray strip, not as a considered close. One step down from `Hero`'s `"xl"`, a footer is
 *     an ending, not an opening moment.
 *
 * ACCESSIBILITY:
 *   - The host is a real `<footer>` element. At document level (not nested inside `article`,
 *     `aside`, `main`, `nav` or `section`) that element IS the `contentinfo` landmark with no
 *     `role` attribute needed, and a screen reader lists it alongside `banner` / `main` / the
 *     page's `nav`s. This contract never writes `role="contentinfo"`: the element carries it, and
 *     forcing the role would only create a second one the moment the footer is (correctly) nested.
 *   - There must be AT MOST ONE document-level `<footer>` per page, the same rule as `banner` /
 *     `main`. A footer that genuinely belongs to one `article` is still valid markup, it just is
 *     not the landmark, and that is the composer's call, not something this contract can see.
 *   - A column row inside is navigation: each column is a `nav-list.NavList` with its own
 *     accessible name (`aria-label` / a visible heading), so the page's landmark list gets
 *     "Footer / Recursos", "Footer / Legal", not one unnamed `navigation` per column. The contract
 *     cannot enforce that from here (`children` is free-form `node`), the snippets demonstrate it.
 *
 * Same `padding` / `surface` vocabulary as `Box` and `Hero` (same values, same attrs): a consumer
 * who knows one knows all three. Only the defaults differ, and they differ because a footer's whole
 * job is to close the page, not to disappear into it.
 */
export const footerParts = {
  footer: "sk-footer",
} as const;

export const footerContract = {
  id: "footer",
  css: "@skryensya/core/patterns/footer.css",
  parts: footerParts,

  options: {
    padding: {
      type: "enum",
      values: ["none", "xs", "sm", "md", "lg", "xl"],
      default: "lg",
      attr: "data-padding",
    },
    surface: {
      type: "enum",
      values: ["none", "sunken", "surface", "raised"],
      default: "sunken",
      attr: "data-surface",
    },
    /** The hairline `border-block-start`. Structure, on by default; the one thing that most reads
     *  as "the page ends here". */
    divider: { type: "boolean", default: true, attr: "data-divider", trueValue: "" },
  },

  signatures: {
    Footer: {
      intent: [
        "site-footer",
        "page-footer",
        "contentinfo-landmark",
        "colophon",
        "footer-navigation-block",
      ],
      host: { element: "footer" },
      options: ["padding", "surface", "divider"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "footer",
        part: "footer",
        host: true,
        slot: "children",
      },
      react: { from: "@skryensya/react/layout", name: "Footer" },
    },
  },
} as const satisfies ComponentContract;

export type FooterPadding = Space;
export type FooterSurface = BoxSurface;
