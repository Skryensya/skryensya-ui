import { boxContract, layoutContract, wrapperContract } from "./layout.js";
import { heroContract } from "./hero.js";
import { folderContract } from "./folder.js";
import { footerContract } from "./footer.js";
import { typographyContract } from "./typography.js";
import { breadcrumbContract } from "./breadcrumb.js";
import { emptyStateContract } from "./empty-state.js";
import { statContract } from "./stat.js";
import { calloutContract } from "./callout.js";
import { processListContract } from "./process-list.js";
import { changelogContract } from "./changelog.js";
import { chartContract } from "./chart.js";
import { stepsContract } from "./steps.js";
import { listContract } from "./list.js";
import { mediaGradientContract } from "./media-gradient.js";
import { timeFieldContract } from "./time-field.js";
import { fileUploadContract } from "./file-upload.js";
import { carouselContract } from "./carousel.js";
import { fadeEdgeContract } from "./fade-edge.js";
import { qrCodeContract } from "./qr-code.js";
import { marqueeContract } from "./marquee.js";
import { treeViewContract } from "./tree-view.js";
import { sidebarContract } from "./sidebar.js";
import { skipLinkContract } from "./skip-link.js";
import { annotationContract } from "./annotation.js";
import { backToTopContract } from "./back-to-top.js";
import { accordionContract } from "./accordion.js";
import { tileContract } from "./tile.js";
import { paginationContract, tablePagerContract } from "./pagination.js";
import { iconStateButtonContract } from "./icon-state-button.js";
import { contentContract } from "./content.js";
import { numberFieldContract } from "./number-field.js";
import { navbarContract } from "./navbar.js";
import { toolbarContract } from "./toolbar.js";
import { editorContract } from "./editor.js";
import { tooltipContract } from "./tooltip.js";
import { selectContract } from "./select.js";
import { menuContract } from "./menu.js";
import { menubarContract } from "./menubar.js";
import { megamenuContract } from "./megamenu.js";
import { meterContract } from "./meter.js";
import { dataGridContract } from "./data-grid.js";
import { feedContract } from "./feed.js";
import { commentThreadContract } from "./comment-thread.js";
import { comboboxContract } from "./combobox.js";
import { calendarContract } from "./calendar.js";
import { datePickerContract } from "./date-picker.js";
import { colorPickerContract } from "./color-picker.js";
import { dialogContract } from "./dialog.js";
import { splitButtonContract } from "./split-button.js";
import { popoverContract } from "./popover.js";
import { commandPaletteContract } from "./command-palette.js";
import { codePreviewContract } from "./code-preview.js";
import { segmentedContract } from "./segmented.js";
import { sliderContract } from "./slider.js";
import { avatarContract } from "./avatar.js";
import { progressContract } from "./progress.js";
import { tagContract } from "./tag.js";
import { badgeContract } from "./badge.js";
import { kbdContract } from "./kbd.js";
import { loaderContract } from "./loader.js";
import { placeholderContract } from "./placeholder.js";
import { buttonContract } from "./button.js";
import { checkboxContract, radioGroupContract, switchContract } from "./selection.js";
import { formFieldContract } from "./form-field.js";
import { iconContract } from "./icon.js";
import { inputContract } from "./input.js";
import { imageFrameContract } from "./image-frame.js";
import { navListContract } from "./nav-list.js";
import { tableContract } from "./table.js";
import { treegridContract } from "./treegrid.js";
import { tabsContract } from "./tabs.js";
import { tocContract } from "./toc.js";
import { componentPreviewContract } from "./component-preview.js";
import { detailsContract } from "./details.js";
import { vaulContract } from "./vaul.js";
import type { ComponentContract, ContractSignature } from "./contract.js";

/*
 * The catalogue, imported rather than parsed. A contract is a value (decision 28), so there is no
 * extraction step here and no TypeScript Program: the compiler holds the same object the bindings
 * hold, which is the whole reason the three can never drift apart.
 *
 * A family joins this list when its contract passes the gates, never because it exists in the kit.
 * A half-described family is worse than an absent one: the agent would compose against it.
 */
export const contracts = {
  avatar: avatarContract,
  "back-to-top": backToTopContract,
  badge: badgeContract,
  box: boxContract,
  breadcrumb: breadcrumbContract,
  button: buttonContract,
  callout: calloutContract,
  chart: chartContract,
  checkbox: checkboxContract,
  "empty-state": emptyStateContract,
  "form-field": formFieldContract,
  hero: heroContract,
  folder: folderContract,
  footer: footerContract,
  icon: iconContract,
  "image-frame": imageFrameContract,
  "fade-edge": fadeEdgeContract,
  "qr-code": qrCodeContract,
  kbd: kbdContract,
  layout: layoutContract,
  list: listContract,
  loader: loaderContract,
  "media-gradient": mediaGradientContract,
  input: inputContract,
  "nav-list": navListContract,
  navbar: navbarContract,
  content: contentContract,
  pagination: paginationContract,
  "table-pager": tablePagerContract,
  accordion: accordionContract,
  sidebar: sidebarContract,
  "skip-link": skipLinkContract,
  carousel: carouselContract,
  marquee: marqueeContract,
  "file-upload": fileUploadContract,
  "time-field": timeFieldContract,
  "tree-view": treeViewContract,
  tile: tileContract,
  "icon-state-button": iconStateButtonContract,
  "number-field": numberFieldContract,
  placeholder: placeholderContract,
  "process-list": processListContract,
  changelog: changelogContract,
  progress: progressContract,
  "radio-group": radioGroupContract,
  segmented: segmentedContract,
  slider: sliderContract,
  stat: statContract,
  steps: stepsContract,
  switch: switchContract,
  table: tableContract,
  treegrid: treegridContract,
  tag: tagContract,
  toolbar: toolbarContract,
  editor: editorContract,
  tooltip: tooltipContract,
  select: selectContract,
  menu: menuContract,
  menubar: menubarContract,
  megamenu: megamenuContract,
  meter: meterContract,
  "data-grid": dataGridContract,
  feed: feedContract,
  "comment-thread": commentThreadContract,
  combobox: comboboxContract,
  calendar: calendarContract,
  "date-picker": datePickerContract,
  "color-picker": colorPickerContract,
  dialog: dialogContract,
  "split-button": splitButtonContract,
  popover: popoverContract,
  "command-palette": commandPaletteContract,
  "code-preview": codePreviewContract,
  typography: typographyContract,
  wrapper: wrapperContract,
  tabs: tabsContract,
  toc: tocContract,
  details: detailsContract,
  vaul: vaulContract,
  "component-preview": componentPreviewContract,
  annotation: annotationContract,
} as const satisfies Record<string, ComponentContract>;

export type ContractId = keyof typeof contracts;

export function getContract(id: string): ComponentContract | undefined {
  return (contracts as Record<string, ComponentContract>)[id];
}

export function getSignature(
  contract: ComponentContract,
  id: string,
): ContractSignature | undefined {
  return contract.signatures[id];
}

export function contractIds(): readonly string[] {
  return Object.keys(contracts);
}
