<script lang="ts">
  import {
    anchoredParts,
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { colorPicker } from "@skryensya/core/machines";
  import { colorPickerParts } from "@skryensya/core/color-picker";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, ensureClasses, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import ColorPickerPanel from "./ColorPickerPanel.svelte";

  /*
   * COLOR PICKER, enhancer machine-backed sobre `@zag-js/color-picker` (la MISMA máquina que usa
   * React). Igual reparto que DatePicker: el CONTROL (label, trigger con su swatch) es markup
   * autorado que se parchea; el PANEL (área, rieles, filas de canal, presets) es chrome derivado
   * y lo posee `ColorPickerPanel`, este componente sólo le pone alrededor el popover.
   *
   * `data-anatomy` (puesto por la plantilla del contrato, "full" o "compact") decide qué filas
   * dibuja el panel; la máquina en sí es idéntica para ambas señaturas.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>(`.${colorPickerParts.label}`);
  const control = root.querySelector<HTMLElement>(`.${colorPickerParts.control}`);
  const trigger = root.querySelector<HTMLButtonElement>(`.${colorPickerParts.trigger}`);
  // Opcional, como el `<select>` oculto de Select: sólo lo parcha si el autor lo puso (o el
  // emisor lo generó). Sin él, `name` simplemente no llega a un submit.
  const hiddenInput = root.querySelector<HTMLInputElement>(`.${colorPickerParts.hiddenInput}`);
  const authoredTriggerLabel = trigger?.getAttribute("aria-label") ?? null;

  if (!control) throw new Error(`[data-sk-color-picker] necesita un .${colorPickerParts.control}.`);
  if (!trigger) throw new Error(`[data-sk-color-picker] necesita un .${colorPickerParts.trigger}.`);

  if (!root.id) root.id = uniqueId("sk-color-picker");
  const anatomy = root.dataset.anatomy === "compact" ? "compact" : "full";
  const swatches = (root.dataset.swatches ?? "").split(/\s+/).filter(Boolean);

  let positioner: HTMLElement | undefined = $state();

  const service = useMachine(colorPicker.machine, () => ({
    id: root.id,
    // El emisor sólo escribe `name` en el hidden input (es el único nodo de la plantilla que lo
    // reclama, igual que el `<select>` oculto de Select), así que se lee de ahí primero; el root
    // sigue siendo el fallback para markup escrito a mano sin ese input.
    name: hiddenInput?.name || root.dataset.name || undefined,
    defaultValue: colorPicker.parse(root.dataset.value || "#000000"),
    disabled: root.hasAttribute("data-disabled"),
    readOnly: root.hasAttribute("data-readonly"),
    required: root.hasAttribute("data-required"),
    invalid: root.hasAttribute("data-invalid"),
    onValueChange(details: { valueAsString: string }) {
      root.dispatchEvent(
        new CustomEvent("sk-value-change", { bubbles: true, detail: { value: details.valueAsString } }),
      );
    },
  }));

  const api = $derived(colorPicker.connect(service, normalizeProps));

  // Anchor positioning, mismo mecanismo que DatePicker (ADR-25): con la API del navegador, el
  // `style` de Zag para el positioner se descarta y coloca CSS anchor positioning; sin ella, pasa
  // intacto y Zag posiciona.
  const anchored = supportsAnchorPositioning();
  let unbindAnchor: (() => void) | undefined;
  const positionerProps = (props: DomProps): DomProps =>
    anchored ? (stripPositioningStyle(props) as DomProps) : props;

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    if (label) applyZagProps(label, api.getLabelProps() as DomProps);
    if (hiddenInput) applyZagProps(hiddenInput, api.getHiddenInputProps() as DomProps);
    applyZagProps(control, api.getControlProps() as DomProps);
    ensureClasses(control, anchoredParts.anchor);
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    /*
     * Zag SIEMPRE manda `aria-labelledby` apuntando al label del campo, además de su propio
     * `aria-label` ("select color. current color is ..."). En el algoritmo de nombre accesible,
     * `aria-labelledby` le gana a `aria-label`, así que ese `aria-labelledby` silenciaba el
     * `triggerLabel` del contrato (que SIEMPRE tiene un valor, por default), sin importar qué
     * dijera `aria-label`. `triggerLabel` es el mecanismo de nombrado de este contrato: se quita
     * el `aria-labelledby` de Zag para que el `aria-label` (autorado o el default) mande.
     */
    trigger.removeAttribute("aria-labelledby");
    if (authoredTriggerLabel !== null) trigger.setAttribute("aria-label", authoredTriggerLabel);
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    cleanups.push(bindZagEvents(trigger, () => api.getTriggerProps() as DomProps));
    if (anchored) unbindAnchor = bindAnchor(control, positioner, anchorNameFor(root.id));
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
  });
</script>

<div
  bind:this={positioner}
  {...positionerProps(api.getPositionerProps() as DomProps)}
  class="{colorPickerParts.positioner} {anchoredParts.positioner}"
>
  <div {...api.getContentProps()} class={colorPickerParts.content}>
    <ColorPickerPanel {api} {anatomy} {swatches} />
  </div>
</div>
