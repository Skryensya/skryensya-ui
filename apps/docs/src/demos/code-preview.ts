import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyFigureHtml } from "./annotation-parts";

/*
 * THE ANATOMY SPECIMEN: density switch AND expand toggle in one drawing. No single signature emits
 * both (CodePreview has the toggle; CodePreview.density has the switch), so this is frozen markup
 * matching CodeBlock.astro's combined surface, minus `data-sk-code-preview` mounts so
 * `mountCodePreview` never attaches. Density / collapsible data-attrs stay: they are styling hooks
 * the stylesheet reads to show the condensed panel and the more bar.
 */
const codePreviewAnatomySpecimen = (t: Translate): string => `<div
  class="sk-code-preview"
  data-sk-code-preview-density="condensed"
  data-sk-code-preview-collapsible
  data-sk-code-preview-condensed-collapsible
  data-sk-code-preview-expanded="false"
  aria-label="${t("codePreview.anatomyLabel")}"
>
  <div class="sk-code-preview__label">
    <span class="sk-code-preview__meta">
      <span>${t("demo.codePreview.label")}</span>
      <span>${t("demo.codePreview.note")}</span>
    </span>
    <div class="sk-code-preview__density">
      <span class="sk-code-preview__density-edge" data-density="condensed">${t("code.condensed")}</span>
      <label class="sk-switch">
        <input class="sk-switch__input" type="checkbox" role="switch" aria-label="${t("code.showFull")}" tabindex="-1" />
        <span class="sk-switch__control" aria-hidden="true"><span class="sk-switch__thumb"></span></span>
      </label>
      <span class="sk-code-preview__density-edge" data-density="full">${t("code.full")}</span>
    </div>
  </div>
  <div class="sk-code-preview__preview">
    <div class="sk-code-preview__viewport" data-sk-code-preview-density-panel="condensed">${t("demo.codePreview.condensed")}</div>
    <div class="sk-code-preview__viewport" data-sk-code-preview-density-panel="full">${t("demo.codePreview.full")}</div>
  </div>
  <div class="sk-code-preview__more">
    <button class="sk-code-preview__toggle sk-button sk-interactive" type="button" data-size="sm" data-variant="ghost" aria-expanded="false" tabindex="-1">
      <span>${t("code.expand")}</span>
      <span class="sk-code-preview__toggle-count"></span>
      <span class="sk-code-preview__toggle-icon" aria-hidden="true">
        <span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span>
      </span>
    </button>
  </div>
</div>`;


export const codePreviewAnatomyHtml = (t: Translate): string => anatomyFigureHtml(t, {
  label: t("codePreview.anatomyLabel"),
  specimen: codePreviewAnatomySpecimen(t),
  parts: [
    { for: ".sk-code-preview", side: "block-start", mark: "bracket", ringPlacement: "offset", ringDistance: 8 },
    { for: ".sk-code-preview__label", side: "inline-start" },
    { for: ".sk-code-preview__meta", side: "inline-start", ringPlacement: "offset", ringDistance: 4 },
    { for: ".sk-code-preview__density", side: "inline-end" },
    { for: ".sk-code-preview__preview", side: "inline-start" },
    { for: ".sk-code-preview__viewport", side: "inline-end", ringPlacement: "offset", ringDistance: 3 },
    { for: ".sk-code-preview__toggle", side: "block-end" },
  ],
});

export const codePreviewAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-code-preview {
  inline-size: min(100%, 28rem);
  text-align: start;
}

.sk-annotated__subject {
  text-align: center;
}`;

/** A short snippet the page can show live when a UsageTree stage is needed. */
export const codePreviewTree = (t: Translate): UsageTree => ({
  contract: "code-preview",
  signature: "CodePreview",
  options: { collapsible: true, lines: 6, previewLines: 3, moreLabel: t("kit.expand"), lessLabel: t("kit.collapse") },
  slots: {
    label: t("demo.codePreview.label"),
    note: t("demo.codePreview.note"),
    children: t("demo.codePreview.full"),
  },
});
