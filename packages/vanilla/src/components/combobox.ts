import {
  anchorNameFor,
  bindAnchor,
  stripPositioningStyle,
  supportsAnchorPositioning,
} from "@skryensya/core/anchored";
import { combobox } from "@skryensya/core/machines";
import { comboboxParts, type ComboboxItem } from "@skryensya/core/combobox";
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla";
import {
  applyZagProps,
  bindZagEvents,
  type DomProps,
} from "../runtime/apply.js";
import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

const selector = {
  root: "[data-sk-combobox]",
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
const navigationKeys = new Set([
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);
const combiningMarks = /\p{M}+/gu;
const searchKey = (value: string) =>
  value.normalize("NFD").replace(combiningMarks, "").toLocaleLowerCase();
/*
 * The text of a button, as a NAME rather than as characters.
 *
 * `textContent` was the fallback here, and on an icon-only control it produces the icon: the
 * chevron's `⌄` and the clear control's `×` became their accessible names, announced verbatim. Both
 * glyphs sit inside `aria-hidden="true"` precisely to say they are decoration, so reading through
 * that attribute contradicts the markup; the same markup gives React the right name, because
 * React never derived one from the children at all.
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
  for (const [key, value] of Object.entries(values))
    result = result.replace(`{${key}}`, value);
  return result;
};
const emit = <T>(root: HTMLElement, name: string, detail: T) =>
  root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

function connect(root: HTMLElement): () => void {
  const label = root.querySelector<HTMLElement>(selector.label);
  const hint = root.querySelector<HTMLElement>(selector.hint);
  const error = root.querySelector<HTMLElement>(selector.error);
  const control = root.querySelector<HTMLElement>(selector.control);
  const input = root.querySelector<HTMLInputElement>(selector.input);
  const trigger = root.querySelector<HTMLButtonElement>(selector.trigger);
  const clear = root.querySelector<HTMLButtonElement>(selector.clear);
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const content = root.querySelector<HTMLElement>(selector.content);
  if (!label || !control || !input || !trigger || !positioner || !content)
    return () => {};

  const machineId = root.id || uniqueId("sk-combobox");

  /* El pattern Anclaje (ADR-25). El ancla es el CONTROL entero, no el chevron: la lista se alinea con
   * el campo que se está escribiendo. Antes el combobox no tenía ruta de anclaje y posicionaba Zag. */
  const anchorName = supportsAnchorPositioning() ? anchorNameFor(machineId) : null;
  let unbindAnchor: (() => void) | undefined;
  let valueArea = root.querySelector<HTMLElement>(selector.value);
  if (!valueArea) {
    valueArea = document.createElement("div");
    valueArea.className = comboboxParts.value;
    valueArea.setAttribute("data-sk-combobox-value", "");
    input.before(valueArea);
    valueArea.append(input);
  }
  let selectedItems = root.querySelector<HTMLElement>(selector.selectedItems);
  if (root.hasAttribute("data-multiple") && !selectedItems) {
    selectedItems = document.createElement("div");
    selectedItems.className = comboboxParts.selectedItems;
    selectedItems.setAttribute("data-sk-combobox-selected-items", "");
    valueArea.prepend(selectedItems);
  }
  if (selectedItems) {
    selectedItems.setAttribute("role", "list");
    selectedItems.setAttribute(
      "aria-label",
      root.dataset.selectedLabel ?? "Valores seleccionados",
    );
  }

  let empty = root.querySelector<HTMLElement>(selector.empty);
  if (!empty) {
    empty = document.createElement("div");
    empty.className = comboboxParts.empty;
    empty.setAttribute("data-sk-combobox-empty", "");
    empty.textContent = root.dataset.emptyLabel ?? "Sin resultados";
    content.append(empty);
  }
  empty.setAttribute("role", "presentation");
  let status = root.querySelector<HTMLElement>(selector.status);
  if (!status) {
    status = document.createElement("div");
    status.className = `${comboboxParts.status} sk-visually-hidden`;
    status.setAttribute("data-sk-combobox-status", "");
    status.setAttribute("role", "status");
    status.setAttribute("aria-atomic", "true");
    control.after(status);
  }

  const invalid =
    input.getAttribute("aria-invalid") === "true" ||
    root.hasAttribute("data-invalid") ||
    Boolean(error);
  const describedBy = [
    input.getAttribute("aria-describedby"),
    hint ? (hint.id ||= `${machineId}:hint`) : undefined,
    error ? (error.id ||= `${machineId}:error`) : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const triggerLabel =
    trigger.getAttribute("aria-label") ||
    root.dataset.triggerLabel ||
    nameText(trigger) ||
    "Mostrar opciones";
  const clearLabel =
    clear?.getAttribute("aria-label") ||
    root.dataset.clearLabel ||
    (clear ? nameText(clear) : "") ||
    "Limpiar selección";
  const resultText = (count: number) => {
    if (count === 0) return empty.textContent?.trim() || "Sin resultados";
    const template =
      count === 1
        ? (root.dataset.resultLabel ?? "1 resultado disponible")
        : (root.dataset.resultsLabel ?? "{count} resultados disponibles");
    return fromTemplate(template, { count: String(count) });
  };
  const removeText = (item: ComboboxItem) =>
    fromTemplate(root.dataset.removeLabel ?? "Quitar {label}", {
      label: item.label,
    });

  const authored = Array.from(
    root.querySelectorAll<HTMLElement>(selector.item),
  ).map((node) => {
    const label = node.dataset.valueText ?? node.textContent?.trim() ?? "";
    return {
      node,
      item: {
        value: node.dataset.value ?? node.textContent?.trim() ?? "",
        label,
        description: node.dataset.description,
        disabled:
          node.hasAttribute("disabled") ||
          node.getAttribute("aria-disabled") === "true" ||
          node.hasAttribute("data-disabled"),
      } satisfies ComboboxItem,
      // Folded once here, not once per row per keystroke: `searchKey` normalizes to NFD and strips
      // combining marks, which is the most expensive thing in the filter and never changes.
      key: searchKey(label),
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
  let visible = authored;
  const multiple = root.hasAttribute("data-multiple");
  const filterAuthoredItems = (value: string) => {
    const needle = searchKey(value.trim());
    visible = needle
      ? authored.filter((candidate) => candidate.key.includes(needle))
      : authored;
    const shown = new Set(visible);
    for (const candidate of authored) {
      const hidden = !shown.has(candidate);
      if (candidate.node.hidden !== hidden) candidate.node.hidden = hidden;
    }
    setCollection(makeCollection(visible.map(({ item }) => item)));
  };
  /*
   * ── Por qué las props son UNA función estable y no `updateProps` ─────────────────────────────
   *
   * Zag no guarda las props: las vuelve a leer en cada `prop(key)`, y `prop` se llama decenas de
   * veces por `connect()`. `machine.updateProps()` no reemplaza las props, ENVUELVE las anteriores
   * en otro closure de merge, así que la cadena crece un eslabón por cada llamada, y como el
   * filtro llama una vez por tecla, cada lectura termina recorriendo la cadena entera.
   *
   * Medido en el demo de 194 países: el costo por evento se duplicaba en cada pasada (31ms → 67ms
   * → 98ms por flecha) sin que cambiara nada más. Con un objeto mutable detrás de una sola función
   * el costo es plano; `notify()` es lo que `updateProps` hacía al final de todos modos.
   */
  const machineProps = {
    id: machineId,
    collection: makeCollection(visible.map(({ item }) => item)),
    name: input.name || undefined,
    disabled: input.disabled,
    invalid,
    readOnly: input.readOnly,
    required: input.required,
    multiple,
    openOnClick: !root.hasAttribute("data-open-on-input"),
    allowCustomValue: root.hasAttribute("data-allow-custom-value"),
    defaultValue: root.dataset.value?.split(" ").filter(Boolean),
    placeholder: input.placeholder,
    // A search that was never resolved into a selection is still the user's work: leaving the field
    // blur, click outside, Escape; must not throw it away and leave them retyping. `preserve` is
    // the only selectionBehavior that keeps it, because the machine reverts the input on every one
    // of those exits. The cost is that CHOOSING no longer writes the label either, so `onValueChange`
    // below does that write itself: preserve on leave, replace on select.
    selectionBehavior: "preserve",
    translations: {
      clearTriggerLabel: clearLabel,
      triggerLabel,
    },
    onInputValueChange(details) {
      // Only what the user TYPED is a filter. The machine writes this input too; the label after a
      // select, "" after clear; filtering on that would leave the list showing the single row
      // you just picked the next time it opens. Any non-typed write resets to the full set.
      filterAuthoredItems(
        details.reason === "input-change" ? details.inputValue : "",
      );
      emit(root, "sk-input-value-change", {
        inputValue: details.inputValue,
      });
    },
    onValueChange(details) {
      emit(root, "sk-value-change", { value: details.value });
      // The other half of `selectionBehavior: "preserve"`. Single: the input shows what was chosen.
      // Multiple: the chip already shows it, so the query is spent; clear it so the next search
      // starts from the whole list instead of the one match that produced this chip.
      queueMicrotask(() => {
        const next = multiple ? "" : (details.items.at(-1)?.label ?? "");
        if (getApi().inputValue !== next) getApi().setInputValue(next, "script");
      });
    },
  } satisfies combobox.Props<ComboboxItem>;
  const machine = new VanillaMachine(combobox.machine, () => machineProps);
  /*
   * Swapping the collection is a plain mutation, with no notification of its own, and that is safe
   * for exactly one reason worth writing down: the only caller is `filterAuthoredItems`, and the
   * only caller of THAT is `onInputValueChange`, which the machine calls synchronously from
   * `context.set("inputValue", …)`. Zag's store batches its own notification to a microtask, so it
   * always lands after this mutation; the tracker on `prop("collection")` then sees the new
   * collection and the subscribers re-render once. Call this from anywhere else and the list would
   * be one event stale.
   */
  const setCollection = (collection: ReturnType<typeof makeCollection>) => {
    machineProps.collection = collection;
  };
  machine.start();
  /*
   * `connect()` is not a getter, it is a rebuild: it re-reads every prop and computed and closes
   * over ~40 handlers. Rebuilding it per event was the second cost after the props chain; every
   * `pointermove` over a row paid for one. It only goes stale when the machine notifies, and that
   * is exactly where the cache is dropped, one line below in the subscription.
   */
  let connected: ReturnType<typeof combobox.connect> | null = null;
  const getApi = () => (connected ??= combobox.connect(machine.service, normalizeProps));
  let selectedKey = "";
  const renderSelectedItems = () => {
    if (!selectedItems) return;
    const api = getApi();
    const nextKey = api.selectedItems.map(({ value }) => value).join("\u0000");
    selectedItems.hidden = api.selectedItems.length === 0;
    if (nextKey === selectedKey) return;
    selectedKey = nextKey;
    selectedItems.replaceChildren(
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
   *
   * DOM focus never leaves the input: `aria-activedescendant` points at the highlighted option, so
   * nothing on screen says where the arrow keys have landed unless the option says it. It carries a
   * real focus ring, and while it does, the control drops its own; one ring at a time, so the ring
   * *moves* into the list and back out instead of stacking a box inside a box.
   *
   * Both attributes are gated on which device moved the highlight last, because the machine also
   * highlights on `pointermove` and a focus ring chasing the cursor reads as broken focus. Under the
   * pointer the hover tint carries the highlight alone. `data-highlight-source` lives on the content
   * (React portals it out of the root, so the root cannot reach it), `data-virtual-focus` on the
   * root, which is what the control's rule can see.
   */
  let highlightSource: "keyboard" | "pointer" = "pointer";
  const applyHighlightSource = () => {
    const api = getApi();
    content.dataset.highlightSource = highlightSource;
    root.toggleAttribute(
      "data-virtual-focus",
      highlightSource === "keyboard" && api.open && api.highlightedValue != null,
    );
  };
  /*
   * Which rows this patch has to touch.
   *
   * A row's props are static except for two things: whether it is highlighted and whether it is
   * selected. Everything else `getItemProps` returns (id, role, tabindex, value, disabled) was
   * settled at mount. So re-applying all of them on every state change meant building three prop
   * objects per row and diffing their attributes, 194 times, to move ONE highlight by one row.
   * Tracking the two values that can change turns that into two rows: the one that lost the state
   * and the one that gained it. The first pass patches everything, since nothing is applied yet.
   */
  let appliedHighlight: string | null = null;
  let appliedSelection = new Set<string>();
  let patchedOnce = false;
  const dirtyItems = (api: ReturnType<typeof getApi>) => {
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
    for (const value of selection)
      if (!appliedSelection.has(value)) dirty.add(value);
    for (const value of appliedSelection)
      if (!selection.has(value)) dirty.add(value);
    appliedSelection = selection;
    if (dirty.size === 0) return [];
    return authored.filter((candidate) => dirty.has(candidate.item.value));
  };
  const sync = () => {
    const api = getApi();
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
      // Show the clear ✕ whenever there is something to clear; a chosen value OR text still in the
      // input; hide it when the field is truly empty. `input.value` is the live signal for the
      // typed filter (sync() runs after each input event), so a filter with no selection yet still
      // gets an affordance to wipe it.
      clear.hidden = !(api.hasSelectedItems || input.value.length > 0);
      clear.tabIndex = 0;
    }
    const positionerProps = api.getPositionerProps() as DomProps;
    applyZagProps(positioner, anchorName ? (stripPositioningStyle(positionerProps) as DomProps) : positionerProps);
    if (anchorName) unbindAnchor = bindAnchor(control, positioner, anchorName);
    applyZagProps(content, api.getContentProps() as DomProps);
    empty.hidden = visible.length > 0;
    const announcement = api.open ? resultText(visible.length) : "";
    if (status.textContent !== announcement) status.textContent = announcement;
    renderSelectedItems();
    for (const candidate of dirtyItems(api)) {
      applyZagProps(
        candidate.node,
        api.getItemProps({ item: candidate.item }) as DomProps,
      );
      if (candidate.text)
        applyZagProps(
          candidate.text,
          api.getItemTextProps({ item: candidate.item }) as DomProps,
        );
      if (candidate.indicator)
        applyZagProps(
          candidate.indicator,
          api.getItemIndicatorProps({
            item: candidate.item,
          }) as DomProps,
        );
    }
    applyHighlightSource();
  };
  const cleanups = [
    bindZagEvents(input, () => getApi().getInputProps() as DomProps),
    bindZagEvents(trigger, () => getApi().getTriggerProps() as DomProps),
    ...(clear
      ? [
          bindZagEvents(
            clear,
            () => getApi().getClearTriggerProps() as DomProps,
          ),
        ]
      : []),
    bindZagEvents(content, () => getApi().getContentProps() as DomProps),
    ...authored.map((candidate) =>
      bindZagEvents(
        candidate.node,
        () =>
          getApi().getItemProps({
            item: candidate.item,
          }) as DomProps,
      ),
    ),
  ];
  /*
   * Los dos disparadores del foco virtual. Capture y passive: los vemos pase lo que pase con el
   * evento, y no los tocamos. `pointermove` sobre un ítem YA resaltado no llega a la máquina (Zag
   * lo corta), así que el repintado no puede depender de `sync`, va acá.
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
  root.addEventListener("keydown", onKeyboardHighlight, {
    capture: true,
    passive: true,
  });
  content.addEventListener("pointermove", onPointerHighlight, {
    capture: true,
    passive: true,
  });
  cleanups.push(
    () => root.removeEventListener("keydown", onKeyboardHighlight, true),
    () => content.removeEventListener("pointermove", onPointerHighlight, true),
  );
  if (selectedItems) {
    const onRemove = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const remove = event.target.closest<HTMLButtonElement>(
        selector.removeTrigger,
      );
      if (!remove || !selectedItems.contains(remove)) return;
      const value = remove.dataset.value;
      if (!value) return;
      getApi().clearValue(value);
      getApi().focus();
    };
    selectedItems.addEventListener("click", onRemove);
    cleanups.push(() => selectedItems.removeEventListener("click", onRemove));
  }
  // A notification is the only thing that can make the connected api stale, so it is the only place
  // that drops it; the sync that follows rebuilds it once for the whole patch.
  const unsubscribe = machine.subscribe(() => {
    connected = null;
    sync();
  });
  sync();
  return () => {
    unsubscribe();
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
    machine.stop();
  };
}
export const mountCombobox = createConnectMount({
  key: "combobox",
  rootSelector: selector.root,
  connect,
});
