import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/* Mid-window so previous, items, ellipsis and next are all on screen to name. */
export const paginationAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("paginationPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "pagination",
      signature: "Pagination",
      options: {
        page: 5,
        total: 12,
        label: t("demo.pagination.label"),
        previousLabel: t("demo.pagination.previous"),
        nextLabel: t("demo.pagination.next"),
      },
    },
    items: [
      namePart(".sk-pagination", "block-start"),
      namePart(".sk-pagination__previous", "inline-start"),
      namePart(".sk-pagination__item", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-pagination__ellipsis", "inline-end"),
      namePart(".sk-pagination__next", "block-end"),
    ],
  },
});

/* Twelve pages seen from the first: enough for the window to collapse into one ellipsis. */
export const paginationTree = (t: Translate): UsageTree => ({
  contract: "pagination",
  signature: "Pagination",
  options: {
    page: 1,
    total: 12,
    label: t("demo.pagination.label"),
    previousLabel: t("demo.pagination.previous"),
    nextLabel: t("demo.pagination.next"),
  },
});
