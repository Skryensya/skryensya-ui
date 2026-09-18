import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE QUESTIONNAIRE EXAMPLES, as usage trees. One survey, three questions: a required single choice
 * with a free-text alternative, an optional multiple choice with a disabled option, and an optional
 * free-text question. Every variant below only changes the questionnaire's own options.
 */

type QuestionnaireOptions = {
  progress?: "text" | "bar" | "steps";
  shortcuts?: "none" | "letters" | "numbers";
};

const choice = (value: string, label: string, description?: string, disabled?: boolean) => ({
  options: disabled ? { value, disabled: true } : { value },
  slots: description ? { label, description } : { label },
});

const questionnaire = (t: Translate, options: QuestionnaireOptions): UsageTree => ({
  contract: "questionnaire",
  signature: "Questionnaire",
  options: {
    ...options,
    previousLabel: t("demo.questionnaire.previous"),
    nextLabel: t("demo.questionnaire.next"),
    skipLabel: t("demo.questionnaire.skip"),
    submitLabel: t("demo.questionnaire.submit"),
    positionLabel: t("demo.questionnaire.position"),
    progressLabel: t("demo.questionnaire.progress"),
    errorLabel: t("demo.questionnaire.error"),
    skippableErrorLabel: t("demo.questionnaire.skippableError"),
  },
  attrs: { "aria-label": t("demo.questionnaire.label") },
  children: [
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: {
        name: "direction",
        required: true,
        text: true,
        textLabel: t("demo.questionnaire.direction.other"),
        textPlaceholder: t("demo.questionnaire.direction.otherPlaceholder"),
        stepLabel: t("demo.questionnaire.direction.step"),
      },
      slots: {
        title: t("demo.questionnaire.direction.title"),
        description: t("demo.questionnaire.direction.description"),
        choices: [
          choice("delegation", t("demo.questionnaire.direction.delegation"), t("demo.questionnaire.direction.delegationDescription")),
          choice("questions", t("demo.questionnaire.direction.questions"), t("demo.questionnaire.direction.questionsDescription")),
          choice("both", t("demo.questionnaire.direction.both")),
        ],
      },
    },
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: { name: "channels", multiple: true, stepLabel: t("demo.questionnaire.channels.step") },
      slots: {
        title: t("demo.questionnaire.channels.title"),
        description: t("demo.questionnaire.channels.description"),
        choices: [
          choice("email", t("demo.questionnaire.channels.email")),
          choice("sms", t("demo.questionnaire.channels.sms"), t("demo.questionnaire.channels.smsDescription"), true),
          choice("push", t("demo.questionnaire.channels.push")),
        ],
      },
    },
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: {
        name: "notes",
        text: true,
        textLabel: t("demo.questionnaire.notes.label"),
        textPlaceholder: t("demo.questionnaire.notes.placeholder"),
        stepLabel: t("demo.questionnaire.notes.step"),
      },
      slots: { title: t("demo.questionnaire.notes.title") },
    },
  ],
});

/** The default: position text, no shortcuts. */
export const questionnaireTree = (t: Translate): UsageTree => questionnaire(t, {});

/** Progress as a bar that fills with settled questions. */
export const questionnaireBarTree = (t: Translate): UsageTree => questionnaire(t, { progress: "bar" });

/** Progress as Steps, one per question, named by `stepLabel`. */
export const questionnaireStepsTree = (t: Translate): UsageTree => questionnaire(t, { progress: "steps" });

/** Letter shortcuts, each shown in a Kbd on its choice. */
export const questionnaireShortcutsTree = (t: Translate): UsageTree => questionnaire(t, { shortcuts: "letters" });

