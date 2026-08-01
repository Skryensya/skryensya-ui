import { popoverParts, type PopoverPlacement } from "@skryensya/core/popover";
import { useId, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { anchoredParts } from "@skryensya/core/anchored";


const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export type PopoverProps = Omit<HTMLAttributes<HTMLDivElement>, "content" | "title"> & {
  trigger: ReactNode;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Draw a small arrow pointing at the trigger. Off by default; decorative, never announced. */
  arrow?: boolean;
  /**
   * The bare surface: an anchor and a panel, with no title, no description and no close control.
   * It is the same component with less anatomy — `Popover.bare` in the contract — rather than a
   * second component, because duplicating the parts would leave a reader choosing between two names
   * for one thing. Escape and light-dismiss still work: they are the platform's, not the chrome's.
   */
  bare?: boolean;
  placement?: PopoverPlacement;
  triggerLabel?: string;
  closeLabel?: string;
  contentClassName?: string;
  /**
   * Where the floating content is portalled. Defaults to `document.body`, which is right whenever
   * an ancestor might clip it. Pass a ref to keep the content inside a subtree instead — a preview
   * frame, a scoped test harness, or a dialog that owns its own stacking context.
   */
  container?: RefObject<HTMLElement>;
};

/** Native Popover API: the browser owns light-dismiss, Escape and top-layer behaviour. */
export function Popover({
  bare = false,
  container,
  children,
  className,
  closeLabel = "Cerrar",
  contentClassName,
  description,
  id,
  arrow = false,
  placement = "block-end",
  trigger,
  triggerLabel,
  title,
  ...props
}: PopoverProps) {
  const generatedId = useId();
  const contentId = id ?? `${generatedId}-popover`;

  return (
    <div {...props} className={cx(popoverParts.root, className)}>
      <button
        aria-label={triggerLabel}
        className={cx("sk-button", "sk-interactive", popoverParts.trigger, anchoredParts.anchor)}
        popoverTarget={contentId}
        type="button"
      >
        {trigger}
      </button>
      <div
        className={cx(popoverParts.positioner, popoverParts.content, anchoredParts.positioner, contentClassName)}
        data-sk-placement={placement}
        id={contentId}
        popover="auto"
      >
        {arrow ? <span aria-hidden="true" className={anchoredParts.arrow} /> : null}
        {title && !bare ? <h2 className={popoverParts.title}>{title}</h2> : null}
        {description && !bare ? <p className={popoverParts.description}>{description}</p> : null}
        {children}
        {bare ? null : (
        <button
          className={cx("sk-button", "sk-interactive", popoverParts.close)}
          popoverTarget={contentId}
          popoverTargetAction="hide"
          type="button"
        >
          {closeLabel}
        </button>
        )}
      </div>
    </div>
  );
}
