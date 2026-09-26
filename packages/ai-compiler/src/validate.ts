import type {
  ComponentContract,
  ContractOption,
  ContractSignature,
  ContractSlot,
  ContractTemplate,
} from "@skryensya/core/contract";
import { getContract, getSignature, contractIds } from "@skryensya/core/registry";
import {
  collectionItems,
  isUsageTree,
  slotItems,
  slotsOf,
  type ItemInput,
  type UsageTree,
} from "@skryensya/core/usage-tree";

/*
 * Gates G0 and G3 over a usage tree: shape, options, requires/forbids, slots, parents and the
 * accessibility a contract declares. Everything checked here is checked against a structured field,
 * never against prose: a rule written as a paragraph could not fail a build, which is why the
 * contract stopped holding any.
 */

export type Severity = "error" | "advisory";

export type Problem = {
  /** Where in the tree, as signature ids from the root: `NavList > NavListGroup > NavListLink`. */
  readonly path: string;
  readonly rule: string;
  readonly severity: Severity;
  readonly message: string;
};

export type ValidationResult = {
  readonly valid: boolean;
  readonly problems: readonly Problem[];
};

export function validateUsageTree(tree: UsageTree): ValidationResult {
  const problems: Problem[] = [];
  walk(tree, undefined, [], problems);
  checkReferences(tree, problems);
  return { valid: problems.every((p) => p.severity !== "error"), problems };
}

function walk(
  tree: UsageTree,
  parent: { contract: ComponentContract; signature: ContractSignature; id: string } | undefined,
  trail: readonly string[],
  problems: Problem[],
  parentChildAttrs?: Readonly<Record<string, ContractOption>>,
): void {
  const here = [...trail, tree.signature];
  const path = here.join(" > ");

  const contract = getContract(tree.contract);
  if (!contract) {
    problems.push({
      path,
      rule: "unknown-contract",
      severity: "error",
      message: `No contract "${tree.contract}". Published contracts: ${contractIds().join(", ")}.`,
    });
    return;
  }

  const signature = getSignature(contract, tree.signature);
  if (!signature) {
    problems.push({
      path,
      rule: "unknown-signature",
      severity: "error",
      message: `Contract "${tree.contract}" has no signature "${tree.signature}". It has: ${Object.keys(contract.signatures).join(", ")}.`,
    });
    return;
  }

  checkParent(signature, parent, path, problems);
  checkNotInside(signature, trail, path, problems);
  checkDescendants(signature, tree, path, problems);
  checkOptions(contract, signature, tree, path, problems);
  checkShadowedAttrs(contract, signature, tree, path, problems);
  checkForwardAttrs(signature, tree, path, problems, parentChildAttrs);
  checkChildAttrs(tree, path, problems, parentChildAttrs);
  checkExcludes(signature, tree, path, problems);
  checkImplies(signature, tree, path, problems);
  checkPairs(signature, tree, path, problems);
  checkBetween(contract, signature, tree, path, problems);
  checkDeprecatedValues(contract, signature, tree, path, problems);
  checkRequiresForbids(signature, tree, path, problems);
  checkAtLeastOne(contract, signature, tree, path, problems);
  checkAccessibility(contract, signature, tree, path, problems);
  checkSlots(contract, signature, tree, here, problems);
  checkKeyReferences(contract, signature, tree, path, problems);
  checkListOptions(contract, signature, tree, path, problems);
}

function checkListOptions(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  for (const name of signature.options) {
    const list = contract.options[name]?.list;
    const value = tree.options?.[name];
    if (!list || typeof value !== "string") continue;

    const entries = value.split(list.separator).map((part) => part.trim());
    const bad = entries.filter((entry) => !(Number.isFinite(Number(entry)) && entry !== "" && Number(entry) > 0));
    if (bad.length > 0) {
      problems.push({
        path,
        rule: "invalid-option-value",
        severity: "error",
        message: `"${name}" is a "${list.separator}"-separated list of positive numbers; ${bad.map((b) => JSON.stringify(b)).join(", ")} is not one.`,
      });
      continue;
    }

    if (!list.countFrom) continue;
    const row = everyNode(tree).find(({ node }) => node !== tree && node.signature === list.countFrom)?.node;
    if (!row) continue;
    const count = slotItems(slotsOf(row).children).filter(isUsageTree).length;
    if (count > 0 && entries.length !== count) {
      problems.push({
        path,
        rule: "invalid-option-value",
        severity: "error",
        message: `"${name}" has ${entries.length} entries and the first ${list.countFrom} has ${count} columns; the binding ignores a list that does not match.`,
      });
    }
  }
}

/*
 * HTML content models. Three strengths, because what goes wrong differs:
 *
 * - A block inside a `<p>` is MOVED. The parser closes the paragraph before the block, so the DOM
 *   is not the markup that was written and the text after it falls outside the Text. An error.
 * - A block inside a `<summary>` is an ERROR TOO, and this one is a deliberate strictness bump
 *   rather than a parser fact. `<summary>` is not decoration around a disclosure, it IS the
 *   control: its text is the widget's accessible name and the whole of its hit area. A `<div>` of
 *   headings and paragraphs in there is a label that is also a document, which is the shape the
 *   platform's own element exists to avoid. Nothing downstream can warn about it either, since the
 *   parser leaves it exactly where it was written.
 * - A block inside a `<span>`, a heading or a `<button>` is invalid HTML, but the parser keeps it
 *   where it was written. Validators and some assistive tech still stumble on it. An advisory.
 */
const PHRASING_ONLY = new Set([
  "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "button", "strong", "em", "b", "i", "small",
  "code", "output", "label", "q", "s", "sub", "sup", "u", "var", "kbd", "samp", "cite", "dfn",
  "abbr", "mark", "time", "data", "pre", "summary",
]);

/*
 * `<summary>` is the one element here whose model is "phrasing content, OPTIONALLY INTERMIXED WITH
 * HEADING CONTENT" (HTML §4.11.2). A heading is the ordinary way to give a disclosure a title, so
 * flagging one would be a false positive on the composition this contract most expects.
 */
const HEADING_ELEMENTS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "hgroup"]);
const ALLOWS_HEADINGS = new Set(["summary"]);
/* Not derived from the set above: a `<p>`, a heading and a `<pre>` hold only inline content but are blocks themselves. */
const PHRASING = new Set([
  "span", "button", "strong", "em", "b", "i", "small", "code", "output", "label", "q", "s", "sub",
  "sup", "u", "var", "kbd", "samp", "cite", "dfn", "abbr", "mark", "time", "data", "a", "br",
  "wbr", "img", "svg", "input", "select", "textarea", "meter", "progress", "picture", "audio",
  "video", "canvas", "iframe", "del", "ins", "map", "math", "object", "noscript", "template",
  "slot", "embed",
]);
/* The start tags that close an open `<p>` (HTML parsing, "in body" insertion mode). */
const CLOSES_P = new Set([
  "address", "article", "aside", "blockquote", "details", "dialog", "div", "dl", "fieldset",
  "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup",
  "hr", "main", "menu", "nav", "ol", "p", "pre", "search", "section", "table", "ul",
]);

