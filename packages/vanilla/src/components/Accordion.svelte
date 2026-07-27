<script lang="ts">
  import { accordionDataParts, accordionEvents, accordionParts, accordionScope } from "@skryensya/core/accordion";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";
  import AccordionItem from "./AccordionItem.svelte";

  /*
   * ACCORDION, coordina un `@zag-js/collapsible` POR item (ver AccordionItem.svelte y ADR-0024), en vez
   * de una sola máquina `@zag-js/accordion`. Ese cambio es lo que arregla la animación: la máquina de
   * accordion ocultaba el contenido (`hidden`) apenas se cerraba, matando el colapso, y no exponía
   * `--height`; collapsible-por-item anima apertura Y cierre por igual. La lógica single/multiple/collapsible
   * (misma que la de React) vive acá: mantenemos el set abierto y le pasamos `open` controlado a cada item.
   */
  const root = getRoot();
  const itemEls = Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-part="item"]'));
  itemEls.forEach((el, i) => {
    if (!el.dataset.value) el.dataset.value = el.id || `item-${i + 1}`;
  });

  if (!root.id) root.id = uniqueId("sk-accordion");
  root.classList.add(accordionParts.root);
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
      content: el.querySelector<HTMLElement>('[data-part="content"]'),
      disabled: rootDisabled || el.hasAttribute("data-disabled"),
    };
  });

  const normalized = [...new Set(multiple ? initial : initial.slice(0, 1))].filter(Boolean);
  let values = $state<string[]>(normalized);

  // Misma lógica que AccordionRoot.toggle en React: single reemplaza; multiple acumula; `collapsible`
  // (sólo single) decide si el item abierto puede volver a cerrarse.
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
