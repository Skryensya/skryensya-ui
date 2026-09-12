/*
 * ONE SPLIT, TWO SPELLINGS.
 *
 * An authored `attrs.style` is CSS text, the only shape `attrs` (a flat `Record<string, string>`)
 * can hold. Markup emission writes it straight back out; React needs it as an object. Both start
 * from the same parse, so the parse lives here, in Core, rather than in either binding's emitter:
 * `@skryensya/ai-compiler` (the markup and JSX emitters) and `@skryensya/react` (the live island)
 * import it, and neither owns it.
 */

/**
 * The split with property names left EXACTLY as written, for the binding that speaks CSS.
 *
 * `parseInlineStyle` below camelCases for React's `style` object, and markup emission borrowing it
 * turned an authored `block-size: 12rem` into `blockSize: 12rem` in a real `style` attribute, which
 * a browser ignores in silence.
 *
 * Splits each declaration on the FIRST `:` only, so a value that itself contains a colon
 * (`url(http://…)`, a time, a ratio) survives intact.
 */
export function splitInlineStyle(css: string): Array<[string, string]> {
  return css
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      if (colon === -1) return null;
      const property = declaration.slice(0, colon).trim();
      const value = declaration.slice(colon + 1).trim();
      if (!property || !value) return null;
      return [property, value] as [string, string];
    })
    .filter((pair): pair is [string, string] => pair !== null);
}

/**
 * `"--sk-avatar-bg: red; color: white"` → `[["--sk-avatar-bg", "red"], ["color", "white"]]`. A CSS
 * custom property's name is kept verbatim (`--sk-avatar-bg` stays hyphenated: React only recognizes
 * it as one if the object key is written exactly that way, never `camelCase`d); an ordinary property
 * is camelCased, the form the `style` object expects for everything else.
 *
 * Shared because the same string → `style` object gap exists on both React paths: the printed
 * snippet and the live island each used to carry a copy, and each hit the identical React crash
 * ("the `style` prop expects a mapping … not a string") from its own. One parser, imported by both,
 * so the fix cannot land in only one of them again.
 */
export function parseInlineStyle(css: string): Array<[string, string]> {
  return splitInlineStyle(css).map(([property, value]) => [
    property.startsWith("--")
      ? property
      : property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
    value,
  ]);
}
