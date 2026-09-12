import { describe, expect, it } from "vitest";
import { buildPreviewFrameDocument } from "./preview-frame";

/*
 * THE SRCDOC DOCUMENT, WHICH IS THE ONE PURE PIECE OF ComponentPreview.
 *
 * `ComponentPreview.astro` is ~1,100 lines and 23 props, and almost none of it can be asserted
 * about: its behaviour is entangled with Astro rendering, and its only test is 14 lines of regex
 * over the component's own SOURCE TEXT, checking that two tab lists appear as siblings.
 *
 * This function is the exception. It is `options -> string`, 56 lines, and four call sites depend
 * on it, including the React island path, where the frame owning the mount is what makes the
 * binding isolated rather than isolated-looking. It had no test at all.
 *
 * What is worth pinning is the ESCAPING. Every one of these values reaches an HTML attribute, and
 * a demo's props are arbitrary JSON: an unescaped quote there does not throw, it silently ends the
 * attribute and rewrites the rest of the tag.
 */

const doc = (options: Parameters<typeof buildPreviewFrameDocument>[0]) =>
  buildPreviewFrameDocument(options);

describe("buildPreviewFrameDocument", () => {
  it("puts the body inside a well-formed document", () => {
    const html = doc({ body: "<p>hola</p>" });
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<p>hola</p>");
    expect(html).toContain('class="sk-component-preview__frame-body"');
  });

  it("omits the style element entirely when there is no css", () => {
    expect(doc({ body: "" })).not.toContain("<style>");
    expect(doc({ body: "", css: ".a{color:red}" })).toContain(".a{color:red}");
  });

  it("writes each layout flag only when asked", () => {
    const bare = doc({ body: "" });
    expect(bare).not.toContain("data-sk-component-preview-flush");
    expect(bare).not.toContain("data-sk-component-preview-scroll");
    const both = doc({ body: "", flush: true, scroll: true });
    expect(both).toContain("data-sk-component-preview-flush");
    expect(both).toContain("data-sk-component-preview-scroll");
  });

  it("carries a measure through as a custom property", () => {
    expect(doc({ body: "", measure: "40ch" })).toContain(
      'style="--sk-component-preview-measure: 40ch"',
    );
  });

  it("names the React demo module and export the frame runtime will look up", () => {
    const html = doc({ body: "", reactDemo: { module: "button", export: "ButtonBasicDemo" } });
    expect(html).toContain('data-sk-react-demo-module="button"');
    expect(html).toContain('data-sk-react-demo-export="ButtonBasicDemo"');
    /* No props given means no props attribute, rather than an empty one the runtime has to parse. */
    expect(html).not.toContain("data-sk-react-demo-props");
  });

  it("serialises demo props, and escapes the quotes that would end the attribute", () => {
    const html = doc({
      body: "",
      reactDemo: { module: "m", export: "E", props: { label: 'a "quoted" & <angled> value' } },
    });
    /* JSON escapes the inner quotes first, so they arrive as `\\&quot;`, and `escapeAttribute`
     * turns the JSON's own structural quotes into `&quot;` too. */
    expect(html).toContain("\\&quot;quoted\\&quot;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&lt;angled");
    /* The invariant that matters: no raw quote survives inside the attribute, because one would
     * end it early and rewrite the rest of the tag. */
    const line = html.split("\n").find((l) => l.includes("data-sk-react-demo-props="))!;
    const value = line.slice(line.indexOf('props="') + 'props="'.length, line.lastIndexOf('"'));
    expect(value).not.toContain('"');
  });

  it("escapes a module or export name too, not just the props", () => {
    const html = doc({ body: "", reactDemo: { module: 'x"y', export: "E" } });
    expect(html).toContain('data-sk-react-demo-module="x&quot;y"');
  });

  it("leaves the body unescaped, because the body IS markup", () => {
    /* The emitter produced it and it is the whole point of the frame; escaping it would render
     * the tags as text. */
    expect(doc({ body: '<button class="sk-button">Ok</button>' })).toContain(
      '<button class="sk-button">Ok</button>',
    );
  });
});
