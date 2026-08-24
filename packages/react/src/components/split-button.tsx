import { splitButtonContract, splitButtonParts } from "@skryensya/core/split-button";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import type { MenuItem } from "@skryensya/core/menu";
import type { ReactNode } from "react";
import { Button } from "./button.js";
import { Menu } from "./menu.js";

/*
 * A BINDING, not a second declaration (decision 28). `action` mirrors `menu`: the contract's own
 * slot, a composed `<Button>` an author can pass directly. The compiled/vanilla path always goes
 * through it (`split-button.ts`'s own template has no "action" part of its own to fall back on).
 * `children`/`variant`/`size` below are this ONE binding's own flat-prop CONVENIENCE for the
 * common case (no `<Button>` composed by hand), building the exact same element `action` would
 * have held: never a second declaration of Button's own fill/radius, just a shortcut past writing
 * `<Button>` out by hand.
 */
const { label: labelOption } = splitButtonContract.options;

export type SplitButtonProps = {
  /**
   * A composed `<Button>`. Preferred over the flat `children`/`variant`/`size` below: it is what
   * lets one tree describe both halves, and it keeps Button's own contract in charge of Button
   * instead of this component reassembling one from flat props. Composing one by hand means also
   * setting `weldEnd` on it directly. This component only sets that automatically for its OWN
   * fallback Button below, the one built from `children`/`variant`/`size`. Compose `menu` by hand
   * too, at the same time: `variant`/`size` below only pair the FALLBACK Button with the FALLBACK
   * Menu trigger, and have no way to read a hand-composed `action`'s own variant back out to
   * repeat it on a still-flat-prop trigger.
   */
  action?: ReactNode;
  children?: ReactNode;
  variant?: "neutral" | "subtle" | "translucent" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  /** The group's own accessible name; see `split-button.ts`'s own `role="group"` doc for why it
   *  is optional. */
  label?: SignatureOptionsOf<typeof splitButtonContract, "SplitButton">["label"];
  /**
   * A composed Menu. Preferred over `menuItems`: it is what lets one tree describe both halves,
   * and it keeps the menu's own contract in charge of the menu instead of this component
   * reassembling it from a flat list. Composing one by hand means also setting `triggerVariant`/
   * `triggerSize`/`triggerWeldStart`/`triggerIconOnly` on it directly. This component only
   * pairs those automatically for its OWN fallback Menu below, the one built from `menuItems`.
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
  label,
  menu,
  itemIndicator,
  menuIndicator,
  menuItems,
  menuLabel,
  onClick,
  onSelect,
  action,
  // "accent" is a split button's own opinion. A dominant, stable action: not Button's OWN
  // default ("neutral"): a plain `<Button>` with no variant given reads as a secondary control, the
  // opposite of what this contract names. Hardcoded here on purpose, not read off Button's contract.
  variant = "accent",
  size = "md",
}: SplitButtonProps) {
  return (
    <div className={splitButtonParts.root} role="group" {...{ [labelOption.attr]: label }}>
      {action ?? (
        // `weldEnd`: the action half of a split button always has a trigger glued to its end
        // side: never author-configurable, unlike `variant`/`size` above.
        <Button variant={variant} size={size} weldEnd disabled={disabled} onClick={onClick} type="button">
          {children}
        </Button>
      )}
      {menu ?? (
        <Menu
          disabled={disabled}
          indicator={menuIndicator}
          itemIndicator={itemIndicator}
          items={menuItems ?? []}
          label={menuLabel ?? ""}
          onSelect={onSelect}
          // No `trigger`: this is the real split-button pattern. An icon-only dropdown segment,
          // the chevron `Menu` already paints and nothing else, named for a screen reader by
          // `triggerLabel` instead of by visible text (`menu.ts`'s own option doc has the reasoning).
          triggerLabel={menuLabel}
          // Pairs the trigger with the action `<Button>` above: same variant, same size, the
          // icon-only SHAPE any bare icon Button already has (button.css's own `[data-icon-only]`),
          // and the one delta that makes it a split-button trigger instead of a bare icon button -
          // its own start edge welded flat against the action's end edge.
          triggerVariant={variant}
          triggerSize={size}
          triggerIconOnly
          triggerWeldStart
        />
      )}
    </div>
  );
}
