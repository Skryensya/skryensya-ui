import { keymap } from "prosemirror-keymap";
import { baseKeymap, chainCommands } from "prosemirror-commands";
import { sinkListItem, liftListItem, splitListItem } from "prosemirror-schema-list";
import { undo, redo } from "prosemirror-history";
import type { Plugin } from "prosemirror-state";
import { editorSchema } from "./schema.js";
import { editorCommands } from "./commands.js";

/** Mod-b/i/u for the marks, Mod-z/Shift-Mod-z/Mod-y for history, Tab/Shift-Tab to sink/lift a list
 *  item - layered over `baseKeymap` (Enter/Backspace/arrow-key defaults). */
export function buildEditorKeymap(): Plugin {
  return keymap({
    // Spread first: every override below must win over baseKeymap's own binding for the same key.
    ...baseKeymap,
    "Mod-b": editorCommands.toggleBold,
    "Mod-i": editorCommands.toggleItalic,
    "Mod-u": editorCommands.toggleUnderline,
    "Mod-z": undo,
    "Shift-Mod-z": redo,
    "Mod-y": redo,
    // `splitListItem` only applies inside a list item and returns false otherwise - chained, not
    // replaced, so Enter still falls through to baseKeymap's own newlineInCode/splitBlock chain
    // everywhere else. A bare replacement would silently kill Enter outside of lists.
    Enter: chainCommands(splitListItem(editorSchema.nodes.list_item), baseKeymap.Enter),
    Tab: sinkListItem(editorSchema.nodes.list_item),
    "Shift-Tab": liftListItem(editorSchema.nodes.list_item),
  });
}
