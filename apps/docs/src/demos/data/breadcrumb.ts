import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * THE CRUMBS OF EVERY TRAIL. Four demos, four lists, and the compositions they belong to differ
 * only by a separator: keeping the trails here is what makes that visible in `breadcrumb.ts`.
 *
 * The hrefs are passed in, not written: they are locale-owned paths the PAGE knows (a Spanish page
 * links to `/componentes/...`, an English one to `/en/components/...`), and the crumbs are demo
 * destinations rather than real docs routes.
 */

/** The minimum trail: one link back and the page you are on. */
export const breadcrumbTwoItems = (t: Translate): readonly ItemInput[] => [
  { options: { href: "/" }, slots: { label: t("demo.breadcrumb.home") } },
  { options: { current: true }, slots: { label: t("demo.breadcrumb.projects") } },
];

/** Three links deep, then the current page. */
export const breadcrumbMultiItems = (
  t: Translate,
  hrefs: { projects: string; kit: string },
): readonly ItemInput[] => [
  { options: { href: "/" }, slots: { label: t("demo.breadcrumb.home") } },
  { options: { href: hrefs.projects }, slots: { label: t("demo.breadcrumb.projects") } },
  { options: { href: hrefs.kit }, slots: { label: "Kit Digital" } },
  { options: { current: true }, slots: { label: t("demo.breadcrumb.settings") } },
];

/** Short enough that the chevron separator between crumbs is the only thing worth looking at. */
export const breadcrumbIconItems = (
  t: Translate,
  projectsHref: string,
): readonly ItemInput[] => [
  { options: { href: "/" }, slots: { label: t("demo.breadcrumb.home") } },
  { options: { href: projectsHref }, slots: { label: t("demo.breadcrumb.projects") } },
  { options: { current: true }, slots: { label: "Kit Digital" } },
];

/** A deliberately long intermediate label, so the truncation rule has something to truncate. */
export const breadcrumbLongItems = (
  t: Translate,
  projectsHref: string,
): readonly ItemInput[] => [
  { options: { href: "/" }, slots: { label: t("demo.breadcrumb.home") } },
  { options: { href: projectsHref }, slots: { label: t("demo.breadcrumb.longAncestor") } },
  { options: { current: true }, slots: { label: t("demo.breadcrumb.longCurrent") } },
];
