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
  "/components/accordion": {
    name: "Accordion",
    entrypoint: "@skryensya/vanilla/accordion",
    mount: "mountAccordion",
    selector: "[data-sk-accordion]",
  },
  "/components/button": {
    name: "Button",
    entrypoint: "@skryensya/vanilla/button",
    mount: "mountButton",
    selector: "[data-sk-button]",
  },
  "/components/checkbox": {
    name: "TileCheckbox",
    entrypoint: "@skryensya/vanilla/tile-checkbox",
    mount: "mountTileCheckbox",
    selector: "[data-sk-tile-checkbox]",
  },
  "/components/color-picker": {
    name: "ColorPicker",
    entrypoint: "@skryensya/vanilla/color-picker",
    mount: "mountColorPicker",
    selector: "[data-sk-color-picker]",
  },
  "/components/command-palette": {
    name: "CommandPalette",
    entrypoint: "@skryensya/vanilla/command-palette",
    mount: "mountCommandPalette",
    selector: "[data-sk-command-palette]",
  },
  "/components/date-picker": {
    name: "DatePicker",
    entrypoint: "@skryensya/vanilla/date-picker",
    mount: "mountDatePicker",
    selector: "[data-sk-date-picker]",
  },
  "/components/calendar": {
    name: "Calendar",
    entrypoint: "@skryensya/vanilla/calendar",
    mount: "mountCalendar",
    selector: "[data-sk-calendar]",
  },
  "/components/dialog": {
    name: "Dialog Vaul",
    entrypoint: "@skryensya/vanilla/vaul",
    mount: "mountVaul",
    selector: "[data-sk-dialog-vaul]",
  },
  "/components/drawer": {
    name: "Drawer Vaul",
    entrypoint: "@skryensya/vanilla/vaul",
    mount: "mountVaul",
    selector: "[data-sk-vaul]",
  },
  "/components/radio-group": {
    name: "TileRadioGroup",
    entrypoint: "@skryensya/vanilla/tile-radio-group",
    mount: "mountTileRadioGroup",
    selector: "[data-sk-tile-radio-group]",
  },
  "/components/segmented": {
    name: "SegmentedControl",
    entrypoint: "@skryensya/vanilla/segmented",
    mount: "mountSegmented",
    selector: "[data-sk-segmented]",
  },
  "/components/select": {
    name: "Select",
    entrypoint: "@skryensya/vanilla/select",
    mount: "mountSelect",
    selector: "[data-sk-select]",
  },
  "/components/sidebar": {
    name: "Sidebar",
    entrypoint: "@skryensya/vanilla/sidebar",
    mount: "mountSidebar",
    selector: "[data-sk-sidebar]",
  },
  "/components/slider": {
    name: "Slider",
    entrypoint: "@skryensya/vanilla/slider",
    mount: "mountSlider",
    selector: "[data-sk-slider]",
  },
  "/components/tabs": {
    name: "Tabs",
    entrypoint: "@skryensya/vanilla/tabs",
    mount: "mountTabs",
    selector: "[data-sk-tabs]",
  },
  "/components/toast": {
    name: "Toast",
    entrypoint: "@skryensya/vanilla/toast",
    mount: "mountToast",
    selector: "[data-sk-toast]",
  },
  "/components/toc": {
    name: "Toc",
    entrypoint: "@skryensya/vanilla/toc",
    mount: "mountToc",
    selector: "[data-sk-toc]",
  },
  "/components/tooltip": {
    name: "Tooltip",
    entrypoint: "@skryensya/vanilla/tooltip",
    mount: "mountTooltip",
    selector: "[data-sk-anchor]",
  },
  "/vaul": {
    name: "Vaul",
    entrypoint: "@skryensya/vanilla/vaul",
    mount: "mountVaul",
    selector: "[data-sk-vaul]",
  },
} satisfies Record<string, VanillaMountDocumentation>;
