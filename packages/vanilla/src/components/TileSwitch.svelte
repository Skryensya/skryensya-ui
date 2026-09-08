<script lang="ts">
  import { checkbox } from "@skryensya/core/machines";
  import { tileEvents } from "@skryensya/core/tile";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, ensureClasses, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TILE SWITCH, over the same `@zag-js/checkbox` as TileCheckbox: a switch is a checkbox with
   * `role="switch"` and no indeterminate state, the same relationship Switch (packages/react
   * selection.tsx) has with Checkbox. The `<label>` is the root (getRootProps) and the authored
   * `<input type=checkbox data-part=input>` is Zag's hidden input (getHiddenInputProps): Zag controls
   * it and the visual control is the authored `[data-part=indicator]`, styled by the `data-state` Zag
   * puts on the root. Same model as React.
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
    // `checked` is a live PROPERTY of the input, not an attribute: setAttribute does not sync it (and the
    // browser's form.reset goes back to the attribute). We mirror it from Zag's state, which is the
    // source of truth (restoration on reset included).
    input.checked = api.checked === true;
    scopeTile(root);
    input.setAttribute("data-part", "input");
    input.setAttribute("role", "switch");
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
