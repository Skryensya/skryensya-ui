import {
  tooltipDefaultPlacement,
  tooltipParts,
  tooltipPlacementToZag,
  type TooltipOptions,
} from "@skryensya/core/tooltip";
import { tooltip } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, type ReactNode, type RefObject } from "react";
import { anchoredParts } from "@skryensya/core/anchored";
import { useAnchored } from "./anchored.js";

export type TooltipProps = TooltipOptions & {
  /**
   * The control the tooltip describes. It must carry its own accessible name: the tooltip is wired
   * as `aria-describedby`, never as the label. See the contract in `@skryensya/core/tooltip`.
   */
  children: ReactNode;
  /** The description itself. Short: it is a hint, not a panel. */
  content: ReactNode;
  /** Draw a small arrow pointing at the trigger. Off by default; decorative, never announced. */
  arrow?: boolean;
  /**
   * Where the floating content is portalled. Defaults to `document.body`, which is right whenever
   * an ancestor might clip it. Pass a ref to keep the content inside a subtree instead — a preview
   * frame, a scoped test harness, or a dialog that owns its own stacking context.
   */
  container?: RefObject<HTMLElement>;
};

export function Tooltip({
  container,
  id,
  arrow = false,
  children,
  content,
  openDelay,
  closeDelay,
  // On by default: it is what satisfies WCAG 1.4.13 "hoverable" (see @skryensya/core/tooltip).
  interactive = true,
  placement,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  const generatedId = useId();
  /*
   * The default is RESOLVED rather than left absent. The box copes without it, the arrow does not:
   * it is an anchored box of its own and the pattern's default side is block-end, while a tooltip's
   * is block-start, so a tooltip with no placement used to come out with the box above and the arrow
   * below. Resolving it here makes the box, the arrow and the machine name the same side.
   */
  const side = placement ?? tooltipDefaultPlacement;
  const service = useMachine(tooltip.machine, {
    id: id ?? generatedId,
    openDelay,
    closeDelay,
    interactive,
    // Only matters on the JS fallback: with anchors, position-area already placed it.
    positioning: { placement: tooltipPlacementToZag[side] },
    disabled,
    open,
    defaultOpen,
    onOpenChange,
  });
  const api = tooltip.connect(service, normalizeProps);

  const anchor = useAnchored(id ?? generatedId);
  const triggerProps = api.getTriggerProps();
  const contentProps = api.getContentProps();
  /*
   * On the browser path the arrow gets nothing: the sheet places it against the same anchor and reads
   * its open state off the content. On the fallback the machine places it, so it gets the machine's
   * props — they mark it `[data-part=arrow]`, which is how `@zag-js/popper` finds it to move it — plus
   * `data-side`, the side the machine RESOLVED, which is what the sheet reads to rotate it. That side
   * is only trustworthy here: on the other path the browser decides where the box landed and the
   * machine's opinion may differ.
   */
  const arrowNode = arrow ? (
    <span
      aria-hidden="true"
      className={anchoredParts.arrow}
      {...(anchor.on
        ? undefined
        : {
            ...api.getArrowProps(),
            "data-side": (contentProps as Record<string, unknown>)["data-side"] as
              | string
              | undefined,
          })}
    />
  ) : null;

  return (
    <>
      {/*
       * `getTriggerProps` returns button props, so the trigger is a real span-wrapper around whatever
       * the consumer passed rather than a nested <button>: wrapping their control in our own button
       * would put two controls in the tab order for one action.
       */}
      <span {...triggerProps} {...anchor.anchor(tooltipParts.trigger, triggerProps.style)}>
        {children}
      </span>
      {api.open ? (
        <Portal container={container}>
          <div
            {...anchor.positioner(api.getPositionerProps(), tooltipParts.positioner)}
            data-sk-placement={side}
          >
            {arrowNode}
            <div
              {...contentProps}
              className={tooltipParts.content}
              data-interactive={interactive ? undefined : "false"}
            >
              {content}
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
}
