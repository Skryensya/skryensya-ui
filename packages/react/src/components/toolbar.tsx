import { resolveToolbarKey, toolbarContract, toolbarParts } from "@skryensya/core/toolbar";
import type { OptionValue } from "@skryensya/core/contract";
import { useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

const controlsSelector = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])";

/*
 * A toolbar item can itself be a composite widget (Segmented's radiogroup, Tabs' tablist): it
 * already owns a roving tabindex, so only ONE of its members has tabindex="0" and the rest are
 * "-1". Filtering those out is what makes the composite a single stop for the toolbar's own
 * roving focus, instead of the toolbar visiting every one of its internal options too — decision
 * 27, and the vanilla enhancer's own `isStop`/`controlsSelector` this mirrors exactly, so the two
 * bindings can never disagree about what counts as one stop.
 */
function isStop(element: HTMLElement): boolean {
  return element.getAttribute("tabindex") !== "-1";
}

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
  loopFocus = true,
  orientation = "horizontal",
  ...rest
}: ToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // A composite child (Segmented, Tabs) that already moved focus itself calls
    // preventDefault() before this listener sees the bubbled event; skip so its own arrow-key
    // handling isn't re-applied a second time by the ancestor toolbar.
    if (event.defaultPrevented) return;
    const controls = Array.from(
      ref.current?.querySelectorAll<HTMLElement>(controlsSelector) ?? [],
    ).filter(isStop);
    const active = controls.indexOf(document.activeElement as HTMLElement);
    const action = resolveToolbarKey({
      key: event.key,
      currentIndex: active,
      itemCount: controls.length,
      orientation,
      loopFocus,
    });
    if (action.kind === "none") return;
    event.preventDefault();
    controls[action.index]?.focus();
  };
  return (
    <div
      {...rest}
      aria-label={label}
      aria-orientation={orientation}
      className={cx(toolbarParts.root, className)}
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
