import { navListContract, navListParts } from "@skryensya/core/nav-list";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { forwardRef, useId, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";

/*
 * A BINDING (decision 28). The three exports below are three signatures of one contract, and the
 * five-element structure they produce is that contract's part template, not this file's invention.
 */
const { orientation: orientationOption, current: currentOption } = navListContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type NavListProps = HTMLAttributes<HTMLElement> &
  SignatureOptionsOf<typeof navListContract, "NavList"> & {
    children: ReactNode;
    /** Names the landmark. Required once a page has a second nav, the platform's own rule. */
    "aria-label"?: string;
  };

/*
 * The list of destinations, wherever it lives, a sidebar, a navbar, a drawer (decision 17). It is
 * a `<nav>` of `<ul><li><a>` and nothing more: no `role="menu"`, because these are links.
 */
export function NavList({
  children,
  className,
  orientation = orientationOption.default,
  ...props
}: NavListProps) {
  return (
    <nav
      {...props}
      className={cx(navListParts.root, className)}
      {...{ [orientationOption.attr]: orientation }}
    >
      {children}
    </nav>
  );
}

export type NavListGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  label?: ReactNode;
};

/*
 * The `<ul>` is why this signature exists: a `<li>` needs a list to sit inside, and NavList itself
 * only renders the landmark. So the list node is unconditional and only the label node is
 * conditional — the contract's `whenSlotFilled: "label"` — and its `labelledBySlot` is the wiring
 * below.
 */
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

/** `href` is required: the signature requires it, and a destination with no destination is not one. */
export type NavListLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  SignatureOptionsOf<typeof navListContract, "NavListLink"> & {
    children: ReactNode;
    href: string;
    /**
     * Decorative: the label names the link, so pass an `<Icon>` with no label of its own. It keeps
     * its own box, this adds no slot around it (decision 15).
     */
    icon?: ReactNode;
    /** Trailing metadata: a count, a badge. Pinned to the end, and hidden when a host collapses. */
    trailing?: ReactNode;
  };

export const NavListLink = forwardRef<HTMLAnchorElement, NavListLinkProps>(function NavListLink(
  { children, className, current, icon, trailing, ...props },
  ref,
) {
  return (
    <li className={navListParts.item}>
      <a
        {...props}
        {...{ [currentOption.attr]: current ? currentOption.trueValue : undefined }}
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
