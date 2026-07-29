import { createElement, type ReactNode, type RefObject } from "react";
import * as tagModule from "@skryensya/react/tag";
import * as progressModule from "@skryensya/react/progress";
import * as avatarModule from "@skryensya/react/avatar";
import * as typographyModule from "@skryensya/react/typography";
import * as layoutModule from "@skryensya/react/layout";
import * as breadcrumbModule from "@skryensya/react/breadcrumb";
import * as emptyStateModule from "@skryensya/react/empty-state";
import * as statModule from "@skryensya/react/stat";
import * as alertModule from "@skryensya/react/alert";
import * as processListModule from "@skryensya/react/process-list";
import * as stepsModule from "@skryensya/react/steps";
import * as listModule from "@skryensya/react/list";
import * as navbarModule from "@skryensya/react/navbar";
import * as toolbarModule from "@skryensya/react/toolbar";
import * as mediaGradientModule from "@skryensya/react/media-gradient";
import * as segmentedModule from "@skryensya/react/segmented";
import * as sliderModule from "@skryensya/react/slider";
import * as timeFieldModule from "@skryensya/react/time-field";
import * as fileUploadModule from "@skryensya/react/file-upload";
import * as carouselModule from "@skryensya/react/carousel";
import * as treeViewModule from "@skryensya/react/tree-view";
import * as sidebarModule from "@skryensya/react/sidebar";
import * as accordionModule from "@skryensya/react/accordion";
import * as tileModule from "@skryensya/react/tile";
import * as paginationModule from "@skryensya/react/pagination";
import * as themeToggleModule from "@skryensya/react/theme-toggle";
import * as contentModule from "@skryensya/react/content";
import * as numberFieldModule from "@skryensya/react/number-field";
import * as tooltipModule from "@skryensya/react/tooltip";
import * as badgeModule from "@skryensya/react/badge";
import * as kbdModule from "@skryensya/react/kbd";
import * as loaderModule from "@skryensya/react/loader";
import * as placeholderModule from "@skryensya/react/placeholder";
import * as buttonModule from "@skryensya/react/button";
import * as iconModule from "@skryensya/react/icon";
import * as imageFrameModule from "@skryensya/react/image-frame";
import * as inputModule from "@skryensya/react/input";
import * as navListModule from "@skryensya/react/nav-list";
import * as selectionModule from "@skryensya/react/selection";
import * as tableModule from "@skryensya/react/table";
import * as tabsModule from "@skryensya/react/tabs";
import { getContract, getSignature } from "@skryensya/ai-compiler/registry";
import {
  collectionItems,
  isUsageTree,
  slotItems,
  slotsOf,
  type ItemInput,
  type UsageTree,
} from "@skryensya/ai-compiler/usage-tree";

/*
 * A usage tree, rendered by the React binding.
 *
 * The modules are imported statically because a bundler cannot follow a specifier assembled at
 * runtime — and because a gate that could load anything would be proving less, not more. A contract
 * joins the map when it joins the catalogue.
 */
const modules: Record<string, Record<string, unknown>> = {
  "@skryensya/react/tag": tagModule,
  "@skryensya/react/progress": progressModule,
  "@skryensya/react/avatar": avatarModule,
  "@skryensya/react/typography": typographyModule,
  "@skryensya/react/layout": layoutModule,
  "@skryensya/react/breadcrumb": breadcrumbModule,
  "@skryensya/react/empty-state": emptyStateModule,
  "@skryensya/react/stat": statModule,
  "@skryensya/react/alert": alertModule,
  "@skryensya/react/process-list": processListModule,
  "@skryensya/react/steps": stepsModule,
  "@skryensya/react/list": listModule,
  "@skryensya/react/navbar": navbarModule,
  "@skryensya/react/toolbar": toolbarModule,
  "@skryensya/react/media-gradient": mediaGradientModule,
  "@skryensya/react/segmented": segmentedModule,
  "@skryensya/react/slider": sliderModule,
  "@skryensya/react/content": contentModule,
  "@skryensya/react/pagination": paginationModule,
  "@skryensya/react/accordion": accordionModule,
  "@skryensya/react/sidebar": sidebarModule,
  "@skryensya/react/carousel": carouselModule,
  "@skryensya/react/file-upload": fileUploadModule,
  "@skryensya/react/time-field": timeFieldModule,
  "@skryensya/react/tree-view": treeViewModule,
  "@skryensya/react/tile": tileModule,
  "@skryensya/react/theme-toggle": themeToggleModule,
  "@skryensya/react/number-field": numberFieldModule,
  "@skryensya/react/tooltip": tooltipModule,
  "@skryensya/react/badge": badgeModule,
  "@skryensya/react/kbd": kbdModule,
  "@skryensya/react/loader": loaderModule,
  "@skryensya/react/placeholder": placeholderModule,
  "@skryensya/react/button": buttonModule,
  "@skryensya/react/icon": iconModule,
  "@skryensya/react/image-frame": imageFrameModule,
  "@skryensya/react/input": inputModule,
  "@skryensya/react/nav-list": navListModule,
  "@skryensya/react/selection": selectionModule,
  "@skryensya/react/table": tableModule,
  "@skryensya/react/tabs": tabsModule,
};

