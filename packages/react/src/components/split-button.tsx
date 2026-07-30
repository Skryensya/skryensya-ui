import { splitButtonParts } from "@skryensya/core/split-button";
import type { MenuItem } from "@skryensya/core/menu";
import type { ReactNode } from "react";
import { Menu } from "./menu.js";

export type SplitButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  menuLabel: string;
  menuItems: readonly MenuItem[];
  menuIndicator?: ReactNode;
  itemIndicator?: ReactNode;
  onSelect?: (details: { value: string }) => void;
};
export function SplitButton({
  children,
  disabled,
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
      <Menu
        disabled={disabled}
        indicator={menuIndicator}
        itemIndicator={itemIndicator}
        items={menuItems}
        label={menuLabel}
        onSelect={onSelect}
        trigger={<span className="sk-visually-hidden">{menuLabel}</span>}
        triggerClassName={splitButtonParts.trigger}
      />
    </div>
  );
}
