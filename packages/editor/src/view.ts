import { EditorState, TextSelection, type Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { history } from "prosemirror-history";
import { editorSchema } from "./schema.js";
import { buildEditorKeymap } from "./keymap.js";
import { placeholderPlugin } from "./plugins.js";
import { htmlToDoc } from "./serialize.js";

/*
 * The one place `EditorView`/`EditorState`/`history()` are constructed. Neither binding
 * (`@skryensya/react`, `@skryensya/vanilla`) imports `prosemirror-view`/`prosemirror-state`
 * directly — they call this factory and use the types re-exported below, so only THIS package
 * needs those npm packages as dependencies (decision 1's package-boundary isolation, carried all
 * the way down to imports, not just `package.json`).
 */
export type { EditorView } from "prosemirror-view";
export type { EditorState, Transaction } from "prosemirror-state";
export type { Node as PMNode, MarkType, NodeType } from "prosemirror-model";

export type CreateEditorViewOptions = {
  /** The element ProseMirror mounts into and takes over as its own contenteditable root. */
  mount: HTMLElement;
  document: Document;
  /** Initial content, as an HTML string — parsed once, at construction. */
  defaultValueHTML?: string;
  placeholder?: string;
  editable?: () => boolean;
  autoFocus?: boolean;
  /** Called once at construction with the initial state, then again after every applied
   *  transaction — the one hook both bindings drive their own toolbar-active-state, onChange, and
   *  hidden-input sync from. */
  onTransaction?: (state: EditorState, tr: Transaction | undefined) => void;
};

export function createEditorView(options: CreateEditorViewOptions): EditorView {
  const doc = htmlToDoc(options.defaultValueHTML ?? "", options.document);
  const state = EditorState.create({
    schema: editorSchema,
    doc,
    plugins: [buildEditorKeymap(), history(), placeholderPlugin(options.placeholder ?? "")],
  });

  /*
   * `{ mount: options.mount }`, not the bare element: passed bare, ProseMirror treats it as a
   * PARENT to append its own new contentDOM into, leaving the accessibility attrs this package's
   * consumers put on `options.mount` (`role="textbox"`, `aria-*`, `tabindex`) stranded on an inert
   * wrapper while the real editable surface is an unlabelled child `div.ProseMirror` one level
   * down — confirmed live: exactly that nesting showed up once this was wired end to end. `{mount}`
   * makes PM reuse the given element AS its own `view.dom` instead, so the one element a consumer
   * authors is the one element that is actually `contenteditable`.
   */
  const view = new EditorView(
    { mount: options.mount },
    {
      state,
      editable: options.editable,
      dispatchTransaction(tr) {
        const nextState = view.state.apply(tr);
        view.updateState(nextState);
        options.onTransaction?.(nextState, tr);
      },
    },
  );

  options.onTransaction?.(state, undefined);
  if (options.autoFocus) view.focus();
  return view;
}

/** Selects the given document-position range — the one raw `prosemirror-state` primitive both
 *  bindings' tests need (to simulate "the user selected some text" before exercising a toolbar
 *  command) without taking their own dependency on the package that isolation exists to avoid. */
export function selectRange(view: EditorView, from: number, to: number): void {
  view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to)));
}

/** Replaces the view's entire document with fresh content parsed from an HTML string — the
 *  imperative "reset" both bindings expose (React's `EditorHandle.setContent`). Goes through the
 *  view's own `dispatch`, so `onTransaction` fires and every derived state (toolbar, hidden input,
 *  onChange) stays in sync exactly as it would for a user edit. */
export function setEditorContent(view: EditorView, html: string, document: Document): void {
  const doc = htmlToDoc(html, document);
  view.dispatch(view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content));
}