/** The element a signature renders as for THIS tree: its template's, or an `element` option's value. */
function renderedElement(contract: ComponentContract, signature: ContractSignature, tree: UsageTree): string | undefined {
  for (const name of signature.options) {
    const option = contract.options[name];
    const value = tree.options?.[name];
    if (option?.element && typeof value === "string" && option.values?.includes(value)) return value;
  }
  return signature.template.element;
}

/** The nearest element that holds a slot's content: the slot's own node, or its closest ancestor with one. */
function slotContainer(node: ContractTemplate, slot: string, nearest: ContractTemplate | undefined): ContractTemplate | undefined {
  const here = node.element ? node : nearest;
  if (node.slot === slot) return here;
  for (const child of node.children ?? []) {
    const found = slotContainer(child, slot, here);
    if (found) return found;
  }
  return undefined;
}

function checkContentModel(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  slot: string,
  item: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const container = slotContainer(signature.template, slot, undefined);
  if (!container) return;
  const parentElement = container.host ? renderedElement(contract, signature, tree) : container.element;
  if (!parentElement || !PHRASING_ONLY.has(parentElement)) return;

  const childContract = getContract(item.contract);
  const child = childContract ? getSignature(childContract, item.signature) : undefined;
  if (!child || !childContract) return;
  const childElement = renderedElement(childContract, child, item);
  if (!childElement || PHRASING.has(childElement)) return;
  if (ALLOWS_HEADINGS.has(parentElement) && HEADING_ELEMENTS.has(childElement)) return;

  const moved = parentElement === "p" && CLOSES_P.has(childElement);
  const forbidden = ALLOWS_HEADINGS.has(parentElement);
  const hint = childContract.id === "typography" && item.signature === "Text" ? ' Use textElement: "span".' : "";
  problems.push({
    path: `${path} > ${item.signature}`,
    rule: "content-model",
    severity: moved || forbidden ? "error" : "advisory",
    message: moved
      ? `${item.signature} renders a <${childElement}> inside a <p>. The parser closes the paragraph before it, so the DOM is not this tree.${hint}`
      : forbidden
        ? `${item.signature} renders a <${childElement}>, and "${slot}" lands inside a <${parentElement}>, which holds phrasing content and headings only. A <${parentElement}> is the control itself, so its content is the disclosure's accessible name: it cannot be a block.${hint}`
        : `${item.signature} renders a <${childElement}>, and "${slot}" lands inside a <${parentElement}>, which only holds inline content. Invalid HTML, though the parser keeps it in place.${hint}`,
  });
}

/** Positioned siblings: one shared set size, unique positions inside it. */
function checkPositions(
  shape: NonNullable<ContractSlot["positions"]>,
  items: readonly (string | UsageTree)[],
  path: string,
  problems: Problem[],
): void {
  const rows = items.filter(isUsageTree);
  const sizes = new Set(rows.map((row) => row.options?.[shape.setSize]).filter((v) => typeof v === "number"));
  if (sizes.size > 1)
    problems.push({ path, rule: "invalid-hierarchy", severity: "error", message: `Siblings disagree on ${shape.setSize}: ${[...sizes].join(", ")}.` });
  const seen = new Set<number>();
  for (const row of rows) {
    const position = row.options?.[shape.posInset];
    const size = row.options?.[shape.setSize];
    if (typeof position !== "number") continue;
    if (seen.has(position))
      problems.push({ path, rule: "invalid-hierarchy", severity: "error", message: `${shape.posInset} ${position} is used twice.` });
    seen.add(position);
    if (typeof size === "number" && size !== -1 && position > size)
      problems.push({ path, rule: "invalid-hierarchy", severity: "error", message: `${shape.posInset} ${position} is past ${shape.setSize} ${size}.` });
  }
}

/**
 * A hierarchy written as flat rows (`flatHierarchy`): the numbers each row states are exactly what
 * assistive tech announces, so a row that says "2 of 3" while its level holds two rows is a lie
 * the markup tells, however well it renders.
 */
function checkFlatHierarchy(
  shape: NonNullable<ContractSlot["flatHierarchy"]>,
  items: readonly (string | UsageTree)[],
  path: string,
  problems: Problem[],
): void {
  const rows = items.filter(isUsageTree).map((row, index) => {
    const options = row.options ?? {};
    const int = (name: string) => (typeof options[name] === "number" ? (options[name] as number) : Number.NaN);
    return {
      where: `${path} > ${row.signature}[${index}]`,
      level: int(shape.level),
      setSize: int(shape.setSize),
      posInset: int(shape.posInset),
      branch: options[shape.expanded] !== undefined,
      key: shape.key !== undefined ? options[shape.key] : undefined,
    };
  });
  const report = (where: string, message: string) =>
    problems.push({ path: where, rule: "invalid-hierarchy", severity: "error", message });

  const seenKeys = new Set<unknown>();
  /* Open sibling sets, one per level on the current path: the rows seen so far under one parent. */
  const open: { setSize: number; count: number; where: string }[] = [];
  const close = (fromLevel: number) => {
    while (open.length >= fromLevel) {
      const set = open.pop()!;
      if (set.count !== set.setSize)
        report(set.where, `this row's ${shape.setSize} is ${set.setSize}, but its level holds ${set.count} row(s) under the same parent.`);
    }
  };

  rows.forEach((row, index) => {
    if (row.key !== undefined) {
      if (seenKeys.has(row.key)) report(row.where, `${shape.key}="${String(row.key)}" is used by an earlier row; each row needs its own.`);
      seenKeys.add(row.key);
    }
    if (![row.level, row.setSize, row.posInset].every(Number.isInteger)) return; // missing-required speaks for it

    const previous = index > 0 ? rows[index - 1]! : undefined;
    const maxLevel = previous && Number.isInteger(previous.level) ? previous.level + 1 : 1;
    if (row.level < 1 || row.level > maxLevel) {
      report(row.where, `${shape.level} ${row.level} cannot follow ${previous ? `a row at ${shape.level} ${previous.level}` : "the start"}; depth grows one level at a time, starting at 1.`);
      return;
    }
    if (row.posInset < 1 || row.posInset > row.setSize)
      report(row.where, `${shape.posInset} ${row.posInset} is outside 1..${row.setSize} (${shape.setSize}).`);

    /* A branch owns the rows after it that sit deeper; a leaf owns none. */
    const next = rows[index + 1];
    const hasChildren = next !== undefined && Number.isInteger(next.level) && next.level > row.level;
    /* Advisory, not an error: an empty folder is a real branch with nothing in it yet. */
    if (row.branch && !hasChildren)
      problems.push({
        path: row.where,
        rule: "empty-branch",
        severity: "advisory",
        message: `this row states ${shape.expanded}, which makes it a branch, but no deeper row follows it. Right for an empty folder; otherwise drop ${shape.expanded} to make it a leaf.`,
      });
    if (!row.branch && hasChildren)
      report(row.where, `deeper rows follow this one, so it is a branch and must state ${shape.expanded} (true or false).`);

    close(row.level + 1);
    const set = open[row.level - 1];
    if (!set) {
      open[row.level - 1] = { setSize: row.setSize, count: 1, where: row.where };
      if (row.posInset !== 1) report(row.where, `the first row of its set must be ${shape.posInset} 1, not ${row.posInset}.`);
    } else {
      set.count += 1;
      if (row.setSize !== set.setSize)
        report(row.where, `${shape.setSize} ${row.setSize} disagrees with ${set.setSize} on an earlier sibling.`);
      if (row.posInset !== set.count)
        report(row.where, `${shape.posInset} ${row.posInset} should be ${set.count}: siblings are numbered in order.`);
    }
  });
  close(1);
}

