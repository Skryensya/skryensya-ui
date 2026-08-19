/*
 * CLIPBOARD, the pure part of a copy-to-clipboard control.
 *
 * No contract lives here any more (decision 33, reversed): `CopyButton` used to be a signature
 * built on this plus Icon Toggle faces and an Anclaje feedback flag; now a consumer composes
 * `IconStateButton` itself, authors whatever feedback UI it wants, and calls into this module for
 * the one part that has nothing to do with any of that — actually writing text to the clipboard,
 * with the pre-`navigator.clipboard` path under it. Both the Vanilla and React bindings that used
 * to duplicate this exact function (down to the same fallback) now share the one copy.
 */

function fallbackCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("aria-hidden", "true");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = typeof document.execCommand === "function" && document.execCommand("copy");
  field.remove();
  return copied;
}

export async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return fallbackCopy(text);
  } catch {
    return fallbackCopy(text);
  }
}
