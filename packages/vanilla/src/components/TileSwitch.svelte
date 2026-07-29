<script lang="ts">
  import { checkbox } from "@skryensya/core/machines";
  import { tileEvents } from "@skryensya/core/tile";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TILE SWITCH, sobre el mismo `@zag-js/checkbox` que TileCheckbox: un switch es un checkbox con
   * `role="switch"` y sin estado indeterminado, la misma relación que Switch (packages/react
   * selection.tsx) tiene con Checkbox. El `<label>` es la raíz (getRootProps) y el
   * `<input type=checkbox data-part=input>` autorado es el input oculto de Zag
   * (getHiddenInputProps): Zag lo controla y el control visual es el `[data-part=indicator]`
   * autorado, estilado por el `data-state` que Zag pone en la raíz. Mismo modelo que React.
   */
  const root = getRoot();
  const input = root.querySelector<HTMLInputElement>('input[type="checkbox"][data-part="input"], input[type="checkbox"]');
  if (!input) throw new Error("TileSwitch requires an input[type=checkbox] part.");

  if (!root.id) root.id = uniqueId("sk-tile-switch");
  const dc = root.getAttribute("data-default-checked");
  const defaultChecked: boolean | undefined = dc === "true" ? true : dc === "false" ? false : undefined;

  const service = useMachine(checkbox.machine, () => ({
    id: root.id,
    name: root.dataset.name,
    value: root.dataset.value,
    disabled: root.hasAttribute("data-disabled"),
    required: root.hasAttribute("data-required"),
    defaultChecked,
    onCheckedChange(details: { checked: boolean | "indeterminate" }) {
      root.dispatchEvent(new CustomEvent(tileEvents.checkedChange, { bubbles: true, detail: { checked: details.checked === true } }));
    },
  }));
  const api = $derived(checkbox.connect(service, normalizeProps));

  const scopeTile = (el: HTMLElement) => el.setAttribute("data-scope", "tile");

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(input, api.getHiddenInputProps() as DomProps);
    // `checked` es una PROPIEDAD viva del input, no un atributo: setAttribute no la sincroniza (y el
    // form.reset del navegador vuelve al atributo). La espejamos desde el estado de Zag, que es la
    // fuente de verdad (incluye la restauración en reset).
    input.checked = api.checked === true;
    scopeTile(root);
    input.setAttribute("data-part", "input");
    input.setAttribute("role", "switch");
    root.classList.add("sk-interactive");
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    cleanups.push(bindZagEvents(root, () => api.getRootProps() as DomProps));
    cleanups.push(bindZagEvents(input, () => api.getHiddenInputProps() as DomProps));
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
