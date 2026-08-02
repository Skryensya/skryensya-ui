import { detailsParts } from "@skryensya/core/details";
import type { HTMLAttributes, ReactNode } from "react";

/*
 * DETAILS — markup and nothing else, because the behaviour is the platform's.
 *
 * `<details>` opens, closes, takes focus and is announced with no script. A `name` shared across
 * siblings makes the BROWSER keep one open at a time, which is what an accordion's coordinator
 * exists to do — so there is no machine here and nothing to enhance, exactly as with
 * `Select.native` and `DatePicker.native`.
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
  summary: ReactNode;
  children: ReactNode;
  name?: string;
  open?: boolean;
};

export function Details({ children, className, name, open, summary, ...props }: DetailsProps) {
  return (
    <details
      {...props}
      className={className ? `${detailsParts.root} ${className}` : detailsParts.root}
      name={name}
      open={open}
    >
      <summary className={`${detailsParts.summary} sk-interactive`}>{summary}</summary>
      <div className={detailsParts.content}>{children}</div>
    </details>
  );
}
