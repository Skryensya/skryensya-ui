import { buttonParts } from "@skryensya/core/button";
import { applyAttrs } from "../runtime/apply.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-sk-button]";

export const mountButton = createConnectMount({ key: "button", rootSelector, connect: connectButton });

export function connectButton(root: HTMLElement): () => void {
  const disabled = root.hasAttribute("disabled") || root.getAttribute("aria-disabled") === "true";
  const isLink = root.tagName === "A";
  if (isLink && !root.hasAttribute("href")) {
    throw new Error("Button.navigation expects href. Use Button.action for actions.");
  }
  if (isLink && disabled) {
    throw new Error(
      "Button.navigation cannot be disabled while it has navigation semantics. Render non-link content when the destination is unavailable.",
    );
  }

  if (root.tagName === "BUTTON" && !root.hasAttribute("type")) {
    applyAttrs(root, { type: "button" });
  }
  applyAttrs(root, { "aria-disabled": disabled ? "true" : null });

  if (!root.classList.contains(buttonParts.root)) {
    throw new Error(`Button enhancer expects .${buttonParts.root} on the root element.`);
  }
  if (!root.classList.contains(buttonParts.interactive)) {
    throw new Error(
      `Button enhancer expects .${buttonParts.interactive} on the root element; its state paint and touch target depend on it.`,
    );
  }

  /* An icon-only button is a square with no visible text, so its accessible name has to be authored:
   * aria-label, or aria-labelledby. The enhancer never invents one, it patches attributes, it does
   * not write content, so a missing name is the author's bug, and it is caught here rather than
   * shipping a button screen readers announce as just "button". Any real text inside (visually-hidden
   * label) satisfies it too, hence the textContent check. */
  if (root.hasAttribute("data-icon-only")) {
    const named =
      root.hasAttribute("aria-label") ||
      root.hasAttribute("aria-labelledby") ||
      (root.textContent ?? "").trim().length > 0;
    if (!named) {
      throw new Error(
        `Icon-only button (${rootSelector}[data-icon-only]) has no accessible name. Add aria-label="…" ` +
          "(or aria-labelledby). The icon is decorative, the name is the button's.",
      );
    }
  }

  return () => {};
}
