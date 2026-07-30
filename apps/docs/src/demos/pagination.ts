import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
