import { createElement, type ReactNode, type RefObject } from "react";
import type { ContractSlot } from "@skryensya/core/contract";
import { getContract, getSignature } from "@skryensya/core/registry";
import { resolveReactProps } from "@skryensya/core/react-props";
import {
  collectionItems,
  reactCollectionEntry,
  isUsageTree,
  slotItems,
  slotsOf,
  type ItemInput,
  type UsageTree,
} from "@skryensya/core/usage-tree";

/*
 * A usage tree, rendered by the React binding. THE renderer: the gates measure what it produces and
 * the docs site shows it, so a demo and its evidence are the same call.
 *
 * It lives here, in the binding, because this package already owns every component: a renderer in
 * the gates would have needed its own copy of the module map, which is the duplication this whole
 * system argues against.
 *
 * Every specifier is written out because a bundler cannot follow one assembled at runtime, and
 * because a renderer that could load anything would be proving less, not more. A contract joins
 * the map when it joins the catalogue.
 *
 * They are LOADERS, not static imports. Static, every React stage paid for the whole binding
 * (~2MB: an Accordion demo pulled in date-picker's machine, combobox, tree-view, color-picker), in
 * every preview frame on a page, including the ones prewarmed behind a tab nobody clicked. Now a
 * tree loads the families it names and nothing else: `await loadTree(tree)`, then `renderTree`.
 */
