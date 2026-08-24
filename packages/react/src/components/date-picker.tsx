import {
  datePickerContract,
  datePickerParts,
  defaultContentLabel,
  defaultTriggerLabel,
} from "@skryensya/core/date-picker";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import {
  calendarParts,
  defaultDayLabel,
  defaultNextTriggerLabel,
  defaultPrevTriggerLabel,
  defaultViewTriggerLabel,
  unusedIntlTranslations,
} from "@skryensya/core/calendar";
import type { DateValue, DateView, DayTableCellState } from "@skryensya/core/calendar";
import { datePicker } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, type ReactNode, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
import { asDate, asDates, CalendarBody } from "./calendar.js";
import { Icon } from "./icon.js";

// `selectionMode` comes from the contract, so Core stays the only place its values are defined.
export type DatePickerProps = Pick<
  SignatureOptionsOf<typeof datePickerContract, "DatePicker">,
  "selectionMode"
> & {
  /** Where the popover is portalled. Absent it goes to the body: see `ComboboxProps.container`. */
  container?: RefObject<HTMLElement>;
  id?: string;
  name?: string;
  label?: ReactNode;
  locale?: string;
  timeZone?: string;
  /* Dates as `DateValue` OR as the ISO strings authored markup carries: see `CalendarProps`. */
  value?: readonly (DateValue | string)[] | string;
  defaultValue?: readonly (DateValue | string)[] | string;
  min?: DateValue | string;
  max?: DateValue | string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  placeholder?: string;
  triggerIcon?: ReactNode;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  clearLabel?: string;
  /** Accessible name for the calendar-icon trigger, by open state. Default is locale-aware. */
  triggerLabel?: (open: boolean) => string;
  /** Accessible name for the popover holding the calendar. Default is locale-aware. */
  contentLabel?: string;
  /** Accessible name for a day cell, by state. Default is locale-aware. */
  dayLabel?: (state: DayTableCellState) => string;
  /** Accessible name for the day/month/year view-switch button. */
  viewTriggerLabel?: (view: DateView) => string;
  /** Accessible name for "go back". Previous month/year/decade depending on the open view. */
  prevTriggerLabel?: (view: DateView) => string;
  /** Accessible name for "go forward". Next month/year/decade depending on the open view. */
  nextTriggerLabel?: (view: DateView) => string;
  onValueChange?: (details: { value: string[] }) => void;
};

/*
 * DATE PICKER: the editable field (label, input, trigger, clear) plus a popover. The calendar
 * chrome inside the popover is `CalendarBody`, the same component `Calendar` (./calendar.tsx)
 * renders standalone: DatePicker never re-implements the grid, it only supplies the machine
 * instance (popover-mode, not inline) and the field around it.
 */
export function DatePicker({
  clearLabel = "Limpiar",
  container,
  contentLabel,
  dayLabel,
  defaultValue,
  disabled,
  id,
  invalid,
  label,
  locale = "es",
  max,
  min,
  name,
  nextIcon,
  nextTriggerLabel,
  onValueChange,
  placeholder,
  prevTriggerLabel,
  previousIcon,
  readOnly,
  required,
  selectionMode = "single",
  timeZone = "UTC",
  triggerIcon,
  triggerLabel,
  value,
  viewTriggerLabel,
}: DatePickerProps) {
  const generatedId = useId();
  const service = useMachine(datePicker.machine, {
    id: id ?? generatedId,
    name,
    locale,
    timeZone,
    selectionMode,
    value: asDates(value),
    defaultValue: asDates(defaultValue),
    min: asDate(min),
    max: asDate(max),
    disabled,
    readOnly,
    required,
    invalid,
    fixedWeeks: true,
    translations: {
      ...unusedIntlTranslations(),
      trigger: triggerLabel ?? defaultTriggerLabel(locale),
      content: contentLabel ?? defaultContentLabel(locale),
      dayCell: dayLabel ?? defaultDayLabel(locale),
      viewTrigger: viewTriggerLabel ?? defaultViewTriggerLabel(locale),
      prevTrigger: prevTriggerLabel ?? defaultPrevTriggerLabel(locale),
      nextTrigger: nextTriggerLabel ?? defaultNextTriggerLabel(locale),
    },
    onValueChange(details) {
      onValueChange?.({ value: details.valueAsString });
    },
  });
  const api = datePicker.connect(service, normalizeProps);

  /* El ancla es el control entero (input + botones), no el botón del calendario: el panel se alinea
   * con el campo, que es lo que el calendario está editando. */
  const anchor = useAnchored(id ?? generatedId);
  const inputCount = selectionMode === "range" ? 2 : 1;

  return (
    <div
      {...api.getRootProps()}
      className={datePickerParts.root}
      data-selection-mode={selectionMode}
    >
      {label ? (
        <label {...api.getLabelProps()} className={datePickerParts.label}>
          {label}
        </label>
      ) : null}
      <div {...api.getControlProps()} {...anchor.anchor(datePickerParts.control)}>
        {Array.from({ length: inputCount }, (_, index) => (
          <input
            {...api.getInputProps({ index })}
            className={datePickerParts.input}
            key={index}
            placeholder={placeholder}
          />
        ))}
        {/* Rendered-and-hidden, not conditional: the enhancer patches authored markup and can only
            toggle `hidden`, so that is what the contract's template can say. */}
        <button
          {...api.getClearTriggerProps()}
          aria-label={clearLabel}
          className={`${datePickerParts.clear} sk-button sk-interactive`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          hidden={api.value.length === 0}
          type="button"
        >
          <Icon name="close" size="sm" />
        </button>
        <button
          {...api.getTriggerProps()}
          className={`${datePickerParts.trigger} sk-button sk-interactive`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          type="button"
        >
          {triggerIcon ?? <Icon name="calendar" size="sm" />}
        </button>
      </div>
      <Portal container={container}>
        <div {...anchor.positioner(api.getPositionerProps(), datePickerParts.positioner)}>
          <div
            {...api.getContentProps()}
            className={`${datePickerParts.content} ${calendarParts.root}`}
          >
            <CalendarBody
              api={api}
              locale={locale}
              nextIcon={nextIcon}
              previousIcon={previousIcon}
            />
          </div>
        </div>
      </Portal>
    </div>
  );
}

export type NativeDatePickerProps = {
  label: ReactNode;
  name?: string;
  locale?: string;
  id?: string;
};

/*
 * THE NATIVE DATE FIELD: the layer that works with no script at all.
 *
 * A real `<input type="date">` inside the same field chrome, so the enhanced control and this one
 * read as the SAME field rather than two designs. The browser owns the picker, the keyboard, the
 * locale format and the form; the system contributes the label wiring and the box around it.
 *
 * Its own signature rather than an option on `DatePicker`, for the reason `Select.native` is one:
 * choosing between them is choosing who owns the behaviour, and no flag should be able to stand in
 * for that decision.
 */
export function NativeDatePicker({ id, label, locale, name }: NativeDatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={datePickerParts.root}>
      {/* Named through `aria-labelledby` rather than `for`/`id`: see the contract, where the
          reason is the shared stage rather than the markup. */}
      <label className={datePickerParts.label} id={`${inputId}-label`}>
        {label}
      </label>
      <div className={datePickerParts.control}>
        <input
          aria-labelledby={`${inputId}-label`}
          className={datePickerParts.input}
          lang={locale}
          name={name}
          type="date"
        />
      </div>
    </div>
  );
}
