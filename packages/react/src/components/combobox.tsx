import { comboboxParts, type ComboboxItem } from "@skryensya/core/combobox";
import { fieldParts } from "@skryensya/core/field";
import { combobox } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useId, useMemo, useState, type ReactNode, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");
const combiningMarks = /\p{M}+/gu;
const searchKey = (value: string) =>
  value.normalize("NFD").replace(combiningMarks, "").toLocaleLowerCase();
type HighlightSource = "keyboard" | "pointer" | undefined;
// Las teclas que mueven el resaltado dentro del listbox (las mismas que atiende la máquina).
const navigationKeys = new Set([
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);
// The machine takes an array even when only one thing can be chosen. Authored markup carries a
// single `data-value`, so a lone string has to reach it as the one-element array it means.
const asValues = (value: string | readonly string[] | undefined) =>
  value === undefined ? undefined : typeof value === "string" ? [value] : [...value];
const defaultRemoveLabel = (item: ComboboxItem) => `Quitar ${item.label}`;
const defaultResultCountLabel = ({ count }: { count: number }) =>
  count === 1 ? "1 resultado disponible" : `${count} resultados disponibles`;

export type ComboboxProps = {
  /**
   * Where the positioned listbox is portalled. Absent it goes to the body, which is right in a page
   * and wrong in the gate: the listbox would land outside the box G2 measures, and the two bindings
   * would be compared with one of them missing its whole floating half.
   */
  container?: RefObject<HTMLElement>;
  id?: string;
  name?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  items: readonly ComboboxItem[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  multiple?: boolean;
  value?: string | readonly string[];
  defaultValue?: string | readonly string[];
  inputValue?: string;
  defaultInputValue?: string;
  openOnClick?: boolean;
  allowCustomValue?: boolean;
  triggerIndicator?: ReactNode;
  itemIndicator?: ReactNode;
  clearIndicator?: ReactNode;
  removeIndicator?: ReactNode;
  clearLabel?: string;
  triggerLabel?: string;
  selectedLabel?: string;
  removeLabel?: (item: ComboboxItem) => string;
  emptyLabel?: ReactNode;
  resultCountLabel?: (details: { count: number; inputValue: string }) => string;
  onValueChange?: (details: { value: string[] }) => void;
  onInputValueChange?: (details: { inputValue: string }) => void;
};

export function Combobox({
  allowCustomValue,
  clearLabel = "Limpiar selección",
  clearIndicator,
  container,
  defaultInputValue = "",
  defaultValue,
  disabled,
  emptyLabel = "Sin resultados",
  error,
  hint,
  id,
  inputValue,
  itemIndicator,
  items,
  label,
  multiple,
  name,
  onInputValueChange,
  onValueChange,
  openOnClick = true,
  placeholder,
  readOnly,
  removeIndicator,
  removeLabel = defaultRemoveLabel,
  required,
  resultCountLabel = defaultResultCountLabel,
  selectedLabel = "Valores seleccionados",
  triggerIndicator,
  triggerLabel = "Mostrar opciones",
  value,
}: ComboboxProps) {
  const generatedId = useId();
  const machineId = id ?? generatedId;
  const hintId = `${machineId}-hint`;
  const errorId = `${machineId}-error`;
  const [query, setQuery] = useState(defaultInputValue);
  /*
   * ── Virtual focus ────────────────────────────────────────────────────────────────────────────
   *
   * DOM focus never leaves the input: `aria-activedescendant` points at the highlighted option, so
   * nothing on screen says where the arrow keys have landed unless the option says it. It carries a
   * real focus ring, and while it does, the control drops its own — one ring at a time, so the ring
   * *moves* into the list and back out instead of stacking a box inside a box.
   *
   * Both attributes are gated on which device moved the highlight last, because the machine also
   * highlights on `pointermove` and a focus ring chasing the cursor reads as broken focus. Under the
   * pointer the hover tint carries the highlight alone. The updater returns the previous value when
   * nothing changed, so a mouse crossing the list does not re-render on every frame.
   */
  // Starts at `pointer`, matching the enhancer: at rest no key has moved the highlight, and only
  // `keyboard` changes what is drawn. Leaving it unset meant the two bindings disagreed about the
  // attribute before anyone had touched the control.
  const [highlightSource, setHighlightSource] = useState<HighlightSource>("pointer");
  const keepHighlightSource =
    (next: HighlightSource) => (previous: HighlightSource) =>
      previous === next ? previous : next;
  const effectiveQuery = inputValue ?? query;
  // Folded once per item list, not once per row per keystroke: `searchKey` normalizes to NFD and
  // strips combining marks, which is the most expensive thing in the filter and never changes.
  const searchKeys = useMemo(() => items.map(({ label }) => searchKey(label)), [items]);
  const allItems = useMemo(() => [...items], [items]);
  const filteredItems = useMemo(() => {
    const needle = searchKey(effectiveQuery.trim());
    if (!needle) return allItems;
    return items.filter((_, index) => searchKeys[index].includes(needle));
  }, [allItems, effectiveQuery, items, searchKeys]);
  const collection = useMemo(
    () =>
      combobox.collection<ComboboxItem>({
        items: filteredItems,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
        isItemDisabled: (item) => Boolean(item.disabled),
      }),
    [filteredItems],
  );
  const service = useMachine(combobox.machine, {
    id: machineId,
    collection,
    name,
    disabled,
    invalid: Boolean(error),
    readOnly,
    required,
    multiple,
    value: asValues(value),
    defaultValue: asValues(defaultValue),
    inputValue,
    defaultInputValue,
    openOnClick,
    allowCustomValue,
    placeholder,
    // A search that was never resolved into a selection is still the user's work: leaving the field
    // — blur, click outside, Escape — must not throw it away and leave them retyping. `preserve` is
    // the only selectionBehavior that keeps it, because the machine reverts the input on every one
    // of those exits. The cost is that CHOOSING no longer writes the label either, so `onValueChange`
    // below does that write itself: preserve on leave, replace on select (mirrors the vanilla layer).
    selectionBehavior: "preserve",
    translations: {
      clearTriggerLabel: clearLabel,
      triggerLabel,
    },
    onInputValueChange(details) {
      // Only what the user TYPED is a filter. The machine writes this input too — the label after a
      // select, "" after clear — and filtering on that would leave the list showing the single row
      // you just picked the next time it opens. Any non-typed write resets to the full set.
      setQuery(details.reason === "input-change" ? details.inputValue : "");
      onInputValueChange?.({ inputValue: details.inputValue });
    },
    onValueChange(details) {
      onValueChange?.({ value: details.value });
      // The other half of `selectionBehavior: "preserve"`. Single: the input shows what was chosen.
      // Multiple: the chip already shows it, so the query is spent — clear it so the next search
      // starts from the whole list instead of the one match that produced this chip.
      queueMicrotask(() => {
        const next = multiple ? "" : (details.items.at(-1)?.label ?? "");
        if (api.inputValue !== next) api.setInputValue(next, "script");
      });
    },
  });
  const api = combobox.connect(service, normalizeProps);

  /* El ancla es el CONTROL entero, no el botón del chevron: el listbox se alinea con el campo que
   * el usuario está escribiendo, y anclarlo al chevron lo pegaría a un cuadrado de 32px. */
  const anchor = useAnchored(machineId);
  const inputProps = api.getInputProps();
  const describedBy =
    [
      inputProps["aria-describedby"],
      hint ? hintId : undefined,
      error ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  // Show the clear ✕ whenever there is something to clear — a chosen value OR text still in the
  // input — and hide it when the field is truly empty (mirrors the vanilla layer).
  const showClear = api.hasSelectedItems || api.inputValue.length > 0;

  return (
    <div
      {...api.getRootProps()}
      className={cx(fieldParts.root, comboboxParts.root)}
      data-disabled={disabled ? "" : undefined}
      data-virtual-focus={
        highlightSource === "keyboard" && api.open && api.highlightedValue
          ? ""
          : undefined
      }
      onKeyDownCapture={(event) => {
        if (!navigationKeys.has(event.key)) return;
        setHighlightSource(keepHighlightSource("keyboard"));
      }}
    >
      <label
        {...api.getLabelProps()}
        className={cx(fieldParts.label, comboboxParts.label)}
      >
        {label}
        {required ? (
          <span aria-hidden="true" className={fieldParts.requiredIndicator}>
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <div className={fieldParts.hint} id={hintId}>
          {hint}
        </div>
      ) : null}
      <div
        {...api.getControlProps()}
        {...anchor.anchor(comboboxParts.control)}
        data-readonly={readOnly ? "" : undefined}
      >
        <div className={comboboxParts.value}>
          {multiple && api.selectedItems.length ? (
            <div
              aria-label={selectedLabel}
              className={comboboxParts.selectedItems}
              role="list"
            >
              {api.selectedItems.map((item) => (
                <span
                  className={comboboxParts.selectedItem}
                  key={item.value}
                  role="listitem"
                >
                  <span className={comboboxParts.selectedItemLabel}>
                    {item.label}
                  </span>
                  <button
                    aria-label={removeLabel(item)}
                    className={cx(
                      comboboxParts.removeTrigger,
                      "sk-button",
                      "sk-interactive",
                    )}
                    data-icon-only=""
                    data-size="sm"
                    data-variant="ghost"
                    onClick={() => {
                      api.clearValue(item.value);
                      api.focus();
                    }}
                    type="button"
                  >
                    <span aria-hidden="true">{removeIndicator ?? "×"}</span>
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <input
            {...inputProps}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            className={comboboxParts.input}
          />
        </div>
        {/* Rendered-and-hidden rather than conditional, which is what the enhancer can do with
            authored markup and therefore what the contract's template says. `hidden` keeps it out
            of the accessibility tree exactly as absence would, and it is what the CSS styles. */}
        <button
          {...api.getClearTriggerProps()}
          className={cx(comboboxParts.clear, "sk-button", "sk-interactive")}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          hidden={!showClear}
          tabIndex={0}
          type="button"
        >
          <span aria-hidden="true">{clearIndicator ?? "×"}</span>
        </button>
        <button
          {...api.getTriggerProps()}
          className={cx(comboboxParts.trigger, "sk-button", "sk-interactive")}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          type="button"
        >
          <span aria-hidden="true">{triggerIndicator ?? "⌄"}</span>
        </button>
      </div>
      {error ? (
        <div className={fieldParts.error} id={errorId}>
          {error}
        </div>
      ) : null}
      <div
        aria-atomic="true"
        className={cx(comboboxParts.status, "sk-visually-hidden")}
        role="status"
      >
        {api.open
          ? resultCountLabel({
              count: filteredItems.length,
              inputValue: api.inputValue,
            })
          : null}
      </div>
      <Portal container={container}>
        <div {...anchor.positioner(api.getPositionerProps(), comboboxParts.positioner)}>
          <div
            {...api.getContentProps()}
            className={cx(comboboxParts.content, "sk-scrollbar")}
            data-highlight-source={highlightSource}
            onPointerMove={() => setHighlightSource(keepHighlightSource("pointer"))}
          >
            {filteredItems.map((item) => (
              <div
                {...api.getItemProps({ item })}
                className={`${comboboxParts.item} sk-interactive`}
                /* What the enhancer reads to build its collection: a row's `textContent` is label +
                   description + indicator glued together, which is not the label. Written here too
                   so the two bindings land on the same row. */
                data-description={item.description}
                data-value-text={item.label}
                key={item.value}
              >
                <span className={comboboxParts.itemCopy}>
                  <span
                    {...api.getItemTextProps({ item })}
                    className={comboboxParts.itemLabel}
                  >
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className={comboboxParts.itemDescription}>
                      {item.description}
                    </span>
                  ) : null}
                </span>
                <span
                  {...api.getItemIndicatorProps({ item })}
                  className={comboboxParts.itemIndicator}
                >
                  {itemIndicator ?? "✓"}
                </span>
              </div>
            ))}
            {/* Same rendered-and-hidden rule as the clear control above. */}
            <div
              className={comboboxParts.empty}
              hidden={filteredItems.length > 0}
              role="presentation"
            >
              {emptyLabel}
            </div>
          </div>
        </div>
      </Portal>
    </div>
  );
}
