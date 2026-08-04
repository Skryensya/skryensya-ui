import { createElement, type ReactNode, type RefObject } from "react";
import * as tagModule from "./components/tag.js";
import * as progressModule from "./components/progress.js";
import * as avatarModule from "./components/avatar.js";
import * as typographyModule from "./components/typography.js";
import * as layoutModule from "./components/layout.js";
import * as breadcrumbModule from "./components/breadcrumb.js";
import * as emptyStateModule from "./components/empty-state.js";
import * as statModule from "./components/stat.js";
import * as calloutModule from "./components/callout.js";
import * as processListModule from "./components/process-list.js";
import * as stepsModule from "./components/steps.js";
import * as listModule from "./components/list.js";
import * as navbarModule from "./components/navbar.js";
import * as toolbarModule from "./components/toolbar.js";
import * as mediaGradientModule from "./components/media-gradient.js";
import * as segmentedModule from "./components/segmented.js";
import * as sliderModule from "./components/slider.js";
import * as flyoutModule from "./components/flyout.js";
import * as timeFieldModule from "./components/time-field.js";
import * as fileUploadModule from "./components/file-upload.js";
import * as carouselModule from "./components/carousel.js";
import * as treeViewModule from "./components/tree-view.js";
import * as sidebarModule from "./components/sidebar.js";
import * as accordionModule from "./components/accordion.js";
import * as tileModule from "./components/tile.js";
import * as paginationModule from "./components/pagination.js";
import * as themeToggleModule from "./components/theme-toggle.js";
import * as contentModule from "./components/content.js";
import * as numberFieldModule from "./components/number-field.js";
import * as tooltipModule from "./components/tooltip.js";
import * as selectModule from "./components/select.js";
import * as menuModule from "./components/menu.js";
import * as comboboxModule from "./components/combobox.js";
import * as calendarModule from "./components/calendar.js";
import * as datePickerModule from "./components/date-picker.js";
import * as copyButtonModule from "./components/copy-button.js";
import * as dialogModule from "./components/dialog.js";
import * as splitButtonModule from "./components/split-button.js";
import * as popoverModule from "./components/popover.js";
import * as commandPaletteModule from "./components/command-palette.js";
import * as codePreviewModule from "./components/code-preview.js";
import * as detailsModule from "./components/details.js";
import * as vaulModule from "./components/vaul.js";
import * as selectNativeModule from "./components/select-native.js";
import * as badgeModule from "./components/badge.js";
import * as kbdModule from "./components/kbd.js";
import * as loaderModule from "./components/loader.js";
import * as placeholderModule from "./components/placeholder.js";
import * as buttonModule from "./components/button.js";
import * as iconModule from "./components/icon.js";
import * as imageFrameModule from "./components/image-frame.js";
import * as inputModule from "./components/input.js";
import * as navListModule from "./components/nav-list.js";
import * as selectionModule from "./components/selection.js";
import * as tableModule from "./components/table.js";
import * as tabsModule from "./components/tabs.js";
import * as tocModule from "./components/toc.js";
import * as componentPreviewModule from "./components/component-preview.js";
import type { ContractSlot } from "@skryensya/core/contract";
import { getContract, getSignature } from "@skryensya/ai-compiler/registry";
import { jsxPropName } from "@skryensya/ai-compiler/emit";
import {
  collectionItems,
  isUsageTree,
  slotItems,
  slotsOf,
  type ItemInput,
  type UsageTree,
} from "@skryensya/ai-compiler/usage-tree";

/*
 * A usage tree, rendered by the React binding. THE renderer: the gates measure what it produces and
 * the docs site shows it, so a demo and its evidence are the same call.
 *
 * It lives here, in the binding, because this package already owns every component: a renderer in
 * the gates would have needed its own copy of the module map, which is the duplication this whole
 * system argues against.
 *
 * The modules are imported statically because a bundler cannot follow a specifier assembled at
 * runtime, and because a renderer that could load anything would be proving less, not more. A
 * contract joins the map when it joins the catalogue.
 */
