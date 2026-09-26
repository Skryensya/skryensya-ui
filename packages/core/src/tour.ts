import { anchorPlacements, type AnchorPlacement } from "./anchored.js";
import type { ComponentContract, ContractTemplate, OptionsOf } from "./contract.js";

/*
 * TOUR, a guided walk through a page, one element at a time, that never takes the page away.
 *
 * WHAT IT IS NOT, and every "not" is a requirement rather than a taste:
 *   - NOT MODAL. No backdrop, no scrim, not even a transparent one catching clicks, no `inert`, no
 *     `aria-modal`, no `aria-hidden` sweep. The page stays usable while the tour is up: the step is
 *     ABOUT an element, and a reader who wants to try that element should be able to.
 *   - NOT A TOOLTIP. The box holds buttons, and `role="tooltip"` may not contain anything interactive.
 *     It is a NON-MODAL `role="dialog"`, named by its title and described by its progress and body.
 *   - NOT AUTOMATIC. It starts only when someone asks (a `Tour.Trigger` or `start()`), never advances
 *     on a timer, never clicks, types or submits anything on the reader's behalf, and a click outside
 *     it does nothing at all: dismissing is always a button or Escape, never an accident.
 *   - NOT A TRAP. Focus moves to Continue on start and on a step change made with the tour's own
 *     controls, and nowhere else; Tab and Shift+Tab leave the box like any other region.
 *
 * THE SPLIT, Lightbox's: what can be computed without a DOM is pure and tested here (which step
 * comes next when some targets are missing, where the box goes, how the progress reads); the event
 * wiring is ONE framework-free controller, `connectTour` in `tour-controller.ts`, which both bindings
 * call on the same markup.
 *
 * WHY THIS MEASURES, when ADR-0011 says anchored boxes are the browser's to place. The anchor here is
 * not the component's own element: it is any element on the consumer's page, found by a selector.
 * Making it an anchor would mean writing `anchor-name` onto markup the tour does not own, and the ring
 * has to copy that element's corner radii, which no CSS can read off another element. With the rect
 * and the radii measured anyway, the box is placed from the same numbers, so the two can never
 * disagree about where the target is. Placement stays logical (`block-end` …), the ADR's vocabulary.
 */

/* ---------------------------------------------------------------------------------------------- *
 * Data
 * ---------------------------------------------------------------------------------------------- */

/** Which side of its target a step's box asks for. A request: it flips, then docks, when it does not fit. */
export type TourPlacement = AnchorPlacement;
export const tourPlacements = anchorPlacements;

/** One stop of the tour: one element, one idea. */
export type TourStep = {
  /** A CSS selector for the element this step is about. The first match on the page is the target. */
  readonly target: string;
  /** A short name for the target, said first. The step's title is what the dialog is called. */
  readonly title: string;
  /** One or two sentences: what it is and why it matters. */
  readonly description: string;
  /** Default `block-end`. */
  readonly placement?: TourPlacement;
};

/**
 * Where a tour stands. `idle` has never run (or was forgotten); the three endings are remembered
 * separately because they mean different things to a product deciding whether to mention the tour
 * again: a reader who finished it and one who skipped it at step one are not the same reader.
 */
export type TourStatus = "idle" | "running" | "completed" | "skipped" | "dismissed";
export const tourStatuses = ["idle", "running", "completed", "skipped", "dismissed"] as const satisfies readonly TourStatus[];
/** The endings worth remembering across visits. `running` never is: a reload does not resume a tour. */
export const tourRememberedStatuses = ["completed", "skipped", "dismissed"] as const satisfies readonly TourStatus[];
export type TourRememberedStatus = (typeof tourRememberedStatuses)[number];

/* ---------------------------------------------------------------------------------------------- *
 * Anatomy
 * ---------------------------------------------------------------------------------------------- */

