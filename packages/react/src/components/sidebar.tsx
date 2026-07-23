import { sidebarParts, type SidebarOptions } from "@skryensya/core/sidebar";
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type SidebarContextValue = {
  collapsed: boolean;
  contentId: string;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar(part: string): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) throw new Error(`${part} must be rendered inside a <Sidebar>.`);
  return context;
}

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
  onCollapsedChange,
  id,
  ...props
}: SidebarProps) {
  const generatedId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
  const isControlled = collapsedProp !== undefined;
  const collapsed = isControlled ? collapsedProp : uncontrolled;

  const toggle = () => {
    const next = !collapsed;
    if (!isControlled) setUncontrolled(next);
    onCollapsedChange?.({ collapsed: next });
  };

  return (
    <SidebarContext.Provider value={{ collapsed, contentId: `${id ?? generatedId}-content`, toggle }}>
      <aside
        {...props}
        className={cx(sidebarParts.root, className)}
        data-state={collapsed ? "collapsed" : "expanded"}
        id={id}
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

export type SidebarTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /**
   * The trigger's accessible name. It is icon-sized, so this is never painted, it names the
   * control for a screen reader, which an icon alone cannot do.
   */
  label: string;
  /** Decorative: the label above is what names this. */
  icon?: ReactNode;
};

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(function SidebarTrigger(
  { className, icon, label, onClick, ...props },
  ref,
) {
  const { collapsed, contentId, toggle } = useSidebar("SidebarTrigger");

  return (
    <button
      {...props}
      aria-controls={contentId}
      aria-expanded={!collapsed}
      aria-label={label}
      className={cx(`${sidebarParts.trigger} ds-interactive`, className)}
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
