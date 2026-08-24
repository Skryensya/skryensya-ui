import type { Mount } from "./svelte-hydrate.js";

type Registration = {
  selector: string;
  load: () => Promise<Mount>;
};

/*
 * The auto-loader is a selector → dynamic-import manifest. Importing `@skryensya/vanilla/auto`
 * loads only this table; an enhancer module (and its machine) crosses the network only when its
 * authored root is present. Mounting remains deterministic: modules load concurrently, then their
 * small `mount(root?) → count` interfaces run in registry order.
 *
 * CodePreview and ComponentPreview are deliberately absent. They are opt-in documentation surfaces
 * mounted through their explicit subpaths, never part of the default application runtime.
 */
// Runtime plugin loading is intentional: static imports would defeat selector gating and ship every enhancer.
const registrations: readonly Registration[] = [
  {
    selector: "[data-sk-button]",
    load: async () => (await import("../components/button.js")).mountButton,
  },
  {
    selector: "[data-sk-select]",
    load: async () => (await import("../components/select.js")).mountSelect,
  },
  {
    selector: "[data-sk-segmented]",
    load: async () =>
      (await import("../components/segmented.js")).mountSegmented,
  },
  {
    selector: "[data-sk-stat][data-animate]",
    load: async () => (await import("../components/stat.js")).mountStat,
  },
  {
    selector: "[data-sk-sidebar]",
    load: async () => (await import("../components/sidebar.js")).mountSidebar,
  },
  {
    selector: "[data-sk-slider]",
    load: async () => (await import("../components/slider.js")).mountSlider,
  },
  {
    selector: "[data-sk-toast]",
    load: async () => (await import("../components/toast.js")).mountToast,
  },
  {
    selector: "[data-sk-vaul], [data-sk-dialog-vaul]",
    load: async () => (await import("../components/vaul.js")).mountVaul,
  },
  {
    selector: "[data-sk-tabs]",
    load: async () => (await import("../components/tabs.js")).mountTabs,
  },
  {
    selector: "[data-sk-carousel]",
    load: async () => (await import("../components/carousel.js")).mountCarousel,
  },
  {
    selector: "[data-sk-accordion]",
    load: async () =>
      (await import("../components/accordion.js")).mountAccordion,
  },
  {
    selector: "[data-sk-expandable-tile]",
    load: async () =>
      (await import("../components/expandable-tile.js")).mountExpandableTile,
  },
  {
    selector: "[data-sk-checkbox-group]",
    load: async () =>
      (await import("../components/checkbox-group.js")).mountCheckboxGroup,
  },
  {
    selector: "[data-sk-tile-checkbox]",
    load: async () =>
      (await import("../components/tile-checkbox.js")).mountTileCheckbox,
  },
  {
    selector: "[data-sk-tile-switch]",
    load: async () =>
      (await import("../components/tile-switch.js")).mountTileSwitch,
  },
  {
    selector: "[data-sk-tile-radio-group]",
    load: async () =>
      (await import("../components/tile-radio-group.js")).mountTileRadioGroup,
  },
  {
    selector: "[data-sk-table-pager]",
    load: async () =>
      (await import("../components/table-pager.js")).mountTablePager,
  },
  {
    selector: "[data-sk-command-palette]",
    load: async () =>
      (await import("../components/command-palette.js")).mountCommandPalette,
  },
  {
    selector: "[data-sk-date-picker]",
    load: async () => (await import("../components/date-picker.js")).mountDatePicker,
  },
  {
    selector: "[data-sk-time-field]",
    load: async () => (await import("../components/time-field.js")).mountTimeField,
  },
  {
    selector: "[data-sk-calendar]",
    load: async () => (await import("../components/calendar.js")).mountCalendar,
  },
  {
    selector: "[data-sk-anchor]",
    load: async () => (await import("../components/tooltip.js")).mountTooltip,
  },
  {
    selector: "[data-sk-menu]",
    load: async () => (await import("../components/menu.js")).mountMenu,
  },
  {
    selector: "[data-sk-combobox]",
    load: async () => (await import("../components/combobox.js")).mountCombobox,
  },
  {
    selector: "[data-sk-tree-view]",
    load: async () =>
      (await import("../components/tree-view.js")).mountTreeView,
  },
  {
    selector: "[data-sk-number-field]",
    load: async () =>
      (await import("../components/number-field.js")).mountNumberField,
  },
  {
    selector: "[data-sk-file-upload]",
    load: async () =>
      (await import("../components/file-upload.js")).mountFileUpload,
  },
  {
    selector: "[data-sk-toolbar]",
    load: async () => (await import("../components/toolbar.js")).mountToolbar,
  },
  {
    selector: "[data-sk-toc]",
    load: async () => (await import("../components/toc.js")).mountToc,
  },
  {
    selector: "[data-sk-treegrid]",
    load: async () => (await import("../components/treegrid.js")).mountTreegrid,
  },
  {
    // Scoped to the option's own attribute, not a `data-sk-table` marker every table would carry -
    // see `components/table.ts`'s own banner comment for why. `:not([data-sk-treegrid])` matters: a
    // resizable Treegrid is ALSO a `.sk-table` with `data-resizable-columns` (Treegrid's `also:
    // ["sk-table"]`), and without this both selectors would match it and mount it twice.
    selector: "table.sk-table[data-resizable-columns]:not([data-sk-treegrid])",
    load: async () => (await import("../components/table.js")).mountTable,
  },
  {
    selector: "[data-sk-slider-range]",
    load: async () => (await import("../components/slider-range.js")).mountSliderRange,
  },
  {
    selector: "[data-sk-data-grid]",
    load: async () => (await import("../components/data-grid.js")).mountDataGrid,
  },
  {
    selector: "[data-sk-nav-list-group-trigger]",
    load: async () => (await import("../components/nav-list.js")).mountNavListGroup,
  },
  {
    selector: "[data-sk-menubar]",
    load: async () => (await import("../components/menubar.js")).mountMenubar,
  },
  {
    selector: "[data-sk-megamenu]",
    load: async () => (await import("../components/megamenu.js")).mountMegamenu,
  },
  {
    selector: "[data-sk-meter]",
    load: async () => (await import("../components/meter.js")).mountMeter,
  },
  {
    selector: "[data-sk-breadcrumb]",
    load: async () => (await import("../components/breadcrumb.js")).mountBreadcrumb,
  },
];

function containsSelector(root: Document | Element, selector: string): boolean {
  const rootMatches =
    typeof Element !== "undefined" &&
    root instanceof Element &&
    root.matches(selector);
  return rootMatches || root.querySelector(selector) !== null;
}

/**
 * Dynamically import and mount only enhancer types whose authored selectors exist below `root`.
 * Re-run after inserting DOM; individual mounts remain idempotent.
 */
export async function initComponents(
  target?: Document | Element,
): Promise<number> {
  const root =
    target ?? (typeof document === "undefined" ? undefined : document);
  if (!root) return 0;

  const matching = registrations.filter(({ selector }) =>
    containsSelector(root, selector),
  );
  const mounts = await Promise.all(matching.map(({ load }) => load()));

  let count = 0;
  for (const mount of mounts) count += mount(root);
  return count;
}
