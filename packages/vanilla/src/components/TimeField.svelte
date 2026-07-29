<script lang="ts">
  import {
    formatTimeValue,
    getHourCycle,
    getPeriodLabels,
    getTimeFieldTokens,
    parseTimeValue,
    segmentBounds,
    timeFieldParts,
    to12Hour,
    to24Hour,
    type HourCycle,
    type Period,
    type TimeFieldSegmentType,
    type TimeValue,
  } from "@skryensya/core/time-field";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate.js";

  /*
   * TIME FIELD: hour, minute, and (in a 12-hour locale) AM/PM as one accessible `role="group"` of
   * `role="spinbutton"` segments — no popover, no wheel, no Zag machine (there is no
   * `@zag-js/time-picker`). An earlier design put a scroll-wheel picker behind a trigger; it was
   * neither simpler nor more accessible than the segments themselves, the same primitive every
   * native segmented time control already uses.
   *
   * The consumer authors root, label and (optionally) a hint — there is no control shell to author,
   * unlike DatePicker/Combobox: every segment is chrome derived from `locale`, the same way
   * `CalendarView` generates day cells instead of requiring authored `<td>`s. This component renders
   * that chrome directly rather than patching pre-existing markup.
   */
  const root = getRoot();
  const label = root.querySelector<HTMLElement>(`.${timeFieldParts.label}`);
  const hint = root.querySelector<HTMLElement>(`.${timeFieldParts.hint}`);

  if (!root.id) root.id = uniqueId("sk-time-field");
  const locale = root.dataset.locale || "es";
  const minuteStep = Number(root.dataset.minuteStep) || 1;
  const disabled = root.hasAttribute("data-disabled");
  const readOnly = root.hasAttribute("data-readonly");
  const required = root.hasAttribute("data-required");
  const name = root.dataset.name || undefined;
  const hourLabel = root.dataset.hourLabel || "Hora";
  const minuteLabel = root.dataset.minuteLabel || "Minuto";
  const periodLabel = root.dataset.periodLabel || "Periodo";
  const clearLabel = root.dataset.clearLabel || "Limpiar hora";

  const labelId = label ? (label.id ||= `${root.id}-label`) : undefined;
  const hintId = hint ? (hint.id ||= `${root.id}-hint`) : undefined;

  const cycle: HourCycle = getHourCycle(locale);
  const periods = getPeriodLabels(locale);
  const tokens = getTimeFieldTokens(locale, cycle);
  const segmentOrder = tokens
    .filter((token) => token.kind === "segment")
    .map((token) => (token as { kind: "segment"; type: TimeFieldSegmentType }).type);
  const segmentLabels: Record<TimeFieldSegmentType, string> = {
    hour: hourLabel,
    minute: minuteLabel,
    dayPeriod: periodLabel,
  };

  type SegmentValues = Partial<Record<TimeFieldSegmentType, number>>;

  function decompose(value: TimeValue | undefined): SegmentValues {
    if (!value) return {};
    if (cycle === "h24") return { hour: value.hour, minute: value.minute };
    const { hour12, period } = to12Hour(value.hour);
    return { hour: hour12, minute: value.minute, dayPeriod: period === "AM" ? 0 : 1 };
  }

  function compose(values: SegmentValues): TimeValue | undefined {
    if (values.minute === undefined) return undefined;
    if (cycle === "h24") {
      if (values.hour === undefined) return undefined;
      return { hour: values.hour, minute: values.minute };
    }
    if (values.hour === undefined || values.dayPeriod === undefined) return undefined;
    const period: Period = values.dayPeriod === 0 ? "AM" : "PM";
    return { hour: to24Hour(values.hour, period), minute: values.minute };
  }

  /** Inclusive-range wrap: handles any step size and either direction in one formula, so an arrow
   * key past either end lands on the OTHER end instead of clamping there. */
  function wrapStep(current: number, delta: number, min: number, max: number): number {
    const span = max - min + 1;
    return (((current + delta - min) % span) + span) % span + min;
  }

  function segmentText(type: TimeFieldSegmentType, raw: number | undefined): string {
    if (raw === undefined) return type === "hour" ? "hh" : type === "minute" ? "mm" : "–";
    if (type === "dayPeriod") return raw === 0 ? periods.AM : periods.PM;
    return String(raw).padStart(2, "0");
  }

  let segments = $state<SegmentValues>(decompose(parseTimeValue(root.dataset.value)));
  const canonical = $derived(compose(segments));
  const hasValue = $derived(canonical !== undefined);

  function commit(next: SegmentValues) {
    segments = next;
    const formatted = canonical ? formatTimeValue(canonical) : "";
    root.dispatchEvent(new CustomEvent("sk-value-change", { bubbles: true, detail: { value: formatted } }));
  }

  const segmentSelector = (type: TimeFieldSegmentType) =>
    `[data-sk-time-field-segment="${type}"]`;
  const moveFocus = (from: TimeFieldSegmentType, direction: 1 | -1) => {
    const next = segmentOrder[segmentOrder.indexOf(from) + direction];
    if (next) root.querySelector<HTMLElement>(segmentSelector(next))?.focus();
  };

  /** How long an unfinished digit ("1", which could still become "10"–"12") waits for a second
   * keystroke before it settles and focus moves on. */
  const ADVANCE_DELAY = 500;
  let buffer: { type: TimeFieldSegmentType; value: number; digits: number } | null = null;
  let advanceTimer: ReturnType<typeof setTimeout> | undefined;

  function typeDigit(type: TimeFieldSegmentType, digit: number) {
    const { min, max } = segmentBounds(type, cycle);
    let nextValue: number;
    let digits: number;
    if (buffer && buffer.type === type && buffer.digits < 2 && buffer.value * 10 + digit <= max) {
      nextValue = buffer.value * 10 + digit;
      digits = buffer.digits + 1;
    } else {
      nextValue = digit;
      digits = 1;
    }
    buffer = { type, value: nextValue, digits };
    commit({ ...segments, [type]: Math.max(nextValue, min) });

    clearTimeout(advanceTimer);
    if (digits >= 2 || nextValue * 10 > max) {
      buffer = null;
      moveFocus(type, 1);
    } else {
      advanceTimer = setTimeout(() => {
        buffer = null;
        moveFocus(type, 1);
      }, ADVANCE_DELAY);
    }
  }

  function handleSegmentKeyDown(type: TimeFieldSegmentType, event: KeyboardEvent) {
    if (disabled || readOnly) return;
    const { min, max } = segmentBounds(type, cycle);
    const current = segments[type];

    if (type !== "dayPeriod" && event.key >= "0" && event.key <= "9") {
      event.preventDefault();
      typeDigit(type, Number(event.key));
      return;
    }

    if (type === "dayPeriod") {
      const key = event.key.toLowerCase();
      if (key.length === 1 && periods.AM.toLowerCase().startsWith(key)) {
        event.preventDefault();
        commit({ ...segments, dayPeriod: 0 });
        return;
      }
      if (key.length === 1 && periods.PM.toLowerCase().startsWith(key)) {
        event.preventDefault();
        commit({ ...segments, dayPeriod: 1 });
        return;
      }
    }

    switch (event.key) {
      case "ArrowUp": {
        event.preventDefault();
        buffer = null;
        const step = type === "minute" ? minuteStep : 1;
        commit({ ...segments, [type]: current === undefined ? min : wrapStep(current, step, min, max) });
        return;
      }
      case "ArrowDown": {
        event.preventDefault();
        buffer = null;
        const step = type === "minute" ? minuteStep : 1;
        commit({ ...segments, [type]: current === undefined ? max : wrapStep(current, -step, min, max) });
        return;
      }
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(type, -1);
        return;
      case "ArrowRight":
        event.preventDefault();
        moveFocus(type, 1);
        return;
      case "Home":
        event.preventDefault();
        buffer = null;
        commit({ ...segments, [type]: min });
        return;
      case "End":
        event.preventDefault();
        buffer = null;
        commit({ ...segments, [type]: max });
        return;
      case "Backspace":
      case "Delete": {
        event.preventDefault();
        buffer = null;
        const rest = { ...segments };
        delete rest[type];
        commit(rest);
        return;
      }
    }
  }