/** Every composed node in a tree, depth-first, with its path: slots, and slots inside collection entries. */
function everyNode(tree: UsageTree, trail: readonly string[] = []): { node: UsageTree; path: string }[] {
  const here = [...trail, tree.signature];
  const out = [{ node: tree, path: here.join(" > ") }];
  const visit = (content: unknown) => {
    for (const item of slotItems(content as never)) if (item != null && isUsageTree(item)) out.push(...everyNode(item, here));
    for (const entry of collectionItems(content as never)) for (const nested of Object.values(entry.slots ?? {})) visit(nested);
  };
  for (const content of Object.values(slotsOf(tree))) visit(content);
  return out;
}

/**
 * `refersTo`: a value that must match another node's option somewhere in the same tree. A trigger
 * naming a panel that is not there renders a button that does nothing, and says nothing about it.
 */
function checkReferences(tree: UsageTree, problems: Problem[]): void {
  const nodes = everyNode(tree);
  for (const { node, path } of nodes) {
    const contract = getContract(node.contract);
    const signature = contract ? getSignature(contract, node.signature) : undefined;
    if (!contract || !signature) continue;
    for (const name of signature.options) {
      const target = contract.options[name]?.refersTo;
      const value = node.options?.[name];
      if (!target || typeof value !== "string" || value === "") continue;
      const found = nodes.some(({ node: other }) => other.contract === target.contract && other.options?.[target.option] === value);
      if (found) continue;
      problems.push({
        path,
        rule: "unknown-reference",
        severity: "error",
        message: `"${name}" names "${value}", and no ${target.contract} in this tree has ${target.option}="${value}".`,
      });
    }
  }
}

/**
 * Every key an entry of the named collection declares, searched at every depth of a recursive one.
 * Empty when the slot is not a keyed collection, or holds no entries at all.
 */
function collectionKeys(
  signature: ContractSignature,
  tree: UsageTree,
  slotName: string,
): ReadonlySet<string> {
  const slot = signature.slots[slotName];
  const key = slot?.item?.key;
  const known = new Set<string>();
  if (!slot || !key) return known;

  const collect = (entries: readonly ItemInput[]): void => {
    for (const entry of entries) {
      const id = entry.options?.[key];
      if (typeof id === "string") known.add(id);
      for (const [name, itemSlot] of Object.entries(slot.item!.slots)) {
        if (itemSlot.recursive) collect(collectionItems(entry.slots[name]));
      }
    }
  };
  collect(collectionItems(slotsOf(tree)[slotName]));
  return known;
}

/**
 * An option that names entries of the signature's own collection (`keyOf`) must name ones that
 * exist. Skipped when the signature has no such keyed slot (a shared option on a sibling signature)
 * or the slot is empty (`missing-required-slot` already speaks for that).
 *
 * ASKED OF ENTRY OPTIONS TOO, not only of the composition's own, and Diagram is why: an edge's
 * `from` and `to` name nodes of the SAME signature's other collection, which is the one authoring
 * mistake that component really has. Checked identically, because the question is identical; the
 * host half simply happens to be the case that turned up first.
 */
function checkKeyReferences(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const report = (
    option: ContractOption,
    label: string,
    value: string,
    known: ReadonlySet<string>,
  ): void => {
    const key = signature.slots[option.keyOf!.slot]?.item?.key;
    if (!key || known.size === 0) return;
    const wanted = option.keyOf!.many ? value.split(/[\s,]+/).filter(Boolean) : [value];
    for (const each of wanted) {
      if (known.has(each)) continue;
      problems.push({
        path,
        rule: "unknown-key",
        severity: "error",
        message: `"${label}" names "${each}", and no entry of "${option.keyOf!.slot}" has ${key}="${each}". It accepts: ${[...known].join(", ")}.`,
      });
    }
  };

  for (const name of signature.options) {
    const option = contract.options[name];
    const value = tree.options?.[name];
    if (!option?.keyOf || typeof value !== "string" || value === "") continue;
    report(option, name, value, collectionKeys(signature, tree, option.keyOf.slot));
  }

  for (const [slotName, slot] of Object.entries(signature.slots)) {
    if (slot.accepts !== "items" || !slot.item) continue;
    for (const [name, option] of Object.entries(slot.item.options)) {
      if (!option.keyOf) continue;
      const known = collectionKeys(signature, tree, option.keyOf.slot);
      for (const [at, entry] of collectionItems(slotsOf(tree)[slotName]).entries()) {
        const value = entry.options?.[name];
        if (typeof value !== "string" || value === "") continue;
        report(option, `${slotName}[${at}].${name}`, value, known);
      }
    }
  }
}

/**
 * A raw attribute the host already writes from an option. Both land on the element, the parser
 * keeps the first, and the author's value is silently dropped: a dialog's `type="submit"` passed as
 * an attr lost to Button's own `type="button"`.
 */
function checkShadowedAttrs(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  for (const attr of Object.keys(tree.attrs ?? {})) {
    const owner = signature.options.find((name) => contract.options[name]?.attr === attr);
    if (!owner) continue;
    problems.push({
      path,
      rule: "shadowed-attr",
      severity: "error",
      message: `"${attr}" is written by the "${owner}" option; pass it as options.${owner}, not as an attribute.`,
    });
  }
}

