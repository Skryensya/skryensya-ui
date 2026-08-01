import type { ComponentContract } from "./contract.js";
/*
 * COMMAND PALETTE, a searchable listbox inside a native Dialog.
 *
 * Builds on Dialog (ADR-11): `<dialog class="sk-dialog sk-command-palette">` + showModal(). The
 * shell (border, radius, surface, elevation, backdrop) is Dialog's; this file owns the search row,
 * results listbox, empty state and footer chrome.
 *
 * The consumer authors the index (JSON) and the option markup contract; the Vanilla enhancer filters
 * and drives aria-activedescendant. Interaction paint stays on `sk-interactive` where present.
 */
export type CommandPaletteEntry = {
  label: string;
  href: string;
  aliases?: readonly string[];
  /** Context shown beside the label (section › group, path, etc.). */
  context?: string;
  section?: string;
  group?: string;
};

export const commandPaletteParts = {
  root: "sk-command-palette",
  search: "sk-command-palette__search",
  input: "sk-command-palette__input",
  close: "sk-command-palette__close",
  list: "sk-command-palette__list",
  option: "sk-command-palette__option",
  optionLabel: "sk-command-palette__option-label",
  optionContext: "sk-command-palette__option-context",
  empty: "sk-command-palette__empty",
  footer: "sk-command-palette__footer",
} as const;

export type CommandPalettePart = keyof typeof commandPaletteParts;
export type CommandPalettePartClass = (typeof commandPaletteParts)[CommandPalettePart];

export const commandPaletteAttrs = {
  root: "data-sk-command-palette",
  open: "data-sk-command-palette-open",
  input: "data-sk-command-palette-input",
  list: "data-sk-command-palette-list",
  empty: "data-sk-command-palette-empty",
  index: "data-sk-command-palette-index",
  hotkey: "data-sk-command-palette-hotkey",
  hint: "data-sk-command-palette-hint",
} as const;

export type CommandPaletteAttr = keyof typeof commandPaletteAttrs;
export type CommandPaletteAttrName = (typeof commandPaletteAttrs)[CommandPaletteAttr];

export function normalizeCommandPaletteQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Rank a query against an entry. Null = no match; lower is better (prefix → contains → context). */
export function scoreCommandPaletteEntry(
  entry: CommandPaletteEntry,
  query: string,
): number | null {
  const names = [entry.label, ...(entry.aliases ?? [])].map(normalizeCommandPaletteQuery);
  const context = normalizeCommandPaletteQuery(
    entry.context ?? `${entry.section ?? ""} ${entry.group ?? ""}`,
  );
  if (names.some((name) => name.startsWith(query))) return 0;
  if (names.some((name) => name.includes(query))) return 1;
  if (context.includes(query)) return 2;
  return null;
}

export function filterCommandPaletteEntries(
  index: readonly CommandPaletteEntry[],
  query: string,
): CommandPaletteEntry[] {
  const q = normalizeCommandPaletteQuery(query);
  if (q === "") return [...index];
  return index
    .map((entry) => ({ entry, rank: scoreCommandPaletteEntry(entry, q) }))
    .filter((row): row is { entry: CommandPaletteEntry; rank: number } => row.rank !== null)
    .sort((a, b) => a.rank - b.rank)
    .map((row) => row.entry);
}

export function commandPaletteOptionContext(entry: CommandPaletteEntry): string {
  if (entry.context) return entry.context;
  if (entry.section && entry.group) return `${entry.section} › ${entry.group}`;
  return entry.section ?? entry.group ?? "";
}

/*
 * COMMAND PALETTE, the contract — the last of the ten pages that had none.
 *
 * The enhancer shipped with no React counterpart, so this could not be a contract at all: one
 * binding is not a contract, it is a script. Writing the missing half is what made it possible, the
 * same way it did for `copy-button` and `dialog`.
 *
 * THE LIST IS EMPTY IN THE MARKUP, on purpose: the enhancer only fills it when the palette opens,
 * and the React half copies that rather than improving on it. What a composition supplies is the
 * INDEX, and the enhancer reads that from a JSON script the way authored markup has to.
 *
 * `aria-expanded` is NOT written here, and that is a fix rather than an omission. The authored
 * markup on the docs page hardcoded `aria-expanded="true"` — a combobox announcing an expanded
 * popup over an empty listbox, which axe reports and a screen reader would act on. Both bindings set
 * it when there is something to expand; neither claims it at rest.
 */
export const commandPaletteContract = {
  id: "command-palette",
  css: "@skryensya/core/components/command-palette.css",
  parts: commandPaletteParts,

  options: {
    /** Names the dialog for anyone who cannot see it. An option, not a slot: both bindings put it
     * on `aria-label`, and a visually-hidden element would be a second way to say one thing. */
    label: { type: "string", attr: "aria-label" },
    /** The dialog's own id: the trigger points at it and the index is keyed to it. */
    paletteId: { type: "string", attr: "id", prop: "id" },
    /** Shown in the search field while it is empty. */
    placeholder: { type: "string", default: "Buscar…", attr: "placeholder" },
    /** What the empty state says once a filter matches nothing. */
    emptyLabel: { type: "string", default: "Sin resultados.", attr: "data-empty-label", machineInput: true },
    /** Rendered already open, non-modally — the platform's attribute, same as `Dialog.open`. */
    open: { type: "boolean", default: false, attr: "open", trueValue: "" },
  },

  signatures: {
    CommandPalette: {
      intent: ["command-palette", "search-everything", "keyboard-first-navigation"],
      host: { element: "dialog" },
      mount: commandPaletteAttrs.root,
      options: ["label", "paletteId", "placeholder", "emptyLabel", "open"],
      slots: {},
      template: {
        element: "dialog",
        part: "root",
        also: ["sk-dialog"],
        host: true,
        children: [
          {
            element: "div",
            part: "search",
            children: [
              { element: "span", attrs: { "data-sk-icon": "search", "data-sk-icon-size": "md" } },
              {
                element: "input",
                part: "input",
                mount: commandPaletteAttrs.input,
                options: ["placeholder"],
                attrs: {
                  type: "text",
                  role: "combobox",
                  autocomplete: "off",
                  spellcheck: "false",
                  "aria-expanded": "false",
                  "aria-autocomplete": "list",
                },
              },
              {
                element: "form",
                attrs: { method: "dialog" },
                children: [
                  {
                    element: "button",
                    part: "close",
                    also: ["sk-button", "sk-dialog__close", "sk-interactive"],
                    attrs: {
                      type: "submit",
                      value: "cancel",
                      "aria-label": "Cerrar",
                      "data-icon-only": "",
                      "data-size": "sm",
                      "data-variant": "ghost",
                    },
                    children: [
                      { element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "md" } },
                    ],
                  },
                ],
              },
            ],
          },
          {
            /* Empty by construction: the enhancer fills it on open, and so does the React half. */
            element: "ul",
            part: "list",
            also: ["sk-scrollbar"],
            mount: commandPaletteAttrs.list,
            attrs: { role: "listbox", "aria-label": "Resultados" },
          },
          {
            element: "p",
            part: "empty",
            mount: commandPaletteAttrs.empty,
            options: ["emptyLabel"],
            attrs: { hidden: "" },
            textFromOption: "emptyLabel",
          },
        ],
      },
      react: { from: "@skryensya/react/command-palette", name: "CommandPalette" },
    },
  },
} as const satisfies ComponentContract;
