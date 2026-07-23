export type VanillaMountDocumentation = {
  /** Human-facing enhanced contract. */
  name: string;
  /** Public Vanilla subpath; intentionally never the package root. */
  entrypoint: string;
  /** One idempotent `mount(root?) → count` function. */
  mount: string;
  /** The authored root that can be mounted by itself. */
  selector: string;
};

/*
 * The docs and package have one catalogue of isolated mount seams. A route appears here only when it
 * owns an enhancer: native controls and CSS-only modules deliberately do not imply a JavaScript import.
 */
export const vanillaMounts = {
  "/componentes/accordion": {
    name: "Accordion",
    entrypoint: "@skryensya/vanilla/accordion",
    mount: "mountAccordion",
    selector: "[data-ds-accordion]",
  },
  "/componentes/button": {
    name: "Button",
    entrypoint: "@skryensya/vanilla/button",
    mount: "mountButton",
    selector: "[data-ds-button]",
  },
  "/componentes/checkbox": {
    name: "TileCheckbox",
    entrypoint: "@skryensya/vanilla/tile-checkbox",
    mount: "mountTileCheckbox",
    selector: "[data-ds-tile-checkbox]",
  },
  "/componentes/dialog": {
    name: "Dialog Vaul",
    entrypoint: "@skryensya/vanilla/vaul",
    mount: "mountVaul",
    selector: "[data-ds-dialog-vaul]",
  },
  "/componentes/drawer": {
    name: "Drawer Vaul",
    entrypoint: "@skryensya/vanilla/vaul",
    mount: "mountVaul",
    selector: "[data-ds-vaul]",
  },
  "/componentes/radio-group": {
    name: "TileRadioGroup",
    entrypoint: "@skryensya/vanilla/tile-radio-group",
    mount: "mountTileRadioGroup",
    selector: "[data-ds-tile-radio-group]",
  },
  "/componentes/segmented": {
    name: "SegmentedControl",
    entrypoint: "@skryensya/vanilla/segmented",
    mount: "mountSegmented",
    selector: "[data-ds-segmented]",
  },
  "/componentes/select": {
    name: "Select",
    entrypoint: "@skryensya/vanilla/select",
    mount: "mountSelect",
    selector: "[data-ds-select]",
  },
  "/componentes/sidebar": {
    name: "Sidebar",
    entrypoint: "@skryensya/vanilla/sidebar",
    mount: "mountSidebar",
    selector: "[data-ds-sidebar]",
  },
  "/componentes/slider": {
    name: "Slider",
    entrypoint: "@skryensya/vanilla/slider",
    mount: "mountSlider",
    selector: "[data-ds-slider]",
  },
  "/componentes/tabs": {
    name: "Tabs",
    entrypoint: "@skryensya/vanilla/tabs",
    mount: "mountTabs",
    selector: "[data-ds-tabs]",
  },
  "/componentes/tile": {
    name: "ExpandableTile",
    entrypoint: "@skryensya/vanilla/expandable-tile",
    mount: "mountExpandableTile",
    selector: "[data-ds-expandable-tile]",
  },
  "/componentes/toast": {
    name: "Toast",
    entrypoint: "@skryensya/vanilla/toast",
    mount: "mountToast",
    selector: "[data-ds-toast]",
  },
  "/vaul": {
    name: "Vaul",
    entrypoint: "@skryensya/vanilla/vaul",
    mount: "mountVaul",
    selector: "[data-ds-vaul]",
  },
} satisfies Record<string, VanillaMountDocumentation>;
