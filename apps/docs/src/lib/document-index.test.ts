import { describe, expect, it } from "vitest";
import { indexDocument } from "./document-index";

const labels = (html: string) => indexDocument(html).headings.map((heading) => heading.label);

describe("indexDocument", () => {
  it("indexes top-level headings and skips nested ones", () => {
    expect(labels(`<h2>One</h2><div><h2>Demo</h2></div><h3>Two</h3>`)).toEqual(["One", "Two"]);
  });

  it("reads through a data-toc-transparent wrapper, at any depth of them", () => {
    const html = `<div data-toc-transparent><section data-toc-transparent><h2>Group</h2><div><h2>Demo</h2></div></section></div><h2>After</h2>`;
    expect(labels(html)).toEqual(["Group", "After"]);
  });
});
