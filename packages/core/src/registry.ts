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
import { descriptionListContract } from "./description-list.js";
import { quoteContract } from "./quote.js";
import { separatorContract } from "./separator.js";
import { tagsInputContract } from "./tags-input.js";
import { timelineContract } from "./timeline.js";
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
import { diagramContract } from "./diagram.js";
import { backToTopContract } from "./back-to-top.js";
import { accordionContract } from "./accordion.js";
import { tileContract } from "./tile.js";
import { paginationContract, tablePagerContract } from "./pagination.js";
import { stateButtonContract } from "./state-button.js";
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
import { ratingContract } from "./rating.js";
import { otpInputContract } from "./otp-input.js";
import { dataGridContract } from "./data-grid.js";
import { feedContract } from "./feed.js";
import { commentThreadContract } from "./comment-thread.js";
import { questionnaireContract } from "./questionnaire.js";
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
/*
 * KEYED BY THE CONTRACT'S OWN `id`, never by a key typed beside it.
 *
 * This map used to spell both: `"back-to-top": backToTopContract`. The two always agreed - measured,
 * 81 of 81 - but they agreed by care, and the key was the half nothing checked. A contract knows its
 * own id; asking it is strictly better than repeating it, and it makes the one mistake this shape
 * allowed (a key that does not match the contract it points at) impossible to write.
 *
 * The mapped type is what keeps `ContractId` a union of the real ids rather than `string`: each
 * contract is declared `as const satisfies ComponentContract`, so its `id` is a literal and survives.
 */
function fromContracts<const T extends readonly ComponentContract[]>(
  ...list: T
): { readonly [C in T[number] as C["id"]]: C } {
  return Object.fromEntries(list.map((contract) => [contract.id, contract])) as never;
}

export const contracts = fromContracts(
  avatarContract,
  backToTopContract,
  badgeContract,
  boxContract,
  breadcrumbContract,
  buttonContract,
  calloutContract,
  chartContract,
  checkboxContract,
  emptyStateContract,
  formFieldContract,
  heroContract,
  folderContract,
  footerContract,
  iconContract,
  imageFrameContract,
  fadeEdgeContract,
  qrCodeContract,
  kbdContract,
  layoutContract,
  listContract,
  loaderContract,
  mediaGradientContract,
  inputContract,
  navListContract,
  navbarContract,
  contentContract,
  paginationContract,
  tablePagerContract,
  accordionContract,
  sidebarContract,
  skipLinkContract,
  carouselContract,
  marqueeContract,
  fileUploadContract,
  timeFieldContract,
  treeViewContract,
  tileContract,
  stateButtonContract,
  numberFieldContract,
  placeholderContract,
  processListContract,
  changelogContract,
  descriptionListContract,
  quoteContract,
  separatorContract,
  tagsInputContract,
  timelineContract,
  progressContract,
  radioGroupContract,
  segmentedContract,
  sliderContract,
  statContract,
  stepsContract,
  switchContract,
  tableContract,
  treegridContract,
  tagContract,
  toolbarContract,
  editorContract,
  tooltipContract,
  selectContract,
  menuContract,
  menubarContract,
  megamenuContract,
  meterContract,
  ratingContract,
  otpInputContract,
  dataGridContract,
  feedContract,
  commentThreadContract,
  questionnaireContract,
  comboboxContract,
  calendarContract,
  datePickerContract,
  colorPickerContract,
  dialogContract,
  splitButtonContract,
  popoverContract,
  commandPaletteContract,
  codePreviewContract,
  typographyContract,
  wrapperContract,
  tabsContract,
  tocContract,
  vaulContract,
  componentPreviewContract,
  annotationContract,
  diagramContract,
);

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