const loaders: Record<string, () => Promise<Record<string, unknown>>> = {
  "@skryensya/react/annotation": () => import("./components/annotation.js"),
  "@skryensya/react/diagram": () => import("./components/diagram.js"),
  "@skryensya/react/select": () => import("./components/select.js"),
  "@skryensya/react/menu": () => import("./components/menu.js"),
  "@skryensya/react/combobox": () => import("./components/combobox.js"),
  "@skryensya/react/calendar": () => import("./components/calendar.js"),
  "@skryensya/react/date-picker": () => import("./components/date-picker.js"),
  "@skryensya/react/dialog": () => import("./components/dialog.js"),
  "@skryensya/react/split-button": () => import("./components/split-button.js"),
  "@skryensya/react/popover": () => import("./components/popover.js"),
  "@skryensya/react/window": () => import("./components/window.js"),
  "@skryensya/react/command-palette": () => import("./components/command-palette.js"),
  "@skryensya/react/code-preview": () => import("./components/code-preview.js"),
  "@skryensya/react/details": () => import("./components/details.js"),
  "@skryensya/react/vaul": () => import("./components/vaul.js"),
  "@skryensya/react/select-native": () => import("./components/select-native.js"),
  "@skryensya/react/tag": () => import("./components/tag.js"),
  "@skryensya/react/progress": () => import("./components/progress.js"),
  "@skryensya/react/avatar": () => import("./components/avatar.js"),
  "@skryensya/react/typography": () => import("./components/typography.js"),
  "@skryensya/react/layout": () => import("./components/layout.js"),
  "@skryensya/react/breadcrumb": () => import("./components/breadcrumb.js"),
  "@skryensya/react/empty-state": () => import("./components/empty-state.js"),
  "@skryensya/react/stat": () => import("./components/stat.js"),
  "@skryensya/react/callout": () => import("./components/callout.js"),
  "@skryensya/react/process-list": () => import("./components/process-list.js"),
  "@skryensya/react/description-list": () => import("./components/description-list.js"),
  "@skryensya/react/quote": () => import("./components/quote.js"),
  "@skryensya/react/tags-input": () => import("./components/tags-input.js"),
  "@skryensya/react/separator": () => import("./components/separator.js"),
  "@skryensya/react/timeline": () => import("./components/timeline.js"),
  "@skryensya/react/changelog": () => import("./components/changelog.js"),
  "@skryensya/react/steps": () => import("./components/steps.js"),
  "@skryensya/react/list": () => import("./components/list.js"),
  "@skryensya/react/navbar": () => import("./components/navbar.js"),
  "@skryensya/react/toolbar": () => import("./components/toolbar.js"),
  "@skryensya/react/media-gradient": () => import("./components/media-gradient.js"),
  "@skryensya/react/segmented": () => import("./components/segmented.js"),
  "@skryensya/react/slider": () => import("./components/slider.js"),
  "@skryensya/react/content": () => import("./components/content.js"),
  "@skryensya/react/pagination": () => import("./components/pagination.js"),
  "@skryensya/react/accordion": () => import("./components/accordion.js"),
  "@skryensya/react/sidebar": () => import("./components/sidebar.js"),
  "@skryensya/react/back-to-top": () => import("./components/back-to-top.js"),
  "@skryensya/react/canvas": () => import("./components/canvas.js"),
  "@skryensya/react/lightbox": () => import("./components/lightbox.js"),
  "@skryensya/react/tour": () => import("./components/tour.js"),
  "@skryensya/react/clipboard": () => import("./components/clipboard.js"),
  "@skryensya/react/listbox": () => import("./components/listbox.js"),
  /* Named by their contracts and missing from this map since it went lazy, which failed the gate stage. */
  "@skryensya/react/otp-input": () => import("./components/otp-input.js"),
  "@skryensya/react/rating": () => import("./components/rating.js"),
  "@skryensya/react/skip-link": () => import("./components/skip-link.js"),
  "@skryensya/react/carousel": () => import("./components/carousel.js"),
  "@skryensya/react/marquee": () => import("./components/marquee.js"),
  "@skryensya/react/file-upload": () => import("./components/file-upload.js"),
  "@skryensya/react/time-field": () => import("./components/time-field.js"),
  "@skryensya/react/tree-view": () => import("./components/tree-view.js"),
  "@skryensya/react/tile": () => import("./components/tile.js"),
  "@skryensya/react/state-button": () => import("./components/state-button.js"),
  "@skryensya/react/number-field": () => import("./components/number-field.js"),
  "@skryensya/react/tooltip": () => import("./components/tooltip.js"),
  "@skryensya/react/badge": () => import("./components/badge.js"),
  "@skryensya/react/color-picker": () => import("./components/color-picker.js"),
  "@skryensya/react/kbd": () => import("./components/kbd.js"),
  "@skryensya/react/loader": () => import("./components/loader.js"),
  "@skryensya/react/placeholder": () => import("./components/placeholder.js"),
  "@skryensya/react/button": () => import("./components/button.js"),
  "@skryensya/react/icon": () => import("./components/icon.js"),
  "@skryensya/react/image-frame": () => import("./components/image-frame.js"),
  "@skryensya/react/sticker": () => import("./components/sticker.js"),
  "@skryensya/react/fade-edge": () => import("./components/fade-edge.js"),
  "@skryensya/react/presence": () => import("./components/presence.js"),
  "@skryensya/react/password-input": () => import("./components/password-input.js"),
  "@skryensya/react/qr-code": () => import("./components/qr-code.js"),
  "@skryensya/react/form-field": () => import("./components/form-field.js"),
  "@skryensya/react/input": () => import("./components/input.js"),
  "@skryensya/react/nav-list": () => import("./components/nav-list.js"),
  "@skryensya/react/selection": () => import("./components/selection.js"),
  "@skryensya/react/table": () => import("./components/table.js"),
  "@skryensya/react/treegrid": () => import("./components/treegrid.js"),
  "@skryensya/react/meter": () => import("./components/meter.js"),
  "@skryensya/react/chart": () => import("./components/chart.js"),
  "@skryensya/react/data-grid": () => import("./components/data-grid.js"),
  "@skryensya/react/feed": () => import("./components/feed.js"),
  "@skryensya/react/comment-thread": () => import("./components/comment-thread.js"),
  "@skryensya/react/questionnaire": () => import("./components/questionnaire.js"),
  "@skryensya/react/menubar": () => import("./components/menubar.js"),
  "@skryensya/react/megamenu": () => import("./components/megamenu.js"),
  "@skryensya/react/tabs": () => import("./components/tabs.js"),
  "@skryensya/react/toc": () => import("./components/toc.js"),
  "@skryensya/react/component-preview": () => import("./components/component-preview.js"),
  "@skryensya/react/editor": () => import("./components/editor.js"),
  "@skryensya/react/folder": () => import("./components/folder.js"),
};

