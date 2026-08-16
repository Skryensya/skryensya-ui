import { calendarContract } from "@skryensya/core/calendar";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import {
  calendarParts,
  defaultDayLabel,
  defaultNextTriggerLabel,
  defaultPrevTriggerLabel,
  defaultViewTriggerLabel,
  getTwoLetterWeekdayLabel,
  parseCalendarDate,
  unusedIntlTranslations,
  type DateValue,
  type DateView,
  type DayTableCellState,
} from "@skryensya/core/calendar";
import { datePicker } from "@skryensya/core/machines";
import { normalizeProps, useMachine, type PropTypes } from "@zag-js/react";
import { useId, type MouseEvent, type ReactNode } from "react";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

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
          "aria-label": locale.toLocaleLowerCase().startsWith("en")
            ? "Back to current month"
            : "Volver al mes actual",
          onClick: (event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            goToCurrentMonth();
          },
        }
      : defaultViewTriggerProps;

  /*
   * Every trigger below IS the real `Button` component (ADR-1/8), not a hand-authored `<button>`
   * copying its classes/attrs — a rename in Button's shape shows up here for free. Prev/next and
   * the day cell share the SAME `iconOnly` shape: a control-sized square holding one piece of
   * content, a glyph for prev/next, a day number for the cell, rather than a second "icon button"
   * for what is one shape wearing two kinds of content. Month/year cells stay plain Buttons: their
   * label is a word, not a single glyph, and they stretch to fill their `<td>` (calendar.css).
   */
  return (
    <>
      <div className={calendarParts.header}>
        <Button
          {...api.getPrevTriggerProps()}
          className={calendarParts.previous}
          iconOnly
          size="sm"
          variant="ghost"
        >
          {previousIcon ?? <Icon name="chevron-left" size="sm" />}
        </Button>
        <Button
          {...viewTriggerProps}
          className={calendarParts.viewTrigger}
          size="sm"
          variant="ghost"
        >
          {headingLabel}
          {viewIcon ?? <Icon name="chevron-down" size="sm" />}
        </Button>
        <Button
          {...api.getNextTriggerProps()}
          className={calendarParts.next}
          iconOnly
          size="sm"
          variant="ghost"
        >
          {nextIcon ?? <Icon name="chevron-right" size="sm" />}
        </Button>
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
                      <Button
                        {...api.getDayTableCellTriggerProps(props)}
                        className={calendarParts.cellTrigger}
                        iconOnly
                        size="sm"
                        variant="ghost"
                      >
                        {day.day}
                      </Button>
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
                    <Button
                      {...api.getMonthTableCellTriggerProps({ value: month.value })}
                      className={calendarParts.cellTrigger}
                      disabled={month.disabled}
                      size="sm"
                      variant="ghost"
                    >
                      {month.label}
                    </Button>
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
                    <Button
                      {...api.getYearTableCellTriggerProps({ value: year.value })}
                      className={calendarParts.cellTrigger}
                      disabled={year.disabled}
                      size="sm"
                      variant="ghost"
                    >
                      {year.label}
                    </Button>
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

// `selectionMode` and friends come from the contract, so Core stays the only place they are defined.
export type CalendarProps = Pick<
  SignatureOptionsOf<typeof calendarContract, "Calendar">,
  "selectionMode"
> & {
  id?: string;
  label?: ReactNode;
  locale?: string;
  timeZone?: string;
  /*
   * Dates as `DateValue` OR as the ISO strings authored markup can carry. The enhancer only ever
   * has an attribute to read, so a contract option is a string by construction; accepting both here
   * is what lets one emitted tree drive both bindings instead of the React half needing a parser at
   * the call site.
   */
  value?: readonly (DateValue | string)[] | string;
  defaultValue?: readonly (DateValue | string)[] | string;
  min?: DateValue | string;
  max?: DateValue | string;
  disabled?: boolean;
  readOnly?: boolean;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  viewIcon?: ReactNode;
  /** Accessible name for a day cell, by state. Default is locale-aware (`locale`), not just Spanish. */
  dayLabel?: (state: DayTableCellState) => string;
  /** Accessible name for the day/month/year view-switch button. */
  viewTriggerLabel?: (view: DateView) => string;
  /** Accessible name for "go back" — previous month/year/decade depending on the open view. */
  prevTriggerLabel?: (view: DateView) => string;
  /** Accessible name for "go forward" — next month/year/decade depending on the open view. */
  nextTriggerLabel?: (view: DateView) => string;
  onValueChange?: (details: { value: string[] }) => void;
};

export const asDate = (date: DateValue | string | undefined) =>
  typeof date === "string" ? parseCalendarDate(date) : date;
// Space-separated, so a range can name both ends the way authored markup reads it.
export const asDates = (value: readonly (DateValue | string)[] | string | undefined) =>
  value === undefined
    ? undefined
    : (typeof value === "string" ? value.split(" ").filter(Boolean) : value)
        .map((date) => asDate(date))
        .filter((date): date is DateValue => date !== undefined);

/** Standalone calendar grid: no field, no popover — the same machine as DatePicker, `inline: true`. */
export function Calendar({
  dayLabel,
  defaultValue,
  disabled,
  id,
  label,
  locale = "es",
  max,
  min,
  nextIcon,
  nextTriggerLabel,
  onValueChange,
  prevTriggerLabel,
  previousIcon,
  readOnly,
  selectionMode = "single",
  timeZone = "UTC",
  value,
  viewIcon,
  viewTriggerLabel,
}: CalendarProps) {
  const generatedId = useId();
  const service = useMachine(datePicker.machine, {
    id: id ?? generatedId,
    locale,
    timeZone,
    selectionMode,
    value: asDates(value),
    defaultValue: asDates(defaultValue),
    min: asDate(min),
    max: asDate(max),
    disabled,
    translations: {
      // `trigger`/`content` name a popover this component never renders (`inline: true`, no
      // `getTriggerProps()`/`getContentProps()` call in `CalendarBody`) — required by the type,
      // dead in practice.
      ...unusedIntlTranslations(),
      trigger: () => "",
      content: "",
      dayCell: dayLabel ?? defaultDayLabel(locale),
      viewTrigger: viewTriggerLabel ?? defaultViewTriggerLabel(locale),
      prevTrigger: prevTriggerLabel ?? defaultPrevTriggerLabel(locale),
      nextTrigger: nextTriggerLabel ?? defaultNextTriggerLabel(locale),
    },
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
