<script lang="ts">
  import { radioGroup as radio } from "@skryensya/core/machines";
  import { tileEvents, type TileRadioOrientation } from "@skryensya/core/tile";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, ensureClasses, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TILE RADIO GROUP, sobre `@zag-js/radio-group` (la máquina que usa React en tile.tsx). Cada
   * `[data-part=item]` es un radio: la label recibe getItemProps, su `<input type=radio>` autorado es
   * el input oculto de Zag (getItemHiddenInputProps). Zag garantiza exclusión mutua; el `checked` vivo
   * del input se espeja desde `api.value`.
   */
  const root = getRoot();

  type Item = {
    value: string;
    label: HTMLElement;
    input: HTMLInputElement;
    text: HTMLElement | null;
    control: HTMLElement | null;
  };
  const items: Item[] = Array.from(root.querySelectorAll<HTMLElement>('[data-part="item"]'))
    .map((label): Item | null => {
      const input = label.querySelector<HTMLInputElement>('input[type="radio"]');
      if (!input) return null;
      return {
        value: input.value,
        label,
        input,
        // The machine names these too, and leaving them unpatched left the option's text with no id
        // for its own label to point at — invisible on screen, missing in the accessibility tree.
        text: label.querySelector<HTMLElement>('[data-part="content"]'),
        control: label.querySelector<HTMLElement>('[data-part="indicator"]'),
      };
    })
    .filter((item): item is Item => item !== null);

  if (!root.id) root.id = uniqueId("sk-tile-radio");
  const orientation: TileRadioOrientation =
    root.getAttribute("data-orientation") === "horizontal" ? "horizontal" : "vertical";
  const defaultValue = root.getAttribute("data-default-value");

  const service = useMachine(radio.machine, () => ({
    id: root.id,
    name: root.dataset.name || "tile-radio",
    orientation,
    disabled: root.hasAttribute("data-disabled"),
    required: root.hasAttribute("data-required"),
    defaultValue: defaultValue ?? undefined,
    onValueChange(details: { value: string | null }) {
      root.dispatchEvent(new CustomEvent(tileEvents.valueChange, { bubbles: true, detail: { value: details.value } }));
    },
  }));
  const api = $derived(radio.connect(service, normalizeProps));

  const scopeTile = (el: HTMLElement) => el.setAttribute("data-scope", "tile");

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    scopeTile(root);
    for (const item of items) {
      const props = { value: item.value };
      applyZagProps(item.label, api.getItemProps(props) as DomProps);
      applyZagProps(item.input, api.getItemHiddenInputProps(props) as DomProps);
      // `checked` es propiedad viva del radio; setAttribute no la sincroniza. Fuente de verdad: api.value.
      item.input.checked = api.value === item.value;
      // The machine's part names are the radio group's (`item-text`, `item-control`); the tile's
      // vocabulary is `content` and `indicator`, and the CSS reads the tile's. Restored after the
      // patch, exactly as `data-scope` is — React does the same by writing them after the spread.
      if (item.text) {
        applyZagProps(item.text, api.getItemTextProps(props) as DomProps);
        item.text.setAttribute("data-part", "content");
      }
      if (item.control) {
        applyZagProps(item.control, api.getItemControlProps(props) as DomProps);
        item.control.setAttribute("data-part", "indicator");
      }
      scopeTile(item.label);
      item.label.setAttribute("data-part", "item");
      item.input.setAttribute("data-part", "input");
      ensureClasses(item.label, "sk-interactive");
    }
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    for (const item of items) {
      const props = { value: item.value };
      cleanups.push(bindZagEvents(item.input, () => api.getItemHiddenInputProps(props) as DomProps));
      cleanups.push(bindZagEvents(item.label, () => api.getItemProps(props) as DomProps));
    }
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
  });
</script>
