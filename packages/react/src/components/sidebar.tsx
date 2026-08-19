import {
  SIDEBAR_WIDTH_PROPERTY,
  sidebarParts,
  sidebarWidthPercent,
  sidebarWidthPreference,
  type SidebarOptions,
  type SidebarResizeChangeDetails,
} from "@skryensya/core/sidebar";
import { hasCrossedDragThreshold, resolveSplitterKey, splitterDirectionSign } from "@skryensya/core/splitter";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useStoredPreference } from "./storage.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type SidebarContextValue = {
  collapsed: boolean;
  contentId: string;
  toggle: () => void;
  rootRef: RefObject<HTMLElement | null>;
  storageKey?: string;
  onResizeChange?: (details: SidebarResizeChangeDetails) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar(part: string): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) throw new Error(`${part} must be rendered inside a <Sidebar>.`);
  return context;
}

type SidebarStyle = CSSProperties & {
  "--sk-sidebar-min-inline-size"?: string;
  "--sk-sidebar-max-inline-size"?: string;
};

export type SidebarProps = Omit<HTMLAttributes<HTMLElement>, "children"> &
  SidebarOptions & {
    children: ReactNode;
  };

/*
 * The shell. What goes inside is the caller's, usually a `<NavList>`, which the sidebar hosts
 * rather than owns (decision 17).
 *
 * Collapsing narrows it; it never hides it, which is why this is not a collapsible disclosure
 * (decision 8). The content stays mounted and in the a11y tree at both widths, the labels go
 * visually quiet but keep naming the icons.
 */
export function Sidebar({
  children,
  className,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  landmarkLabel,
  maxInlineSize,
  minInlineSize,
  onCollapsedChange,
  onResizeChange,
  storageKey,
  style,
  id,
  ...props
}: SidebarProps) {
  const generatedId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
  const isControlled = collapsedProp !== undefined;
  const collapsed = isControlled ? collapsedProp : uncontrolled;
  const rootRef = useRef<HTMLElement | null>(null);

  /*
   * The two bounds land on the hooks the stylesheet's `clamp()` reads, which is the whole of what
   * they do: nothing here compares them, orders them or enforces them, because CSS already does all
   * three and doing it twice is how the two would start to disagree. Omitted, the property is not
   * written at all, so the stylesheet's own default stands rather than being overwritten with it.
   */
  const sidebarStyle: SidebarStyle | undefined =
    minInlineSize || maxInlineSize
      ? {
          ...style,
          ...(minInlineSize ? { "--sk-sidebar-min-inline-size": minInlineSize } : null),
          ...(maxInlineSize ? { "--sk-sidebar-max-inline-size": maxInlineSize } : null),
        }
      : style;

  const toggle = () => {
    const next = !collapsed;
    if (!isControlled) setUncontrolled(next);
    onCollapsedChange?.({ collapsed: next });
  };

  return (
    <SidebarContext.Provider
      value={{ collapsed, contentId: `${id ?? generatedId}-content`, toggle, rootRef, storageKey, onResizeChange }}
    >
      <aside
        {...props}
        aria-label={landmarkLabel}
        className={cx(sidebarParts.root, className)}
        data-state={collapsed ? "collapsed" : "expanded"}
        id={id}
        ref={rootRef}
        style={sidebarStyle}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
}

export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function SidebarHeader({ children, className, ...props }: SidebarHeaderProps) {
  return (
    <div {...props} className={cx(sidebarParts.header, className)}>
      {children}
    </div>
  );
}

export type SidebarContentProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

/** The scrolling middle. Header and footer stay pinned; only this moves. */
export function SidebarContent({ children, className, ...props }: SidebarContentProps) {
  const { contentId } = useSidebar("SidebarContent");

  return (
    <div {...props} className={cx(sidebarParts.content, className)} id={contentId}>
      {children}
    </div>
  );
}

export type SidebarFooterProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function SidebarFooter({ children, className, ...props }: SidebarFooterProps) {
  return (
    <div {...props} className={cx(sidebarParts.footer, className)}>
      {children}
    </div>
  );
}

export type SidebarSeparatorProps = HTMLAttributes<HTMLHRElement>;

export function SidebarSeparator({ className, ...props }: SidebarSeparatorProps) {
  return <hr {...props} className={cx(sidebarParts.separator, className)} />;
}

/**
 * The travel available to a drag, measured rather than parsed.
 *
 * Same reasoning as the vanilla binding's `measureBounds`, and deliberately the same technique: the
 * bounds are `clamp()` arguments in a stylesheet and may be written in any unit, so the element is
 * pushed past each end and asked where it landed. Nothing is painted at either extreme, because the
 * push, the read and the restore happen in one synchronous block with the transition suppressed.
 */
function measureBounds(root: HTMLElement): { min: number; max: number } {
  const previous = root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY);
  const wasResizing = root.hasAttribute("data-resizing");

  root.setAttribute("data-resizing", "");
  root.style.setProperty(SIDEBAR_WIDTH_PROPERTY, "0px");
  const min = root.getBoundingClientRect().width;
  root.style.setProperty(SIDEBAR_WIDTH_PROPERTY, "100000px");
  const max = root.getBoundingClientRect().width;

  if (previous) root.style.setProperty(SIDEBAR_WIDTH_PROPERTY, previous);
  else root.style.removeProperty(SIDEBAR_WIDTH_PROPERTY);
  if (!wasResizing) root.removeAttribute("data-resizing");

  return { min, max };
}

