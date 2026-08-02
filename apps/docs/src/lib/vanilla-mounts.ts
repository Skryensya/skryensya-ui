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
    selector: "[data-sk-accordion]",
  },
  "/componentes/button": {
    name: "Button",
    entrypoint: "@skryensya/vanilla/button",
    mount: "mountButton",
    selector: "[data-sk-button]",
  },
  "/componentes/checkbox": {
    name: "TileCheckbox",
    entrypoint: "@skryensya/vanilla/tile-checkbox",
    mount: "mountTileCheckbox",
    selector: "[data-sk-tile-checkbox]",
  },
  "/componentes/command-palette": {
    name: "CommandPalette",
    entrypoint: "@skryensya/vanilla/command-palette",
    mount: "mountCommandPalette",
    selector: "[data-sk-command-palette]",
  },
  "/componentes/date-picker": {
    name: "DatePicker",
    entrypoint: "@skryensya/vanilla/date-picker",
    mount: "mountDatePicker",
    selector: "[data-sk-date-picker]",
  },
  "/componentes/calendar": {
    name: "Calendar",
    entrypoint: "@skryensya/vanilla/calendar",
    mount: "mountCalendar",
    selector: "[data-sk-calendar]",
  },
  "/componentes/dialog": {
    name: "Dialog Vaul",
    entrypoint: "@skryensya/vanilla/vaul",
    mount: "mountVaul",
    selector: "[data-sk-dialog-vaul]",
  },
  "/componentes/drawer": {
    name: "Drawer Vaul",
    entrypoint: "@skryensya/vanilla/vaul",
    mount: "mountVaul",
    selector: "[data-sk-vaul]",
  },
  "/componentes/radio-group": {
    name: "TileRadioGroup",
    entrypoint: "@skryensya/vanilla/tile-radio-group",
    mount: "mountTileRadioGroup",
    selector: "[data-sk-tile-radio-group]",
  },
  "/componentes/segmented": {
    name: "SegmentedControl",
    entrypoint: "@skryensya/vanilla/segmented",
    mount: "mountSegmented",
    selector: "[data-sk-segmented]",
  },
  "/componentes/select": {
    name: "Select",
    entrypoint: "@skryensya/vanilla/select",
    mount: "mountSelect",
    selector: "[data-sk-select]",
  },
  "/componentes/sidebar": {
    name: "Sidebar",
    entrypoint: "@skryensya/vanilla/sidebar",
    mount: "mountSidebar",
    selector: "[data-sk-sidebar]",
  },
  "/componentes/slider": {
    name: "Slider",
    entrypoint: "@skryensya/vanilla/slider",
    mount: "mountSlider",
    selector: "[data-sk-slider]",
  },
  "/componentes/tabs": {
    name: "Tabs",
    entrypoint: "@skryensya/vanilla/tabs",
    mount: "mountTabs",
    selector: "[data-sk-tabs]",
  },
  "/componentes/toast": {
    name: "Toast",
    entrypoint: "@skryensya/vanilla/toast",
    mount: "mountToast",
    selector: "[data-sk-toast]",
  },
  "/componentes/toc": {
    name: "Toc",
    entrypoint: "@skryensya/vanilla/toc",
    mount: "mountToc",
    selector: "[data-sk-toc]",
  },
  "/componentes/tooltip": {
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
