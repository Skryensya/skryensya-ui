<script lang="ts">
  import { numberInput } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * NUMBER FIELD, enhancer machine-backed sobre `@zag-js/number-input` (la MISMA máquina que usa
   * React, vía `@skryensya/core/machines`). No renderiza estructura: escanea su markup autorado
   * y parchea los atributos que devuelve `connect` sobre esos nodos.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>("[data-sk-number-field-label]");
  const control = root.querySelector<HTMLElement>("[data-sk-number-field-control]");
  const input = root.querySelector<HTMLInputElement>("[data-sk-number-field-input]");
  const decrement = root.querySelector<HTMLButtonElement>("[data-sk-number-field-decrement]");
  const increment = root.querySelector<HTMLButtonElement>("[data-sk-number-field-increment]");

  // Capturado UNA vez, nunca releído del DOM: `getRootProps().id` devuelve un id namespaced que
  // `applyZagProps` escribe de vuelta sobre `root.id`. Leerlo en vivo desde el factory reactivo de
  // `useMachine` retroalimentaría ese prefijo en cada recomputación.
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

  // Markup incompleto: el enhancer se queda mudo, como el conector imperativo que reemplaza (nunca
  // rompe la página por una raíz mal autorada).
  $effect(() => {
    if (!label || !control || !input || !decrement || !increment) return;
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(label, api.getLabelProps() as DomProps);
    applyZagProps(control, api.getControlProps() as DomProps);
    applyZagProps(input, api.getInputProps() as DomProps);
    applyZagProps(decrement, api.getDecrementTriggerProps() as DomProps);
    applyZagProps(increment, api.getIncrementTriggerProps() as DomProps);
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (!input || !decrement || !increment) return;
    cleanups.push(bindZagEvents(input, () => api.getInputProps() as DomProps));
    cleanups.push(bindZagEvents(decrement, () => api.getDecrementTriggerProps() as DomProps));
    cleanups.push(bindZagEvents(increment, () => api.getIncrementTriggerProps() as DomProps));
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
