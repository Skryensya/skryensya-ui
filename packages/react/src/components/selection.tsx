import {
  checkboxParts,
  selectionParts,
  type CheckboxGroupValueChangeDetails,
  type CheckedChangeDetails,
  type CheckedState,
  type RadioGroupOrientation,
  type RadioValueChangeDetails,
} from "@skryensya/core/selection";
import { forwardRef, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon } from "./icon.js";

function classes(...values: readonly (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

/** Check + remove from the icon set, shared with TileCheckbox so both paint one control. */
export function CheckboxIndicators() {
  return (
    <>
      <span className={selectionParts.checkboxIndicator} data-state="checked">
        <Icon name="check" size="sm" />
      </span>
      <span className={selectionParts.checkboxIndicator} data-state="indeterminate">
        <Icon name="remove" size="sm" />
      </span>
    </>
  );
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "defaultChecked" | "onChange" | "type"> & {
  checked?: CheckedState;
  children?: ReactNode;
  defaultChecked?: CheckedState;
  defaultIndeterminate?: boolean;
  onCheckedChange?: (details: CheckedChangeDetails) => void;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, children, className, defaultChecked, defaultIndeterminate, disabled, onCheckedChange, ...props },
  ref,
) {
  const input = useRef<HTMLInputElement>(null);
  const controlled = checked !== undefined;

  useEffect(() => {
    if (controlled && input.current) input.current.indeterminate = checked === "indeterminate";
  }, [checked, controlled]);

  const setRef = (node: HTMLInputElement | null) => {
    input.current = node;
    if (node) node.indeterminate = !controlled && (defaultChecked === "indeterminate" || defaultIndeterminate === true);
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.({ checked: event.currentTarget.indeterminate ? "indeterminate" : event.currentTarget.checked });
  };

  return (
    <label className={classes(selectionParts.checkbox, className)}>
      <input
        {...props}
        checked={controlled ? checked === true : undefined}
        className={selectionParts.checkboxInput}
        // `undefined` when controlled, never `false`: React reads a present `defaultChecked` as the
        // author asking for an uncontrolled input, and warns that the element is both at once.
        defaultChecked={controlled ? undefined : defaultChecked === true}
        disabled={disabled}
        onChange={onChange}
        ref={setRef}
        type="checkbox"
      />
      <span aria-hidden="true" className={classes(selectionParts.checkboxControl, "sk-interactive")}>
        <CheckboxIndicators />
      </span>
      {children ? <span className={selectionParts.checkboxLabel}>{children}</span> : null}
    </label>
  );
});

export type CheckboxGroupItem = {
  defaultChecked?: boolean;
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

export type CheckboxGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  defaultValue?: readonly string[];
  disabled?: boolean;
  items: readonly CheckboxGroupItem[];
  label: ReactNode;
  name: string;
  onValueChange?: (details: CheckboxGroupValueChangeDetails) => void;
  orientation?: RadioGroupOrientation;
  required?: boolean;
  value?: readonly string[];
};

/**
 * All / none / some over the ELIGIBLE children. A disabled box nobody can reach is not a vote, so
 * it cannot be what holds the parent back from reading "all".
 */
function groupState(items: readonly CheckboxGroupItem[], selected: ReadonlySet<string>): CheckedState {
  const eligible = items.filter((item) => !item.disabled);
  if (eligible.length === 0) return false;
  if (eligible.every((item) => selected.has(item.value))) return true;
  return eligible.some((item) => selected.has(item.value)) ? "indeterminate" : false;
}

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup(
  { className, defaultValue, disabled, items, label, name, onValueChange, orientation = "vertical", required, value, ...props },
  ref,
) {
  const labelId = useId();
  // Composed with each item's OWN value (already required to be unique — it is the entries' `key`),
  // not an index: `aria-controls` on the parent, the WAI-ARIA mixed-checkbox pattern's own
  // relationship attribute naming which children it speaks for. `useId()` cannot run inside the
  // `.map()` below (the Hooks rule), so one call here is the stable base every item's id derives
  // from instead.
  const itemsIdBase = useId();
  const itemId = (item: CheckboxGroupItem) => `${itemsIdBase}-${item.value}`;
  const controlled = value !== undefined;
  const parent = useRef<HTMLInputElement>(null);

  /*
   * Seeded from the ITEMS' own defaults, not only from `defaultValue`: which children start checked
   * is per-child data in this contract (there is no group `value` the way RadioGroup has one), and
   * an author who wrote `defaultChecked` on two entries would otherwise watch React render them
   * unchecked while the authored markup renders them checked. `defaultValue` is the shorthand for
   * saying the same thing once at the top, and it WINS when both are given: it is the more specific
   * statement, made about this group rather than about an entry that may be shared.
   */
  const [uncontrolled, setUncontrolled] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        defaultValue ?? items.filter((item) => item.defaultChecked).map((item) => item.value),
      ),
  );
  const selected = useMemo(() => (controlled ? new Set(value) : uncontrolled), [controlled, uncontrolled, value]);
  const state = groupState(items, selected);

  /*
   * `indeterminate` is a DOM property with no attribute behind it, so React cannot render it and no
   * amount of JSX will: it has to be assigned after every commit that could have changed the answer.
   */
  useEffect(() => {
    if (parent.current) parent.current.indeterminate = state === "indeterminate";
  }, [state]);

  const commit = (next: ReadonlySet<string>) => {
    if (!controlled) setUncontrolled(next);
    onValueChange?.({
      // In the items' own order, never the Set's insertion order: the caller sees the group the way
      // it is written on screen, and a value that gets unchecked and rechecked does not move.
      value: items.filter((item) => next.has(item.value)).map((item) => item.value),
      checked: groupState(items, next),
    });
  };

  const onParentChange = (event: ChangeEvent<HTMLInputElement>) => {
    // The browser clears `indeterminate` on interaction, so "some" resolves to "check them all" on
    // the first click and "uncheck them all" on the next: the same native behaviour the enhancer
    // gets for free, restated here because React owns the value rather than the DOM.
    const next = event.currentTarget.checked;
    const eligible = items.filter((item) => !item.disabled).map((item) => item.value);
    const values = new Set(selected);
    for (const item of eligible) {
      if (next) values.add(item);
      else values.delete(item);
    }
    commit(values);
  };

  const onItemChange = (item: CheckboxGroupItem) => (event: ChangeEvent<HTMLInputElement>) => {
    const values = new Set(selected);
    if (event.currentTarget.checked) values.add(item.value);
    else values.delete(item.value);
    commit(values);
  };

  return (
    <div
      {...props}
      aria-labelledby={labelId}
      className={classes(checkboxParts.checkboxGroup, className)}
      data-orientation={orientation}
      ref={ref}
      role="group"
    >
      <label className={selectionParts.checkbox}>
        {/* No `name` and no `value`: the parent submits nothing, the children carry the payload. */}
        <input
          aria-controls={items.map(itemId).join(" ")}
          checked={state === true}
          className={selectionParts.checkboxInput}
          disabled={disabled}
          onChange={onParentChange}
          ref={parent}
          type="checkbox"
        />
        <span aria-hidden="true" className={classes(selectionParts.checkboxControl, "sk-interactive")}>
          <CheckboxIndicators />
        </span>
        <span className={selectionParts.checkboxLabel} id={labelId}>
          {label}
        </span>
      </label>
      <div className={checkboxParts.checkboxGroupItems}>
        {items.map((item) => (
          <label className={selectionParts.checkbox} key={item.value}>
            <input
              checked={selected.has(item.value)}
              className={selectionParts.checkboxInput}
              disabled={disabled || item.disabled}
              id={itemId(item)}
              name={name}
              onChange={onItemChange(item)}
              required={required}
              type="checkbox"
              value={item.value}
            />
            <span aria-hidden="true" className={classes(selectionParts.checkboxControl, "sk-interactive")}>
              <CheckboxIndicators />
            </span>
            <span className={selectionParts.checkboxLabel}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
});

export type RadioGroupItem = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

export type RadioGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  defaultValue?: string | null;
  disabled?: boolean;
  items: readonly RadioGroupItem[];
  name: string;
  onValueChange?: (details: RadioValueChangeDetails) => void;
  orientation?: RadioGroupOrientation;
  required?: boolean;
  value?: string | null;
};

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { className, defaultValue, disabled, items, name, onValueChange, orientation = "vertical", required, value, ...props },
  ref,
) {
  const controlled = value !== undefined;

  /*
   * On each input rather than delegated on the group. A change event does bubble, so one handler on
   * the wrapper would fire, but React checks per element whether a `checked` input can be typed
   * into, sees no handler of its own, and renders every option read-only.
   */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.checked) onValueChange?.({ value: event.currentTarget.value });
  };

  return (
    <div {...props} aria-orientation={orientation} className={classes(selectionParts.radioGroup, className)} data-orientation={orientation} ref={ref} role="radiogroup">
      {items.map((item) => (
        <label className={selectionParts.radio} key={item.value}>
          <input
            checked={controlled ? value === item.value : undefined}
            className={selectionParts.radioInput}
            defaultChecked={controlled ? undefined : defaultValue === item.value}
            disabled={disabled || item.disabled}
            name={name}
            onChange={onChange}
            required={required}
            type="radio"
            value={item.value}
          />
          <span aria-hidden="true" className={selectionParts.radioControl}>
            <span className={selectionParts.radioIndicator} />
          </span>
          <span className={selectionParts.radioLabel}>{item.label}</span>
        </label>
      ))}
    </div>
  );
});

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "defaultChecked" | "onChange" | "role" | "type"> & {
  checked?: boolean;
  children?: ReactNode;
  defaultChecked?: boolean;
  onCheckedChange?: (details: CheckedChangeDetails) => void;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { checked, children, className, defaultChecked, disabled, onCheckedChange, ...props },
  ref,
) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => onCheckedChange?.({ checked: event.currentTarget.checked });

  return (
    <label className={classes(selectionParts.switch, className)}>
      <input {...props} checked={checked} className={selectionParts.switchInput} defaultChecked={defaultChecked} disabled={disabled} onChange={onChange} ref={ref} role="switch" type="checkbox" />
      <span aria-hidden="true" className={selectionParts.switchControl}>
        <span className={selectionParts.switchThumb} />
      </span>
      {children ? <span className={selectionParts.switchLabel}>{children}</span> : null}
    </label>
  );
});
