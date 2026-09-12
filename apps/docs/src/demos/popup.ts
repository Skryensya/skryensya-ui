import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The bare surface, `Popover.bare`, which is what this page calls a popup.
 *
 * It is not a second component and this file is the proof: the same contract, one signature down,
 * with the title, the description and the close control left out. What goes inside is the
 * composition's business, which is the whole reason the surface has no semantics of its own.
 *
 * The authored version carried two inline anchor names. The stylesheet scopes one now, so nothing
 * here mentions anchoring.
 */
export const popupTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover.bare",
  options: { panelId: "filters-popup", bare: true, arrow: true },
  slots: {
    trigger: t("demo.popup.trigger"),
    children: {
      contract: "checkbox",
      signature: "Checkbox",
      options: { name: "active" },
      children: t("demo.popup.onlyActive"),
    },
  },
});


/*
 * THE ANATOMY SPECIMEN, authored as markup and frozen open, for the two reasons Popover's own is:
 * a live panel sits in the top layer behind `popover` and dismisses on the first pointer press in
 * an inert frame, and `.sk-anchored` is `position: fixed`, so out of flow it contributes nothing to
 * the box `Annotated` measures and the frame collapses onto the trigger. No mount attributes, no
 * `popover` attribute (the UA rule for a closed one would hide the panel), and the CSS below puts
 * the surface back in flow and forces the open paint.
 *
 * ONE NODE, THREE CLASSES, and that is the whole anatomy of a Popup rather than a detail of it. The
 * bare signature emits no content wrapper: the element that `sk-anchored` places IS the element
 * that `sk-popover__content` paints, so the drawing names the same box twice, from opposite gutters
 * and at two distances. The inner ring is the surface, the outer one the pattern that positions it,
 * exactly the two-rings-on-one-box reading Button's diagram uses for `sk-button` and
 * `sk-interactive`.
 *
 * `sk-popover__positioner` rides that same node and is NOT labelled: a third ring on one box teaches
 * nothing a reader can act on, and between the positioner and the content class it is the content
 * one a consumer styles.
 *
 * The checkbox inside is the emitter's own markup for `Checkbox`, minus the indeterminate indicator
 * the specimen can never be in. It is filler: what goes in a bare surface is the composition's
 * business, which is the point of the signature, so the diagram names none of it.
 */
const popupAnatomySpecimen = (t: Translate): string => `<div class="sk-popover">
  <button class="sk-popover__trigger sk-button sk-interactive sk-anchor" type="button" tabindex="-1" aria-expanded="true">
    ${t("demo.popup.trigger")}
  </button>
  <div class="sk-popover__positioner sk-popover__content sk-anchored" data-state="open" data-sk-placement="block-end">
    <span class="sk-anchored-arrow" aria-hidden="true"></span>
    <label class="sk-checkbox">
      <input class="sk-checkbox__input" name="active" type="checkbox" tabindex="-1" checked />
      <span class="sk-checkbox__control sk-interactive" aria-hidden="true">
        <span class="sk-checkbox__indicator" data-state="checked">
          <span data-sk-icon="check" data-sk-icon-size="sm"></span>
        </span>
      </span>
      <span class="sk-checkbox__label">${t("demo.popup.onlyActive")}</span>
    </label>
  </div>
</div>`;

const label = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

export const popupAnatomyHtml = (t: Translate): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${t("popupPage.anatomyLabel")}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${popupAnatomySpecimen(t)}
  </div>
  ${label(".sk-popover", "block-start", "sk-popover", ' data-ring-placement="offset" data-ring-distance="6"')}
  ${label(".sk-popover__trigger", "inline-start", "sk-popover__trigger")}
  ${label(".sk-popover__content", "inline-start", "sk-popover__content")}
  ${label(".sk-anchored", "inline-end", "sk-anchored", ' data-ring-placement="offset" data-ring-distance="4"')}
  ${label(".sk-anchored-arrow", "inline-end", "sk-anchored-arrow", ' data-ring-placement="offset" data-ring-distance="3"')}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

/* Lifted from Popover's own anatomy sheet, because the two specimens have the same problem: a fixed
   surface has to come back into flow before it can be measured, and a panel that paints itself
   closed until `:popover-open` has to be told to look open. */
export const popupAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-popover {
  display: inline-grid;
  justify-items: start;
  gap: var(--space-stack-md);
  inline-size: min(100%, 15rem);
}

.sk-annotated__subject > .sk-popover > .sk-popover__positioner {
  position: relative;
  inline-size: 100%;
  display: grid;
  gap: var(--space-stack-sm);
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: blur(0);
  margin: 0;
  pointer-events: none;
}

.sk-annotated__subject > .sk-popover > .sk-popover__positioner > .sk-anchored-arrow {
  position: absolute;
  inset-block-start: calc(-1 * var(--sk-anchored-arrow-size, 8px) / 2);
  inset-inline-start: 50%;
  translate: -50% 0;
  margin: 0;
}

.sk-annotated__subject {
  text-align: center;
}`;
