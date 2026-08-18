<script lang="ts">
  import {
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { selectEvents, type SelectOption, type SelectValueChangeDetails } from "@skryensya/core/select";
  import { select } from "@skryensya/core/machines";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * SELECT, enhancer machine-backed sobre `@zag-js/select` (la MISMA máquina que usa React, vía
   * `@skryensya/core/machines`). No renderiza estructura: escanea su markup autorado (label,
   * control, trigger, positioner, content, items, y el `<select>` oculto opcional) y parchea los
   * atributos que devuelve `connect` sobre esos nodos.
   *
   * No hay equivalente nativo para un listbox con typeahead, resaltado y colocación controlada
   * (decisión 8), así que una máquina se gana el lugar, la misma que usa React.
   */
  const root = getRoot();

  const selector = {
    hidden: "[data-sk-select-hidden]",
    label: "[data-sk-select-label]",
    control: "[data-sk-select-control]",
    trigger: "[data-sk-select-trigger]",
    value: "[data-sk-select-value]",
    indicator: "[data-sk-select-indicator]",
    positioner: "[data-sk-select-positioner]",
    content: "[data-sk-select-content]",
    item: "[data-sk-select-item]",
    itemText: "[data-sk-select-item-text]",
    itemIndicator: "[data-sk-select-item-indicator]",
  } as const;

  const trigger = root.querySelector<HTMLElement>(selector.trigger);
  const valueEl = root.querySelector<HTMLElement>(selector.value);
  const content = root.querySelector<HTMLElement>(selector.content);
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const itemEls = Array.from(root.querySelectorAll<HTMLElement>(selector.item));

  if (!trigger) throw new Error("Select requires a [data-sk-select-trigger] element.");
  if (!content) throw new Error("Select requires a [data-sk-select-content] element.");
  if (itemEls.length === 0) throw new Error("Select requires at least one [data-sk-select-item].");

  function readItem(el: HTMLElement): SelectOption {
    const value = el.dataset.value;
    if (!value) throw new Error("Every [data-sk-select-item] needs a non-empty data-value.");

    const text = el.querySelector<HTMLElement>(selector.itemText) ?? el;

    return {
      value,
      label: text.textContent?.trim() || value,
      disabled: el.hasAttribute("data-disabled"),
    };
  }

  /*
   * The hidden select is optional, it is what makes the menu submit inside a form, and what a no-JS
   * visitor is left with. When it is there it must agree with the items, because two authored lists
   * that drift render a menu that submits a different value than it shows.
   */
  function assertHiddenSelectMatches(hidden: HTMLSelectElement, items: readonly SelectOption[]): void {
    const authored = Array.from(hidden.options).map((option) => option.value);
    const expected = items.map((item) => item.value);

    if (authored.join(" ") !== expected.join(" ")) {
      throw new Error(
        `Select hidden select drifted from its items: [${authored.join(", ")}] vs [${expected.join(", ")}].`,
      );
    }
  }

  const items = itemEls.map(readItem);
  const hidden = root.querySelector<HTMLSelectElement>(selector.hidden);
  if (hidden) assertHiddenSelectMatches(hidden, items);

  const collection = select.collection<SelectOption>({
    items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => Boolean(item.disabled),
  });

  const placeholder = root.dataset.placeholder ?? "";
  // Capturado UNA vez, nunca releído del DOM: `getRootProps().id` devuelve un id namespaced
  // (`select:${id}`) que `applyZagProps` escribe de vuelta sobre `root.id`. Leer `root.id` en vivo
  // desde el factory reactivo de `useMachine` retroalimentaría ese prefijo en cada recomputación.
  // El original imperativo nunca mutaba `root.id`; esto reproduce lo mismo.
  const selectId = root.id || uniqueId("sk-select");

  // PROGRESSIVE ENHANCEMENT, cuando el navegador tiene la CSS Anchor Positioning API, la colocación
  // vive en select.css (detrás del mismo @supports); lo único que no puede vivir en CSS compartido
  // es la relación ancla↔popup: un nombre único a esta instancia que ata ESTE trigger a ESTE
  // listbox. Donde falta la API, `anchorName` es null y la colocación JS de Zag (configurada abajo)
  // es la única, el fallback, no una ruta de segunda.
  const anchorName = supportsAnchorPositioning() ? anchorNameFor(selectId) : null;
  let unbindAnchor: (() => void) | undefined;

  /* Sólo las parts a las que el consumidor le puso un id; el resto sigue siendo de la máquina. */
  function authoredIds(): Record<string, string> {
    const ids: Record<string, string> = {};
    const claim = (key: string, el: HTMLElement | null) => {
      if (el?.id) ids[key] = el.id;
    };

    claim("root", root);
    claim("trigger", trigger);
    claim("content", content);
    claim("hiddenSelect", hidden);
    claim("control", root.querySelector(selector.control));
    claim("label", root.querySelector(selector.label));
    claim("positioner", root.querySelector(selector.positioner));

    return ids;
  }

  const readDefaultValue = (): string[] | undefined => {
    const value = root.dataset.value;
    return value ? [value] : undefined;
  };

  // Capturados UNA vez, antes de que la máquina escriba nada: leer esto en vivo dentro del factory
  // reactivo empezaría a reclamar como "autorados" los ids que la máquina misma generó en el
  // primer render.
  const ids = authoredIds();

  const service = useMachine(select.machine, () => ({
    id: selectId,
    // Authored ids win. Left to itself the machine derives its own (`select:brand`) and spreads
    // them over whatever the consumer wrote, so an id they authored would silently change the
    // moment this mounts.
    ids,
    collection,
    name: hidden?.name ?? root.dataset.name,
    disabled: root.hasAttribute("data-disabled"),
    required: root.hasAttribute("data-required"),
    defaultValue: readDefaultValue(),
    positioning: {
      placement: "bottom-start" as const,
      sameWidth: true,
      gutter: 8,
      flip: true,
      boundary: root.closest("dialog") ? document.documentElement : undefined,
    },
    onValueChange(details: { value: string[] }) {
      const change: SelectValueChangeDetails = { value: details.value };
      root.dispatchEvent(
        new CustomEvent<SelectValueChangeDetails>(selectEvents.valueChange, { bubbles: true, detail: change }),
      );
    },
  }));

  const api = $derived(select.connect(service, normalizeProps));

  $effect(() => {
    applyZagProps(root, api.getRootProps() as DomProps);
    if (hidden) applyZagProps(hidden, api.getHiddenSelectProps() as DomProps);
    const label = root.querySelector<HTMLElement>(selector.label);
    if (label) applyZagProps(label, api.getLabelProps() as DomProps);
    const control = root.querySelector<HTMLElement>(selector.control);
    if (control) applyZagProps(control, api.getControlProps() as DomProps);
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    if (valueEl) applyZagProps(valueEl, api.getValueTextProps() as DomProps);
    const indicator = root.querySelector<HTMLElement>(selector.indicator);
    if (indicator) applyZagProps(indicator, api.getIndicatorProps() as DomProps);

    // On the anchor path, CSS owns placement (select.css), so drop Zag's inline positioning styles
    // entirely; leaving them would fight the browser's positioner.
    const positionerProps = api.getPositionerProps() as DomProps;
    if (positioner)
      applyZagProps(positioner, anchorName ? (stripPositioningStyle(positionerProps) as DomProps) : positionerProps);
    applyZagProps(content, api.getContentProps() as DomProps);

    itemEls.forEach((el, index) => {
      const item = items[index]!;
      const itemProps = api.getItemProps({ item }) as DomProps;
      /*
       * Zag's `aria-selected` tracks the COMMITTED value, not the row under
       * `aria-activedescendant`. The WAI reference implementation moves `aria-selected="true"` onto
       * whichever option is highlighted as you arrow through the list, before Enter commits
       * anything.
       */
      itemProps["aria-selected"] = item.value === api.highlightedValue ? "true" : undefined;
      applyZagProps(el, itemProps);
      const text = el.querySelector<HTMLElement>(selector.itemText);
      if (text) applyZagProps(text, api.getItemTextProps({ item }) as DomProps);
      const indicatorEl = el.querySelector<HTMLElement>(selector.itemIndicator);
      if (indicatorEl) applyZagProps(indicatorEl, api.getItemIndicatorProps({ item }) as DomProps);
    });

    /* The displayed value is the machine's, it changes on every selection, so this is the one
     * place this writes CONTENT rather than attributes. The placeholder is still theirs. */
    if (valueEl) valueEl.textContent = api.valueAsString || placeholder;

    // Re-assert the anchor wiring HERE, not once at mount: the positioner spread above rewrites
    // its inline style each render, dropping the hook set earlier. Stamping after the spread keeps
    // it stable across every open/close; idempotent, so it's free to repeat.
    if (anchorName && positioner) unbindAnchor = bindAnchor(trigger, positioner, anchorName);
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    cleanups.push(bindZagEvents(trigger, () => api.getTriggerProps() as DomProps));
    if (content) cleanups.push(bindZagEvents(content, () => api.getContentProps() as DomProps));
    itemEls.forEach((el, index) => {
      const item = items[index]!;
      cleanups.push(bindZagEvents(el, () => api.getItemProps({ item }) as DomProps));
    });
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
  });
</script>
