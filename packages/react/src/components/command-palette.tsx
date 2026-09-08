import {
  commandPaletteParts,
  commandPaletteOptionContext,
  filterCommandPaletteEntries,
  type CommandPaletteEntry,
} from "@skryensya/core/command-palette";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icon.js";

/*
 * COMMAND PALETTE: the React half, which did not exist.
 *
 * The enhancer shipped for a while with no counterpart here, so this could not be a contract: one
 * binding is not a contract, it is a script. As with `dialog`, writing the missing half is what made
 * the contract possible.
 *
 * THE LIST IS EMPTY AT REST, in both bindings, copied deliberately rather than improved on:
 * `connectCommandPalette` only calls `render()` from `open()`, so a closed palette has no options,
 * and filling it here would make the two halves disagree about the state every reader sees first.
 *
 * `aria-expanded` follows that, and it is the reason this component was worth writing twice. The
 * authored markup hardcoded `aria-expanded="true"`, a combobox announcing an expanded popup over
 * an empty listbox, which axe reports and a screen reader would act on. The enhancer sets it on
 * open; so does this. Neither claims it at rest.
 */
export type CommandPaletteProps = {
  id: string;
  label: string;
  /**
   * The index. An array for a hand-written composition; a JSON string for a usage tree, which has
   * no channel for anything but an option's own value: the same string the Vanilla binding reads
   * off its authored `<script type="application/json">`.
   */
  items?: readonly CommandPaletteEntry[] | string;
  placeholder?: string;
  emptyLabel?: string;
  closeLabel?: string;
  open?: boolean;
  footer?: ReactNode;
};

export function CommandPalette({
  closeLabel = "Cerrar",
  emptyLabel = "Sin resultados.",
  footer,
  id,
  items: itemsProp = [],
  label,
  open = false,
  placeholder = "Buscar…",
}: CommandPaletteProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const items = useMemo(
    () => (typeof itemsProp === "string" ? (JSON.parse(itemsProp) as CommandPaletteEntry[]) : itemsProp),
    [itemsProp],
  );
  const [results, setResults] = useState<CommandPaletteEntry[]>([]);
  const [active, setActive] = useState(-1);
  /*
   * `expanded` is DERIVED, not remembered: a combobox is expanded when there is a popup to expand,
   * which is exactly "the listbox has options in it". It used to be a flag set to `true` on the
   * first keystroke and never reconsidered, so a query that matched nothing still announced an
   * expanded popup over an empty list. The vanilla enhancer had the mirror-image bug, claiming it
   * on open; the two only ever agreed by accident.
   */
  const [queried, setQueried] = useState(false);
  const optionId = (i: number) => `${id}-option-${i}`;

  /*
   * Feed the rows' natural height to the stylesheet as a length so `.sk-command-palette__list`
   * transitions between result counts instead of snapping (clamp + transition in
   * command-palette.css). Same measurement as the Vanilla enhancer: `last.bottom - first.top` is
   * the rows' extent, unaffected by the box's own (possibly mid-transition) height or scroll, and
   * `scrollHeight` could not report a shrunk content. Layout effect so the write lands before paint.
   */
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const first = el.firstElementChild;
    const last = el.lastElementChild;
    if (!first || !last) {
      el.style.removeProperty("--sk-command-palette-list-content");
      return;
    }
    const styles = getComputedStyle(el);
    const padding =
      (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
    const rows = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
    el.style.setProperty("--sk-command-palette-list-content", `${Math.ceil(rows + padding)}px`);
  }, [results]);

  return (
    <dialog
      aria-label={label}
      className={`sk-dialog ${commandPaletteParts.root}`}
      id={id}
      open={open}
      ref={dialog}
    >
      <div className={commandPaletteParts.search}>
        <Icon name="search" />
        <input
          aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          aria-autocomplete="list"
          aria-controls="sk-command-palette-listbox"
          aria-expanded={results.length > 0}
          autoComplete="off"
          className={commandPaletteParts.input}
          onChange={(event) => {
            const next = filterCommandPaletteEntries(items, event.target.value);
            setResults(next);
            setActive(next.length ? 0 : -1);
            /* Whether anything was ASKED, which is a different question from whether anything was
             * found: the empty message below answers the first, `aria-expanded` the second. */
            setQueried(event.target.value.trim() !== "");
          }}
          placeholder={placeholder}
          role="combobox"
          spellCheck={false}
          type="text"
        />
        <form method="dialog">
          <button
            aria-label={closeLabel}
            className={`${commandPaletteParts.close} sk-button sk-dialog__close sk-interactive`}
            data-icon-only=""
            data-size="sm"
            data-variant="ghost"
            type="submit"
            value="cancel"
          >
            <Icon name="close" />
          </button>
        </form>
      </div>
      <ul
        aria-label="Resultados"
        className={`${commandPaletteParts.list} sk-scrollbar`}
        id="sk-command-palette-listbox"
        ref={list}
        role="listbox"
      >
        {results.map((entry, i) => {
          const context = commandPaletteOptionContext(entry);
          return (
            <li
              aria-selected={i === active}
              className={commandPaletteParts.option}
              data-href={entry.href}
              id={optionId(i)}
              key={entry.href}
              role="option"
            >
              <span className={commandPaletteParts.optionLabel}>{entry.label}</span>
              {context ? <span className={commandPaletteParts.optionContext}>{context}</span> : null}
            </li>
          );
        })}
      </ul>
      {/* "Sin resultados" answers a question, so it waits until one has been asked: over an
          untouched palette it reports an absence nobody was looking for. */}
      <p className={commandPaletteParts.empty} hidden={!queried || results.length !== 0}>
        {emptyLabel}
      </p>
      {footer ? <footer className={commandPaletteParts.footer}>{footer}</footer> : null}
    </dialog>
  );
}
