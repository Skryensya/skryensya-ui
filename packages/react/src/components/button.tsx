import { buttonParts, type ButtonSize, type ButtonVariant } from "@skryensya/core/button";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * The icon-only shape: a square holding one glyph. The child is the icon (decorative, the name is
   * the button's). An icon-only button has no visible text, so it MUST be given an `aria-label` or
   * `aria-labelledby`; without one it renders an unnamed control, which this refuses in development.
   */
  iconOnly?: boolean;
};

export function Button({ children, className, disabled, iconOnly, type = "button", variant = "neutral", size, ...props }: ButtonProps) {
  const classes = className ? `${buttonParts.root} ds-interactive ${className}` : `${buttonParts.root} ds-interactive`;

  // import.meta.env is a bundler global (Vite/vitest); typed via cast so tsc's NodeNext build accepts
  // it and it is simply undefined, falsy, no warning, anywhere that does not define it.
  const dev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  if (dev && iconOnly && !props["aria-label"] && !props["aria-labelledby"]) {
    // Same failure shape as the enhancer's missing-class throw: loud, and with the fix in the message.
    // A warning rather than a throw because a missing label degrades, the button still works, it is
    // just unnamed, where a missing class means nothing renders at all.
    console.error(
      "<Button iconOnly> has no accessible name. A square button shows no text, so give it " +
        'aria-label="…" (or aria-labelledby). The icon child is decorative, the name is the button\'s.',
    );
  }

  return (
    <button
      {...props}
      aria-disabled={disabled ? "true" : props["aria-disabled"]}
      className={classes}
      data-ds-button=""
      data-icon-only={iconOnly ? "" : undefined}
      data-size={size}
      data-variant={variant}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
