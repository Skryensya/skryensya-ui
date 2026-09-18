import { tablePagerAttrs } from "@skryensya/core/pagination";
import { connectTablePager as connectShared, type TablePagerChangeDetail } from "@skryensya/core/table-pager-dom";
import { remountIcons } from "../icon.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export type { TablePagerChangeDetail };

/*
 * The pager's behaviour is `@skryensya/core/table-pager-dom`, shared with React. What is Vanilla's
 * own is the icons: chevrons are `data-sk-icon` placeholders, hydrated after every render from the set
 * the app already bound with `mountIcons` (ADR-19).
 */
export function connectTablePager(root: HTMLElement): () => void {
  return connectShared(root, { afterRender: (nav) => remountIcons(nav) });
}

export const mountTablePager = createConnectMount({
  key: "table-pager",
  rootSelector: `[${tablePagerAttrs.root}]`,
  connect: connectTablePager,
});