const modules: Record<string, Record<string, unknown>> = {
  "@skryensya/react/select": selectModule,
  "@skryensya/react/menu": menuModule,
  "@skryensya/react/combobox": comboboxModule,
  "@skryensya/react/calendar": calendarModule,
  "@skryensya/react/date-picker": datePickerModule,
  "@skryensya/react/copy-button": copyButtonModule,
  "@skryensya/react/dialog": dialogModule,
  "@skryensya/react/split-button": splitButtonModule,
  "@skryensya/react/popover": popoverModule,
  "@skryensya/react/command-palette": commandPaletteModule,
  "@skryensya/react/code-preview": codePreviewModule,
  "@skryensya/react/details": detailsModule,
  "@skryensya/react/vaul": vaulModule,
  "@skryensya/react/select-native": selectNativeModule,
  "@skryensya/react/tag": tagModule,
  "@skryensya/react/progress": progressModule,
  "@skryensya/react/avatar": avatarModule,
  "@skryensya/react/typography": typographyModule,
  "@skryensya/react/layout": layoutModule,
  "@skryensya/react/breadcrumb": breadcrumbModule,
  "@skryensya/react/empty-state": emptyStateModule,
  "@skryensya/react/stat": statModule,
  "@skryensya/react/callout": calloutModule,
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
  "@skryensya/react/flyout": flyoutModule,
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
  "@skryensya/react/toc": tocModule,
  "@skryensya/react/component-preview": componentPreviewModule,
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

  // A forwardRef export is an object, not a function; NavListLink is one, so `typeof` is not the
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
   * signatures can each have a `size` over different values; the contract keys one `headingSize`
   * and says the binding still calls it `size`.
   */
  // `attrs` are written in HTML spelling; React wants its own for a handful of them, and it has to
  // be the SAME handful the emitter renames or the snippet stops describing the stage beside it.
  const props: Record<string, unknown> = { key };
  for (const [attr, value] of Object.entries(tree.attrs ?? {})) props[jsxPropName(attr)] = value;
  // Only the signatures that portal take a container; the rest would pass it to a DOM element.
  if (portalContainer && signature.portals) props.container = portalContainer;
  const optionStyle: Record<string, string | number> = {};
  for (const [option, value] of Object.entries(tree.options ?? {})) {
    const declared = contract.options[option];
    if (declared?.styleProperty) {
      optionStyle[declared.styleProperty] =
        typeof value === "number" ? value : String(value);
      continue;
    }
    props[declared?.prop ?? option] = value;
  }
  if (Object.keys(optionStyle).length > 0) {
    props.style = { ...(props.style as object | undefined), ...optionStyle };
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
      props[slotProp] = entries.map((entry) => flattenEntry(entry, signature.slots[slot]?.item));
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
 * One entry as the flat object a React binding takes; a slot holding MORE ENTRIES flattened
 * the same way, one level down, because a folder's children are folders.
 */
function flattenEntry(entry: ItemInput, shape?: ContractSlot["item"]): Record<string, unknown> {
  const flat: Record<string, unknown> = { ...entry.options };

  for (const [field, value] of Object.entries(entry.slots)) {
    // The binding's own name for this field, when the contract keyed it differently; a tile
    // option's content is `label` in the contract and `children` in React.
    const name = shape?.slots[field]?.prop ?? field;

    const nested = collectionItems(value);
    if (nested.length > 0) {
      flat[name] = nested.map((child) => flattenEntry(child, shape));
      continue;
    }

    const values = slotItems(value);
    flat[name] = values.length === 1 && !isUsageTree(values[0]!) ? values[0] : values.map(renderItem);
  }

  return flat;
}

function renderItem(item: string | UsageTree, index: number): ReactNode {
  return isUsageTree(item) ? renderTree(item, index) : item;
}
