import { copyButtonAttrs } from "@skryensya/core/copy-button";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const FEEDBACK_DURATION = 1800;
const rootSelector = `[${copyButtonAttrs.root}]`;

type CopyState = "copied" | "error";
type Cleanup = () => void;

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

function sourceText(button: HTMLButtonElement): string | null {
  const target = button.getAttribute(copyButtonAttrs.target);
  return target ? document.getElementById(target)?.textContent ?? null : null;
}

async function writeClipboard(text: string): Promise<boolean> {
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

/** Binds one authored CopyButton without rendering its icons, label or target. */
export function connectCopyButton(root: HTMLElement): Cleanup {
  if (!(root instanceof HTMLButtonElement)) {
    throw new Error(`CopyButton root [${copyButtonAttrs.root}] must be a <button>.`);
  }

  const label = root.querySelector<HTMLElement>(`[${copyButtonAttrs.label}]`);
  const idleLabel = label?.textContent ?? "Copy";
  const idleAriaLabel = root.getAttribute("aria-label") ?? idleLabel;
  const successLabel = root.getAttribute(copyButtonAttrs.successLabel) ?? "Copied";
  const errorLabel = root.getAttribute(copyButtonAttrs.errorLabel) ?? "Copy failed";
  const successAriaLabel = root.getAttribute(copyButtonAttrs.successAriaLabel) ?? successLabel;
  const errorAriaLabel = root.getAttribute(copyButtonAttrs.errorAriaLabel) ?? errorLabel;

  let active = true;
  let resetTimer: number | undefined;

  const reset = () => {
    root.removeAttribute(copyButtonAttrs.state);
    root.setAttribute("aria-label", idleAriaLabel);
    if (label) label.textContent = idleLabel;
  };

  const paint = (state: CopyState) => {
    root.setAttribute(copyButtonAttrs.state, state);
    root.setAttribute("aria-label", state === "copied" ? successAriaLabel : errorAriaLabel);
    if (label) label.textContent = state === "copied" ? successLabel : errorLabel;

    if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      reset();
      resetTimer = undefined;
    }, FEEDBACK_DURATION);
  };

  const onClick = () => {
    const text = sourceText(root);
    if (!text) {
      paint("error");
      return;
    }

    void writeClipboard(text).then((copied) => {
      if (active) paint(copied ? "copied" : "error");
    });
  };

  root.addEventListener("click", onClick);

  return () => {
    active = false;
    root.removeEventListener("click", onClick);
    if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    reset();
  };
}

export const mountCopyButton = createConnectMount({
  key: "copy-button",
  rootSelector,
  connect: connectCopyButton,
});