/** `class` and `style` are universal authoring hooks; emit merges them specially. */
const FREE_ATTRS = new Set(["class", "style"]);

/** The kit's slice of the author's `data-` namespace. Everything outside it belongs to the page. */
const KIT_ATTR_PREFIX = "data-sk-";

/**
 * Every `data-sk-*` some contract publishes for an author to write on ANOTHER family's host.
 *
 * Read from the catalogue rather than from the signature being checked, because that is where the
 * knowledge honestly lives: `data-sk-vaul-close` on a Button is Vaul's promise, not Button's, and
 * putting it in Button's `forward` would make every family that can host a foreign hook grow a list
 * of the families that might hook it.
 */
function authoredKitAttrs(): ReadonlySet<string> {
  const names = new Set<string>();
  for (const id of contractIds()) {
    for (const attr of getContract(id)?.authoredAttrs ?? []) names.add(attr);
  }
  return names;
}

/**
 * `data-*` is the AUTHOR's namespace by HTML's own rule: a demo hanging `data-emit-toast` on a
 * Button to find it from a script is using the platform as intended, and a contract has no standing
 * to refuse it. `data-sk-*` is the one slice the kit reserves, and there an undeclared attribute is
 * worth failing over: it reads like a hook and no enhancer will ever answer it.
 */
function isFreeAttr(name: string): boolean {
  if (FREE_ATTRS.has(name)) return true;
  if (!name.startsWith("data-")) return false;
  return !name.startsWith(KIT_ATTR_PREFIX);
}

function forwardAllows(forward: readonly string[], name: string): boolean {
  return forward.some((entry) => (entry.endsWith("*") ? name.startsWith(entry.slice(0, -1)) : entry === name));
}

function childAttrByName(
  childAttrs: Readonly<Record<string, ContractOption>> | undefined,
  name: string,
): ContractOption | undefined {
  if (!childAttrs) return undefined;
  return Object.values(childAttrs).find((option) => option.attr === name);
}

/**
 * When a signature declares `forward`, every authored attr must be on that list (or free, or a
 * parent slot's `childAttrs`). Absent `forward` keeps the open bag the catalogue used before.
 */
function checkForwardAttrs(
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
  parentChildAttrs?: Readonly<Record<string, ContractOption>>,
): void {
  const forward = signature.forward;
  if (!forward) return;

  const authored = authoredKitAttrs();

  for (const name of Object.keys(tree.attrs ?? {})) {
    if (isFreeAttr(name)) continue;
    if (authored.has(name)) continue;
    if (forwardAllows(forward, name)) continue;
    if (childAttrByName(parentChildAttrs, name)) continue;
    problems.push({
      path,
      rule: "unknown-attr",
      severity: "error",
      message: name.startsWith(KIT_ATTR_PREFIX)
        ? `"${name}" is not a hook any contract publishes, and ${tree.signature} does not forward ` +
          `it. The kit owns "${KIT_ATTR_PREFIX}*"; a page's own hook belongs outside that prefix.`
        : `"${name}" is not a forwarded attribute of ${tree.signature}. It forwards: ${forward.join(", ")}.`,
    });
  }
}

/**
 * Values for a parent slot's `childAttrs` (LayoutGrid `data-width`): typed like options.
 */
function checkChildAttrs(
  tree: UsageTree,
  path: string,
  problems: Problem[],
  parentChildAttrs?: Readonly<Record<string, ContractOption>>,
): void {
  if (!parentChildAttrs) return;
  for (const [name, value] of Object.entries(tree.attrs ?? {})) {
    const option = childAttrByName(parentChildAttrs, name);
    if (!option) continue;
    const key = Object.entries(parentChildAttrs).find(([, opt]) => opt === option)?.[0] ?? name;
    const problem = optionValueProblem(option, key, value);
    if (problem) problems.push({ path, rule: "invalid-attr-value", severity: "error", message: problem });
  }
}

function checkNotInside(
  signature: ContractSignature,
  trail: readonly string[],
  path: string,
  problems: Problem[],
): void {
  for (const ancestor of signature.notInside ?? []) {
    if (!trail.includes(ancestor)) continue;
    problems.push({
      path,
      rule: "invalid-ancestor",
      severity: "error",
      message: `This signature must not sit inside ${ancestor}, at any depth.`,
    });
  }
}

/**
 * `descendants`: how many of a group of signatures sit anywhere below this node. Counted through
 * `everyNode`, so a Heading three layout primitives down, or inside a tab's panel, counts; the node
 * itself never does.
 */
function checkDescendants(signature: ContractSignature, tree: UsageTree, path: string, problems: Problem[]): void {
  if (!signature.descendants) return;
  const below = everyNode(tree).slice(1).map(({ node }) => node.signature);
  for (const rule of signature.descendants) {
    const count = below.filter((id) => rule.of.includes(id)).length;
    const what = rule.of.join(" or ");
    if (count >= rule.min) continue;
    problems.push({
      path,
      rule: "missing-descendant",
      severity: "error",
      message: `${tree.signature} must hold at least ${rule.min} ${what} at any depth; it holds ${count}. ${rule.because}`,
    });
  }
}

function checkExcludes(signature: ContractSignature, tree: UsageTree, path: string, problems: Problem[]): void {
  for (const [key, excluded] of Object.entries(signature.excludes ?? {})) {
    if (!keyHolds(signature, tree, key)) continue;
    const clash = excluded.filter((name) => keyHolds(signature, tree, name));
    if (clash.length === 0) continue;
    problems.push({
      path,
      rule: "excluded-option",
      severity: "error",
      message: `"${key}" already decides ${excluded.join(", ")}; drop ${clash.join(", ")}.`,
    });
  }
}

function checkBetween(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const read = (name: string) => {
    const value = tree.options?.[name] ?? contract.options[name]?.default;
    return typeof value === "number" ? value : undefined;
  };
  for (const name of signature.options) {
    const bounds = contract.options[name]?.between;
    const value = tree.options?.[name];
    if (!bounds || typeof value !== "number") continue;
    const low = bounds.min !== undefined && signature.options.includes(bounds.min) ? read(bounds.min) : undefined;
    const high = bounds.max !== undefined && signature.options.includes(bounds.max) ? read(bounds.max) : undefined;
    if (low !== undefined && value < low)
      problems.push({ path, rule: "out-of-range", severity: "error", message: `"${name}" is ${value}, below "${bounds.min}" (${low}).` });
    if (high !== undefined && value > high)
      problems.push({ path, rule: "out-of-range", severity: "error", message: `"${name}" is ${value}, above "${bounds.max}" (${high}).` });
  }
}

