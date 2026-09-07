import { describe, expect, it } from "vitest";
import { editorSchema } from "./schema.js";

describe("editorSchema", () => {
  it("has exactly the node set this component supports, and no image node", () => {
    expect(Object.keys(editorSchema.nodes).sort()).toEqual(
      [
        "blockquote",
        "bullet_list",
        "code_block",
        "doc",
        "hard_break",
        "heading",
        "horizontal_rule",
        "list_item",
        "ordered_list",
        "paragraph",
        "text",
      ].sort(),
    );
  });

  it("has exactly the mark set this component supports, including the custom underline mark", () => {
    expect(Object.keys(editorSchema.marks).sort()).toEqual(["code", "em", "link", "strong", "underline"].sort());
  });

  it("accepts heading levels 1 through 6, so pasted h4-h6 content is not silently downgraded", () => {
    const heading = editorSchema.nodes.heading!.create({ level: 6 }, editorSchema.text("Deep heading"));
    expect(heading.attrs.level).toBe(6);
  });

  it("round-trips a real <u> element into the underline mark and back out via toDOM", () => {
    const mark = editorSchema.marks.underline!.create();
    const spec = mark.type.spec.toDOM!(mark, true);
    expect(spec).toEqual(["u", 0]);
  });

  it("renders every heading level with data-flush, opting it out of the docs site's own unlayered prose-heading rules", () => {
    const heading = editorSchema.nodes.heading!.create({ level: 2 }, editorSchema.text("Título"));
    const spec = heading.type.spec.toDOM!(heading);
    expect(spec).toEqual(["h2", { "data-flush": "" }, 0]);
  });
});
