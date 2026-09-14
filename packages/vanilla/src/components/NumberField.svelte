<script lang="ts">
  import { numberInput } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * NUMBER FIELD, a machine-backed enhancer over `@zag-js/number-input` (the SAME machine React uses,
   * via `@skryensya/core/machines`). It renders no structure: it scans its authored markup and patches
   * the attributes `connect` returns onto those nodes.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>("[data-sk-number-field-label]");
  const control = root.querySelector<HTMLElement>("[data-sk-number-field-control]");
  const input = root.querySelector<HTMLInputElement>("[data-sk-number-field-input]");
  const decrement = root.querySelector<HTMLButtonElement>("[data-sk-number-field-decrement]");
  const increment = root.querySelector<HTMLButtonElement>("[data-sk-number-field-increment]");

  // Captured ONCE, never re-read from the DOM: `getRootProps().id` returns a namespaced id that
  // `applyZagProps` writes back onto `root.id`. Reading it live from `useMachine`'s reactive factory
  // would feed that prefix back on every recomputation.
  const machineId = root.id || uniqueId("sk-number-field");

  const numberOf = (value: string | undefined) => (!value ? undefined : Number(value));

  const service = useMachine(numberInput.machine, () => ({
    id: machineId,
    name: input?.name || undefined,
    locale: root.lang || document.documentElement.lang || "es",
    defaultValue: input?.defaultValue,
    min: numberOf(input?.min),
    max: numberOf(input?.max),
    step: numberOf(input?.step),
    disabled: input?.disabled,
    readOnly: input?.readOnly,
    required: input?.required,
    translations: {
      decrementLabel: decrement?.getAttribute("aria-label") ?? "Disminuir",
      incrementLabel: increment?.getAttribute("aria-label") ?? "Aumentar",
    },
    onValueChange(details: { value: string; valueAsNumber: number }) {
      root.dispatchEvent(
        new CustomEvent("sk-value-change", {
          bubbles: true,
          detail: { value: details.value, valueAsNumber: details.valueAsNumber },
        }),
      );
    },
  }));

  const api = $derived(numberInput.connect(service, normalizeProps));

  /*
   * Incomplete markup: the enhancer stays silent, like the imperative connector it replaces (it never
   * breaks the page over a badly authored root).
   *
   * ONE PREDICATE, READ BY BOTH HOOKS. It used to be written twice and the two disagreed: the patch
   * required all five parts, the event wiring required only the three interactive ones. A root with
   * an input and both buttons but no `[data-sk-number-field-label]` therefore got LIVE LISTENERS AND
   * ZERO ATTRIBUTES - pressing increment ran the machine and nothing was ever written back to the
   * DOM. Silent in the way that matters least: the component looked authored and behaved dead.
   */
  const parts =
    label && control && input && decrement && increment
      ? { label, control, input, decrement, increment }
      : null;

  const bindings: PartBinding[] = [
    // Every `node()` is gated on the same `parts`, which is what keeps the all-or-nothing rule: an
    // incomplete root binds nothing at all, not even its own attributes.
    { part: "root", node: () => (parts ? root : null), props: () => api.getRootProps() },
    { part: "label", node: () => parts?.label, props: () => api.getLabelProps() },
    { part: "control", node: () => parts?.control, props: () => api.getControlProps() },
    { part: "input", node: () => parts?.input, props: () => api.getInputProps(), events: true },
    {
      part: "decrement",
      node: () => parts?.decrement,
      props: () => api.getDecrementTriggerProps(),
      events: true,
    },
    {
      part: "increment",
      node: () => parts?.increment,
      props: () => api.getIncrementTriggerProps(),
      events: true,
    },
  ];

  bindParts(bindings);
</script>
