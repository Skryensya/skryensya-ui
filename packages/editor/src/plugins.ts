import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

/**
 * Shows `text` only while the document is the schema's own empty doc (one empty paragraph, no
 * marks) — the standard ProseMirror placeholder recipe: a widget decoration, not real content, so
 * it never enters `doc`/serializes into html/markdown/doc output.
 *
 * Unlike `serialize.ts`, this reads the global `document` rather than taking one as a parameter:
 * `Plugin.props.decorations`'s signature is fixed by ProseMirror's own `EditorProps` type, and a
 * decoration only ever exists while a real `EditorView` is rendering, so there is no pure/test
 * context this needs to run in without one.
 */
export function placeholderPlugin(text: string): Plugin {
  return new Plugin({
    props: {
      decorations(state) {
        const isEmpty =
          state.doc.childCount === 1 &&
          state.doc.firstChild != null &&
          state.doc.firstChild.isTextblock &&
          state.doc.firstChild.content.size === 0;
        if (!isEmpty || !text) return null;
        const widget = document.createElement("span");
        widget.className = "sk-editor__placeholder";
        widget.textContent = text;
        widget.setAttribute("aria-hidden", "true");
        return DecorationSet.create(state.doc, [Decoration.widget(1, widget, { side: 0 })]);
      },
    },
  });
}
