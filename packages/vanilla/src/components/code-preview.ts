import { codePreviewAttrs, codePreviewParts, type CodePreviewDensity } from "@skryensya/core/code-preview";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const selector = (attribute: string): string => `[${attribute}]`;
const rootSelector = selector(codePreviewAttrs.root);

type Cleanup = () => void;

/**
 * Binds the authored density switch and disclosure button of one Shiki code preview.
 * Highlighting is already-rendered HTML; this enhancer never imports or runs Shiki in the browser.
 */
export function connectCodePreview(root: HTMLElement): Cleanup {
  const densityInput = root.querySelector<HTMLInputElement>(selector(codePreviewAttrs.densityInput));
  const more = root.querySelector<HTMLElement>(selector(codePreviewAttrs.more));
  const toggle = root.querySelector<HTMLButtonElement>(selector(codePreviewAttrs.toggle));
  const toggleLabel = toggle?.querySelector<HTMLElement>(selector(codePreviewAttrs.toggleLabel));
  const toggleCount = toggle?.querySelector<HTMLElement>(`.${codePreviewParts.toggleCount}`);
  const condensedPanelEl = root.querySelector<HTMLElement>(
    `[${codePreviewAttrs.densityPanel}="condensed"]`,
  );
  const fullPanelEl = root.querySelector<HTMLElement>(`[${codePreviewAttrs.densityPanel}="full"]`);

  if (root.hasAttribute(codePreviewAttrs.collapsible) && (!toggle || !toggleLabel)) {
    throw new Error(
      `CodePreview with [${codePreviewAttrs.collapsible}] requires a [${codePreviewAttrs.toggle}] button and [${codePreviewAttrs.toggleLabel}] label.`,
    );
  }

  const collapsedLabel = toggleLabel?.textContent ?? "";
  const collapsedAriaLabel = toggle?.getAttribute("aria-label") ?? "";
  const expandedLabel = toggle?.getAttribute(codePreviewAttrs.expandedLabel) ?? "Show less";
  const expandedAriaLabel = toggle?.getAttribute(codePreviewAttrs.expandedAriaLabel) ?? collapsedAriaLabel;
  const fullLines = Number(root.getAttribute(codePreviewAttrs.lines) ?? 0);
  const condensedLines = Number(root.getAttribute(codePreviewAttrs.condensedLines) ?? 0);

  const setExpanded = (expanded: boolean) => {
    if (!toggle || !toggleLabel) return;
    root.setAttribute(codePreviewAttrs.expanded, String(expanded));
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? expandedAriaLabel : collapsedAriaLabel);
    toggleLabel.textContent = expanded ? expandedLabel : collapsedLabel;
  };

  const syncDisclosureChrome = (density: CodePreviewDensity | null) => {
    if (!more || !toggle) return;
    const condensedCanCollapse = root.hasAttribute(codePreviewAttrs.condensedCollapsible);
    const fullCanCollapse = root.hasAttribute(codePreviewAttrs.collapsible);
    if (density === "full") {
      more.hidden = !fullCanCollapse;
      if (toggleCount && fullLines > 0) toggleCount.textContent = `${fullLines} líneas`;
      if (fullPanelEl?.id) toggle.setAttribute("aria-controls", fullPanelEl.id);
    } else if (density === "condensed") {
      more.hidden = !condensedCanCollapse;
      if (toggleCount && condensedLines > 0) toggleCount.textContent = `${condensedLines} líneas`;
      if (condensedPanelEl?.id) toggle.setAttribute("aria-controls", condensedPanelEl.id);
    } else {
      more.hidden = !fullCanCollapse;
    }
  };

  const showDensity = (density: CodePreviewDensity) => {
    root.setAttribute(codePreviewAttrs.density, density);
    if (densityInput) densityInput.checked = density === "full";
    syncDisclosureChrome(density);
    // Leaving Full collapses again so Condensed never inherits an expanded Full viewport.
    if (density !== "full") setExpanded(false);
  };

  const onDensityChange = () => showDensity(densityInput?.checked ? "full" : "condensed");
  const onToggle = () => setExpanded(root.getAttribute(codePreviewAttrs.expanded) !== "true");

  densityInput?.addEventListener("change", onDensityChange);
  toggle?.addEventListener("click", onToggle);

  if (densityInput) {
    showDensity(root.getAttribute(codePreviewAttrs.density) === "full" ? "full" : "condensed");
  }

  return () => {
    densityInput?.removeEventListener("change", onDensityChange);
    toggle?.removeEventListener("click", onToggle);
  };
}

/** Opt-in mount: deliberately absent from initComponents(). */
export const mountCodePreview = createConnectMount({
  key: "code-preview",
  rootSelector,
  connect: connectCodePreview,
});