/**
 * Whether a constraint key holds on this tree: an option given (a boolean only when true), a slot
 * filled, or `option=value` holding exactly that value.
 */
function keyHolds(signature: ContractSignature, tree: UsageTree, key: string): boolean {
  const eq = key.indexOf("=");
  if (eq > 0) {
    const option = key.slice(0, eq);
    const value = tree.options?.[option] ?? getContract(tree.contract)?.options[option]?.default;
    return value !== undefined && String(value) === key.slice(eq + 1);
  }
  const value = tree.options?.[key];
  if (value !== undefined && value !== false) return true;
  if (signature.slots[key] === undefined) return false;
  const filled = slotsOf(tree)[key];
  return (
    slotItems(filled).some((item) => item != null && (typeof item !== "string" || item.trim() !== "")) ||
    collectionItems(filled).length > 0
  );
}

function checkImplies(signature: ContractSignature, tree: UsageTree, path: string, problems: Problem[]): void {
  for (const [key, needed] of Object.entries(signature.implies ?? {})) {
    if (!keyHolds(signature, tree, key)) continue;
    const missing = needed.filter((name) => !keyHolds(signature, tree, name));
    if (missing.length === 0) continue;
    problems.push({
      path,
      rule: "missing-implied",
      severity: "error",
      message: `"${key}" needs ${missing.join(", ")} as well; without it the component has nothing to act on.`,
    });
  }
}

function checkPairs(signature: ContractSignature, tree: UsageTree, path: string, problems: Problem[]): void {
  const side = (ref: { slot: string; option: string }) => {
    const child = slotItems(slotsOf(tree)[ref.slot]).find(isUsageTree);
    if (!child) return undefined;
    return { explicit: child.options?.[ref.option], fallback: getContract(child.contract)?.options[ref.option]?.default };
  };
  for (const pair of signature.pairs ?? []) {
    const a = side(pair.a);
    const b = side(pair.b);
    if (!a || !b) continue;
    /*
     * A side with neither a value nor a default of its own (a Menu trigger's untyped `triggerVariant`)
     * renders the other side's default, so it matches the other side exactly when that side is also
     * at its default.
     */
    const resolve = (own: typeof a, other: typeof a) => own.explicit ?? own.fallback ?? other.fallback;
    if (String(resolve(a, b)) === String(resolve(b, a))) continue;
    problems.push({
      path,
      rule: "unpaired-options",
      severity: "error",
      message: `${pair.a.slot} ${pair.a.option} (${String(resolve(a, b))}) and ${pair.b.slot} ${pair.b.option} (${String(resolve(b, a))}) must match.`,
    });
  }
}

function checkDeprecatedValues(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  for (const name of signature.options) {
    const replacement = contract.options[name]?.deprecatedValues;
    const value = tree.options?.[name];
    if (!replacement || typeof value !== "string" || replacement[value] === undefined) continue;
    problems.push({
      path,
      rule: "deprecated-value",
      severity: "advisory",
      message: `"${name}": "${value}" is kept for existing markup; use "${replacement[value]}".`,
    });
  }
}

function checkParent(
  signature: ContractSignature,
  parent: { id: string } | undefined,
  path: string,
  problems: Problem[],
): void {
  const parents = signature.parents;
  if (!parents || parents.length === 0) return;

  if (!parent) {
    problems.push({
      path,
      rule: "invalid-parent",
      severity: "error",
      message: `This signature must sit inside ${parents.join(" or ")}; it is at the top level.`,
    });
    return;
  }

  if (!parents.includes(parent.id)) {
    problems.push({
      path,
      rule: "invalid-parent",
      severity: "error",
      message: `This signature must sit inside ${parents.join(" or ")}, not inside ${parent.id}.`,
    });
  }
}

function checkOptions(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  for (const [name, value] of Object.entries(tree.options ?? {})) {
    if (!signature.options.includes(name)) {
      const known = signature.options.join(", ") || "none";

      // An option this contract has but this signature does not is almost always a signature
      // mix-up, so name the sibling that takes it rather than only listing what this one accepts.
      const sibling = Object.entries(contract.signatures).find(
        ([id, other]) => id !== tree.signature && other.options.includes(name),
      );

      problems.push({
        path,
        rule: "unknown-option",
        severity: "error",
        message: sibling
          ? `"${name}" is not an option of ${tree.signature}; it is an option of ${sibling[0]}. It accepts: ${known}.`
          : `"${name}" is not an option of ${tree.signature}. It accepts: ${known}.`,
      });
      continue;
    }

    const option = contract.options[name] as ContractOption;
    const problem = optionValueProblem(option, name, value);
    if (problem) problems.push({ path, rule: "invalid-option-value", severity: "error", message: problem });
  }
}

function optionValueProblem(option: ContractOption, name: string, value: unknown): string | undefined {
  if (option.type === "enum") {
    const values = option.values ?? [];
    if (typeof value !== "string" || !values.includes(value)) {
      return `"${name}" must be one of ${values.join(", ")}; got ${JSON.stringify(value)}.`;
    }
    return undefined;
  }

  if (option.type === "boolean" && typeof value !== "boolean") {
    return `"${name}" is a boolean; got ${JSON.stringify(value)}.`;
  }

  if (option.type === "string" && typeof value !== "string") {
    return `"${name}" is a string; got ${JSON.stringify(value)}.`;
  }

  if (option.type === "number" && typeof value !== "number") {
    return `"${name}" is a number; got ${JSON.stringify(value)}.`;
  }

  /*
   * A name is never empty. An option written to `aria-label`/`aria-labelledby` given as "" is not
   * "no name", it is a name that says nothing, and it still flips whatever the contract keys on the
   * option being given: an optional Loader label turned the spinner into a `role="status"` with an
   * empty name instead of leaving it decorative.
   */
  if (
    typeof value === "string" &&
    value.trim() === "" &&
    (option.attr === "aria-label" || option.attr === "aria-labelledby")
  ) {
    return `"${name}" is an accessible name and cannot be empty; omit it instead.`;
  }

  if (option.pattern && typeof value === "string" && !new RegExp(option.pattern.source).test(value)) {
    return `"${name}" must look like "${option.pattern.example}"; got ${JSON.stringify(value)}.`;
  }

  if (option.valuesFrom && typeof value === "string") {
    const values = getContract(option.valuesFrom.contract)?.options[option.valuesFrom.option]?.values;
    if (values && !values.includes(value))
      return `"${name}" takes ${option.valuesFrom.contract}'s ${option.valuesFrom.option}: one of ${values.join(", ")}; got "${value}".`;
  }

  if (option.type === "number" && typeof value === "number") {
    if (option.integer && !Number.isInteger(value)) return `"${name}" is a whole number; got ${value}.`;
    if (option.min !== undefined && value < option.min) return `"${name}" is at least ${option.min}; got ${value}.`;
    if (option.max !== undefined && value > option.max) return `"${name}" is at most ${option.max}; got ${value}.`;
  }

  return undefined;
}

