import {
  selectAttrs,
  selectEvents,
  selectParts,
  selectPositioning,
  type SelectOption,
  type SelectOptions,
  type SelectValueChangeDetails,
} from "@skryensya/core/select";
import { select } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useMemo, useId, useRef, type ReactNode, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
import { Icon } from "./icon.js";

export type SelectProps = Omit<SelectOptions, "options"> & {
  /** Visible field label. Slot `text` in the contract; keep it a string here. */
  label?: string;
  /** Decorative closed-state geometry supplied by the consumer's bound icon set. */
  indicator?: ReactNode;
  /** Decorative open-state geometry supplied by the consumer's bound icon set. */
  openIndicator?: ReactNode;
  /** Decorative checked-state geometry supplied by the consumer's bound icon set. */
  itemIndicator?: ReactNode;
  options: readonly SelectOption[];
  /**
   * Where the floating listbox is portalled. Defaults to `document.body`, which is right whenever
   * an ancestor might clip it. Pass a ref to keep the content inside a subtree instead: a preview
   * frame, or a scoped harness.
   *
   * The contract declares `portals: true` so `renderTree` hands this down, and for a while nothing
   * received it: the listbox landed on `document.body`, outside the container G2 measures, and the
   * gate saw React render no floating region at all.
   */
  container?: RefObject<HTMLElement>;
};

export function Select({
  container,
  id,
  name,
  label,
  indicator,
  openIndicator,
  itemIndicator,
  disabled,
  required,
  value,
  defaultValue,
  placeholder = "",
  options,
  onValueChange,
}: SelectProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const collection = useMemo(
    () =>
      select.collection<SelectOption>({
        items: [...options],
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        isItemDisabled: (item) => Boolean(item.disabled),
      }),
    [options],
  );
  /*
   * The contract models a select as holding ONE value, because that is what `data-value` can say in
   * markup. Zag takes arrays. Accepting both here is what lets one usage tree drive both bindings:
   * without it, an emitted `defaultValue="starter"` reached the machine as a string, matched no
   * item, and the trigger silently fell back to the placeholder while Vanilla showed "Starter".
   */
  const asValues = (v: string | readonly string[] | undefined) =>
    v === undefined ? undefined : typeof v === "string" ? [v] : [...v];

  const service = useMachine(select.machine, {
    id: id ?? generatedId,
    collection,
    name,
    disabled,
    required,
    value: asValues(value),
    defaultValue: asValues(defaultValue),
    onValueChange(details: { value: string[] }) {
      const change: SelectValueChangeDetails = { value: details.value };
      onValueChange?.(change);
      rootRef.current?.dispatchEvent(
        new CustomEvent(selectEvents.valueChange, { bubbles: true, detail: change }),
      );
    },
    positioning: selectPositioning,
  });
  const api = select.connect(service, normalizeProps);

  const anchor = useAnchored(id ?? generatedId);

  return (
    <div {...api.getRootProps()} className={selectParts.root} data-sk-select="" ref={rootRef}>
      <select {...api.getHiddenSelectProps()} {...{ [selectAttrs.hidden]: "" }}>
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div {...api.getControlProps()} className={selectParts.control} {...{ [selectAttrs.control]: "" }}>
        {label ? (
          <label {...api.getLabelProps()} className={selectParts.label} {...{ [selectAttrs.label]: "" }}>
            {label}
          </label>
        ) : null}
        <button
          {...api.getTriggerProps()}
          {...anchor.anchor(`${selectParts.trigger} sk-interactive`)}
          {...{ [selectAttrs.trigger]: "" }}
          type="button"
        >
          <span {...api.getValueTextProps()} className={selectParts.value} {...{ [selectAttrs.value]: "" }}>
            {api.valueAsString || placeholder}
          </span>
          <span
            {...api.getIndicatorProps()}
            aria-hidden="true"
            className={selectParts.indicator}
            {...{ [selectAttrs.indicator]: "" }}
          >
            {/*
              * The template paints all three of these, so authored markup always had them and React
              * only did when a caller remembered to pass one. Defaults, not opt-ins: pass null to
              * suppress one deliberately.
              */}
            <span data-state="closed">{indicator ?? <Icon name="chevron-down" />}</span>
            <span data-state="open">{openIndicator ?? <Icon name="chevron-up" />}</span>
          </span>
        </button>
      </div>
      <Portal container={container}>
        <div
          {...anchor.positioner(api.getPositionerProps(), selectParts.positioner)}
          {...{ [selectAttrs.positioner]: "" }}
        >
          <ul {...api.getContentProps()} className={selectParts.content} {...{ [selectAttrs.content]: "" }}>
            {options.map((option) => (
              <li
                {...api.getItemProps({ item: option })}
                /*
                 * Zag's `aria-selected` tracks the COMMITTED value, not the row under
                 * `aria-activedescendant`: same gap fixed in Combobox (`combobox.tsx`), a
                 * different Zag package (`@zag-js/select`, not `@zag-js/combobox`) with the
                 * identical divergence (confirmed reading `select.connect.js`: `"aria-selected":
                 * itemState.selected`). The WAI reference implementation
                 * (`combobox-autocomplete.js`, `setCurrentOptionStyle`) moves `aria-selected="true"`
                 * onto whichever option is highlighted as you arrow through the list, before Enter
                 * commits anything. Select has no multi-select mode, so this applies unconditionally
                 *. Unlike Combobox, there is no "chosen set" reading to preserve. Placed after the
                 * spread so it wins.
                 */
                aria-selected={option.value === api.highlightedValue ? "true" : undefined}
                className={`${selectParts.item} sk-interactive`}
                key={option.value}
                {...{ [selectAttrs.item]: "" }}
              >
                <span
                  {...api.getItemTextProps({ item: option })}
                  className={selectParts.itemText}
                  {...{ [selectAttrs.itemText]: "" }}
                >
                  {option.label}
                </span>
                <span
                  {...api.getItemIndicatorProps({ item: option })}
                  className={selectParts.itemIndicator}
                  {...{ [selectAttrs.itemIndicator]: "" }}
                >
                  {itemIndicator ?? <Icon name="check" />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  );
}
