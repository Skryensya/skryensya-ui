import type { ComponentContract } from "./contract.js";

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
  /** Mirrors the authored `aria-current` cue when a usage tree supplies explicit statuses. */
  current?: boolean;
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
 * Progress across ordered stages, where the STATUS is what matters — which is the whole difference
 * from a Process list, whose content is primary and which has no notion of complete or current.
 *
 * The marker shows a tick when complete and a number otherwise, so the state is never colour alone.
 */
export const stepsContract = {
  id: "steps",
  css: "@skryensya/core/components/steps.css",
  parts: stepsParts,

  options: {},

  signatures: {
    Steps: {
      intent: ["progress-through-stages", "checkout-progress", "wizard-position"],
      host: { element: "ol" },
      options: [],
      slots: {
        items: {
          accepts: "items",
          required: true,
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
              /** Announced as the current step. Only one stage is where you are. */
              current: { type: "boolean", default: false, attr: "aria-current", trueValue: "step" },

            },
            slots: {
              /** What the marker shows: an icon when complete, the position otherwise. Content, not
               * an attribute — a screen reader reads it, and it is the non-colour cue for "done". */
              marker: { accepts: "node", required: true },
              label: { accepts: "text", required: true },
              description: { accepts: "text" },
            },
          },
        },
      },
      template: {
        element: "ol",
        part: "root",
        host: true,
        children: [
          {
            element: "li",
            part: "item",
            repeat: "items",
            itemOptions: ["status", "current"],
            children: [
              { element: "span", part: "marker", itemSlot: "marker" },
              {
                element: "span",
                children: [
                  { element: "span", part: "label", itemSlot: "label" },
                  // `whenItemSlotGiven`, not `whenItemGiven`: the first asks whether the entry
                  // filled a SLOT, the second whether it set an OPTION. `description` is a slot, so
                  // the option lookup was permanently undefined and this span never emitted — the
                  // tree validated, React rendered the descriptions from `steps={[…]}`, and the
                  // markup silently dropped them. Two bindings, one tree, different answers.
                  { element: "span", part: "description", whenItemSlotGiven: "description", itemSlot: "description" },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/steps", name: "Steps" },
    },
  },
} as const satisfies ComponentContract;
