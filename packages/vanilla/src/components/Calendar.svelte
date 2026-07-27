<script lang="ts">
  import { datePicker } from "@skryensya/core/machines";
  import { calendarParts } from "@skryensya/core/calendar";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onMount } from "svelte";
  import { applyZagProps, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { remountIcons } from "../icon.js";
  import CalendarView from "./CalendarView.svelte";

  /*
   * CALENDAR, standalone: the same `@zag-js/date-picker` machine as DatePicker, but `inline: true`
   * and none of the field parts (label/control/input/trigger/clear). Where DatePicker nests
   * `CalendarView` inside its popover positioner, this root IS the calendar — no field, no popup.
   */
  const root = getRoot();
  if (!root.id) root.id = uniqueId("sk-calendar");
  const locale = root.dataset.locale || "es";

  const service = useMachine(datePicker.machine, () => ({
    id: root.id,
    locale,
    timeZone: root.dataset.timeZone || "UTC",
    selectionMode: (root.dataset.selectionMode === "range" ? "range" : "single") as "single" | "range",
    disabled: root.hasAttribute("data-disabled"),
    readOnly: root.hasAttribute("data-readonly"),
    inline: true,
    fixedWeeks: true,
    onValueChange(details: { valueAsString: string[] }) {
      root.dispatchEvent(
        new CustomEvent("sk-value-change", { bubbles: true, detail: { value: details.valueAsString } }),
      );
    },
  }));

  const api = $derived(datePicker.connect(service, normalizeProps));

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
  });

  onMount(() => {
    remountIcons(root);
  });
</script>

<CalendarView {api} {locale} />