export type SidebarResizeHandleProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /**
   * The splitter's accessible name. It is a bare strip on the panel edge, so nothing about it is
   * self-describing to a screen reader.
   */
  label: string;
};

/**
 * The drag edge, and the switch: the sidebar is resizable because this is here (the stylesheet reads
 * the same fact with `:has()`).
 *
 * The width itself is NOT React state. It is one custom property on the root, clamped by CSS, which
 * is what keeps a drag at pointer speed instead of at render speed, and what keeps this binding and
 * the vanilla one from having to agree about arithmetic neither of them owns.
 */
export const SidebarResizeHandle = forwardRef<HTMLDivElement, SidebarResizeHandleProps>(
  function SidebarResizeHandle({ className, label, onKeyDown, onPointerDown, ...props }, forwardedRef) {
    const { rootRef, storageKey, onResizeChange } = useSidebar("SidebarResizeHandle");
    const boundsRef = useRef({ min: 0, max: 0 });
    const dragRef = useRef<{ pointerId: number; startX: number; startWidth: number; dragging: boolean } | null>(
      null,
    );
    /* The pre-JavaScript value the contract writes, replaced with the real position once there is a
     * layout to measure. Rendered rather than patched so React owns the attribute it printed. */
    const [percent, setPercent] = useState(50);

    /*
     * The preference exists either way; `storageKey` decides whether anything is ever WRITTEN to it.
     * A hook cannot be called conditionally, and a sidebar that does not persist still needs a stable
     * setter identity, so the slot is declared and simply left alone.
     */
    const preference = useMemo(() => sidebarWidthPreference(storageKey ?? ""), [storageKey]);
    const [storedWidth, setStoredWidth, clearStoredWidth] = useStoredPreference(preference);

    const settled = useCallback(() => rootRef.current?.getBoundingClientRect().width ?? 0, [rootRef]);

    const describe = useCallback(() => {
      const { min, max } = boundsRef.current;
      // A degenerate range means there is no layout to speak of; inventing a position would be worse
      // than leaving the one the markup already carries.
      if (!(max > min)) return;
      setPercent(sidebarWidthPercent(settled(), min, max));
    }, [settled]);

    const apply = useCallback(
      (width: number | null) => {
        const root = rootRef.current;
        if (!root) return;
        if (width === null) root.style.removeProperty(SIDEBAR_WIDTH_PROPERTY);
        else root.style.setProperty(SIDEBAR_WIDTH_PROPERTY, `${Math.round(width)}px`);
        describe();
      },
      [describe, rootRef],
    );

    const announce = useCallback(() => {
      onResizeChange?.({ inlineSize: settled() });
    }, [onResizeChange, settled]);

    /** The end of an adjustment: what was granted is what gets remembered, and then announced. */
    const commit = useCallback(() => {
      if (storageKey) setStoredWidth(settled());
      announce();
    }, [announce, setStoredWidth, settled, storageKey]);

    /* Restore, and take the first measurement. Effect and not render: both need a laid-out element. */
    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      boundsRef.current = measureBounds(root);
      if (storageKey && storedWidth !== null) apply(storedWidth);
      else describe();
      // Restoring is a mount concern: re-running it on every stored write would fight the drag that
      // caused the write. Cross-tab changes are picked up by the storage hook on the next mount.
    }, []);

    const towardWider = useCallback(
      () =>
        splitterDirectionSign(
          rootRef.current && getComputedStyle(rootRef.current).direction === "rtl" ? "rtl" : "ltr",
        ),
      [rootRef],
    );

    /*
     * One adjustment, with the width transition out of the way.
     *
     * Everything here works by writing a width and reading back what the stylesheet granted, and a
     * running transition breaks exactly that: the element keeps reporting the width it is animating
     * FROM, so each step measures the previous one. Suppressing it for the length of the adjustment
     * makes the read honest, and a nudge that does not animate is also the better gesture. The
     * bounds are re-measured here because a sidebar can be adjusted before it was ever laid out
     * (rendered in a hidden panel, then revealed), which is when the mount measurement got nothing.
     */
    const adjust = useCallback(
      (next: (from: number) => number | null) => {
        const root = rootRef.current;
        if (!root) return;
        const wasResizing = root.hasAttribute("data-resizing");
        root.setAttribute("data-resizing", "");
        boundsRef.current = measureBounds(root);
        apply(next(settled()));
        if (!wasResizing) root.removeAttribute("data-resizing");
      },
      [apply, rootRef, settled],
    );

    /*
     * Back to the stylesheet's width. It FORGETS rather than storing the default, and announces
     * without going through `commit`, which would write that default straight back into the slot it
     * just cleared.
     */
    const reset = useCallback(() => {
      adjust(() => null);
      if (storageKey) clearStoredWidth();
      announce();
    }, [adjust, announce, clearStoredWidth, storageKey]);

    return (
      <div
        {...props}
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percent}
        className={cx(`${sidebarParts.resizeHandle} sk-splitter`, className)}
        onDoubleClick={reset}
        onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;

          const action = resolveSplitterKey(event);

          switch (action.kind) {
            case "delta":
              adjust((from) => from + action.delta * towardWider());
              break;
            // The ends of the travel: overshoot and let `clamp()` land it, so neither binding needs
            // to know where the ends are.
            case "home":
              adjust(() => 0);
              break;
            case "end":
              adjust(() => 100000);
              break;
            case "reset":
              event.preventDefault();
              reset();
              return;
            case "none":
              return;
          }

          event.preventDefault();
          commit();
        }}
        onLostPointerCapture={(event: ReactPointerEvent<HTMLDivElement>) => {
          const drag = dragRef.current;
          if (!drag) return;
          dragRef.current = null;
          event.currentTarget.removeAttribute("data-dragging");
          // A press that never became a drag ends here: nothing moved, so there is nothing to
          // announce and nothing to remember.
          if (!drag.dragging) return;
          rootRef.current?.removeAttribute("data-resizing");
          commit();
        }}
        onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || event.button !== 0) return;
          const root = rootRef.current;
          if (!root) return;

          // Still prevented: the press must not start a text selection while we wait to see what
          // it is. Captured from the press and not from the arming, or the pointer would stop
          // reporting here before it had travelled the four pixels that decide.
          event.preventDefault();
          dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: 0, dragging: false };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
          const drag = dragRef.current;
          const root = rootRef.current;
          if (!drag || !root || drag.pointerId !== event.pointerId) return;

          if (!drag.dragging) {
            if (!hasCrossedDragThreshold(drag.startX, event.clientX)) return;
            // The gesture is a drag. Measure from HERE, so the width does not jump by the slop.
            boundsRef.current = measureBounds(root);
            drag.dragging = true;
            drag.startX = event.clientX;
            drag.startWidth = settled();
            root.setAttribute("data-resizing", "");
            event.currentTarget.setAttribute("data-dragging", "");
          }

          apply(drag.startWidth + (event.clientX - drag.startX) * towardWider());
        }}
        onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          // Releasing capture fires `lostpointercapture`, which is where the gesture actually ends:
          // doing it in both places would commit (and store) the same width twice.
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        ref={forwardedRef}
        role="separator"
        tabIndex={0}
      />
    );
  },
);

export type SidebarTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /**
   * The trigger's accessible name. It is icon-sized, so this is never painted, it names the
   * control for a screen reader, which an icon alone cannot do.
   */
  label: string;
  /** Decorative: the label above is what names this. */
  icon?: ReactNode;
  /**
   * Lifts the trigger out of flow to the panel's own top-right corner instead of sitting inline
   * where it was authored. See `sidebar.css`'s `[data-floating]` rule for the geometry.
   */
  floating?: boolean;
};

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(function SidebarTrigger(
  { className, floating, icon, label, onClick, ...props },
  ref,
) {
  const { collapsed, contentId, toggle } = useSidebar("SidebarTrigger");

  return (
    <button
      {...props}
      aria-controls={contentId}
      aria-expanded={!collapsed}
      aria-label={label}
      className={cx(`${sidebarParts.trigger} sk-interactive`, className)}
      data-floating={floating ? "" : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      ref={ref}
      type="button"
    >
      {icon}
    </button>
  );
});
