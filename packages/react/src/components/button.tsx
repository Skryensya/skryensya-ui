import { buttonParts, type ButtonSize, type ButtonVariant } from "@skryensya/core/button";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonAppearanceProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * The icon-only shape: a square holding one decorative glyph. With no visible text, the host
   * MUST carry `aria-label` or `aria-labelledby`.
   */
  iconOnly?: boolean;
};

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  ButtonAppearanceProps;

export type ButtonLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> &
  ButtonAppearanceProps & {
    href: string;
  };

type BundlerImportMeta = ImportMeta & { env?: { DEV?: boolean } };

// Vite supplies import.meta.env; plain Node leaves it absent.
const moduleMeta = import.meta as BundlerImportMeta;
const dev = moduleMeta.env?.DEV;

function buttonClasses(className?: string): string {
  const base = `${buttonParts.root} ${buttonParts.interactive}`;
  return className ? `${base} ${className}` : base;
}

function warnMissingAccessibleName(
  component: "Button" | "ButtonLink",
  iconOnly: boolean | undefined,
  label: string | undefined,
  labelledBy: string | undefined,
): void {
  if (!dev || !iconOnly || label || labelledBy) return;
  console.error(
    `<${component} iconOnly> has no accessible name. A square control shows no text, so give it ` +
      'aria-label="…" (or aria-labelledby). The icon child is decorative; the host owns the name.',
  );
}

export function Button({
  children,
  className,
  disabled,
  iconOnly,
  type = "button",
  variant = "neutral",
  size = "md",
  ...props
}: ButtonProps) {
  warnMissingAccessibleName(
    "Button",
    iconOnly,
    props["aria-label"],
    props["aria-labelledby"],
  );

  return (
    <button
      {...props}
      aria-disabled={disabled ? "true" : props["aria-disabled"]}
      className={buttonClasses(className)}
      data-sk-button=""
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

export function ButtonLink({
  children,
  className,
  href,
  iconOnly,
  variant = "neutral",
  size = "md",
  ...props
}: ButtonLinkProps) {
  warnMissingAccessibleName(
    "ButtonLink",
    iconOnly,
    props["aria-label"],
    props["aria-labelledby"],
  );

  return (
    <a
      {...props}
      className={buttonClasses(className)}
      data-sk-button=""
      data-icon-only={iconOnly ? "" : undefined}
      data-size={size}
      data-variant={variant}
      href={href}
    >
      {children}
    </a>
  );
}
