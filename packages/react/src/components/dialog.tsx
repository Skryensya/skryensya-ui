import { dialogParts } from "@skryensya/core/dialog";
import { useId, type DialogHTMLAttributes, type ReactNode } from "react";
import { Icon } from "./icon.js";

/*
 * DIALOG: the centred modal box, and a binding that is markup and nothing else.
 *
 * No state and no machine, on purpose: the behaviour is the platform's. The consumer calls
 * `showModal()` and the browser owns the top layer, the backdrop, focus trapping and Escape. What
 * the system contributes is the anatomy, which is what makes this a contract both bindings derive
 * from rather than a component one of them implements, the same reason `Select.native` is one.
 *
 * The close control is a `<form method="dialog">` rather than an onClick: that is the platform's own
 * way to close a dialog, it works before any script runs, and its `value` lets the opener tell a
 * cancel from a confirm.
 */
export type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  /**
   * Opts into Dialog Vaul: the same box slides from `block-end` and gains a drag handle below the
   * desktop breakpoint (`patterns/dialog-vaul.css`). Dragging itself is the Vanilla enhancer's,
   * same asymmetry as `Vaul`'s own `drawer`: this binding renders markup, never the gesture.
   */
  vaul?: boolean;
  /**
   * Renders as an Alert Dialog: `role="alertdialog"`, `aria-modal` authored explicitly, and
   * `aria-describedby` pointing at the body — for a message needing the user's IMMEDIATE
   * attention (a destructive confirmation, a blocking error), not a dialog that merely contains
   * one. Focus is still the platform's: put `autofocus` on the least destructive action yourself.
   */
  alert?: boolean;
};

export function Dialog({
  alert = false,
  children,
  className,
  closeLabel = "Cerrar",
  footer,
  title,
  vaul = false,
  ...props
}: DialogProps) {
  const titleId = useId();
  const bodyId = useId();

  return (
    <dialog
      {...props}
      aria-describedby={alert ? bodyId : undefined}
      aria-labelledby={titleId}
      aria-modal={alert ? "true" : undefined}
      className={className ? `${dialogParts.root} ${className}` : dialogParts.root}
      data-sk-dialog-vaul={vaul ? "" : undefined}
      // The enhancer's drag axis is generic and defaults to `inline-start` with nothing to read;
      // `dialog-vaul.css` only ever slides from the bottom, so this is not a choice: see core.
      data-edge={vaul ? "block-end" : undefined}
      role={alert ? "alertdialog" : undefined}
    >
      {vaul ? <div aria-hidden="true" data-part="handle" /> : null}
      <header className={dialogParts.header}>
        <h2 className={dialogParts.title} id={titleId}>
          {title}
        </h2>
        <form method="dialog">
          <button
            aria-label={closeLabel}
            className={`${dialogParts.close} sk-button sk-interactive`}
            data-icon-only=""
            data-size="sm"
            data-variant="ghost"
            type="submit"
            value="cancel"
          >
            <Icon name="close" size="sm" />
          </button>
        </form>
      </header>
      <div className={dialogParts.body} id={alert ? bodyId : undefined}>
        {children}
      </div>
      {/* A form, not a <footer>: `method="dialog"` closes and reports which button did it. */}
      {footer ? (
        <form className={dialogParts.footer} method="dialog">
          {footer}
        </form>
      ) : null}
    </dialog>
  );
}
