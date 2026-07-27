import { segmentedParts } from "@skryensya/core/segmented";
import { applyAttrs, bindEvents } from "../runtime/apply.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-sk-segmented]";
const optionSelector = "[data-sk-segmented-option]";

type Cleanup = () => void;

export const mountSegmented = createConnectMount({ key: "segmented", rootSelector, connect: connectSegmented });

export function connectSegmented(root: HTMLElement): Cleanup {
  const options = Array.from(root.querySelectorAll<HTMLElement>(optionSelector));
  if (options.length === 0) throw new Error(`${segmentedParts.root} requires option parts.`);

  for (const option of options) getValue(option);

  let value = root.getAttribute("data-value")
    ?? options.find((option) => option.getAttribute("aria-checked") === "true" && !isDisabled(option))?.getAttribute("data-value")
    ?? options.find((option) => !isDisabled(option))?.getAttribute("data-value");
  const selected = options.find((option) => getValue(option) === value);
  if (!value || !selected || isDisabled(selected)) {
    throw new Error(`${segmentedParts.root} needs a data-value that matches an enabled option.`);
  }

  const indicator = root.querySelector<HTMLElement>(`.${segmentedParts.indicator}`);
  const render = () => {
    applyAttrs(root, { role: "radiogroup", "data-value": value });

    for (const option of options) {
      const selected = getValue(option) === value;
      const disabled = isDisabled(option);

      applyAttrs(option, {
        role: "radio",
        type: option instanceof HTMLButtonElement ? "button" : null,
        tabindex: selected && !disabled ? 0 : -1,
        "aria-checked": selected ? "true" : "false",
        "aria-disabled": disabled ? "true" : null,
      });
    }

    alignIndicator(root, indicator);
  };

  const setValue = (next: string) => {
    const option = options.find((candidate) => getValue(candidate) === next);
    if (!option || isDisabled(option) || next === value) return;

    value = next;
    render();
    root.dispatchEvent(new CustomEvent("sk-value-change", { bubbles: true, detail: { value } }));
  };

  const cleanups = options.map((option) => bindEvents(option, {
    click: () => setValue(getValue(option)),
    keydown: (event) => onOptionKeydown(event, option, options, setValue),
  }));

  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => alignIndicator(root, indicator));
  observer?.observe(root);
  render();

  return () => {
    for (const cleanup of cleanups) cleanup();
    observer?.disconnect();
    root.removeAttribute("data-sk-segmented-ready");
  };
}

function alignIndicator(root: HTMLElement, indicator: HTMLElement | null): void {
  if (!indicator) return;

  const selected = root.querySelector<HTMLElement>(`${optionSelector}[aria-checked="true"]`);
  if (!selected) return;

  indicator.style.transform = `translate3d(${selected.offsetLeft}px, ${selected.offsetTop}px, 0)`;
  indicator.style.inlineSize = `${selected.offsetWidth}px`;
  indicator.style.blockSize = `${selected.offsetHeight}px`;
  root.setAttribute("data-sk-segmented-ready", "");
}

function onOptionKeydown(
  event: Event,
  current: HTMLElement,
  options: readonly HTMLElement[],
  setValue: (value: string) => void,
): void {
  if (!(event instanceof KeyboardEvent)) return;

  const enabled = options.filter((option) => !isDisabled(option));
  const index = enabled.indexOf(current);
  if (index === -1) return;

  const next = event.key === "Home"
    ? enabled[0]
    : event.key === "End"
      ? enabled.at(-1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? enabled[(index - 1 + enabled.length) % enabled.length]
        : event.key === "ArrowRight" || event.key === "ArrowDown"
          ? enabled[(index + 1) % enabled.length]
          : undefined;

  if (!next) return;

  event.preventDefault();
  next.focus();
  setValue(getValue(next));
}


function getValue(option: Element): string {
  const value = option.getAttribute("data-value");
  if (!value) throw new Error(`${segmentedParts.option} parts need a non-empty data-value attribute.`);
  return value;
}


function isDisabled(option: HTMLElement): boolean {
  return option.hasAttribute("data-disabled") || option.getAttribute("aria-disabled") === "true" || (option instanceof HTMLButtonElement && option.disabled);
}
