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

/** Shared appearance: the navigation signature's options (no pressed / disabled). */
type ButtonNavAppearance = SignatureOptionsOf<typeof buttonContract, "Button.navigation"> & {
  children: ReactNode;
  /** Leading slot: icon (or other affordance) before the label. */
  pre?: ReactNode;
  /** Trailing slot: icon (or other affordance) after the label. */
  post?: ReactNode;
};

/** Action signature adds toggle and unavailable state. */
type ButtonActionAppearance = SignatureOptionsOf<typeof buttonContract, "Button.action"> & {
  children: ReactNode;
  pre?: ReactNode;
  post?: ReactNode;
};

/*
 * `href` is the discriminant and the tag switch: every appearance works identically on either host,
 * only the semantics differ (`Button.action` vs `Button.navigation`), so one component picks the tag
 * instead of asking the caller to duplicate the same props on a second export. Passing `href` drops
 * `disabled` (a link cannot be disabled and stay a link) and `pressed` / `type`; omitting it keeps
 * the native button contract.
 */
export type ButtonProps =
  | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
      ButtonActionAppearance & { href?: undefined })
  | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> &
      ButtonNavAppearance & { href: string });

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

/*
 * PROVABLY nothing, which is a different question from `hasTextContent`'s.
 *
 * `children` is required by the contract, and `""` satisfies that requirement and TypeScript both
 * while rendering a 34x44 control with no label, no icon and, on `ghost`, no paint whatsoever:
 * invisible, focusable, clickable. It turned up on the break harness, where the `ghost` twin of the
 * empty button simply was not on the page.
 *
 * The walk above asks "is there text anywhere in here", cannot see through a component boundary, and
 * gets away with it because an icon-only button rendering a text component is a contradiction.
 * Asking the same question of EVERY button would warn on `<Button><Label /></Button>`, which is
 * fine markup. So this asks the narrower one that has no false positives: did the caller hand this
 * button anything at all? An element counts as content whatever it turns out to render.
 */
function rendersNothing(node: ReactNode): boolean {
  if (node === null || node === undefined || typeof node === "boolean") return true;
  if (typeof node === "string") return node.trim().length === 0;
  if (Array.isArray(node)) return node.every(rendersNothing);
  return false;
}

/*
 * A button with no content at all, named or not. `aria-label` does NOT excuse it: a name makes the
 * control announceable, and this one still paints nothing for everybody else, so it is a hole in the
 * page that happens to be reachable by keyboard. Separate from the accessible-name warning below
 * because it is a separate failure with a separate fix - put something in it, or do not render it.
 */
function warnEmptyButton(pre: ReactNode, children: ReactNode, post: ReactNode): void {
  if (!dev) return;
  if (!rendersNothing(pre) || !rendersNothing(children) || !rendersNothing(post)) return;
  console.error(
    "<Button> renders nothing: children is empty and neither `pre` nor `post` was given. " +
      "The control still takes its full size and stays focusable and clickable, and on " +
      "`variant=\"ghost\"` it paints nothing at all. Give it a label, an icon, or do not render it.",
  );
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
}: ButtonProps & { pressed?: boolean }) {
  warnEmptyButton(pre, children, post);
  warnMissingAccessibleName(iconOnly, [props["aria-label"], props["aria-labelledby"]], [pre, children, post]);

  const shared = {
    className: buttonClasses(className),
    "data-sk-button": "",
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
    pressed === undefined || props.href !== undefined
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
    /* `disabled` can still arrive from a loose JS call site; strip it so the anchor stays a link. */
    const { href, disabled: _disabled, ...anchorProps } = props as Extract<ButtonProps, { href: string }> & {
      disabled?: boolean;
    };
    return (
      <a {...anchorProps} {...shared} href={href}>
        {body}
      </a>
    );
  }

  /* Narrowed by hand: a consumer's looser tsconfig (the playground's) does not discriminate the union
     on `href` through the early return above. */
  const { disabled, type = "button", ...buttonProps } = props as Extract<ButtonProps, { href?: undefined }>;
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