function checkRequiresForbids(
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const given = new Set([...Object.keys(tree.options ?? {}), ...Object.keys(tree.attrs ?? {})]);

  for (const name of signature.requires ?? []) {
    if (!given.has(name)) {
      problems.push({
        path,
        rule: "missing-required",
        severity: "error",
        message: `${tree.signature} requires "${name}".`,
      });
      continue;
    }
    /*
     * Present is not the same as supplied. Every required string in the catalogue is a name, an
     * href, an id or a key, and an empty one is the absence the requirement exists to refuse: a
     * `label: ""` on Vaul validated and emitted a bare `aria-label`, an unnamed modal.
     */
    const value = tree.options?.[name];
    if (typeof value === "string" && value.trim() === "") {
      problems.push({
        path,
        rule: "empty-required",
        severity: "error",
        message: `${tree.signature} requires "${name}", and it was given as an empty string.`,
      });
    }
  }

  for (const name of signature.forbids ?? []) {
    if (given.has(name)) {
      problems.push({
        path,
        rule: "forbidden",
        severity: "error",
        message: `${tree.signature} forbids "${name}". Its sibling signature is the one that takes it.`,
      });
    }
  }

  // Slots count as sources too: a frame takes its media as a `src` option or as authored children,
  // and "exactly one source" is the rule either way.
  const filled = new Set([...given, ...Object.keys(slotsOf(tree)).filter((slot) => slotItems(slotsOf(tree)[slot]).length > 0)]);

  for (const group of signature.exactlyOneOf ?? []) {
    const supplied = group.filter((name) => filled.has(name));

    if (supplied.length === 0) {
      problems.push({
        path,
        rule: "missing-exactly-one",
        severity: "error",
        message: `${tree.signature} needs exactly one of ${group.join(", ")}; none was given, which renders an empty box that every other check calls valid.`,
      });
    } else if (supplied.length > 1) {
      problems.push({
        path,
        rule: "ambiguous-exactly-one",
        severity: "error",
        message: `${tree.signature} takes exactly one of ${group.join(", ")}; got ${supplied.join(" and ")}.`,
      });
    }
  }
}

/**
 * An option counts only when it is set to something other than its default: `padding: "none"` on a
 * Box is written down and still paints nothing, which is exactly the case this rule exists to refuse.
 */
function slotSupplied(signature: ContractSignature, tree: UsageTree, name: string): boolean {
  const slot = signature.slots[name];
  if (!slot) return false;
  if (slot.accepts === "items") return collectionItems(slotsOf(tree)[name]).length > 0;
  return slotItems(slotsOf(tree)[name]).some((item) => typeof item !== "string" || item.trim() !== "");
}

function checkAtLeastOne(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const options = tree.options ?? {};

  for (const group of signature.atLeastOneOf ?? []) {
    const effective = group.filter((name) => {
      if (signature.slots[name] && slotSupplied(signature, tree, name)) return true;
      const declared = contract.options[name];
      if (!declared) return false;
      const value = options[name];
      if (value === undefined) return false;
      if (declared.type === "boolean") return value === true;
      return value !== declared.default;
    });

    if (effective.length === 0) {
      problems.push({
        path,
        rule: "missing-at-least-one",
        severity: "error",
        message: `${tree.signature} needs at least one of ${group.join(", ")}: a filled slot, a boolean set to true, or an option other than its default.`,
      });
    }
  }
}

function checkAccessibility(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const options = tree.options ?? {};
  const attrs = tree.attrs ?? {};

  for (const rule of contract.a11y ?? []) {
    // A landmark rule belongs to the signature that is the landmark, not to every signature of the
    // contract. Absent scope means the rule is keyed on an option they all share.
    if (rule.signatures && !rule.signatures.includes(tree.signature)) continue;

    const conditions = Object.entries(rule.when);

    /*
     * A rule keyed on something that is not an option of this signature is about page context, not
     * about this node: "a second nav on the page". Nothing static can settle it, so it is reported
     * as advisory rather than silently dropped: an unverifiable rule the agent never sees is the
     * same as no rule.
     */
    const evaluable = conditions.every(([key]) => signature.options.includes(key));
    if (!evaluable) {
      // Silent when the author already did it. An advisory that fires at someone who satisfied it
      // is noise, and noise is what teaches an agent to skip advisories.
      const satisfied = rule.requiresOneOf.some(
        (name) => attrs[name] !== undefined || options[name] !== undefined || slotsOf(tree)[name] !== undefined,
      );
      if (satisfied) continue;

      problems.push({
        path,
        rule: "unverifiable-a11y",
        severity: "advisory",
        message: `${rule.because} Requires one of: ${rule.requiresOneOf.join(", ")}. Not decidable from the tree alone; verify it in the render.`,
      });
      continue;
    }

    const applies = conditions.every(([key, expected]) => {
      if (expected === "present") return options[key] !== undefined;
      if (expected === "absent") return options[key] === undefined;
      return options[key] === expected;
    });
    if (!applies) continue;

    // The name may arrive as an option the contract maps (`alt`), as a raw attribute the author
    // passes through (`aria-label`), or as a filled slot the template renders as the label (a
    // switch's `children`). All three are the author supplying it.
    const filled = slotsOf(tree);
    const childSignature = (name: string) =>
      Object.values(filled).some((content) => slotItems(content).some((item) => isUsageTree(item) && item.signature === name));
    const slotGiven = (name: string) =>
      signature.slots[name] !== undefined &&
      (slotItems(filled[name]).some((item) => typeof item !== "string" || item.trim() !== "") ||
        collectionItems(filled[name]).length > 0);
    if (
      !rule.requiresOneOf.some(
        (name) => attrs[name] !== undefined || options[name] !== undefined || slotGiven(name) || childSignature(name),
      )
    ) {
      problems.push({
        path,
        rule: "missing-accessible-name",
        severity: "error",
        message: `${rule.because} Pass one of: ${rule.requiresOneOf.join(", ")}.`,
      });
    }
  }
}

