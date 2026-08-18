<script lang="ts">
  import { checkbox } from "@skryensya/core/machines";
  import { tileEvents } from "@skryensya/core/tile";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, ensureClasses, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TILE CHECKBOX, sobre `@zag-js/checkbox` (la máquina que usa React en tile.tsx). El `<label>` es la
   * raíz (getRootProps) y el `<input type=checkbox data-part=input>` autorado es el input oculto de Zag
   * (getHiddenInputProps): Zag lo controla y el control visual es el `[data-part=indicator]` autorado,
   * estilado por el `data-state` que Zag pone en la raíz. Mismo modelo que React.
   */
  const root = getRoot();
  const input = root.querySelector<HTMLInputElement>('input[type="checkbox"][data-part="input"], input[type="checkbox"]');
  if (!input) throw new Error("TileCheckbox requires an input[type=checkbox] part.");

  if (!root.id) root.id = uniqueId("sk-tile-checkbox");
  const dc = root.getAttribute("data-default-checked");
  const defaultChecked: boolean | "indeterminate" | undefined =
    dc === "true" ? true : dc === "indeterminate" ? "indeterminate" : dc === "false" ? false : undefined;

  const service = useMachine(checkbox.machine, () => ({
    id: root.id,
    name: root.dataset.name,
    value: root.dataset.value,
    disabled: root.hasAttribute("data-disabled"),
    required: root.hasAttribute("data-required"),
    defaultChecked,
    onCheckedChange(details: { checked: boolean | "indeterminate" }) {
      root.dispatchEvent(new CustomEvent(tileEvents.checkedChange, { bubbles: true, detail: { checked: details.checked } }));
    },
  }));
  const api = $derived(checkbox.connect(service, normalizeProps));

  const scopeTile = (el: HTMLElement) => el.setAttribute("data-scope", "tile");

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(input, api.getHiddenInputProps() as DomProps);
    // `checked`/`indeterminate` son PROPIEDADES vivas del input, no atributos: setAttribute no las
    // sincroniza (y el form.reset del navegador vuelve al atributo). Las espejamos desde el estado de
    // Zag, que es la fuente de verdad (incluye la restauración en reset).
    input.checked = api.checked;
    input.indeterminate = api.indeterminate;
    scopeTile(root);
    input.setAttribute("data-part", "input");
    ensureClasses(root, "sk-interactive");
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