/*
 * Anchored signatures portal their floating content to document.body by default, which puts it
 * outside the container the symmetry gate measures. Every binding now takes a `container`, so the
 * stage scopes the portal to the same form it renders into and G2 compares one subtree, not two
 * loose regions.
 */
let portalContainer: RefObject<HTMLElement> | undefined;

export function setPortalContainer(container: RefObject<HTMLElement>): void {
  portalContainer = container;
}

export function renderTree(tree: UsageTree, key?: string | number): ReactNode {
  const contract = getContract(tree.contract);
  if (!contract) throw new Error(`No contract "${tree.contract}".`);

  const signature = getSignature(contract, tree.signature);
  if (!signature) throw new Error(`No signature "${tree.signature}".`);

  // A forwardRef export is an object, not a function — NavListLink is one, so `typeof` is not the
  // question. What matters is that the module exports the name the contract points at.
  // A dotted name walks a compound binding's namespace: `Accordion.Item` is a property of the
  // exported root, which is how React spells "this piece only makes sense inside that one".
  const component = signature.react.name
    .split(".")
    .reduce<unknown>((held, key) => (held as Record<string, unknown>)?.[key], modules[signature.react.from]);
  if (component === undefined) {
    throw new Error(`${signature.react.from} exports no "${signature.react.name}".`);
  }

  /*
   * Options under the names the BINDING uses. A contract key is unique across its family, but two
   * signatures can each have a `size` over different values — so the contract keys one `headingSize`
   * and says the binding still calls it `size`.
   */
  const props: Record<string, unknown> = { key, ...tree.attrs };
  // Only the signatures that portal take a container; the rest would pass it to a DOM element.
  if (portalContainer && signature.portals) props.container = portalContainer;
  for (const [option, value] of Object.entries(tree.options ?? {})) {
    const declared = contract.options[option];
    props[declared?.prop ?? option] = value;
  }

  const slots = slotsOf(tree);
  for (const [slot, content] of Object.entries(slots)) {
    if (slot === "children") continue;
    // The binding's own name for this slot, when the contract keyed it differently.
    const slotProp = signature.slots[slot]?.prop ?? slot;

    // A collection stays DATA on this side: React takes the array and renders the repetition itself.
    // The markup emitter is the one that expands it, which is the asymmetry the template exists for.
    const entries = collectionItems(content);
    if (entries.length > 0) {
      props[slotProp] = entries.map(flattenEntry);
      continue;
    }

    // Every other slot is a prop; the part template is what turns it into markup.
    const items = slotItems(content);
    props[slotProp] = items.length === 1 && !isUsageTree(items[0]!) ? items[0] : items.map(renderItem);
  }

  const children = slotItems(slots.children).map((item, index) =>
    isUsageTree(item) ? renderTree(item, index) : item,
  );

  return createElement(component as never, props, ...children);
}

/**
 * One entry as the flat object a React binding takes — and a slot holding MORE ENTRIES flattened
 * the same way, one level down, because a folder's children are folders.
 */
function flattenEntry(entry: ItemInput): Record<string, unknown> {
  const flat: Record<string, unknown> = { ...entry.options };

  for (const [field, value] of Object.entries(entry.slots)) {
    const nested = collectionItems(value);
    if (nested.length > 0) {
      flat[field] = nested.map(flattenEntry);
      continue;
    }

    const values = slotItems(value);
    flat[field] = values.length === 1 && !isUsageTree(values[0]!) ? values[0] : values.map(renderItem);
  }

  return flat;
}

function renderItem(item: string | UsageTree, index: number): ReactNode {
  return isUsageTree(item) ? renderTree(item, index) : item;
}
