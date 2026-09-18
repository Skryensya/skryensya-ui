import type { ComponentContract, ContractTemplate } from "./contract.js";

/*
 * STEPS, a linear progress indicator across an ordered sequence of stages.
 *
 * Each step reports one of three states; exactly one is normally "current". The component displays
 * the sequence, it does not own which step is active nor guard navigation between them.
 */
export type StepStatus = "complete" | "current" | "upcoming";

export type Step = {
  label: string;
  description?: string;
  /** Visible marker override. Complete stages commonly use a tick instead of their position. */
  marker?: string;
  status?: StepStatus;
};

export const stepsParts = {
  root: "sk-steps",
  item: "sk-steps__item",
  marker: "sk-steps__marker",
  label: "sk-steps__label",
  description: "sk-steps__description",
} as const;

export type StepsPart = keyof typeof stepsParts;
export type StepsPartClass = (typeof stepsParts)[StepsPart];

/*
 * Progress across ordered stages, where the STATUS is what matters, which is the whole difference
 * from a Process list, whose content is primary and which has no notion of complete or current.
 *
 * The marker shows a tick when complete and a number otherwise, so the state is never colour alone.
 */
/** What every stage holds, whichever of its two shapes renders (see the template below). */
const stepItemBody: readonly ContractTemplate[] = [
  { element: "span", part: "marker", itemSlot: "marker" },
  {
    element: "span",
    children: [
      { element: "span", part: "label", itemSlot: "label" },
      // `whenItemSlotGiven`, not `whenItemGiven`: the first asks whether the entry filled a SLOT,
      // the second whether it set an OPTION. `description` is a slot, so the option lookup was
      // permanently undefined and this span never emitted: the tree validated, React rendered the
      // descriptions from `steps={[…]}`, and the markup silently dropped them.
      { element: "span", part: "description", whenItemSlotGiven: "description", itemSlot: "description" },
    ],
  },
];

export const stepsContract = {
  id: "steps",
  category: "navigation",
  css: "@skryensya/core/components/steps.css",
  parts: stepsParts,
  hooks: [
    "--sk-steps-connector-size",
    "--sk-steps-item-padding",
    "--sk-steps-marker-size",
  ],

  options: {
    /**
     * The rail's direction. Absent, it is horizontal and turns vertical below 40rem (steps.css); set
     * either value to pin it. React has always taken this as `data-orientation`.
     */
    orientation: { type: "enum", values: ["horizontal", "vertical"], attr: "data-orientation", prop: "data-orientation" },
  },

  signatures: {
    Steps: {
      intent: ["progress-through-stages", "checkout-progress", "wizard-position"],
      host: { element: "ol" },
      options: ["orientation"],
      slots: {
        items: {
          accepts: "items",
          required: true,
          /* At most one stage is where you are; a finished process has none. */
          countWhere: { option: "status", equals: "current", count: "optional" },
          // React calls it `steps`; the contract keys every collection `items`.
          prop: "steps",
          item: {
            options: {
              status: {
                type: "enum",
                values: ["complete", "current", "upcoming"],
                default: "upcoming",
                attr: "data-status",
              },

            },
            slots: {
              /** What the marker shows: an icon when complete, the position otherwise. Content, not
               * an attribute: a screen reader reads it, and it is the non-colour cue for "done". */
              marker: { accepts: "node", required: true },
              label: { accepts: "text", required: true },
              description: { accepts: "text" },
            },
          },
        },
      },
      /* `role="list"`: `list-style: none` (steps.css) drops the implicit list role in Safari/
       * VoiceOver, which would silence "step 2 of 5" along with it. */
      template: {
        element: "ol",
        part: "root",
        host: true,
        attrs: { role: "list" },
        children: [
          /*
           * One entry, two shapes, and `status` alone decides: the current stage is the one
           * `aria-current="step"` lands on. It used to be a separate `current` option, so a tree
           * could mark a stage "current" and never announce it (React derived it from status and
           * disagreed), or announce a stage already complete.
           */
          {
            repeat: "items",
            children: [
              {
                element: "li",
                part: "item",
                whenItemEquals: { option: "status", equals: "current" },
                itemOptions: ["status"],
                attrs: { "aria-current": "step" },
                children: stepItemBody,
              },
              {
                element: "li",
                part: "item",
                whenItemNotEquals: { option: "status", equals: "current" },
                itemOptions: ["status"],
                children: stepItemBody,
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/steps", name: "Steps" },
    },
  },
} as const satisfies ComponentContract;
