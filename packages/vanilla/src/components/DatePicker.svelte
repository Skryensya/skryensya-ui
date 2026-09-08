<script lang="ts">
  import {
    anchoredParts,
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { datePicker } from "@skryensya/core/machines";
  import {
    defaultDayLabel,
    defaultNextTriggerLabel,
    defaultPrevTriggerLabel,
    defaultViewTriggerLabel,
    parseCalendarDate,
    unusedIntlTranslations,
  } from "@skryensya/core/calendar";
  import { datePickerParts, defaultContentLabel, defaultTriggerLabel } from "@skryensya/core/date-picker";
  import { calendarParts } from "@skryensya/core/calendar";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, ensureClasses, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { remountIcons } from "../icon.js";
  import CalendarView from "./CalendarView.svelte";

  /*
   * DATE PICKER, a machine-backed enhancer over `@zag-js/date-picker` (the SAME machine React uses).
   *
   * It splits the work by owner, like Carousel: the CONTROL (label, input, trigger, clear) is authored
   * markup that gets patched; the CALENDAR is chrome derived from the state and owned by `CalendarView`
   * (shared with the standalone Calendar), and this component only puts the popover around it.
   *
   * The native `type="date"` input is still the no-JS layer: it shares `.sk-date-picker__control`, so
   * the native version and the enhanced one look like the SAME field, and without the vanilla layer
   * mounted the consumer authors the native one. This enhancer only appears when the markup asks for
   * `data-sk-date-picker`.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>(`.${datePickerParts.label}`);
  const control = root.querySelector<HTMLElement>(`.${datePickerParts.control}`);
  const input = root.querySelector<HTMLInputElement>(`.${datePickerParts.input}`);
  const trigger = root.querySelector<HTMLButtonElement>(`.${datePickerParts.trigger}`);
  const clear = root.querySelector<HTMLButtonElement>(`.${datePickerParts.clear}`);
  const authoredPlaceholder = input?.getAttribute("placeholder") ?? null;
  const authoredClearLabel = clear?.getAttribute("aria-label") ?? null;

  if (!control) throw new Error(`[data-sk-date-picker] necesita un .${datePickerParts.control}.`);
  if (!input) throw new Error(`[data-sk-date-picker] necesita un .${datePickerParts.input}.`);
  if (!trigger) throw new Error(`[data-sk-date-picker] necesita un .${datePickerParts.trigger}.`);

  if (!root.id) root.id = uniqueId("sk-date-picker");
  const locale = root.dataset.locale || "es";

  /* The positioner is rendered by this component (it is derived chrome), so the reference comes from the
   * template below and not from a query over authored markup, like the control does. */
  let positioner: HTMLElement | undefined = $state();

  const service = useMachine(datePicker.machine, () => ({
    id: root.id,
    name: root.dataset.name || input.name || undefined,
    // Explicit date, never an ambiguous locale string: locale and time zone are authored or fall back to es/UTC.
    locale,
    timeZone: root.dataset.timeZone || "UTC",
    selectionMode: (root.dataset.selectionMode === "range" ? "range" : "single") as "single" | "range",
    /* The initial date and the allowed range. All three were missing: the authored markup had no way to
     * state any of them, while the React binding accepted props this half discarded. */
    defaultValue: root.dataset.value?.split(" ").filter(Boolean).map((date) => parseCalendarDate(date)!),
    min: parseCalendarDate(root.dataset.min),
    max: parseCalendarDate(root.dataset.max),
    disabled: root.hasAttribute("data-disabled"),
    readOnly: root.hasAttribute("data-readonly"),
    required: root.hasAttribute("data-required"),
    // Stable calendar height across months: always six rows, so opening does not reflow the page.
    fixedWeeks: true,
    /*
     * Zag's own `defaultTranslations` is English only, with no language condition. A date picker in
     * Spanish announced "Choose 15 de agosto" in English, the same gap that was fixed in the React binding.
     */
    translations: {
      ...unusedIntlTranslations(),
      trigger: defaultTriggerLabel(locale),
      content: defaultContentLabel(locale),
      dayCell: defaultDayLabel(locale),
      viewTrigger: defaultViewTriggerLabel(locale),
      prevTrigger: defaultPrevTriggerLabel(locale),
      nextTrigger: defaultNextTriggerLabel(locale),
    },
    onValueChange(details: { valueAsString: string[] }) {
      root.dispatchEvent(
        new CustomEvent("sk-value-change", { bubbles: true, detail: { value: details.valueAsString } }),
      );
    },
  }));

  const api = $derived(datePicker.connect(service, normalizeProps));

  /*
   * Anchor positioning, now via the Anchoring pattern (ADR-25). Where the browser has the API it places
   * the calendar itself and we do NOT pass Zag the inline `style`, so two engines do not fight. Without
   * the API, Zag's `style` passes through untouched and it positions (the fallback).
   *
   * This used to stamp `--sk-date-picker-anchor` on the root and date-picker.css read it on the
   * positioner, but NOTHING ever put an `anchor-name` on the control: half the wiring was missing, so
   * the `@supports` block placed nothing and Zag ended up positioning every time.
   */
  const anchored = supportsAnchorPositioning();
  let unbindAnchor: (() => void) | undefined;
  const positionerProps = (props: DomProps): DomProps =>
    anchored ? (stripPositioningStyle(props) as DomProps) : props;

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    if (label) applyZagProps(label, api.getLabelProps() as DomProps);
    applyZagProps(control, api.getControlProps() as DomProps);
    ensureClasses(control, anchoredParts.anchor);
    applyZagProps(input, api.getInputProps({ index: 0 }) as DomProps);
    if (authoredPlaceholder !== null) input.placeholder = authoredPlaceholder;
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    if (clear) {
      applyZagProps(clear, api.getClearTriggerProps() as DomProps);
      if (authoredClearLabel !== null) clear.setAttribute("aria-label", authoredClearLabel);
      // Clear only makes sense with a date set; with no value it takes up no room in the field.
      clear.hidden = api.value.length === 0;
    }
  });

  // Zag's handlers are wired once and re-read on every firing: the machine changes state and with it
  // the closure. The calendar's triggers (prev/next/view/day) are rendered by CalendarView with their
  // handlers already wired by Svelte, so only the authored control needs bindZagEvents.
  const cleanups: Array<() => void> = [];
  onMount(() => {
    cleanups.push(bindZagEvents(input, () => api.getInputProps({ index: 0 }) as DomProps));
    cleanups.push(bindZagEvents(trigger, () => api.getTriggerProps() as DomProps));
    if (clear) {
      cleanups.push(bindZagEvents(clear, () => api.getClearTriggerProps() as DomProps));
    }
    // The anchor↔popup wiring, after the first render: the positioner comes from the template below.
    if (anchored) unbindAnchor = bindAnchor(control, positioner, anchorNameFor(root.id));
    // The chevrons are authored as `data-sk-icon` placeholders and hydrated by the already-registered set.
    remountIcons(root);
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
  });
</script>

<div
  bind:this={positioner}
  {...positionerProps(api.getPositionerProps() as DomProps)}
  class="{datePickerParts.positioner} {anchoredParts.positioner}"
>
  <div {...api.getContentProps()} class="{datePickerParts.content} {calendarParts.root}">
    <CalendarView {api} {locale} />
  </div>
</div>
