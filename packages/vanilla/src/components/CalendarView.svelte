<script lang="ts">
  import { calendarParts, getTwoLetterWeekdayLabel } from "@skryensya/core/calendar";
  import { datePicker } from "@skryensya/core/machines";
  import type { PropTypes } from "@zag-js/svelte";

  // Sin depender de `@zag-js/date-picker` directamente (vanilla no lo trae como dependencia propia,
  // sólo core la reexporta vía `machines.ts`): el tipo del `api` sale de la misma función `connect`.
  type DatePickerApi = ReturnType<typeof datePicker.connect<PropTypes>>;

  /*
   * The shared calendar BODY: header (prev/next + the view-switch button) and the three grids
   * (day/month/year). Both `Calendar.svelte` (stands alone) and `DatePicker.svelte` (nests it inside
   * its popover) mount their own `useMachine` instance and hand this component the resulting `api`,
   * so the markup that reacts to `api.view` is written once instead of twice.
   *
   * No native `<select>` here: the heading IS `api.getViewTriggerProps()`, a button that steps
   * day → month → year on click (Zag's `VIEW.TOGGLE`), and a month/year cell click steps back down.
   * That round trip — escalate to pick a decade, descend by tapping a cell — is the whole reason to
   * drop the two selects.
   */
  const { api, locale }: { api: DatePickerApi; locale: string } = $props();

  const headingLabel = $derived.by(() => {
    if (api.view === "day") {
      return api.format(api.visibleRange.start, { month: "long", year: "numeric" });
    }
    if (api.view === "month") {
      return api.format(api.visibleRange.start, { year: "numeric" });
    }
    const decade = api.getDecade();
    return `${decade.start ?? ""}–${decade.end ?? ""}`;
  });

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

  const viewTriggerLabel = $derived(
    api.view === "year" ? "Volver al mes actual" : api.getViewTriggerProps()["aria-label"],
  );
  const viewTriggerClick = $derived(
    api.view === "year"
      ? (event: Event) => {
          event.preventDefault();
          goToCurrentMonth();
        }
      : api.getViewTriggerProps().onclick,
  );
</script>

<div class={calendarParts.header}>
  <button
    {...api.getPrevTriggerProps({ view: api.view })}
    class="{calendarParts.previous} sk-button sk-interactive"
    data-icon-only=""
    data-size="sm"
    data-variant="ghost"
    type="button"
  >
    <span data-sk-icon="chevron-left" data-sk-icon-size="sm"></span>
  </button>
  <button
    {...api.getViewTriggerProps()}
    onclick={viewTriggerClick}
    aria-label={viewTriggerLabel}
    class="{calendarParts.viewTrigger} sk-button sk-interactive"
    data-size="sm"
    data-variant="ghost"
    type="button"
  >
    {headingLabel}
    <span aria-hidden="true" data-sk-icon="chevron-down" data-sk-icon-size="sm"></span>
  </button>
  <button
    {...api.getNextTriggerProps({ view: api.view })}
    class="{calendarParts.next} sk-button sk-interactive"
    data-icon-only=""
    data-size="sm"
    data-variant="ghost"
    type="button"
  >
    <span data-sk-icon="chevron-right" data-sk-icon-size="sm"></span>
  </button>
</div>

{#if api.view === "day"}
  <table {...api.getTableProps()} class={calendarParts.table}>
    <thead {...api.getTableHeadProps()} class={calendarParts.tableHeader}>
      <tr {...api.getTableRowProps()}>
        {#each api.weekDays as day (day.short)}
          <th scope="col"><abbr title={day.long}>{getTwoLetterWeekdayLabel(day, locale)}</abbr></th>
        {/each}
      </tr>
    </thead>
    <tbody {...api.getTableBodyProps()} class={calendarParts.tableBody}>
      {#each api.weeks as week, weekIndex (weekIndex)}
        <tr {...api.getTableRowProps()}>
          {#each week as day (day.toString())}
            <td {...api.getDayTableCellProps({ value: day, visibleRange: api.visibleRange })} class={calendarParts.cell}>
              <button
                {...api.getDayTableCellTriggerProps({ value: day, visibleRange: api.visibleRange })}
                class="{calendarParts.cellTrigger} sk-button sk-interactive"
                data-size="sm"
                data-variant="ghost"
                type="button"
              >
                {day.day}
              </button>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{:else if api.view === "month"}
  <table {...api.getTableProps({ view: "month" })} class="{calendarParts.table} {calendarParts.monthGrid}">
    <tbody {...api.getTableBodyProps({ view: "month" })} class={calendarParts.tableBody}>
      {#each api.getMonthsGrid({ columns: 4, format: "short" }) as row, rowIndex (rowIndex)}
        <tr {...api.getTableRowProps({ view: "month" })}>
          {#each row as month (month.value)}
            <td {...api.getMonthTableCellProps({ value: month.value, columns: 4 })} class={calendarParts.cell}>
              <button
                {...api.getMonthTableCellTriggerProps({ value: month.value })}
                class="{calendarParts.cellTrigger} sk-button sk-interactive"
                data-size="sm"
                data-variant="ghost"
                type="button"
                disabled={month.disabled}
              >
                {month.label}
              </button>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <table {...api.getTableProps({ view: "year" })} class="{calendarParts.table} {calendarParts.yearGrid}">
    <tbody {...api.getTableBodyProps({ view: "year" })} class={calendarParts.tableBody}>
      {#each api.getYearsGrid({ columns: 4 }) as row, rowIndex (rowIndex)}
        <tr {...api.getTableRowProps({ view: "year" })}>
          {#each row as year (year.value)}
            <td {...api.getYearTableCellProps({ value: year.value, columns: 4 })} class={calendarParts.cell}>
              <button
                {...api.getYearTableCellTriggerProps({ value: year.value })}
                class="{calendarParts.cellTrigger} sk-button sk-interactive"
                data-size="sm"
                data-variant="ghost"
                type="button"
                disabled={year.disabled}
              >
                {year.label}
              </button>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
