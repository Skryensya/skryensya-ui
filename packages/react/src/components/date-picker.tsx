import { datePickerParts } from "@skryensya/core/date-picker";
import { calendarParts } from "@skryensya/core/calendar";
import type { DateValue } from "@skryensya/core/calendar";
import { datePicker } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, type ReactNode } from "react";
import { useAnchored } from "./anchored.js";
import { CalendarBody } from "./calendar.js";

export type DatePickerProps = {
  id?: string;
  name?: string;
  label?: ReactNode;
  locale?: string;
  timeZone?: string;
  selectionMode?: "single" | "range";
  value?: DateValue[];
  defaultValue?: DateValue[];
  min?: DateValue;
  max?: DateValue;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  placeholder?: string;
  triggerIcon?: ReactNode;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  clearLabel?: string;
  onValueChange?: (details: { value: string[] }) => void;
};

/*
 * DATE PICKER: the editable field (label, input, trigger, clear) plus a popover. The calendar
 * chrome inside the popover is `CalendarBody`, the same component `Calendar` (./calendar.tsx)
 * renders standalone — DatePicker never re-implements the grid, it only supplies the machine
 * instance (popover-mode, not inline) and the field around it.
 */
export function DatePicker({
  clearLabel = "Limpiar",
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
  onValueChange,
  placeholder,
  previousIcon,
  readOnly,
  required,
  selectionMode = "single",
  timeZone = "UTC",
  triggerIcon,
  value,
}: DatePickerProps) {
  const generatedId = useId();
  const service = useMachine(datePicker.machine, {
    id: id ?? generatedId,
    name,
    locale,
    timeZone,
    selectionMode,
    value,
    defaultValue,
    min,
    max,
    disabled,
    readOnly,
    required,
    invalid,
    fixedWeeks: true,
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
        {api.value.length ? (
          <button
            {...api.getClearTriggerProps()}
            aria-label={clearLabel}
            className={`${datePickerParts.clear} sk-button sk-interactive`}
            data-icon-only=""
            data-size="sm"
            data-variant="ghost"
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        <button
          {...api.getTriggerProps()}
          className={`${datePickerParts.trigger} sk-button sk-interactive`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          type="button"
        >
          <span aria-hidden="true">{triggerIcon ?? "▦"}</span>
        </button>
      </div>
      <Portal>
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
