import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * MARKETING LANDING. The "sitio público" shape: a document a stranger scrolls top to bottom, not
 * an application someone logs into. What that changes, template to template:
 *
 *   - the page SCROLLS (`.page-shell`, site.css), so the frame is a viewport and the content runs
 *     past it, rather than an app shell whose panes each scroll inside a fixed screen;
 *   - the copy is measured (`Wrapper`), because a line of prose at 1440px is unreadable while an
 *     application's work area legitimately fills its pane; and
 *   - the nav's last item is a CTA `Button`, not a destination. This is the one place on the page
 *     where the accent is spent.
 *
 * Everything below is a published signature. Nothing here draws its own box.
 */

const navLink = (label: string, href: string, current = false): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  children: label,
});

/** A feature cell: a glyph, the claim as a heading, and one sentence under it. */
const feature = (icon: string, title: string, body: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "lg" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      { contract: "icon", signature: "Icon", options: { name: icon, size: "lg" } },
      {
        contract: "typography",
        signature: "Heading",
        options: { headingSize: "h4", flush: true },
        children: title,
      },
      {
        contract: "typography",
        signature: "Text",
        options: { size: "sm", tone: "secondary" },
        children: body,
      },
    ],
  },
});

/*
 * The proof band's numbers are `Stat`, not hand-set Headings: a figure with a label above it and a
 * delta beside it is exactly what that contract names, and using it here means the band inherits the
 * same tabular figures and trend colours the dashboard's own numbers get.
 */
const proof = (label: string, value: string): UsageTree => ({
  contract: "stat",
  signature: "Stat",
  slots: { label, value },
});

export const marketingTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Lumen" },
        {
          contract: "nav-list",
          signature: "NavList",
          options: { orientation: "horizontal" },
          attrs: { "aria-label": t("demo.marketing.nav") },
          children: {
            contract: "nav-list",
            signature: "NavListGroup",
            children: [
              navLink(t("demo.marketing.navProduct"), "#producto", true),
              navLink(t("demo.marketing.navPricing"), "#precios"),
              navLink(t("demo.marketing.navCustomers"), "#clientes"),
              navLink(t("demo.marketing.navDocs"), "#docs"),
            ],
          },
        },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "ghost" },
              children: t("demo.marketing.signIn"),
            },
            {
              contract: "button",
              signature: "Button.action",
              options: { tone: "accent" },
              children: t("demo.marketing.cta"),
            },
          ],
        },
      ],
    },
    {
      contract: "box",
      signature: "Box",
      attrs: { class: "page-shell" },
      children: {
        contract: "layout",
        signature: "Main",
        attrs: { class: "page-shell__main" },
        children: {
          contract: "wrapper",
          signature: "Wrapper",
          options: { wrapperSize: "lg" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xl" },
            children: [
              /*
               * HERO. The eyebrow is a `Badge`, not a `Tag`, and the catalogue draws that line
               * itself: a Tag is something the reader can REMOVE (an applied filter, a keyword),
               * and `Tag.avoidWhen` sends exactly this case away: "it is just a count or a state
               * nobody can touch; that is a Badge". A release marker is read, never dismissed.
               * Both render as a capsule, which is precisely why picking by appearance gets it
               * wrong: the difference is whether it can be acted on.
               */
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "md", align: "start" },
                children: [
                  {
                    contract: "badge",
                    signature: "Badge",
                    options: { tone: "accent" },
                    children: t("demo.marketing.heroTag"),
                  },
                  {
                    contract: "typography",
                    signature: "Heading",
                    options: { headingSize: "display-md", flush: true },
                    children: t("demo.marketing.heroTitle"),
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "lg", tone: "secondary" },
                    children: t("demo.marketing.heroBody"),
                  },
                  {
                    contract: "layout",
                    signature: "Inline",
                    options: { gap: "sm" },
                    children: [
                      {
                        contract: "button",
                        signature: "Button.action",
                        options: { tone: "accent", size: "lg" },
                        children: t("demo.marketing.heroPrimary"),
                      },
                      {
                        contract: "button",
                        signature: "Button.action",
                        options: { variant: "ghost", size: "lg" },
                        children: t("demo.marketing.heroSecondary"),
                      },
                    ],
                  },
                ],
              },
              {
                contract: "layout",
                signature: "Grid",
                options: { columns: "3", gap: "md", multicol: true },
                children: [
                  feature(
                    "settings",
                    t("demo.marketing.feature1Title"),
                    t("demo.marketing.feature1Body"),
                  ),
                  feature(
                    "success",
                    t("demo.marketing.feature2Title"),
                    t("demo.marketing.feature2Body"),
                  ),
                  feature(
                    "refresh",
                    t("demo.marketing.feature3Title"),
                    t("demo.marketing.feature3Body"),
                  ),
                ],
              },
              {
                contract: "box",
                signature: "Box",
                options: { surface: "sunken", border: "subtle", padding: "lg" },
                children: {
                  contract: "layout",
                  signature: "Grid",
                  options: { columns: "3", gap: "md", multicol: true },
                  attrs: { "aria-label": t("demo.marketing.proofLabel") },
                  children: [
                    proof(t("demo.marketing.proof1Label"), t("demo.marketing.proof1Value")),
                    proof(t("demo.marketing.proof2Label"), t("demo.marketing.proof2Value")),
                    proof(t("demo.marketing.proof3Label"), t("demo.marketing.proof3Value")),
                  ],
                },
              },
              /*
               * CLOSING CTA. `align: center` on the Stack, not a text-align override: the button is
               * a box and the heading is a box, and centring the FLOW is what puts both on the same
               * axis without either of them knowing about the other.
               */
              {
                contract: "box",
                signature: "Box",
                options: { surface: "raised", border: "subtle", padding: "xl" },
                children: {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "md", align: "center" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "h2", flush: true },
                      children: t("demo.marketing.ctaTitle"),
                    },
                    {
                      contract: "typography",
                      signature: "Text",
                      options: { tone: "secondary" },
                      children: t("demo.marketing.ctaBody"),
                    },
                    {
                      contract: "button",
                      signature: "Button.action",
                      options: { tone: "accent", size: "lg" },
                      children: t("demo.marketing.cta"),
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  ],
});
