/*
 * Wires every `HookPlayground.astro` on the page: each slider/color input writes its own custom
 * property straight onto the PROBE element (the actual `.sk-loader`, say  -  see the `probe` prop's
 * own doc), the same way a consumer's stylesheet would. Setting it on the stage div instead would
 * only ever be inherited, and every published component redeclares its own custom properties
 * unconditionally in its base rule, so an inherited value never wins. Reset restores the values the
 * page authored, from `data-default` on each control rather than re-fetched from anywhere.
 */
const ROOT = "[data-sk-hook-playground]";

function apply(control: HTMLElement, rawValue: string): void {
  const stage = control.closest(ROOT)?.querySelector<HTMLElement>("[data-sk-hook-playground-stage]");
  const probeSelector = stage?.dataset.skHookPlaygroundProbe;
  const target = (probeSelector ? stage?.querySelector<HTMLElement>(probeSelector) : undefined) ?? stage;
  const hook = control.dataset.hook;
  if (!target || !hook) return;

  const unit = control.dataset.unit ?? "";
  const value = `${rawValue}${unit}`;
  target.style.setProperty(hook, value);

  const output = control.querySelector<HTMLElement>("[data-sk-hook-playground-output]");
  if (output) output.textContent = value;
}

export function initHookPlayground(): void {
  document.querySelectorAll<HTMLElement>(`${ROOT}:not([data-sk-hook-playground-bound])`).forEach((root) => {
    root.setAttribute("data-sk-hook-playground-bound", "");
    const controls = root.querySelectorAll<HTMLElement>("[data-sk-hook-playground-control]");

    controls.forEach((control) => {
      const input = control.querySelector<HTMLElement>("[data-sk-hook-playground-input]");
      if (!input) return;
      apply(
        control,
        input instanceof HTMLInputElement ? input.value : (input.getAttribute("data-value") ?? control.dataset.default ?? ""),
      );
      if (input instanceof HTMLInputElement) {
        input.addEventListener("input", () => apply(control, input.value));
      } else {
        input.addEventListener("sk-value-change", (event) => {
          const value = event instanceof CustomEvent ? event.detail?.value : undefined;
          const fallback =
            input instanceof HTMLInputElement ? input.value : (input.getAttribute("data-value") ?? control.dataset.default ?? "");
          apply(control, String(value ?? fallback));
        });
      }
    });

    root.querySelector<HTMLButtonElement>("[data-sk-hook-playground-reset]")?.addEventListener("click", () => {
      controls.forEach((control) => {
        const input = control.querySelector<HTMLElement>("[data-sk-hook-playground-input]");
        if (!input) return;
        const value = control.dataset.default ?? "";
        if (input instanceof HTMLInputElement) {
          input.value = value;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        } else {
          input.setAttribute("data-value", value);
          apply(control, value);
        }
      });
    });
  });
}
