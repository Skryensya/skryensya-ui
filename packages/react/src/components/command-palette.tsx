import { commandPaletteParts, commandPaletteOptionContext, filterCommandPaletteEntries, type CommandPaletteEntry, commandPaletteContract } from "@skryensya/core/command-palette";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icon.js";

/* Derived, never restated: the default lives in the contract. */
const { emptyLabel: emptyLabelOption, open: openOption, placeholder: placeholderOption } = commandPaletteContract.options;

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
  /**
   * What activating a result means, when it is not "go to its address".
   *
   * Without it, Enter and a click do what the Vanilla enhancer does and what an index of links
   * implies: navigate to `entry.href`. With it, the host decides instead - the Playground's own
   * palette selects an example inside a tool that is already running, where a navigation would
   * throw away the sandbox and the reader's edits with it. The dialog closes either way, because
   * the palette's job ends the moment a choice is made.
   */
  onSelect?: (entry: CommandPaletteEntry) => void;
};

export function CommandPalette({
  closeLabel = "Cerrar",
  emptyLabel = emptyLabelOption.default,
  footer,
  id,
  items: itemsProp = [],
  label,
  onSelect,
  open = openOption.default,
  placeholder = placeholderOption.default,
}: CommandPaletteProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
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
  /* Controlled, so a palette that is reopened starts empty the way the enhancer's `open()` does:
   * clearing an uncontrolled field would mean writing to the DOM node behind React's back. */
  const [query, setQuery] = useState("");
  const optionId = (i: number) => `${id}-option-${i}`;

  const runQuery = (value: string) => {
    const next = filterCommandPaletteEntries(items, value);
    setQuery(value);
    setResults(next);
    setActive(next.length ? 0 : -1);
    /* Whether anything was ASKED, which is a different question from whether anything was found:
     * the empty message answers the first, `aria-expanded` the second. */
    setQueried(value.trim() !== "");
  };

  /* The open-watcher below is bound once, for the life of the component, so it reaches the current
   * filter through a ref: the closure it would otherwise capture holds the index as it was on the
   * first render, and a palette whose index arrives later (the Playground's does: it is fetched)
   * would reopen filtering against nothing. */
  const runQueryRef = useRef(runQuery);
  runQueryRef.current = runQuery;

  /*
   * ACTIVATION, which this binding simply did not have.
   *
   * The enhancer answers Enter and a click by going to the row's address; React rendered the same
   * rows and did nothing with either, so the palette was a search field that could find a
   * destination and never reach it. Both halves now do the same thing, and `onSelect` is the one
   * seam a host can put itself into (see the prop's own note).
   *
   * The dialog closes first either way: a modal left open over a navigation is the sort of thing
   * that survives a bfcache restore and greets the reader with a palette they already dismissed.
   */
  const choose = (entry: CommandPaletteEntry | undefined) => {
    if (!entry) return;
    dialog.current?.close();
    if (onSelect) onSelect(entry);
    else if (entry.href) window.location.assign(entry.href);
  };

  /*
   * A PALETTE THAT OPENS TAKES FOCUS AND STARTS BLANK, matching `connectCommandPalette`'s `open()`.
   *
   * It watches the `open` ATTRIBUTE rather than the prop, because the host that opens a modal
   * palette does it the way the platform does - `showModal()` on the node, which is the only call
   * that lights the backdrop and traps focus, and which React's `open` prop cannot express (it
   * renders a NON-modal dialog). So the component listens for the state the platform actually
   * writes.
   *
   * Never on the first commit: a demo rendered `open` inside a docs preview would otherwise pull
   * focus into an iframe on page load, scrolling the reader somewhere they never asked to go.
   */
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;

    let wasOpen = node.open;
    const observer = new MutationObserver(() => {
      if (node.open === wasOpen) return;
      wasOpen = node.open;
      if (!node.open) return;
      runQueryRef.current("");
      /* After the dialog is on screen: `showModal()` moves focus itself, so focusing the input in
       * the same tick would be overwritten by the platform's own default. */
      requestAnimationFrame(() => input.current?.focus());
    });
    observer.observe(node, { attributes: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          onChange={(event) => runQuery(event.target.value)}
          /*
           * The listbox is walked from the FIELD, which never gives up focus: that is what
           * `aria-activedescendant` is for, and it is the same set of keys the enhancer binds.
           * Enter activates whatever the pointer never touched; Escape is left to the platform,
           * which closes a modal dialog without any help from here.
           */
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((current) => Math.min(current + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((current) => Math.max(current - 1, 0));
            } else if (event.key === "Home") {
              event.preventDefault();
              setActive(results.length ? 0 : -1);
            } else if (event.key === "End") {
              event.preventDefault();
              setActive(results.length - 1);
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (active >= 0) choose(results[active]);
            }
          }}
          placeholder={placeholder}
          ref={input}
          role="combobox"
          spellCheck={false}
          type="text"
          value={query}
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
              /* A row is activated on the pointer too, the same as the enhancer's own list click.
               * `onMouseDown` is not the handler: the field must keep focus, and a click that has
               * already closed the dialog never needs the option to have been focused at all. */
              onClick={() => choose(entry)}
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
