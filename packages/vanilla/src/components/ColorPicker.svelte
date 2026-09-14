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
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import ColorPickerPanel from "./ColorPickerPanel.svelte";

  /*
   * COLOR PICKER, a machine-backed enhancer over `@zag-js/color-picker` (the SAME machine React uses).
   * Same split as DatePicker: the CONTROL (label, trigger with its swatch) is authored markup that gets
   * patched; the PANEL (area, rails, channel rows, presets) is derived chrome and owned by
   * `ColorPickerPanel`, and this component only puts the popover around it.
   *
   * `data-anatomy` (set by the contract's template, "full" or "compact") decides which rows the panel
   * draws; the machine itself is identical for both signatures.
   */
  const root = getRoot();

  const label = root.querySelector<HTMLElement>(`.${colorPickerParts.label}`);
  const control = root.querySelector<HTMLElement>(`.${colorPickerParts.control}`);
  const trigger = root.querySelector<HTMLButtonElement>(`.${colorPickerParts.trigger}`);
  // Optional, like Select's hidden `<select>`: it is only patched if the author put it there (or the
  // emitter generated it). Without it, `name` simply does not reach a submit.
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
    // The emitter only writes `name` on the hidden input (it is the only node in the template that
    // claims it, just like Select's hidden `<select>`), so it is read from there first; the root is
    // still the fallback for hand-written markup without that input.
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

  // Anchor positioning, same mechanism as DatePicker (ADR-25): with the browser API, Zag's `style` for
  // the positioner is discarded and CSS anchor positioning places it; without it, it passes through
  // untouched and Zag positions.
  const anchored = supportsAnchorPositioning();
  let unbindAnchor: (() => void) | undefined;
  /** Generic, so the template spread below needs no cast either: `stripPositioningStyle` takes any object. */
  const positionerProps = <T extends object>(props: T) => (anchored ? stripPositioningStyle(props) : props);

  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    { part: "label", node: () => label, props: () => api.getLabelProps() },
    { part: "hiddenInput", node: () => hiddenInput, props: () => api.getHiddenInputProps() },
    {
      part: "control",
      node: () => control,
      props: () => api.getControlProps(),
      classes: [anchoredParts.anchor],
    },
    {
      part: "trigger",
      node: () => trigger,
      props: () => api.getTriggerProps(),
      events: true,
      after: (node) => {
        /*
         * Zag ALWAYS sends an `aria-labelledby` pointing at the field's label, in addition to its own
         * `aria-label` ("select color. current color is ..."). In the accessible name algorithm,
         * `aria-labelledby` beats `aria-label`, so that `aria-labelledby` silenced the contract's
         * `triggerLabel` (which ALWAYS has a value, by default), no matter what `aria-label` said.
         * `triggerLabel` is this contract's naming mechanism: Zag's `aria-labelledby` is removed so the
         * `aria-label` (authored or the default) is in charge.
         */
        node.removeAttribute("aria-labelledby");
        if (authoredTriggerLabel !== null) node.setAttribute("aria-label", authoredTriggerLabel);
      },
    },
  ];

  bindParts(bindings);

  onMount(() => {
    if (anchored) unbindAnchor = bindAnchor(control, positioner, anchorNameFor(root.id));
  });
  onDestroy(() => unbindAnchor?.());
</script>

<div
  bind:this={positioner}
  {...positionerProps(api.getPositionerProps())}
  class="{colorPickerParts.positioner} {anchoredParts.positioner}"
>
  <div {...api.getContentProps()} class={colorPickerParts.content}>
    <ColorPickerPanel {api} {anatomy} {swatches} />
  </div>
</div>
