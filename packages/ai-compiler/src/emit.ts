import { paginationRange } from "@skryensya/core/pagination";
import { placeholderLines } from "@skryensya/core/placeholder";
import type {
  ComponentContract,
  ContractSignature,
  ContractSlot,
  ContractTemplate,
} from "@skryensya/core/contract";
import { getContract, getSignature, signatureOptions } from "./registry.js";
import {
  collectionItems,
  flattenCollectionEntry,
  isUsageTree,
  slotItems,
  slotsOf,
  type ItemInput,
  type SlotContent,
  type UsageTree,
} from "./usage-tree.js";

/*
 * One tree, two renders (decision 29).
 *
 * The markup emitter walks the PART TEMPLATE: a nav list group becomes `<div><div label><ul>`,
 * because that is the structure a consumer must author. The React emitter walks the SIGNATURES and
 * stops there: React renders the same three elements itself, so emitting them here would be writing
 * the component's body at the call site.
 *
 * That the two arrive at the same DOM is not assumed. It is gate G2, and it needs a browser, which
 * is why nothing in this file claims it.
 */

export type Binding = "vanilla" | "react";

export class EmitError extends Error {}

/**
 * Elements whose content the HTML parser never treats as markup: no entity decoding happens
 * inside them, so escaping `&`/`<`/`>` before writing their text would corrupt it instead of
 * protecting it (a JSON index with `&` in an href, escaped, comes back out of `.textContent` as
 * literal `&amp;`). Literal text elsewhere in a template IS markup and still needs `escapeText`.
 */
const RAW_TEXT_ELEMENTS = new Set(["script", "style"]);

/** Elements the HTML parser closes itself; a written close tag is invalid, not merely redundant. */
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

/**
 * The column an emitter wraps an opening tag AND a run of text against. ~75ch is the classic measure
 * for a readable line, and it is close to what the docs' own code column fits (72 monospace
 * characters at the narrowest layout that still shows one, 82 from 1024px up), so it does not
 * reintroduce the horizontal scroll this exists to remove.
 *
 * Markup starts at column zero and gets the measure itself.
 */
const PRINT_WIDTH = 75;

/**
 * JSX gets five columns more, and the reason is the wrapper rather than a change of mind about what
 * is readable: every React snippet is a component now, so its body starts four columns in, and
 * measuring it against the same 75 would leave it with 71 columns of actual code and break lines its
 * markup twin keeps whole. 80 is also the printer's conventional width, so the result is what
 * Prettier would have produced for the same file.
 *
 * Measured, not guessed: at 75 the Placeholder demo split two of four sibling `<Placeholder>` tags
 * onto three lines each. One prop, one line of its own, while their shorter siblings stayed inline.
 * The breaks came from four characters of indentation, not from anything about the code.
 */
const JSX_PRINT_WIDTH = 80;

/* ------------------------------------------------------------------ markup (the vanilla binding) */

/**
 * One tree, as authored markup.
 *
 * `idPrefix` namespaces every generated id. Only needed when several INDEPENDENT trees land in the
 * same document: the gates' stage does that, a real page does not (each preview is its own srcdoc
 * document). Absent, the ids read as the author would have written them.
 */
export function emitMarkup(
  tree: UsageTree,
  options: { idPrefix?: string; fillDefaults?: boolean } = {},
): string {
  /*
   * Ids are unique per emit, and the counter below is what makes them so.
   *
   * The base is derived from the label so the same tree keeps producing the same bytes, but two
   * fields can legitimately share a label (a billing "Nombre" and a shipping "Nombre"), and
   * before this the second label pointed at the FIRST input. Silent, valid-looking, and wrong for
   * exactly the person who depends on the association.
   */
  usedIds.clear();
  idPrefix = options.idPrefix;
  // Defaults filled unless a caller says otherwise. The G2 gate and every other consumer need the
  // FULL DOM (React resolves its own defaults at render time, so a silent option here would read
  // as a divergence that does not exist); only the human-facing docs snippet asks to see just what
  // the tree actually authored, the same restraint `renderJsx` already gives the React tab.
  fillOptionDefaults = options.fillDefaults ?? true;
  try {
    return renderSignature(tree, 0).join("\n");
  } finally {
    idPrefix = undefined;
    fillOptionDefaults = true;
  }
}

/*
 * Module state, deliberately: `emitMarkup` is one synchronous top-level call, and threading a
 * context object through every `renderTemplate` recursion to carry two fields would cost more
 * clarity than it buys.
 */
const usedIds = new Set<string>();
let idPrefix: string | undefined;
let fillOptionDefaults = true;

/** A base nobody else in this emit is using, prefixed when the caller shares a document. */
function uniqueBase(candidate: string): string {
  const prefixed = idPrefix ? `${idPrefix}-${candidate}` : candidate;
  if (!usedIds.has(prefixed)) {
    usedIds.add(prefixed);
    return prefixed;
  }
  for (let n = 2; ; n++) {
    const next = `${prefixed}-${n}`;
    if (usedIds.has(next)) continue;
    usedIds.add(next);
    return next;
  }
}

function renderSignature(
  tree: UsageTree,
  depth: number,
  inherited?: Wiring,
): string[] {
  const { contract, signature } = resolve(tree);
  return renderTemplate(
    signature.template,
    {
      tree,
      contract,
      signature,
      wiring: wiringFor(tree, signature),
      inherited,
    },
    depth,
  );
}

/**
 * Attributes a parent computed for the child it slots. A field's control gets its `id`, its
 * `aria-describedby` and its `aria-invalid` this way: the parent knows the ids because it owns them.
 */
type Wiring = {
  readonly base: string;
  readonly forControl: readonly [string, string][];
  readonly onNode: Readonly<Record<string, [string, string][]>>;
};

/** One deterministic id per wired node, all derived from the composition's own id. */
function wiringFor(
  tree: UsageTree,
  signature: ContractSignature,
): Wiring | undefined {
  const rules = signature.wiring;
  if (!rules || rules.length === 0) return undefined;

  // An author-given id is theirs and is used verbatim; a derived one is made unique for this emit.
  const base = tree.attrs?.id ?? uniqueBase(slugOf(tree) ?? "sk-form-field");
  const filled = slotsOf(tree);

  // "Supplied by the author" covers both channels: `error` is a slot, `required` is an option, and a
  // wiring rule names either without caring which.
  const present = (node: string): boolean =>
    node === "control" ||
    slotItems(filled[node]).length > 0 ||
    (tree.options?.[node] !== undefined && tree.options[node] !== false);

  const idOf = (node: string): string =>
    node === "control" ? base : `${base}-${node}`;

  const forControl: [string, string][] = [["id", base]];
  const onNode: Record<string, [string, string][]> = {};

  for (const rule of rules) {
    if (rule.whenGiven !== undefined && !present(rule.whenGiven)) continue;

    /*
     * A literal value is written as given, including `""`, which is how a boolean attribute is
     * spelled (`required`, not `required="true"`). Only a REFERENCE list that resolved to nothing is
     * dropped: an `aria-describedby` pointing at absent nodes would describe nothing.
     */
    const value =
      rule.value ?? (rule.references ?? []).filter(present).map(idOf).join(" ");
    if (rule.value === undefined && value === "") continue;

    const target =
      rule.on === "control" ? forControl : (onNode[rule.on] ??= []);
    target.push([rule.attr, value]);
  }

  // Every node a rule points at carries the id it is pointed at by.
  for (const rule of rules) {
    for (const node of rule.references ?? []) {
      if (node === "control" || !present(node)) continue;
      (onNode[node] ??= []).push(["id", idOf(node)]);
    }
  }

  return { base, forControl, onNode };
}

