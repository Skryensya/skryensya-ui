import { DOMSerializer, DOMParser as PMDOMParser, type Node as PMNode } from "prosemirror-model";
import { MarkdownSerializer, defaultMarkdownSerializer } from "prosemirror-markdown";
import { editorSchema } from "./schema.js";

/*
 * `document` is a PARAMETER everywhere below, never read off a global - the same "environment
 * facts taken as parameters, not read internally" rule `packages/core/src/hotkey.ts` already
 * follows. That is what lets every function here run identically inside a jsdom vitest
 * environment and inside a real browser binding, with no `typeof window` branching anywhere.
 */

export function docToHTML(doc: PMNode, document: Document): string {
  const container = document.createElement("div");
  const fragment = DOMSerializer.fromSchema(editorSchema).serializeFragment(doc.content, { document });
  container.appendChild(fragment);
  return container.innerHTML;
}

export function htmlToDoc(html: string, document: Document): PMNode {
  const container = document.createElement("div");
  container.innerHTML = html;
  return PMDOMParser.fromSchema(editorSchema).parse(container);
}

/*
 * `underline` has no CommonMark syntax. It serializes as raw inline HTML passthrough (<u>…</u>,
 * valid embedded HTML inside CommonMark) rather than being silently dropped. KNOWN LIMITATION,
 * asserted by serialize.test.ts, not just described here: `defaultMarkdownParser` does not map an
 * arbitrary embedded <u> back into the mark, so Markdown is a good OUTPUT format for underline and
 * a lossy INPUT format for it. Not "fixed" in v1 - the editor's live state is always the
 * EditorState/doc, never a re-parse of its own Markdown export, so this only bites a consumer who
 * round-trips through Markdown externally and feeds it back in.
 */
export const editorMarkdownSerializer = new MarkdownSerializer(
  { ...defaultMarkdownSerializer.nodes },
  {
    ...defaultMarkdownSerializer.marks,
    underline: { open: "<u>", close: "</u>", mixable: true, expelEnclosingWhitespace: true },
  },
);

export function docToMarkdown(doc: PMNode): string {
  return editorMarkdownSerializer.serialize(doc);
}