export const tourParts = {
  /** Holds the step list, the ring and the box. Draws nothing of its own. */
  root: "sk-tour",
  /** `<ol hidden>`: the steps as data. Never shown; the controller reads it. */
  steps: "sk-tour__steps",
  step: "sk-tour__step",
  stepTitle: "sk-tour__step-title",
  stepDescription: "sk-tour__step-description",
  /** The highlight around the target. Decorative, `aria-hidden`, and never hit-tested. */
  ring: "sk-tour__ring",
  /** The non-modal dialog. Holds the arrow and the content; paints the surface. */
  popover: "sk-tour__popover",
  /** The notch pointing at the target. Decorative, `aria-hidden`; absent while the box is docked. */
  arrow: "sk-tour__arrow",
  /** Everything readable, and the part that scrolls when text is enlarged past the screen. */
  content: "sk-tour__content",
  header: "sk-tour__header",
  /** "Step 2 of 4". Text, so position is never colour or dots alone. */
  progress: "sk-tour__progress",
  /** What the dialog is called. A heading, not a focus target: focus goes to Continue. */
  title: "sk-tour__title",
  description: "sk-tour__description",
  footer: "sk-tour__footer",
  /** The previous/next pair, kept together at the inline end so they never move between steps. */
  nav: "sk-tour__nav",
  /** Every button the box draws. Which one is `data-tour-action`. */
  control: "sk-tour__control",
  /** Inside the next button: "Continue" on every step but the last, "Finish" on the last. */
  nextLabel: "sk-tour__next-label",
  finishLabel: "sk-tour__finish-label",
  /** Polite live region: says a NEW step once, when focus stays on Continue and so says nothing. */
  live: "sk-tour__live",
  /** A button that starts the tour over from step one, from anywhere on the page. */
  trigger: "sk-tour__trigger",
  /** Inside a trigger with a `restartLabel`: which label shows depends on what was remembered. */
  triggerStart: "sk-tour__trigger-start",
  triggerRestart: "sk-tour__trigger-restart",
} as const;

export type TourPart = keyof typeof tourParts;

export const tourAttrs = {
  /** The Vanilla enhancer's attachment point. */
  root: "data-sk-tour",
  /** Which action a control performs. */
  action: "data-tour-action",
  /** On a trigger: the id of the tour it starts. */
  opens: "data-sk-tour-open",
  /** On a step: its target selector and requested placement. */
  target: "data-tour-target",
  placement: "data-placement",
  /** Configuration read by the controller off the root. */
  progressLabel: "data-progress-label",
  remember: "data-remember",
  /** Written by the controller on the root and on every trigger naming it. */
  status: "data-sk-tour-status",
  /** Written on the box: the side it actually landed on, or `docked`. */
  side: "data-sk-side",
  /** Written on the box: which of its PHYSICAL edges the arrow sits on. Absent while docked. */
  arrow: "data-sk-arrow",
  /** Written on the box and the ring while they travel from one step's target to the next. */
  moving: "data-sk-moving",
  /** Written on the box on the last available step: the next button reads "Finish". */
  last: "data-sk-last",
  /** Written on the ring and the box while the target is scrolled out of the viewport. */
  offscreen: "data-sk-offscreen",
} as const;

export type TourAction = "close" | "skip" | "previous" | "next";
export const tourActions = ["close", "skip", "previous", "next"] as const satisfies readonly TourAction[];

/* ---------------------------------------------------------------------------------------------- *
 * Navigation - pure
 * ---------------------------------------------------------------------------------------------- */

/**
 * The step to go to from `from` in direction `delta`, skipping every step whose target is not there,
 * or `null` when there is none. `from` itself is never returned, so a missing current step can ask
 * "what is next" without landing on itself.
 *
 * `available[i]` is whether step `i`'s target exists and is shown RIGHT NOW: asked again on every
 * move, because a target can appear (a panel opened) or go (a row deleted) between two steps.
 */
export function tourStep(from: number, delta: 1 | -1, available: readonly boolean[]): number | null {
  for (let at = from + delta; at >= 0 && at < available.length; at += delta) {
    if (available[at]) return at;
  }
  return null;
}

/** The first step with a target, or `null` when not one of them is on the page. */
export function tourFirstStep(available: readonly boolean[]): number | null {
  return tourStep(-1, 1, available);
}

/**
 * Where a step sits among the steps that can be shown: `Step 2 of 3` when one of four is missing.
 * Counting the missing one would promise a step the reader will never see, and the last step would
 * then read "3 of 4" with no fourth coming.
 */
export function tourProgress(index: number, available: readonly boolean[]): { position: number; count: number } {
  let count = 0;
  let position = 0;
  available.forEach((shown, at) => {
    if (!shown) return;
    count += 1;
    if (at <= index) position = count;
  });
  return { position, count };
}

