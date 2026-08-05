import { paginationRange } from "@skryensya/core/pagination";
import type {
  ComponentContract,
  ContractSignature,
  ContractSlot,
  ContractTemplate,
} from "@skryensya/core/contract";
import { getContract, getSignature, signatureOptions } from "./registry.js";
import {
  collectionItems,
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
 * The column both emitters wrap an opening tag AND a run of text against. One number, because a
 * reader comparing the two snippets side by side should see the SAME reason a line broke, not two
 * unrelated widths. ~75ch is the classic measure for a readable line, and it is close enough to
 * what the docs' own code column fits (measured at 72 monospace characters) that it does not
 * reintroduce the horizontal scroll this exists to remove.
 */
const PRINT_WIDTH = 75;

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
  options: { idPrefix?: string } = {},
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
  try {
    return renderSignature(tree, 0).join("\n");
  } finally {
    idPrefix = undefined;
  }
}

/*
 * Module state, deliberately: `emitMarkup` is one synchronous top-level call, and threading a
 * context object through every `renderTemplate` recursion to carry two fields would cost more
 * clarity than it buys.
 */
const usedIds = new Set<string>();
let idPrefix: string | undefined;

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
  const base = tree.attrs?.id ?? uniqueBase(slugOf(tree) ?? "sk-field");
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
 * A run of text, word-wrapped at `PRINT_WIDTH`. Shared by both emitters: a browser and a JSX runtime
 * both collapse the whitespace a line break leaves behind, so breaking a sentence across lines is
 * safe on either side, not a JSX-only trick.
 */
function wrapText(text: string, depth: number): string[] {
  const pad = "  ".repeat(depth);
  const width = Math.max(1, PRINT_WIDTH - pad.length);
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
      slotItems(filled[name]).length > 0
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
  // else on the host. Every mapped option is written, DEFAULTS INCLUDED: React serializes its
  // defaults, so a silent one here would read as a divergence at G2 that does not exist.
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
    const value = tree.options?.[name] ?? option.default;
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
    for (const [name, literal] of Object.entries(rule.attrs))
      out.push(attr(name, literal));
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
  return slotItems(content).flatMap((item) =>
    isUsageTree(item)
      ? renderSignature(item, depth, wiring)
      : textLines(item, depth, false),
  );
}

/* ------------------------------------------------------------------------- TSX (the React binding) */

export function emitReact(tree: UsageTree): string {
  const imports = new Map<string, Set<string>>();
  const body = renderJsx(tree, 0, imports);

  const lines = [...imports.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([from, names]) =>
        `import { ${[...names].sort().join(", ")} } from "${from}";`,
    );

  return [...lines, "", ...body].join("\n");
}

function jsxOpening(
  name: string,
  props: readonly string[],
  depth: number,
  selfClosing: boolean,
): string[] {
  const pad = "  ".repeat(depth);
  const end = selfClosing ? " />" : ">";
  const inline =
    props.length > 0
      ? `${pad}<${name} ${props.join(" ")}${end}`
      : `${pad}<${name}${end}`;
  if (inline.length <= PRINT_WIDTH || props.length === 0) return [inline];

  return [
    `${pad}<${name}`,
    ...props.map((prop) => `${pad}  ${prop}`),
    `${pad}${selfClosing ? "/>" : ">"}`,
  ];
}

function renderJsx(
  tree: UsageTree,
  depth: number,
  imports: Map<string, Set<string>>,
): string[] {
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
      continue;
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
        : `${name}=${JSON.stringify(String(value))}`,
    );
  }
  if (optionStyles.length > 0) {
    if (!imports.has("react")) imports.set("react", new Set());
    imports.get("react")!.add("type CSSProperties");
    props.push(`style={{ ${optionStyles.join(", ")} } as CSSProperties}`);
  }
  for (const [attrName, value] of Object.entries(tree.attrs ?? {})) {
    props.push(`${jsxPropName(attrName)}=${JSON.stringify(value)}`);
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
      props.push(
        `${propName}={${JSON.stringify(entries.map((entry) => flattenItem(entry, declaredSlot?.item)))}}`,
      );
      continue;
    }

    const items = slotItems(content);

    // A slot can hold another signature (a nav link's decorative icon) and on this side it becomes
    // an element in a prop. Emitting only the text ones silently dropped it.
    const composed = items.filter(isUsageTree);
    if (composed.length > 0) {
      const jsx = composed.map((item) =>
        renderJsx(item, 0, imports).join("").trim(),
      );
      props.push(
        `${propName}={${jsx.length === 1 ? jsx[0] : `<>${jsx.join("")}</>`}}`,
      );
      continue;
    }

    const text = items.find((item) => !isUsageTree(item));
    if (typeof text === "string")
      props.push(`${propName}=${JSON.stringify(text)}`);
  }

  const children = slotItems(filled.children).flatMap((item) =>
    isUsageTree(item)
      ? renderJsx(item, depth + 1, imports)
      : [`${"  ".repeat(depth + 1)}${item}`],
  );

  if (children.length === 0) return jsxOpening(name, props, depth, true);

  const opening = jsxOpening(name, props, depth, false);
  if (children.length === 1 && !children[0]!.trimStart().startsWith("<")) {
    const text = children[0]!.trim();
    const inlineOpen =
      props.length > 0 ? `<${name} ${props.join(" ")}>` : `<${name}>`;
    const inline = `${pad}${inlineOpen}${text}</${name}>`;
    if (inline.length <= PRINT_WIDTH) return [inline];

    return [...opening, ...wrapText(text, depth + 1), `${pad}</${name}>`];
  }

  return [...opening, ...children, `${pad}</${name}>`];
}

/**
 * One entry, as the flat object a React binding takes. The split between an entry's options and its
 * slots exists so the markup emitter knows what is an attribute and what is content; React takes one
 * object and decides that itself.
 */
function flattenItem(
  item: ItemInput,
  shape?: ContractSlot["item"],
): Record<string, unknown> {
  const flat: Record<string, unknown> = { ...item.options };

  for (const [field, content] of Object.entries(item.slots)) {
    // The binding's own name for this field, when the contract keyed it differently.
    const name = shape?.slots[field]?.prop ?? field;
    /*
     * A slot that holds MORE ENTRIES is flattened the same way, one level down: a folder's children
     * are folders. Reading only the text of an entry's slots dropped them silently, and a tree with
     * no branches passed every check there was.
     */
    const nested = collectionItems(content);
    if (nested.length > 0) {
      flat[name] = nested.map((child) => flattenItem(child, shape));
      continue;
    }

    const values = slotItems(content);
    const text = values.find((value) => !isUsageTree(value));
    if (typeof text === "string") flat[name] = text;
  }

  return flat;
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
export function jsxPropName(attr: string): string {
  // `aria-*` and `data-*` keep their hyphens in JSX; everything else may need the camelCase name.
  if (attr.startsWith("aria-") || attr.startsWith("data-")) return attr;
  return JSX_PROP_NAMES[attr.toLowerCase()] ?? attr;
}

/* ------------------------------------------------------------------------------------- shared */

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
