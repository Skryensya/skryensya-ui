import { buttonContract, buttonParts } from "@skryensya/core/button";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";

/*
 * A BINDING, not a second declaration (decision 28). Everything below that could be restated here —
 * the variant and size unions, their defaults, the attributes they land on, the classes, and the
 * accessible-name rule — is read from `buttonContract`. Adding a variant is one edit, in Core.
 */
const {
  variant: variantOption,
  size: sizeOption,
  iconOnly: iconOnlyOption,
  weldStart: weldStartOption,
  weldEnd: weldEndOption,
} = buttonContract.options;
const actionTemplate = buttonContract.signatures["Button.action"].template;
const iconOnlyRule = buttonContract.a11y[0];

/** The appearance props ARE the action signature's options. `href` is added by the union below. */
type ButtonAppearanceProps = SignatureOptionsOf<typeof buttonContract, "Button.action"> & {
  children: ReactNode;
};

/*
 * `href` is the discriminant and the tag switch: every appearance works identically on either host,
 * only the semantics differ (`Button.action` vs `Button.navigation`), so one component picks the tag
 * instead of asking the caller to duplicate the same props on a second export. Passing `href` drops
 * `disabled` (a link cannot be disabled and stay a link) and `type`; omitting it keeps the native
 * button contract.
 */
export type ButtonProps =
  | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
      ButtonAppearanceProps & { href?: undefined })
  | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> &
      ButtonAppearanceProps & { href: string });

type BundlerImportMeta = ImportMeta & { env?: { DEV?: boolean } };

// Vite supplies import.meta.env; plain Node leaves it absent.
const moduleMeta = import.meta as BundlerImportMeta;
const dev = moduleMeta.env?.DEV;

const baseClasses = [buttonParts[actionTemplate.part], ...actionTemplate.also].join(" ");

function buttonClasses(className?: string): string {
  return className ? `${baseClasses} ${className}` : baseClasses;
}

function warnMissingAccessibleName(
  iconOnly: boolean | undefined,
  present: readonly (string | undefined)[],
): void {
  if (!dev || !iconOnly || present.some(Boolean)) return;
  console.error(
    `<Button iconOnly> has no accessible name. ${iconOnlyRule.because} Give it one of: ` +
      `${iconOnlyRule.requiresOneOf.join(", ")}.`,
  );
}

export function Button({
  children,
  className,
  iconOnly,
  weldStart,
  weldEnd,
  variant = variantOption.default,
  size = sizeOption.default,
  ...props
}: ButtonProps) {
  warnMissingAccessibleName(iconOnly, [props["aria-label"], props["aria-labelledby"]]);

  const shared = {
    className: buttonClasses(className),
    [iconOnlyOption.attr]: iconOnly ? iconOnlyOption.trueValue : undefined,
    [weldStartOption.attr]: weldStart ? weldStartOption.trueValue : undefined,
    [weldEndOption.attr]: weldEnd ? weldEndOption.trueValue : undefined,
    [sizeOption.attr]: size,
    [variantOption.attr]: variant,
  } as const;

  if (props.href !== undefined) {
    const { href, ...anchorProps } = props;
    return (
      <a {...anchorProps} {...shared} href={href}>
        {children}
      </a>
    );
  }

  const { disabled, type = "button", ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      {...shared}
      aria-disabled={disabled ? "true" : buttonProps["aria-disabled"]}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
