import { navListParts, type NavListOrientation } from "@skryensya/core/nav-list";
import { forwardRef, useId, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type NavListProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  orientation?: NavListOrientation;
  /** Names the landmark. Required once a page has a second nav, the platform's own rule. */
  "aria-label"?: string;
};

/*
 * The list of destinations, wherever it lives, a sidebar, a navbar, a drawer (decision 17). It is
 * a `<nav>` of `<ul><li><a>` and nothing more: no `role="menu"`, because these are links.
 */
export function NavList({ children, className, orientation = "vertical", ...props }: NavListProps) {
  return (
    <nav {...props} className={cx(navListParts.root, className)} data-orientation={orientation}>
      {children}
    </nav>
  );
}

export type NavListGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  label?: ReactNode;
};

export function NavListGroup({ children, className, label, ...props }: NavListGroupProps) {
  const labelId = useId();

  return (
    <div {...props} className={cx(navListParts.group, className)}>
      {label ? (
        <div className={navListParts.groupLabel} id={labelId}>
          {label}
        </div>
      ) : null}
      <ul aria-labelledby={label ? labelId : undefined} className={navListParts.list}>
        {children}
      </ul>
    </div>
  );
}

export type NavListLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  /**
   * Decorative: the label names the link, so pass an `<Icon>` with no label of its own. It keeps
   * its own box, this adds no slot around it (decision 15).
   */
  icon?: ReactNode;
  /** Trailing metadata: a count, a badge. Pinned to the end, and hidden when a host collapses. */
  trailing?: ReactNode;
  /** The current page. Renders `aria-current="page"`, which is what the styling hooks follow. */
  current?: boolean;
};

export const NavListLink = forwardRef<HTMLAnchorElement, NavListLinkProps>(function NavListLink(
  { children, className, current, icon, trailing, ...props },
  ref,
) {
  return (
    <li className={navListParts.item}>
      <a
        {...props}
        aria-current={current ? "page" : undefined}
        className={cx(`${navListParts.link} sk-interactive`, className)}
        ref={ref}
      >
        {icon}
        <span className={navListParts.label}>{children}</span>
        {trailing ? <span className={navListParts.trailing}>{trailing}</span> : null}
      </a>
    </li>
  );
});
