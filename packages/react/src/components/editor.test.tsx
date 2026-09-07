import { render, screen, fireEvent, within } from "@testing-library/react";
import { act, createRef } from "react";
import { describe, expect, it, vi, beforeAll } from "vitest";
import { selectRange } from "@skryensya/editor/view";
import { FormField } from "./form-field.js";
import { Editor, type EditorHandle, type EditorValue } from "./editor.js";

/*
 * jsdom does no layout: `Range`/`Element` have no `getClientRects`/`getBoundingClientRect` at all,
 * and `EditorView.updateState` calls into `scrollToSelection` -> `coordsAtPos` unconditionally on
 * every dispatch, throwing `target.getClientRects is not a function` the moment a transaction
 * changes the selection. Stubbed with a zero rect, the standard workaround for testing ProseMirror
 * outside a real browser — this file is the only place these are needed, so they stay local rather
 * than in the shared `test-setup.ts`.
 */
beforeAll(() => {
  const zeroRect: DOMRect = {
    bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0,
    toJSON: () => ({}),
  };
  Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} }) as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => zeroRect;
  Element.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: function* () {} }) as unknown as DOMRectList;
  Element.prototype.getBoundingClientRect = () => zeroRect;
});

/** Selects the given substring of the editor's (single-paragraph) doc text, by character offset. */
function selectWord(handle: EditorHandle, word: string) {
  const view = handle.view!;
  const text = view.state.doc.textBetween(0, view.state.doc.content.size);
  const start = text.indexOf(word);
  if (start < 0) throw new Error(`"${word}" not found in "${text}"`);
  act(() => selectRange(view, start + 1, start + 1 + word.length));
}

describe("Editor: rendering", () => {
  it("renders defaultValue's HTML as the initial contenteditable content", () => {
    render(<Editor defaultValue="<p>Hola</p>" />);
    expect(screen.getByRole("textbox").textContent).toBe("Hola");
  });

  it("exposes an imperative handle that reads the current HTML/Markdown/JSON", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p>Hola</p>" ref={ref} />);
    expect(ref.current?.getHTML()).toBe("<p>Hola</p>");
    expect(ref.current?.getMarkdown().trim()).toBe("Hola");
    expect(ref.current?.getJSON()?.textContent).toBe("Hola");
  });

  it("placeholder text is visible on an empty doc and absent once there is real content", () => {
    const empty = render(<Editor placeholder="Escribe algo…" />);
    expect(empty.container.querySelector(".sk-editor__placeholder")?.textContent).toBe("Escribe algo…");
    empty.unmount();

    const filled = render(<Editor defaultValue="<p>Hola</p>" placeholder="Escribe algo…" />);
    expect(filled.container.querySelector(".sk-editor__placeholder")).toBeNull();
  });
});

