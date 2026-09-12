import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const codePreviewAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("codePreview.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${codePreviewAnatomySpecimen(t)}
  </div>
  ${label(".sk-code-preview", "block-start", "sk-code-preview", ' data-ring-placement="offset" data-ring-distance="8"')}
  ${label(".sk-code-preview__label", "inline-start", "sk-code-preview__label")}
  ${label(".sk-code-preview__meta", "inline-start", "sk-code-preview__meta", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-code-preview__density", "inline-end", "sk-code-preview__density")}
  ${label(".sk-code-preview__preview", "inline-start", "sk-code-preview__preview")}
  ${label(".sk-code-preview__viewport", "inline-end", "sk-code-preview__viewport", ' data-ring-placement="offset" data-ring-distance="3"')}
  ${label(".sk-code-preview__toggle", "block-end", "sk-code-preview__toggle")}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

export const codePreviewAnatomyCss = `.sk-annotated {
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
  options: { collapsible: true, lines: "6", previewLines: "3" },
  slots: {
    label: t("demo.codePreview.label"),
    note: t("demo.codePreview.note"),
    children: t("demo.codePreview.full"),
  },
});