</script>

<div
  aria-describedby={hintId}
  aria-labelledby={labelId}
  class={timeFieldParts.control}
  data-disabled={disabled ? "" : undefined}
  role="group"
>
  {#each tokens as token, index (index)}
    {#if token.kind === "literal"}
      <span aria-hidden="true" class={timeFieldParts.literal}>{token.value}</span>
    {:else}
      <div
        aria-label={segmentLabels[token.type]}
        aria-required={required ? "true" : undefined}
        aria-valuemax={segmentBounds(token.type, cycle).max}
        aria-valuemin={segmentBounds(token.type, cycle).min}
        aria-valuenow={segments[token.type]}
        aria-valuetext={segmentText(token.type, segments[token.type])}
        class={timeFieldParts.segment}
        data-placeholder={segments[token.type] === undefined ? "" : undefined}
        data-sk-time-field-segment={token.type}
        onfocus={() => {
          buffer = null;
        }}
        onkeydown={(event) => handleSegmentKeyDown(token.type, event)}
        role="spinbutton"
        tabindex={disabled ? -1 : 0}
      >{segmentText(token.type, segments[token.type])}</div>
    {/if}
  {/each}
  {#if hasValue && !disabled && !readOnly}
    <button
      aria-label={clearLabel}
      class="{timeFieldParts.clear} sk-button sk-interactive"
      data-icon-only
      data-size="sm"
      data-variant="ghost"
      onclick={() => commit({})}
      type="button"
    ><span aria-hidden="true">×</span></button>
  {/if}
</div>
<input name={name} type="hidden" value={canonical ? formatTimeValue(canonical) : ""} />
