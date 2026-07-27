import { emptyStateParts } from "@skryensya/core/empty-state";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
};

export function EmptyState({
  actions,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <section className={emptyStateParts.root}>
      {icon ? (
        <div aria-hidden="true" className={emptyStateParts.icon}>
          {icon}
        </div>
      ) : null}
      <h2 className={emptyStateParts.title}>{title}</h2>
      {description ? (
        <div className={emptyStateParts.description}>{description}</div>
      ) : null}
      {actions ? (
        <div className={emptyStateParts.actions}>{actions}</div>
      ) : null}
    </section>
  );
}