/** A stable id from the label's own text, so the same tree keeps producing the same bytes. */
function slugOf(tree: UsageTree): string | undefined {
  const label = slotItems(slotsOf(tree).label).find(
    (item) => !isUsageTree(item),
  );
  if (typeof label !== "string") return undefined;

  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || undefined;
}

type NodeContext = {
  readonly tree: UsageTree;
  readonly contract: ComponentContract;
  readonly signature: ContractSignature;
  /** The collection entry being emitted, while inside a repeated node. */
  readonly item?: ItemInput;
  /** Ids this signature owns, when it declares wiring. */
  readonly wiring?: Wiring;
  /** Attributes the PARENT computed for this signature, because the parent owns the ids. */
  readonly inherited?: Wiring;
  /** Whether the entry being emitted is the last of its collection. */
  readonly last?: boolean;
};

function renderTemplate(
  node: ContractTemplate,
  ctx: NodeContext,
  depth: number,
): string[] {
  const filled = slotsOf(ctx.tree);

  // One element per entry of a collection the contract computes: which pages are visible follows
  // from the current page and the total, and is not data an author should be typing.
  if (node.repeatComputed !== undefined) {
    const entries = computedWindow(node.repeatComputed, ctx);
    return entries.flatMap((item, index) =>
      renderTemplate(
        { ...node, repeatComputed: undefined },
        { ...ctx, item, last: index === entries.length - 1 },
        depth,
      ),
    );
  }

  // One element per entry. Two nodes can repeat over the same collection from different places, so
  // the entry's fields land where the markup wants them and the key keeps the pieces paired.
  if (node.repeat !== undefined) {
    const entries = collectionItems(filled[node.repeat]);
    return entries.flatMap((item, index) =>
      renderTemplate(
        { ...node, repeat: undefined },
        { ...ctx, item, last: index === entries.length - 1 },
        depth,
      ),
    );
  }

  // The nested half: entries of the CURRENT entry's slot. With a recursive slot this is what lets a
  // template of fixed depth render a folder inside a folder inside a folder.
  if (node.repeatItemSlot !== undefined) {
    const entries = collectionItems(ctx.item?.slots[node.repeatItemSlot]);
    return entries.flatMap((item, index) =>
      renderTemplate(
        { ...node, repeatItemSlot: undefined },
        { ...ctx, item, last: index === entries.length - 1 },
        depth,
      ),
    );
  }

  /*
   * Back to a shape written once and named, with whatever entry is current. AFTER the repeat above,
   * never before: recursion has to consume a level of data to reach a bottom, and a `recurse` that
   * fired first would re-render the same entry until the stack ran out, which is exactly what it
   * did the first time these two were in the wrong order.
   */
  if (node.recurse !== undefined) {
    if (ctx.item === undefined) {
      throw new EmitError(
        `${node.recurse} recurses with no entry to recurse on; it must sit under a repeat.`,
      );
    }
    const target = namedNode(ctx.signature.template, node.recurse);
    if (!target)
      throw new EmitError(
        `No template node named ${node.recurse} to recurse into.`,
      );
    return renderTemplate(target, ctx, depth);
  }

  // Between, not after: a trailing separator is punctuation with nothing following it.
  if (node.whenNotLast && ctx.last !== false) return [];

  // Conditional on the ENTRY rather than the composition: a crumb with an href is a link, one
  // without is the page you are on.
  if (
    node.whenItemGiven !== undefined &&
    ctx.item?.options?.[node.whenItemGiven] === undefined
  )
    return [];
  if (
    node.whenItemMissing !== undefined &&
    ctx.item?.options?.[node.whenItemMissing] !== undefined
  )
    return [];

  // The ALL-of-them counterpart: `whenItemGiven` names one option, and a node cannot repeat that
  // key to ask for a second. A breadcrumb crumb that is both `current` and linked still is not a
  // link, and that shape needs both presence checks on the SAME node.
  if (
    node.whenItemAllGiven !== undefined &&
    node.whenItemAllGiven.some((option) => ctx.item?.options?.[option] === undefined)
  )
    return [];

  // The value-specific pair: presence is not enough to tell a checkbox entry from a separator,
  // both merely have `kind` set.
  if (
    node.whenItemEquals !== undefined &&
    ctx.item?.options?.[node.whenItemEquals.option] !== node.whenItemEquals.equals
  )
    return [];
  if (
    node.whenItemNotEquals !== undefined &&
    ctx.item?.options?.[node.whenItemNotEquals.option] === node.whenItemNotEquals.equals
  )
    return [];

  /*
   * Asked of the entry's CONTENT: a node with children is a branch, one without is a leaf, and
   * nobody sets that: it is whether the slot was filled.
   *
   * "Filled" has to ask BOTH helpers, because they are complements, not one being broader:
   * `slotItems` drops collection entries and `collectionItems` drops everything that is not one. So
   * `collectionItems` alone answered "no" for every TEXT slot, which is how Steps' description
   * span, guarded on a text slot, never emitted while React rendered it from the same tree.
   */
  const itemSlotFilled = (slot: string): boolean => {
    const content = ctx.item?.slots[slot];
    return slotItems(content).length > 0 || collectionItems(content).length > 0;
  };

  if (node.whenItemSlotGiven !== undefined && !itemSlotFilled(node.whenItemSlotGiven)) return [];
  if (node.whenItemSlotMissing !== undefined && itemSlotFilled(node.whenItemSlotMissing)) return [];

  // A conditional node names either an option or a slot; both mean "supplied by the author".
  if (node.whenGiven !== undefined && !supplied(node.whenGiven, ctx)) return [];

  // And its negative, for the node that stands in when the author supplied nothing: the separator
  // the system owns when none was slotted.
  if (node.whenMissing !== undefined && supplied(node.whenMissing, ctx))
    return [];

  /*
   * No element of its own: whatever this node holds stands where the node is, adding no box. A
   * decorative icon brings its own and must not be wrapped in one; a computed entry that comes out
   * as either of two shapes needs the two to be siblings in ONE place, not two runs of the window.
   */
  if (!node.element) {
    if (node.slot) {
      return renderSlot(
        filled[node.slot],
        depth,
        node.slot === "children" ? ctx.wiring : undefined,
      );
    }
    return (node.children ?? []).flatMap((child) =>
      renderTemplate(child, ctx, depth),
    );
  }

  const pad = "  ".repeat(depth);
  const attrs = attributesFor(node, ctx);
  const openLines = htmlOpening(node.element, attrs, pad);

  /*
   * A node's content, in order: its own literal text, then its slot, then its child nodes. A label
   * needs two of these at once (the author's text and the required mark after it), so these are
   * additive rather than a chain of alternatives.
   */
  const raw = RAW_TEXT_ELEMENTS.has(node.element);
  const children = [
    ...(node.text !== undefined ? textLines(node.text, depth + 1, raw) : []),
    ...(node.textFromOption !== undefined
      ? textLines(
          String(
            ctx.tree.options?.[node.textFromOption] ??
              ctx.contract.options[node.textFromOption]?.default ??
              "",
          ),
          depth + 1,
          raw,
        )
      : []),
    ...(node.itemSlot
      ? renderSlot(ctx.item?.slots[node.itemSlot], depth + 1)
      : []),
    ...(node.slot
      ? renderSlot(
          filled[node.slot],
          depth + 1,
          node.slot === "children" ? ctx.wiring : undefined,
        )
      : []),
    ...(node.children ?? []).flatMap((child) =>
      renderTemplate(child, ctx, depth + 1),
    ),
  ];

  if (children.length === 0) {
    // A void element closes itself; writing </input> is markup no browser accepts as written.
    if (VOID_ELEMENTS.has(node.element)) return openLines;
    const last = openLines.length - 1;
    return [
      ...openLines.slice(0, last),
      `${openLines[last]}</${node.element}>`,
    ];
  }

  // A single line of text stays on the element's own line, but only when the tag ITSELF stayed on
  // one line, and only when the text does not push the line back past PRINT_WIDTH on its own (a
  // wrapped attribute list already solved the tag; a long sentence is the same problem again).
  if (
    openLines.length === 1 &&
    children.length === 1 &&
    !children[0]!.trimStart().startsWith("<")
  ) {
    const text = children[0]!.trim();
    const inline = `${openLines[0]}${text}</${node.element}>`;
    if (inline.length <= PRINT_WIDTH) return [inline];
    return [openLines[0]!, ...wrapText(text, depth + 1), `${pad}</${node.element}>`];
  }

  return [...openLines, ...children, `${pad}</${node.element}>`];
}

