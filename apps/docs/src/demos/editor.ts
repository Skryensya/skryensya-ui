import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const seedHTML =
  "<h2>Notas de lanzamiento</h2><p>Esta versión agrega <strong>negrita</strong>, <em>cursiva</em> y <u>subrayado</u>, además de listas:</p><ul><li><p>Encabezados H1–H3</p></li><li><p>Citas y bloques de código</p></li></ul><blockquote><p>Un editor real, no una maqueta.</p></blockquote>";

export const editorTree = (t: Translate): UsageTree => ({
  contract: "editor",
  signature: "Editor",
  options: {
    name: "content",
    defaultValue: seedHTML,
    placeholder: t("demo.editor.placeholder"),
    label: t("demo.editor.label"),
  },
});

/**
 * `toolbarCompact`: the SAME anatomy at a tighter density - an option, not a second signature (see
 * `editorContract`'s own comment on why this differs from `ColorPicker.compact`'s split). A
 * narrower `defaultValue` than the primary demo's, so the preview reads as "this is for a tight
 * space" rather than the same wide document with a smaller bar bolted on.
 */
export const editorCompactTree = (t: Translate): UsageTree => ({
  contract: "editor",
  signature: "Editor",
  options: {
    name: "compact-content",
    defaultValue: "<p>Un comentario <strong>corto</strong> cabe mejor con una barra chica.</p>",
    placeholder: t("demo.editor.placeholder"),
    label: t("demo.editor.label"),
    toolbarCompact: true,
  },
});
