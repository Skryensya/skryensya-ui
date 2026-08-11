import { badgeParts } from "@skryensya/core/badge";
import { changeKindTones, changelogParts, type ChangeKind } from "@skryensya/core/changelog";
import { type LiHTMLAttributes, type OlHTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ChangelogProps = OlHTMLAttributes<HTMLOListElement> & {
  children: ReactNode;
};

/**
 * A version history, newest first.
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

export type ChangelogReleaseProps = Omit<LiHTMLAttributes<HTMLLIElement>, "children"> & {
  /** The version, as it is written in a lockfile: `0.2.0`, or `0.1.0-dev` for unshipped work. */
  version: ReactNode;
  /**
   * The day it shipped, `YYYY-MM-DD`. Lands on `<time datetime>`. Leaving it out is what says the
   * version has not shipped, which is the only thing this binding knows about unreleased work.
   */
  date?: string;
  /**
   * The same day as a reader reads it. Passed in rather than formatted here: a formatted date is
   * copy in a language, and neither this binding nor the contract behind it ships any. Callers use
   * `Intl.DateTimeFormat` with their own locale.
   */
  dateLabel?: ReactNode;
  /** The changes that shipped in this version: `ChangelogEntry` children. */
  children: ReactNode;
};

export function ChangelogRelease({
  children,
  className,
  date,
  dateLabel,
  version,
  ...props
}: ChangelogReleaseProps) {
  return (
    <li
      {...props}
      className={cx(changelogParts.release, className)}
      /* Derived, not declared: there is no second prop an author could set to contradict the first
         one, so a version cannot claim a ship date and deny it. */
      data-unreleased={date === undefined ? "" : undefined}
    >
      {/* The mark on the rail repeats what the version and its date already say in words, so it is
          hidden rather than announced as an extra bullet before every release. */}
      <span aria-hidden="true" className={changelogParts.marker} />
      {/* Inline and unwrapped: two inline elements in block flow sit on one line by themselves, and
          the `<ol>` below is a block, so it breaks where it should. The middot between them is
          drawn by the stylesheet. */}
      <span className={changelogParts.version}>{version}</span>
      {date !== undefined && (
        <time className={changelogParts.date} dateTime={date}>
          {dateLabel}
        </time>
      )}
      <ol className={changelogParts.entries}>{children}</ol>
    </li>
  );
}

export type ChangelogEntryProps = Omit<LiHTMLAttributes<HTMLLIElement>, "children"> & {
  kind?: ChangeKind;
  /** The kind as a word, so the kind is never colour alone. */
  kindLabel: ReactNode;
  /** The headline: what changed, in one line. What a reader scans a release for. */
  title: ReactNode;
  /** Which option, part or signature this is about. Rendered as code. */
  target?: ReactNode;
  /** Why it changed and what it means, in the words a consumer reads. */
  children: ReactNode;
};

export function ChangelogEntry({
  children,
  className,
  // Resolved rather than left absent: the contract declares this default and the emitter writes it
  // into markup, so an undefined here would make the two bindings differ on an unmarked entry.
  kind = "chore",
  kindLabel,
  target,
  title,
  ...props
}: ChangelogEntryProps) {
  return (
    <li {...props} className={cx(changelogParts.entry, className)} data-kind={kind}>
      {/* `sk-badge` alongside the part class, not instead of it: Badge owns what a status label looks
          like and this component owns where it sits. Same composition as Avatar over ImageFrame. */}
      {/* The tone is READ FROM CORE, never decided here. It is a rendering of `kind` rather than a
          prop, so there is no way to file a breaking change under a calm badge — and importing the
          table instead of restating it is what stops this binding and the contract's `attrsWhen`
          from drifting the day a kind changes colour. */}
      <span className={`${changelogParts.kind} ${badgeParts.root}`} data-tone={changeKindTones[kind]}>
        {kindLabel}
      </span>
      {/* The target rides with the badge: both answer "what is this about" before anything is read,
          so the headline below gets a clean line of its own. */}
      {target !== undefined && <code className={changelogParts.target}>{target}</code>}
      <span className={changelogParts.title}>{title}</span>
      {/* A div, not a p: the author's prose goes in here and brings its own paragraphs, and a `p`
          cannot contain one. */}
      <div className={changelogParts.text}>{children}</div>
    </li>
  );
}
