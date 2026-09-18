<script lang="ts">
  import { checkbox } from "@skryensya/core/machines";
  import { tileCommands, tileEvents } from "@skryensya/core/tile";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TILE CHECKBOX, over `@zag-js/checkbox` (the machine React uses in tile.tsx). The `<label>` is the
   * root (getRootProps) and the authored `<input type=checkbox data-part=input>` is Zag's hidden input
   * (getHiddenInputProps): Zag controls it and the visual control is the authored
   * `[data-part=indicator]`, styled by the `data-state` Zag puts on the root. Same model as React.
   */
  const root = getRoot();
  const input = root.querySelector<HTMLInputElement>('input[type="checkbox"][data-part="input"], input[type="checkbox"]');
  if (!input) throw new Error("TileCheckbox requires an input[type=checkbox] part.");

  if (!root.id) root.id = uniqueId("sk-tile-checkbox");
  /*
   * PRESENT MEANS TRUE, which is what an HTML boolean attribute means and what the emitter writes.
   *
   * This used to accept only the literal string "true", so a tree-authored tile (`data-default-checked`
   * with no value, the standard serialization the compiler emits for a boolean option) fell through
   * to `undefined` and rendered unchecked while the React binding beside it rendered checked. Hand
   * written `="true"` still works, and so does an explicit `="false"`; the two lines below already
   * read `disabled` and `required` by presence alone, so this is the file agreeing with itself.
   */
  const dc = root.getAttribute("data-default-checked");
  const defaultChecked: boolean | "indeterminate" | undefined =
    dc === null ? undefined : dc === "indeterminate" ? "indeterminate" : dc === "false" ? false : true;

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

  const bindings: PartBinding[] = [
    {
      part: "root",
      node: () => root,
      props: () => api.getRootProps(),
      events: true,
      classes: ["sk-interactive"],
      after: () => scopeTile(root),
    },
    {
      part: "input",
      node: () => input,
      props: () => api.getHiddenInputProps(),
      events: true,
      after: () => {
        // `checked`/`indeterminate` are live PROPERTIES of the input, not attributes: setAttribute does
        // not sync them (and the browser's form.reset goes back to the attribute). We mirror them from
        // Zag's state, which is the source of truth (restoration on reset included).
        input.checked = api.checked;
        input.indeterminate = api.indeterminate;
        input.setAttribute("data-part", "input");
      },
    },
  ];

  bindParts(bindings);

  /* A composition that owns the value sets it here; the machine reports it back as `checkedChange`. */
  $effect(() => {
    const onSetChecked = (event: Event) => {
      const checked = (event as CustomEvent<{ checked: boolean }>).detail?.checked === true;
      if (checked === api.checked) return;
      api.setChecked(checked);
    };
    root.addEventListener(tileCommands.setChecked, onSetChecked);
    return () => root.removeEventListener(tileCommands.setChecked, onSetChecked);
  });
</script>
