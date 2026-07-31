import { toolbarContract, toolbarParts } from "@skryensya/core/toolbar";
import type { OptionValue } from "@skryensya/core/contract";
import { useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ToolbarProps = {
  label: string;
  children: ReactNode;
  // Derived: Core owns the axis, and a copy here would go stale the day a third one appears.
  orientation?: OptionValue<typeof toolbarContract.options.orientation>;
  loopFocus?: boolean;
};

export function Toolbar({
  children,
  label,
  loopFocus = true,
  orientation = "horizontal",
}: ToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const previous = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    if (![previous, next, "Home", "End"].includes(event.key)) return;
    const controls = Array.from(
      ref.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])",
      ) ?? [],
    );
    if (!controls.length) return;
    const active = controls.indexOf(document.activeElement as HTMLElement);
    let target =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? controls.length - 1
          : active + (event.key === next ? 1 : -1);
    if (loopFocus) target = (target + controls.length) % controls.length;
    else target = Math.max(0, Math.min(target, controls.length - 1));
    event.preventDefault();
    controls[target]?.focus();
  };
  return (
    <div
      aria-label={label}
      aria-orientation={orientation}
      className={toolbarParts.root}
      data-orientation={orientation}
      onKeyDown={onKeyDown}
      ref={ref}
      role="toolbar"
    >
      {children}
    </div>
  );
}

export function ToolbarGroup({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div {...props} className={cx(toolbarParts.group, className)} role="group">
      {children}
    </div>
  );
}
export function ToolbarSeparator() {
  return <span aria-hidden="true" className={toolbarParts.separator} />;
}
