import {
  commandPaletteParts,
  commandPaletteOptionContext,
  filterCommandPaletteEntries,
  type CommandPaletteEntry,
} from "@skryensya/core/command-palette";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icon.js";

/*
 * COMMAND PALETTE: the React half, which did not exist.
 *
 * The enhancer shipped for a while with no counterpart here, so this could not be a contract: one
 * binding is not a contract, it is a script. As with `copy-button` and `dialog`, writing the missing
 * half is what made the contract possible.
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
  const items = useMemo(
    () => (typeof itemsProp === "string" ? (JSON.parse(itemsProp) as CommandPaletteEntry[]) : itemsProp),
    [itemsProp],
  );
  const [results, setResults] = useState<CommandPaletteEntry[]>([]);
  const [active, setActive] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const optionId = (i: number) => `${id}-option-${i}`;

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
          aria-expanded={expanded}
          autoComplete="off"
          className={commandPaletteParts.input}
          onChange={(event) => {
            const next = filterCommandPaletteEntries(items, event.target.value);
            setResults(next);
            setActive(next.length ? 0 : -1);
            setExpanded(true);
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
      <p className={commandPaletteParts.empty} hidden={!expanded || results.length !== 0}>
        {emptyLabel}
      </p>
      {footer ? <footer className={commandPaletteParts.footer}>{footer}</footer> : null}
    </dialog>
  );
}
