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
