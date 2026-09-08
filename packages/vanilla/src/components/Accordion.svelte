<script lang="ts">
  import { accordionDataParts, accordionEvents, accordionParts, accordionScope } from "@skryensya/core/accordion";
  import { ensureClasses } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import AccordionItem from "./AccordionItem.svelte";

  /*
   * ACCORDION, coordinates one `@zag-js/collapsible` PER item (see AccordionItem.svelte and ADR-0024),
   * instead of a single `@zag-js/accordion` machine. That change is what fixes the animation: the
   * accordion machine hid the content (`hidden`) as soon as it closed, killing the collapse, and did not
   * expose `--height`; collapsible-per-item animates opening AND closing alike. The
   * single/multiple/collapsible logic (the same as React's) lives here: we keep the open set and pass a
   * controlled `open` to each item.
   */
  const root = getRoot();
  const itemEls = Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-part="item"]'));
  itemEls.forEach((el, i) => {
    if (!el.dataset.value) el.dataset.value = el.id || `item-${i + 1}`;
  });

  // No id on the root: nothing points at it. Each item gets one because its trigger and content
  // point at each other, and the coordinator has no such pair.
  ensureClasses(root, accordionParts.root);
  root.setAttribute("data-part", accordionDataParts.root);
  root.setAttribute("data-scope", accordionScope);

  const multiple = root.dataset.type === "multiple";
  const canCollapse = root.dataset.collapsible !== "false";
  const rootDisabled = root.hasAttribute("data-disabled");

  const declared = root.dataset.defaultValue;
  const initial = declared
    ? multiple
      ? declared.split(",")
      : [declared]
    : itemEls.filter((el) => el.hasAttribute("data-default-open")).map((el) => el.dataset.value ?? "");

  type Item = { id: string; value: string; el: HTMLElement; trigger: HTMLElement | null; content: HTMLElement | null; disabled: boolean };
  const items: Item[] = itemEls.map((el) => {
    if (!el.id) el.id = uniqueId("sk-accordion-item");
    return {
      id: el.id,
      value: el.dataset.value ?? "",
      el,
      trigger: el.querySelector<HTMLElement>('[data-part="trigger"]'),
      /*
       * DIRECT CHILD, not any descendant. `data-part="content"` names two different things in this
       * component's vocabulary: the collapsible PANEL, and the title-and-description block a Tile
       * puts inside its trigger (`tileDataParts.content` and `.expandableContent` are both the
       * string "content"). A descendant query finds whichever comes first in the DOM, which is the
       * one inside the button, so a section built out of TileContent bound the wrong element as its
       * panel: the answer never collapsed and stayed exposed to a screen reader.
       */
      content: el.querySelector<HTMLElement>(':scope > [data-part="content"]'),
      disabled: rootDisabled || el.hasAttribute("data-disabled"),
    };
  });

  const normalized = [...new Set(multiple ? initial : initial.slice(0, 1))].filter(Boolean);
  let values = $state<string[]>(normalized);

  // Same logic as AccordionRoot.toggle in React: single replaces; multiple accumulates; `collapsible`
  // (single only) decides whether the open item can be closed again.
  function toggle(value: string): void {
    const isOpen = values.includes(value);
    let next: string[];
    if (isOpen) next = multiple || canCollapse ? values.filter((entry) => entry !== value) : values;
    else next = multiple ? [...values, value] : [value];

    values = next;
    const detail = { value: multiple ? next : (next[0] ?? null) };
    root.dispatchEvent(new CustomEvent(accordionEvents.valueChange, { bubbles: true, detail }));
  }
</script>

{#each items as item (item.value)}
  <AccordionItem
    id={item.id}
    value={item.value}
    el={item.el}
    trigger={item.trigger}
    content={item.content}
    disabled={item.disabled}
    open={values.includes(item.value)}
    onToggle={toggle}
  />
{/each}
