import { paginationParts, paginationRange } from "@skryensya/core/pagination";
import { type HTMLAttributes } from "react";
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
        className={cx(paginationParts.previous, "ds-interactive")}
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
            aria-label={`Page ${slot}`}
            className={cx(paginationParts.item, "ds-interactive")}
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
        className={cx(paginationParts.next, "ds-interactive")}
        disabled={page >= total}
        onClick={() => go(page + 1)}
        type="button"
      >
        <Icon name="chevron-right" size="sm" />
      </button>
    </nav>
  );
}
