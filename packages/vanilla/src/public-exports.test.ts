import { mountAccordion } from "@skryensya/vanilla/accordion";
import { mountBackToTop } from "@skryensya/vanilla/back-to-top";
import { mountBreadcrumb } from "@skryensya/vanilla/breadcrumb";
import { initComponents } from "@skryensya/vanilla/auto";
import { mountButton } from "@skryensya/vanilla/button";
import { mountCalendar } from "@skryensya/vanilla/calendar";
import { mountCarousel } from "@skryensya/vanilla/carousel";
import { mountChart } from "@skryensya/vanilla/chart";
import { mountCheckboxGroup } from "@skryensya/vanilla/checkbox-group";
import { mountCodePreview } from "@skryensya/vanilla/code-preview";
import { mountColorPicker } from "@skryensya/vanilla/color-picker";
import { mountCombobox } from "@skryensya/vanilla/combobox";
import { mountCommandPalette } from "@skryensya/vanilla/command-palette";
import { mountCommentThread } from "@skryensya/vanilla/comment-thread";
import { mountComponentPreview } from "@skryensya/vanilla/component-preview";
import { mountDataGrid } from "@skryensya/vanilla/data-grid";
import { mountDatePicker } from "@skryensya/vanilla/date-picker";
import { mountEditor } from "@skryensya/vanilla/editor";
import { mountExpandableTile } from "@skryensya/vanilla/expandable-tile";
import { mountFileUpload } from "@skryensya/vanilla/file-upload";
import { mountFolder } from "@skryensya/vanilla/folder";
import { mountMarquee } from "@skryensya/vanilla/marquee";
import { mountMegamenu } from "@skryensya/vanilla/megamenu";
import { mountMenu } from "@skryensya/vanilla/menu";
import { mountMenubar } from "@skryensya/vanilla/menubar";
import { mountMeter } from "@skryensya/vanilla/meter";
import { mountNavListGroup } from "@skryensya/vanilla/nav-list";
import { mountNumberField } from "@skryensya/vanilla/number-field";
import { mountSelect } from "@skryensya/vanilla/select";
import { mountSegmented } from "@skryensya/vanilla/segmented";
import { mountStat } from "@skryensya/vanilla/stat";
import { mountSidebar } from "@skryensya/vanilla/sidebar";
import { mountSlider } from "@skryensya/vanilla/slider";
import { mountSliderRange } from "@skryensya/vanilla/slider-range";
import { destroyMount } from "@skryensya/vanilla/runtime";
import { mountTable } from "@skryensya/vanilla/table";
import { mountTabs } from "@skryensya/vanilla/tabs";
import { mountTablePager } from "@skryensya/vanilla/table-pager";
import { mountTileCheckbox } from "@skryensya/vanilla/tile-checkbox";
import { mountTileSwitch } from "@skryensya/vanilla/tile-switch";
import { mountTileRadioGroup } from "@skryensya/vanilla/tile-radio-group";
import { mountTimeField } from "@skryensya/vanilla/time-field";
import { mountToast } from "@skryensya/vanilla/toast";
import { mountToc } from "@skryensya/vanilla/toc";
import { mountToolbar } from "@skryensya/vanilla/toolbar";
import { mountTooltip } from "@skryensya/vanilla/tooltip";
import { mountTreegrid } from "@skryensya/vanilla/treegrid";
import { mountTreeView } from "@skryensya/vanilla/tree-view";
import { mountVaul } from "@skryensya/vanilla/vaul";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * DERIVED FROM `runtime/registry.ts`'s OWN `registrations`, not hand-counted: this file went stale
 * once already (asserted `toHaveLength(23)` while the real registry had grown past 40, missing 18
 * real mounts - `mountMegamenu`, `mountChart`, `mountTreegrid` among them - silently, because the
 * length check and the import list never disagreed with EACH OTHER, only with the registry neither
 * one read). If this list drifts from `registry.ts` again, regenerate it: every mount function it
 * lists is `(await import("../components/<file>.js")).mount<Name>` in that file's `registrations`
 * array, and its subpath (`@skryensya/vanilla/<file>`) is that file's own key in `package.json`'s
 * `exports` map.
 */