/** "Step {index} of {count}", filled. 1-based, the way people count. */
export function formatTourProgress(template: string, position: number, count: number): string {
  return template.replaceAll("{index}", String(position)).replaceAll("{count}", String(count));
}

/** A placement a step asked for, made one that exists. Anything else is the default. */
export function normalizeTourPlacement(value: string | null | undefined): TourPlacement {
  return (tourPlacements as readonly string[]).includes(value ?? "") ? (value as TourPlacement) : "block-end";
}

/** The slot a tour's ending is remembered under, in the system's one storage entry. */
export const tourMemorySlot = (tourId: string): string => `tour:${tourId}`;

/** A remembered status, read as untrusted input: anything that is not an ending reads as nothing. */
export function parseTourMemory(raw: unknown): TourRememberedStatus | undefined {
  return typeof raw === "string" && (tourRememberedStatuses as readonly string[]).includes(raw)
    ? (raw as TourRememberedStatus)
    : undefined;
}

/* ---------------------------------------------------------------------------------------------- *
 * Placement - pure
 * ---------------------------------------------------------------------------------------------- */

export type TourRect = { readonly top: number; readonly left: number; readonly width: number; readonly height: number };
export type TourSize = { readonly width: number; readonly height: number };
type PhysicalSide = "top" | "bottom" | "left" | "right";
const facing = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;

/** The side the box landed on, logically, or `docked` when it fit on none and sits at a viewport edge. */
export type TourSide = TourPlacement | "docked";

export type TourEdge = PhysicalSide;

/**
 * Where the box goes, which side it landed on, and where its arrow is: the box's edge facing the
 * target and the distance along that edge, in px from the box's top or left. No arrow when docked.
 */
export type TourPlacementResult = {
  readonly side: TourSide;
  readonly top: number;
  readonly left: number;
  readonly arrow: { readonly edge: TourEdge; readonly offset: number } | null;
};

/** How far the arrow's centre keeps from the box's corners, so it never lands on the rounding. */
export const TOUR_ARROW_INSET = 20;

/** Gap between the target and the box, and the least room the box keeps from the viewport's edges. */
export const TOUR_GAP = 16;
export const TOUR_VIEWPORT_MARGIN = 8;

const physical = (placement: TourPlacement, rtl: boolean): PhysicalSide => {
  switch (placement) {
    case "block-start":
      return "top";
    case "block-end":
      return "bottom";
    case "inline-start":
      return rtl ? "right" : "left";
    case "inline-end":
      return rtl ? "left" : "right";
  }
};

const opposite = { "block-start": "block-end", "block-end": "block-start", "inline-start": "inline-end", "inline-end": "inline-start" } as const;

/**
 * The order sides are tried in: the one asked for, its opposite (same axis: someone asking for
 * `inline-end` wants the box BESIDE the target, so the other side beats above), then the other axis,
 * block-end before block-start because a reader's eye moves down.
 */
export function tourPlacementOrder(preferred: TourPlacement): readonly TourPlacement[] {
  const block = preferred === "block-start" || preferred === "block-end";
  const cross: readonly TourPlacement[] = block ? ["inline-end", "inline-start"] : ["block-end", "block-start"];
  return [preferred, opposite[preferred], ...cross];
}

const clamp = (value: number, min: number, max: number) => (max < min ? min : Math.min(Math.max(value, min), max));

/**
 * Where the box goes, in viewport pixels, so that it never covers its own target and never leaves the
 * screen.
 *
 * Each side in `tourPlacementOrder` is tried in turn and the first where the WHOLE box fits wins:
 * the room between the target and that edge of the viewport holds the box plus the gap plus the
 * margin, and the box's other dimension fits in the viewport at all. On the cross axis it centres on
 * the target and is then pushed back inside the viewport, so a target near an edge gets a box that
 * starts at that edge rather than one cut by it.
 *
 * When no side fits (a target taller than the screen, a phone at 400% zoom) the box DOCKS: it sits
 * against the bottom of the viewport, or the top when the target's middle is in the lower half, so it
 * covers the half of the screen the target is not in. Covering part of a target is then unavoidable;
 * covering the part the reader is looking at is not.
 */
