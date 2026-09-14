/*
 * THE DRAG EDGE BETWEEN THE CODE AND WHAT IT RUNS.
 *
 * The kit publishes a splitter as a BEHAVIOUR, not a component (`core/splitter.ts`: the pure matcher,
 * `@skryensya/vanilla/splitter` the imperative binding, the declarative one living inside whichever
 * React component needs it). `patterns/splitter.css` says the same thing in its own header: compose
 * it onto whatever element already carries `role="separator"` and its own wiring. Sidebar's rail edge
 * and Treegrid's column resizer are the other two consumers; this is the third, and it is written
 * against the same exports rather than around them, so the four-pixel drag threshold, the
 * Shift-coarse step and the RTL flip are the system's answers here too.
 *
 * WHAT IT RESIZES: the element BEFORE it. A window splitter sits between two panes and moves the
 * boundary; the pane on its near side is the one whose size is written. Here that is Sandpack's own
 * code editor, which this file never names - it takes `previousElementSibling`, so the arrangement
 * is decided by the JSX that renders it and not by a class name belonging to another library.
 *
 * THE SIZE IS NOT REACT STATE. It is one custom property on the row, clamped by the stylesheet
 * (`pages/playground.astro`), which is what keeps a drag at pointer speed rather than at render
 * speed - the same trade `SidebarResizeHandle` documents, and for the same reason: nothing here owns
 * arithmetic the CSS can do.
 */
import {
  hasCrossedDragThreshold,
  resolveSplitterKey,
  splitterDirectionSign,
  splitterValuePercent,
} from "@skryensya/core/splitter";
import { definePreference, numberValue } from "@skryensya/core/storage";
import { useStoredPreference } from "@skryensya/react/storage";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/** The property a drag writes. The stylesheet clamps it; nothing here does. */
export const EDITOR_SIZE_PROPERTY = "--playground-editor-size";

/**
 * How wide the reader left the editor, remembered. Bounded at parse time the same way Sidebar's own
 * width is: the real clamp is the stylesheet's, and this only has to reject values that are not a
 * width at all. `null` means "never moved it", which is not the same as any number - it is what lets
 * a reset go back to the stylesheet's own split instead of storing a copy of it.
 */
const editorSizePreference = definePreference<number | null>({
  slot: "playground-editor-size",
  fallback: null,
  parse: (raw) => numberValue(0, 10000)(raw),
});

export type PaneSplitterProps = {
  /** The separator's accessible name: a bare strip between two panes describes nothing on its own. */
  readonly label: string;
};

