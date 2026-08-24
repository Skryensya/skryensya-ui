import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * ANALYTICS DASHBOARD — the SaaS back-office shape. It shares the app shell with `app-shell.ts`;
 * what it adds is the thing that shell was deliberately left empty to make room for: a work area
 * with a real information hierarchy — a KPI row you read in one glance, then the table you actually
 * work in, then its pager.
 *
 * Two choices worth naming, because both have an obvious wrong answer:
 *
 *   - the KPI row is `Stat`, not four Boxes with big text in them. Stat owns the tabular figures
 *     (so the numbers line up column-wise), the trend colour AND the non-colour arrow that keeps
 *     "up" legible without it.
 *   - the table is `TableScroll` + `stickyHeader`, not a bare `Table`. A data table inside a pane
 *     that already scrolls needs its own scroll container or its header leaves with the page.
 *
 * The KPI row is `multicol`, which is Grid's own published reflow (1 → 2 → 3 → 4 across the kit's
 * breakpoints, layout.css). Without it `data-columns="4"` is literally `repeat(4, minmax(0, 1fr))`
 * and never reflows: measured at a 900px viewport, the four cards were 43px wide each, which is not
 * a narrow dashboard so much as an unreadable one. With it they were 73px.
 *
 * That is an improvement, not a fix, and the reason is worth writing down: those breakpoints are
 * `@media`, so they read the VIEWPORT, while this row lives inside a pane that is much narrower —
 * the docs rail, then the template's own sidebar. The kit publishes no container query (grepped:
 * zero `@container` rules in core), so a template cannot currently reflow on the space it actually
 * has. Closing that gap means adding container support to the layout pattern, which is a contract
 * change and belongs in its own piece of work, not smuggled in as docs-local CSS here.
 */

const navLink = (
  label: string,
  icon: string,
  href: string,
  current = false,
  trailing?: string,
): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: icon } },
    ...(trailing ? { trailing } : {}),
    children: label,
  },
});

const kpi = (
  label: string,
  value: string,
  change: string,
  trend: "up" | "down",
): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  children: {
    contract: "stat",
    signature: "Stat",
    options: { trend },
    slots: {
      label,
      value,
      change: [
        {
          contract: "icon",
          signature: "Icon",
          options: { name: trend === "up" ? "arrow-up" : "arrow-down", size: "sm" },
        },
        change,
      ],
    },
  },
});

/** One order: id, customer, a `Badge` for state, and a right-aligned amount. */
const row = (
  id: string,
  customer: string,
  state: string,
  tone: "success" | "warning" | "neutral",
  amount: string,
): UsageTree => ({
  contract: "table",
  signature: "TableRow",
  children: [
    {
      contract: "table",
      signature: "TableHeader",
      options: { scope: "row" },
      children: id,
    },
    { contract: "table", signature: "TableCell", children: customer },
    {
      contract: "table",
      signature: "TableCell",
      children: { contract: "badge", signature: "Badge", options: { tone }, children: state },
    },
    { contract: "table", signature: "TableCell", children: amount },
  ],
});