function checkSlots(
  contract: ComponentContract,
  signature: ContractSignature,
  tree: UsageTree,
  trail: readonly string[],
  problems: Problem[],
): void {
  const path = trail.join(" > ");
  const filled = slotsOf(tree);

  for (const name of Object.keys(filled)) {
    if (!signature.slots[name]) {
      problems.push({
        path,
        rule: "unknown-slot",
        severity: "error",
        message: `${tree.signature} has no slot "${name}". It has: ${Object.keys(signature.slots).join(", ") || "none"}.`,
      });
    }
  }

  for (const [name, slot] of Object.entries(signature.slots)) {
    // A collection is entries, not children: `slotItems` filters them out, so without this branch a
    // filled collection reads as empty and its entries are never checked at all.
    if (slot.accepts === "items") {
      checkCollection(name, slot, collectionItems(filled[name]), tree, path, problems);
      continue;
    }

    const raw = slotItems(filled[name]) as readonly (string | UsageTree | null | undefined)[];
    if (raw.some((item) => item === null || item === undefined)) {
      problems.push({ path, rule: "invalid-child", severity: "error", message: `Slot "${name}" holds a null entry; remove it.` });
    }
    const items = raw.filter((item): item is string | UsageTree => item !== null && item !== undefined);
    checkOrderAndCardinality(name, slot, items, path, problems);
    if (slot.flatHierarchy) checkFlatHierarchy(slot.flatHierarchy, items, path, problems);
    if (slot.positions) checkPositions(slot.positions, items, path, problems);

    if (slot.uniqueChildOption && slot.accepts === "signature") {
      const seen = new Set<string>();
      for (const item of items) {
        if (!isUsageTree(item)) continue;
        const key = item.options?.[slot.uniqueChildOption];
        if (typeof key !== "string" || key.trim() === "") continue;
        if (seen.has(key)) {
          problems.push({
            path,
            rule: "duplicate-child-option",
            severity: "error",
            message: `Two children of "${name}" share ${slot.uniqueChildOption}="${key}". Answer keys must be unique among siblings.`,
          });
        } else {
          seen.add(key);
        }
      }
    }

    if (slot.required && items.length === 0) {
      problems.push({
        path,
        rule: "missing-required-slot",
        severity: "error",
        message: `${tree.signature} requires its "${name}" slot to be filled.`,
      });
      continue;
    }
    /*
     * Present but blank. Advisory, not an error: a template body a clone fills in, or a live readout
     * a script writes, is authored empty on purpose. Anywhere else it is a label that says nothing.
     */
    if (slot.required && !items.some((item) => typeof item !== "string" || item.trim() !== "")) {
      problems.push({
        path,
        rule: "blank-required-slot",
        severity: "advisory",
        message: `${tree.signature}'s "${name}" slot is filled with blank text; fine for a placeholder a script fills, otherwise it names nothing.`,
      });
    }

    for (const item of items) {
      if (!isUsageTree(item)) {
        if (slot.accepts === "signature") {
          problems.push({
            path,
            rule: "slot-accepts",
            severity: "error",
            message: `Slot "${name}" takes ${slot.of?.join(" or ") ?? "a signature"}, not text.`,
          });
        }
        continue;
      }

      if (slot.accepts === "text") {
        problems.push({
          path,
          rule: "slot-accepts",
          severity: "error",
          message: `Slot "${name}" takes text, not a composed signature.`,
        });
        continue;
      }

      if (slot.of && !slot.of.includes(item.signature)) {
        problems.push({
          path,
          rule: "slot-accepts",
          severity: "error",
          message: `Slot "${name}" takes ${slot.of.join(" or ")}; got ${item.signature}.`,
        });
      }

      if (slot.restrictOptions) {
        checkRestrictedOptions(name, slot.restrictOptions, item, `${path} > ${item.signature}`, problems);
      }

      checkContentModel(contract, signature, tree, name, item, path, problems);

      walk(item, { contract, signature, id: tree.signature }, trail, problems, slot.childAttrs);
    }
  }
}

/**
 * A slot's `restrictOptions` narrows one of the ITEM's own options to a subset of its usual values.
 * Silent when the item's signature does not have that option at all. A Link has no `variant`, so a
 * slot that restricts `variant` says nothing about it, the same way `checkAccessibility` skips a rule
 * keyed on an option this signature never declared.
 *
 * Checked against the item's own contract default when the option is omitted from the tree: leaving
 * `variant` unset does not exempt it, because the rendered button still has SOME variant, the
 * default one, and that default is exactly what most of these restrictions exist to rule out.
 */
function checkRestrictedOptions(
  slotName: string,
  restrictions: Readonly<Record<string, readonly string[]>>,
  item: UsageTree,
  path: string,
  problems: Problem[],
): void {
  const itemContract = getContract(item.contract);
  const itemSignature = itemContract && getSignature(itemContract, item.signature);
  if (!itemContract || !itemSignature) return;

  for (const [optionName, allowed] of Object.entries(restrictions)) {
    if (!itemSignature.options.includes(optionName)) continue;

    const declared = itemContract.options[optionName];
    const raw = (item.options ?? {})[optionName] ?? declared?.default;
    // A boolean is narrowed by its spelling: `["true"]` means "must be on".
    const value = typeof raw === "boolean" ? String(raw) : raw;

    if (typeof value === "string" && !allowed.includes(value)) {
      problems.push({
        path,
        rule: "restricted-option-value",
        severity: "error",
        message: `Slot "${slotName}" restricts "${optionName}" on ${item.signature} to ${allowed.join(" or ")}; got ${JSON.stringify(value)}.`,
      });
    }
  }
}

/**
 * The entries of a collection: each one is checked like a miniature signature: its own options
 * against the item shape, its own slots for content, plus the one rule a collection has that nothing
 * else does: **the key must be unique**. Two tabs with the same value silently collapse into one,
 * because the key is what pairs a trigger with its panel.
 */
