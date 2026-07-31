import {
  paginationParts,
  paginationRange,
  tablePagerAttrs,
  tablePagerParts,
} from "@skryensya/core/pagination";
import { type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "./icon.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type PaginationProps = Omit<HTMLAttributes<HTMLElement>, "onChange"> & {
  page: number;
  total: number;
  siblings?: number;
  onPageChange?: (page: number) => void;
  /** Accessible name for the navigation landmark. Defaults to "Pagination". */
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
};

export function Pagination({
  className,
  label = "Pagination",
  nextLabel = "Next page",
  onPageChange,
  page,
  previousLabel = "Previous page",
  siblings = 1,
  total,
  ...props
}: PaginationProps) {
  const slots = paginationRange(page, total, siblings);
  const go = (next: number) => onPageChange?.(Math.min(Math.max(next, 1), total));

  return (
    <nav {...props} aria-label={label} className={cx(paginationParts.root, className)}>
      <button
        aria-label={previousLabel}
        className={cx(paginationParts.previous, "sk-interactive")}
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        type="button"
      >
        <Icon name="chevron-left" size="sm" />
      </button>
      {slots.map((slot, index) =>
        slot === "ellipsis" ? (
          <span aria-hidden="true" className={paginationParts.ellipsis} key={`gap-${index}`}>
            …
          </span>
        ) : (
          <button
            aria-current={slot === page ? "page" : undefined}
            /* No aria-label: the number IS the name, and the nav landmark already supplies the
               context. A label that restated it would also have to be translated twice. */
            className={cx(paginationParts.item, "sk-interactive")}
            key={slot}
            onClick={() => go(slot)}
            type="button"
          >
            {slot}
          </button>
        ),
      )}
      <button
        aria-label={nextLabel}
        className={cx(paginationParts.next, "sk-interactive")}
        disabled={page >= total}
        onClick={() => go(page + 1)}
        type="button"
      >
        <Icon name="chevron-right" size="sm" />
      </button>
    </nav>
  );
}

type TablePagerPartProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export type TablePagerProps = TablePagerPartProps & {
  page?: number;
  pageSize?: number;
  siblings?: number;
  statusTemplate?: string;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: string;
};

export function TablePager({
  children,
  className,
  nextLabel = "Next page",
  page = 1,
  pageLabel = "Page",
  pageSize = 10,
  previousLabel = "Previous page",
  siblings = 1,
  statusTemplate = "{start}–{end} of {total}",
  ...props
}: TablePagerProps) {
  return (
    <div
      {...props}
      className={cx(tablePagerParts.root, className)}
      data-next-label={nextLabel}
      data-page={page}
      data-page-label={pageLabel}
      data-page-size={pageSize}
      data-previous-label={previousLabel}
      data-siblings={siblings}
      data-sk-table-pager=""
      data-status-template={statusTemplate}
    >
      {children}
    </div>
  );
}

export function TablePagerBar({ children, className, ...props }: TablePagerPartProps) {
  return (
    <div {...props} className={cx(tablePagerParts.bar, className)}>
      {children}
    </div>
  );
}

export function TablePagerSize({ children, className, ...props }: TablePagerPartProps) {
  return (
    <div {...props} className={cx(tablePagerParts.size, className)}>
      {children}
    </div>
  );
}

export function TablePagerEnd({ children, className, ...props }: TablePagerPartProps) {
  return (
    <div {...props} className={cx(tablePagerParts.end, className)}>
      {children}
    </div>
  );
}

export type TablePagerStatusProps = TablePagerPartProps;
export function TablePagerStatus({ children, className, ...props }: TablePagerStatusProps) {
  return (
    <div
      {...props}
      className={cx(tablePagerParts.status, className)}
      data-sk-table-pager-status=""
    >
      {children}
    </div>
  );
}

export type TablePagerNavProps = HTMLAttributes<HTMLElement> & {
  label?: string;
};
export function TablePagerNav({
  className,
  label = "Pagination",
  ...props
}: TablePagerNavProps) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={cx(tablePagerParts.nav, className)}
      data-sk-table-pager-nav=""
    />
  );
}
