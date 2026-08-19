<script lang="ts">
  import { anchorNameFor, bindAnchor, stripPositioningStyle, supportsAnchorPositioning } from "@skryensya/core/anchored";
  import { select } from "@skryensya/core/machines";
  import { selectParts } from "@skryensya/core/select";
  import {
    formatTimeValue,
    generateTimeOptions,
    getPeriodLabels,
    getTimeFieldTokens,
    parseTimeValue,
    resolveHourCycle,
    segmentBounds,
    timeFieldParts,
    to12Hour,
    to24Hour,
    type HourCycle,
    type Period,
    type TimeFieldOption,
    type TimeFieldSegmentType,
    type TimeValue,
  } from "@skryensya/core/time-field";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply.js";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate.js";
  import { remountIcons } from "../icon.js";

  /*
   * TIME FIELD: hour, minute, and (in a 12-hour locale) AM/PM as one accessible `role="group"` of
   * `role="spinbutton"` segments (typing), plus a trigger that opens a plain arrow-key-navigable
   * listbox of preset times (browsing) — always both. `time-field.ts`'s own banner has the fuller
   * history of what was tried and dropped (a scroll wheel, a searchable Combobox) and why the
   * listbox in between is what stuck.
   *
   * The consumer authors root, label and (optionally) a hint — there is no control OR picker shell
   * to author, unlike DatePicker/Combobox/Select: every segment AND the picker's own trigger/
   * listbox are chrome derived from `locale`/`optionsStep`, the same way `CalendarView` generates
   * day cells instead of requiring authored `<td>`s. This component renders all of it directly
   * rather than patching pre-existing markup — the picker drives `@zag-js/select`'s machine
   * directly (via `@zag-js/svelte`'s own `useMachine`, the SAME machine `Select.svelte` uses,
   * `applyZagProps`/`bindZagEvents` patched onto elements THIS file creates instead of ones it
   * adopts), rendering only the listbox part: `Select`'s own component/enhancer renders a visible
   * trigger of its OWN (value text + chevron), and nesting that inside this field's compact icon
   * trigger would mean two clicks to reach the list, the same inefficiency an earlier version of
   * this picker had with a search box.
   */
  const root = getRoot();
  let hidden: HTMLInputElement | undefined = $state();
  let controlEl: HTMLElement | undefined = $state();
  let triggerEl: HTMLButtonElement | undefined = $state();
  let positionerEl: HTMLElement | undefined = $state();
  let contentEl: HTMLUListElement | undefined = $state();
  const label = root.querySelector<HTMLElement>(`.${timeFieldParts.label}`);
  const hint = root.querySelector<HTMLElement>(`.${timeFieldParts.hint}`);

  // A base for the label and hint ids, NOT an id on the root: nothing points at the root, and
  // stamping one there is a difference React has no reason to match.
  const idBase = root.id || uniqueId("sk-time-field");
  const locale = root.dataset.locale || "es";
  const hourCycleOverride = root.dataset.hourCycle as HourCycle | undefined;
  const minuteStep = Number(root.dataset.minuteStep) || 1;
  const disabled = root.hasAttribute("data-disabled");
  const readOnly = root.hasAttribute("data-readonly");
  const required = root.hasAttribute("data-required");
  const name = root.dataset.name || undefined;
  const hourLabel = root.dataset.hourLabel || "Hora";
  const minuteLabel = root.dataset.minuteLabel || "Minuto";
  const periodLabel = root.dataset.periodLabel || "Periodo";
  const clearLabel = root.dataset.clearLabel || "Limpiar hora";
  const optionsStep = Number(root.dataset.optionsStep) || 30;
  const optionsLabel = root.dataset.optionsLabel || "Elegir de la lista";

  const labelId = label ? (label.id ||= `${idBase}-label`) : undefined;
  const hintId = hint ? (hint.id ||= `${idBase}-hint`) : undefined;

  const cycle: HourCycle = resolveHourCycle(locale, hourCycleOverride);
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

  // As an ATTRIBUTE. Svelte would set the property, and an empty property is invisible to anything
  // that reads the DOM — including a form serializer that runs before the first commit.
  $effect(() => {
    hidden?.setAttribute("value", canonical ? formatTimeValue(canonical) : "");
  });

  /*
   * The clear button and the picker's own check indicators are all conditionally/dynamically
   * present, so their `data-sk-icon` placeholders are fresh, unhydrated nodes at various points
   * after the first render — unlike Carousel's own chevrons, which exist once and never remount, a
   * single mount-time `remountIcons` call would miss whatever appears after it. `remountIcons` is
   * idempotent (`icon.ts`'s own doc: an already-hydrated `[data-icon]` node is left alone), so
   * re-running it on every segment change costs nothing when a placeholder was already hydrated.
   */
  $effect(() => {
    hasValue; // read only to depend on it — the icons themselves don't come from this value
    remountIcons(root);
  });

  function commit(next: SegmentValues) {
    segments = next;
    const formatted = canonical ? formatTimeValue(canonical) : "";
    root.dispatchEvent(new CustomEvent("sk-value-change", { bubbles: true, detail: { value: formatted } }));
  }

  /*
   * THE PICKER. Drives `@zag-js/select`'s machine directly (`select` from `@skryensya/core/
   * machines`, the SAME one `Select.svelte` uses) rather than mounting `Select` itself — that
   * component renders its own visible trigger, and nesting it inside this field's compact icon
   * trigger would mean two clicks to reach the list (`TimeField.svelte`'s own banner has the fuller
   * reasoning). Only the listbox part renders; the field's own icon button IS the trigger, its
   * props patched from `pickerApi.getTriggerProps()` the same way `applyZagProps`/`bindZagEvents`
   * patch every other machine-backed enhancer's OWN markup — the only difference is this markup is
   * generated by THIS file, not adopted from the author's.
   */
  const optionsList: readonly TimeFieldOption[] = generateTimeOptions(optionsStep, locale, cycle);
  const collection = select.collection<TimeFieldOption>({
    items: [...optionsList],
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });
  const pickerId = `${idBase}-options`;
  const anchorName = supportsAnchorPositioning() ? anchorNameFor(pickerId) : null;
  let unbindAnchor: (() => void) | undefined;

  const pickerService = useMachine(select.machine, () => ({
    id: pickerId,
    collection,
    value: canonical ? [formatTimeValue(canonical)] : [],
    positioning: { sameWidth: false },
    onValueChange(details: { value: string[] }) {
      const next = details.value[0];
      if (next === undefined) return;
      const parsed = parseTimeValue(next);
      if (!parsed) return;
      commit(decompose(parsed));
    },
  }));
  const pickerApi = $derived(select.connect(pickerService, normalizeProps));

  /*
   * `aria-labelledby`, STRIPPED ON PURPOSE: `getTriggerProps()`/`getContentProps()` both set it,
   * pointing at a `<label>` id that does not exist here — this picker has no visible label, only
   * the icon button's own `aria-label` (authored in the template below). Left alone, the accessible
   * name resolves to nothing; omitting the key entirely (confirmed reading `@zag-js/select`'s own
   * `connect.js`, not assumed) is what lets the authored `aria-label` stand.
   */
  function withoutLabelledBy(props: DomProps): DomProps {
    const next: DomProps = { ...props };
    delete next["aria-labelledby"];
    return next;
  }

  $effect(() => {
    if (triggerEl) applyZagProps(triggerEl, withoutLabelledBy(pickerApi.getTriggerProps() as DomProps));

    // On the anchor path, CSS owns placement (`select.css`), so drop Zag's inline positioning
    // styles entirely — the same reasoning `Select.svelte`'s own effect gives for the identical
    // line, leaving them would fight the browser's own positioner.
    const positionerProps = pickerApi.getPositionerProps() as DomProps;
    if (positionerEl)
      applyZagProps(positionerEl, anchorName ? (stripPositioningStyle(positionerProps) as DomProps) : positionerProps);

    if (contentEl) applyZagProps(contentEl, withoutLabelledBy(pickerApi.getContentProps() as DomProps));

    const itemEls = contentEl ? Array.from(contentEl.querySelectorAll<HTMLLIElement>(`.${selectParts.item}`)) : [];
    itemEls.forEach((el, index) => {
      const item = optionsList[index];
      if (!item) return;
      /*
       * Zag's `aria-selected` tracks the COMMITTED value, not the row under
       * `aria-activedescendant` — the same gap `Select`'s own React/Vanilla bindings already fix
       * for the identical machine (`select.tsx`'s own comment on it).
       */
      const itemProps = pickerApi.getItemProps({ item }) as DomProps;
      itemProps["aria-selected"] = item.value === pickerApi.highlightedValue ? "true" : undefined;
      applyZagProps(el, itemProps);

      const text = el.querySelector<HTMLElement>(`.${selectParts.itemText}`);
      if (text) applyZagProps(text, pickerApi.getItemTextProps({ item }) as DomProps);
      const indicator = el.querySelector<HTMLElement>(`.${selectParts.itemIndicator}`);
      if (indicator) applyZagProps(indicator, pickerApi.getItemIndicatorProps({ item }) as DomProps);
    });

    // Re-asserted here, not once at mount: the positioner spread above rewrites its inline style
    // every render, dropping the hook set earlier — stamping after the spread keeps it stable
    // across every open/close. Idempotent, so repeating it is free.
    if (anchorName && positionerEl && controlEl) unbindAnchor = bindAnchor(controlEl, positionerEl, anchorName);
  });

  const pickerCleanups: Array<() => void> = [];
  onMount(() => {
    if (triggerEl) pickerCleanups.push(bindZagEvents(triggerEl, () => pickerApi.getTriggerProps() as DomProps));
    if (contentEl) {
      pickerCleanups.push(bindZagEvents(contentEl, () => pickerApi.getContentProps() as DomProps));
      const itemEls = Array.from(contentEl.querySelectorAll<HTMLLIElement>(`.${selectParts.item}`));
      itemEls.forEach((el, index) => {
        const item = optionsList[index];
        if (item) pickerCleanups.push(bindZagEvents(el, () => pickerApi.getItemProps({ item }) as DomProps));
      });
    }
  });
  onDestroy(() => {
    for (const cleanup of pickerCleanups) cleanup();
    unbindAnchor?.();
  });

  /*
   * EXTERNAL DRIVERS. `root.dataset.value` is read once, above, at mount — the same "authored
   * value" every other enhancer in this codebase reads once and never revisits. That is correct
   * for markup a human writes, but it stops being enough the moment something ELSE wants to SET
   * this field's value from outside after mount — a consumer's own script, say, which has no
   * access to `segments`/`commit`, only to the DOM (the picker above does not need this path: it
   * calls `commit` directly, being part of this same component). `commit()` itself never touches
   * `data-value` (it writes the hidden input's own `value`, never the root's), so this observer can
   * never fire on its own writes — no re-entrancy guard needed, the two channels are already
   * disjoint by construction.
   */
  onMount(() => {
    const observer = new MutationObserver(() => {
      commit(decompose(parseTimeValue(root.dataset.value)));
    });
    observer.observe(root, { attributeFilter: ["data-value"] });
    return () => observer.disconnect();
  });

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

    // Alt+ArrowDown, the same key `<select>` already opens with — the picker's own trigger button
    // (rendered below, at the `trailing` part) is Zag's REAL trigger, wired through
    // `bindZagEvents`'s own `click` listener, so `.click()` on it runs the machine's normal open
    // behavior exactly like a real click would, rather than this file reaching into the machine
    // itself. Checked on the SEGMENT rather than the control: the control's own `role="group"` is
    // not an interactive element, and a keydown listener there would be a real a11y smell, not
    // just a lint one.
    if (event.altKey) {
      if (event.key === "ArrowDown") {
        const trigger = controlEl?.querySelector<HTMLButtonElement>(`.${timeFieldParts.trailing} button`);
        if (trigger) {
          event.preventDefault();
          trigger.click();
        }
      }
      return;
    }

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
  bind:this={controlEl}
  class="{timeFieldParts.control} sk-anchor"
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
    ><span data-sk-icon="close" data-sk-icon-size="sm"></span></button>
  {/if}
  {#if !disabled && !readOnly}
    <span class={timeFieldParts.trailing}>
      <button
        aria-label={optionsLabel}
        bind:this={triggerEl}
        class="sk-button sk-interactive sk-time-field__options-trigger"
        data-icon-only
        data-size="sm"
        data-variant="ghost"
        type="button"
      ><span data-sk-icon="clock" data-sk-icon-size="sm"></span></button>
    </span>
  {/if}
</div>
{#if !disabled && !readOnly}
  <div
    bind:this={positionerEl}
    class="{selectParts.positioner} sk-anchored sk-time-field__options-positioner"
    data-sk-placement="block-end"
  >
    <ul aria-label={optionsLabel} bind:this={contentEl} class="{selectParts.content} sk-scrollbar">
      {#each optionsList as option (option.value)}
        <li class="{selectParts.item} sk-interactive">
          <span class={selectParts.itemText}>{option.label}</span>
          <span class={selectParts.itemIndicator}><span data-sk-icon="check" data-sk-icon-size="md"></span></span>
        </li>
      {/each}
    </ul>
  </div>
{/if}
<!-- `value` set as an attribute, not only as the property Svelte would bind: an empty property is
     invisible to anything that reads the DOM, and React renders `value=""` from the start. -->
<input bind:this={hidden} name={name} type="hidden" />
