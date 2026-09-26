import { updateComponentPreviewStageDocument } from "@skryensya/vanilla/component-preview";
import { getPreference, setPreference, subscribePreference } from "@skryensya/vanilla/storage";
import { appearancePreference } from "../lib/preferences";

type Appearance = "default" | "tactile";

const scopeSelector = "[data-docs-appearance-scope]";
const setSelector = "[data-docs-appearance-set]";
const toggleSelector = "[data-docs-appearance-toggle]";
const labelSelector = "[data-docs-appearance-label]";
const appearanceTargetSelector = `[data-appearance="default"], [data-appearance="tactile"]`;

let bound = false;

function isAppearance(value: unknown): value is Appearance {
  return value === "default" || value === "tactile";
}

function nextAppearance(value: Appearance): Appearance {
  return value === "tactile" ? "default" : "tactile";
}

function labelFor(value: Appearance): string {
  return value === "tactile" ? "Tactile" : "Default";
}

function current(scope: HTMLElement): Appearance {
  const value = scope.getAttribute("data-docs-appearance");
  return isAppearance(value) ? value : getPreference(appearancePreference);
}

function targetSelector(scope: HTMLElement): string {
  return scope.getAttribute("data-docs-appearance-target") || appearanceTargetSelector;
}

function writeFrameSource(frame: HTMLIFrameElement, value: Appearance): void {
  const scope = frame.closest<HTMLElement>(scopeSelector);
  const source = frame.getAttribute("data-sk-component-preview-doc");
  if (!scope || !source) return;
  try {
    const doc = new DOMParser().parseFromString(source, "text/html");
    doc.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
      element.setAttribute("data-appearance", value);
    });
    updateComponentPreviewStageDocument(frame, `<!doctype html>\n${doc.documentElement.outerHTML}`);
  } catch {
    /* Malformed preview source should not break the page chrome. The live frame path below still tries. */
  }
}

function writeFrame(frame: HTMLIFrameElement, value: Appearance): void {
  const scope = frame.closest<HTMLElement>(scopeSelector);
  if (!scope) return;
  writeFrameSource(frame, value);
  try {
    frame.contentDocument?.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
      element.setAttribute("data-appearance", value);
    });
  } catch {
    /* ComponentPreview frames are same-origin srcdoc. A future cross-origin frame simply opts out. */
  }
}

function apply(scope: HTMLElement, value: Appearance): void {
  scope.setAttribute("data-docs-appearance", value);
  scope.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
    element.setAttribute("data-appearance", value);
  });
  scope.querySelectorAll<HTMLIFrameElement>("iframe.sk-component-preview__stage").forEach((frame) => {
    writeFrame(frame, value);
  });
  scope.querySelectorAll<HTMLElement>(setSelector).forEach((item) => {
    const selected = item.getAttribute("data-docs-appearance-set") === value;
    if (selected) {
      item.setAttribute("data-checked", "");
      item.setAttribute("aria-checked", "true");
    } else {
      item.removeAttribute("data-checked");
      item.setAttribute("aria-checked", "false");
    }
  });
  scope.querySelectorAll<HTMLElement>(labelSelector).forEach((label) => {
    label.textContent = labelFor(value);
  });
}

function applyAll(value: Appearance): void {
  document.querySelectorAll<HTMLElement>(scopeSelector).forEach((scope) => apply(scope, value));
}

export function initAppearance(): void {
  applyAll(getPreference(appearancePreference));

  if (bound) return;
  bound = true;

  subscribePreference(appearancePreference, applyAll);

  document.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    const set = target?.closest<HTMLElement>(setSelector);
    if (set) {
      const scope = set.closest<HTMLElement>(scopeSelector);
      const value = set.getAttribute("data-docs-appearance-set");
      if (scope && isAppearance(value)) {
        apply(scope, value);
        setPreference(appearancePreference, value);
        document.dispatchEvent(new CustomEvent("sk:dimensions-changed"));
      }
      return;
    }

    const toggle = target?.closest<HTMLElement>(toggleSelector);
    if (toggle) {
      const scope = toggle.closest<HTMLElement>(scopeSelector);
      if (scope) {
        const value = nextAppearance(current(scope));
        apply(scope, value);
        setPreference(appearancePreference, value);
        document.dispatchEvent(new CustomEvent("sk:dimensions-changed"));
      }
    }
  });

  document.addEventListener(
    "load",
    (event) => {
      const frame = event.target instanceof HTMLIFrameElement ? event.target : null;
      const scope = frame?.closest<HTMLElement>(scopeSelector);
      if (frame && scope) writeFrame(frame, current(scope));
    },
    true,
  );
}
