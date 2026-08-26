import { useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@skryensya/react/segmented";
import { buildFrameDocument } from "./frame/document";
import type { CaseRun } from "./data";

/*
 * The preview stage is an IFRAME, not a mount into this page — a hard requirement, not a nicety:
 * the kit's CSS and the case's rendered output must never share this app's own document. Two
 * confirmed reasons, not one:
 *
 *  1. Styling. `packages/core`'s tokens arm `light-dark()` via `color-scheme: light dark`
 *     (`_base.scss`), which follows the reviewer's OS. Loaded into THIS document, that bled into the
 *     app's own plain chrome (buttons, tables with no explicit color of their own picked up native
 *     dark-mode widget styling), while `app.css`'s hardcoded light backgrounds stayed put — "reads as
 *     dark mode on a light background", confirmed live. The two documents' CSS stay apart; what DOES
 *     cross the boundary is `color-scheme` itself and the devtools attributes, mirrored live by
 *     `frame/entry.tsx`'s own `syncRootState()` — that is state, not stylesheets, and mirroring it is
 *     exactly what makes the iframe track this app's own light/dark toggle instead of ignoring it.
 *  2. Top-layer collision. A native `<dialog open>` (or anything anchored) paints into the
 *     document's top layer regardless of where it sits in the DOM tree — confirmed live on
 *     `confirmation-dialog` when both bindings were mounted directly into this page at once. A
 *     SEPARATE DOCUMENT is what actually prevents that, not just showing one binding at a time (which
 *     was the fix before this one, and remains — see the toggle below).
 *
 * `srcDoc`, not a URL: each build embeds the exact tree/markup this ONE case produced
 * (`buildFrameDocument`), so there is nothing to route or serve — React just resets the iframe's
 * `srcdoc` attribute when the binding or the case changes, and the browser navigates it fresh. Theme
 * changes do NOT rebuild it any more — see `frame/document.ts`'s own header — so the `key` below
 * only needs to change for what genuinely is a different render.
 *
 * THE IFRAME TAKES ITS CONTAINER'S HEIGHT: `.preview-stage` owns it (`app.css`'s own `height` +
 * `min-height`, `resize: vertical` past that), the iframe is `height: 100%` of it, and the iframe's
 * OWN document scrolls internally — standard iframe behavior — when its content is taller than the
 * box it currently has. Dragging the resize handle has an immediate, visible effect on how much
 * render is showing.
 *
 * The STAGE's starting height still comes from the content, though — `useInitialFitHeight` below,
 * `postMessage` from `frame/entry.tsx` — just as a ONE-SHOT imperative write to `.preview-stage`'s own
 * inline height, not a value React keeps re-asserting on the iframe itself. That distinction is the
 * whole fix: the earlier version drove the IFRAME's height from React state continuously, which is
 * exactly what fought a reader's manual resize (the next render just overwrote whatever they'd just
 * dragged). Writing the stage's inline height once, imperatively, is indistinguishable from a reader
 * having dragged it there themselves — `resize: vertical`'s own native drag sets that same property
 * the same way, so ownership only ever passes ONE direction: content sizes it first, a reader's own
 * drag (if any) is what touches it after that, never both at once.
 */

function useNearViewport(rootRef: React.RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const [near, setNear] = useState(!enabled);

  useEffect(() => {
    if (!enabled || near) return;
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [enabled, near, rootRef]);

  return near;
}

/** See this file's own header. Sets `.preview-stage`'s height once per fresh render, then stops. */
function useInitialFitHeight(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  stageRef: React.RefObject<HTMLDivElement | null>,
  resetKey: string,
): void {
  useEffect(() => {
    if (stageRef.current) stageRef.current.style.height = "";

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as { source?: string; height?: number };
      if (data?.source !== "eval-viewer-frame" || typeof data.height !== "number") return;
      if (stageRef.current) stageRef.current.style.height = `${data.height}px`;
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // Re-arm per resetKey: a fresh srcDoc is a fresh contentWindow, so `event.source` above only
    // ever matches messages from the frame this specific mount actually owns.
  }, [iframeRef, stageRef, resetKey]);
}

export function Preview({ caseRun, lazy = false }: { caseRun: CaseRun; lazy?: boolean }) {
  const [binding, setBinding] = useState<"vanilla" | "react">("vanilla");
  const rootRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const shouldLoad = useNearViewport(rootRef, lazy);
  const resetKey = `${caseRun.caseId}.${caseRun.lang}.${binding}`;
  useInitialFitHeight(iframeRef, stageRef, resetKey);

  const srcDoc = useMemo(() => {
    if (!shouldLoad || !caseRun.valid || !caseRun.finalTree) return undefined;
    return buildFrameDocument({
      binding,
      vanillaHtml: caseRun.emitted?.vanilla,
      tree: caseRun.finalTree,
    });
  }, [binding, caseRun, shouldLoad]);

  if (!caseRun.valid || !caseRun.finalTree) {
    return (
      <p className="preview-empty">
        This case never reached a valid composition — nothing to render. See the tool trace below.
      </p>
    );
  }

  if (!srcDoc) {
    return (
      <div ref={rootRef} className="preview-stage preview-stage--queued">
        Preview queued — scroll a little closer.
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      {/*
       * Controlled mode: `value`+`onValueChange` (not `defaultValue`) — the contract's `value` option
       * only documents the UNCONTROLLED path (it maps to the vanilla binding's `defaultValue` prop,
       * confirmed via get_contract), but the React component source
       * (packages/react/src/components/segmented.tsx) exposes `value`/`onValueChange` as a superset for
       * exactly this kind of interactive-app use, where the choice has to drive real state outside the
       * component rather than just seed its own initial selection.
       */}
      <SegmentedControl
        label="Binding"
        value={binding}
        onValueChange={(next) => setBinding(next as "vanilla" | "react")}
        options={[
          { value: "vanilla", label: "vanilla" },
          { value: "react", label: "react" },
        ]}
      />
      <div ref={stageRef} className="preview-stage">
        <iframe
          key={resetKey}
          ref={iframeRef}
          className="preview-frame"
          srcDoc={srcDoc}
          title={`${caseRun.caseId} [${caseRun.lang}] — ${binding}`}
        />
      </div>
    </div>
  );
}
