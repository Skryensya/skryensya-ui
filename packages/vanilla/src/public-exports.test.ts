import { mountAccordion } from "@skryensya/vanilla/accordion";
import { initComponents } from "@skryensya/vanilla/auto";
import { mountButton } from "@skryensya/vanilla/button";
import { mountExpandableTile } from "@skryensya/vanilla/expandable-tile";
import { mountSelect } from "@skryensya/vanilla/select";
import { mountSegmented } from "@skryensya/vanilla/segmented";
import { mountSidebar } from "@skryensya/vanilla/sidebar";
import { mountSlider } from "@skryensya/vanilla/slider";
import { mountTabs } from "@skryensya/vanilla/tabs";
import { mountTileCheckbox } from "@skryensya/vanilla/tile-checkbox";
import { mountTileRadioGroup } from "@skryensya/vanilla/tile-radio-group";
import { mountToast } from "@skryensya/vanilla/toast";
import { mountVaul } from "@skryensya/vanilla/vaul";
import { describe, expect, it } from "vitest";

const mounts = [
  mountAccordion,
  mountButton,
  mountExpandableTile,
  mountSelect,
  mountSegmented,
  mountSidebar,
  mountSlider,
  mountTabs,
  mountTileCheckbox,
  mountTileRadioGroup,
  mountToast,
  mountVaul,
];

describe("Vanilla public entry points", () => {
  it("publishes the auto-loader and one mount function for every enhanced module", () => {
    expect(initComponents).toBeTypeOf("function");
    expect(mounts).toHaveLength(12);
    expect(mounts.every((mount) => typeof mount === "function")).toBe(true);
  });
});
