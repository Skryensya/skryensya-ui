<script lang="ts">
  import {
    anchoredParts,
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { tooltip } from "@skryensya/core/machines";
  import {
    tooltipDefaultPlacement,
    tooltipPlacementToZag,
    tooltipPlacements,
    type TooltipPlacement,
  } from "@skryensya/core/tooltip";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TOOLTIP, a machine-backed enhancer over `@zag-js/tooltip` (the SAME machine React uses, via
   * @skryensya/core/machines). It renders no structure: it scans the authored markup
   * (`[data-sk-anchor-trigger]` / `[data-sk-anchor-positioner]` / `[data-sk-anchor-content]`) and
   * patches onto those nodes the attributes `connect` returns.
   */
  const root = getRoot();

  const trigger = root.querySelector<HTMLElement>("[data-sk-anchor-trigger]");
  const positioner = root.querySelector<HTMLElement>("[data-sk-anchor-positioner]");
  const content = root.querySelector<HTMLElement>("[data-sk-anchor-content]");
  /*
   * The arrow is OPTIONAL: without this node there is no arrow, and that is the default. It is looked up
   * by the pattern's class and not by a `data-sk-*` of its own because there is nothing this enhancer
   * has to tell it on the browser path: the stylesheet places it. It only needs to be found for the fallback.
   */
  const arrow = positioner?.querySelector<HTMLElement>(`.${anchoredParts.arrow}`) ?? null;

  if (!root.id) root.id = uniqueId("sk-tooltip");

  const numberAttr = (name: string): number | undefined => {
    const raw = root.getAttribute(name);
    if (raw === null) return undefined;
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) ? value : undefined;
  };

  // `interactive` is WCAG 1.4.13's "hoverable": it keeps the tooltip open while the pointer travels
  // toward it. Off by default (see core/tooltip.ts); turned on through markup, and the CSS reads the
  // same attribute to give `pointer-events` back to the content.
  // On by default: it is what satisfies WCAG 1.4.13 "hoverable" (see core/tooltip.ts). The opt-out is
  // explicit and is stepping outside the criterion knowingly.
  const interactive = root.getAttribute("data-interactive") !== "false";

  /*
   * The placement is authored on the root and copied to the positioner, which is where the stylesheet
   * reads it (in React the positioner is portaled, so it cannot depend on inheritance). A value outside
   * the set of four is ignored.
   *
   * THE DEFAULT IS RESOLVED instead of leaving the attribute out. The box manages without it, the arrow
   * does not: its rules go through `[data-sk-placement]` and the pattern's default is block-end, while a
   * tooltip's is block-start, so a tooltip with no authored placement ended up with the box above and
   * the arrow below. Writing the resolved side makes both of them, and the machine, say the same thing.
   */
  const authoredPlacement = root.getAttribute("data-sk-placement");
  const placement = tooltipPlacements.includes(authoredPlacement as TooltipPlacement)
    ? (authoredPlacement as TooltipPlacement)
    : tooltipDefaultPlacement;
  positioner?.setAttribute("data-sk-placement", placement);

  const service = useMachine(tooltip.machine, () => ({
    id: root.id,
    ids: { trigger: trigger?.id || undefined, content: content?.id || undefined },
    openDelay: numberAttr("data-open-delay"),
    closeDelay: numberAttr("data-close-delay"),
    interactive,
    // Only matters on the JS fallback: with anchors, `position-area` already placed it and Zag does not position.
    positioning: { placement: tooltipPlacementToZag[placement] },
    disabled: root.hasAttribute("data-disabled"),
    onOpenChange(details: { open: boolean }) {
      root.dispatchEvent(
        new CustomEvent("sk-open-change", { bubbles: true, detail: { open: details.open } }),
      );
    },
  }));

  const api = $derived(tooltip.connect(service, normalizeProps));

  /*
   * The anchor positioning path, which now belongs to the Anchoring pattern (ADR-25). When the browser
   * has the API, the one that places is the BROWSER: we wire a unique name between the trigger and the
   * positioner, and we do NOT pass the positioner the inline `style` Zag brings, because that would be
   * two positioning engines fighting. Without the API, Zag's `style` passes through untouched and it positions.
   *
   * The name goes on BOTH elements and is not inherited from the root: in React the positioner is
   * portaled to the body, and this enhancer uses the same helper so both layers behave the same.
   */
  const anchored = supportsAnchorPositioning();
  let unbindAnchor: (() => void) | undefined;

  if (anchored && trigger) {
    unbindAnchor = bindAnchor(trigger, positioner, anchorNameFor(root.id));
  }

  const positionerProps = (props: DomProps): DomProps =>
    anchored ? (stripPositioningStyle(props) as DomProps) : props;

  $effect(() => {
    const contentProps = api.getContentProps() as DomProps;

    if (trigger) applyZagProps(trigger, api.getTriggerProps() as DomProps);
    if (positioner) applyZagProps(positioner, positionerProps(api.getPositionerProps() as DomProps));
    /*
     * ON THE BROWSER PATH NOTHING IS WRITTEN TO THE ARROW: the stylesheet places it against the same
     * anchor, and it reads its open state from the content with `:has()`.
     *
     * On the fallback it is, because there the machine places it: `getArrowProps` marks it as
     * `[data-part=arrow]`, which is how `@zag-js/popper` finds it to move it, and `data-side` (the side
     * the machine RESOLVED) is what the stylesheet reads to rotate it. That side is firm data only
     * here: on the other path the one who decides where the box ended up is the browser, and the
     * machine's opinion may not match. It is read from the props and not from the DOM so it does not
     * depend on the order in which the nodes are patched.
     */
    if (arrow && !anchored) {
      applyZagProps(arrow, api.getArrowProps() as DomProps);
      const side = contentProps["data-side"];
      if (typeof side === "string") arrow.setAttribute("data-side", side);
    }
    if (content) {
      applyZagProps(content, contentProps);
      // The CSS needs to know whether the content is reachable by the pointer; the state lives in the
      // machine, so it is mirrored as an attribute instead of duplicating the condition in the sheet. Only
      // the opt-out is written: reachable is the sheet's default.
      if (interactive) content.removeAttribute("data-interactive");
      else content.setAttribute("data-interactive", "false");
    }
  });

  // Zag's handlers are wired once and re-read on every firing: the machine changes state and with it
  // the closure.
  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (trigger) {
      cleanups.push(
        bindZagEvents(trigger, () => api.getTriggerProps() as DomProps),
      );
    }
    if (content) {
      cleanups.push(
        bindZagEvents(content, () => api.getContentProps() as DomProps),
      );
    }
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
  });
</script>
