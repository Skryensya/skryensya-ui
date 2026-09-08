<script lang="ts">
  import { calendarParts, getTwoLetterWeekdayLabel } from "@skryensya/core/calendar";
  import { buttonContract, buttonParts } from "@skryensya/core/button";
  import { datePicker } from "@skryensya/core/machines";
  import type { PropTypes } from "@zag-js/svelte";

  // Without depending on `@zag-js/date-picker` directly (vanilla does not bring it as a dependency of
  // its own, core only re-exports it via `machines.ts`): the `api`'s type comes from the same `connect`
  // function.
  type DatePickerApi = ReturnType<typeof datePicker.connect<PropTypes>>;

  /*
   * The shared calendar BODY: header (prev/next + the view-switch button) and the three grids
   * (day/month/year). Both `Calendar.svelte` (stands alone) and `DatePicker.svelte` (nests it inside
   * its popover) mount their own `useMachine` instance and hand this component the resulting `api`,
   * so the markup that reacts to `api.view` is written once instead of twice.
   *
   * No native `<select>` here: the heading IS `api.getViewTriggerProps()`, a button that steps
   * day → month → year on click (Zag's `VIEW.TOGGLE`), and a month/year cell click steps back down.
   * That round trip. Escalate to pick a decade, descend by tapping a cell. Is the whole reason to
   * drop the two selects.
   */
  const { api, locale }: { api: DatePickerApi; locale: string } = $props();

  /*
   * Every trigger below IS a real ghost Button (ADR-1/8): the class list and the variant/size/
   * icon-only attrs come straight from `buttonContract`, not a copy of its values, so a rename in
   * Button's shape shows up here for free instead of drifting out of four hand-typed literals.
   *
   * Prev/next and the day cell share the SAME `iconOnly` shape. A control-sized square holding one
   * piece of content, a glyph for prev/next, a day number for the cell, rather than a second "icon
   * button" contract for what is one shape wearing two kinds of content. Month/year cells stay plain
   * Buttons: their label is a word, not a single glyph, and they stretch to fill their `<td>` instead
   * of collapsing to a square (calendar.css).
   *
   * The SIZE is `sm` for EVERY control in here, day cells included. The day cell used to sit one
   * tier lower at `xs` (24px, the floor of the scale) on the argument that forty-two of them share
   * one grid; measured against the header it read as a second, weaker control tier inside one
   * widget, and 24px is the WCAG 2.2 SC 2.5.8 minimum rather than comfortable room for a digit you
   * aim at. One `smGhost` bag now covers the header and the grid, and it is spelled here because
   * React composes a real `<Button size="sm">` for the same cell: the attribute has to be the one
   * that prop serializes or G2 reports the two halves as divergent.
   */
  const buttonClass = `${buttonParts.root} ${buttonParts.interactive}`;
  const {
    variant: variantOption,
    tone: toneOption,
    size: sizeOption,
    iconOnly: iconOnlyOption,
  } = buttonContract.options;
  /* BOTH appearance axes, defaults included, because React composes a real `<Button>` here and
   * Button serializes both. Naming only the emphasis left `data-tone` off one side of G2. */
  const smGhost = {
    [variantOption.attr]: "ghost",
    [toneOption.attr]: toneOption.default,
    [sizeOption.attr]: "sm",
  } as const;
  const iconOnly = { [iconOnlyOption.attr]: iconOnlyOption.trueValue } as const;

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
   * cancel instead. Jump straight back to day view on the REAL current month, not wherever the
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
    api.view === "year"
      ? locale.toLocaleLowerCase().startsWith("en")
        ? "Back to current month"
        : "Volver al mes actual"
      : api.getViewTriggerProps()["aria-label"],
  );
  const viewTriggerClick = $derived(
    api.view === "year"
      ? (event: Event) => {
          event.preventDefault();
          goToCurrentMonth();
        }
      : api.getViewTriggerProps().onclick,
  );

  /*
   * `Button` (react.tsx) mirrors a `disabled` prop onto `aria-disabled` too, not just the native
   * attribute. Zag's own `getPrevTriggerProps`/`getNextTriggerProps` only return `disabled`. Every
   * trigger here already claims to BE a real Button (this file's own doc above); redone by hand
   * since spreading Zag's props directly onto a bare `<button>` skips whatever a real Button would
   * have added.
   */
  const prevTriggerProps = $derived.by(() => {
    const props = api.getPrevTriggerProps({ view: api.view });
    return { ...props, "aria-disabled": props.disabled ? ("true" as const) : undefined };
  });
  const nextTriggerProps = $derived.by(() => {
    const props = api.getNextTriggerProps({ view: api.view });
    return { ...props, "aria-disabled": props.disabled ? ("true" as const) : undefined };
  });
</script>

<div class={calendarParts.header}>
  <button
    {...prevTriggerProps}
    {...smGhost}
    {...iconOnly}
    class="{calendarParts.previous} {buttonClass}"
    type="button"
  >
    <span data-sk-icon="chevron-left" data-sk-icon-size="sm"></span>
  </button>
  <button
    {...api.getViewTriggerProps()}
    onclick={viewTriggerClick}
    aria-label={viewTriggerLabel}
    {...smGhost}
    class="{calendarParts.viewTrigger} {buttonClass}"
    type="button"
  >
    {headingLabel}
    <span aria-hidden="true" data-sk-icon="chevron-down" data-sk-icon-size="sm"></span>
  </button>
  <button
    {...nextTriggerProps}
    {...smGhost}
    {...iconOnly}
    class="{calendarParts.next} {buttonClass}"
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
                {...smGhost}
                {...iconOnly}
                class="{calendarParts.cellTrigger} {buttonClass}"
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
                {...smGhost}
                class="{calendarParts.cellTrigger} {buttonClass}"
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
                {...smGhost}
                class="{calendarParts.cellTrigger} {buttonClass}"
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
