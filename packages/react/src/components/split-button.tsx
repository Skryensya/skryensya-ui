import { splitButtonContract, splitButtonParts } from "@skryensya/core/split-button";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import type { MenuItem } from "@skryensya/core/menu";
import type { ReactNode } from "react";
import { Menu } from "./menu.js";

/*
 * A BINDING, not a second declaration (decision 28, `button.tsx`'s own precedent): `variant`/
 * `size`'s unions and defaults are read from `splitButtonContract`, never restated. Adding a
 * variant is one edit, in Core — this file, and `split-button.css`'s sibling-selector rules that
 * key off the SAME `data-variant`/`data-size` attributes, pick it up for free.
 */
const { variant: variantOption, size: sizeOption } = splitButtonContract.options;

export type SplitButtonProps = SignatureOptionsOf<typeof splitButtonContract, "SplitButton"> & {
  children: ReactNode;
  /**
   * A composed Menu. Preferred over `menuItems`: it is what lets one tree describe both halves,
   * and it keeps the menu's own contract in charge of the menu instead of this component
   * reassembling it from a flat list.
   */
  menu?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  menuLabel?: string;
  menuItems?: readonly MenuItem[];
  menuIndicator?: ReactNode;
  itemIndicator?: ReactNode;
  onSelect?: (details: { value: string }) => void;
};
export function SplitButton({
  children,
  disabled,
  menu,
  itemIndicator,
  menuIndicator,
  menuItems,
  menuLabel,
  onClick,
  onSelect,
  variant = variantOption.default,
  size = sizeOption.default,
}: SplitButtonProps) {
  return (
    <div className={splitButtonParts.root}>
      <button
        className={`sk-button sk-interactive ${splitButtonParts.primary}`}
        data-variant={variant}
        data-size={size}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
      {menu ?? (
        <Menu
          disabled={disabled}
          indicator={menuIndicator}
          itemIndicator={itemIndicator}
          items={menuItems ?? []}
          label={menuLabel ?? ""}
          onSelect={onSelect}
          // No `trigger`: this is the real split-button pattern — an icon-only dropdown segment,
          // the chevron `Menu` already paints and nothing else, named for a screen reader by
          // `triggerLabel` instead of by visible text (`menu.ts`'s own option doc has the reasoning).
          triggerLabel={menuLabel}
          triggerClassName={splitButtonParts.trigger}
        />
      )}
    </div>
  );
}
