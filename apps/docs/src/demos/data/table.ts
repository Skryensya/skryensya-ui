import type { ItemInput } from "@skryensya/core/usage-tree";

/*
 * WHAT THE TABLE DEMOS SHOW, as opposed to how they are built.
 *
 * The rows are raw values, not markup: `table.ts` turns each into a labelled row with the right
 * cells, and a status like `succeeded` becomes a translated word there. Written this way, eight
 * deployments read as eight deployments rather than as forty nested nodes.
 */

/** id, service, environment, status, unit, amount — the six values one deployment row carries. */
export const deploymentRows = [
  ["dep-1040", "API", "production", "succeeded", "minutes", "4"],
  ["dep-1039", "Worker", "production", "running", "minutes", "12"],
  ["dep-1038", "Gateway", "staging", "succeeded", "minutes", "27"],
  ["dep-1037", "Billing", "production", "failed", "hours", "1"],
  ["dep-1036", "Auth", "staging", "succeeded", "hours", "2"],
  ["dep-1035", "Search", "production", "succeeded", "hours", "3"],
  ["dep-1034", "API", "staging", "running", "hours", "4"],
  ["dep-1033", "Worker", "production", "succeeded", "hours", "5"],
] as const;

/** The page sizes the pager's Flyout offers. A number is its own label in every locale. */
export const pageSizeItems: readonly ItemInput[] = ["5", "10", "25"].map((value) => ({
  options: { value },
  slots: { label: value },
}));
