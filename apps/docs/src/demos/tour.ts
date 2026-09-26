import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyFigureHtml } from "./annotation-parts";

/*
 * A small project list with the four things a first visit needs pointed out: search, the status
 * filter, "New project" and the way back to the tour itself. Real system components, each given the
 * id a step names; the tour holds no markup of its own for them.
 *
 * The ids are per demo: every preview is its own document (a srcdoc frame per binding), but two demos
 * on one page share nothing, so each picks its own prefix and a selector never finds the wrong one.
 */

const labels = (t: Translate) => ({
  progressLabel: t("tour.progressLabel"),
  nextLabel: t("tour.nextLabel"),
  finishLabel: t("tour.finishLabel"),
  previousLabel: t("tour.previousLabel"),
  skipLabel: t("tour.skipLabel"),
  closeLabel: t("tour.closeLabel"),
});

const toolbar = (t: Translate, prefix: string, tourId: string, withFilters = true): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "end" },
  children: [
    /* The field, label included, is the target: the ring goes around what the step names. */
    {
      contract: "form-field",
      signature: "FormField",
      attrs: { id: `${prefix}-search` },
      slots: {
        label: t("tour.demo.searchLabel"),
        children: {
          contract: "input",
          signature: "Input",
          options: { type: "search", placeholder: t("tour.demo.searchPlaceholder") },
        },
      },
    },
    ...(withFilters
      ? [
          {
            contract: "layout",
            signature: "Stack",
            attrs: { id: `${prefix}-filters` },
            children: [
              {
                contract: "segmented",
                signature: "Segmented",
                options: { value: "active", label: t("tour.demo.filterLabel") },
                slots: {
                  items: [
                    { options: { value: "active" }, slots: { label: t("tour.demo.filterActive") } },
                    { options: { value: "archived" }, slots: { label: t("tour.demo.filterArchived") } },
                  ],
                },
              },
            ],
          } satisfies UsageTree,
        ]
      : []),
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "accent" },
      attrs: { id: `${prefix}-new` },
      children: t("tour.demo.newProject"),
    },
    {
      contract: "tour",
      signature: "Tour.Trigger",
      options: { opens: tourId, triggerLabel: t("tour.demo.start"), restartLabel: t("tour.demo.repeat") },
      attrs: { id: `${prefix}-help` },
    },
  ],
});

/* The four-step tour: one element and one idea per step, in the order a reader's eye meets them. */
export const tourBasicTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    toolbar(t, "tour-basic", "demo-tour-basic"),
    {
      contract: "tour",
      signature: "Tour",
      options: { tourId: "demo-tour-basic", ...labels(t) },
      slots: {
        items: [
          {
            options: { target: "#tour-basic-search" },
            slots: { title: t("tour.demo.step1Title"), description: t("tour.demo.step1Body") },
          },
          {
            options: { target: "#tour-basic-filters" },
            slots: { title: t("tour.demo.step2Title"), description: t("tour.demo.step2Body") },
          },
          {
            options: { target: "#tour-basic-new", placement: "block-end" },
            slots: { title: t("tour.demo.step3Title"), description: t("tour.demo.step3Body") },
          },
          {
            options: { target: "#tour-basic-help", placement: "block-end" },
            slots: { title: t("tour.demo.step4Title"), description: t("tour.demo.step4Body") },
          },
        ],
      },
    },
  ],
});

/*
 * The same tour on a page without the filter. Its step is skipped: the progress counts three, and
 * nothing points at a place where something used to be.
 */
export const tourMissingTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    toolbar(t, "tour-missing", "demo-tour-missing", false),
    {
      contract: "tour",
      signature: "Tour",
      options: { tourId: "demo-tour-missing", ...labels(t), remember: false },
      slots: {
        items: [
          {
            options: { target: "#tour-missing-search" },
            slots: { title: t("tour.demo.step1Title"), description: t("tour.demo.step1Body") },
          },
          {
            options: { target: "#tour-missing-filters" },
            slots: { title: t("tour.demo.step2Title"), description: t("tour.demo.step2Body") },
          },
          {
            options: { target: "#tour-missing-new" },
            slots: { title: t("tour.demo.step3Title"), description: t("tour.demo.step3Body") },
          },
          {
            options: { target: "#tour-missing-help" },
            slots: { title: t("tour.demo.step4Title"), description: t("tour.demo.step4Body") },
          },
        ],
      },
    },
  ],
});

/* The trigger needs its restart label shown by the tour's sheet; the input needs a width to be a search. */
export const tourDemoCss = `[id$="-search"] {
  inline-size: min(16rem, 100%);
}`;

