import { badgeParts, type BadgeSize, type BadgeTone, badgeContract } from "@skryensya/core/badge";
import { type HTMLAttributes, type ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { size: sizeOption, tone: toneOption, pulse: pulseOption } = badgeContract.options;

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
};

export function Badge({ children, className, size = sizeOption.default, tone = toneOption.default, ...props }: BadgeProps) {
  const classes = className ? `${badgeParts.root} ${className}` : badgeParts.root;

  return (
    <span {...props} className={classes} data-size={size} data-tone={tone}>
      {children}
    </span>
  );
}

export type BadgeDotProps = Omit<HTMLAttributes<HTMLSpanElement>, "aria-label"> & {
  tone?: BadgeTone;
  pulse?: boolean;
  /** What the dot means ("Unread", "Online"). Its only accessible content. */
  label: string;
};

export function BadgeDot({ className, label, pulse = pulseOption.default, tone = toneOption.default, ...props }: BadgeDotProps) {
  const classes = className ? `${badgeParts.root} ${className}` : badgeParts.root;
  return (
    <span
      {...props}
      aria-label={label}
      className={classes}
      data-dot=""
      data-pulse={pulse ? "" : undefined}
      data-tone={tone}
      role="status"
    />
  );
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
