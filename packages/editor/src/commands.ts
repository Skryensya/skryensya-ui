import type { Attrs, MarkType, NodeType } from "prosemirror-model";
import type { Command, EditorState } from "prosemirror-state";
import { toggleMark, setBlockType, wrapIn } from "prosemirror-commands";
import { wrapInList } from "prosemirror-schema-list";
import { undo, redo, undoDepth, redoDepth } from "prosemirror-history";
import { editorCommandNames, type EditorCommandName } from "@skryensya/core/editor";
import { editorSchema } from "./schema.js";

/*
 * ProseMirror's own `Command` (`(state, dispatch?, view?) => boolean`) and `EditorState` are
 * already the pure, testable command layer this repo would otherwise hand-roll (`hotkey.ts`,
 * `menubar.ts`). The only code this module adds is the mapping from a toolbar button's command
 * name to an already-pure ProseMirror command, plus small "is this active" readers — no new
 * abstraction, and every function here is tested directly against `EditorState` fixtures, no DOM.
 *
 * `toggleLink` takes an argument (`href`), so it cannot share this table's uniform zero-argument
 * `Command` signature — it is `setLink(href)`/`unsetLink` below instead. `editorCommandNames`
 * (imported from the contract) is exhaustive over this Record at the TYPE level; commands.test.ts
 * additionally asserts it at the VALUE level, so a contract addition can never silently ship with
 * no implementation.
 */
export const editorCommands: Record<Exclude<EditorCommandName, "toggleLink">, Command> = {
  toggleBold: toggleMark(editorSchema.marks.strong),
  toggleItalic: toggleMark(editorSchema.marks.em),
  toggleUnderline: toggleMark(editorSchema.marks.underline),
  toggleCode: toggleMark(editorSchema.marks.code),
  heading1: setBlockType(editorSchema.nodes.heading, { level: 1 }),
  heading2: setBlockType(editorSchema.nodes.heading, { level: 2 }),
  heading3: setBlockType(editorSchema.nodes.heading, { level: 3 }),
  toggleBulletList: wrapInList(editorSchema.nodes.bullet_list),
  toggleOrderedList: wrapInList(editorSchema.nodes.ordered_list),
  toggleBlockquote: wrapIn(editorSchema.nodes.blockquote),
  toggleCodeBlock: setBlockType(editorSchema.nodes.code_block),
  undo,
  redo,
};

export function setLink(href: string): Command {
  return toggleMark(editorSchema.marks.link, { href });
}

export const unsetLink: Command = (state, dispatch) => toggleMark(editorSchema.marks.link)(state, dispatch);

/**
 * `setBlockType` is not itself a toggle — running `heading1` again on an already-h1 block just
 * re-applies "be heading1" and stays put (asserted by commands.test.ts's own double-apply case).
 * A toolbar button reads as broken if clicking an already-pressed one does nothing, so the four
 * `setBlockType`-based commands (`heading1`/`heading2`/`heading3`/`toggleCodeBlock`) are the ones
 * a caller should redirect to THIS command instead, when `blockActive` already reports them on.
 * `wrapInList`/`wrapIn` (the list/blockquote commands) don't have this problem the same way —
 * re-running them against an already-matching wrap is a safe no-op (`findWrapping` returns null),
 * not a value worth toggling off.
 */
export const setParagraph: Command = setBlockType(editorSchema.nodes.paragraph);

/**
 * Whether the mark is active across the ENTIRE selection (or, when the selection is empty, at the
 * caret) — the standard toolbar "pressed" reading. Deliberately NOT `doc.rangeHasMark`: that asks
 * whether the mark occurs ANYWHERE in the range, which would light up Bold for a selection that is
 * only partly bold — confirmed live by commands.test.ts, which is what caught this.
 */
export function markActive(state: EditorState, markType: MarkType): boolean {
  const { from, to, empty, $from } = state.selection;
  if (empty) return Boolean(markType.isInSet(state.storedMarks ?? $from.marks()));

  let sawText = false;
  let everyTextNodeHasIt = true;
  state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText) return;
    sawText = true;
    if (!markType.isInSet(node.marks)) everyTextNodeHasIt = false;
  });
  return sawText && everyTextNodeHasIt;
}

/** Whether the selection's block is exactly this node type (and, when given, carries these attrs). */
export function blockActive(state: EditorState, nodeType: NodeType, attrs?: Attrs | null): boolean {
  const { $from, to } = state.selection;
  return to <= $from.end() && $from.parent.hasMarkup(nodeType, attrs ?? null);
}

export function canUndo(state: EditorState): boolean {
  return undoDepth(state) > 0;
}

export function canRedo(state: EditorState): boolean {
  return redoDepth(state) > 0;
}

/** Exhaustiveness guard: fails at compile time if a contract command name has no table entry. */
export const _exhaustive: readonly EditorCommandName[] = editorCommandNames;