/*
 * THE ANATOMY SPECIMEN: step 3 of 4, frozen. A live tour cannot be drawn: at rest its box is hidden,
 * and once running it sits in the top layer at coordinates measured against the viewport, where
 * Annotated cannot reach it. So this is the markup the controller leaves behind on a step, written
 * out and put back in flow: the target, its ring around it, and the box under it with its arrow up.
 *
 * NO `popover` AND NO `hidden` on the ring or the box (the UA would hide both), no mount attribute on
 * the root (nothing here runs), and every button `tabindex="-1"`: Annotated already makes the subject
 * inert, and a diagram is looked at, not operated. A middle step, because it shows both halves of
 * the footer's pair; "Skip tour" only exists on step 1, and the text above the diagram says so.
 */
const tourAnatomySpecimen = (t: Translate): string => `<div class="docs-tour-anatomy">
  <div class="docs-tour-anatomy__target">
    <button class="sk-button sk-interactive" type="button" tabindex="-1" data-tone="accent">${t("tour.demo.newProject")}</button>
    <div class="sk-tour__ring" aria-hidden="true"></div>
  </div>
  <div class="sk-tour__popover" role="dialog" aria-label="${t("tour.demo.step3Title")}" data-sk-side="block-end" data-sk-arrow="top">
    <div class="sk-tour__arrow" aria-hidden="true"></div>
    <div class="sk-tour__content">
      <div class="sk-tour__header">
        <p class="sk-tour__progress">${t("tour.progressLabel").replace("{index}", "3").replace("{count}", "4")}</p>
        <button class="sk-tour__control sk-button sk-interactive" type="button" tabindex="-1" aria-label="${t("tour.closeLabel")}" data-tour-action="close" data-variant="ghost" data-size="xs" data-icon-only>
          <span data-sk-icon="close" data-sk-icon-size="sm"></span>
        </button>
      </div>
      <h2 class="sk-tour__title">${t("tour.demo.step3Title")}</h2>
      <p class="sk-tour__description">${t("tour.demo.step3Body")}</p>
      <div class="sk-tour__footer">
        <div class="sk-tour__nav">
          <button class="sk-tour__control sk-button sk-interactive" type="button" tabindex="-1" data-tour-action="previous" data-variant="soft" data-size="sm"><span>${t("tour.previousLabel")}</span></button>
          <button class="sk-tour__control sk-button sk-interactive" type="button" tabindex="-1" data-tour-action="next" data-size="sm"><span class="sk-tour__next-label">${t("tour.nextLabel")}</span><span class="sk-tour__finish-label">${t("tour.finishLabel")}</span></button>
        </div>
      </div>
    </div>
  </div>
</div>`;

/*
 * NUMBERS AND A LEGEND, NOTHING TO OPERATE: like every anatomy, the canvas only fits (no zoom bar,
 * no hints, no tab stop). Every part the contract names that is on
 * screen at a step: the ring, the box and its arrow, then the box's contents in reading order.
 */
export const tourAnatomyHtml = (t: Translate): string =>
  anatomyFigureHtml(t, {
    label: t("tour.anatomyLabel"),
    specimen: tourAnatomySpecimen(t),
    parts: [
      { for: ".sk-tour__ring", side: "inline-start", ringPlacement: "offset", ringDistance: 2 },
      { for: ".sk-tour__popover", side: "inline-start", mark: "bracket" },
      { for: ".sk-tour__arrow", side: "inline-end" },
      { for: ".sk-tour__progress", side: "inline-start", ringPlacement: "offset", ringDistance: 2 },
      { for: "[data-tour-action='close']", side: "inline-end", name: "sk-tour__control · close" },
      { for: ".sk-tour__title", side: "inline-start", ringPlacement: "offset", ringDistance: 2 },
      { for: ".sk-tour__description", side: "inline-end", ringPlacement: "offset", ringDistance: 2 },
      { for: "[data-tour-action='previous']", side: "block-end", name: "sk-tour__control · previous" },
      { for: "[data-tour-action='next']", side: "block-end", name: "sk-tour__control · next" },
    ],
  });

/*
 * Back in flow. The ring and the box are `position: fixed` with measured coordinates when live; here
 * the ring is absolute around its target and the box is a block under it, its arrow at the middle of
 * its top edge, which is where the target's middle is because both are centred.
 */
export const tourAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.docs-tour-anatomy {
  display: grid;
  justify-items: center;
  gap: 18px;
  padding-block-start: 10px;
}

.docs-tour-anatomy__target {
  position: relative;
  display: inline-flex;
}

.docs-tour-anatomy .sk-tour__ring {
  position: absolute;
  inset: calc(-1 * var(--sk-tour-ring-offset));
  border-radius: calc(var(--radius-control) + var(--sk-tour-ring-offset));
}

.docs-tour-anatomy .sk-tour__popover {
  position: relative;
  inline-size: 18rem;
  --sk-tour-arrow-offset: 50%;
}`;
