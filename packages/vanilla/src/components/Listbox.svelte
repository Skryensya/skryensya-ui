<script lang="ts">
  import {
    listboxAttrs,
    listboxDefaultValue,
    listboxEvents,
    type ListboxItem,
    type ListboxOptions,
    type ListboxValueChangeDetails,
  } from "@skryensya/core/listbox";
  import { listbox } from "@skryensya/core/machines";
  import { selectorsFor } from "@skryensya/core/selectors";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { bindParts, type PartBinding } from "../runtime/bind-part.svelte";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * LISTBOX, a machine-backed enhancer over `@zag-js/listbox` (the SAME machine React uses). It
   * renders nothing: the options are the authored `[data-sk-listbox-item]` rows, read once into the
   * machine's collection, and every patch after that is Zag's props on the nodes already there.
   */
  const root = getRoot();
  const selector = selectorsFor(listboxAttrs);

  const content = root.querySelector<HTMLElement>(selector.content);
  const label = root.querySelector<HTMLElement>(selector.label);
  const itemEls = Array.from(root.querySelectorAll<HTMLElement>(selector.item));

  if (!content) throw new Error("Listbox requires a [data-sk-listbox-content] element.");
  if (itemEls.length === 0) throw new Error("Listbox requires at least one [data-sk-listbox-item].");

  function readItem(el: HTMLElement): ListboxItem {
    const value = el.dataset.value;
    if (!value) throw new Error("Every [data-sk-listbox-item] needs a non-empty data-value.");
    const text = el.querySelector<HTMLElement>(selector.itemText) ?? el;
    return {
      value,
      label: text.textContent?.trim() || value,
      disabled: el.hasAttribute("data-disabled"),
      defaultSelected: el.hasAttribute("data-default-selected"),
    };
  }

  const items = itemEls.map(readItem);
  const collection = listbox.collection<ListboxItem>({
    items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => Boolean(item.disabled),
  });

  if (!root.id) root.id = uniqueId("sk-listbox");

  const authoredMode = root.dataset.selectionMode;
  const selectionMode: ListboxOptions["selectionMode"] =
    authoredMode === "multiple" || authoredMode === "extended" ? authoredMode : "single";
  const orientation: ListboxOptions["orientation"] =
    root.dataset.orientation === "horizontal" ? "horizontal" : "vertical";

  const service = useMachine(listbox.machine, () => ({
    id: root.id,
    ids: { label: label?.id || undefined, content: content.id || undefined },
    collection,
    selectionMode,
    orientation,
    disabled: root.hasAttribute("data-disabled"),
    defaultValue: listboxDefaultValue(items),
    onValueChange(details: { value: string[] }) {
      root.dispatchEvent(
        new CustomEvent<ListboxValueChangeDetails>(listboxEvents.valueChange, {
          bubbles: true,
          detail: { value: details.value },
        }),
      );
    },
  }));
  const api = $derived(listbox.connect(service, normalizeProps));

  const bindings: PartBinding[] = [
    { part: "root", node: () => root, props: () => api.getRootProps() },
    { part: "label", node: () => label, props: () => api.getLabelProps() },
    { part: "content", node: () => content, props: () => api.getContentProps(), events: true },
    ...itemEls.flatMap((el, index): PartBinding[] => {
      const item = items[index]!;
      return [
        { part: "item", node: () => el, props: () => api.getItemProps({ item }), events: true, classes: ["sk-interactive"] },
        {
          part: "itemText",
          node: () => el.querySelector<HTMLElement>(selector.itemText),
          props: () => api.getItemTextProps({ item }),
        },
        {
          part: "itemIndicator",
          node: () => el.querySelector<HTMLElement>(selector.itemIndicator),
          props: () => api.getItemIndicatorProps({ item }),
        },
      ];
    }),
  ];

  bindParts(bindings);
</script>
