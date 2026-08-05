import { changelogParts, type ChangeKind } from "@skryensya/core/changelog";
import { type LiHTMLAttributes, type OlHTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ChangelogProps = OlHTMLAttributes<HTMLOListElement> & {
  children: ReactNode;
};

/**
 * A dated history, newest first.
 *
 * `reversed` is written here and not left to the consumer, exactly as the contract declares it:
 * nothing renders the numbers, but the accessibility tree reads them, and in a newest-first list
 * they have to count backwards or they contradict the order they are numbering.
 */
export function Changelog({ children, className, ...props }: ChangelogProps) {
  return (
    <ol {...props} className={cx(changelogParts.root, className)} reversed>
      {children}
    </ol>
  );
}

export type ChangelogEntryProps = Omit<LiHTMLAttributes<HTMLLIElement>, "children"> & {
  /** The machine-readable day, `YYYY-MM-DD`. Lands on `<time datetime>`. */
  date: string;
  /**
   * The same day as a reader reads it. Passed in rather than formatted here: a formatted date is
   * copy in a language, and neither this binding nor the contract behind it ships any. Callers use
   * `Intl.DateTimeFormat` with their own locale.
   */
  dateLabel: ReactNode;
  kind?: ChangeKind;
  /** The kind as a word, so the kind is never colour alone. */
  kindLabel: ReactNode;
  /** Which option, part or signature this is about. Rendered as code. */
  target?: ReactNode;
  /** What changed, in the words a consumer reads. */
  children: ReactNode;
}

export function ChangelogEntry({
  children,
  className,
  date,
  dateLabel,
  // Resolved rather than left absent: the contract declares this default and the emitter writes it
  // into markup, so an undefined here would make the two bindings differ on an unmarked entry.
  kind = "changed",
  kindLabel,
  target,
  ...props
}: ChangelogEntryProps) {
  return (
    <li {...props} className={cx(changelogParts.entry, className)} data-kind={kind}>
      {/* The dot repeats what `kindLabel` says in words, so it is hidden rather than announced as
          an extra bullet before every entry. */}
      <span aria-hidden="true" className={changelogParts.marker} />
      {/* A div, not a p: a date, a word and a name are metadata, not prose, and a `p` would inherit
          the host site's paragraph margin, which is unlayered and beats the component's own
          `margin: 0`. The middots between these three are drawn by the stylesheet. */}
      <div className={changelogParts.meta}>
        <time className={changelogParts.date} dateTime={date}>
          {dateLabel}
        </time>
        <span className={changelogParts.kind}>{kindLabel}</span>
        {target !== undefined && <code className={changelogParts.target}>{target}</code>}
      </div>
      <div className={changelogParts.text}>{children}</div>
    </li>
  );
}
