import { buttonContract, buttonParts } from "@skryensya/core/button";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { isValidElement, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";

/*
 * A BINDING, not a second declaration (decision 28). Everything below that could be restated here -
 * the variant and size unions, their defaults, the attributes they land on, the classes, and the
 * accessible-name rule. Is read from `buttonContract`. Adding a variant is one edit, in Core.
 */
const {
  variant: variantOption,
  tone: toneOption,
  pressed: pressedOption,
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
  /** Leading slot: icon (or other affordance) before the label. */
  pre?: ReactNode;
  /** Trailing slot: icon (or other affordance) after the label. */
  post?: ReactNode;
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

/*
 * Real text anywhere inside names the button as surely as `aria-label` does, and a visually-hidden
 * label is the one way to name an icon-only control whose MEANING changes (Marquee's Play/Pause
 * swaps which of two labels is `hidden`, so a single static `aria-label` would announce the wrong
 * action half the time). The vanilla enhancer has always accepted it, via its own `textContent`
 * check; this walk is what keeps the two bindings enforcing the same rule instead of React alone
 * rejecting markup the enhancer is happy with. Dev-only, and only on the path that is about to warn.
 */
function hasTextContent(node: ReactNode): boolean {
  if (typeof node === "string") return node.trim().length > 0;
  if (typeof node === "number") return true;
  if (Array.isArray(node)) return node.some(hasTextContent);
  if (isValidElement<{ children?: ReactNode }>(node)) return hasTextContent(node.props.children);
  return false;
}

function warnMissingAccessibleName(
  iconOnly: boolean | undefined,
  present: readonly (string | undefined)[],
  /*
   * EVERYTHING THE BUTTON RENDERS, not only `children`: the `pre` and `post` slots are inside the
   * control, so text in one of them names it exactly as text in `children` does. The vanilla
   * enhancer already agreed, because it reads `root.textContent` and that is the whole element,
   * spans included. Walking `children` alone meant React rejected markup the enhancer accepts, which
   * is the divergence the note above `hasTextContent` says this walk exists to prevent.
   */
  rendered: ReactNode,
): void {
  if (!dev || !iconOnly || present.some(Boolean) || hasTextContent(rendered)) return;
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
  tone = toneOption.default,
  pressed,
  size = sizeOption.default,
  pre,
  post,
  ...props
}: ButtonProps) {
  warnMissingAccessibleName(iconOnly, [props["aria-label"], props["aria-labelledby"]], [pre, children, post]);

  const shared = {
    className: buttonClasses(className),
    [iconOnlyOption.attr]: iconOnly ? iconOnlyOption.trueValue : undefined,
    [weldStartOption.attr]: weldStart ? weldStartOption.trueValue : undefined,
    [weldEndOption.attr]: weldEnd ? weldEndOption.trueValue : undefined,
    [sizeOption.attr]: size,
    [variantOption.attr]: variant,
    [toneOption.attr]: tone,
  } as const;

  /*
   * Three states, and the key is OMITTED rather than set to `undefined` for the third. `shared` is
   * spread after the caller's own props, so a key present with an `undefined` value still wins and
   * erases whatever they passed: a component handing Button a raw `aria-pressed` (marquee's toggle
   * did) silently lost it. Absent means "not a toggle" and has to mean absent from this object too.
   */
  const toggle =
    pressed === undefined
      ? {}
      : { [pressedOption.attr]: pressed ? pressedOption.trueValue : pressedOption.falseValue };

  const body = (
    <>
      {pre != null ? <span className={buttonParts.pre}>{pre}</span> : null}
      {children}
      {post != null ? <span className={buttonParts.post}>{post}</span> : null}
    </>
  );

  if (props.href !== undefined) {
    const { href, ...anchorProps } = props;
    return (
      <a {...anchorProps} {...shared} {...toggle} href={href}>
        {body}
      </a>
    );
  }

  const { disabled, type = "button", ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      {...shared}
      {...toggle}
      aria-disabled={disabled ? "true" : buttonProps["aria-disabled"]}
      disabled={disabled}
      type={type}
    >
      {body}
    </button>
  );
}
