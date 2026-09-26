/*
 * FOCUS TRAP: the one answer to "where can Tab land in here", and the Tab wrap every modal shares.
 *
 * `showModal()` already does most of what a focus trap is for: the page behind is inert, Escape
 * closes, focus is restored on close (decision 5). What it does NOT do is wrap. Tab from the last
 * control leaves the document for the browser's own toolbar, and Shift+Tab from the first does the
 * same backwards. APG's modal dialog pattern wraps; the lightbox already did, by hand, with its own
 * selector, and every other modal in the kit (Dialog, Vaul, Command Palette, Comment Thread) did not.
 * Decision 24 records why this closes that gap once, here, instead of in each component.
 *
 * WHAT IT IS NOT: a reimplementation of the platform's modality. No inert, no Escape, no initial
 * focus, no focus restoration, no top layer: those stay `showModal()`'s. This only moves focus at the
 * two ends of a modal's own tab order, which is the one thing the platform leaves to the page.
 *
 * WHY NOT `@zag-js/focus-trap` (or `@zag-js/dom-query`'s `getTabbables`), although Zag is already a
 * dependency: both decide visibility from layout (`offsetWidth || getClientRects().length`). jsdom
 * does no layout, so every element reads as hidden there and every binding test that crosses a
 * modal would see an empty tab order. `checkVisibility()` answers the same question from the
 * browser's own render state and falls back to attributes where it is missing, which is what the
 * tour already did for its targets and what `feed-dom.ts` argued for in so many words.
 */

/**
 * Everything that can take focus from Tab by default, before visibility and `tabindex` are read.
 *
 * The single list: the lightbox, the tour and the feed each carried their own, and no two agreed
 * (the lightbox's matched disabled buttons, the tour's missed `<audio controls>`, the feed's missed
 * `area`). `annotation.ts`'s specimen list is deliberately NOT this one: it strips EVERY stop,
 * including `tabindex="-1"` ones Zag is about to restamp. `@skryensya/devtools`'s badge list is CSS
 * text, not a query, and cannot call the filters below.
 */
export const TABBABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "details > summary:first-of-type",
  "iframe",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]",
].join(",");

/**
 * Is this element rendered? The browser's own answer where it has one (`checkVisibility`), else an
 * ancestor walk over `hidden` and `display: none`, plus `visibility: hidden` on the element itself.
 *
 * Not `offsetParent`: jsdom reports `null` for everything, and a browser reports it for anything
 * inside a `position: fixed` ancestor, which a sticky header or a drawer very often is.
 */
export function isShown(element: Element | null | undefined): element is HTMLElement {
  if (!element?.isConnected) return false;
  const check = (element as HTMLElement & { checkVisibility?: (options?: object) => boolean }).checkVisibility;
  if (typeof check === "function") return check.call(element, { visibilityProperty: true });
  const win = element.ownerDocument.defaultView;
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (node.hasAttribute("hidden")) return false;
    const style = win?.getComputedStyle(node);
    /* A `[popover]` in an engine that cannot open one: jsdom's UA sheet still says `display: none`
       for it, forever, so that `none` is not an answer. The component reveals it with `hidden`. */
    const unopenable = node.hasAttribute("popover") && typeof (node as HTMLElement).showPopover !== "function";
    if ((style?.display === "none" && !unopenable) || (node === element && style?.visibility === "hidden")) return false;
  }
  return true;
}

const negativeTabIndex = (element: Element): boolean => {
  const value = element.getAttribute("tabindex");
  return value !== null && value.trim() !== "" && Number.parseInt(value, 10) < 0;
};

/*
 * A named radio group is ONE stop: the checked radio, or the first one when none is. Counting every
 * radio would put the trap's "last" on a radio the browser skips, and Tab would sail past it.
 */
