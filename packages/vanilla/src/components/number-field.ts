import { numberInput } from "@skryensya/core/machines";
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla";
import {
  applyZagProps,
  bindZagEvents,
  type DomProps,
} from "../runtime/apply.js";
import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

const selector = {
  root: "[data-sk-number-field]",
  label: "[data-sk-number-field-label]",
  control: "[data-sk-number-field-control]",
  input: "[data-sk-number-field-input]",
  decrement: "[data-sk-number-field-decrement]",
  increment: "[data-sk-number-field-increment]",
} as const;
const number = (value: string | undefined) =>
  !value ? undefined : Number(value);
function connect(root: HTMLElement): () => void {
  const label = root.querySelector<HTMLElement>(selector.label);
  const control = root.querySelector<HTMLElement>(selector.control);
  const input = root.querySelector<HTMLInputElement>(selector.input);
  const decrement = root.querySelector<HTMLButtonElement>(selector.decrement);
  const increment = root.querySelector<HTMLButtonElement>(selector.increment);
  if (!label || !control || !input || !decrement || !increment) return () => {};
  const machine = new VanillaMachine(numberInput.machine, {
    id: root.id || uniqueId("sk-number-field"),
    name: input.name || undefined,
    locale: root.lang || document.documentElement.lang || "es",
    defaultValue: input.defaultValue,
    min: number(input.min),
    max: number(input.max),
    step: number(input.step),
    disabled: input.disabled,
    readOnly: input.readOnly,
    required: input.required,
    translations: {
      decrementLabel: decrement.getAttribute("aria-label") ?? "Disminuir",
      incrementLabel: increment.getAttribute("aria-label") ?? "Aumentar",
    },
    onValueChange(details) {
      root.dispatchEvent(
        new CustomEvent("sk-value-change", {
          bubbles: true,
          detail: {
            value: details.value,
            valueAsNumber: details.valueAsNumber,
          },
        }),
      );
    },
  });
  machine.start();
  const getApi = () => numberInput.connect(machine.service, normalizeProps);
  const sync = () => {
    const api = getApi();
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(label, api.getLabelProps() as DomProps);
    applyZagProps(control, api.getControlProps() as DomProps);
    applyZagProps(input, api.getInputProps() as DomProps);
    applyZagProps(decrement, api.getDecrementTriggerProps() as DomProps);
    applyZagProps(increment, api.getIncrementTriggerProps() as DomProps);
  };
  const cleanups = [
    bindZagEvents(input, () => getApi().getInputProps() as DomProps),
    bindZagEvents(
      decrement,
      () => getApi().getDecrementTriggerProps() as DomProps,
    ),
    bindZagEvents(
      increment,
      () => getApi().getIncrementTriggerProps() as DomProps,
    ),
  ];
  const unsubscribe = machine.subscribe(sync);
  sync();
  return () => {
    unsubscribe();
    for (const cleanup of cleanups) cleanup();
    machine.stop();
  };
}
export const mountNumberField = createConnectMount({
  key: "number-field",
  rootSelector: selector.root,
  connect,
});
