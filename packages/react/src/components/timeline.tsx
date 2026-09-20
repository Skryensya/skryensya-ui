import { timelineContract, timelineParts, type TimelineTone } from "@skryensya/core/timeline";
import { type LiHTMLAttributes, type OlHTMLAttributes, type ReactNode } from "react";

const { tone: toneOption } = timelineContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type TimelineProps = OlHTMLAttributes<HTMLOListElement> & {
  children: ReactNode;
};

/** A sequence of events that already happened. Progress through a process belongs to Steps. */
export function Timeline({ children, className, ...props }: TimelineProps) {
  return (
    <ol {...props} className={cx(timelineParts.root, className)} role="list">
      {children}
    </ol>
  );
}

export type TimelineItemProps = LiHTMLAttributes<HTMLLIElement> & {
  /**
   * When it happened, machine-readable: an ISO 8601 date (`2026-03-14`) or datetime. Lands on
   * `<time datetime>`, where a parser can reach it.
   */
  time?: string;
  /**
   * The same moment as a reader reads it. Passed in rather than formatted here: a formatted date
   * is copy in a language, and the kit ships none.
   */
  timeLabel?: ReactNode;
  /** The event itself. The loudest line of the entry, and the only required one. */
  heading: string;
  /** The kit's Icon for the dot, decorative. Absent, the dot is a plain disc. */
  icon?: ReactNode;
  /** The detail under the heading. */
  children?: ReactNode;
  /** Emphasis on the dot, never the only thing carrying the meaning. */
  tone?: TimelineTone;
};

/** One event on the rail. */
export function TimelineItem({
  children,
  className,
  heading,
  icon,
  time,
  timeLabel,
  tone = toneOption.default,
  ...props
}: TimelineItemProps) {
  return (
    <li {...props} className={cx(timelineParts.item, className)} data-tone={tone}>
      {/* The dot repeats nothing the heading beside it does not already say, so it is hidden. */}
      <span aria-hidden="true" className={timelineParts.marker}>
        {icon}
      </span>
      {/* Either half of the time is enough to warrant the element: the machine value alone still
          belongs in the markup, and the label alone is a legible time with no parseable form. */}
      {(time !== undefined || timeLabel !== undefined) && (
        <time className={timelineParts.time} dateTime={time}>
          {timeLabel}
        </time>
      )}
      <span className={timelineParts.heading}>{heading}</span>
      {children !== undefined && <div className={timelineParts.body}>{children}</div>}
    </li>
  );
}
