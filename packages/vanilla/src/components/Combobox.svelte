<script lang="ts">
  import {
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { combobox } from "@skryensya/core/machines";
  import { comboboxParts, type ComboboxItem } from "@skryensya/core/combobox";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * COMBOBOX, enhancer machine-backed sobre `@zag-js/combobox` (la MISMA máquina que usa React, vía
   * `@skryensya/core/machines`). No renderiza estructura: escanea su markup autorado y parchea los
   * atributos que devuelve `connect` sobre esos nodos. El filtro corre sobre los items AUTORADOS
   * (el DOM sigue siendo la fuente de verdad), nunca sobre una lista que el binding inventa.
   */
  const root = getRoot();

  const selector = {
    label: "[data-sk-combobox-label]",
    hint: "[data-sk-combobox-hint]",
    error: "[data-sk-combobox-error]",
    control: "[data-sk-combobox-control]",
    value: "[data-sk-combobox-value]",
    selectedItems: "[data-sk-combobox-selected-items]",
    removeTrigger: "[data-sk-combobox-remove-trigger]",
    input: "[data-sk-combobox-input]",
    trigger: "[data-sk-combobox-trigger]",
    clear: "[data-sk-combobox-clear]",
    positioner: "[data-sk-combobox-positioner]",
    content: "[data-sk-combobox-content]",
    item: "[data-sk-combobox-item]",
    itemText: "[data-sk-combobox-item-text]",
    itemIndicator: "[data-sk-combobox-item-indicator]",
    empty: "[data-sk-combobox-empty]",
    status: "[data-sk-combobox-status]",
  } as const;

  // Las teclas que mueven el resaltado dentro del listbox (las mismas que atiende la máquina).
  const navigationKeys = new Set(["ArrowDown", "ArrowUp", "Home", "End", "PageUp", "PageDown"]);
  const combiningMarks = /\p{M}+/gu;
  const searchKey = (value: string) => value.normalize("NFD").replace(combiningMarks, "").toLocaleLowerCase();

  /*
   * The text of a button, as a NAME rather than as characters. `textContent` produces the icon on
   * an icon-only control (the chevron/clear glyphs sit inside `aria-hidden="true"` precisely to say
   * they are decoration).
   */
  const nameText = (element: Element): string => {
    let text = "";
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? "";
      else if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node as Element).getAttribute("aria-hidden") !== "true" &&
        !(node as Element).hasAttribute("hidden")
      )
        text += nameText(node as Element);
    }
    return text.trim();
  };
  const fromTemplate = (template: string, values: Record<string, string>) => {
    let result = template;
    for (const [key, value] of Object.entries(values)) result = result.replace(`{${key}}`, value);
    return result;
  };

  const label = root.querySelector<HTMLElement>(selector.label);
  const hint = root.querySelector<HTMLElement>(selector.hint);
  const error = root.querySelector<HTMLElement>(selector.error);
  const control = root.querySelector<HTMLElement>(selector.control);
  const input = root.querySelector<HTMLInputElement>(selector.input);
  const trigger = root.querySelector<HTMLButtonElement>(selector.trigger);
  const clear = root.querySelector<HTMLButtonElement>(selector.clear);
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const content = root.querySelector<HTMLElement>(selector.content);

  const ready = Boolean(label && control && input && trigger && positioner && content);

  // Capturado UNA vez, nunca releído del DOM: `getRootProps().id` devuelve un id namespaced
  // (`combobox:${id}`) y `applyZagProps` lo escribe de vuelta sobre `root.id`. Leer `root.id` en
  // vivo desde el factory reactivo de `useMachine` retroalimentaría ese prefijo en cada
  // recomputación (`combobox:combobox:combobox:…`), que es exactamente lo que hacía crecer el id
  // sin límite. El original imperativo nunca mutaba `root.id`; esto reproduce lo mismo.
  const machineId = root.id || uniqueId("sk-combobox");

  /* El pattern Anclaje (ADR-25). El ancla es el CONTROL entero, no el chevron: la lista se alinea
   * con el campo que se está escribiendo. */
  const anchorName = supportsAnchorPositioning() ? anchorNameFor(machineId) : null;
  let unbindAnchor: (() => void) | undefined;

  let valueArea = root.querySelector<HTMLElement>(selector.value);
  if (ready && input && !valueArea) {
    valueArea = document.createElement("div");
    valueArea.className = comboboxParts.value;
    valueArea.setAttribute("data-sk-combobox-value", "");
    input.before(valueArea);
    valueArea.append(input);
  }
  let selectedItemsEl = root.querySelector<HTMLElement>(selector.selectedItems);
  if (ready && root.hasAttribute("data-multiple") && !selectedItemsEl && valueArea) {
    selectedItemsEl = document.createElement("div");
    selectedItemsEl.className = comboboxParts.selectedItems;
    selectedItemsEl.setAttribute("data-sk-combobox-selected-items", "");
    valueArea.prepend(selectedItemsEl);
  }
  if (selectedItemsEl) {
    selectedItemsEl.setAttribute("role", "list");
    selectedItemsEl.setAttribute("aria-label", root.dataset.selectedLabel ?? "Valores seleccionados");
  }

  let emptyEl = root.querySelector<HTMLElement>(selector.empty);
  if (ready && content && !emptyEl) {
    emptyEl = document.createElement("div");
    emptyEl.className = comboboxParts.empty;
    emptyEl.setAttribute("data-sk-combobox-empty", "");
    emptyEl.textContent = root.dataset.emptyLabel ?? "Sin resultados";
    content.append(emptyEl);
  }
  emptyEl?.setAttribute("role", "presentation");

  let statusEl = root.querySelector<HTMLElement>(selector.status);
  if (ready && control && !statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = `${comboboxParts.status} sk-visually-hidden`;
    statusEl.setAttribute("data-sk-combobox-status", "");
    statusEl.setAttribute("role", "status");
    statusEl.setAttribute("aria-atomic", "true");
    control.after(statusEl);
  }

  const invalid = input?.getAttribute("aria-invalid") === "true" || root.hasAttribute("data-invalid") || Boolean(error);
  const describedBy = [
    input?.getAttribute("aria-describedby"),
    hint ? (hint.id ||= `${machineId}:hint`) : undefined,
    error ? (error.id ||= `${machineId}:error`) : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const triggerLabel =
    trigger?.getAttribute("aria-label") ||
    root.dataset.triggerLabel ||
    (trigger ? nameText(trigger) : "") ||
    "Mostrar opciones";
  const clearLabel =
    clear?.getAttribute("aria-label") || root.dataset.clearLabel || (clear ? nameText(clear) : "") || "Limpiar selección";
  const resultText = (count: number) => {
    if (count === 0) return emptyEl?.textContent?.trim() || "Sin resultados";
    const template = count === 1 ? (root.dataset.resultLabel ?? "1 resultado disponible") : (root.dataset.resultsLabel ?? "{count} resultados disponibles");
    return fromTemplate(template, { count: String(count) });
  };
  const removeText = (item: ComboboxItem) => fromTemplate(root.dataset.removeLabel ?? "Quitar {label}", { label: item.label });

  type Authored = {
    node: HTMLElement;
    item: ComboboxItem;
    key: string;
    text: HTMLElement | null;
    indicator: HTMLElement | null;
  };
  const authored: Authored[] = Array.from(root.querySelectorAll<HTMLElement>(selector.item)).map((node) => {
    const itemLabel = node.dataset.valueText ?? node.textContent?.trim() ?? "";
    return {
      node,
      item: {
        value: node.dataset.value ?? node.textContent?.trim() ?? "",
        label: itemLabel,
        description: node.dataset.description,
        disabled: node.hasAttribute("disabled") || node.getAttribute("aria-disabled") === "true" || node.hasAttribute("data-disabled"),
      } satisfies ComboboxItem,
      key: searchKey(itemLabel),
      text: node.querySelector<HTMLElement>(selector.itemText),
      indicator: node.querySelector<HTMLElement>(selector.itemIndicator),
    };
  });
  const makeCollection = (items: ComboboxItem[]) =>
    combobox.collection<ComboboxItem>({
      items,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
      isItemDisabled: (item) => Boolean(item.disabled),
    });

  // `$state.raw`: siempre se REEMPLAZA, nunca se muta un elemento adentro, así que no hace falta
  // proxy profundo.
  let visible = $state.raw(authored);
  const multiple = root.hasAttribute("data-multiple");

  const filterAuthoredItems = (value: string) => {
    const needle = searchKey(value.trim());
    const next = needle ? authored.filter((candidate) => candidate.key.includes(needle)) : authored;
    visible = next;
    const shown = new Set(next);
    for (const candidate of authored) {
      const hiddenNow = !shown.has(candidate);
      if (candidate.node.hidden !== hiddenNow) candidate.node.hidden = hiddenNow;
    }
  };

  const collection = $derived(makeCollection(visible.map(({ item }) => item)));

  const service = useMachine(combobox.machine, () => ({
    id: machineId,
    collection,
    name: input?.name || undefined,
    disabled: input?.disabled,
    invalid,
    readOnly: input?.readOnly,
    required: input?.required,
    multiple,
    openOnClick: !root.hasAttribute("data-open-on-input"),
    allowCustomValue: root.hasAttribute("data-allow-custom-value"),
    defaultValue: root.dataset.value?.split(" ").filter(Boolean),
    placeholder: input?.placeholder,
    // A search that was never resolved into a selection is still the user's work: `preserve` is the
    // only selectionBehavior that keeps it on blur/click-outside/Escape instead of reverting it.
    selectionBehavior: "preserve" as const,
    translations: { clearTriggerLabel: clearLabel, triggerLabel },
    onInputValueChange(details: { reason?: string; inputValue: string }) {
      // Only what the user TYPED is a filter; any non-typed write (a selection's label, the empty
      // string after clear) resets to the full set.
      filterAuthoredItems(details.reason === "input-change" ? details.inputValue : "");
      root.dispatchEvent(new CustomEvent("sk-input-value-change", { bubbles: true, detail: { inputValue: details.inputValue } }));
    },
    onValueChange(details: { value: string[]; items: ComboboxItem[] }) {
      root.dispatchEvent(new CustomEvent("sk-value-change", { bubbles: true, detail: { value: details.value } }));
      // The other half of `selectionBehavior: "preserve"`. Single: the input shows what was chosen.
      // Multiple: the chip already shows it, so the query is spent.
      queueMicrotask(() => {
        const next = multiple ? "" : (details.items.at(-1)?.label ?? "");
        if (api.inputValue !== next) api.setInputValue(next, "script");
      });
    },
  }));

  const api = $derived(combobox.connect(service, normalizeProps));

  let selectedKey = "";
  const renderSelectedItems = () => {
    if (!selectedItemsEl) return;
    const nextKey = api.selectedItems.map(({ value }) => value).join(" ");
    selectedItemsEl.hidden = api.selectedItems.length === 0;
    if (nextKey === selectedKey) return;
    selectedKey = nextKey;
    selectedItemsEl.replaceChildren(
      ...api.selectedItems.map((item) => {
        const chip = document.createElement("span");
        chip.className = comboboxParts.selectedItem;
        chip.setAttribute("role", "listitem");
        const chipLabel = document.createElement("span");
        chipLabel.className = comboboxParts.selectedItemLabel;
        chipLabel.textContent = item.label;
        const remove = document.createElement("button");
        remove.className = `${comboboxParts.removeTrigger} sk-button sk-interactive`;
        remove.setAttribute("data-sk-combobox-remove-trigger", "");
        remove.setAttribute("data-icon-only", "");
        remove.setAttribute("data-size", "sm");
        remove.setAttribute("data-variant", "ghost");
        remove.dataset.value = item.value;
        remove.type = "button";
        remove.setAttribute("aria-label", removeText(item));
        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "×";
        remove.append(icon);
        chip.append(chipLabel, remove);
        return chip;
      }),
    );
  };

  /*
   * ── Foco virtual ─────────────────────────────────────────────────────────────────────────────
   * DOM focus never leaves the input: `aria-activedescendant` points at the highlighted option.
   * Gated on which device moved the highlight last, so a focus ring does not chase the cursor.
   */
  let highlightSource: "keyboard" | "pointer" = "pointer";
  const applyHighlightSource = () => {
    if (!content) return;
    content.dataset.highlightSource = highlightSource;
    root.toggleAttribute("data-virtual-focus", highlightSource === "keyboard" && api.open && api.highlightedValue != null);
  };

  /*
   * Which rows this patch has to touch. A row's props are static except highlighted/selected, so
   * tracking just those two turns a full re-apply (194 rows, measured 31ms → 98ms across a filter
   * session with naive re-application) into patching the one row that lost the state and the one
   * that gained it.
   */
  let appliedHighlight: string | null = null;
  let appliedSelection = new Set<string>();
  let patchedOnce = false;
  const dirtyItems = (): Authored[] => {
    const selection = new Set(api.value);
    if (!patchedOnce) {
      patchedOnce = true;
      appliedHighlight = api.highlightedValue;
      appliedSelection = selection;
      return authored;
    }
    const dirty = new Set<string>();
    if (appliedHighlight !== api.highlightedValue) {
      if (appliedHighlight != null) dirty.add(appliedHighlight);
      if (api.highlightedValue != null) dirty.add(api.highlightedValue);
      appliedHighlight = api.highlightedValue;
    }
    for (const value of selection) if (!appliedSelection.has(value)) dirty.add(value);
    for (const value of appliedSelection) if (!selection.has(value)) dirty.add(value);
    appliedSelection = selection;
    if (dirty.size === 0) return [];
    return authored.filter((candidate) => dirty.has(candidate.item.value));
  };

  $effect(() => {
    if (!ready || !label || !control || !input || !trigger || !positioner || !content) return;
    applyZagProps(root, api.getRootProps() as DomProps);
    applyZagProps(label, api.getLabelProps() as DomProps);
    applyZagProps(control, api.getControlProps() as DomProps);
    if (input.readOnly) control.setAttribute("data-readonly", "");
    applyZagProps(input, api.getInputProps() as DomProps);
    if (describedBy) input.setAttribute("aria-describedby", describedBy);
    if (error) input.setAttribute("aria-errormessage", error.id);
    applyZagProps(trigger, api.getTriggerProps() as DomProps);
    if (clear) {
      applyZagProps(clear, api.getClearTriggerProps() as DomProps);
      clear.hidden = !(api.hasSelectedItems || input.value.length > 0);
      clear.tabIndex = 0;
    }
    const positionerProps = api.getPositionerProps() as DomProps;
    applyZagProps(positioner, anchorName ? (stripPositioningStyle(positionerProps) as DomProps) : positionerProps);
    if (anchorName) unbindAnchor = bindAnchor(control, positioner, anchorName);
    applyZagProps(content, api.getContentProps() as DomProps);
    if (emptyEl) emptyEl.hidden = visible.length > 0;
    const announcement = api.open ? resultText(visible.length) : "";
    if (statusEl && statusEl.textContent !== announcement) statusEl.textContent = announcement;
    renderSelectedItems();
    for (const candidate of dirtyItems()) {
      const itemProps = api.getItemProps({ item: candidate.item }) as DomProps;
      if (!multiple) itemProps["aria-selected"] = candidate.item.value === api.highlightedValue ? "true" : undefined;
      applyZagProps(candidate.node, itemProps);
      if (candidate.text) applyZagProps(candidate.text, api.getItemTextProps({ item: candidate.item }) as DomProps);
      if (candidate.indicator) applyZagProps(candidate.indicator, api.getItemIndicatorProps({ item: candidate.item }) as DomProps);
    }
    applyHighlightSource();
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (!ready || !input || !trigger || !content) return;
    cleanups.push(bindZagEvents(input, () => api.getInputProps() as DomProps));
    cleanups.push(bindZagEvents(trigger, () => api.getTriggerProps() as DomProps));
    if (clear) cleanups.push(bindZagEvents(clear, () => api.getClearTriggerProps() as DomProps));
    cleanups.push(bindZagEvents(content, () => api.getContentProps() as DomProps));
    for (const candidate of authored)
      cleanups.push(bindZagEvents(candidate.node, () => api.getItemProps({ item: candidate.item }) as DomProps));

    /*
     * Los dos disparadores del foco virtual. Capture y passive: no se tocan, sólo se observan.
     * `pointermove` sobre un ítem YA resaltado no llega a la máquina (Zag lo corta), así que el
     * repintado no puede depender del effect de arriba.
     */
    const onKeyboardHighlight = (event: Event) => {
      if (!navigationKeys.has((event as KeyboardEvent).key)) return;
      highlightSource = "keyboard";
      applyHighlightSource();
    };
    const onPointerHighlight = () => {
      highlightSource = "pointer";
      applyHighlightSource();
    };
    root.addEventListener("keydown", onKeyboardHighlight, { capture: true, passive: true });
    content.addEventListener("pointermove", onPointerHighlight, { capture: true, passive: true });
    cleanups.push(
      () => root.removeEventListener("keydown", onKeyboardHighlight, true),
      () => content!.removeEventListener("pointermove", onPointerHighlight, true),
    );

    if (selectedItemsEl) {
      const items = selectedItemsEl;
      const onRemove = (event: MouseEvent) => {
        if (!(event.target instanceof Element)) return;
        const remove = event.target.closest<HTMLButtonElement>(selector.removeTrigger);
        if (!remove || !items.contains(remove)) return;
        const value = remove.dataset.value;
        if (!value) return;
        api.clearValue(value);
        api.focus();
      };
      items.addEventListener("click", onRemove);
      cleanups.push(() => items.removeEventListener("click", onRemove));
    }
  });
  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
  });
</script>
