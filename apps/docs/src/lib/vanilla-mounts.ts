import { canonicalPath } from "../i18n";

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
  "/components/listbox": {
    name: "Listbox",
    entrypoint: "@skryensya/vanilla/listbox",
    mount: "mountListbox",
    selector: "[data-sk-listbox]",
  },
  "/components/clipboard": {
    name: "Clipboard",
    entrypoint: "@skryensya/vanilla/clipboard",
    mount: "mountClipboard",
    selector: "[data-sk-clipboard]",
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
  "/components/fade-edge": {
    name: "FadeEdge",
    entrypoint: "@skryensya/vanilla/fade-edge",
    mount: "mountFadeEdge",
    selector: "[data-sk-fade-edge][data-scroll-aware]",
  },
  "/components/password-input": {
    name: "PasswordInput",
    entrypoint: "@skryensya/vanilla/password-input",
    mount: "mountPasswordInput",
    selector: "[data-sk-password-input]",
  },
  "/components/qr-code": {
    name: "QRCode",
    entrypoint: "@skryensya/vanilla/qr-code",
    mount: "mountQrCode",
    selector: "[data-sk-qr-code]",
  },
  "/components/tour": {
    name: "Tour",
    entrypoint: "@skryensya/vanilla/tour",
    mount: "mountTour",
    selector: "[data-sk-tour]",
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

/**
 * The mount seam for a page, from either locale's URL.
 *
 * The catalogue is keyed by the canonical (English) route because a mount seam is a package fact,
 * not a translated one; `canonicalPath` is the same normaliser `component-icons.ts` already uses to
 * look a page up from whichever URL the reader is on.
 *
 * `undefined` is a real answer and the common one: 18 routes own an enhancer, and the rest are
 * native controls or CSS-only modules whose Vanilla story is a stylesheet import and nothing else.
 */
export function vanillaMountFor(pathname: string): VanillaMountDocumentation | undefined {
  return (vanillaMounts as Record<string, VanillaMountDocumentation>)[canonicalPath(pathname)];
}
