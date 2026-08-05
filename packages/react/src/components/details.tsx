import { detailsParts } from "@skryensya/core/details";
import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon.js";

/*
 * DETAILS: markup and nothing else, because the behaviour is the platform's.
 *
 * `<details>` opens, closes, takes focus and is announced with no script. A `name` shared across
 * siblings makes the BROWSER keep one open at a time, which is what an accordion's coordinator
 * exists to do, so there is no machine here and nothing to enhance, exactly as with
 * `Select.native` and `DatePicker.native`.
 *
 * SHAPE MIRRORS `ExpandableTile`, not a single component with a `summary` prop hiding the anatomy:
 * `Details` renders whatever children it is given, and the author composes `Details.Summary` and
 * `Details.Content` inside it, the same two-piece composition `ExpandableTileTrigger` and
 * `ExpandableTileContent` already use. Writing it out reads close to
 * `<details><summary>…</summary>…</details>` by hand, which is the point of reaching for the
 * platform's own element instead of a machine.
 */
export type DetailsGroupProps = HTMLAttributes<HTMLElement> & { children?: ReactNode };

export function DetailsGroup({ children, className, ...props }: DetailsGroupProps) {
  return (
    <section {...props} className={className ? `${detailsParts.group} ${className}` : detailsParts.group}>
      {children}
    </section>
  );
}

export type DetailsProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  name?: string;
  open?: boolean;
};

type DetailsComponent = ((props: DetailsProps) => ReactNode) & {
  Summary: typeof DetailsSummary;
  Content: typeof DetailsContent;
};

function DetailsRoot({ children, className, name, open, ...props }: DetailsProps) {
  return (
    <details
      {...props}
      className={className ? `${detailsParts.root} ${className}` : detailsParts.root}
      name={name}
      open={open}
    >
      {children}
    </details>
  );
}

export type DetailsSummaryProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** What the closed state shows. The disclosure mark is added automatically: see below. */
  children: ReactNode;
};

export function DetailsSummary({ children, className, ...props }: DetailsSummaryProps) {
  const classes = className ? `${detailsParts.summary} sk-interactive ${className}` : `${detailsParts.summary} sk-interactive`;

  return (
    <summary {...props} className={classes}>
      {children}
      {/*
       * Baked in, not authored: `<summary>` already hides the browser's own marker
       * (`list-style: none`, `.sk-details__summary::marker { content: "" }`), so an instance with
       * nothing composed here would lose the affordance WCAG expects a disclosure to have. `[open]`
       * on the ancestor `<details>` is the platform's own state; the CSS keys the icon swap on it,
       * no JS of this component's own.
       */}
      <span aria-hidden="true" className={detailsParts.indicator}>
        <span data-state="closed">
          <Icon name="chevron-down" size="md" />
        </span>
        <span data-state="open">
          <Icon name="chevron-up" size="md" />
        </span>
      </span>
    </summary>
  );
}

export type DetailsContentProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** What opening reveals. */
  children: ReactNode;
};

export function DetailsContent({ children, className, ...props }: DetailsContentProps) {
  return (
    <div {...props} className={className ? `${detailsParts.content} ${className}` : detailsParts.content}>
      {children}
    </div>
  );
}

export const Details = DetailsRoot as DetailsComponent;
Details.Summary = DetailsSummary;
Details.Content = DetailsContent;
