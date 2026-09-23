import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/** The rail, one event, and the three rungs inside it: dot, eyebrow, heading, detail. */
export const timelineAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("timelinePage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "timeline",
      signature: "Timeline",
      attrs: { "aria-label": t("anatomy.label") },
      children: [
        {
          contract: "timeline",
          signature: "TimelineItem",
          options: { time: "2026-03-14", tone: "success" },
          slots: {
            icon: { contract: "icon", signature: "Icon", options: { name: "success" } },
            time: t("anatomy.item1"),
            heading: t("anatomy.title"),
            children: {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("anatomy.description"),
            },
          },
        },
        {
          contract: "timeline",
          signature: "TimelineItem",
          options: { time: "2026-03-12" },
          slots: {
            time: t("anatomy.item2"),
            heading: t("anatomy.item3"),
          },
        },
      ],
    },
    items: [
      namePart(".sk-timeline", "block-start"),
      namePart(".sk-timeline__item", "inline-start"),
      namePart(".sk-timeline__marker", "inline-start", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-timeline__time", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-timeline__heading", "inline-end", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-timeline__body", "inline-end", { ringPlacement: "offset", ringDistance: 6 }),
    ],
  },
});

/*
 * THE CASE THE COMPONENT WAS BUILT FOR: a history of a single thing, newest first.
 *
 * Order is the author's and there is no option for it, so this tree simply writes the entries in
 * the order a reader wants them. The last entry carries no detail, which is the common shape of an
 * older event: the further back it is, the less there is left to say about it.
 */
export const timelineTree = (t: Translate): UsageTree => ({
  contract: "timeline",
  signature: "Timeline",
  attrs: { "aria-label": t("demo.timeline.label") },
  children: [
    {
      contract: "timeline",
      signature: "TimelineItem",
      options: { time: "2026-03-14T14:20", tone: "success" },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "success" } },
        time: t("demo.timeline.delivered.time"),
        heading: t("demo.timeline.delivered.heading"),
        children: {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("demo.timeline.delivered.body"),
        },
      },
    },
    {
      contract: "timeline",
      signature: "TimelineItem",
      options: { time: "2026-03-13T08:05" },
      slots: {
        time: t("demo.timeline.outForDelivery.time"),
        heading: t("demo.timeline.outForDelivery.heading"),
        children: {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("demo.timeline.outForDelivery.body"),
        },
      },
    },
    {
      contract: "timeline",
      signature: "TimelineItem",
      options: { time: "2026-03-11T17:40", tone: "warning" },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "warning" } },
        time: t("demo.timeline.delayed.time"),
        heading: t("demo.timeline.delayed.heading"),
        children: {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("demo.timeline.delayed.body"),
        },
      },
    },
    {
      contract: "timeline",
      signature: "TimelineItem",
      options: { time: "2026-03-10T09:12" },
      slots: {
        time: t("demo.timeline.placed.time"),
        heading: t("demo.timeline.placed.heading"),
      },
    },
  ],
});

/*
 * THE FIVE TONES ON ONE RAIL, so they can be compared rather than described.
 *
 * Every heading here says in words what its dot says in colour, which is the rule the contract
 * states and the reason the dot is `aria-hidden`: read with the colour removed, this list still
 * reports the same four outcomes.
 */
export const timelineTonesTree = (t: Translate): UsageTree => ({
  contract: "timeline",
  signature: "Timeline",
  attrs: { "aria-label": t("demo.timeline.tonesLabel") },
  children: [
    {
      contract: "timeline",
      signature: "TimelineItem",
      options: { tone: "accent" },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "info" } },
        time: t("demo.timeline.tone.accent.time"),
        heading: t("demo.timeline.tone.accent.heading"),
      },
    },
    {
      contract: "timeline",
      signature: "TimelineItem",
      options: { tone: "success" },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "success" } },
        time: t("demo.timeline.tone.success.time"),
        heading: t("demo.timeline.tone.success.heading"),
      },
    },
    {
      contract: "timeline",
      signature: "TimelineItem",
      options: { tone: "warning" },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "warning" } },
        time: t("demo.timeline.tone.warning.time"),
        heading: t("demo.timeline.tone.warning.heading"),
      },
    },
    {
      contract: "timeline",
      signature: "TimelineItem",
      options: { tone: "danger" },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "danger" } },
        time: t("demo.timeline.tone.danger.time"),
        heading: t("demo.timeline.tone.danger.heading"),
      },
    },
    {
      contract: "timeline",
      signature: "TimelineItem",
      slots: { time: t("demo.timeline.tone.neutral.time"), heading: t("demo.timeline.tone.neutral.heading") },
    },
  ],
});
