<script lang="ts">
  import {
    anchoredParts,
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { datePicker } from "@skryensya/core/machines";
  import { datePickerParts } from "@skryensya/core/date-picker";
  import { calendarParts } from "@skryensya/core/calendar";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import { remountIcons } from "../icon.js";
  import CalendarView from "./CalendarView.svelte";

  /*
   * DATE PICKER, enhancer machine-backed sobre `@zag-js/date-picker` (la MISMA máquina que usa React).
   *
   * Reparte el trabajo por dueño, como Carousel: el CONTROL (label, input, trigger, clear) es markup
   * autorado que se parchea; el CALENDARIO es chrome derivado del estado y lo posee `CalendarView`
   * (compartido con el Calendar standalone), este componente sólo le pone alrededor el popover.
   *
   * El input nativo `type="date"` sigue siendo la capa sin JS: comparte `.sk-date-picker__control`, así
   * que la versión nativa y la enhanceada se ven como el MISMO campo, y sin la capa vanilla montada el
   * consumidor autora la nativa. Este enhancer sólo aparece cuando el markup pide `data-sk-date-picker`.
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

  /* El positioner lo renderiza este componente (es chrome derivado), así que la referencia sale del
   * template de abajo y no de una query sobre markup autorado, como el control. */
  let positioner: HTMLElement | undefined = $state();

  const service = useMachine(datePicker.machine, () => ({
    id: root.id,
    name: root.dataset.name || input.name || undefined,
    // Fecha explícita, nunca un string de locale ambiguo: locale y zona horaria se autoran o caen a es/UTC.
    locale,
    timeZone: root.dataset.timeZone || "UTC",
    selectionMode: (root.dataset.selectionMode === "range" ? "range" : "single") as "single" | "range",
    disabled: root.hasAttribute("data-disabled"),
    readOnly: root.hasAttribute("data-readonly"),
    required: root.hasAttribute("data-required"),
    // Alto de calendario estable entre meses: seis filas siempre, así abrir no reflowea la página.
    fixedWeeks: true,
    onValueChange(details: { valueAsString: string[] }) {
      root.dispatchEvent(
        new CustomEvent("sk-value-change", { bubbles: true, detail: { value: details.valueAsString } }),
      );
    },
  }));

  const api = $derived(datePicker.connect(service, normalizeProps));

  /*
   * Anchor positioning, ahora vía el pattern Anclaje (ADR-25). Donde el navegador tiene la API coloca
   * él el calendario y NO le pasamos a Zag el `style` inline, para que no peleen dos motores. Sin la
   * API, el `style` de Zag pasa intacto y él posiciona (el fallback).
   *
   * Antes esto estampaba `--sk-date-picker-anchor` sobre el root y date-picker.css lo leía en el
   * positioner, pero NADA le ponía nunca un `anchor-name` al control: la mitad del cableado faltaba,
   * así que el bloque `@supports` no colocaba nada y Zag terminaba posicionando siempre.
   */
  const anchored = supportsAnchorPositioning();
  let unbindAnchor: (() => void) | undefined;
  const positionerProps = (props: DomProps): DomProps =>
    anchored ? (stripPositioningStyle(props) as DomProps) : props;

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    if (label) applyZagProps(label, api.getLabelProps() as DomProps);
    applyZagProps(control, api.getControlProps() as DomProps);
    control.classList.add(anchoredParts.anchor);
    applyZagProps(input, api.getInputProps({ index: 0 }) as DomProps);
    if (authoredPlaceholder !== null) input.placeholder = authoredPlaceholder;
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    if (clear) {
      applyZagProps(clear, api.getClearTriggerProps() as DomProps);
      if (authoredClearLabel !== null) clear.setAttribute("aria-label", authoredClearLabel);
      // El clear sólo tiene sentido con una fecha puesta; sin valor no ocupa lugar en el campo.
      clear.hidden = api.value.length === 0;
    }
  });

  // Los handlers de Zag se cablean una vez y se re-leen en cada disparo: la máquina cambia de estado y
  // con ella el closure. Los triggers del calendario (prev/next/vista/día) los renderiza CalendarView
  // con sus handlers ya cableados por Svelte, así que sólo el control autorado necesita bindZagEvents.
  const cleanups: Array<() => void> = [];
  onMount(() => {
    cleanups.push(bindZagEvents(input, () => api.getInputProps({ index: 0 }) as DomProps));
    cleanups.push(bindZagEvents(trigger, () => api.getTriggerProps() as DomProps));
    if (clear) {
      cleanups.push(bindZagEvents(clear, () => api.getClearTriggerProps() as DomProps));
    }
    // El cableado ancla↔popup, después del primer render: el positioner sale del template de abajo.
    if (anchored) unbindAnchor = bindAnchor(control, positioner, anchorNameFor(root.id));
    // Los chevrones se autoran como placeholders `data-sk-icon` y los hidrata el set ya registrado.
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
