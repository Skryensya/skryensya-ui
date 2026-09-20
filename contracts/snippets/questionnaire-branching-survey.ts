import type { Snippet } from "./snippet.js";

export const questionnaireBranchingSurveySnippet: Snippet = {
  id: "questionnaire-branching-survey",
  level: "component",
  intent:
    "A survey that asks one question at a time, in the three shapes a survey actually needs: pick one, rate on a scale, say it in your own words  -  with the last question only asked of the people it applies to.",
  notes: [
    "One family, every option that matters. `progress: \"steps\"` names the run up front, and each " +
      "item carries `stepLabel` so the rail reads as words rather than numbers. `shortcuts: " +
      "\"letters\"` hangs a key beside every choice, and the key drawn is the key that works: both " +
      "come from core's own map, so `numbers` mode stops at the ninth choice instead of inventing a " +
      "tenth.",
    "`likert` is not a fourth control, it is the same single-choice question laid on its side, which " +
      "is why the points here are plain `choices`. Its two anchors are required (`get_contract`'s " +
      "`a11y`): a scale renders its points as bare numbers, so without them nothing on the page or " +
      "in the accessibility tree says which end is which.",
    "The last question is the branch. `showWhenItem` + `showWhenNone` asks it only of the readers " +
      "who did NOT pick `daily`, which is the shape most surveys want and the one people hand-roll " +
      "wrong: a question that is skipped this way is settled, not unanswered, so it never blocks " +
      "submission and never counts against progress.",
    "`required` is per question, not per form. The first two are required and the free-text one is " +
      "not, so the Skip button appears on exactly the question that can be skipped, and the error " +
      "line says the softer of the two sentences (`skippableErrorLabel`) when it is left empty.",
    "Nothing here writes ARIA by hand. The fieldset takes `aria-describedby` for its description, " +
      "its place in the run and, once a question is attempted and left empty, its error; the error " +
      "takes `role=\"alert\"` so the message is announced when it lands. All of that is the " +
      "binding's, because \"is this question invalid\" is runtime state and no authored tree can " +
      "carry it.",
  ],
  tree: {
    contract: "questionnaire",
    signature: "Questionnaire",
    options: { progress: "steps", shortcuts: "letters" },
    attrs: { "aria-label": "Product survey" },
    slots: {
      children: [
        {
          contract: "questionnaire",
          signature: "QuestionnaireItem",
          options: { name: "frequency", required: true, stepLabel: "Frequency" },
          slots: {
            title: "How often do you use the kit?",
            description: "Pick the one closest to your usual week.",
            choices: [
              { options: { value: "daily" }, slots: { label: "Every day" } },
              {
                options: { value: "weekly" },
                slots: { label: "A few times a week", description: "Two or three days." },
              },
              { options: { value: "never" }, slots: { label: "Not yet" } },
            ],
          },
        },
        {
          contract: "questionnaire",
          signature: "QuestionnaireItem",
          options: {
            name: "clarity",
            required: true,
            stepLabel: "Clarity",
            likert: true,
            likertMinLabel: "Strongly disagree",
            likertMaxLabel: "Strongly agree",
          },
          slots: {
            title: "The documentation answers my question on the first read",
            choices: [
              { options: { value: "1" }, slots: { label: "1" } },
              { options: { value: "2" }, slots: { label: "2" } },
              { options: { value: "3" }, slots: { label: "3" } },
              { options: { value: "4" }, slots: { label: "4" } },
            ],
          },
        },
        {
          contract: "questionnaire",
          signature: "QuestionnaireItem",
          options: {
            name: "missing",
            stepLabel: "Gaps",
            text: true,
            textLabel: "What would have helped",
            textPlaceholder: "Anything at all",
            showWhenItem: "frequency",
            showWhenNone: "daily",
          },
          slots: { title: "What is the kit missing?" },
        },
      ],
    },
  },
};
