import {
  popoverParts as popupParts,
  type PopoverPlacement as PopupPlacement,
} from "@skryensya/core/popover";
import { useId, type HTMLAttributes, type ReactNode } from "react";
import { anchoredParts } from "@skryensya/core/anchored";
import { anchored } from "./anchored.js";

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");
export type PopupProps = Omit<HTMLAttributes<HTMLDivElement>, "content"> & {
  trigger: ReactNode;
  children: ReactNode;
  /** Draw a small arrow pointing at the trigger. Off by default; decorative, never announced. */
  arrow?: boolean;
  placement?: PopupPlacement;
  triggerLabel?: string;
  contentClassName?: string;
};

/** Low-level native Popover API surface without opinionated title or actions. */
export function Popup({
  children,
  className,
  contentClassName,
  id,
  arrow = false,
  placement = "block-end",
  trigger,
  triggerLabel,
  ...props
}: PopupProps) {
  const generatedId = useId();
  const contentId = id ?? `${generatedId}-popup`;
  const anchor = anchored(contentId);

  return (
    <div {...props} className={cx(popupParts.root, className)}>
      <button
        aria-label={triggerLabel}
        {...anchor.anchor(cx("sk-button", "sk-interactive", popupParts.trigger))}
        popoverTarget={contentId}
        type="button"
      >
        {trigger}
      </button>
      <div
        {...anchor.positioner(
          {},
          cx(popupParts.positioner, popupParts.content, contentClassName),
        )}
        data-sk-placement={placement}
        id={contentId}
        popover="auto"
      >
        {arrow ? <span aria-hidden="true" className={anchoredParts.arrow} /> : null}
        {children}
      </div>
    </div>
  );
}