export function placeTourPopover(input: {
  readonly target: TourRect;
  readonly popover: TourSize;
  readonly viewport: TourSize;
  readonly preferred?: TourPlacement;
  readonly rtl?: boolean;
  readonly gap?: number;
  readonly margin?: number;
}): TourPlacementResult {
  const { target, popover, viewport, rtl = false, gap = TOUR_GAP, margin = TOUR_VIEWPORT_MARGIN } = input;
  const preferred = input.preferred ?? "block-end";
  const bottom = target.top + target.height;
  const right = target.left + target.width;
  const room: Record<PhysicalSide, number> = {
    top: target.top - gap - margin,
    bottom: viewport.height - bottom - gap - margin,
    left: target.left - gap - margin,
    right: viewport.width - right - gap - margin,
  };
  const maxLeft = viewport.width - popover.width - margin;
  const maxTop = viewport.height - popover.height - margin;
  const centredLeft = clamp(target.left + target.width / 2 - popover.width / 2, margin, maxLeft);
  const centredTop = clamp(target.top + target.height / 2 - popover.height / 2, margin, maxTop);

  for (const placement of tourPlacementOrder(preferred)) {
    const side = physical(placement, rtl);
    const vertical = side === "top" || side === "bottom";
    const fitsAlong = room[side] >= (vertical ? popover.height : popover.width);
    const fitsAcross = vertical ? popover.width <= viewport.width - 2 * margin : popover.height <= viewport.height - 2 * margin;
    if (!fitsAlong || !fitsAcross) continue;
    const at = {
      top: { top: target.top - gap - popover.height, left: centredLeft },
      bottom: { top: bottom + gap, left: centredLeft },
      left: { top: centredTop, left: target.left - gap - popover.width },
      right: { top: centredTop, left: right + gap },
    }[side];
    /* The arrow points at the target's middle, on the box's edge facing it, and stays clear of the
       corners. A box pushed along by the viewport keeps pointing at its target, not at its own centre. */
    const along = vertical
      ? clamp(target.left + target.width / 2 - at.left, TOUR_ARROW_INSET, popover.width - TOUR_ARROW_INSET)
      : clamp(target.top + target.height / 2 - at.top, TOUR_ARROW_INSET, popover.height - TOUR_ARROW_INSET);
    return {
      side: placement,
      top: round(at.top),
      left: round(at.left),
      arrow: { edge: facing[side], offset: round(along) },
    };
  }

  const targetInLowerHalf = target.top + target.height / 2 > viewport.height / 2;
  return {
    side: "docked",
    top: round(targetInLowerHalf ? margin : Math.max(margin, maxTop)),
    left: round(clamp((viewport.width - popover.width) / 2, margin, maxLeft)),
    arrow: null,
  };
}

/** Whether any of the target is inside the viewport. A ring drawn around nothing on screen is noise. */
export function tourRectVisible(rect: TourRect, viewport: TourSize): boolean {
  return rect.top + rect.height > 0 && rect.left + rect.width > 0 && rect.top < viewport.height && rect.left < viewport.width;
}

/**
 * Whether the target sits fully inside the viewport with `margin` to spare. Only then does a step
 * leave the scroll alone: the page moves when it has to, and only once per step, never while the
 * reader is scrolling on their own.
 */
export function tourRectInView(rect: TourRect, viewport: TourSize, margin = TOUR_VIEWPORT_MARGIN): boolean {
  return (
    rect.top >= margin &&
    rect.left >= margin &&
    rect.top + rect.height <= viewport.height - margin &&
    rect.left + rect.width <= viewport.width - margin
  );
}

/**
 * A target's corner radius, grown by the ring's offset so the ring stays PARALLEL to the target's
 * edge: a pill target gets a pill ring, a square card a softly rounded one. Percentages stay
 * percentages (a circle stays a circle); an elliptical corner (`10px 20px`) is read by its first
 * radius, which is close enough for a ring and not worth a second code path.
 */
export function tourRingRadius(corner: string, offset: number): string {
  const first = corner.trim().split(/\s+/)[0] ?? "";
  if (first.endsWith("%")) return first;
  const px = Number.parseFloat(first);
  return `${round((Number.isFinite(px) ? Math.max(px, 0) : 0) + offset)}px`;
}

/* Two decimals of a pixel, and never `-0`. */
function round(value: number): number {
  return Math.round(value * 100) / 100 || 0;
}

/* ---------------------------------------------------------------------------------------------- *
 * Template
 * ---------------------------------------------------------------------------------------------- */