export function PaneSplitter({ label }: PaneSplitterProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef({ min: 0, max: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startSize: number; dragging: boolean } | null>(
    null,
  );
  /* The even split the stylesheet starts from, replaced by a real reading once there is a layout to
   * measure. Rendered rather than patched, so React owns the attribute it printed. */
  const [percent, setPercent] = useState(50);
  const [storedSize, setStoredSize, clearStoredSize] = useStoredPreference(editorSizePreference);

  /** The row both panes are in: the property is written here, so both of them inherit it. */
  const row = useCallback(() => stripRef.current?.parentElement ?? null, []);
  /** The pane this splitter moves. See the file header for why it is addressed by position. */
  const pane = useCallback(
    () => (stripRef.current?.previousElementSibling as HTMLElement | null) ?? null,
    [],
  );
  const settled = useCallback(() => pane()?.getBoundingClientRect().width ?? 0, [pane]);

  const describe = useCallback(() => {
    const { min, max } = boundsRef.current;
    // A degenerate range means there is no layout to speak of; inventing a position would be worse
    // than leaving the one the markup already carries.
    if (!(max > min)) return;
    setPercent(splitterValuePercent(settled(), min, max));
  }, [settled]);

  /*
   * The travel available to a drag, measured rather than parsed: the bounds are `clamp()` arguments
   * in a stylesheet and may be written in any unit, so the pane is pushed past each end and asked
   * where it landed. Same technique as both other consumers, for the same reason.
   */
  const measure = useCallback(() => {
    const target = row();
    const measured = pane();
    if (!target || !measured) return { min: 0, max: 0 };

    const previous = target.style.getPropertyValue(EDITOR_SIZE_PROPERTY);
    target.style.setProperty(EDITOR_SIZE_PROPERTY, "0px");
    const min = measured.getBoundingClientRect().width;
    target.style.setProperty(EDITOR_SIZE_PROPERTY, "100000px");
    const max = measured.getBoundingClientRect().width;

    if (previous) target.style.setProperty(EDITOR_SIZE_PROPERTY, previous);
    else target.style.removeProperty(EDITOR_SIZE_PROPERTY);
    return { min, max };
  }, [pane, row]);

  const apply = useCallback(
    (size: number | null) => {
      const target = row();
      if (!target) return;
      if (size === null) target.style.removeProperty(EDITOR_SIZE_PROPERTY);
      else target.style.setProperty(EDITOR_SIZE_PROPERTY, `${Math.round(size)}px`);
      describe();
    },
    [describe, row],
  );

  /** The end of an adjustment: what the stylesheet granted is what gets remembered. */
  const commit = useCallback(() => setStoredSize(settled()), [setStoredSize, settled]);

  /* Restore and take the first measurement. An effect and not render: both need a laid-out element.
     Mount only - re-running on every stored write would fight the drag that caused the write. */
  useEffect(() => {
    boundsRef.current = measure();
    if (storedSize !== null) apply(storedSize);
    else describe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const towardWider = useCallback(
    () =>
      splitterDirectionSign(
        stripRef.current && getComputedStyle(stripRef.current).direction === "rtl" ? "rtl" : "ltr",
      ),
    [],
  );

  /** One adjustment, with the bounds re-measured: the panes can be resized by the window too. */
  const adjust = useCallback(
    (next: (from: number) => number | null) => {
      boundsRef.current = measure();
      apply(next(settled()));
    },
    [apply, measure, settled],
  );

  /* Back to the stylesheet's even split. It FORGETS rather than storing that default, or the next
     reset would have nothing to go back to. */
  const reset = useCallback(() => {
    adjust(() => null);
    clearStoredSize();
  }, [adjust, clearStoredSize]);

  return (
    /*
     * The strip is the handle's CONTAINING BLOCK, which is the one thing `patterns/splitter.css`
     * asks of a consumer: it positions itself absolutely inside whatever box it is given (Sidebar
     * gives it the panel edge, Treegrid a header cell). Here that box is a flex item between the two
     * panes, as wide as the pattern's own hit region.
     */
    <div className="playground__splitter" ref={stripRef}>
      <div
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percent}
        className="sk-splitter"
        onDoubleClick={reset}
        onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
          const action = resolveSplitterKey(event);

          switch (action.kind) {
            case "delta":
              adjust((from) => from + action.delta * towardWider());
              break;
            // The ends of the travel: overshoot and let `clamp()` land it, so nothing here has to
            // know where the ends are.
            case "home":
              adjust(() => 0);
              break;
            case "end":
              adjust(() => 100000);
              break;
            case "reset":
              event.preventDefault();
              reset();
              return;
            case "none":
              return;
          }

          event.preventDefault();
          commit();
        }}
        onLostPointerCapture={(event: ReactPointerEvent<HTMLDivElement>) => {
          const drag = dragRef.current;
          if (!drag) return;
          dragRef.current = null;
          event.currentTarget.removeAttribute("data-dragging");
          // A press that never became a drag ends here: nothing moved, so there is nothing to
          // remember.
          if (drag.dragging) commit();
        }}
        onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
          if (event.button !== 0) return;
          // The press must not start a text selection while we wait to see what it is, and the
          // capture has to be taken from the press rather than from the arming: without it the
          // pointer stops reporting here the moment it crosses into the preview's iframe, which is
          // exactly where this drag is going.
          event.preventDefault();
          dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startSize: 0, dragging: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;

          if (!drag.dragging) {
            if (!hasCrossedDragThreshold(drag.startX, event.clientX)) return;
            // The gesture is a drag. Measure from HERE, so the pane does not jump by the slop.
            boundsRef.current = measure();
            drag.dragging = true;
            drag.startX = event.clientX;
            drag.startSize = settled();
            event.currentTarget.setAttribute("data-dragging", "");
          }

          apply(drag.startSize + (event.clientX - drag.startX) * towardWider());
        }}
        onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        role="separator"
        tabIndex={0}
      />
    </div>
  );
}
