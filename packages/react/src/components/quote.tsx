import { quoteContract, quoteParts, type QuoteVariant } from "@skryensya/core/quote";
import { type HTMLAttributes, type ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { variant: variantOption } = quoteContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type QuoteProps = Omit<HTMLAttributes<HTMLElement>, "cite"> & {
  /** The quoted words. */
  children: ReactNode;
  /**
   * WHO said it: a person, an organisation. Plain text in the caption.
   *
   * Deliberately not the `<cite>`: that element is the title of a work, and a person's name in one
   * is the mistake this split exists to prevent.
   */
  attribution?: ReactNode;
  /** WHAT it appeared in: the book, the talk, the page. This is the `<cite>`. */
  source?: ReactNode;
  /**
   * The URL the quotation came from, on `<blockquote cite>`. Machine-readable provenance only: no
   * browser renders it. A link a reader can follow belongs in `source`.
   */
  cite?: string;
  /** `block` sits inside a text; `pull` is lifted out of it to be read on its own. */
  variant?: QuoteVariant;
};

/**
 * Somebody else's words, and who said them.
 *
 * The root is a `<figure>` and the caption sits outside the `<blockquote>`, which is HTML's own
 * rule rather than a layout preference: the blockquote holds the quoted material and nothing else.
 */
export function Quote({
  attribution,
  children,
  cite,
  className,
  source,
  variant = variantOption.default,
  ...props
}: QuoteProps) {
  return (
    <figure {...props} className={cx(quoteParts.root, className)} data-variant={variant}>
      <blockquote className={quoteParts.body} cite={cite}>
        {children}
      </blockquote>
      {/* Either half warrants the caption: a name with no work, or a work quoted anonymously. */}
      {(attribution !== undefined || source !== undefined) && (
        <figcaption className={quoteParts.attribution}>
          {attribution}
          {source !== undefined && <cite className={quoteParts.source}>{source}</cite>}
        </figcaption>
      )}
    </figure>
  );
}
