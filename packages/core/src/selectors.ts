/*
 * THE MARKUP CONTRACT, AS SELECTORS.
 *
 * Every enhanceable component already declares its mount attributes in Core, as an `*Attrs` map
 * (`comboboxAttrs.input === "data-sk-combobox-input"`). The vanilla layer needs the same names as
 * CSS selectors to find the authored nodes it patches, and it used to get them by typing each one
 * out again wrapped in brackets: a second copy of the markup contract, keyed the same way, in a
 * different package, kept in step by hand.
 *
 * That is the largest string duplication in the repository: 241 bracketed `data-sk-*` literals in
 * the vanilla layer, and another 840 across its tests. Renaming one mount attribute meant finding
 * every one of them, and nothing failed if you missed one: `querySelector` returns null and the
 * enhancer quietly patches nothing.
 *
 * Deriving them costs one function. The attribute name stays declared exactly once, in the
 * contract, and the selector is a view of it rather than a copy.
 */

/**
 * `{ input: "data-sk-combobox-input" }` becomes `{ input: "[data-sk-combobox-input]" }`.
 *
 * Keys are preserved, so an enhancer's `selector.input` reads exactly as it did when the map was
 * written by hand; only the source of the string changes.
 */
export function selectorsFor<T extends Readonly<Record<string, string>>>(
  attrs: T,
): { readonly [K in keyof T]: string } {
  const out = {} as { [K in keyof T]: string };
  for (const key of Object.keys(attrs) as (keyof T)[]) out[key] = `[${attrs[key]}]`;
  return out;
}
