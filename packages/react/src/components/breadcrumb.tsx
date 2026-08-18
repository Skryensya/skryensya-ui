import {
  breadcrumbParts,
  type BreadcrumbItem,
} from "@skryensya/core/breadcrumb";
import type { ReactNode } from "react";

export type BreadcrumbProps = {
  items: readonly BreadcrumbItem[];
  label?: string;
  separator?: ReactNode;
};

export function Breadcrumb({
  items,
  label = "Migas de pan",
  separator = "/",
}: BreadcrumbProps) {
  return (
    <nav aria-label={label} className={breadcrumbParts.root}>
      <ol className={breadcrumbParts.list} role="list">
        {items.map((item, index) => {
          const current = item.current ?? index === items.length - 1;
          return (
            <li
              className={breadcrumbParts.item}
              key={`${item.href ?? "current"}-${item.label}`}
            >
              {item.href && !current ? (
                <a className={breadcrumbParts.link} href={item.href} title={item.label}>
                  {item.label}
                </a>
              ) : (
                // The CSS styles `.sk-breadcrumb__current`; without the class the page you are on
                // was the one crumb that never got its own styling.
                <span aria-current={current ? "page" : undefined} className={breadcrumbParts.current}>
                  {item.label}
                </span>
              )}
              {index < items.length - 1 ? (
                <span aria-hidden="true" className={breadcrumbParts.separator}>
                  {separator}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
