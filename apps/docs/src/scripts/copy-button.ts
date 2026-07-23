const FEEDBACK_DURATION = 1800;
const resetTimers = new WeakMap<HTMLButtonElement, number>();

type CopyState = "copied" | "error";

function fallbackCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("aria-hidden", "true");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  return copied;
}

function sourceText(button: HTMLButtonElement): string | null {
  const target = button.dataset.copyTarget;
  return target ? document.getElementById(target)?.textContent ?? null : null;
}

function paint(button: HTMLButtonElement, state: CopyState): void {
  const copied = state === "copied";
  const label = button.querySelector<HTMLElement>("[data-copy-label]");

  button.dataset.copyState = state;
  button.setAttribute("aria-label", copied ? "Código copiado" : "No se pudo copiar el código");
  if (label) label.textContent = copied ? "Copiado" : "Error al copiar";
}

function reset(button: HTMLButtonElement): void {
  const label = button.querySelector<HTMLElement>("[data-copy-label]");

  delete button.dataset.copyState;
  button.setAttribute("aria-label", "Copiar código");
  if (label) label.textContent = "Copiar";
}

function scheduleReset(button: HTMLButtonElement): void {
  const previous = resetTimers.get(button);
  if (previous) window.clearTimeout(previous);

  resetTimers.set(
    button,
    window.setTimeout(() => {
      reset(button);
      resetTimers.delete(button);
    }, FEEDBACK_DURATION),
  );
}

async function copy(button: HTMLButtonElement): Promise<void> {
  const text = sourceText(button);
  if (!text) {
    paint(button, "error");
    scheduleReset(button);
    return;
  }

  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    } else {
      copied = fallbackCopy(text);
    }
  } catch {
    copied = fallbackCopy(text);
  }

  paint(button, copied ? "copied" : "error");
  scheduleReset(button);
}

/** Mounts every unmounted declarative CopyButton under `root`. */
export function initCopyButtons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>("[data-ds-copy-button]").forEach((button) => {
    if (button.dataset.copyMounted === "true") return;

    button.dataset.copyMounted = "true";
    button.addEventListener("click", () => void copy(button));
  });
}
