import { describe, expect, it } from "vitest";
import type { Command } from "prosemirror-state";
import { EditorState, TextSelection } from "prosemirror-state";
import { history } from "prosemirror-history";
import { editorSchema } from "./schema.js";
import { htmlToDoc } from "./serialize.js";
import {
  editorCommands,
  markActive,
  blockActive,
  canUndo,
  canRedo,
  setLink,
  unsetLink,
} from "./commands.js";

function stateFromHTML(html: string, plugins: readonly (import("prosemirror-state").Plugin)[] = []): EditorState {
  const doc = htmlToDoc(html, document);
  return EditorState.create({ schema: editorSchema, doc, plugins });
}

/** Selects the given substring of the state's (single-paragraph) doc text, by character offset. */
function selectWord(state: EditorState, word: string): EditorState {
  const text = state.doc.textBetween(0, state.doc.content.size);
  const start = text.indexOf(word);
  if (start < 0) throw new Error(`"${word}" not found in doc text "${text}"`);
  // +1: position 0 is before the paragraph's opening tag, text starts at position 1.
  const from = start + 1;
  const to = from + word.length;
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, from, to)));
}

/** Runs a Command against `state` and returns `{ applied, state }` - the resulting state when the
 *  command dispatched a transaction, or the untouched input state when it returned false. */
function run(command: Command, state: EditorState): { applied: boolean; state: EditorState } {
  let next = state;
  const applied = command(state, (tr) => (next = state.apply(tr)));
  return { applied, state: next };
}

describe("editorCommands: marks", () => {
  it("toggleBold wraps the selected text in a strong mark", () => {
    const selected = selectWord(stateFromHTML("<p>Hello world</p>"), "Hello");
    const { applied, state } = run(editorCommands.toggleBold, selected);
    expect(applied).toBe(true);
    expect(markActive(state, editorSchema.marks.strong!)).toBe(true);
  });

  it("toggleBold run twice on the same selection removes the mark again", () => {
    const selected = selectWord(stateFromHTML("<p>Hello world</p>"), "Hello");
    const once = run(editorCommands.toggleBold, selected).state;
    const twice = run(editorCommands.toggleBold, once).state;
    expect(markActive(twice, editorSchema.marks.strong!)).toBe(false);
  });

  it("markActive reports true only when the entire selection carries the mark, not just part of it", () => {
    const withBold = stateFromHTML("<p><strong>Hello</strong> world</p>");
    const wholeBold = selectWord(withBold, "Hello");
    expect(markActive(wholeBold, editorSchema.marks.strong!)).toBe(true);

    const spanningBoth = withBold.apply(
      withBold.tr.setSelection(TextSelection.create(withBold.doc, 1, withBold.doc.content.size - 1)),
    );
    expect(markActive(spanningBoth, editorSchema.marks.strong!)).toBe(false);
  });
});

describe("editorCommands: blocks", () => {
  it("heading1 changes the current paragraph's node type to heading level 1", () => {
    const selected = selectWord(stateFromHTML("<p>Title</p>"), "Title");
    const { state } = run(editorCommands.heading1, selected);
    expect(blockActive(state, editorSchema.nodes.heading!, { level: 1 })).toBe(true);
  });

  it("heading1 applied to an already-h1 block does not double-wrap the document", () => {
    const selected = selectWord(stateFromHTML("<h1>Title</h1>"), "Title");
    const before = selected.doc.toString();
    const { state } = run(editorCommands.heading1, selected);
    expect(state.doc.toString()).toBe(before);
  });

  it("toggleBulletList wraps the current block in a bullet_list > list_item", () => {
    const selected = selectWord(stateFromHTML("<p>Item one</p>"), "Item");
    const { applied, state } = run(editorCommands.toggleBulletList, selected);
    expect(applied).toBe(true);
    expect(state.doc.firstChild?.type.name).toBe("bullet_list");
    expect(state.doc.firstChild?.firstChild?.type.name).toBe("list_item");
  });

  it("toggleCodeBlock changes the current paragraph into a code_block", () => {
    const selected = selectWord(stateFromHTML("<p>const x = 1</p>"), "const");
    const { state } = run(editorCommands.toggleCodeBlock, selected);
    expect(state.doc.firstChild?.type.name).toBe("code_block");
  });
});

describe("links", () => {
  it("setLink adds a real link mark carrying the given href", () => {
    const selected = selectWord(stateFromHTML("<p>Read more</p>"), "more");
    const { state } = run(setLink("https://example.com"), selected);
    expect(markActive(state, editorSchema.marks.link!)).toBe(true);

    let href: string | undefined;
    state.doc.nodesBetween(state.selection.from, state.selection.to, (node) => {
      href ??= editorSchema.marks.link!.isInSet(node.marks)?.attrs.href;
    });
    expect(href).toBe("https://example.com");
  });

  it("unsetLink removes an existing link mark from the selection", () => {
    const selected = selectWord(stateFromHTML('<p>Read <a href="https://example.com">more</a></p>'), "more");
    const { state } = run(unsetLink, selected);
    expect(markActive(state, editorSchema.marks.link!)).toBe(false);
  });
});

describe("history helpers", () => {
  it("canUndo is false on a freshly created state and true after one applied transaction", () => {
    const fresh = stateFromHTML("<p>Hello</p>", [history()]);
    expect(canUndo(fresh)).toBe(false);

    const afterEdit = fresh.apply(fresh.tr.insertText("!", fresh.doc.content.size - 1));
    expect(canUndo(afterEdit)).toBe(true);
  });

  it("canRedo is false until something has been undone", () => {
    const fresh = stateFromHTML("<p>Hello</p>", [history()]);
    expect(canRedo(fresh)).toBe(false);
  });

  it("canUndo/canRedo are always false with no history plugin registered, never a throw", () => {
    const fresh = stateFromHTML("<p>Hello</p>");
    expect(canUndo(fresh)).toBe(false);
    expect(canRedo(fresh)).toBe(false);
  });
});
