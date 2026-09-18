import {
  paginationContract,
  paginationEvents,
  paginationParts,
  paginationRange,
  tablePagerContract,
  tablePagerParts,
} from "@skryensya/core/pagination";
import { renderIconBox, type IconSet } from "@skryensya/core/icon";
import { connectTablePager } from "@skryensya/core/table-pager-dom";
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon, useIconSet } from "./icon.js";

/* Derived, never restated: the defaults live in the contract. */
const pagerOptions = tablePagerContract.options;
const {
  label: labelOption,
  nextLabel: nextLabelOption,
  previousLabel: previousLabelOption,
  siblings: siblingsOption,
} = paginationContract.options;

const escapeAttr = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

/** An icon as markup, for the nav the shared pager builds outside React's tree. Decorative. */
function iconMarkup(set: IconSet, name: "chevron-left" | "chevron-right"): string {
  const icon = set[name];
  if (!icon) return "";
  const { presentation, box, body } = renderIconBox({ icon, dataIcon: name, size: "sm" });
  const attrs = [...presentation, ...box].map(([key, value]) => `${key}="${escapeAttr(value)}"`).join(" ");
  return `<svg ${attrs}>${body}</svg>`;
}

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
  label = labelOption.default,
  nextLabel = nextLabelOption.default,
  onPageChange,
  page,
  previousLabel = previousLabelOption.default,
  siblings = siblingsOption.default,
  total,
  ...props
}: PaginationProps) {
  const rootRef = useRef<HTMLElement>(null);
  const slots = paginationRange(page, total, siblings);
  const go = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), total);
    onPageChange?.(clamped);
    rootRef.current?.dispatchEvent(
      new CustomEvent(paginationEvents.pageChange, {
        bubbles: true,
        detail: { page: clamped },
      }),
    );
  };

  return (
    <nav
      {...props}
      ref={rootRef}
      aria-label={label}
      className={cx(paginationParts.root, className)}
      data-page={page}
      data-siblings={siblings}
      data-total={total}
    >
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

/*
 * The shell AND the behaviour: `connectTablePager` (core) pages the table's body rows, fills the
 * status and builds the nav, the same function the Vanilla enhancer runs. It used to be the shell
 * alone, so a React TablePager rendered every row and an empty nav.
 */
export function TablePager({
  children,
  className,
  nextLabel = pagerOptions.nextLabel.default,
  page = pagerOptions.page.default,
  pageLabel = pagerOptions.pageLabel.default,
  pageSize = pagerOptions.pageSize.default,
  previousLabel = pagerOptions.previousLabel.default,
  siblings = pagerOptions.siblings.default,
  statusTemplate = pagerOptions.statusTemplate.default,
  ...props
}: TablePagerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const set = useIconSet();

  useEffect(() => {
    if (!ref.current) return;
    return connectTablePager(ref.current, {
      chevron: (direction) => iconMarkup(set, direction === "left" ? "chevron-left" : "chevron-right"),
    });
  }, [set, page, pageSize, siblings, statusTemplate, previousLabel, nextLabel, pageLabel]);

  return (
    <div
      {...props}
      ref={ref}
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
      aria-atomic="true"
      aria-live="polite"
      className={cx(tablePagerParts.status, className)}
      data-sk-table-pager-status=""
      role="status"
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
  label = pagerOptions.navLabel.default,
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
