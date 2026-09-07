import { describe, expect, it } from "vitest";
import { docToHTML, htmlToDoc, docToMarkdown } from "./serialize.js";

describe("HTML round-trip", () => {
  it("docToHTML wraps bold+italic text in nested <em><strong> (schema's own mark rank order)", () => {
    const doc = htmlToDoc("<p><strong><em>Hola</em></strong></p>", document);
    expect(docToHTML(doc, document)).toBe("<p><em><strong>Hola</strong></em></p>");
  });

  it("docToHTML renders a bullet_list as <ul><li>", () => {
    const doc = htmlToDoc("<ul><li><p>Uno</p></li><li><p>Dos</p></li></ul>", document);
    expect(docToHTML(doc, document)).toBe("<ul><li><p>Uno</p></li><li><p>Dos</p></li></ul>");
  });

  it("htmlToDoc parses a <blockquote><p> back into an equivalent doc", () => {
    const doc = htmlToDoc("<blockquote><p>Cita</p></blockquote>", document);
    expect(doc.firstChild?.type.name).toBe("blockquote");
    expect(doc.firstChild?.firstChild?.type.name).toBe("paragraph");
    expect(doc.firstChild?.firstChild?.textContent).toBe("Cita");
  });

  it("htmlToDoc parses a real <u> element into the underline mark", () => {
    const doc = htmlToDoc("<p><u>Subrayado</u></p>", document);
    const textNode = doc.firstChild?.firstChild;
    expect(textNode?.marks.some((mark) => mark.type.name === "underline")).toBe(true);
  });
});

describe("Markdown serialization", () => {
  it("docToMarkdown renders a heading as leading #'s", () => {
    const doc = htmlToDoc("<h2>Título</h2>", document);
    expect(docToMarkdown(doc).trim()).toBe("## Título");
  });

  /*
   * KNOWN, DOCUMENTED LIMITATION (see this module's own header comment): CommonMark has no native
   * underline syntax, so the mark serializes as raw <u>…</u> HTML passthrough — a good OUTPUT, but
   * this module deliberately exposes no Markdown-to-doc PARSER at all (the editor's live state is
   * always the EditorState/doc, never a re-parse of its own Markdown export), so there is nothing
   * here that claims to read that passthrough back into the mark. This test exists so a future
   * addition of a Markdown parser is a visible, deliberate decision, not a silent regression of
   * the passthrough shape asserted below.
   */
  it("docToMarkdown renders underline as raw <u> passthrough — a documented, known limitation", () => {
    const doc = htmlToDoc("<p><u>Subrayado</u></p>", document);
    expect(docToMarkdown(doc).trim()).toBe("<u>Subrayado</u>");
  });
});
