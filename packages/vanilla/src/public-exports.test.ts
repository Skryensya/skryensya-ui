import { mountAccordion } from "@skryensya/vanilla/accordion";
import { initComponents } from "@skryensya/vanilla/auto";
import { mountButton } from "@skryensya/vanilla/button";
import { mountCalendar } from "@skryensya/vanilla/calendar";
import { mountCarousel } from "@skryensya/vanilla/carousel";
import { mountCheckboxGroup } from "@skryensya/vanilla/checkbox-group";
import { mountCodePreview } from "@skryensya/vanilla/code-preview";
import { mountCommandPalette } from "@skryensya/vanilla/command-palette";
import { mountComponentPreview } from "@skryensya/vanilla/component-preview";
import { mountDatePicker } from "@skryensya/vanilla/date-picker";
import { mountExpandableTile } from "@skryensya/vanilla/expandable-tile";
import { mountSelect } from "@skryensya/vanilla/select";
import { mountSegmented } from "@skryensya/vanilla/segmented";
import { mountStat } from "@skryensya/vanilla/stat";
import { mountSidebar } from "@skryensya/vanilla/sidebar";
import { mountSlider } from "@skryensya/vanilla/slider";
import { destroyMount } from "@skryensya/vanilla/runtime";
import { mountTabs } from "@skryensya/vanilla/tabs";
import { mountTablePager } from "@skryensya/vanilla/table-pager";
import { mountTileCheckbox } from "@skryensya/vanilla/tile-checkbox";
import { mountTileSwitch } from "@skryensya/vanilla/tile-switch";
import { mountTileRadioGroup } from "@skryensya/vanilla/tile-radio-group";
import { mountTimeField } from "@skryensya/vanilla/time-field";
import { mountToast } from "@skryensya/vanilla/toast";
import { mountToc } from "@skryensya/vanilla/toc";
import { mountTooltip } from "@skryensya/vanilla/tooltip";
import { mountVaul } from "@skryensya/vanilla/vaul";
import { describe, expect, it } from "vitest";

const mounts = [
  mountAccordion,
  mountButton,
  mountCalendar,
  mountCarousel,
  mountCheckboxGroup,
  mountCommandPalette,
  mountDatePicker,
  mountExpandableTile,
  mountSelect,
  mountSegmented,
  mountStat,
  mountSidebar,
  mountSlider,
  mountTablePager,
  mountTabs,
  mountTileCheckbox,
  mountTileSwitch,
  mountTileRadioGroup,
  mountTimeField,
  mountToast,
  mountToc,
  mountTooltip,
  mountVaul,
];

describe("Vanilla public entry points", () => {
  it("publishes the lazy auto-loader and one mount for every regular enhanced module", () => {
    expect(initComponents).toBeTypeOf("function");
    expect(mounts).toHaveLength(23);
    expect(mounts.every((mount) => typeof mount === "function")).toBe(true);
  });

  it("publishes documentation previews and lifecycle control only through explicit subpaths", () => {
    expect(mountCodePreview).toBeTypeOf("function");
    expect(mountComponentPreview).toBeTypeOf("function");
    expect(destroyMount).toBeTypeOf("function");
  });
});
