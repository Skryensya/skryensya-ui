import { splitButtonParts } from "@skryensya/core/split-button";
import type { MenuItem } from "@skryensya/core/menu";
import type { ReactNode } from "react";
import { Menu } from "./menu.js";

export type SplitButtonProps = {
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
}: SplitButtonProps) {
  return (
    <div className={splitButtonParts.root}>
      <button
        className={`sk-button sk-interactive ${splitButtonParts.primary}`}
        data-variant="primary"
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
        trigger={<span className="sk-visually-hidden">{menuLabel}</span>}
        triggerClassName={splitButtonParts.trigger}
        />
      )}
    </div>
  );
}
