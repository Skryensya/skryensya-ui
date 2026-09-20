import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * TIMELINE, a sequence of events that already happened, read down a rail.
 *
 * The unit is one EVENT, and the thing that distinguishes it from everything nearby is that the
 * time is a rung of the hierarchy rather than a footnote. Three rungs, in reading order: when it
 * happened (quiet, above), what happened (the loudest line), and the detail (quiet, below). An
 * author who only has two of those still gets a timeline; the heading is the one that is required.
 *
 * WHAT THIS IS NOT, because three neighbours are close enough to be confused for it:
 *
 *   - Steps models a process the reader is INSIDE: its items carry complete / current / upcoming
 *     and exactly one is current. Nothing here is "current" - it all already happened - and a
 *     Timeline whose entries had status would be a vertical Steps with the content misplaced.
 *   - ProcessList is instructions to follow. Order is its only state and there is no time at all.
 *   - Changelog is releases, and says so in its own vocabulary: its entries are versions, its
 *     order is locked newest-first because that is what a changelog IS, and its scale is a dense
 *     document at 85ch. This one takes arbitrary events in whichever order the author writes them.
 *
 * ORDER IS THE AUTHOR'S and there is no option for it. Both directions are legitimate here (a
 * history reads newest-first, a roadmap oldest-first), and the author already expresses the choice
 * by writing the entries in that order. An option would be a second place to say the same thing.
 */
export const timelineParts = {
  root: "sk-timeline",
  item: "sk-timeline__item",
  /** The dot on the rail. Decorative: the heading beside it is the readable form. */
  marker: "sk-timeline__marker",
  /** The eyebrow. Quiet and above the heading, which is the whole hierarchy decision. */
  time: "sk-timeline__time",
  heading: "sk-timeline__heading",
  body: "sk-timeline__body",
} as const;

export type TimelinePart = keyof typeof timelineParts;
export type TimelinePartClass = (typeof timelineParts)[TimelinePart];

export const timelineContract = {
  id: "timeline",
  category: "content",
  css: "@skryensya/core/components/timeline.css",
  parts: timelineParts,
  hooks: [
    "--sk-timeline-body-fg",
    "--sk-timeline-connector-color",
    "--sk-timeline-connector-size",
    "--sk-timeline-content-gap",
    /* Half the first line: where the dot centres and the connector starts. Moving it moves both. */
    "--sk-timeline-first-line",
    "--sk-timeline-heading-fg",
    "--sk-timeline-heading-font-size",
    "--sk-timeline-item-gap",
    "--sk-timeline-marker-color",
    "--sk-timeline-marker-size",
    "--sk-timeline-measure",
    "--sk-timeline-rail",
    "--sk-timeline-time-fg",
  ],
  options: {
    /**
     * When the event happened, machine-readable, written to `<time datetime>`. An ISO 8601 date
     * (`2026-03-14`) or datetime (`2026-03-14T09:30`), whichever precision the event has.
     */
    time: { type: "string", attr: "datetime" },
    /**
     * Emphasis on the dot. `neutral` is the ordinary event; the rest mark one that a reader
     * scanning the rail should stop at. Emphasis only: an entry's tone is never the sole carrier
     * of its meaning, because the dot it colours is `aria-hidden`.
     */
    tone: {
      type: "enum",
      values: ["neutral", "accent", "success", "warning", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
  },

  signatures: {
    Timeline: {
      intent: ["event-history", "activity-log", "what-happened-when", "order-tracking"],
      host: { element: "ol" },
      options: [],
      slots: { children: { accepts: "signature", required: true, of: ["TimelineItem"] } },
      /* `role="list"`: `list-style: none` (timeline.css) drops the implicit list role in
       * Safari/VoiceOver, and a history that does not announce as a list loses its length. */
      template: { element: "ol", part: "root", host: true, attrs: { role: "list" }, slot: "children" },
      react: { from: "@skryensya/react/timeline", name: "Timeline" },
    },

    TimelineItem: {
      intent: ["one-event", "one-entry-of-a-history"],
      host: { element: "li" },
      parents: ["Timeline"],
      options: ["time", "tone"],
      slots: {
        /*
         * THE TIME IS TWO FACTS AND SO IT IS TWO FIELDS, the same split Changelog makes and for
         * the same reason. The `time` OPTION is the machine one and lands on `<time datetime>`,
         * where a parser can reach it. The visible one is a SLOT, because a formatted date is copy
         * in a language and Core ships none.
         *
         * `prop`, because the slot and the option are deliberately the same word: they are one
         * fact in two representations. React has no such luxury - both land in one flat props
         * object, where two `time=` would be a syntax error rather than a divergence - so the
         * binding calls it `timeLabel`, and this is where the contract says so.
         */
        time: { accepts: "text", prop: "timeLabel" },
        heading: { accepts: "text", required: true },
        /*
         * THE KIT'S ICON, not any node. `of: ["Icon"]` is what Callout's icon slot says too, and it
         * buys the same two things: the name is checked against the stable vocabulary at validation
         * time rather than crashing at mount, and the drawing follows whichever set the page binds.
         *
         * Absent, the dot is a plain disc, which is the common case: most events are not worth a
         * glyph, and a rail where every dot carries one has no emphasis left to give.
         */
        icon: { accepts: "signature", of: ["Icon"] },
        children: { accepts: "node" },
      },
      template: {
        element: "li",
        part: "item",
        host: true,
        options: ["tone"],
        children: [
          /*
           * `aria-hidden`, because the dot repeats nothing: the heading beside it is the event and
           * the tone is emphasis on top of text that already says the same. A tone is never the
           * only carrier of its meaning - an entry coloured "danger" whose heading does not say
           * what went wrong is a failure of the copy, which no contract can check.
           */
          { element: "span", part: "marker", attrs: { "aria-hidden": "true" }, slot: "icon" },
          /*
           * FLAT, NOT WRAPPED. These are direct children of the `<li>` because the `<li>` is the
           * grid: each one places itself in column 2 and stacks by source order, and the rule that
           * re-aims the connector when there is no eyebrow reads `:has(> .sk-timeline__time)`. A
           * wrapper div would put every one of them out of that grid's reach.
           */
          { element: "time", part: "time", options: ["time"], whenGiven: "time", slot: "time" },
          { element: "span", part: "heading", slot: "heading" },
          { element: "div", part: "body", whenGiven: "children", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/timeline", name: "TimelineItem" },
    },
  },

} as const satisfies ComponentContract;

/**
 * Derived, never restated: a binding that hand-wrote this union would be a second place the value
 * set lives, and the conformance gate reads exactly that as drift.
 */
export type TimelineTone = OptionValue<typeof timelineContract.options.tone>;
