import type { Translate } from "../i18n";

type Side = "block-start" | "block-end" | "inline-start" | "inline-end";

type PartExtras = {
  ringPlacement?: "inset" | "offset";
  ringDistance?: number;
  ringRadius?: number;
  match?: "first" | "all";
  mark?: "ring" | "bracket";
};

export type AnnotationPartItem = {
  options: { for: string; side: Side } & PartExtras;
  slots: { children: string };
};

/*
 * One labelled part for an anatomy diagram. The label text IS the class name: that is what the
 * drawing teaches, and translating it would name nothing.
 */
export const namePart = (
  selector: string,
  side: Side,
  extras: PartExtras = {},
): AnnotationPartItem => ({
  options: { for: selector, side, ...extras },
  slots: { children: selector.replace(/^\./, "") },
});

/*
 * THE CANVAS EVERY ANATOMY DIAGRAM SITS ON speaks the page's locale. The contract's defaults are
 * English, so every diagram spreads these into its options (the zoom bar) and its slots (the two
 * gesture hints).
 */
export const anatomyCanvas = (t: Translate) => ({
  zoomInLabel: t("annotation.zoomInLabel"),
  zoomOutLabel: t("annotation.zoomOutLabel"),
  fitLabel: t("annotation.fitLabel"),
});

export const anatomyHints = (t: Translate) => ({
  touchHint: t("annotation.touchHint"),
  wheelHint: t("annotation.wheelHint"),
});

/** One part of a hand-written anatomy: what `namePart` is for a tree. */
export type AnatomyHtmlPart = {
  for: string;
  side: Side;
  /** The legend entry. Defaults to the selector without its dot. */
  name?: string;
  match?: "first" | "all";
  mark?: "ring" | "bracket";
  ringPlacement?: "inset" | "offset";
  ringDistance?: number;
};

const attr = (name: string, value: string | number | undefined): string =>
  value === undefined ? "" : ` ${name}="${value}"`;

const canvasControl = (action: string, label: string): string => `<button
        class="sk-canvas__control sk-button sk-interactive"
        aria-label="${label}"
        type="button"
        data-canvas-action="${action}"
        data-icon-only
        data-size="xs"
        data-variant="ghost"
      >
        <span data-sk-icon="${action}" data-sk-icon-size="sm"></span>
      </button>`;

/*
 * THE SAME FIGURE THE TEMPLATE EMITS, for the specimens a UsageTree cannot express (a menu frozen
 * open, a picker with its panel in flow). Kept byte-for-byte in the shape `emit` writes for
 * `Annotated`: figure > canvas > frame, then the legend, so both enhancers find what they would
 * find on an emitted diagram.
 */
export const anatomyFigureHtml = (
  t: Translate,
  opts: {
    label: string;
    specimen: string;
    parts: readonly AnatomyHtmlPart[];
    key?: string;
    /**
     * A drawing read at rest and never explored: no zoom bar, no hints, and the viewport is not a tab
     * stop. The canvas still refits on resize. Written exactly as `emit` writes Annotated's `fitOnly`.
     * ON by default: this helper only ever draws anatomies, and an anatomy is never zoomed (see
     * `anatomyDiagram` in ComponentPreview.astro, which does the same for tree-drawn ones).
     */
    fitOnly?: boolean;
  },
): string => {
  opts = { ...opts, fitOnly: opts.fitOnly ?? true };
  const canvas = anatomyCanvas(t);
  const hints = anatomyHints(t);
  const bubbles = opts.parts
    .map(
      (part) =>
        `<span class="sk-annotation"${attr("data-for", part.for)}${attr("data-side", part.side)}${attr("data-mark", part.mark)}${attr("data-match", part.match)}${attr("data-ring-placement", part.ringPlacement)}${attr("data-ring-distance", part.ringDistance)} aria-hidden="true"></span>`,
    )
    .join("\n          ");
  const legend = opts.parts
    .map(
      (part) =>
        `<li class="sk-annotated__legend-item" tabindex="0">${part.name ?? part.for.replace(/^\./, "")}</li>`,
    )
    .join("\n    ");
  return `<div
  class="sk-annotated-figure"
  data-sk-annotated
  aria-label="${opts.label}"
  role="group"
>
  <div class="sk-canvas" data-sk-canvas${opts.fitOnly ? " data-fit-only" : ""}>
    <div class="sk-canvas__viewport"${opts.fitOnly ? "" : ' tabindex="0"'}>
      <div class="sk-canvas__content">
        <div class="sk-annotated">
          <div class="sk-annotated__subject" inert>
            ${opts.specimen}
          </div>${opts.key ? `\n          <p class="sk-annotated__key">${opts.key}</p>` : ""}
          ${bubbles}
          <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
        </div>
      </div>
    </div>${
      opts.fitOnly
        ? ""
        : `
    <div class="sk-canvas__controls">
      ${canvasControl("zoom-in", canvas.zoomInLabel)}
      ${canvasControl("zoom-out", canvas.zoomOutLabel)}
      ${canvasControl("fit", canvas.fitLabel)}
    </div>
    <p class="sk-canvas__hint" data-canvas-hint="touch" aria-hidden="true"><span>${hints.touchHint}</span></p>
    <p class="sk-canvas__hint" data-canvas-hint="wheel" aria-hidden="true"><span>${hints.wheelHint}</span></p>`
    }
  </div>
  <ol class="sk-annotated__legend">
    ${legend}
  </ol>
</div>`;
};