function checkCollection(
  name: string,
  slot: ContractSlot,
  entries: readonly ItemInput[],
  tree: UsageTree,
  path: string,
  problems: Problem[],
  /*
   * Shared down a RECURSIVE slot, not reset per level. A tree's node ids are what selection and
   * expansion are written in (`defaultExpandedValue="src"`), and the machine addresses a node by
   * that value across the whole hierarchy: a folder and a file two levels down both called `src`
   * validated, and then expanding one opened the other.
   */
  seen: Set<string> = new Set(),
): void {
  if (slot.required && entries.length === 0) {
    problems.push({
      path,
      rule: "missing-required-slot",
      severity: "error",
      message: `${tree.signature} requires entries in its "${name}" collection.`,
    });
    return;
  }

  if (slot.minItems !== undefined && entries.length > 0 && entries.length < slot.minItems)
    problems.push({ path, rule: "wrong-cardinality", severity: "error", message: `"${name}" takes at least ${slot.minItems} entries; got ${entries.length}.` });
  if (slot.maxItems !== undefined && entries.length > slot.maxItems)
    problems.push({ path, rule: "wrong-cardinality", severity: "error", message: `"${name}" takes at most ${slot.maxItems} entries; got ${entries.length}.` });
  if (slot.countWhere && entries.length > 0) {
    const { option, equals, count: allowed } = slot.countWhere;
    const count = entries.filter((entry) => {
      const value = entry.options?.[option] ?? slot.item?.options[option]?.default;
      return value !== undefined && String(value) === equals;
    }).length;
    if ((allowed === "one" && count !== 1) || (allowed === "optional" && count > 1))
      problems.push({
        path,
        rule: "wrong-cardinality",
        severity: "error",
        message: `${allowed === "one" ? "Exactly" : "At most"} one entry of "${name}" has ${option}="${equals}"; got ${count}.`,
      });
  }

  const shape = slot.item;
  if (!shape) return;

  entries.forEach((entry, index) => {
    const where = `${path} > ${name}[${index}]`;

    for (const [option, value] of Object.entries(entry.options ?? {})) {
      const declared = shape.options[option];
      if (!declared) {
        problems.push({
          path: where,
          rule: "unknown-item-option",
          severity: "error",
          message: `An entry of "${name}" has no option "${option}". It accepts: ${Object.keys(shape.options).join(", ") || "none"}.`,
        });
        continue;
      }

      const problem = optionValueProblem(declared, option, value);
      if (problem) problems.push({ path: where, rule: "invalid-option-value", severity: "error", message: problem });
    }

    // Only when the collection HAS a key: an entry that becomes one element has nothing to pair,
    // and a uniqueness rule over nothing rejects trees for a reason that does not exist.
    if (shape.key !== undefined) {
      const key = entry.options?.[shape.key];
      if (typeof key !== "string" || key === "") {
        problems.push({
          path: where,
          rule: "missing-item-key",
          severity: "error",
          message: `Every entry of "${name}" needs "${shape.key}": it is what pairs the parts this entry becomes.`,
        });
      } else if (seen.has(key)) {
        problems.push({
          path: where,
          rule: "duplicate-item-key",
          severity: "error",
          message: `Two entries of "${name}" share ${shape.key}="${key}". The parts they become would collapse into one.`,
        });
      } else {
        seen.add(key);
      }
    }

    for (const required of shape.requires ?? []) {
      const option = entry.options?.[required];
      const slotted = slotItems(entry.slots?.[required]).some((item) => typeof item !== "string" || item.trim() !== "");
      if ((option === undefined || option === "") && !slotted)
        problems.push({ path: where, rule: "missing-required", severity: "error", message: `Every entry of "${name}" needs "${required}".` });
    }

    for (const [slotName, itemSlot] of Object.entries(shape.slots)) {
      if (itemSlot.required && !slotItems(entry.slots[slotName]).some((item) => typeof item !== "string" || item.trim() !== "")) {
        problems.push({
          path: where,
          rule: "missing-required-slot",
          severity: "error",
          message: `Every entry of "${name}" needs its "${slotName}" filled.`,
        });
      }

      /*
       * A recursive slot holds entries of the shape that CONTAINS it, so it is checked against the
       * same shape, one level down. Without this a folder's children were accepted unread: every
       * rule the entries above owe, they owe at every depth.
       */
      if (itemSlot.recursive) {
        const nested = collectionItems(entry.slots[slotName]);
        if (nested.length > 0) checkCollection(slotName, { ...itemSlot, item: shape }, nested, tree, where, problems, seen);
      }
    }

    for (const slotName of Object.keys(entry.slots)) {
      if (!shape.slots[slotName]) {
        problems.push({
          path: where,
          rule: "unknown-slot",
          severity: "error",
          message: `An entry of "${name}" has no slot "${slotName}". It has: ${Object.keys(shape.slots).join(", ")}.`,
        });
      }
    }
  });
}

/**
 * Order and cardinality inside a slot: the two rules a list of allowed signatures cannot state.
 *
 * A table is the reason both exist: its caption must come first and there may be at most one, its
 * body is required, and a `<tfoot>` written before `<tbody>` is markup the parser silently moves.
 * None of that is a presence check, and all of it is invisible until someone reads the page aloud.
 */
function checkOrderAndCardinality(
  name: string,
  slot: ContractSlot,
  items: readonly (string | UsageTree)[],
  path: string,
  problems: Problem[],
): void {
  const composed = items.filter(isUsageTree);
  if (slot.minItems !== undefined && composed.length > 0 && composed.length < slot.minItems)
    problems.push({ path, rule: "wrong-cardinality", severity: "error", message: `"${name}" takes at least ${slot.minItems}; got ${composed.length}.` });
  if (slot.maxItems !== undefined && composed.length > slot.maxItems)
    problems.push({ path, rule: "wrong-cardinality", severity: "error", message: `"${name}" takes at most ${slot.maxItems}; got ${composed.length}.` });
  for (const group of slot.groupCardinality ?? []) {
    const count = composed.filter((item) => group.of.includes(item.signature)).length;
    if ((group.count === "one" && count !== 1) || (group.count === "optional" && count > 1))
      problems.push({
        path,
        rule: "wrong-cardinality",
        severity: "error",
        message: `"${name}" takes ${group.count === "one" ? "exactly one" : "at most one"} of ${group.of.join(", ")}, counted together; got ${count}.`,
      });
  }
  if (composed.length === 0) return;

  if (slot.ordered && slot.of) {
    const rank = new Map(slot.of.map((id, index) => [id, index]));
    let highest = -1;
    let previous = "";

    for (const item of composed) {
      const position = rank.get(item.signature);
      if (position === undefined) continue;

      if (position < highest) {
        problems.push({
          path,
          rule: "out-of-order",
          severity: "error",
          message: `${item.signature} must come before ${previous} in "${name}". The order is ${slot.of.join(" → ")}.`,
        });
      } else {
        highest = position;
        previous = item.signature;
      }
    }
  }

  for (const [signature, allowed] of Object.entries(slot.cardinality ?? {})) {
    const count = composed.filter((item) => item.signature === signature).length;

    if (allowed === "one" && count !== 1) {
      problems.push({
        path,
        rule: "wrong-cardinality",
        severity: "error",
        message: `"${name}" needs exactly one ${signature}; got ${count}.`,
      });
    } else if (allowed === "optional" && count > 1) {
      problems.push({
        path,
        rule: "wrong-cardinality",
        severity: "error",
        message: `"${name}" takes at most one ${signature}; got ${count}.`,
      });
    }
  }
}