/*
 * Anchored signatures portal their floating content to document.body by default, which puts it
 * outside the container the symmetry gate measures. Every binding now takes a `container`, so the
 * stage scopes the portal to the same form it renders into and G2 compares one subtree, not two
 * loose regions.
 */
let portalContainer: RefObject<HTMLElement> | undefined;

/** The loaded modules, by the specifier a signature's `react.from` names. Filled by `loadTree`. */
const modules: Record<string, Record<string, unknown>> = {};

/** Every `react.from` a tree reaches, nested trees in slots and collection entries included. */
function specifiersOf(value: unknown, into: Set<string>): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) specifiersOf(item, into);
  } else if (value !== null && typeof value === "object") {
    // Structural, not `isUsageTree`: that one only tells a tree from a STRING, and this walk
    // visits every object in the tree (options, collection entries), not just slot items.
    const { contract: name, signature: signatureName } = value as Partial<UsageTree>;
    if (typeof name === "string" && typeof signatureName === "string") {
      const contract = getContract(name);
      const from = contract && getSignature(contract, signatureName)?.react.from;
      if (from) into.add(from);
    }
    for (const nested of Object.values(value)) specifiersOf(nested, into);
  }
  return into;
}

/**
 * Loads the binding modules a tree renders with. Await it before `renderTree`: rendering is
 * synchronous (React, the gates and the docs frame all call it inside a commit), loading is not.
 */
export async function loadTree(tree: UsageTree): Promise<void> {
  await Promise.all(
    [...specifiersOf(tree, new Set())].map(async (from) => {
      const load = loaders[from];
      if (load && !modules[from]) modules[from] = await load();
    }),
  );
}

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
    if (!(signature.react.from in loaders)) {
      throw new Error(`No React module "${signature.react.from}" in the render-tree map.`);
    }
    if (!modules[signature.react.from]) {
      throw new Error(`${signature.react.from} is not loaded: await loadTree(tree) before renderTree.`);
    }
    throw new Error(`${signature.react.from} exports no "${signature.react.name}".`);
  }

  /*
   * Options, attrs and style are RESOLVED IN CORE, by the same function the printed snippet uses.
   * They were two walks making the same decisions, and each shipped a bug the other had already
   * fixed; see `resolveReactProps`. What stays here is what genuinely differs: React keys, the
   * portal container, slots, and building real child elements.
   */
  const resolved = resolveReactProps(tree, contract, signature);
  const props: Record<string, unknown> = { key };
  for (const { name, value } of resolved.props) props[name] = value;
  if (resolved.style) props.style = resolved.style;
  // Only the signatures that portal take a container; the rest would pass it to a DOM element.
  if (portalContainer && signature.portals) props.container = portalContainer;

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
 *
 * Unlike the compiler's own `flattenItem` (source-text emission, which leaves tree content for a
 * separate JSX-children emission), this is a LIVE render: every value in a slot, text or tree,
 * has to become the actual prop value React takes, so a tree gets rendered through `renderItem`
 * right here rather than left for a caller to emit separately.
 */
function flattenEntry(entry: ItemInput, shape?: ContractSlot["item"]): unknown {
  return reactCollectionEntry(entry, shape, (values) =>
    values.length === 1 && !isUsageTree(values[0]!) ? values[0] : values.map(renderItem),
  );
}

function renderItem(item: string | UsageTree, index: number): ReactNode {
  return isUsageTree(item) ? renderTree(item, index) : item;
}
