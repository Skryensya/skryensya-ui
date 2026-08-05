import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Four trails, all four converted. The icon separator did not until `separator` stopped being a
 * string option and became a slot that takes text or an Icon: the stylesheet already had a rule for
 * a chevron there (`.sk-breadcrumb__separator .sk-icon`), so the markup was the only thing missing.
 *
 * Locale-owned paths come from the page: the crumbs are demo destinations, not real docs routes.
 */

/** The minimum trail: one link back and the page you are on. */
export const breadcrumbTwoTree = (t: Translate): UsageTree => ({
  contract: "breadcrumb",
  signature: "Breadcrumb",
  options: { label: t("demo.breadcrumb.label") },
  slots: {
    items: [
      { options: { href: "/" }, slots: { label: t("demo.breadcrumb.home") } },
      { options: { current: true }, slots: { label: t("demo.breadcrumb.projects") } },
    ],
  },
});

/** Three links deep, then the current page. */
export const breadcrumbMultiTree = (
  t: Translate,
  hrefs: { projects: string; kit: string },
): UsageTree => ({
  contract: "breadcrumb",
  signature: "Breadcrumb",
  options: { label: t("demo.breadcrumb.label") },
  slots: {
    items: [
      { options: { href: "/" }, slots: { label: t("demo.breadcrumb.home") } },
      { options: { href: hrefs.projects }, slots: { label: t("demo.breadcrumb.projects") } },
      { options: { href: hrefs.kit }, slots: { label: "Kit Digital" } },
      { options: { current: true }, slots: { label: t("demo.breadcrumb.settings") } },
    ],
  },
});

/** The separator is content, so it can be a chevron instead of the `/` the template defaults to. */
export const breadcrumbIconTree = (t: Translate, projectsHref: string): UsageTree => ({
  contract: "breadcrumb",
  signature: "Breadcrumb",
  options: { label: t("demo.breadcrumb.label") },
  slots: {
    separator: { contract: "icon", signature: "Icon", options: { name: "chevron-right" } },
    items: [
      { options: { href: "/" }, slots: { label: t("demo.breadcrumb.home") } },
      { options: { href: projectsHref }, slots: { label: t("demo.breadcrumb.projects") } },
      { options: { current: true }, slots: { label: "Kit Digital" } },
    ],
  },
});

/**
 * A long intermediate link truncates; the current page wraps. The middle href is locale-owned.
 */
export const breadcrumbLongTree = (t: Translate, projectsHref: string): UsageTree => ({
  contract: "breadcrumb",
  signature: "Breadcrumb",
  options: { label: t("demo.breadcrumb.label") },
  slots: {
    items: [
      { options: { href: "/" }, slots: { label: t("demo.breadcrumb.home") } },
      {
        options: { href: projectsHref },
        slots: { label: t("demo.breadcrumb.longAncestor") },
      },
      { options: { current: true }, slots: { label: t("demo.breadcrumb.longCurrent") } },
    ],
  },
});
