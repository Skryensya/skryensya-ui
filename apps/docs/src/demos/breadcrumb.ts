import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import {
  breadcrumbIconItems,
  breadcrumbLongItems,
  breadcrumbMultiItems,
  breadcrumbTwoItems,
} from "./data/breadcrumb";

/*
 * Four trails, all four converted. The icon separator did not until `separator` stopped being a
 * string option and became a slot that takes text or an Icon: the stylesheet already had a rule for
 * a chevron there (`.sk-breadcrumb__separator .sk-icon`), so the markup was the only thing missing.
 *
 * The crumbs themselves are data: see `data/breadcrumb.ts`.
 */

/** The minimum trail: one link back and the page you are on. */
export const breadcrumbTwoTree = (t: Translate): UsageTree => ({
  contract: "breadcrumb",
  signature: "Breadcrumb",
  options: { label: t("demo.breadcrumb.label") },
  slots: { items: breadcrumbTwoItems(t) },
});

/** Three links deep, then the current page. */
export const breadcrumbMultiTree = (
  t: Translate,
  hrefs: { projects: string; kit: string },
): UsageTree => ({
  contract: "breadcrumb",
  signature: "Breadcrumb",
  options: { label: t("demo.breadcrumb.label") },
  slots: { items: breadcrumbMultiItems(t, hrefs) },
});

/** The separator is content, so it can be a chevron instead of the `/` the template defaults to. */
export const breadcrumbIconTree = (t: Translate, projectsHref: string): UsageTree => ({
  contract: "breadcrumb",
  signature: "Breadcrumb",
  options: { label: t("demo.breadcrumb.label") },
  slots: {
    separator: { contract: "icon", signature: "Icon", options: { name: "chevron-right" } },
    items: breadcrumbIconItems(t, projectsHref),
  },
});

/**
 * A long intermediate link truncates; the current page wraps. The middle href is locale-owned.
 */
export const breadcrumbLongTree = (t: Translate, projectsHref: string): UsageTree => ({
  contract: "breadcrumb",
  signature: "Breadcrumb",
  options: { label: t("demo.breadcrumb.label") },
  slots: { items: breadcrumbLongItems(t, projectsHref) },
});
