import { tableParts } from "@skryensya/core/table";
import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";

type WithChildren<T> = T & { children: ReactNode };

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type TableScrollProps = WithChildren<HTMLAttributes<HTMLDivElement>> & {
  stickyColumn?: boolean;
  stickyHeader?: boolean;
};
export type TableProps = WithChildren<TableHTMLAttributes<HTMLTableElement>>;
export type TableCaptionProps = WithChildren<HTMLAttributes<HTMLTableCaptionElement>>;
export type TableHeadProps = WithChildren<HTMLAttributes<HTMLTableSectionElement>>;
export type TableFooterProps = WithChildren<HTMLAttributes<HTMLTableSectionElement>>;
export type TableBodyProps = WithChildren<HTMLAttributes<HTMLTableSectionElement>>;
export type TableRowProps = WithChildren<HTMLAttributes<HTMLTableRowElement>>;
export type TableHeaderProps = WithChildren<ThHTMLAttributes<HTMLTableCellElement>>;
export type TableCellProps = WithChildren<TdHTMLAttributes<HTMLTableCellElement>>;

export const TableScroll = forwardRef<
  HTMLDivElement,
  TableScrollProps
>(function TableScroll(
  {
    children,
    className,
    stickyColumn = false,
    stickyHeader = false,
    ...props
  },
  ref,
) {
  return (
    <div
      data-sticky-column={stickyColumn ? "" : undefined}
      data-sticky-header={stickyHeader ? "" : undefined}
      {...props}
      ref={ref}
      className={cx(tableParts.scroll, className)}
    >
      {children}
    </div>
  );
});

export function Table({ children, className, ...props }: TableProps) {
  return (
    <table {...props} className={cx(tableParts.root, className)}>
      {children}
    </table>
  );
}

export function TableCaption({ children, className, ...props }: TableCaptionProps) {
  return (
    <caption {...props} className={cx(tableParts.caption, className)}>
      {children}
    </caption>
  );
}

export function TableHead({ children, className, ...props }: TableHeadProps) {
  return (
    <thead {...props} className={cx(tableParts.head, className)}>
      {children}
    </thead>
  );
}

export function TableFooter({ children, className, ...props }: TableFooterProps) {
  return (
    <tfoot {...props} className={cx(tableParts.foot, className)}>
      {children}
    </tfoot>
  );
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody {...props} className={cx(tableParts.body, className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr {...props} className={cx(tableParts.row, className)}>
      {children}
    </tr>
  );
}

export function TableHeader({ children, className, scope = "col", ...props }: TableHeaderProps) {
  return (
    <th {...props} className={cx(tableParts.header, className)} scope={scope}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td {...props} className={cx(tableParts.cell, className)}>
      {children}
    </td>
  );
}