/**
 * An opening tag, wrapped one attribute per line past `PRINT_WIDTH`: the HTML half of what
 * `jsxOpening` already does for JSX, so a snippet with many `data-*` attributes reads the same way
 * on both sides of the binding toggle instead of one wrapping and the other running off the edge.
 *
 * Returns the CLOSING `>` as the last line rather than leaving it to the caller: a void element's
 * only line, an empty element's line to append `</tag>` to, and a parent element's line to follow
 * with children are the same three shapes either way, wrapped or not.
 */
function htmlOpening(
  element: string,
  attrs: readonly string[],
  pad: string,
): string[] {
  const inline = `<${element}${attrs.map((a) => ` ${a}`).join("")}>`;
  if (attrs.length === 0 || `${pad}${inline}`.length <= PRINT_WIDTH) {
    return [`${pad}${inline}`];
  }

  return [
    `${pad}<${element}`,
    ...attrs.map((a) => `${pad}  ${a}`),
    `${pad}>`,
  ];
}

/**
 * A run of text, word-wrapped at the caller's own measure. Shared by both emitters: a browser and a
 * JSX runtime both collapse the whitespace a line break leaves behind, so breaking a sentence across
 * lines is safe on either side, not a JSX-only trick.
 */
function wrapText(text: string, depth: number, measure = PRINT_WIDTH): string[] {
  const pad = "  ".repeat(depth);
  const width = Math.max(1, measure - pad.length);
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (line === "") {
      line = word;
    } else if (line.length + 1 + word.length <= width) {
      line += ` ${word}`;
    } else {
      lines.push(`${pad}${line}`);
      line = word;
    }
  }
  if (line !== "") lines.push(`${pad}${line}`);
  return lines;
}

/**
 * Whether the author supplied ANY of these, as an option or as slot content: the one question both
 * `whenGiven` and `whenMissing` ask. `false` is the author saying no, which is not saying nothing.
 */
function supplied(
  names: string | readonly string[],
  ctx: NodeContext,
): boolean {
  const filled = slotsOf(ctx.tree);
  return (typeof names === "string" ? [names] : names).some((name) => {
    const option = ctx.tree.options?.[name];
    return (
      (option !== undefined && option !== false) ||
      slotItems(filled[name]).length > 0 ||
      // A collection slot's entries are `ItemInput`s, which `slotItems` deliberately excludes (they
      // are not children); `whenGiven` on a collection slot. MenubarItem's own `items`, gating
      // whether it has a dropdown at all. Needs the other half of the same content to count too.
      collectionItems(filled[name]).length > 0
    );
  });
}

/*
 * The computations a contract may name. Bounded on purpose: the emitter walks DATA, and a contract
 * that could name any function would be code again, one indirection further away.
 */
/** The key of whatever computed window this signature declares, if it declares one. */
function computedKeyOf(signature: ContractSignature): string | undefined {
  const find = (node: ContractTemplate): string | undefined =>
    node.repeatComputed?.key ??
    (node.children ?? []).map(find).find((k) => k !== undefined);
  return find(signature.template);
}

/** The template node carrying a given `name`, anywhere below the signature's root. */
function namedNode(
  node: ContractTemplate,
  name: string,
): ContractTemplate | undefined {
  if (node.name === name) return node;
  for (const child of node.children ?? []) {
    const found = namedNode(child, name);
    if (found) return found;
  }
  return undefined;
}

function computedWindow(
  spec: NonNullable<ContractTemplate["repeatComputed"]>,
  ctx: NodeContext,
): readonly ItemInput[] {
  const args = spec.from.map((name) =>
    Number(
      ctx.tree.options?.[name] ?? ctx.contract.options[name]?.default ?? 0,
    ),
  );

  /*
   * A paragraph skeleton's lines: N entries carrying nothing at all. The count is the whole datum,
   * and how wide each line runs is the stylesheet's (`.sk-placeholder__line`'s nth-child cycle), so
   * an entry has no options and no slots to fill. React builds the same N from `placeholderLines`.
   */
  if (spec.window === "skeleton-lines") {
    return Array.from({ length: placeholderLines(args[0] ?? 1) }, (): ItemInput => ({ slots: {} }));
  }

  // A gap is an entry with no page: `whenItemMissing` then tells the two shapes apart, the same way
  // a breadcrumb tells a link from the page you are on.
  return paginationRange(args[0] ?? 1, args[1] ?? 0, args[2]).map(
    (slot): ItemInput =>
      slot === "ellipsis"
        ? { slots: {} }
        : { options: { [spec.key]: slot }, slots: { label: String(slot) } },
  );
}

