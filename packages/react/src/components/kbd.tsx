import { kbdParts, type KbdTone, kbdContract } from "@skryensya/core/kbd";
import { type HTMLAttributes } from "react";

/* Derived, never restated: the default lives in the contract. */
const { tone: toneOption } = kbdContract.options;

export type { KbdTone };

export type KbdProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Matches the contract slot: the key legend as plain text. */
  children: string;
  /** `neutral` is a physical keycap. `accent` is the brand-toned label. */
  tone?: KbdTone;
};

/**
 * A single keyboard key, drawn, the ⌘ in a ⌘K hint, the Esc in a palette footer. Renders the native
 * <kbd> element (its semantics are the platform's; the component only adds the look). Static: no state,
 * no machine, so there is no vanilla enhancer, only this wrapper and the core hooks.
 */
export function Kbd({ children, className, tone = toneOption.default, ...props }: KbdProps) {
  const classes = className ? `${kbdParts.root} ${className}` : kbdParts.root;

  return (
    <kbd {...props} className={classes} data-tone={tone}>
      {children}
    </kbd>
  );
}
