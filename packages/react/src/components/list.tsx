import { listParts, type ListDensity } from "@skryensya/core/list";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type ReactNode,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);
const action = `${listParts.action} ${listParts.interactive}`;

export type { ListDensity };

export type ListProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** Ordered semantics: renders `<ol>` instead of `<ul>`. */
  ordered?: boolean;
  density?: ListDensity;
  /** Hairlines between rows. On by default. */
  dividers?: boolean;
};

/*
 * A semantic list of rows. The element is a real `<ul>`/`<ol>`; the value is the row anatomy and the
 * interaction, not the typography. Interactive rows are real `<a>`/`<button>` (ListItemLink /
 * ListItemButton), never an onClick on the `<li>`.
 */
export function List({
  children,
  className,
  density,
  dividers = true,
  ordered,
  ...props
}: ListProps) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      {...props}
      className={cx(listParts.root, className)}
      data-density={density === "compact" ? "compact" : undefined}
      data-dividers={dividers ? undefined : "none"}
      role="list"
    >
      {children}
    </Tag>
  );
}

export type OrderedListProps = Omit<ListProps, "ordered">;

export function OrderedList(props: OrderedListProps) {
  return <List {...props} ordered />;
}

export type ListItemPlainProps = LiHTMLAttributes<HTMLLIElement> & {
  children: ReactNode;
  disabled?: boolean;
};

export function ListItemPlain({
  children,
  className,
  disabled,
  ...props
}: ListItemPlainProps) {
  return (
    <li
      {...props}
      className={cx(listParts.item, className)}
      data-disabled={disabled ? "" : undefined}
    >
      {children}
    </li>
  );
}

/** The composable row slots, shared by static and interactive items. */
type RowSlots = {
  /** Decorative leading media: an Icon, an Avatar, a number. Names nothing on its own. */
  leading?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Trailing meta or action: a Badge, a count, a chevron. Pinned to the end. */
  trailing?: ReactNode;
};

function Row({ children, description, leading, title, trailing }: RowSlots & { children?: ReactNode }) {
  // `children` is the escape hatch: full control over the row instead of the title/description slots.
  if (children != null) return <>{children}</>;
  return (
    <>
      {leading != null ? <span className={listParts.leading}>{leading}</span> : null}
      <span className={listParts.content}>
        {title != null ? <span className={listParts.title}>{title}</span> : null}
        {description != null ? <span className={listParts.description}>{description}</span> : null}
      </span>
      {trailing != null ? <span className={listParts.trailing}>{trailing}</span> : null}
    </>
  );
}

export type ListItemProps = Omit<LiHTMLAttributes<HTMLLIElement>, "title"> &
  RowSlots & {
    disabled?: boolean;
  };

/** A static row: read-only content, no interaction. The `<li>` itself is the row. */
export function ListItem({
  children,
  className,
  description,
  disabled,
  leading,
  title,
  trailing,
  ...props
}: ListItemProps) {
  return (
    <li
      {...props}
      className={cx(listParts.item, className)}
      data-disabled={disabled ? "" : undefined}
    >
      <Row description={description} leading={leading} title={title} trailing={trailing}>
        {children}
      </Row>
    </li>
  );
}

export type ListItemLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "title"> &
  RowSlots & {
    /** Required: a row that navigates needs a destination — an `<a>` with no `href` is not one. */
    href: string;
  };

/** A functional row that navigates: the whole row is a real anchor, with native focus + keyboard. */
export const ListItemLink = forwardRef<HTMLAnchorElement, ListItemLinkProps>(function ListItemLink(
  { children, className, description, leading, title, trailing, ...props },
  ref,
) {
  return (
    <li className={listParts.item}>
      <a
        {...props}
        className={cx(action, className)}
        ref={ref}
      >
        <Row description={description} leading={leading} title={title} trailing={trailing}>
          {children}
        </Row>
      </a>
    </li>
  );
});

export type ListItemButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> & RowSlots;

/** A functional row that fires an action: the whole row is a real button (defaults to type="button"). */
export const ListItemButton = forwardRef<HTMLButtonElement, ListItemButtonProps>(function ListItemButton(
  { children, className, description, leading, title, trailing, type, ...props },
  ref,
) {
  return (
    <li className={listParts.item}>
      <button
        {...props}
        className={cx(action, className)}
        ref={ref}
        type={type ?? "button"}
      >
        <Row description={description} leading={leading} title={title} trailing={trailing}>
          {children}
        </Row>
      </button>
    </li>
  );
});