function attributesFor(node: ContractTemplate, ctx: NodeContext): string[] {
  const { tree, contract, signature } = ctx;
  const out: string[] = [];
  const optionStyles: string[] = [];
  const claimedAttrs = new Set(
    claimedElsewhere(signature.template, node).flatMap(
      (other) => other.attrsFor ?? [],
    ),
  );
  const authoredClass =
    tree.attrs?.class !== undefined &&
    (node.host
      ? !claimedAttrs.has("class")
      : (node.attrsFor ?? []).includes("class"))
      ? tree.attrs.class
      : undefined;

  const classes = [
    ...(node.part ? [contract.parts[node.part]!] : []),
    ...(node.also ?? []),
    ...(authoredClass !== undefined ? [authoredClass] : []),
  ];
  if (classes.length > 0) out.push(`class="${classes.join(" ")}"`);

  // Options a non-host node claims (a frame's `src`/`alt` belong to its `<img>`), and everything
  // else on the host. Every mapped option is written, DEFAULTS INCLUDED (unless the caller asked
  // for authored-only output, see `fillOptionDefaults`): React serializes its defaults, so a
  // silent one here would otherwise read as a divergence at G2 that does not exist.
  const claimed = new Set(
    claimedElsewhere(signature.template, node).flatMap(
      (other) => other.options ?? [],
    ),
  );

  const mine = node.host
    ? signatureOptions(contract, signature).filter(
        ([name]) => !claimed.has(name),
      )
    : signatureOptions(contract, signature).filter(([name]) =>
        (node.options ?? []).includes(name),
      );

  if (node.mount) out.push(node.mount);
  if (node.host && signature.mount) {
    // The enhancer's mount point. Binding-specific by nature, which is why it is not in the template.
    out.push(signature.mount);
  }

  for (const [name, option] of mine) {
    const value = tree.options?.[name] ?? (fillOptionDefaults ? option.default : undefined);
    // An option that only feeds a computation has already done its work in the structure above.
    if (value === undefined || option.computedInput) continue;
    if (option.styleProperty) {
      optionStyles.push(`${option.styleProperty}: ${String(value)}`);
      continue;
    }
    // Renamed for THIS node when the contract says so: one fact, two spellings, the way an id is
    // both the content's `id` and the trigger's `popovertarget`. Mirrors `itemOptionAttrs`.
    const attrName = node.optionAttrs?.[name] ?? option.attr;
    if (!attrName) continue;
    // Saying no is saying nothing, UNLESS the contract gave `false` a spelling of its own.
    if (value === false) {
      if (option.falseValue === undefined) continue;
      out.push(attr(attrName, option.falseValue));
      continue;
    }
    /*
     * A boolean that declares a `falseValue` and NO `trueValue` writes nothing when true: the
     * attribute exists only to say false. `chart`'s `labels` is the shape, and the only one in the
     * catalogue: the stylesheet has a rule for `[data-labels="false"]` and none for the true case,
     * because true is simply "labels, as always". Falling through to `trueValue ?? ""` wrote a
     * meaningless `data-labels=""` that React had never written, which G2 read as a divergence.
     * A boolean with NEITHER value still gets the empty-string presence form it always had.
     */
    if (value === true && option.trueValue === undefined && option.falseValue !== undefined) continue;
    out.push(
      value === true
        ? attr(attrName, option.trueValue ?? "")
        : attr(attrName, String(value)),
    );
    if (option.alsoAttr && value !== true)
      out.push(attr(option.alsoAttr, String(value)));
  }

  // The one entry the group selected. Asked of the group, marked on the entry, which is what makes
  // "only one can be selected" a fact of the structure rather than a hope about the data.
  if (node.selectedBy && ctx.item) {
    // The key comes from the collection's declared shape, or, for a computed window, which has no
    // authored slot to declare one, from the computation itself.
    const keyName = itemShapeOf(signature)?.key ?? computedKeyOf(signature);
    const key = keyName ? ctx.item.options?.[keyName] : undefined;
    if (key !== undefined && tree.options?.[node.selectedBy.option] === key) {
      out.push(attr(node.selectedBy.attr, node.selectedBy.value ?? ""));
    }
  }

  // Values that belong to the entry, not to the composition: the key that pairs this element with
  // its twin elsewhere in the markup, and whatever else the entry carries.
  if (node.itemOptions && ctx.item) {
    const itemOptions = itemShapeOf(signature)?.options ?? {};
    for (const name of node.itemOptions) {
      const option = itemOptions[name];
      const value = ctx.item.options?.[name] ?? option?.default;
      if (!option || value === undefined || value === false) continue;
      if (option.styleProperty) {
        optionStyles.push(`${option.styleProperty}: ${String(value)}`);
        continue;
      }
      /*
       * The same entry datum can need two spellings in one template. A Select's listbox row is a
       * `<li data-value>` the enhancer reads, and the hidden `<select>` beside it needs
       * `<option value>` for the browser to submit: one value, two attributes, decided by WHERE it
       * lands rather than by what it means. `itemOptionAttrs` renames it for this node only.
       */
      const attrName = node.itemOptionAttrs?.[name] ?? option.attr;
      if (!attrName) continue;
      out.push(
        value === true
          ? attr(attrName, option.trueValue ?? "")
          : attr(attrName, String(value)),
      );
    }
  }

  // Copied from the entry's own content: a crumb's title repeats its label, derived so the two
  // can never disagree.
  for (const [name, slot] of Object.entries(node.attrsFromItemSlot ?? {})) {
    const text = slotItems(ctx.item?.slots[slot]).find((v) => !isUsageTree(v));
    if (typeof text === "string") out.push(attr(name, text));
  }

  // Structure the contract fixes for every instance: the enhancer's mount points, a native `type`.
  for (const [name, value] of Object.entries(node.attrs ?? {}))
    out.push(attr(name, value));

  // Values made visible: a fill computed from the option it represents, never typed by an author.
  const styles = [
    ...optionStyles,
    ...(node.style ?? []).flatMap((rule) => {
      const [num, den] = rule.percentOf;
      const value = Number(tree.options?.[num] ?? contract.options[num]?.default ?? 0);
      const max = Number(tree.options?.[den] ?? contract.options[den]?.default ?? 100);
      if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return [];
      const ratio = Math.max(0, Math.min(1, value / max));
      return [
        rule.as === "fraction"
          ? `${rule.property}: ${ratio}`
          : `${rule.property}: ${ratio * 100}%`,
      ];
    }),
  ];
  if (styles.length > 0) out.push(attr("style", styles.join("; ") + ";"));

  // Structure that depends on whether the author supplied something: a named loader is a status, an
  // unnamed one is decoration beside one, and no static attribute can be both.
  for (const rule of node.attrsWhen ?? []) {
    const value =
      tree.options?.[rule.option] ?? contract.options[rule.option]?.default;
    if (
      rule.given !== undefined &&
      (value !== undefined && value !== false) !== rule.given
    )
      continue;
    /*
     * Compared as STRINGS, because the rule is written in the vocabulary of attributes and an
     * attribute value is a string. Strict equality silently skipped every numeric option: a
     * pagination on page `1` never matched `equals: "1"`, so the first page shipped an enabled
     * "previous" button that announces itself as available and does nothing.
     */
    if (rule.equals !== undefined && String(value) !== rule.equals) continue;
    if (rule.notEquals !== undefined && String(value) === rule.notEquals)
      continue;
    // Two options compared to each other: `page === total` is the last page, and neither side is a
    // literal anyone could have written.
    if (rule.equalsOption !== undefined) {
      const other =
        tree.options?.[rule.equalsOption] ??
        contract.options[rule.equalsOption]?.default;
      if (String(value) !== String(other)) continue;
    }
    /*
     * REPLACES a base attribute of the same name rather than being appended beside it. "When this
     * option holds, this attribute is X" can only mean replacement: emitted as a second copy, the
     * HTML parser keeps the FIRST one and the conditional value is silently discarded, which is
     * invalid markup that looks like it worked. Found on comment-thread's vote buttons, where a
     * base `aria-pressed="false"` and a conditional `"true"` both landed and every voted button
     * announced itself as not pressed.
     */
    for (const [name, literal] of Object.entries(rule.attrs)) {
      const at = out.findIndex((written) => written.startsWith(`${name}="`) || written === name);
      if (at === -1) out.push(attr(name, literal));
      else out[at] = attr(name, literal);
    }
  }


  for (const [name, value] of Object.entries(tree.attrs ?? {})) {
    const mineToWrite = node.host
      ? !claimedAttrs.has(name)
      : (node.attrsFor ?? []).includes(name);
    if (mineToWrite && name !== "class") out.push(attr(name, value));
  }

  /*
   * The two halves of one relationship the contract declares: the node that renders the label slot
   * carries the id, the node that points at it carries `aria-labelledby`. Ids belong to the binding,
   * the relationship belongs to the contract.
   */
  if (node.labelledBySlot) {
    const id = slotId(ctx, node.labelledBySlot);
    if (id) out.push(attr("aria-labelledby", id));
  }

  if (node.slot && labelledSlots(ctx.signature.template).has(node.slot)) {
    const id = slotId(ctx, node.slot);
    if (id) out.push(attr("id", id));
  }

  // The id relationships this signature owns: what a named node carries, and what the parent
  // computed for this one because the parent is where the ids live.
  if (node.name && ctx.wiring?.onNode[node.name]) {
    for (const [name, value] of ctx.wiring.onNode[node.name]!)
      out.push(attr(name, value));
  }

  if (node.host && ctx.inherited) {
    for (const [name, value] of ctx.inherited.forControl)
      out.push(attr(name, value));
  }

  return out;
}

/** The collection shape a signature declares, if it has one. At most one slot may be a collection. */
function itemShapeOf(signature: ContractSignature): ContractSlot["item"] {
  return Object.values(signature.slots).find((slot) => slot.accepts === "items")
    ?.item;
}

