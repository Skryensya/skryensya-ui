<script lang="ts">
  import { radioGroup as radio } from "@skryensya/core/machines";
  import { tileEvents, type TileRadioOrientation } from "@skryensya/core/tile";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * TILE RADIO GROUP, over `@zag-js/radio-group` (the machine React uses in tile.tsx). Every
   * `[data-part=item]` is a radio: the label receives getItemProps, and its authored `<input type=radio>`
   * is Zag's hidden input (getItemHiddenInputProps). Zag guarantees mutual exclusion; the input's live
   * `checked` is mirrored from `api.value`.
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
        // for its own label to point at. Invisible on screen, missing in the accessibility tree.
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

  const bindings: PartBinding[] = [
    {
      part: "root",
      node: () => root,
      props: () => api.getRootProps(),
      after: () => scopeTile(root),
    },

    ...items.flatMap((item): PartBinding[] => [
      {
        part: "item",
        node: () => item.label,
        props: () => api.getItemProps({ value: item.value }),
        events: true,
        classes: ["sk-interactive"],
        after: (node) => {
          scopeTile(node);
          node.setAttribute("data-part", "item");
        },
      },
      {
        part: "item-input",
        node: () => item.input,
        props: () => api.getItemHiddenInputProps({ value: item.value }),
        events: true,
        after: () => {
          // `checked` is a live property of the radio; setAttribute does not sync it. Source of truth
          // is `api.value`.
          item.input.checked = api.value === item.value;
          item.input.setAttribute("data-part", "input");
        },
      },
      /*
       * The machine's part names are the radio group's (`item-text`, `item-control`); the tile's
       * vocabulary is `content` and `indicator`, and the CSS reads the tile's. Restored after the
       * patch, exactly as `data-scope` is. React does the same by writing them after the spread.
       */
      {
        part: "item-text",
        node: () => item.text,
        props: () => api.getItemTextProps({ value: item.value }),
        after: (node) => node.setAttribute("data-part", "content"),
      },
      {
        part: "item-control",
        node: () => item.control,
        props: () => api.getItemControlProps({ value: item.value }),
        after: (node) => node.setAttribute("data-part", "indicator"),
      },
    ]),
  ];

  bindParts(bindings);
</script>
