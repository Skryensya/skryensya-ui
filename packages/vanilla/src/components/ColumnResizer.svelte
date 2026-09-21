<script lang="ts">
  import { splitter } from "@skryensya/core/machines";
  import { resolveColumnResize, resolveSplitterKey, splitterDirectionSign } from "@skryensya/core/splitter";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, untrack } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply.js";

  /*
   * COLUMN RESIZER, ONE Zag `splitter` machine instance per column boundary, headless (no markup of
   * its own: `handle` already exists, created and appended by `splitter.svelte.ts`'s own
   * `attachColumnResizer` before this mounts). It exists only because `useMachine` needs a REAL
   * mounted Svelte component: its internal `onMount` checks Svelte's own component context, which
   * `$effect.root()` alone does not provide (confirmed against this file's own test suite, which
   * calls `attachColumnResizer` with no ambient component at all - `$effect.root` got past
   * `effect_orphan` only to hit `lifecycle_outside_component` right behind it). `attachColumnResizer`
   * mounts this with `mount()`/`unmount()` (the same primitive `svelte-hydrate.ts` uses for every
   * other enhancer) instead of scanning a `[data-sk-*]` root: there IS no authored root here, only
   * the handle this component itself was handed.
   */
  interface Props {
    handle: HTMLElement;
    rootId: string;
    index: number;
    getWidths: () => readonly number[];
    setWidths: (widths: readonly number[]) => void;
    /** `createColumnWidths`'s own reactive tick (`splitter.svelte.ts`'s own doc on `ColumnResizerOptions.tick`). */
    tick?: () => number;
    min: number;
    direction: () => "ltr" | "rtl";
    resetWidth?: () => number;
  }
  const { handle, rootId, index, getWidths, setWidths, tick, min, direction, resetWidth }: Props = $props();
  /*
   * Both are read once here, deliberately: this component is mounted exactly ONCE per handle
   * (`splitter.ts`'s own `attachColumnResizer`, never re-mounted with new props), so `handle`/`rootId`
   * never change for its whole lifetime. `untrack` says so explicitly, past Svelte's own
   * `state_referenced_locally` warning for reading a prop outside a closure.
   */
  const handleEl = untrack(() => handle);
  const rootIdValue = untrack(() => rootId);

  const ids = {
    root: rootIdValue,
    resizeTrigger: (id: string) => `${rootIdValue}:resize:${id}`,
    panel: (id: string | number) => `${rootIdValue}:panel:${id}`,
  };

  const totalWidth = () => getWidths().reduce((sum, width) => sum + width, 0);
  const toPercent = (width: number, total: number) => (total > 0 ? (width / total) * 100 : 0);
  const toWidths = (sizes: readonly number[]) => {
    const total = totalWidth();
    return sizes.map((size) => (size / 100) * total);
  };
  /*
   * `minSize` as a PERCENT of the CURRENT total, computed here, rather than a `px` string handed to
   * Zag's own rootEl-relative conversion. Two reasons:
   *  - Zag only re-normalizes `panels` (and re-measures the group) when its own dependency watcher
   *    sees the SERIALIZED `panels` prop change. A fixed `"60px"` string never changes text even
   *    when the real ratio it represents does (a proportional resize keeps every width's SHARE the
   *    same, so `size()`'s own percentages don't change either) - Zag would never notice the total
   *    moved at all, and `resizeByDelta` would keep dragging against a floor computed from whatever
   *    total happened to be current the ONE time it last measured. A percent string changes text
   *    exactly when the real floor-to-total ratio changes, so the same watcher catches it.
   *  - It sidesteps needing `rootEl` measurable at all for this to be correct, consistent with how
   *    `size()` already avoids it below.
   */
  const panels = () =>
    getWidths().map((_, panelIndex) => ({
      id: `c${panelIndex}`,
      minSize: `${toPercent(min, totalWidth())}%`,
    }));
  const size = () => {
    const total = totalWidth();
    return getWidths().map((width) => `${toPercent(width, total)}%`);
  };

  /*
   * A SECOND, local tick, alongside the caller's own `tick` prop: that one only catches width
   * changes made THROUGH `setWidths` (drag/keyboard/reset, `watchColumnLayout`'s re-seed). A width
   * set some other way entirely - nothing does, in production, but `col.style.width` is still a
   * PUBLIC DOM property, and this file's own test suite widens columns exactly that way to stand in
   * for a real browser's synchronous initial layout, jsdom having none - would otherwise stay
   * invisible until the NEXT `setWidths`, same gap `VanillaMachine`'s own doc already accepted for
   * a drag starting immediately after a keyboard move. Bumped in the CAPTURE phase on `pointerdown`/
   * `focusin`, ahead of Zag's own (bubble-phase) listener, so whatever the DOM says RIGHT NOW is
   * what this interaction's `panels`/`size` baseline reflects - narrower than a full poll on every
   * render, but it is every actual moment Zag itself reads them to start something.
   */
  let localTick = $state(0);
  const bumpLocalTick = () => {
    localTick += 1;
  };
  handleEl.addEventListener("pointerdown", bumpLocalTick, { capture: true });
  handleEl.addEventListener("focusin", bumpLocalTick, { capture: true });
  onDestroy(() => {
    handleEl.removeEventListener("pointerdown", bumpLocalTick, { capture: true });
    handleEl.removeEventListener("focusin", bumpLocalTick, { capture: true });
  });

  const service = useMachine(splitter.machine, () => {
    // Read, never used: the ONLY reason these two lines exist is to give Svelte's `$derived` (what
    // `useMachine` wraps this whole object in) a genuine reactive dependency to invalidate on.
    // `panels()`/`size()` below call `getWidths()`, a PLAIN function; a `$derived` has no way to know
    // its return value changed just because the plain function it calls now would answer differently
    // - only a read of an actual `$state` (bumped on every `setWidths` call, or on the capture-phase
    // listener just above) does that.
    tick?.();
    void localTick;
    return {
      id: `${rootId}-${index}`,
      ids,
      dir: direction(),
      orientation: "horizontal" as const,
      panels: panels(),
      size: size(),
      onResize(details) {
        setWidths(toWidths(details.size));
      },
    };
  });

  const api = $derived(splitter.connect(service, normalizeProps));
  /*
   * Zag's own pointer-drag arithmetic has no `dir` awareness at all (unlike its keyboard handler,
   * which flips ArrowLeft/Right via `getEventKey`): a rightward physical drag always GROWS the
   * trigger id's first (before) panel, whatever `dir` says. Swapping which panel id comes first in
   * RTL is the only lever this binding has to make a rightward drag SHRINK column `index` there too
   * (`splitterDirectionSign`'s own reasoning, just applied to Zag's pivot order instead of a raw
   * delta sign). `resolveResizeTriggerId` accepts either order verbatim once both ids are present.
   */
  const triggerId = (): `${string}:${string}` =>
    direction() === "rtl" ? `c${index + 1}:c${index}` : `c${index}:c${index + 1}`;
  const triggerProps = (): DomProps => api.getResizeTriggerProps({ id: triggerId() }) as unknown as DomProps;
  /*
   * Zag's own `onKeyDown` moves in fixed PERCENTAGE points (a hardcoded 10 on Shift, regardless of
   * `keyboardResizeBy`) and only resets a `collapsible` panel on Enter - neither matches the
   * WAI-ARIA Window Splitter contract this binding already promises and the ARIA APG audit records
   * (`resolveSplitterKey`'s own step/coarseStep in PX, Enter resets to `resetWidth`). Keyboard stays
   * hand-wired below; Zag still owns the pointer drag and the focus/hover state attributes.
   */
  const bindableProps = (): DomProps => {
    const { onKeyDown: _zagKeyDown, ...rest } = triggerProps();
    return rest;
  };
  const sync = () => {
    applyZagProps(handle, bindableProps());
    // Zag mirrors its own panel-flow `orientation` straight onto the attribute; APG wants the
    // SEPARATOR's own axis, the opposite one for a row of side-by-side columns.
    handle.setAttribute("aria-orientation", "vertical");
    /*
     * The ARIA value triple, computed against THIS pair's own total rather than read back off
     * Zag's internal context. Two reasons neither is cosmetic:
     *  - Zag's `panels` for this machine is the WHOLE column set (needed for its own pointer-drag
     *    math), so its own `getAriaValue` reports bounds that account for every OTHER column's
     *    floor too - richer than what this binding actually allows. `resolveColumnResize` only
     *    ever conserves the touched PAIR's own total, so a third column's floor is never actually
     *    in play here; reporting it anyway would tell a screen reader a bound this drag can't honor.
     *  - Zag's internal context only re-measures on its own `syncSize` (gated on a real
     *    `ResizeObserver` firing), so a width change made outside this binding's own drag/keyboard
     *    paths - a container that legitimately resizes - would leave it stale until that observer
     *    catches up. Reading `getWidths()` fresh here can't go stale, by construction.
     */
    const widths = getWidths();
    const before = widths[index] ?? 0;
    const after = widths[index + 1] ?? 0;
    const pairTotal = before + after;
    handle.setAttribute("aria-valuemin", String(pairTotal > 0 ? Math.round((min / pairTotal) * 100) : 0));
    handle.setAttribute("aria-valuemax", String(pairTotal > 0 ? Math.round(((pairTotal - min) / pairTotal) * 100) : 100));
    handle.setAttribute("aria-valuenow", String(pairTotal > 0 ? Math.round((before / pairTotal) * 100) : 0));
  };
  // The `@zag-js/svelte` equivalent of `VanillaMachine#subscribe`: `service`'s own state/context are
  // Svelte-reactive, so an effect reading `api` (through `sync`) reruns on every machine-internal
  // transition (pointer drag, focus, hover) the same way `machine.subscribe(sync)` used to.
  $effect(() => {
    sync();
  });

  /*
   * `reset`/`onKeyDown` below write `getWidths()`/`setWidths()` directly and never touch Zag's own
   * `send`: `size` is a CONTROLLED prop here (always non-null), so `api.setSizes()` would only
   * re-invoke `onResize` with the value we just gave it - `setSize`'s own controlled branch never
   * calls `context.set("size", …)` itself in that mode. Zag's internal baseline for a drag's OWN
   * `initialSize` (`setDraggingState`) catches up the NEXT time its watch tracker notices `size()`'s
   * serialized value changed - any subsequent FOCUS/POINTER_DOWN on this same handle - so a drag
   * started immediately after a keyboard move, with no intervening blur, can begin from a
   * one-interaction-stale baseline. Self-corrects on the following interaction; not worth an
   * uncontrolled-mode rewrite (which would trade this for losing `onResize` entirely) for a gap this
   * narrow.
   */
  const reset = () => {
    const widths = getWidths();
    const before = widths[index] ?? 0;
    const after = widths[index + 1] ?? 0;
    const target = resetWidth ? resetWidth() : (before + after) / 2;
    const next = [...widths];
    const bounded = Math.min(Math.max(target, min), before + after - min);
    next[index] = bounded;
    next[index + 1] = before + after - bounded;
    setWidths(next);
    sync();
  };
  handleEl.addEventListener("dblclick", reset);

  const onKeyDown = (event: KeyboardEvent) => {
    const action = resolveSplitterKey(event);
    if (action.kind === "none") return;
    event.preventDefault();
    if (action.kind === "reset") {
      reset();
      return;
    }
    const delta =
      action.kind === "home" ? -Infinity : action.kind === "end" ? Infinity : action.delta * splitterDirectionSign(direction());
    const next = resolveColumnResize({ widths: getWidths(), index, delta, min });
    setWidths(next);
    sync();
  };
  handleEl.addEventListener("keydown", onKeyDown);

  const unbind = bindZagEvents(handleEl, bindableProps);

  onDestroy(() => {
    handleEl.removeEventListener("keydown", onKeyDown);
    handleEl.removeEventListener("dblclick", reset);
    unbind();
  });
</script>