/** Single choice only: no "other" text field. */
export const questionnaireChoicesOnlyTree = (t: Translate): UsageTree => ({
  contract: "questionnaire",
  signature: "Questionnaire",
  options: {
    previousLabel: t("demo.questionnaire.previous"),
    nextLabel: t("demo.questionnaire.next"),
    submitLabel: t("demo.questionnaire.submit"),
    positionLabel: t("demo.questionnaire.position"),
    progressLabel: t("demo.questionnaire.progress"),
    errorLabel: t("demo.questionnaire.error"),
  },
  attrs: { "aria-label": t("demo.questionnaire.choicesOnly.label") },
  children: [
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: { name: "tooling", required: true, stepLabel: t("demo.questionnaire.choicesOnly.step") },
      slots: {
        title: t("demo.questionnaire.choicesOnly.title"),
        choices: [
          choice("design", t("demo.questionnaire.choicesOnly.design")),
          choice("code", t("demo.questionnaire.choicesOnly.code")),
          choice("both", t("demo.questionnaire.choicesOnly.both")),
        ],
      },
    },
  ],
});

/** Likert scale inside the questionnaire (`data-likert`). */
export const questionnaireLikertTree = (t: Translate): UsageTree => ({
  contract: "questionnaire",
  signature: "Questionnaire",
  options: {
    previousLabel: t("demo.questionnaire.previous"),
    nextLabel: t("demo.questionnaire.next"),
    submitLabel: t("demo.questionnaire.submit"),
    positionLabel: t("demo.questionnaire.position"),
    errorLabel: t("demo.questionnaire.error"),
  },
  attrs: { "aria-label": t("demo.questionnaire.likert.label") },
  children: [
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: {
        name: "clarity",
        required: true,
        likert: true,
        likertMinLabel: t("demo.likert.min"),
        likertMaxLabel: t("demo.likert.max"),
        stepLabel: t("demo.questionnaire.likert.step"),
      },
      slots: {
        title: t("demo.questionnaire.likert.title"),
        /*
         * FOUR POINTS, not five: an even scale has no middle to park on, so a reader who has an
         * opinion has to lean. Any count works (3, 5, 7); this is the default the page argues for.
         */
        choices: [
          choice("1", t("demo.likert.one")),
          choice("2", t("demo.likert.two")),
          choice("3", t("demo.likert.three")),
          choice("4", t("demo.likert.four")),
        ],
      },
    },
  ],
});

/** Branching: a follow-up appears only when “Yes” is chosen on the first question. */
export const questionnaireBranchingTree = (t: Translate): UsageTree => ({
  contract: "questionnaire",
  signature: "Questionnaire",
  options: {
    progress: "steps",
    previousLabel: t("demo.questionnaire.previous"),
    nextLabel: t("demo.questionnaire.next"),
    submitLabel: t("demo.questionnaire.submit"),
    positionLabel: t("demo.questionnaire.position"),
    progressLabel: t("demo.questionnaire.progress"),
    errorLabel: t("demo.questionnaire.error"),
  },
  attrs: { "aria-label": t("demo.questionnaire.branch.label") },
  children: [
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: { name: "beta", required: true, stepLabel: t("demo.questionnaire.branch.betaStep") },
      slots: {
        title: t("demo.questionnaire.branch.betaTitle"),
        choices: [choice("yes", t("demo.questionnaire.branch.yes")), choice("no", t("demo.questionnaire.branch.no"))],
      },
    },
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: {
        name: "channels",
        multiple: true,
        showWhenItem: "beta",
        showWhenAny: "yes",
        stepLabel: t("demo.questionnaire.branch.channelsStep"),
      },
      slots: {
        title: t("demo.questionnaire.branch.channelsTitle"),
        choices: [
          choice("email", t("demo.questionnaire.channels.email")),
          choice("push", t("demo.questionnaire.channels.push")),
        ],
      },
    },
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: {
        name: "why-not",
        showWhenItem: "beta",
        showWhenNone: "yes",
        stepLabel: t("demo.questionnaire.branch.whyNotStep"),
      },
      slots: {
        title: t("demo.questionnaire.branch.whyNotTitle"),
        choices: [
          choice("timing", t("demo.questionnaire.branch.whyNotTiming")),
          choice("need", t("demo.questionnaire.branch.whyNotNeed")),
        ],
      },
    },
  ],
});