export const dashboardTree = (t: Translate, locale: "es" | "en"): UsageTree => {
  const money = (amount: string) => (locale === "es" ? `${amount} €` : `$${amount}`);
  return {
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
            contract: "navbar",
            signature: "NavbarActions",
            children: [
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "subtle" },
                children: [
                  { contract: "icon", signature: "Icon", options: { name: "download", size: "sm" } },
                  t("demo.dashboard.export"),
                ],
              },
              /*
               * `name` is the ACCESSIBLE name; the letters on screen are `children`. They are two
               * separate things on purpose — "HP" is not what anyone should hear read aloud — and
               * leaving the children off renders a correctly-labelled but visibly empty circle.
               */
              {
                contract: "avatar",
                signature: "Avatar.initials",
                options: { name: "Helena Park", size: "sm" },
                children: "HP",
              },
            ],
          },
        ],
      },
      {
        contract: "box",
        signature: "Box",
        attrs: { class: "app-shell" },
        children: [
          {
            contract: "sidebar",
            signature: "Sidebar",
            attrs: { id: "dashboard-template-sidebar" },
            children: [
              /*
               * NOT `floating`. The floating trigger is an overlay pinned to the rail's outer edge,
               * which works in `app-shell.ts` only because that template's `main` is empty — here it
               * lands on top of the work area's own first line (measured: straight through the
               * "Resumen" heading). In flow it takes a row of the rail and collides with nothing.
               */
              {
                contract: "sidebar",
                signature: "SidebarHeader",
                children: {
                  contract: "sidebar",
                  signature: "SidebarTrigger",
                  options: { label: t("demo.dashboard.collapse") },
                  slots: {
                    icon: { contract: "icon", signature: "Icon", options: { name: "chevron-left" } },
                  },
                },
              },
              {
                contract: "sidebar",
                signature: "SidebarContent",
                children: {
                  contract: "nav-list",
                  signature: "NavList",
                  attrs: { "aria-label": t("demo.dashboard.navigation") },
                  children: [
                    {
                      contract: "nav-list",
                      signature: "NavListGroup",
                      slots: {
                        label: t("demo.dashboard.groupAnalyze"),
                        children: [
                          navLink(t("demo.dashboard.navOverview"), "info", "#resumen", true),
                          navLink(t("demo.dashboard.navOrders"), "file", "#pedidos", false, "24"),
                          navLink(t("demo.dashboard.navCustomers"), "user", "#clientes"),
                        ],
                      },
                    },
                    {
                      contract: "nav-list",
                      signature: "NavListGroup",
                      slots: {
                        label: t("demo.dashboard.groupManage"),
                        children: [
                          navLink(t("demo.dashboard.navReports"), "calendar", "#informes"),
                          navLink(t("demo.dashboard.navSettings"), "settings", "#ajustes"),
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
          {
            contract: "layout",
            signature: "Main",
            attrs: { class: "app-shell__main" },
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "lg" },
              children: [
                {
                  contract: "layout",
                  signature: "Inline",
                  options: { gap: "md", justify: "between", inlineAlign: "center" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "h2", flush: true },
                      children: t("demo.dashboard.title"),
                    },
                    /*
                     * A range picker, and `Segmented` is what its own `useWhen` describes: three
                     * mutually exclusive options that fit on one row, changing a VIEW rather than a
                     * value the form submits. Both halves matter — past three or four options this
                     * would owe a Select, and a value that posted with a form would owe a
                     * RadioGroup.
                     */
                    {
                      contract: "segmented",
                      signature: "Segmented",
                      options: { value: "30d", label: t("demo.dashboard.rangeLabel") },
                      slots: {
                        items: [
                          { options: { value: "7d" }, slots: { label: t("demo.dashboard.range7") } },
                          {
                            options: { value: "30d" },
                            slots: { label: t("demo.dashboard.range30") },
                          },
                          {
                            options: { value: "90d" },
                            slots: { label: t("demo.dashboard.range90") },
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Grid",
                  options: { columns: "4", gap: "md", multicol: true },
                  attrs: { "aria-label": t("demo.dashboard.kpiLabel") },
                  children: [
                    kpi(t("demo.dashboard.kpiRevenue"), money("48.200"), "12,5%", "up"),
                    kpi(t("demo.dashboard.kpiOrders"), "1.204", "8,2%", "up"),
                    kpi(t("demo.dashboard.kpiCustomers"), "318", "4,1%", "up"),
                    kpi(t("demo.dashboard.kpiRefunds"), "0,9%", "0,3", "down"),
                  ],
                },
                {
                  contract: "table",
                  signature: "TableScroll",
                  options: { stickyHeader: true },
                  children: {
                    contract: "table",
                    signature: "Table",
                    children: [
                      {
                        contract: "table",
                        signature: "TableCaption",
                        children: t("demo.dashboard.tableCaption"),
                      },
                      {
                        contract: "table",
                        signature: "TableHead",
                        children: {
                          contract: "table",
                          signature: "TableRow",
                          children: [
                            {
                              contract: "table",
                              signature: "TableHeader",
                              children: t("demo.dashboard.colId"),
                            },
                            {
                              contract: "table",
                              signature: "TableHeader",
                              children: t("demo.dashboard.colCustomer"),
                            },
                            {
                              contract: "table",
                              signature: "TableHeader",
                              children: t("demo.dashboard.colState"),
                            },
                            {
                              contract: "table",
                              signature: "TableHeader",
                              children: t("demo.dashboard.colAmount"),
                            },
                          ],
                        },
                      },
                      {
                        contract: "table",
                        signature: "TableBody",
                        children: [
                          row(
                            "#4821",
                            "Marta Ruiz",
                            t("demo.dashboard.statePaid"),
                            "success",
                            money("1.280"),
                          ),
                          row(
                            "#4820",
                            "Iván Costa",
                            t("demo.dashboard.statePending"),
                            "warning",
                            money("640"),
                          ),
                          row(
                            "#4819",
                            "Nadia Fuentes",
                            t("demo.dashboard.statePaid"),
                            "success",
                            money("2.115"),
                          ),
                          row(
                            "#4818",
                            "Teo Lombardi",
                            t("demo.dashboard.stateRefunded"),
                            "neutral",
                            money("310"),
                          ),
                          row(
                            "#4817",
                            "Sara Okafor",
                            t("demo.dashboard.statePaid"),
                            "success",
                            money("980"),
                          ),
                        ],
                      },
                    ],
                  },
                },
                {
                  contract: "pagination",
                  signature: "Pagination",
                  options: {
                    page: 1,
                    total: 8,
                    label: t("demo.dashboard.paginationLabel"),
                    previousLabel: t("demo.dashboard.paginationPrevious"),
                    nextLabel: t("demo.dashboard.paginationNext"),
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  };
};
