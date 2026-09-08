import { Schema, type MarkSpec, type NodeSpec, type Node as PMNode } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";

/*
 * Cherry-picked, not spread wholesale: `image` is out of scope for v1 (not part of the confirmed
 * toolbar requirement list), so it is deliberately excluded rather than inherited by accident.
 * Heading levels stay 1–6 (schema-basic's own unmodified spec) so pasted/imported h4–h6 content
 * survives; the TOOLBAR only exposes H1–H3 buttons (`commands.ts`) - restricting the UI, not
 * silently downgrading content, is the reversible choice.
 */
const headingSpec = basicSchema.spec.nodes.get("heading")!;

/*
 * `data-flush` on every rendered heading, not schema-basic's own bare `["h" + level, 0]`: this
 * site's own `apps/docs/src/styles/site.css` has UNLAYERED (not `@layer components`) `h1`/`h2`/`h3`
 * rules that repaint any bare heading as a DOCS section title - 64px of `--space-section` above an
 * h2, confirmed live, because a `@layer components` rule can never outrank an unlayered one
 * regardless of specificity, so nothing in `editor.css` alone could win this. `data-flush` is that
 * file's own documented escape (`h2:not([data-flush], ...)`), the same one Toc/Dialog/Popover
 * titles already use - a ProseMirror-rendered heading is exactly the "component's own heading is
 * not prose" case that rule exists for. `editor.css` supplies the real heading type in its place.
 */
const headingWithFlush: NodeSpec = {
  ...headingSpec,
  toDOM(node: PMNode) {
    return ["h" + (node.attrs.level as number), { "data-flush": "" }, 0];
  },
};

const baseNodes = basicSchema.spec.nodes.remove("image").update("heading", headingWithFlush);
const nodes = addListNodes(baseNodes, "paragraph block*", "block");

/*
 * Not in schema-basic. `toDOM`/`parseDOM` round-trip through a real <u>, which is also what the
 * Markdown passthrough (serialize.ts) emits - one representation, read by both paths.
 */
const underline: MarkSpec = {
  parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
  toDOM: () => ["u", 0],
};

const marks = basicSchema.spec.marks.addToEnd("underline", underline);

// Typed `Schema` rather than left inferred: the inferred type names an internal `orderedmap`
// helper type that isn't portable across package boundaries once `declaration: true` tries to
// emit it (tsc TS2742) - an explicit annotation on the exported const sidesteps that entirely.
export const editorSchema: Schema = new Schema({ nodes, marks });
export type EditorSchema = typeof editorSchema;
