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

export type BadgeDotProps = Omit<HTMLAttributes<HTMLSpanElement>, "aria-label"> & {
  tone?: BadgeTone;
  /** What the dot means ("Unread", "Online") — its only accessible content. */
  label: string;
};

export function BadgeDot({ className, label, tone = "neutral", ...props }: BadgeDotProps) {
  const classes = className ? `${badgeParts.root} ${className}` : badgeParts.root;
  return <span {...props} aria-label={label} className={classes} data-dot="" data-tone={tone} role="status" />;
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
