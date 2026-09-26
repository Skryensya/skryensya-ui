import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE SITE'S OWN TOUR: the chrome every page shares (the header), then the sidebar and the "On this
 * page" rail when the page has them. Started only by `/tour` in the command palette.
 *
 * Mobile and desktop each get their own step for the same idea (search field vs. search button,
 * preference cluster vs. preferences sheet, index button vs. rail) because only one of each pair is
 * shown at a time, and Tour skips a step whose target is hidden. So the progress counts only what
 * the reader can actually see, at whatever width they are reading.
 */

export const DOCS_TOUR_COMMAND = "tour";
export const DOCS_TOUR_ID = "docs-tour";
/** The `<template>` Base renders the tour into, so no page pays for Tour until someone asks. */
export const DOCS_TOUR_TEMPLATE_ID = "docs-tour-template";

const step = (target: string, title: string, description: string, placement?: string) => ({
  options: placement ? { target, placement } : { target },
  slots: { title, description },
});

export const docsTourTree = (t: Translate): UsageTree => ({
  contract: "tour",
  signature: "Tour",
  options: {
    tourId: DOCS_TOUR_ID,
    progressLabel: t("tour.progressLabel"),
    nextLabel: t("tour.nextLabel"),
    finishLabel: t("tour.finishLabel"),
    previousLabel: t("tour.previousLabel"),
    skipLabel: t("tour.skipLabel"),
    closeLabel: t("tour.closeLabel"),
    /* Nothing reads how it ended: no trigger says "Repeat tour", and `/tour` always starts over. */
    remember: false,
  },
  slots: {
    items: [
      step(".dimensions__menu-trigger", t("docsTour.menuTitle"), t("docsTour.menuBody")),
      step(".dimensions__global", t("docsTour.globalTitle"), t("docsTour.globalBody")),
      step(".dimensions__version-menu", t("docsTour.versionTitle"), t("docsTour.versionBody")),
      step(".dimensions__search-trigger", t("docsTour.searchTitle"), t("docsTour.searchBody")),
      step(".dimensions__search-trigger-mobile", t("docsTour.searchTitle"), t("docsTour.searchBody")),
      step(".dimensions__prefs", t("docsTour.prefsTitle"), t("docsTour.prefsBody")),
      step(".dimensions__prefs-trigger", t("docsTour.prefsTitle"), t("docsTour.prefsBody")),
      step(".docs-sidebar", t("docsTour.sidebarTitle"), t("docsTour.sidebarBody"), "inline-end"),
      step(".sk-toc", t("docsTour.tocTitle"), t("docsTour.tocBody"), "inline-start"),
    ],
  },
});
