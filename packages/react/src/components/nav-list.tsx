import { navListContract, navListParts } from "@skryensya/core/nav-list";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { forwardRef, useId, useState, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";

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
  /**
   * Turns the static label into a disclosure button toggling the list. The WAI-ARIA APG
   * "Disclosure (Navigation)" pattern. Requires `label`: a button needs the text to click on.
   */
  collapsible?: boolean;
  /** Starts expanded. Hiding navigation by default is the wrong default. Uncontrolled: read once,
   *  then this component owns it, the same as `Accordion`'s own `defaultOpen`. */
  defaultOpen?: boolean;
  /**
   * Renders a static label (`collapsible` absent) as a real `<h3>` instead of a plain `<div>` -
   * for a group sitting inside a large panel (`Megamenu`'s columns being the motivating case)
   * where screen-reader heading-navigation is how a reader orients among several groups at once.
   * Has no effect on a collapsible group's label, which is already a real `<button>`.
   */
  heading?: boolean;
};

/*
 * The `<ul>` is why this signature exists: a `<li>` needs a list to sit inside, and NavList itself
 * only renders the landmark. So the list node is unconditional and only the label node is
 * conditional (the contract's `whenSlotFilled: "label"`), and its `labelledBySlot` is the wiring
 * below.
 */
export function NavListGroup({
  children,
  className,
  collapsible = false,
  defaultOpen = true,
  heading = false,
  label,
  ...props
}: NavListGroupProps) {
  const labelId = useId();
  const listId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const expanded = collapsible ? open : true;

  return (
    <div
      {...props}
      className={cx(navListParts.group, className)}
      data-heading={heading ? "" : undefined}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        // The one keyboard requirement WAI's Disclosure (Navigation) pattern does NOT mark
        // optional (unlike arrow keys/Home/End, confirmed fetching the example page): Escape
        // closes an open dropdown from anywhere focus is inside it, and returns focus to the
        // trigger: "point of regard", same reasoning `Dialog`'s own Escape handling serves.
        if (!collapsible || !open || event.key !== "Escape") return;
        event.preventDefault();
        setOpen(false);
        (event.currentTarget.querySelector(`[aria-controls="${listId}"]`) as HTMLElement | null)?.focus();
      }}
    >
      {label && collapsible ? (
        <button
          aria-controls={listId}
          aria-expanded={expanded}
          className={`${navListParts.groupLabel} sk-interactive`}
          onClick={() => setOpen((previous) => !previous)}
          type="button"
        >
          {label}
        </button>
      ) : label && heading ? (
        <h3 className={navListParts.groupLabel} id={labelId}>
          {label}
        </h3>
      ) : label ? (
        <div className={navListParts.groupLabel} id={labelId}>
          {label}
        </div>
      ) : null}
      <ul
        aria-labelledby={label ? (collapsible ? undefined : labelId) : undefined}
        className={navListParts.list}
        hidden={collapsible && !expanded}
        id={collapsible ? listId : undefined}
        role="list"
      >
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
    /**
     * This destination's own sub-destinations: a `<NavListGroup>` rendered inside the same `<li>`,
     * after the link. `<li>` accepts arbitrary flow content, so this is valid where a group nested
     * straight inside another group's `<ul>` would not be. A `<div>` is not a legal `<ul>` child.
     */
    nested?: ReactNode;
  };

export const NavListLink = forwardRef<HTMLAnchorElement, NavListLinkProps>(function NavListLink(
  { children, className, current, icon, nested, trailing, ...props },
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
      {nested}
    </li>
  );
});
