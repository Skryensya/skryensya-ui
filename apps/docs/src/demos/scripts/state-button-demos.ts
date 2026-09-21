/*
 * StateButton docs previews: cycle faces on click. No imports — `runAuthoredScript()` in
 * `component-preview-frame.ts` evaluates this body with `Function(...)`, not as a module.
 */
const CURRENT = "data-current";
const FACE = "data-face";
const ACTIVE = "data-active";

function setCurrent(root: HTMLButtonElement, next: string, ariaLabel?: string): void {
  root.setAttribute(CURRENT, next);
  if (ariaLabel) root.setAttribute("aria-label", ariaLabel);
  for (const node of root.querySelectorAll(`[${FACE}]`)) {
    if (node.getAttribute(FACE) === next) node.setAttribute(ACTIVE, "");
    else node.removeAttribute(ACTIVE);
  }
}

function cycle(
  root: HTMLButtonElement,
  order: readonly string[],
  label?: (name: string) => string,
): void {
  root.addEventListener("click", () => {
    const current = root.getAttribute(CURRENT) ?? order[0]!;
    const index = order.indexOf(current);
    const next = order[(index + 1) % order.length]!;
    setCurrent(root, next, label?.(next));
  });
}

function connectViewMode(root: HTMLButtonElement): void {
  const order = ["grid", "list", "compact"] as const;
  const labels: Record<(typeof order)[number], string> = {
    grid: "View mode: grid",
    list: "View mode: list",
    compact: "View mode: compact",
  };
  cycle(root, order, (name) => labels[name as (typeof order)[number]]);
}

const COLOR_MODES = ["system", "light", "dark"] as const;

function nextColorMode(current: string): (typeof COLOR_MODES)[number] {
  const index = COLOR_MODES.indexOf(current as (typeof COLOR_MODES)[number]);
  const from = index === -1 ? 0 : index;
  return COLOR_MODES[(from + 1) % COLOR_MODES.length]!;
}

const COLOR_LABELS: Record<(typeof COLOR_MODES)[number], string> = {
  system: "Color mode: system",
  light: "Color mode: light",
  dark: "Color mode: dark",
};

function connectTheme(root: HTMLButtonElement): void {
  root.addEventListener("click", () => {
    const raw = root.getAttribute(CURRENT) ?? "light";
    const current =
      raw === "system" || raw === "light" || raw === "dark" ? raw : "light";
    const next = nextColorMode(current);
    setCurrent(root, next, COLOR_LABELS[next]);
  });
}

function fallbackCopy(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("aria-hidden", "true");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied =
    typeof document.execCommand === "function" && document.execCommand("copy");
  field.remove();
  return copied;
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

function connectCopy(root: HTMLButtonElement): void {
  const idle = "ready";
  const copied = "copied";
  const idleLabel = root.getAttribute("aria-label") ?? "Copy to clipboard";
  let timer: number | undefined;

  root.addEventListener("click", async () => {
    const ok = await writeClipboard("Example text for the StateButton copy demo.");
    if (!ok) {
      setCurrent(root, idle, idleLabel);
      return;
    }
    setCurrent(root, copied, "Copied");
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      setCurrent(root, idle, idleLabel);
    }, 1800);
  });
}

const byId: Record<string, (root: HTMLButtonElement) => void> = {
  "demo-state-button-view-mode": connectViewMode,
  "demo-state-button-theme": connectTheme,
  "demo-state-button-copy": connectCopy,
};

for (const [id, connect] of Object.entries(byId)) {
  const button = document.getElementById(id);
  if (button instanceof HTMLButtonElement) connect(button);
}
