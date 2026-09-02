/*
 * The template gallery's section list, TEXT ONLY: no `emitMarkup`, no usage trees.
 *
 * Two places list these sections and they must not drift: `TemplatesPage.astro`'s own rail (a
 * sticky column on desktop, `display: none` below `desktop`) and the mobile drawer, where `Base.astro`
 * turns the same entries into a "Templates" collapsible section in `DrawerNav` so a reader with the
 * rail hidden can still reach every template. One array, read by both, in one order.
 */
import type { Translate } from "../i18n";

export interface TemplateSection {
  /** `id` of the rendered `<section>` in the stage; every nav entry is an `#id` link to it. */
  id: string;
  /** Short label for a nav entry. */
  navLabel: string;
  /** The section's heading / `aria-label` in the stage. */
  title: string;
  /** The example's `aria-label`. */
  label: string;
}

export function templateSections(t: Translate): TemplateSection[] {
  return [
    {
      id: "app-shell",
      navLabel: t("templates.appShellNavLabel"),
      title: t("templates.appShellTitle"),
      label: t("templates.appShellLabel"),
    },
    {
      id: "app-shell-explorer",
      navLabel: t("templates.explorerNavLabel"),
      title: t("templates.explorerTitle"),
      label: t("templates.explorerLabel"),
    },
    {
      id: "marketing",
      navLabel: t("templates.marketingNavLabel"),
      title: t("templates.marketingTitle"),
      label: t("templates.marketingLabel"),
    },
    {
      id: "docs-site",
      navLabel: t("templates.docsSiteNavLabel"),
      title: t("templates.docsSiteTitle"),
      label: t("templates.docsSiteLabel"),
    },
    {
      id: "dashboard",
      navLabel: t("templates.dashboardNavLabel"),
      title: t("templates.dashboardTitle"),
      label: t("templates.dashboardLabel"),
    },
    {
      id: "checkout",
      navLabel: t("templates.checkoutNavLabel"),
      title: t("templates.checkoutTitle"),
      label: t("templates.checkoutLabel"),
    },
  ];
}
