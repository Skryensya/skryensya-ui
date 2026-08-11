import { describe, expect, it } from "vitest";
import {
  commandPaletteOptionContext,
  filterCommandPaletteEntries,
  normalizeCommandPaletteQuery,
  scoreCommandPaletteEntry,
  type CommandPaletteEntry,
} from "./command-palette.js";

/*
 * The search behind the palette, and the reason it is in core rather than in either binding: both
 * halves rank the same index the same way, so the ranking is the contract, not an implementation
 * detail of whichever one the reader happens to be looking at.
 */
const entry = (over: Partial<CommandPaletteEntry> = {}): CommandPaletteEntry => ({
  href: "/x",
  label: "Botón",
  ...over,
});

describe("normalizeCommandPaletteQuery", () => {
  it("folds accents, case and surrounding space", () => {
    // Someone typing "boton" on a keyboard without accents must still find "Botón".
    expect(normalizeCommandPaletteQuery("  BoTóN  ")).toBe("boton");
    expect(normalizeCommandPaletteQuery("Diálogo")).toBe("dialogo");
    expect(normalizeCommandPaletteQuery("ÑOÑO")).toBe("nono");
  });

  it("treats a blank query as empty, whatever the whitespace was", () => {
    expect(normalizeCommandPaletteQuery("   ")).toBe("");
    expect(normalizeCommandPaletteQuery("")).toBe("");
  });
});

describe("scoreCommandPaletteEntry", () => {
  it("ranks a prefix above a substring above a context hit", () => {
    // Lower is better, and the order is the whole point: what you started typing comes first.
    expect(scoreCommandPaletteEntry(entry({ label: "Botón" }), "bot")).toBe(0);
    expect(scoreCommandPaletteEntry(entry({ label: "Split Button" }), "button")).toBe(1);
    expect(scoreCommandPaletteEntry(entry({ label: "Tabs", section: "Navegación" }), "naveg")).toBe(2);
  });

  it("scores an alias as if it were the label", () => {
    const withAlias = entry({ aliases: ["boton", "cta"], label: "Botón" });
    expect(scoreCommandPaletteEntry(withAlias, "cta")).toBe(0);
    expect(scoreCommandPaletteEntry(withAlias, "ta")).toBe(1);
  });

  it("builds the searchable context from section and group when none was given", () => {
    const grouped = entry({ group: "Acciones", label: "Botón", section: "Componentes" });
    expect(scoreCommandPaletteEntry(grouped, "acciones")).toBe(2);
    // An explicit context REPLACES the pair, so section/group stop being searchable.
    const explicit = entry({ context: "Fundamentos", group: "Acciones", label: "Botón", section: "Componentes" });
    expect(scoreCommandPaletteEntry(explicit, "acciones")).toBeNull();
    expect(scoreCommandPaletteEntry(explicit, "fundamentos")).toBe(2);
  });

  it("returns null rather than a big number when nothing matched", () => {
    // Null is "not a result", which is what lets the filter drop it instead of sorting it last.
    expect(scoreCommandPaletteEntry(entry(), "zzz")).toBeNull();
  });
});

describe("filterCommandPaletteEntries", () => {
  const index = [
    entry({ href: "/split", label: "Split Button" }),
    entry({ href: "/boton", label: "Botón", section: "Componentes" }),
    entry({ href: "/tabs", label: "Tabs", section: "Botonera" }),
    entry({ href: "/tokens", label: "Tokens" }),
  ];

  it("returns the whole index for a blank query, as a copy", () => {
    const all = filterCommandPaletteEntries(index, "   ");
    expect(all).toEqual([...index]);
    // A copy, so a caller sorting the results cannot reorder the index behind everyone's back.
    expect(all).not.toBe(index);
  });

  it("orders hits by rank and drops the misses", () => {
    expect(filterCommandPaletteEntries(index, "boton").map((hit) => hit.href)).toEqual([
      "/boton", // prefix
      "/tabs", // its section, "Botonera", contains it
    ]);
  });

  it("puts a prefix hit ahead of a substring hit", () => {
    expect(filterCommandPaletteEntries(index, "button").map((hit) => hit.label)).toEqual([
      "Split Button",
    ]);
    // One query, all three ranks, and ties keep the index's own order: prefix, then the two
    // substrings in the order they were registered, then the context hit ("Botonera").
    expect(filterCommandPaletteEntries(index, "to").map((hit) => hit.label)).toEqual([
      "Tokens",
      "Split Button",
      "Botón",
      "Tabs",
    ]);
  });

  it("finds an accented label from an unaccented query and back", () => {
    expect(filterCommandPaletteEntries(index, "BOTÓN").map((hit) => hit.href)).toContain("/boton");
  });

  it("comes back empty when nothing matched", () => {
    expect(filterCommandPaletteEntries(index, "zzz")).toEqual([]);
  });
});

describe("commandPaletteOptionContext", () => {
  it("prefers the explicit context over the pair", () => {
    expect(
      commandPaletteOptionContext(entry({ context: "Fundamentos", group: "Acciones", section: "Componentes" })),
    ).toBe("Fundamentos");
  });

  it("joins section and group with the separator, and falls back to whichever exists", () => {
    expect(commandPaletteOptionContext(entry({ group: "Acciones", section: "Componentes" }))).toBe(
      "Componentes › Acciones",
    );
    expect(commandPaletteOptionContext(entry({ section: "Componentes" }))).toBe("Componentes");
    expect(commandPaletteOptionContext(entry({ group: "Acciones" }))).toBe("Acciones");
  });

  it("says nothing rather than rendering an empty separator", () => {
    expect(commandPaletteOptionContext(entry())).toBe("");
  });
});
