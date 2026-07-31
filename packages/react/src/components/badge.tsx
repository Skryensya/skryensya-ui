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

export type BadgeDotProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function BadgeDot({ className, tone = "neutral", ...props }: BadgeDotProps) {
  const classes = className ? `${badgeParts.root} ${className}` : badgeParts.root;
  return <span {...props} className={classes} data-dot="" data-tone={tone} />;
}

export type BadgeHolderProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function BadgeHolder({ children, className, ...props }: BadgeHolderProps) {
  const classes = className ? `${badgeParts.holder} ${className}` : badgeParts.holder;
  return (
    <span {...props} className={classes}>
      {children}
    </span>
  );
}
