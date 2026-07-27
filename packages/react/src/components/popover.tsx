import { popoverParts, type PopoverPlacement } from "@skryensya/core/popover";
import { useId, type HTMLAttributes, type ReactNode } from "react";
import { anchoredParts } from "@skryensya/core/anchored";
import { anchored } from "./anchored.js";

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export type PopoverProps = Omit<HTMLAttributes<HTMLDivElement>, "content" | "title"> & {
  trigger: ReactNode;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Draw a small arrow pointing at the trigger. Off by default; decorative, never announced. */
  arrow?: boolean;
  placement?: PopoverPlacement;
  triggerLabel?: string;
  closeLabel?: string;
  contentClassName?: string;
};

/** Native Popover API: the browser owns light-dismiss, Escape and top-layer behaviour. */
export function Popover({
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
  const anchor = anchored(contentId);

  return (
    <div {...props} className={cx(popoverParts.root, className)}>
      <button
        aria-label={triggerLabel}
        {...anchor.anchor(cx("sk-button", "sk-interactive", popoverParts.trigger))}
        popoverTarget={contentId}
        type="button"
      >
        {trigger}
      </button>
      <div
        {...anchor.positioner({}, cx(popoverParts.positioner, popoverParts.content, contentClassName))}
        data-sk-placement={placement}
        id={contentId}
        popover="auto"
      >
        {arrow ? <span aria-hidden="true" className={anchoredParts.arrow} /> : null}
        {title ? <h2 className={popoverParts.title}>{title}</h2> : null}
        {description ? <p className={popoverParts.description}>{description}</p> : null}
        {children}
        <button
          className={cx("sk-button", "sk-interactive", popoverParts.close)}
          popoverTarget={contentId}
          popoverTargetAction="hide"
          type="button"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