/** Every other node of the template, so the host can tell which options are already spoken for. */
function claimedElsewhere(
  root: ContractTemplate,
  node: ContractTemplate,
): ContractTemplate[] {
  const others: ContractTemplate[] = [];
  const visit = (candidate: ContractTemplate): void => {
    if (candidate !== node) others.push(candidate);
    for (const child of candidate.children ?? []) visit(child);
  };
  visit(root);
  return others;
}

/** Slot names some node in this template points at with `labelledBySlot`. */
function labelledSlots(root: ContractTemplate): ReadonlySet<string> {
  const names = new Set<string>();
  const visit = (node: ContractTemplate): void => {
    if (node.labelledBySlot) names.add(node.labelledBySlot);
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return names;
}

/**
 * A deterministic id for a labelled slot: the same tree must produce the same bytes, so a counter or
 * a random suffix is out. The label's own text is what a human would have typed anyway.
 */
function slotId(ctx: NodeContext, slot: string): string | undefined {
  const items = slotItems(slotsOf(ctx.tree)[slot]);
  const text = items.find((item) => !isUsageTree(item));
  if (typeof text !== "string") return undefined;
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || undefined;
}

/**
 * A literal line of text, wrapped past `PRINT_WIDTH`: a long sentence baked into a template
 * (`node.text`) or authored into a slot (`renderSlot`) is the same problem `wrapText` already
 * solves for a child that arrived as markup instead. `raw` (script/style body) is never wrapped:
 * reflowing JS or CSS on whitespace would change what it says, not just how it is laid out.
 */
function textLines(text: string, depth: number, raw: boolean): string[] {
  const content = raw ? text : escapeText(text);
  const line = `${"  ".repeat(depth)}${content}`;
  if (raw || line.length <= PRINT_WIDTH) return [line];
  return wrapText(content, depth);
}

function renderSlot(
  content: SlotContent | undefined,
  depth: number,
  wiring?: Wiring,
): string[] {
  const items = slotItems(content);
  const rendered = items.map((item) =>
    isUsageTree(item)
      ? renderSignature(item, depth, wiring)
      : textLines(item, depth, false),
  );
  return joinInlineItems(items, rendered);
}

type InlineBoundary = {
  /** Neither neighbour is text: an unrelated case. A Stack's children, where the gap between two
   *  elements was never a string's to own, so neither emitter touches it. */
  readonly bothElements: boolean;
  /** Neither neighbour wrote a space at this boundary: nothing may render there, in either binding. */
  readonly glue: boolean;
};

/**
 * What a boundary between two adjacent slot items asks of it, read from the SOURCE strings rather
 * than from how they get printed. Shared by both emitters because they agree on every input: whether
 * a boundary is between two elements with nothing textual nearby, and whether either text neighbour
 * already carries a space. They only disagree on what to DO with a boundary that is neither of those
 *; see `joinInlineItems` and `joinJsxInlineItems`.
 */
function inlineBoundary(
  items: readonly (string | UsageTree)[],
  index: number,
): InlineBoundary {
  const prev = items[index - 1];
  const item = items[index];
  const prevIsText = typeof prev === "string";
  const isText = typeof item === "string";
  const bothElements = !prevIsText && !isText;
  const prevHasTrailingSpace = prevIsText && /\s$/.test(prev as string);
  const hasLeadingSpace = isText && /^\s/.test(item as string);
  return { bothElements, glue: !bothElements && !prevHasTrailingSpace && !hasLeadingSpace };
}

/**
 * Adjacent slot items that carry no whitespace of their own. A link glued straight to the comma
 * that follows it, say. Land on ONE line with nothing between them. A newline the pretty-printer
 * would otherwise put at that boundary is still whitespace, and HTML collapses it into a rendered
 * space exactly like a typed one: the comma ends up floating a space off the word before it, which
 * neither side of the source wrote. A boundary stays safe to break across lines whenever a text
 * neighbour already carries the space HTML would render there anyway, which is every OTHER boundary
 * in a paragraph, so most items keep one line each. Two elements with nothing textual between them
 * are left alone: there the gap was never a string's to own, it is the layout's, and an unrelated
 * array of components (a Stack's children) still reads one per line.
 */
function joinInlineItems(
  items: readonly (string | UsageTree)[],
  rendered: readonly (readonly string[])[],
): string[] {
  const out: string[] = [];
  items.forEach((item, index) => {
    const lines = rendered[index]!;
    const glue = index > 0 && inlineBoundary(items, index).glue;

    if (glue && out.length > 0 && lines.length > 0) {
      out[out.length - 1] += lines[0]!.trimStart();
      out.push(...lines.slice(1));
    } else {
      out.push(...lines);
    }
  });
  return out;
}

/**
 * The same boundaries `joinInlineItems` reads, printed for JSX instead of HTML, where a bare
 * newline is not a substitute for a space, it is whitespace the JSX transform throws away. Babel and
 * TypeScript trim every line of a text run that isn't the FIRST or LAST line of its own run of source
 * text, so a word sandwiched between two tags on its own indented line loses the space on both sides,
 * silently: `A paragraph with a` and `and another` came out of a real build with no space before the link
 * that follows, in a snippet that looked, to the eye reading the source, exactly like the one that
 * renders correctly. `{" "}` is not a stylistic choice, it is the only child JSX renders unconditionally
 * regardless of the newlines and indentation around it. The same trick Prettier reaches for on any
 * JSX line broken between two children that need a space. Every text item arrives here pre-trimmed
 * (see the caller): the boundary is the only place a space gets decided, never a string's own edge.
 */
function joinJsxInlineItems(
  items: readonly (string | UsageTree)[],
  rendered: readonly (readonly string[])[],
): string[] {
  const out: string[] = [];
  items.forEach((item, index) => {
    const lines = rendered[index]!;
    if (index === 0) {
      out.push(...lines);
      return;
    }

    const { bothElements, glue } = inlineBoundary(items, index);
    if (glue) {
      if (out.length > 0 && lines.length > 0) {
        out[out.length - 1] += lines[0]!.trimStart();
        out.push(...lines.slice(1));
      } else {
        out.push(...lines);
      }
      return;
    }
    if (!bothElements && out.length > 0) {
      out[out.length - 1] += '{" "}';
    }
    out.push(...lines);
  });
  return out;
}

/* ------------------------------------------------------------------------- TSX (the React binding) */

/** One collection, moved out of the tag: what to call it, what it says, and whose data it is. */
type DataConst = {
  readonly name: string;
  readonly literal: string;
  /** The contract the collection belongs to, which is not always the tree's root; see `dataModule`. */
  readonly contract: string;
};

/** What one emit accumulates besides the JSX itself: the imports it needs and the data it lifted. */
type JsxContext = {
  readonly imports: Map<string, Set<string>>;
  readonly data: DataConst[];
};

export type ReactEmitOptions = {
  /**
   * The component to wrap the JSX in. Given, the snippet is ALWAYS a component (the playground's
   * entry file needs one whether or not there is data); absent, one is derived from the root
   * signature and used only when there is data to hold.
   */
  readonly component?: string;
  /** `default` for a sandbox entry file, `named` (the default) for something pasted into an app. */
  readonly export?: "default" | "named";
};

/** The module a component's data was moved to, and the two names needed to write it down. */
export type ReactDataModule = {
  /** What the file is called: `menu-items.ts`. */
  readonly file: string;
  /** What the component imports it by: `./menu-items`. */
  readonly specifier: string;
  readonly source: string;
};

/** One tree as React sees it: the component, and the data file it reads from when it has one. */
export type ReactSource = {
  readonly component: string;
  readonly data?: ReactDataModule;
};

/**
 * One tree, as the TSX a person would have written. WHICH IS MORE THAN ONE FILE.
 *
 * A collection is data, and data is not written inside a tag. Serialized into the prop, a menu's
 * items came out as one unreadable line of JSON that nobody would type and nobody can edit, and the
 * component it belonged to was invisible underneath it. So the entries move out entirely: their own
 * module, `export const items = […]`, imported by name. What is left in the component file is the
 * composition, which is the thing the page is about.
 *
 * And it is ALWAYS a component, whether or not it has data to import. A bare JSX expression is not
 * a file: nothing declares it, nothing renders it, and a reader who copies it has to know to wrap it
 *, which is exactly what the page is supposed to be showing them. One shape for every example on
 * the site also means the eye learns it once: imports, then the component, then its `return`.
 */
export function emitReactSource(
  tree: UsageTree,
  options: ReactEmitOptions = {},
): ReactSource {
  // Rendered at the depth the wrapper puts it at, so every line wraps against the column it actually
  // lands in rather than against where it would have sat without a component around it.
  const { body, context } = renderReact(tree, 2);
  const name = options.component ?? `${rootName(tree)}Example`;
  const keyword = options.export === "default" ? "export default" : "export";

  /*
   * A one-line body reads better returned as it stands; anything taller needs the parens to hold it.
   * The measure is taken on the RETURN, not on the body: `return ` and the semicolon cost ten
   * columns, which is what pushed `<Checkbox name="alerts" …>` four characters past the width it had
   * just been laid out to fit.
   */
  const single = body.length === 1 ? `  return ${body[0]!.trim()};` : undefined;
  const returned =
    single !== undefined && single.length <= JSX_PRINT_WIDTH
      ? [single]
      : ["  return (", ...body, "  );"];

  const data = dataModule(tree, context.data);

  return {
    component: joinReact(
      context.imports,
      data
        ? [
            `import { ${context.data
              .map(({ name: constName }) => constName)
              .join(", ")} } from "${data.specifier}";`,
          ]
        : [],
      [`${keyword} function ${name}() {`, ...returned, "}"],
    ),
    ...(data ? { data } : {}),
  };
}

/**
 * The same tree as ONE string: the component file. Kept because most callers want exactly that (a
 * docs tab, a test), and because the data file is addressed separately wherever it is shown.
 */
export function emitReact(
  tree: UsageTree,
  options: ReactEmitOptions = {},
): string {
  return emitReactSource(tree, options).component;
}

/**
 * The data file, named for what it holds.
 *
 * One collection is called after it (`menu-items.ts`, `select-options.ts`), which is what a person
 * would have typed; several share a `-data` file, because no single entry's name would be honest
 * about the rest.
 *
 * Named after the contract that OWNS the collection rather than the tree's root, which are often not
 * the same: a Tabs demo wrapped in a Stack would otherwise have shipped `layout-items.ts`, a file
 * named after the box its subject happens to sit in.
 */
function dataModule(
  tree: UsageTree,
  data: readonly DataConst[],
): ReactDataModule | undefined {
  if (data.length === 0) return undefined;

  const owners = new Set(data.map((entry) => entry.contract));
  const owner = owners.size === 1 ? [...owners][0]! : tree.contract;
  // `-data` also covers the contract whose collection is named after itself: Steps takes `steps`,
  // and `steps-steps.ts` is a stutter, not a name.
  const stem =
    data.length === 1 && data[0]!.name !== owner
      ? `${owner}-${data[0]!.name}`
      : `${owner}-data`;

  return {
    file: `${stem}.ts`,
    specifier: `./${stem}`,
    source: `${data
      .map(({ name, literal }) => `export const ${name} = ${literal};`)
      .join("\n\n")}\n`,
  };
}

function renderReact(
  tree: UsageTree,
  depth: number,
): { body: string[]; context: JsxContext } {
  const context: JsxContext = { imports: new Map(), data: [] };
  return { body: renderJsx(tree, depth, context), context };
}

/**
 * Package imports, then the relative one, then the code. Sorting them all together would have put
 * `./menu-items` above `@skryensya/react/menu` on some collators and below it on others; every
 * codebase writes what it depends on first and what it owns second, so that order is written here
 * rather than left to `localeCompare`.
 */
function joinReact(
  imports: Map<string, Set<string>>,
  relative: readonly string[],
  body: readonly string[],
): string {
  const lines = [...imports.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([from, names]) => importLines([...names].sort(), from));

  return [...lines, ...relative, "", ...body].join("\n");
}

/**
 * One import, wrapped one name per line once it passes the measure. A Table demo reaches for eight
 * signatures and its import line ran to 143 characters. Three times the width of anything under it,
 * and the first thing a reader sees. Every formatter breaks this the same way; so does this one.
 */
function importLines(names: readonly string[], from: string): string[] {
  const inline = `import { ${names.join(", ")} } from "${from}";`;
  if (inline.length <= JSX_PRINT_WIDTH) return [inline];

  return [
    "import {",
    ...names.map((name) => `  ${name},`),
    `} from "${from}";`,
  ];
}

/** The root binding's own name, which is the half of a derived component name that means anything. */
function rootName(tree: UsageTree): string {
  return resolve(tree).signature.react.name.split(".")[0]!;
}

function jsxOpening(
  name: string,
  props: readonly string[],
  depth: number,
  selfClosing: boolean,
): string[] {
  const pad = "  ".repeat(depth);
  const end = selfClosing ? " />" : ">";
  // A prop that is itself several lines (a composed element, laid out) can only be written on lines
  // of its own, whatever the tag's length says.
  const block = props.some((prop) => prop.includes("\n"));
  const inline =
    props.length > 0
      ? `${pad}<${name} ${props.join(" ")}${end}`
      : `${pad}<${name}${end}`;
  if (props.length === 0 || (!block && inline.length <= JSX_PRINT_WIDTH)) {
    return [inline];
  }

  return [
    `${pad}<${name}`,
    // Only the first line of a multi-line prop is indented here; the rest arrived already placed,
    // because whoever built it knew the depth it was going to sit at.
    ...props.flatMap((prop) => {
      const [first, ...rest] = prop.split("\n");
      return [`${pad}  ${first}`, ...rest];
    }),
    `${pad}${selfClosing ? "/>" : ">"}`,
  ];
}

/**
 * The `style` object, on one line while it fits and one declaration per line once it does not. An
 * Avatar demo setting four custom properties reached 172 characters, all of it inside one prop.
 *
 * The outer braces stay a container of their own (`style={` … `}`) rather than the usual `{{`,
 * because the object carries an `as CSSProperties` and the assertion has to sit beside the closing
 * brace it applies to.
 */
function styleProp(declarations: readonly string[], depth: number): string {
  const inline = `style={{ ${declarations.join(", ")} } as CSSProperties}`;
  if (`${"  ".repeat(depth + 1)}${inline}`.length <= JSX_PRINT_WIDTH) {
    return inline;
  }

  const padProp = "  ".repeat(depth + 1);
  return [
    "style={",
    `${padProp}  {`,
    ...declarations.map((declaration) => `${padProp}    ${declaration},`),
    `${padProp}  } as CSSProperties`,
    `${padProp}}`,
  ].join("\n");
}

/**
 * A slot filled with elements, as the prop React takes.
 *
 * Written on one line while it fits, and as a block once it does not:
 *
 *     footer={
 *       <>
 *         <Button variant="ghost">Cancelar</Button>
 *         <Button tone="accent">Archivar</Button>
 *       </>
 *     }
 *
 * Flattened, those two buttons were a 202-character line. The composition was there, and unreadable.
 * The layout depth is decided BEFORE anything is rendered (a lone element sits one level in, several
 * sit inside a fragment two levels in) because rendering is what collects the data modules: doing it
 * twice to measure would collect them twice.
 */
function composedProp(
  propName: string,
  composed: readonly UsageTree[],
  depth: number,
  ctx: JsxContext,
): string {
  const lone = composed.length === 1;
  const rendered = composed.map((item) =>
    renderJsx(item, depth + (lone ? 2 : 3), ctx),
  );

  // Inline needs every element to have come back as a single line; the join stays empty, because
  // whitespace between two elements on ONE line is a text node React would render as a space.
  if (rendered.every((lines) => lines.length === 1)) {
    const jsx = rendered.map((lines) => lines[0]!.trim());
    const inline = `${propName}={${lone ? jsx[0] : `<>${jsx.join("")}</>`}}`;
    if (`${"  ".repeat(depth + 1)}${inline}`.length <= JSX_PRINT_WIDTH) {
      return inline;
    }
  }

  const padProp = "  ".repeat(depth + 1);
  const padFragment = "  ".repeat(depth + 2);
  const inner = rendered.flat();

  return [
    `${propName}={`,
    ...(lone ? inner : [`${padFragment}<>`, ...inner, `${padFragment}</>`]),
    `${padProp}}`,
  ].join("\n");
}

function renderJsx(
  tree: UsageTree,
  depth: number,
  ctx: JsxContext,
): string[] {
  const { imports } = ctx;
  const { contract, signature } = resolve(tree);
  const pad = "  ".repeat(depth);
  const name = signature.react.name;

  const from = signature.react.from;
  if (!imports.has(from)) imports.set(from, new Set());
  // A compound binding is reached through its root: `Accordion.Item` is written that way and
  // imported as `Accordion`, which is the whole point of the namespace.
  imports.get(from)!.add(name.split(".")[0]!);

  const props: string[] = [];
  const optionStyles: string[] = [];
  for (const [option, declared] of signatureOptions(contract, signature)) {
    const value = tree.options?.[option];
    // The binding's own name for it, when the contract had to choose a different key.
    const name = declared.prop ?? option;
    if (value === undefined) continue;
    if (declared.styleProperty) {
      optionStyles.push(
        `${JSON.stringify(declared.styleProperty)}: ${
          declared.type === "number" && typeof value === "number"
            ? value
            : JSON.stringify(String(value))
        }`,
      );
      /*
       * ALSO the named prop, under the option's own key; see `render-tree.tsx`'s identical fix
       * for why: a `styleProperty` option says where the value lands in markup, not how a React
       * component wants it, and a component that takes it as an ordinary prop (Sidebar's
       * `minInlineSize`) never saw it here either. The live island and this printed snippet have
       * to pass the same props for the same reason ADR-15 gives: the demo a reader watches and the
       * evidence G2 collects are the same call.
       */
    }
    if (value === false) {
      if (declared.default === true) props.push(`${name}={false}`);
      continue;
    }
    if (value === true) {
      props.push(name);
      continue;
    }
    /*
     * A number goes in braces, because that is what the binding receives. The live island passes the
     * tree's own value (a number) while this string said `defaultValue="65"`, so the snippet on the
     * page and the component beside it were taking different types. Small, and exactly the drift one
     * authoring is supposed to make impossible.
     */
    props.push(
      declared.type === "number" && typeof value === "number"
        ? `${name}={${value}}`
        : jsxAttribute(name, String(value)),
    );
  }
  /*
   * `attrs.style` is authored as one CSS-text string, the only shape `attrs` (a flat
   * `Record<string, string>`) can hold, and the ONLY shape vanilla's emission wants: `attr("style",
   * value)` writes it straight into `style="…"`, valid HTML as-is. React's `style` prop is not a
   * string, it is an object, so that same string, spread in with the same generic
   * `jsxAttribute(name, value)` every other attr uses below, used to come out as
   * `style="--sk-avatar-bg: …;"`: a JSX prop React throws on at runtime ("the `style` prop expects
   * a mapping … not a string"). Parsed into declarations and folded into `optionStyles` instead, it
   * joins whatever `styleProperty` options already contributed there and rides the SAME
   * `style={{…}} as CSSProperties` object below, so authoring an inline style on a tree node works
   * the same way in both bindings instead of only in one.
   */
  if (tree.attrs?.style) {
    for (const [property, value] of parseInlineStyle(tree.attrs.style)) {
      optionStyles.push(`${JSON.stringify(property)}: ${JSON.stringify(value)}`);
    }
  }
  if (optionStyles.length > 0) {
    if (!imports.has("react")) imports.set("react", new Set());
    imports.get("react")!.add("type CSSProperties");
    props.push(styleProp(optionStyles, depth));
  }
  for (const [attrName, value] of Object.entries(tree.attrs ?? {})) {
    if (attrName === "style") continue;
    props.push(jsxAttribute(jsxPropName(attrName), value));
  }

  const filled = slotsOf(tree);
  // Every slot except `children` is a prop in React; the template is what turns it into an element.
  for (const [slot, content] of Object.entries(filled)) {
    if (slot === "children") continue;

    // A collection stays data on this side: React takes the array and renders the repetition itself,
    // which is the whole reason the two bindings meet a collection at different depths.
    const declaredSlot = signature.slots[slot];
    const propName = declaredSlot?.prop ?? slot;

    const entries = collectionItems(content);
    if (entries.length > 0) {
      const rows = entries.map((entry) => flattenItem(entry, declaredSlot?.item));
      // Moved out of the tag and named, so the prop says WHICH data it takes and the data itself
      // stays readable in a file of its own. A prop whose name is not an identifier could not be a
      // `const`, so it keeps the serialized form rather than inventing a name nobody wrote.
      if (IDENTIFIER.test(propName)) {
        const constName = uniqueDataName(ctx, propName);
        ctx.data.push({
          name: constName,
          // Printed for the data module, where it sits at the top level of its own file.
          literal: jsLiteral(rows, 0, `export const ${constName} = `.length),
          contract: tree.contract,
        });
        props.push(`${propName}={${constName}}`);
      } else {
        props.push(`${propName}={${JSON.stringify(rows)}}`);
      }
      continue;
    }

    const items = slotItems(content);

    // A slot can hold another signature (a nav link's decorative icon) and on this side it becomes
    // an element in a prop. Emitting only the text ones silently dropped it.
    const composed = items.filter(isUsageTree);
    if (composed.length > 0) {
      props.push(composedProp(propName, composed, depth, ctx));
      continue;
    }

    const text = items.find((item) => !isUsageTree(item));
    if (typeof text === "string") props.push(jsxAttribute(propName, text));
  }

  const childItems = slotItems(filled.children);
  const childRendered = childItems.map((item) =>
    isUsageTree(item)
      ? renderJsx(item, depth + 1, ctx)
      : [`${"  ".repeat(depth + 1)}${item.trim()}`],
  );
  const children = joinJsxInlineItems(childItems, childRendered);

  if (children.length === 0) return jsxOpening(name, props, depth, true);

  const opening = jsxOpening(name, props, depth, false);
  if (children.length === 1 && !children[0]!.trimStart().startsWith("<")) {
    const text = children[0]!.trim();
    const inlineOpen =
      props.length > 0 ? `<${name} ${props.join(" ")}>` : `<${name}>`;
    const inline = `${pad}${inlineOpen}${text}</${name}>`;
    if (inline.length <= JSX_PRINT_WIDTH) return [inline];

    return [
      ...opening,
      ...wrapText(text, depth + 1, JSX_PRINT_WIDTH),
      `${pad}</${name}>`,
    ];
  }

  return [...opening, ...children, `${pad}</${name}>`];
}

/**
 * One entry, as the flat object a React binding takes. The split between an entry's options and its
 * slots exists so the markup emitter knows what is an attribute and what is content; React takes one
 * object and decides that itself.
 *
 * Source-text emission (this is JSX text, not a live element) keeps only a slot's plain text and
 * leaves any tree content out: a tree child in `label` here would have to print AS a JSX element,
 * which is a second emitter this function has no business becoming. `renderJsx`'s own walk is what
 * emits that content, one level up, as children rather than as a prop value.
 */
function flattenItem(item: ItemInput, shape?: ContractSlot["item"]): Record<string, unknown> {
  return flattenCollectionEntry(item, shape, (values) => {
    const text = values.find((value) => !isUsageTree(value));
    return typeof text === "string" ? text : undefined;
  });
}

/** A name that can be written both as a `const` and as an object key without quotes around it. */
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * The prop's own name, which is what a person would have called the data. Two collections in one
 * snippet can share it (a menu inside a menu, both taking `items`), and the second one numbering
 * itself is the smallest honest way to keep them apart.
 */
function uniqueDataName(ctx: JsxContext, propName: string): string {
  const taken = new Set(ctx.data.map((entry) => entry.name));
  if (!taken.has(propName)) return propName;
  for (let n = 2; ; n++) {
    if (!taken.has(`${propName}${n}`)) return `${propName}${n}`;
  }
}

/**
 * A value as the JavaScript literal a person writes: identifier keys unquoted, one line while it
 * fits `JSX_PRINT_WIDTH` (the data module is part of the React snippet) and one entry per line once
 * it does not.
 *
 * `JSON.stringify` with an indent argument would be close, and wrong in the two ways that matter:
 * it quotes every key (`"label"`, which nobody types in a `.tsx`) and it explodes EVERY object,
 * so a three-field row that reads perfectly on one line becomes five. `used` is what the first line
 * already spent (`const items = `), so the decision is made against the column the text lands in.
 */
function jsLiteral(value: unknown, depth: number, used = 0): string {
  const pad = "  ".repeat(depth);
  const inline = inlineLiteral(value);
  // `+ 1` for the comma or semicolon that always follows a value, wherever it sits.
  if (pad.length + used + inline.length + 1 <= JSX_PRINT_WIDTH) return inline;

  if (Array.isArray(value)) {
    if (value.length === 0) return inline;
    return [
      "[",
      ...value.map((entry) => `${pad}  ${jsLiteral(entry, depth + 1)},`),
      `${pad}]`,
    ].join("\n");
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return inline;
    return [
      "{",
      ...entries.map(([key, entry]) => {
        const name = literalKey(key);
        return `${pad}  ${name}: ${jsLiteral(entry, depth + 1, name.length + 2)},`;
      }),
      `${pad}}`,
    ].join("\n");
  }

  return inline;
}

/** The same literal on one line, which is also how the wrapped form decides it does not fit. */
function inlineLiteral(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length === 0 ? "[]" : `[${value.map(inlineLiteral).join(", ")}]`;
  }
  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{ ${entries
      .map(([key, entry]) => `${literalKey(key)}: ${inlineLiteral(entry)}`)
      .join(", ")} }`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function literalKey(key: string): string {
  return IDENTIFIER.test(key) ? key : JSON.stringify(key);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/*
 * `attrs` reach the host element untouched, which is right for markup and wrong for JSX: React
 * spells a handful of HTML attributes in camelCase and warns on the hyphenated form. The snippet a
 * page shows is meant to be pasted, so it has to be the React spelling: `tabindex="0"` on a
 * TableScroll printed a console warning in every table demo.
 */
const JSX_PROP_NAMES: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  accesskey: "accessKey",
  autocapitalize: "autoCapitalize",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  colspan: "colSpan",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  datetime: "dateTime",
  enctype: "encType",
  formaction: "formAction",
  inputmode: "inputMode",
  maxlength: "maxLength",
  minlength: "minLength",
  novalidate: "noValidate",
  readonly: "readOnly",
  rowspan: "rowSpan",
  spellcheck: "spellCheck",
  srcset: "srcSet",
  tabindex: "tabIndex",
  usemap: "useMap",
};

/**
 * The React spelling of a passthrough attribute name. Exported because the live island renders the
 * same tree through `renderTree`; if only the emitter renamed, the snippet and the thing beside it
 * would disagree, which is the one failure this whole shape exists to prevent.
 */
/**
 * One JSX attribute, in the form JSX can actually parse.
 *
 * `JSON.stringify` is the obvious way to quote a string and the wrong one here: JSX attribute values
 * are NOT JavaScript string literals and do not process backslash escapes. A value containing a
 * double quote came out as `items="[{\"label\":…}]"`, where the first `\"` ends the attribute and
 * everything after it is garbage. Invalid JSX, which Babel refuses with "Unexpected backslash in
 * JSX element". CommandPalette hits this on every render: a usage tree hands it its index as a JSON
 * STRING, because a tree has no channel for anything else.
 *
 * So a value with a quote in it goes in an expression container, where it IS a JavaScript string
 * literal and `JSON.stringify` is exactly right. Everything else keeps the plain attribute form,
 * which is what a person would write and what the docs have always shown.
 */
export function jsxAttribute(name: string, value: string): string {
  return value.includes('"')
    ? `${name}={${JSON.stringify(value)}}`
    : `${name}=${JSON.stringify(value)}`;
}

export function jsxPropName(attr: string): string {
  // `aria-*` and `data-*` keep their hyphens in JSX; everything else may need the camelCase name.
  if (attr.startsWith("aria-") || attr.startsWith("data-")) return attr;
  return JSX_PROP_NAMES[attr.toLowerCase()] ?? attr;
}

/**
 * `"--sk-avatar-bg: red; color: white"` → `[["--sk-avatar-bg", "red"], ["color", "white"]]`. A CSS
 * custom property's name is kept verbatim (`--sk-avatar-bg` stays hyphenated: React only recognizes
 * it as one if the object key is written exactly that way, never `camelCase`d); an ordinary property
 * is camelCased, the form the `style` object expects for everything else. Splits each declaration on
 * the FIRST `:` only, so a value that itself contains a colon (`url(http://…)`, a time, a ratio)
 * survives intact.
 *
 * Exported because this same string → `style` object gap exists in TWO places, not one:
 * `render-tree.tsx` (`@skryensya/react`) builds the SAME props at runtime for the live island, and
 * used to hit the identical React crash from its own copy of this problem. One parser, imported by
 * both, so the fix (and any future one) cannot land in only one of them again.
 */
export function parseInlineStyle(css: string): Array<[string, string]> {
  return css
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      if (colon === -1) return null;
      const property = declaration.slice(0, colon).trim();
      const value = declaration.slice(colon + 1).trim();
      if (!property || !value) return null;
      const jsProperty = property.startsWith("--")
        ? property
        : property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
      return [jsProperty, value] as [string, string];
    })
    .filter((pair): pair is [string, string] => pair !== null);
}

/* ------------------------------------------------------------------------------------- shared */

/**
 * One tree in whichever binding was asked for, as ONE string. React's data module is not in it:
 * a caller that needs the whole React source calls `emitReactSource` and gets both files.
 */
export function emit(tree: UsageTree, binding: Binding): string {
  return binding === "vanilla" ? emitMarkup(tree) : emitReact(tree);
}

function resolve(tree: UsageTree): {
  contract: ComponentContract;
  signature: ContractSignature;
} {
  const contract = getContract(tree.contract);
  if (!contract) throw new EmitError(`No contract "${tree.contract}".`);

  const signature = getSignature(contract, tree.signature);
  if (!signature)
    throw new EmitError(
      `Contract "${tree.contract}" has no signature "${tree.signature}".`,
    );

  return { contract, signature };
}

function attr(name: string, value: string): string {
  return value === "" ? name : `${name}="${escapeAttr(value)}"`;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
