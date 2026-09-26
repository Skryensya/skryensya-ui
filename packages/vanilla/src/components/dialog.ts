import { trapModalDialogs } from "@skryensya/core/focus-trap";

/*
 * DIALOG, the one thing this binding adds to the platform's modal: Tab wraps at the ends.
 *
 * Every other behaviour stays `showModal()`'s, and the wrap is `@skryensya/core/focus-trap`'s. The
 * trap is document-wide, so this needs no per-dialog state and never marks a root: it cannot use
 * `createConnectMount`, whose shared `data-sk-ready` marker assumes disjoint selectors, and
 * `dialog` overlaps Vaul's, the Command Palette's and the Lightbox's roots by design. Any page with
 * a `<dialog>` in it gets the wrap, which is also how those three and Comment Thread get it here.
 *
 * Held for the life of the document, like the listener it installs: dialogs come and go, the page
 * that renders them does not.
 */
const held = new WeakSet<Document>();

export function mountDialog(target: Document | Element = document): number {
  if (typeof document === "undefined") return 0;
  const doc = target instanceof Document ? target : target.ownerDocument;
  const count = (target instanceof Element && target.matches("dialog") ? 1 : 0) + target.querySelectorAll("dialog").length;
  if (count > 0 && !held.has(doc)) {
    held.add(doc);
    trapModalDialogs(doc);
  }
  return count;
}
