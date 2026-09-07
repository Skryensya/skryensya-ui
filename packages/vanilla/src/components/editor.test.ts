import { fireEvent } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { selectRange } from "@skryensya/editor/view";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountEditor } from "./editor.js";

/*
 * jsdom does no layout: stubbed with a zero rect, the same workaround `editor.test.tsx` (React)
 * needs and documents in full — `EditorView.updateState` calls into `coordsAtPos` on every
 * dispatch, which throws without it.
 */
beforeAll(() => {
  const zeroRect: DOMRect = { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
  const emptyList = () => ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} }) as unknown as DOMRectList;
  Range.prototype.getClientRects = emptyList;
  Range.prototype.getBoundingClientRect = () => zeroRect;
  Element.prototype.getClientRects = emptyList;
  Element.prototype.getBoundingClientRect = () => zeroRect;
});

const HIDDEN_INPUT_STYLE =
  "border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;";

function markup({ html = "<p>Hello world</p>", attrs = "" }: { html?: string; attrs?: string } = {}) {
  document.body.innerHTML = `<div class="sk-editor" data-sk-editor ${attrs}>
    <div class="sk-toolbar" data-sk-toolbar role="toolbar"></div>
    <textarea class="sk-editor__hidden-input" name="body" aria-hidden="true" tabindex="-1" style="${HIDDEN_INPUT_STYLE}"></textarea>
    <div class="sk-editor__content sk-input" role="textbox" aria-multiline="true" tabindex="0">${html}</div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-editor]")!;
  let view: import("@skryensya/editor/view").EditorView | undefined;
  root.addEventListener("sk-editor-ready", (event) => {
    view = (event as CustomEvent).detail.view;
  });
  expect(mountEditor(document)).toBe(1);
  return { root, view: view! };
}

const byLabel = (root: HTMLElement, label: string) =>
  root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;

/** Selects the given substring of the (single-paragraph) content, by character offset. */
function selectWord(view: import("@skryensya/editor/view").EditorView, word: string) {
  const text = view.state.doc.textBetween(0, view.state.doc.content.size);
  const start = text.indexOf(word);
  if (start < 0) throw new Error(`"${word}" not found in "${text}"`);
  selectRange(view, start + 1, start + 1 + word.length);
}

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-editor]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("Editor vanilla enhancer", () => {
  it("mounts idempotently: mounting the same root twice only constructs one EditorView", () => {
    const { root } = markup();
    expect(mountEditor(document)).toBe(0);
    expect(root.hasAttribute("data-sk-ready")).toBe(true);
  });

  it("builds the toolbar's buttons into the pre-existing [data-sk-toolbar] container", () => {
    const { root } = markup();
    expect(byLabel(root, "Negrita")).toBeTruthy();
    expect(byLabel(root, "Cursiva")).toBeTruthy();
    expect(byLabel(root, "Insertar enlace")).toBeTruthy();
  });

  it("clicking Bold while text is selected wraps it in <strong> and sets aria-pressed=true", () => {
    const { root, view } = markup();
    selectWord(view, "Hello");
    const bold = byLabel(root, "Negrita");
    expect(bold.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(bold);
    expect(bold.getAttribute("aria-pressed")).toBe("true");

    const hidden = root.querySelector<HTMLTextAreaElement>(".sk-editor__hidden-input")!;
    expect(hidden.value).toBe("<p><strong>Hello</strong> world</p>");
  });

  it("dispatches sk-editor-change with html/markdown/doc on every doc-changing transaction", () => {
    const { root, view } = markup();
    let detail: { html: string; markdown: string } | undefined;
    root.addEventListener("sk-editor-change", (event) => {
      detail = (event as CustomEvent).detail;
    });
    selectWord(view, "Hello");
    fireEvent.click(byLabel(root, "Negrita"));
    expect(detail?.html).toBe("<p><strong>Hello</strong> world</p>");
    expect(detail?.markdown.trim()).toBe("**Hello** world");
  });

  it("readOnly disables every toolbar button and marks the content non-editable", () => {
    const { root } = markup({ attrs: 'data-readonly=""' });
    expect(byLabel(root, "Negrita").disabled).toBe(true);
  });

  it("Undo reverts the last change and disables itself once history is exhausted", () => {
    const { root, view } = markup();
    selectWord(view, "Hello");
    const undo = byLabel(root, "Deshacer");
    expect(undo.disabled).toBe(true);
    fireEvent.click(byLabel(root, "Negrita"));
    expect(undo.disabled).toBe(false);
    fireEvent.click(undo);
    const hidden = root.querySelector<HTMLTextAreaElement>(".sk-editor__hidden-input")!;
    expect(hidden.value).toBe("<p>Hello world</p>");
    expect(undo.disabled).toBe(true);
  });

  it("submitting the link form adds a real <a href> around the selection", () => {
    const { root, view } = markup({ html: "<p>Read more</p>" });
    selectWord(view, "more");
    const input = root.querySelector<HTMLInputElement>('input[aria-label="URL"]')!;
    const form = input.closest("form")!;
    input.value = "https://example.com";
    fireEvent.submit(form);
    const hidden = root.querySelector<HTMLTextAreaElement>(".sk-editor__hidden-input")!;
    expect(hidden.value).toBe('<p>Read <a href="https://example.com">more</a></p>');
  });
});
