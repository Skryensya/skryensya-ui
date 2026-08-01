import { dialogParts } from "@skryensya/core/dialog";
import type { DialogHTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon.js";

/*
 * DIALOG — the centred modal box, and a binding that is markup and nothing else.
 *
 * No state and no machine, on purpose: the behaviour is the platform's. The consumer calls
 * `showModal()` and the browser owns the top layer, the backdrop, focus trapping and Escape. What
 * the system contributes is the anatomy, which is what makes this a contract both bindings derive
 * from rather than a component one of them implements — the same reason `Select.native` is one.
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
};

export function Dialog({ children, className, closeLabel = "Cerrar", footer, title, ...props }: DialogProps) {
  return (
    <dialog {...props} className={className ? `${dialogParts.root} ${className}` : dialogParts.root}>
      <header className={dialogParts.header}>
        <h2 className={dialogParts.title}>{title}</h2>
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
      <div className={dialogParts.body}>{children}</div>
      {footer ? <footer className={dialogParts.footer}>{footer}</footer> : null}
    </dialog>
  );
}
