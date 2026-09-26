import {
  listboxContract,
  listboxDefaultValue,
  listboxEvents,
  listboxParts,
  type ListboxItem,
  type ListboxOptions,
  type ListboxValueChangeDetails,
} from "@skryensya/core/listbox";
import { listbox } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useMemo, useRef, type ReactNode } from "react";
import { Icon } from "./icon.js";

export type { ListboxItem, ListboxValueChangeDetails } from "@skryensya/core/listbox";

const { orientation: orientationOption, selectionMode: selectionModeOption } = listboxContract.options;

export type ListboxProps = {
  id?: string;
  /** What the list is a choice of. Visible, and the listbox's name. */
  label: ReactNode;
  items: readonly ListboxItem[];
  selectionMode?: ListboxOptions["selectionMode"];
  orientation?: ListboxOptions["orientation"];
  disabled?: boolean;
  /** Controlled selection. */
  value?: string[];
  /** Uncontrolled selection. Without it, every item marked `defaultSelected` starts chosen. */
  defaultValue?: string[];
  onValueChange?: (details: ListboxValueChangeDetails) => void;
  /** The check on a chosen option. Pass `null` for none. */
  itemIndicator?: ReactNode;
};

/** A list of options chosen from in place: always open, single or multiple. */
export function Listbox({
  id,
  label,
  items,
  selectionMode = selectionModeOption.default,
  orientation = orientationOption.default,
  disabled,
  value,
  defaultValue,
  onValueChange,
  itemIndicator,
}: ListboxProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const collection = useMemo(
    () =>
      listbox.collection<ListboxItem>({
        items: [...items],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        isItemDisabled: (item) => Boolean(item.disabled),
      }),
    [items],
  );

  const service = useMachine(listbox.machine, {
    id: id ?? generatedId,
    collection,
    selectionMode,
    orientation,
    disabled,
    /* Spread only when given: a `value` key that is present but undefined still reads as controlled
       to Zag's React adapter, and a click then changes nothing. */
    ...(value !== undefined ? { value } : {}),
    defaultValue: defaultValue ?? listboxDefaultValue(items),
    onValueChange(details: { value: string[] }) {
      const change: ListboxValueChangeDetails = { value: details.value };
      onValueChange?.(change);
      rootRef.current?.dispatchEvent(new CustomEvent(listboxEvents.valueChange, { bubbles: true, detail: change }));
    },
  });
  const api = listbox.connect(service, normalizeProps);

  return (
    <div
      {...api.getRootProps()}
      className={listboxParts.root}
      data-disabled={disabled ? "" : undefined}
      data-orientation={orientation}
      data-selection-mode={selectionMode}
      data-sk-listbox=""
      ref={rootRef}
    >
      <span {...api.getLabelProps()} className={listboxParts.label} data-sk-listbox-label="">
        {label}
      </span>
      <ul {...api.getContentProps()} className={listboxParts.content} data-sk-listbox-content="">
        {items.map((item) => (
          <li
            {...api.getItemProps({ item })}
            className={`${listboxParts.item} sk-interactive`}
            data-default-selected={item.defaultSelected ? "" : undefined}
            data-sk-listbox-item=""
            key={item.value}
          >
            <span {...api.getItemTextProps({ item })} className={listboxParts.itemText} data-sk-listbox-item-text="">
              {item.label}
            </span>
            <span
              {...api.getItemIndicatorProps({ item })}
              aria-hidden="true"
              className={listboxParts.itemIndicator}
              data-sk-listbox-item-indicator=""
            >
              {itemIndicator === undefined ? <Icon name="check" /> : itemIndicator}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
