/*
 * Cycles the docs reading mode: system → light → dark → system.
 *
 * Scheme is the only theme preference. The docs' icons, density and rounding stay fixed so the
 * reference always describes one stable visual contract.
 */

const SCHEMES = ["system", "light", "dark"] as const;
type Scheme = (typeof SCHEMES)[number];

const LABELS: Record<Scheme, string> = {
  system: "Modo: sistema",
  light: "Modo: claro",
  dark: "Modo: oscuro",
};

function isScheme(value: string | null | undefined): value is Scheme {
  return value === "system" || value === "light" || value === "dark";
}

function load(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("ds") || "{}");
  } catch {
    return {};
  }
}

function save(patch: Record<string, string>): void {
  localStorage.setItem("ds", JSON.stringify({ ...load(), ...patch }));
}

function applyScheme(value: Scheme): void {
  const root = document.documentElement;
  root.setAttribute("data-scheme", value);
  root.style.colorScheme = value === "system" ? "light dark" : value;
}

function paintToggle(toggle: HTMLButtonElement, value: Scheme): void {
  toggle.setAttribute("data-scheme", value);
  toggle.setAttribute("aria-label", LABELS[value]);
}

function nextScheme(current: Scheme): Scheme {
  return SCHEMES[(SCHEMES.indexOf(current) + 1) % SCHEMES.length]!;
}


export function initThemeToggle(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-docs-theme-toggle]");
  if (!toggle) return;

  const stored = load().scheme;
  const initial: Scheme = isScheme(stored) ? stored : "system";
  paintToggle(toggle, initial);

  toggle.addEventListener("click", () => {
    const currentAttr = toggle.getAttribute("data-scheme");
    const current: Scheme = isScheme(currentAttr) ? currentAttr : "system";
    const next = nextScheme(current);

    applyScheme(next);
    save({ scheme: next });
    paintToggle(toggle, next);
    document.dispatchEvent(new CustomEvent("ds:dimensions-changed"));
  });

}
