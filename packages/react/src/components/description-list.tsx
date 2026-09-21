import {
  descriptionListContract,
  descriptionListParts,
  type DescriptionListDensity,
  type DescriptionListLayout,
} from "@skryensya/core/description-list";
import { type HTMLAttributes, type ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { layout: layoutOption } = descriptionListContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type DescriptionListProps = HTMLAttributes<HTMLDListElement> & {
  /** `DescriptionItem`s. */
  children: ReactNode;
  /** `stacked` puts the value under its name; `columns` puts them side by side. */
  layout?: DescriptionListLayout;
  /** Rules between rows. Off by default: a list of four facts does not need ruling. */
  dividers?: boolean;
  /** Tighter rows, for reference material rather than reading. */
  density?: DescriptionListDensity;
};

/**
 * Pairs of a name and its value: one record's details.
 *
 * Two of them side by side is a comparison, and a comparison is a Table.
 */
export function DescriptionList({
  children,
  className,
  density,
  dividers = false,
  layout = layoutOption.default,
  ...props
}: DescriptionListProps) {
  return (
    <dl
      {...props}
      className={cx(descriptionListParts.root, className)}
      data-layout={layout}
      data-density={density}
      data-dividers={dividers ? "" : undefined}
    >
      {children}
    </dl>
  );
}

export type DescriptionItemProps = HTMLAttributes<HTMLDivElement> & {
  /** The name. */
  term: ReactNode;
  /** The value: a date, a Tag, a link, a short list of them. */
  children: ReactNode;
};

/**
 * One pair.
 *
 * The `<div>` around the `<dt>`/`<dd>` is HTML's own grouping element, not a wrapper this component
 * invented: it is what makes a row addressable by a divider or a two-column layout.
 */
export function DescriptionItem({ children, className, term, ...props }: DescriptionItemProps) {
  return (
    <div {...props} className={cx(descriptionListParts.group, className)}>
      <dt className={descriptionListParts.term}>{term}</dt>
      <dd className={descriptionListParts.details}>{children}</dd>
    </div>
  );
}