/*
 * THE BUTTONS, one level each so the hierarchy is visible before it is read. The box itself is the
 * accent, so tone cannot carry the hierarchy here; emphasis does, repainted for that surface in
 * tour.css: Continue/Finish is the one solid (inverted: light on the accent), Previous is soft
 * (outlined), "Skip tour" and Close are ghost. All `sm`: a compact face with Button's 44px hit area
 * around it, so every target is still at least 44x44 CSS px.
 */
const button = (
  action: TourAction,
  attrs: Record<string, string>,
  children: readonly ContractTemplate[],
  options?: readonly string[],
): ContractTemplate => ({
  element: "button",
  part: "control",
  also: ["sk-button", "sk-interactive"],
  ...(options ? { options } : {}),
  attrs: { type: "button", [tourAttrs.action]: action, ...attrs },
  children,
});

const text = (option: string): ContractTemplate => ({ element: "span", textFromOption: option });

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

/*
 * THE MARKUP IS THE SHELL; THE CONTROLLER FILLS IT, as in Lightbox. The steps are authored as data
 * (a hidden list), and everything that changes with the step (the title, the body, the progress, which
 * buttons show, where the box and the ring are) is written by `connectTour`, so a React re-render and
 * an authored page can never disagree about which step is up.
 *
 * THE BOX AND THE RING ARE `popover="manual"`: the top layer without any of the Popover API's light
 * dismiss (a click outside must not close a tour) and without its Escape (which the controller handles
 * itself, so it can yield to a menu or a dialog that has a better claim to the key). The top layer is
 * what keeps them above the page's own z-indexes and outside every `overflow: hidden` and `transform`.
 */
