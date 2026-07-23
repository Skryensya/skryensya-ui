import { badgeParts, type BadgeTone } from "@skryensya/core/badge";
import { type HTMLAttributes, type ReactNode } from "react";

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
  tone?: BadgeTone;
};

export function Badge({ children, className, tone = "neutral", ...props }: BadgeProps) {
  const classes = className ? `${badgeParts.root} ${className}` : badgeParts.root;

  return (
    <span {...props} className={classes} data-tone={tone}>
      {children}
    </span>
  );
}
