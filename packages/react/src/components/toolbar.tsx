import { resolveToolbarKey, toolbarContract, toolbarParts } from "@skryensya/core/toolbar";
import { applyToolbarTabStop, toolbarStopOf, toolbarStops } from "@skryensya/core/toolbar-dom";
import type { OptionValue } from "@skryensya/core/contract";
import { useEffect, useRef, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { loopFocus: loopFocusOption, orientation: orientationOption } = toolbarContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * One tab stop, arrow keys between controls. What counts as a stop (a nested composite such as
 * Segmented or Tabs is ONE) is `toolbarStops` in core, the same function the Vanilla enhancer
 * calls, so the two bindings cannot disagree about it.
 */
export type ToolbarProps = Omit<HTMLAttributes<HTMLDivElement>, "role"> & {
  label: string;
  children: ReactNode;
  // Derived: Core owns the axis, and a copy here would go stale the day a third one appears.
  orientation?: OptionValue<typeof toolbarContract.options.orientation>;
  loopFocus?: boolean;
};

export function Toolbar({
  children,
  className,
  label,
  loopFocus = loopFocusOption.default,
  orientation = orientationOption.default,
  ...rest
}: ToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  /* The stop Tab lands on, kept across renders so new children do not steal it back to the first. */
  const activeStop = useRef<HTMLElement | undefined>(undefined);

  // Every render: children may have changed which controls exist.
  useEffect(() => {
    if (!ref.current) return;
    applyToolbarTabStop(toolbarStops(ref.current), activeStop.current);
  });

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    rest.onFocus?.(event);
    if (!ref.current) return;
    const stops = toolbarStops(ref.current);
    const stop = toolbarStopOf(stops, event.target);
    if (!stop) return;
    activeStop.current = stop;
    applyToolbarTabStop(stops, stop);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(event);
    // A composite child (Segmented, Tabs) that already moved focus itself calls
    // preventDefault() before this listener sees the bubbled event; skip so its own arrow-key
    // handling isn't re-applied a second time by the ancestor toolbar.
    if (event.defaultPrevented || !ref.current) return;
    const stops = toolbarStops(ref.current);
    const current = stops.indexOf(toolbarStopOf(stops, document.activeElement) as HTMLElement);
    const action = resolveToolbarKey({
      key: event.key,
      currentIndex: current,
      itemCount: stops.length,
      orientation,
      loopFocus,
    });
    if (action.kind === "none") return;
    event.preventDefault();
    const next = stops[action.index];
    if (!next) return;
    activeStop.current = next;
    applyToolbarTabStop(stops, next);
    next.focus();
  };
  return (
    <div
      {...rest}
      aria-label={label}
      aria-orientation={orientation}
      className={cx(toolbarParts.root, className)}
      data-orientation={orientation}
      data-sk-toolbar=""
      onFocus={onFocus}
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
  label,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; /** The group's accessible name. */ label?: string }) {
  return (
    <div {...props} aria-label={label ?? props["aria-label"]} className={cx(toolbarParts.group, className)} role="group">
      {children}
    </div>
  );
}
export function ToolbarSeparator() {
  return <span aria-hidden="true" className={toolbarParts.separator} />;
}
