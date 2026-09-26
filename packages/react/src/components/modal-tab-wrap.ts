import { trapModalDialogs } from "@skryensya/core/focus-trap";
import { useEffect } from "react";

/*
 * The modal Tab wrap, held for as long as a component that renders a modal `<dialog>` is mounted.
 *
 * The wrap itself is `@skryensya/core/focus-trap`'s and document-wide, so this passes no ref and
 * reads no open state: `trapModalDialogs` counts its holders and only wraps inside a dialog that is
 * `:modal` at the moment Tab is pressed. Vanilla installs the same trap from its `dialog` enhancer.
 */
export function useModalTabWrap(): void {
  useEffect(() => trapModalDialogs(document), []);
}
