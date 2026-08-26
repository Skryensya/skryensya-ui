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
  // The single-panel case (no density switch): the one viewport this preview has.
  const plainPanelEl = condensedPanelEl || fullPanelEl ? null : root.querySelector<HTMLElement>(`.${codePreviewParts.viewport}`);

  /*
   * `aria-controls` needs SOME id to point at, and authored/compiled markup never assigns one -
   * the panel is anonymous content the author supplies. Assigned here, once, only if the panel
   * does not already have one, so an author who DID give it an id keeps their own.
   */
  const baseId = root.id || "sk-code-preview";
  if (condensedPanelEl && !condensedPanelEl.id) condensedPanelEl.id = `${baseId}-condensed`;
  if (fullPanelEl && !fullPanelEl.id) fullPanelEl.id = `${baseId}-full`;
  if (plainPanelEl && !plainPanelEl.id) plainPanelEl.id = `${baseId}-viewport`;

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
  /* The author supplies the sentence with `{count}` still in it; substituting is all this does. The
   * count used to be built here as `${n} líneas`, which put one hardcoded Spanish word in a package
   * that has no language of its own, and printed it on the English site. */
  const linesTemplate = toggle?.getAttribute(codePreviewAttrs.linesLabel) ?? "{count}";
  const formatLines = (count: number): string => linesTemplate.replace("{count}", String(count));

  /*
   * Present only on a panel whose collapsed state shows NOTHING (`CodeBlock`'s own
   * `forceCollapsible`, e.g. every embedded ComponentPreview source): a real 15-line peek window
   * stays genuinely visible and scrollable while "collapsed", so it keeps its normal
   * tabindex/role/aria-label at rest and is left alone here. An empty one must not offer a Tab
   * stop, or a screen reader region, that leads to zero-height nothing.
   *
   * `inert` over hand-rolling `tabindex`/`role`/`aria-label` toggling: one attribute pulls the
   * WHOLE region out of both the accessibility tree and native Tab order (and pointer hit-testing)
   * in a single move, so nothing new added inside a code sample later — a future annotation, a
   * link — can quietly reopen this gap by not knowing to repeat three separate overrides.
   */
  const hidesWhenCollapsed = root.hasAttribute(codePreviewAttrs.hidesWhenCollapsed);
  const scrollRegionOf = (panel: HTMLElement | null): HTMLElement | null =>
    panel?.querySelector<HTMLElement>("pre") ?? null;
  const scrollRegions = [condensedPanelEl, fullPanelEl, plainPanelEl].map(scrollRegionOf);

  const setExpanded = (expanded: boolean) => {
    if (!toggle || !toggleLabel) return;
    root.setAttribute(codePreviewAttrs.expanded, String(expanded));
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? expandedAriaLabel : collapsedAriaLabel);
    toggleLabel.textContent = expanded ? expandedLabel : collapsedLabel;
    if (hidesWhenCollapsed) {
      // Both density panels, not just whichever is showing: the hidden one is already
      // `display:none` (the density switch, not this), so touching it too is harmless, and
      // `showDensity` never lets `expanded` stay true after leaving Full in the first place.
      for (const region of scrollRegions) {
        if (region) region.inert = !expanded;
      }
    }
  };

  const syncDisclosureChrome = (density: CodePreviewDensity | null) => {
    if (!more || !toggle) return;
    const condensedCanCollapse = root.hasAttribute(codePreviewAttrs.condensedCollapsible);
    const fullCanCollapse = root.hasAttribute(codePreviewAttrs.collapsible);
    if (density === "full") {
      more.hidden = !fullCanCollapse;
      if (toggleCount && fullLines > 0) toggleCount.textContent = formatLines(fullLines);
      if (fullPanelEl?.id) toggle.setAttribute("aria-controls", fullPanelEl.id);
    } else if (density === "condensed") {
      more.hidden = !condensedCanCollapse;
      if (toggleCount && condensedLines > 0) toggleCount.textContent = formatLines(condensedLines);
      if (condensedPanelEl?.id) toggle.setAttribute("aria-controls", condensedPanelEl.id);
    } else {
      more.hidden = !fullCanCollapse;
      // No density switch here, so `fullLines` is the only count this preview has. The same
      // reasoning as the `density === "full"` branch above, minus the density condition.
      if (toggleCount && fullLines > 0) toggleCount.textContent = formatLines(fullLines);
      if (plainPanelEl?.id) toggle.setAttribute("aria-controls", plainPanelEl.id);
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
  } else {
    // No switch, one panel: still needs its `more.hidden`/`aria-controls` set once at rest.
    syncDisclosureChrome(null);
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
