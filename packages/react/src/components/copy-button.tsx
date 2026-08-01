import { copyButtonAttrs, copyButtonContract, copyButtonParts } from "@skryensya/core/copy-button";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon } from "./icon.js";

/*
 * COPY BUTTON, the React half — which did not exist until now.
 *
 * The Vanilla enhancer has been shipping for a while and nothing on this side matched it, so the
 * component could not be published as a contract at all: a contract names a React export, G1 checks
 * that it exists, and G2 compares the two bindings. One binding is not a contract, it is a script.
 *
 * The behaviour is copied from `packages/vanilla/src/components/copy-button.ts` deliberately, down
 * to the 1800ms window and the `execCommand` fallback, because the two have to agree about what a
 * failed copy looks like — not only about what the markup is.
 */

/** Long enough to read the confirmation, short enough that the button is idle again when reused. */
const FEEDBACK_DURATION = 1800;

type CopyState = "copied" | "error";

/** The clipboard, with the pre-`navigator.clipboard` path still under it. */
async function writeClipboard(text: string): Promise<boolean> {
  const fallback = () => {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("aria-hidden", "true");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = typeof document.execCommand === "function" && document.execCommand("copy");
    field.remove();
    return copied;
  };

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return fallback();
  } catch {
    return fallback();
  }
}

/* The button paint comes from the contract, so Core stays the only place its values are defined —
   the root is a `.sk-button` and that sheet reads these exact attributes. */
export type CopyButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> &
  Pick<SignatureOptionsOf<typeof copyButtonContract, "CopyButton">, "variant" | "size" | "iconOnly"> & {
  /** The id of the element whose text is copied. Read at click time, like the enhancer does. */
  target: string;
  /** The resting label. */
  children?: ReactNode;

  successLabel?: string;
  errorLabel?: string;
  successAriaLabel?: string;
  errorAriaLabel?: string;
};

export function CopyButton({
  children = "Copiar",
  className,
  errorAriaLabel,
  errorLabel = "No se pudo copiar",
  successAriaLabel,
  successLabel = "Copiado",
  // Resolved, not left absent: the contract declares these defaults and the emitter writes them
  // into markup, so leaving them undefined here made the two bindings differ on an untouched button.
  size = "md",
  iconOnly,
  variant = "neutral",
  target,
  "aria-label": ariaLabel,
  ...props
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState | undefined>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The timer outlives a fast unmount otherwise, and setting state on a gone button throws.
  useEffect(() => () => clearTimeout(timer.current), []);

  const idleAriaLabel = ariaLabel ?? (typeof children === "string" ? children : undefined);
  const currentAriaLabel =
    state === "copied"
      ? (successAriaLabel ?? successLabel)
      : state === "error"
        ? (errorAriaLabel ?? errorLabel)
        : idleAriaLabel;

  return (
    <button
      {...props}
      aria-label={currentAriaLabel}
      className={[copyButtonParts.root, "sk-button", "sk-interactive", className]
        .filter(Boolean)
        .join(" ")}
      onClick={(event) => {
        props.onClick?.(event);
        const text = document.getElementById(target)?.textContent;
        const settle = (next: CopyState) => {
          setState(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setState(undefined), FEEDBACK_DURATION);
        };
        if (!text) {
          settle("error");
          return;
        }
        void writeClipboard(text).then((copied) => settle(copied ? "copied" : "error"));
      }}
      data-icon-only={iconOnly ? "" : undefined}
      data-size={size}
      data-variant={variant}
      type="button"
      {...{ [copyButtonAttrs.target]: target, [copyButtonAttrs.state]: state }}
    >
      {/* BOTH icons are always rendered and the stylesheet shows one, off the root's state
          attribute — the enhancer has no runtime to swap an icon with, so neither does this. */}
      <span aria-hidden="true" className={copyButtonParts.icon} {...{ [copyButtonAttrs.icon]: "idle" }}>
        <Icon name="copy" />
      </span>
      <span aria-hidden="true" className={copyButtonParts.icon} {...{ [copyButtonAttrs.icon]: "copied" }}>
        <Icon name="check" />
      </span>
      <span aria-live="polite" className={copyButtonParts.label} {...{ [copyButtonAttrs.label]: "" }}>
        {state === "copied" ? successLabel : state === "error" ? errorLabel : children}
      </span>
    </button>
  );
}