export const tourContract = {
  id: "tour",
  category: "overlays",
  css: "@skryensya/core/components/tour.css",
  parts: tourParts,
  systemOwned: [],
  hooks: [
    "--sk-tour-bg",
    "--sk-tour-fg",
    "--sk-tour-muted-fg",
    "--sk-tour-border-color",
    "--sk-tour-radius",
    "--sk-tour-padding",
    "--sk-tour-shadow",
    "--sk-tour-max-inline-size",
    "--sk-tour-arrow-size",
    "--sk-tour-arrow-offset",
    "--sk-tour-ring-color",
    "--sk-tour-ring-halo",
    "--sk-tour-ring-width",
    "--sk-tour-ring-offset",
  ],
  hookSheets: ["@skryensya/core/patterns/visually-hidden.css"],
  /* Written by the controller on every placement: overriding it does nothing. */
  outputHooks: ["--sk-tour-arrow-offset"],
  events: {
    statusChange: "sk:tourstatuschange",
    stepChange: "sk:tourstepchange",
  },
  eventDetails: {
    statusChange: {
      detail: { status: "TourStatus" },
      reactProp: "onStatusChange",
      reactDetail: "TourStatus",
      source: "root",
    },
    stepChange: {
      detail: { index: "number", step: "TourStep" },
      reactProp: "onStepChange",
      reactDetail: "(index: number, step: TourStep)",
      source: "root",
    },
  },

  options: {
    /** The tour's id, which its triggers name in `opens` and its memory is keyed by. */
    tourId: { type: "string", attr: "id", prop: "id" },
    /** "Step {index} of {count}". Counts only the steps whose target is on the page. */
    progressLabel: {
      type: "string",
      default: "Step {index} of {count}",
      attr: tourAttrs.progressLabel,
      machineInput: true,
    },
    nextLabel: { type: "string", default: "Continue" },
    finishLabel: { type: "string", default: "Finish" },
    previousLabel: { type: "string", default: "Previous" },
    /** Shown on the first step only: after that, leaving is Close or Escape. */
    skipLabel: { type: "string", default: "Skip tour" },
    closeLabel: { type: "string", default: "Close tour", attr: "aria-label" },
    /**
     * Remember how the tour ended (completed, skipped, dismissed) across visits, in the system's one
     * storage entry. It never makes the tour start or stop on its own: it is there so a product can
     * decide not to mention the tour again, and so a trigger can say "Repeat tour".
     */
    remember: { type: "boolean", default: true, attr: tourAttrs.remember, falseValue: "false", machineInput: true },

    /* ---- Tour.Trigger ---- */
    /** The `tourId` of the tour this trigger starts, from step one, whatever happened before. */
    opens: { type: "string", attr: tourAttrs.opens, refersTo: { contract: "tour", option: "tourId" } },
    /** What the trigger says before the tour has ended once. */
    triggerLabel: { type: "string", prop: "label" },
    /** What it says once the tour was completed, skipped or dismissed ("Repeat tour"). */
    restartLabel: { type: "string" },
  },

  signatures: {
    Tour: {
      intent: ["product-tour", "guided-tour", "onboarding-walkthrough", "feature-highlight", "coach-marks"],
      host: { element: "div" },
      mount: tourAttrs.root,
      requires: ["tourId"],
      options: ["tourId", "progressLabel", "nextLabel", "finishLabel", "previousLabel", "skipLabel", "closeLabel", "remember"],
      forward: ["aria-*"],
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: {
        items: {
          accepts: "items",
          required: true,
          minItems: 1,
          prop: "steps",
          item: {
            options: {
              target: { type: "string", attr: tourAttrs.target },
              placement: { type: "enum", values: [...tourPlacements], default: "block-end", attr: tourAttrs.placement },
            },
            slots: {
              title: { accepts: "text", required: true },
              description: { accepts: "text", required: true },
            },
            requires: ["target", "title", "description"],
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "ol",
            part: "steps",
            attrs: { hidden: "" },
            children: [
              {
                repeat: "items",
                element: "li",
                part: "step",
                itemOptions: ["target", "placement"],
                children: [
                  { element: "p", part: "stepTitle", itemSlot: "title" },
                  { element: "p", part: "stepDescription", itemSlot: "description" },
                ],
              },
            ],
          },
          { element: "div", part: "ring", attrs: { "aria-hidden": "true", popover: "manual", hidden: "" } },
          {
            element: "p",
            part: "live",
            also: ["sk-visually-hidden"],
            attrs: { "aria-live": "polite", "aria-atomic": "true" },
          },
          {
            element: "div",
            part: "popover",
            attrs: { role: "dialog", popover: "manual", hidden: "" },
            children: [
              { element: "div", part: "arrow", attrs: { "aria-hidden": "true" } },
              {
                element: "div",
                part: "content",
                children: [
                  {
                    element: "div",
                    part: "header",
                    children: [
                      { element: "p", part: "progress" },
                      button(
                        "close",
                        { "data-variant": "ghost", "data-size": "xs", "data-icon-only": "" },
                        [{ element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "sm" } }],
                        ["closeLabel"],
                      ),
                    ],
                  },
                  { element: "h2", part: "title" },
                  { element: "p", part: "description" },
                  {
                    element: "div",
                    part: "footer",
                    children: [
                      button("skip", { "data-variant": "ghost", "data-size": "sm" }, [text("skipLabel")]),
                      {
                        element: "div",
                        part: "nav",
                        children: [
                          button("previous", { "data-variant": "soft", "data-size": "sm" }, [text("previousLabel")]),
                          button("next", { "data-size": "sm" }, [
                            { element: "span", part: "nextLabel", textFromOption: "nextLabel" },
                            { element: "span", part: "finishLabel", textFromOption: "finishLabel" },
                          ]),
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/tour", name: "Tour" },
    },

    /*
     * WHAT STARTS IT, and what brings it back. Always from step one: a tour resumed halfway is a tour
     * whose first steps the reader never saw. With a `restartLabel` it reads "Repeat tour" once the tour
     * has ended, which is the reader's visible way back after skipping or finishing it.
     */
    "Tour.Trigger": {
      intent: ["start-tour", "repeat-tour", "restart-onboarding"],
      host: { element: "button" },
      options: ["opens", "triggerLabel", "restartLabel"],
      requires: ["opens", "triggerLabel"],
      forward: ["id", "aria-*"],
      compose: [{ of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true }],
      slots: {},
      template: {
        element: "button",
        part: "trigger",
        host: true,
        also: ["sk-button", "sk-interactive"],
        attrs: { type: "button", "data-variant": "soft", "data-size": "md" },
        children: [
          { element: "span", part: "triggerStart", textFromOption: "triggerLabel" },
          { element: "span", part: "triggerRestart", whenGiven: "restartLabel", textFromOption: "restartLabel" },
        ],
      },
      react: { from: "@skryensya/react/tour", name: "Tour.Trigger" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type TourOptions = OptionsOf<typeof tourContract>;