const isGroupStop = (element: Element): boolean => {
  const radio = element as HTMLInputElement;
  if (radio.tagName !== "INPUT" || radio.type !== "radio" || !radio.name) return true;
  if (radio.checked) return true;
  const scope = radio.form ?? radio.ownerDocument;
  const group = Array.from(scope.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter(
    (other) => other.name === radio.name && other.form === radio.form && !other.disabled && isShown(other),
  );
  const checked = group.find((other) => other.checked);
  return checked ? checked === radio : group[0] === radio;
};

/** Could Tab land on this element? Matches the list, is not opted out, is rendered and not inert. */
export function isTabbable(element: Element): element is HTMLElement {
  return (
    element.matches(TABBABLE_SELECTOR) &&
    !negativeTabIndex(element) &&
    !element.closest("[inert]") &&
    isShown(element) &&
    isGroupStop(element)
  );
}

/**
 * The tab stops inside `scope`, in document order. `includeScope` adds the scope itself first when
 * it is one (the tour's target can be a button on its own).
 */
export function tabbables(scope: Element, { includeScope = false }: { includeScope?: boolean } = {}): HTMLElement[] {
  /* `Array.from` rather than spreading the NodeList: core is also compiled by node packages whose
     `lib` has no `DOM.Iterable` (see `annotation.ts`). Sorted, because document order is what a
     selector list promises and not what every engine delivers: jsdom's returns this one grouped by
     selector, buttons before links, which would put the wrap's "last" in the middle. */
  const inside = Array.from(scope.querySelectorAll(TABBABLE_SELECTOR)).sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
  const all = includeScope ? [scope, ...inside] : inside;
  return all.filter(isTabbable);
}

/**
 * Wrap one Tab keypress inside `scope`: last → first, first → last (Shift), and a focus that sits
 * outside it (on `<body>`, after a click on something that cannot hold focus) re-enters at the end
 * Tab was heading for. A scope with nothing tabbable swallows the key rather than let it leave.
 *
 * Anywhere in the middle it does nothing, so the browser's own order, radio groups, `tabindex` and
 * all, is the order. Returns whether it moved focus or swallowed the key.
 */
export function wrapTab(scope: HTMLElement, event: KeyboardEvent): boolean {
  const list = tabbables(scope);
  if (list.length === 0) {
    event.preventDefault();
    return true;
  }
  const first = list[0]!;
  const last = list[list.length - 1]!;
  const active = scope.ownerDocument.activeElement;
  const inside = active !== null && active !== scope && scope.contains(active);
  if (event.shiftKey && (!inside || active === first)) {
    event.preventDefault();
    last.focus();
    return true;
  }
  if (!event.shiftKey && (!inside || active === last)) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

/**
 * Is this `<dialog>` open modally? `:modal` is the platform's own word for it, and the only one that
 * tells `showModal()` from `show()` or an authored `open`. jsdom has no top layer, so the test floor
 * (`jsdom-floor.ts`) answers this exact query for the dialogs its `showModal` shim opened.
 */
export function isModalDialog(element: Element | null | undefined): element is HTMLDialogElement {
  if (element?.tagName !== "DIALOG") return false;
  try {
    return element.matches(":modal");
  } catch {
    return false;
  }
}

/*
 * THE MODAL A KEY BELONGS TO. The page behind a modal is inert, so a keypress comes either from
 * inside the topmost modal or from `<body>`. Inside: the nearest modal ancestor, which is the
 * innermost when one modal opened another. On `<body>`: the last open modal in the document, a
 * stand-in for "topmost", since the top layer's own order is not readable from script.
 */
function modalFor(doc: Document, target: EventTarget | null): HTMLDialogElement | null {
  const start = (target as Node | null)?.nodeType === 1 ? (target as Element) : null;
  for (let node = start; node; node = node.parentElement) {
    if (isModalDialog(node)) return node;
  }
  const open = Array.from(doc.querySelectorAll("dialog")).filter(isModalDialog);
  return open[open.length - 1] ?? null;
}

const installed = new WeakMap<Document, { users: number; off: () => void }>();

/**
 * Wrap Tab inside whichever modal `<dialog>` is open in `doc`, for as long as anyone holds the
 * returned release. Idempotent and counted: every binding that renders a modal calls it, and the one
 * listener is removed only when the last of them lets go.
 *
 * Document-wide rather than per dialog because a plain Dialog has no enhancer at all (the consumer
 * calls `showModal()`), so there is no open event of ours to hang a per-dialog trap from. Bubble
 * phase and `defaultPrevented` first: a widget inside the modal that owns Tab (an editor indenting,
 * a composite with its own stop) has already said so by the time the key reaches the document.
 */
export function trapModalDialogs(doc: Document): () => void {
  let entry = installed.get(doc);
  if (!entry) {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Tab" || event.defaultPrevented) return;
      /* Ctrl+Tab and friends switch browser tabs; they were never a move inside the page. */
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const modal = modalFor(doc, event.target);
      if (modal) wrapTab(modal, event);
    };
    doc.addEventListener("keydown", onKeyDown);
    entry = { users: 0, off: () => doc.removeEventListener("keydown", onKeyDown) };
    installed.set(doc, entry);
  }
  entry.users += 1;
  const held = entry;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    held.users -= 1;
    if (held.users === 0) {
      held.off();
      installed.delete(doc);
    }
  };
}
