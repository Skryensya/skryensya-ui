import { boxContract, layoutContract, wrapperContract } from "@skryensya/core/layout";
import { typographyContract } from "@skryensya/core/typography";
import { breadcrumbContract } from "@skryensya/core/breadcrumb";
import { emptyStateContract } from "@skryensya/core/empty-state";
import { statContract } from "@skryensya/core/stat";
import { calloutContract } from "@skryensya/core/callout";
import { processListContract } from "@skryensya/core/process-list";
import { changelogContract } from "@skryensya/core/changelog";
import { stepsContract } from "@skryensya/core/steps";
import { listContract } from "@skryensya/core/list";
import { mediaGradientContract } from "@skryensya/core/media-gradient";
import { timeFieldContract } from "@skryensya/core/time-field";
import { fileUploadContract } from "@skryensya/core/file-upload";
import { carouselContract } from "@skryensya/core/carousel";
import { treeViewContract } from "@skryensya/core/tree-view";
import { sidebarContract } from "@skryensya/core/sidebar";
import { skipLinkContract } from "@skryensya/core/skip-link";
import { accordionContract } from "@skryensya/core/accordion";
import { tileContract } from "@skryensya/core/tile";
import { paginationContract, tablePagerContract } from "@skryensya/core/pagination";
import { iconStateButtonContract } from "@skryensya/core/icon-state-button";
import { contentContract } from "@skryensya/core/content";
import { numberFieldContract } from "@skryensya/core/number-field";
import { navbarContract } from "@skryensya/core/navbar";
import { toolbarContract } from "@skryensya/core/toolbar";
import { tooltipContract } from "@skryensya/core/tooltip";
import { selectContract } from "@skryensya/core/select";
import { menuContract } from "@skryensya/core/menu";
import { menubarContract } from "@skryensya/core/menubar";
import { megamenuContract } from "@skryensya/core/megamenu";
import { meterContract } from "@skryensya/core/meter";
import { dataGridContract } from "@skryensya/core/data-grid";
import { feedContract } from "@skryensya/core/feed";
import { comboboxContract } from "@skryensya/core/combobox";
import { calendarContract } from "@skryensya/core/calendar";
import { datePickerContract } from "@skryensya/core/date-picker";
import { dialogContract } from "@skryensya/core/dialog";
import { splitButtonContract } from "@skryensya/core/split-button";
import { popoverContract } from "@skryensya/core/popover";
import { commandPaletteContract } from "@skryensya/core/command-palette";
import { codePreviewContract } from "@skryensya/core/code-preview";
import { segmentedContract } from "@skryensya/core/segmented";
import { sliderContract } from "@skryensya/core/slider";
import { avatarContract } from "@skryensya/core/avatar";
import { progressContract } from "@skryensya/core/progress";
import { tagContract } from "@skryensya/core/tag";
import { badgeContract } from "@skryensya/core/badge";
import { kbdContract } from "@skryensya/core/kbd";
import { loaderContract } from "@skryensya/core/loader";
import { placeholderContract } from "@skryensya/core/placeholder";
import { buttonContract } from "@skryensya/core/button";
import { checkboxContract, radioGroupContract, switchContract } from "@skryensya/core/selection";
import { formFieldContract } from "@skryensya/core/form-field";
import { iconContract } from "@skryensya/core/icon";
import { inputContract } from "@skryensya/core/input";
import { imageFrameContract } from "@skryensya/core/image-frame";
import { navListContract } from "@skryensya/core/nav-list";
import { tableContract } from "@skryensya/core/table";
import { treegridContract } from "@skryensya/core/treegrid";
import { tabsContract } from "@skryensya/core/tabs";
import { tocContract } from "@skryensya/core/toc";
import { componentPreviewContract } from "@skryensya/core/component-preview";
import { detailsContract } from "@skryensya/core/details";
import { vaulContract } from "@skryensya/core/vaul";
import type {
  ComponentContract,
  ContractOption,
  ContractSignature,
} from "@skryensya/core/contract";

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
  badge: badgeContract,
  box: boxContract,
  breadcrumb: breadcrumbContract,
  button: buttonContract,
  callout: calloutContract,
  checkbox: checkboxContract,
  "empty-state": emptyStateContract,
  "form-field": formFieldContract,
  icon: iconContract,
  "image-frame": imageFrameContract,
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
  tooltip: tooltipContract,
  select: selectContract,
  menu: menuContract,
  menubar: menubarContract,
  megamenu: megamenuContract,
  meter: meterContract,
  "data-grid": dataGridContract,
  feed: feedContract,
  combobox: comboboxContract,
  calendar: calendarContract,
  "date-picker": datePickerContract,
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

/** The options a signature accepts, in the contract's declaration order. Order is the emitted order. */
export function signatureOptions(
  contract: ComponentContract,
  signature: ContractSignature,
): readonly [string, ContractOption][] {
  return Object.entries(contract.options).filter(([name]) => signature.options.includes(name));
}

export function contractIds(): readonly string[] {
  return Object.keys(contracts);
}
