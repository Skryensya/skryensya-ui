import { boxContract, layoutContract, wrapperContract } from "@skryensya/core/layout";
import { typographyContract } from "@skryensya/core/typography";
import { breadcrumbContract } from "@skryensya/core/breadcrumb";
import { emptyStateContract } from "@skryensya/core/empty-state";
import { statContract } from "@skryensya/core/stat";
import { alertContract } from "@skryensya/core/alert";
import { processListContract } from "@skryensya/core/process-list";
import { stepsContract } from "@skryensya/core/steps";
import { listContract } from "@skryensya/core/list";
import { mediaGradientContract } from "@skryensya/core/media-gradient";
import { carouselContract } from "@skryensya/core/carousel";
import { treeViewContract } from "@skryensya/core/tree-view";
import { sidebarContract } from "@skryensya/core/sidebar";
import { accordionContract } from "@skryensya/core/accordion";
import { tileContract } from "@skryensya/core/tile";
import { paginationContract } from "@skryensya/core/pagination";
import { themeToggleContract } from "@skryensya/core/theme-toggle";
import { contentContract } from "@skryensya/core/content";
import { numberFieldContract } from "@skryensya/core/number-field";
import { navbarContract } from "@skryensya/core/navbar";
import { toolbarContract } from "@skryensya/core/toolbar";
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
import { fieldContract } from "@skryensya/core/field";
import { iconContract } from "@skryensya/core/icon";
import { inputContract } from "@skryensya/core/input";
import { imageFrameContract } from "@skryensya/core/image-frame";
import { navListContract } from "@skryensya/core/nav-list";
import { tableContract } from "@skryensya/core/table";
import { tabsContract } from "@skryensya/core/tabs";
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
 * A half-described family is worse than an absent one — the agent would compose against it.
 */
export const contracts = {
  alert: alertContract,
  avatar: avatarContract,
  badge: badgeContract,
  box: boxContract,
  breadcrumb: breadcrumbContract,
  button: buttonContract,
  checkbox: checkboxContract,
  "empty-state": emptyStateContract,
  field: fieldContract,
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
  accordion: accordionContract,
  sidebar: sidebarContract,
  carousel: carouselContract,
  "tree-view": treeViewContract,
  tile: tileContract,
  "theme-toggle": themeToggleContract,
  "number-field": numberFieldContract,
  placeholder: placeholderContract,
  "process-list": processListContract,
  progress: progressContract,
  "radio-group": radioGroupContract,
  segmented: segmentedContract,
  slider: sliderContract,
  stat: statContract,
  steps: stepsContract,
  switch: switchContract,
  table: tableContract,
  tag: tagContract,
  toolbar: toolbarContract,
  typography: typographyContract,
  wrapper: wrapperContract,
  tabs: tabsContract,
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