describe("Editor: onChange", () => {
  it("firing a doc-changing transaction reports html, markdown and the raw ProseMirror doc", () => {
    const onChange = vi.fn<(value: EditorValue) => void>();
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p>Hola</p>" onChange={onChange} ref={ref} />);
    onChange.mockClear();

    act(() => {
      const view = ref.current!.view!;
      view.dispatch(view.state.tr.insertText("!", view.state.doc.content.size - 1));
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const value = onChange.mock.calls[0]![0];
    expect(value.html).toBe("<p>Hola!</p>");
    expect(value.markdown.trim()).toBe("Hola!");
    expect(value.doc.textContent).toBe("Hola!");
  });

  it("keeps the hidden textarea's value in sync with the current HTML, for native form submit", () => {
    const ref = createRef<EditorHandle>();
    const { container } = render(<Editor defaultValue="<p>Hola</p>" name="body" ref={ref} />);
    const hidden = container.querySelector<HTMLTextAreaElement>('textarea[name="body"]')!;
    expect(hidden.value).toBe("<p>Hola</p>");

    act(() => {
      const view = ref.current!.view!;
      view.dispatch(view.state.tr.insertText("!", view.state.doc.content.size - 1));
    });
    expect(hidden.value).toBe("<p>Hola!</p>");
  });
});

describe("Editor: toolbar", () => {
  it("clicking Bold while text is selected wraps it in <strong> and sets aria-pressed=true", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p>Hello world</p>" ref={ref} />);
    selectWord(ref.current!, "Hello");

    const bold = screen.getByRole("button", { name: "Negrita" });
    expect(bold.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(bold);

    expect(bold.getAttribute("aria-pressed")).toBe("true");
    expect(ref.current?.getHTML()).toBe("<p><strong>Hello</strong> world</p>");
  });

  it("clicking Bold again on the same selection removes the mark", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p>Hello world</p>" ref={ref} />);
    selectWord(ref.current!, "Hello");
    const bold = screen.getByRole("button", { name: "Negrita" });
    fireEvent.click(bold);
    fireEvent.click(bold);
    expect(bold.getAttribute("aria-pressed")).toBe("false");
    expect(ref.current?.getHTML()).toBe("<p>Hello world</p>");
  });

  it("moving the selection into already-bold text sets aria-pressed=true with no click", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p><strong>Hello</strong> world</p>" ref={ref} />);
    selectWord(ref.current!, "Hello");
    expect(screen.getByRole("button", { name: "Negrita" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("H1 toggles the current block to heading level 1; clicking it again (now pressed) returns to a paragraph", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p>Title</p>" ref={ref} />);
    selectWord(ref.current!, "Title");
    const h1 = screen.getByRole("button", { name: "Título 1" });
    fireEvent.click(h1);
    // `data-flush`: the schema marks every heading with it (schema.ts), opting a rendered heading
    // out of the docs site's own unlayered prose-heading margin rules — see that file's comment.
    expect(ref.current?.getHTML()).toBe('<h1 data-flush="">Title</h1>');
    expect(h1.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(h1);
    expect(ref.current?.getHTML()).toBe("<p>Title</p>");
    expect(h1.getAttribute("aria-pressed")).toBe("false");
  });

  it("Bullet list wraps the current block in a real list", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p>Item</p>" ref={ref} />);
    selectWord(ref.current!, "Item");
    fireEvent.click(screen.getByRole("button", { name: "Lista con viñetas" }));
    expect(ref.current?.getHTML()).toBe("<ul><li><p>Item</p></li></ul>");
  });

  it("Undo reverts the last change and disables itself once history is exhausted; Redo re-applies it", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p>Hello world</p>" ref={ref} />);
    selectWord(ref.current!, "Hello");
    const undo = screen.getByRole("button", { name: "Deshacer" }) as HTMLButtonElement;
    const redo = screen.getByRole("button", { name: "Rehacer" }) as HTMLButtonElement;
    expect(undo.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Negrita" }));
    expect(undo.disabled).toBe(false);
    expect(ref.current?.getHTML()).toContain("<strong>");

    fireEvent.click(undo);
    expect(ref.current?.getHTML()).toBe("<p>Hello world</p>");
    expect(undo.disabled).toBe(true);
    expect(redo.disabled).toBe(false);

    fireEvent.click(redo);
    expect(ref.current?.getHTML()).toContain("<strong>");
  });

  it("submitting the link form adds a real <a href> around the selection", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor defaultValue="<p>Read more</p>" ref={ref} />);
    selectWord(ref.current!, "more");

    // jsdom implements no Popover API open/close behaviour (no showPopover), so its content stays
    // `display: none` and only reachable via `{ hidden: true }` — confirmed project convention.
    // Submitting the form directly exercises the real handler without depending on that gap.
    const input = screen.getByRole("textbox", { hidden: true, name: "URL" }) as HTMLInputElement;
    const form = input.closest("form")!;
    fireEvent.change(input, { target: { value: "https://example.com" } });
    fireEvent.submit(form);

    expect(ref.current?.getHTML()).toBe('<p>Read <a href="https://example.com">more</a></p>');
  });
});

describe("Editor: readOnly and disabled", () => {
  it("readOnly marks the content non-editable and disables every toolbar button", () => {
    render(<Editor defaultValue="<p>Hola</p>" readOnly />);
    const content = screen.getByRole("textbox");
    expect(content.getAttribute("aria-readonly")).toBe("true");
    expect((screen.getByRole("button", { name: "Negrita" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("disabled marks the content aria-disabled", () => {
    render(<Editor defaultValue="<p>Hola</p>" disabled />);
    expect(screen.getByRole("textbox").getAttribute("aria-disabled")).toBe("true");
  });
});

describe("Editor: FormField integration", () => {
  it("rendered inside FormField, the content surface inherits its id and aria-describedby", () => {
    render(
      <FormField hint="Escribe con formato" label="Descripción">
        <Editor defaultValue="<p>Hola</p>" />
      </FormField>,
    );
    const content = screen.getByRole("textbox");
    expect(content.id).toBeTruthy();
    expect(content.getAttribute("aria-describedby")).toContain(`${content.id}-hint`);
    expect(screen.getByText("Descripción").getAttribute("for")).toBe(content.id);
  });

  it("rendered standalone, the content surface falls back to its own generated id", () => {
    render(<Editor defaultValue="<p>Hola</p>" />);
    expect(screen.getByRole("textbox").id).toBeTruthy();
  });
});
