import {
  calendarParts,
  getTwoLetterWeekdayLabel,
  type DateValue,
} from "@skryensya/core/calendar";
import { datePicker } from "@skryensya/core/machines";
import { normalizeProps, useMachine, type PropTypes } from "@zag-js/react";
import { useId, type MouseEvent, type ReactNode } from "react";

// Sin depender de `@zag-js/date-picker` directamente (react no lo trae como dependencia propia,
// sólo core la reexporta vía `machines.ts`): el tipo del `api` sale de la misma función `connect`.
type DatePickerApi = ReturnType<typeof datePicker.connect<PropTypes>>;

/*
 * The calendar BODY, shared between the standalone `Calendar` below and `DatePicker`'s popover:
 * header (prev/next + the view-switch button) and the three grids (day/month/year). No native
 * `<select>`: the heading itself is `api.getViewTriggerProps()`, a button that steps
 * day → month → year on click, and clicking a month/year cell steps back down.
 */
export function CalendarBody({
  api,
  locale,
  previousIcon,
  nextIcon,
  viewIcon,
}: {
  api: DatePickerApi;
  locale: string;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  viewIcon?: ReactNode;
}) {
  const headingLabel =
    api.view === "day"
      ? api.format(api.visibleRange.start, { month: "long", year: "numeric" })
      : api.view === "month"
        ? api.format(api.visibleRange.start, { year: "numeric" })
        : (() => {
            const decade = api.getDecade();
            return `${decade.start ?? ""}–${decade.end ?? ""}`;
          })();

  /*
   * The year view is the top of the escalation (day → month → year, clamped there): clicking the
   * trigger again is normally a no-op, a dead end that still looks clickable. Repurpose it as a
   * cancel instead — jump straight back to day view on the REAL current month, not wherever the
   * decade grid happened to be browsing, since "cancel" should mean "never mind", not "one level
   * down from here".
   */
  function goToCurrentMonth() {
    const today = new Date();
    const target = api.focusedValue.set({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });
    api.setFocusedValue(target);
    api.setView("day");
  }

  const defaultViewTriggerProps = api.getViewTriggerProps();
  const viewTriggerProps =
    api.view === "year"
      ? {
          ...defaultViewTriggerProps,
          "aria-label": "Volver al mes actual",
          onClick: (event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            goToCurrentMonth();
          },
        }
      : defaultViewTriggerProps;

  return (
    <>
      <div className={calendarParts.header}>
        <button
          {...api.getPrevTriggerProps()}
          className={`${calendarParts.previous} sk-button sk-interactive`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          type="button"
        >
          <span aria-hidden="true">{previousIcon ?? "‹"}</span>
        </button>
        <button
          {...viewTriggerProps}
          className={`${calendarParts.viewTrigger} sk-button sk-interactive`}
          data-size="sm"
          data-variant="ghost"
          type="button"
        >
          {headingLabel}
          <span aria-hidden="true">{viewIcon ?? "▾"}</span>
        </button>
        <button
          {...api.getNextTriggerProps()}
          className={`${calendarParts.next} sk-button sk-interactive`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          type="button"
        >
          <span aria-hidden="true">{nextIcon ?? "›"}</span>
        </button>
      </div>

      {api.view === "day" ? (
        <table {...api.getTableProps()} className={calendarParts.table}>
          <thead
            {...api.getTableHeadProps()}
            className={calendarParts.tableHeader}
          >
            <tr {...api.getTableRowProps()}>
              {api.weekDays.map((day) => (
                <th scope="col" key={day.short}>
                  <abbr title={day.long}>
                    {getTwoLetterWeekdayLabel(day, locale)}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            {...api.getTableBodyProps()}
            className={calendarParts.tableBody}
          >
            {api.weeks.map((week, weekIndex) => (
              <tr {...api.getTableRowProps()} key={weekIndex}>
                {week.map((day) => {
                  const props = { value: day, visibleRange: api.visibleRange };
                  return (
                    <td
                      {...api.getDayTableCellProps(props)}
                      className={calendarParts.cell}
                      key={day.toString()}
                    >
                      <button
                        {...api.getDayTableCellTriggerProps(props)}
                        className={`${calendarParts.cellTrigger} sk-button sk-interactive`}
                        data-size="sm"
                        data-variant="ghost"
                        type="button"
                      >
                        {day.day}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ) : api.view === "month" ? (
        <table
          {...api.getTableProps({ view: "month" })}
          className={`${calendarParts.table} ${calendarParts.monthGrid}`}
        >
          <tbody
            {...api.getTableBodyProps({ view: "month" })}
            className={calendarParts.tableBody}
          >
            {api.getMonthsGrid({ columns: 4, format: "short" }).map((row, rowIndex) => (
              <tr {...api.getTableRowProps({ view: "month" })} key={rowIndex}>
                {row.map((month) => (
                  <td
                    {...api.getMonthTableCellProps({ value: month.value, columns: 4 })}
                    className={calendarParts.cell}
                    key={month.value}
                  >
                    <button
                      {...api.getMonthTableCellTriggerProps({ value: month.value })}
                      className={`${calendarParts.cellTrigger} sk-button sk-interactive`}
                      data-size="sm"
                      data-variant="ghost"
                      disabled={month.disabled}
                      type="button"
                    >
                      {month.label}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table
          {...api.getTableProps({ view: "year" })}
          className={`${calendarParts.table} ${calendarParts.yearGrid}`}
        >
          <tbody
            {...api.getTableBodyProps({ view: "year" })}
            className={calendarParts.tableBody}
          >
            {api.getYearsGrid({ columns: 4 }).map((row, rowIndex) => (
              <tr {...api.getTableRowProps({ view: "year" })} key={rowIndex}>
                {row.map((year) => (
                  <td
                    {...api.getYearTableCellProps({ value: year.value, columns: 4 })}
                    className={calendarParts.cell}
                    key={year.value}
                  >
                    <button
                      {...api.getYearTableCellTriggerProps({ value: year.value })}
                      className={`${calendarParts.cellTrigger} sk-button sk-interactive`}
                      data-size="sm"
                      data-variant="ghost"
                      disabled={year.disabled}
                      type="button"
                    >
                      {year.label}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export type CalendarProps = {
  id?: string;
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
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  viewIcon?: ReactNode;
  onValueChange?: (details: { value: string[] }) => void;
};

/** Standalone calendar grid: no field, no popover — the same machine as DatePicker, `inline: true`. */
export function Calendar({
  defaultValue,
  disabled,
  id,
  label,
  locale = "es",
  max,
  min,
  nextIcon,
  onValueChange,
  previousIcon,
  readOnly,
  selectionMode = "single",
  timeZone = "UTC",
  value,
  viewIcon,
}: CalendarProps) {
  const generatedId = useId();
  const service = useMachine(datePicker.machine, {
    id: id ?? generatedId,
    locale,
    timeZone,
    selectionMode,
    value,
    defaultValue,
    min,
    max,
    disabled,
    readOnly,
    inline: true,
    fixedWeeks: true,
    onValueChange(details) {
      onValueChange?.({ value: details.valueAsString });
    },
  });
  const api = datePicker.connect(service, normalizeProps);
  const labelId = `${id ?? generatedId}-label`;

  return (
    <div
      {...api.getRootProps()}
      aria-labelledby={label ? labelId : undefined}
      className={calendarParts.root}
    >
      {label ? (
        <p className={calendarParts.label} id={labelId}>
          {label}
        </p>
      ) : null}
      <CalendarBody
        api={api}
        locale={locale}
        nextIcon={nextIcon}
        previousIcon={previousIcon}
        viewIcon={viewIcon}
      />
    </div>
  );
}