const mounts = [
  mountAccordion,
  mountBackToTop,
  mountBreadcrumb,
  mountButton,
  mountCalendar,
  mountCarousel,
  mountChart,
  mountCheckboxGroup,
  mountColorPicker,
  mountCombobox,
  mountCommandPalette,
  mountCommentThread,
  mountDataGrid,
  mountDatePicker,
  mountExpandableTile,
  mountFileUpload,
  mountFolder,
  mountMarquee,
  mountMegamenu,
  mountMenu,
  mountMenubar,
  mountMeter,
  mountNavListGroup,
  mountNumberField,
  mountSegmented,
  mountSelect,
  mountSidebar,
  mountSlider,
  mountSliderRange,
  mountStat,
  mountTable,
  mountTablePager,
  mountTabs,
  mountTileCheckbox,
  mountTileRadioGroup,
  mountTileSwitch,
  mountTimeField,
  mountToast,
  mountToc,
  mountToolbar,
  mountTooltip,
  mountTreegrid,
  mountTreeView,
  mountVaul,
];

describe("Vanilla public entry points", () => {
  it("publishes the lazy auto-loader and one mount for every regular enhanced module", () => {
    expect(initComponents).toBeTypeOf("function");
    expect(mounts).toHaveLength(44);
    expect(mounts.every((mount) => typeof mount === "function")).toBe(true);
  });

  /*
   * Editor sits beside CodePreview/ComponentPreview here for a different reason than either: it IS
   * part of the default application runtime, conceptually, but `@skryensya/editor` (ProseMirror) is
   * an optional peer dependency, so `runtime/registry.ts`'s auto-loader must never name it - even
   * behind a selector-gated `import()` - or every consumer of `@skryensya/vanilla/auto` would need
   * that peer installed. A page using Editor calls `mountEditor` explicitly instead.
   */
  it("publishes documentation previews, Editor, and lifecycle control only through explicit subpaths", () => {
    expect(mountCodePreview).toBeTypeOf("function");
    expect(mountComponentPreview).toBeTypeOf("function");
    expect(mountEditor).toBeTypeOf("function");
    expect(destroyMount).toBeTypeOf("function");
  });

  /*
   * THE ANTI-DRIFT CHECK the two tests above cannot be, on their own: they prove every function in
   * `mounts` is real and importable, but nothing stops `mounts` itself from quietly falling behind
   * `runtime/registry.ts` again the way it already did once (see the comment on `mounts`). This
   * reads `registry.ts`'s own `registrations` array as text - the same source-scanning approach
   * `no-em-dash.test.ts` already uses elsewhere in this repo - and compares the SET of mount names
   * it finds against this file's own list, so a future registration that forgets its subpath (or a
   * subpath export that outlives a removed registration) fails HERE, at the one seam meant to
   * answer "does the public surface match the real one", instead of waiting for someone to notice
   * `.length` is wrong by hand again.
   */
  it("names exactly the mount functions runtime/registry.ts registers, no more, no fewer", () => {
    // `import.meta.dirname` (Node's own, not a URL parse): Vitest's jsdom environment does not hand
    // this module a real `file://` `import.meta.url`, so `fileURLToPath(new URL(...))` throws here.
    const registryPath = join(import.meta.dirname, "runtime/registry.ts");
    const registrySource = readFileSync(registryPath, "utf8");
    const registered = new Set(
      [...registrySource.matchAll(/\)\.(\w+)/g)].map(([, name]) => name).filter((name) => name.startsWith("mount")),
    );

    const named = new Set(
      Object.entries({
        mountAccordion,
        mountBackToTop,
        mountBreadcrumb,
        mountButton,
        mountCalendar,
        mountCarousel,
        mountChart,
        mountCheckboxGroup,
        mountColorPicker,
        mountCombobox,
        mountCommandPalette,
        mountCommentThread,
        mountDataGrid,
        mountDatePicker,
        mountExpandableTile,
        mountFileUpload,
        mountFolder,
        mountMarquee,
        mountMegamenu,
        mountMenu,
        mountMenubar,
        mountMeter,
        mountNavListGroup,
        mountNumberField,
        mountSegmented,
        mountSelect,
        mountSidebar,
        mountSlider,
        mountSliderRange,
        mountStat,
        mountTable,
        mountTablePager,
        mountTabs,
        mountTileCheckbox,
        mountTileRadioGroup,
        mountTileSwitch,
        mountTimeField,
        mountToast,
        mountToc,
        mountToolbar,
        mountTooltip,
        mountTreegrid,
        mountTreeView,
        mountVaul,
      }).map(([name]) => name),
    );

    const missingFromThisFile = [...registered].filter((name) => !named.has(name)).sort();
    const noLongerRegistered = [...named].filter((name) => !registered.has(name)).sort();

    expect(missingFromThisFile, "registered in runtime/registry.ts but not named above").toEqual([]);
    expect(noLongerRegistered, "named above but no longer in runtime/registry.ts").toEqual([]);
  });
});
