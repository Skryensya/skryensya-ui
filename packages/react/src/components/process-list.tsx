import { processListParts } from "@skryensya/core/process-list";
import { type LiHTMLAttributes, type OlHTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ProcessListProps = OlHTMLAttributes<HTMLOListElement> & {
  children: ReactNode;
};

/** A static ordered sequence of instructions. Progress state belongs to Steps. */
export function ProcessList({ children, className, ...props }: ProcessListProps) {
  return (
    <ol {...props} className={cx(processListParts.root, className)} role="list">
      {children}
    </ol>
  );
}

export type ProcessListItemProps = Omit<LiHTMLAttributes<HTMLLIElement>, "title"> & {
  children?: ReactNode;
  title: ReactNode;
};

/** One instruction and its arbitrary flow content. */
export function ProcessListItem({ children, className, title, ...props }: ProcessListItemProps) {
  return (
    <li {...props} className={cx(processListParts.item, className)}>
      <div className={processListParts.content}>
        <span className={processListParts.title}>{title}</span>
        {children}
      </div>
    </li>
  );
}
