import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE QUESTIONNAIRE EXAMPLES, as usage trees. One survey, three questions: a required single choice
 * with a free-text alternative, an optional multiple choice with a disabled option, and an optional
 * free-text question. Every variant below only changes the questionnaire's own options.
 */

type QuestionnaireOptions = {
  progress?: "text" | "bar" | "steps" | "segments";
  progressOrientation?: "horizontal" | "vertical";
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
    skipLabel: t("demo.questionnaire.skip"),
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
    skipLabel: t("demo.questionnaire.skip"),
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
/*
 * A FOLLOW-UP, WHICH IS NOT A BRANCH. Both are spelled with `showWhen*`, and that is exactly why
 * they are worth separating: the mechanism is one thing, the shape it makes is another.
 *
 * `questionnaireBranchingTree` FORKS. Two questions are mutually exclusive, the answer to the gate
 * decides which of them the reader ever sees, and the step in the middle of the rail changes
 * IDENTITY between `Channels` and `Reason`.
 *
 * This one does not fork. The form is the same finite form for everybody and one answer ADDS a
 * question to it: living alone is a complete answer and the form is two questions long; living with
 * other people raises a question that only then has a subject, and the form is three. Nothing is
 * taken away and no path is closed, which is what makes it read as a sub-question of the one above
 * rather than a different route.
 *
 * The follow-up sits immediately after the question that raises it, because the count is what the
 * reader is watching: `bar` fills against a total that just grew, and a follow-up appearing two
 * questions later would read as an unrelated question that happens to be new.
 */
export const questionnaireFollowUpTree = (t: Translate): UsageTree => ({
  contract: "questionnaire",
  signature: "Questionnaire",
  options: {
    progress: "bar",
    previousLabel: t("demo.questionnaire.previous"),
    nextLabel: t("demo.questionnaire.next"),
    skipLabel: t("demo.questionnaire.skip"),
    submitLabel: t("demo.questionnaire.submit"),
    positionLabel: t("demo.questionnaire.position"),
    progressLabel: t("demo.questionnaire.progress"),
    errorLabel: t("demo.questionnaire.error"),
  },
  attrs: { "aria-label": t("demo.questionnaire.followUp.label") },
  children: [
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: { name: "household", required: true },
      slots: {
        title: t("demo.questionnaire.followUp.aloneTitle"),
        choices: [
          choice("shared", t("demo.questionnaire.followUp.shared")),
          choice("alone", t("demo.questionnaire.followUp.alone")),
        ],
      },
    },
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: {
        name: "household-size",
        required: true,
        showWhenItem: "household",
        showWhenAny: "shared",
      },
      slots: {
        title: t("demo.questionnaire.followUp.sizeTitle"),
        description: t("demo.questionnaire.followUp.sizeBody"),
        choices: [
          choice("2", "2"),
          choice("3", "3"),
          choice("4", "4"),
          choice("5+", t("demo.questionnaire.followUp.sizeMany")),
        ],
      },
    },
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: { name: "tenure", required: true },
      slots: {
        title: t("demo.questionnaire.followUp.tenureTitle"),
        choices: [
          choice("under-1", t("demo.questionnaire.followUp.tenureShort")),
          choice("1-5", t("demo.questionnaire.followUp.tenureMid")),
          choice("over-5", t("demo.questionnaire.followUp.tenureLong")),
        ],
      },
    },
  ],
});

/*
 * THE SLOTTED CONTROL, with the two cases it exists for: a list too long to be tiles, and files.
 * Neither is a question type this contract knows; both are controls the kit already ships, and the
 * questionnaire learns the answer from their native form state.
 */
export const questionnaireControlTree = (t: Translate): UsageTree => ({
  contract: "questionnaire",
  signature: "Questionnaire",
  options: {
    progress: "text",
    previousLabel: t("demo.questionnaire.previous"),
    nextLabel: t("demo.questionnaire.next"),
    skipLabel: t("demo.questionnaire.skip"),
    submitLabel: t("demo.questionnaire.submit"),
    positionLabel: t("demo.questionnaire.position"),
    progressLabel: t("demo.questionnaire.progress"),
    errorLabel: t("demo.questionnaire.error"),
  },
  attrs: { "aria-label": t("demo.questionnaire.control.label") },
  children: [
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: { name: "country", required: true },
      slots: {
        title: t("demo.questionnaire.control.countryTitle"),
        control: {
          contract: "select",
          signature: "Select",
          options: { name: "country" },
          slots: {
            label: t("demo.questionnaire.control.countryLabel"),
            items: [
              { options: { value: "cl" }, slots: { label: "Chile" } },
              { options: { value: "ar" }, slots: { label: "Argentina" } },
              { options: { value: "uy" }, slots: { label: "Uruguay" } },
              { options: { value: "pe" }, slots: { label: "Perú" } },
            ],
          },
        },
      },
    },
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: { name: "cv" },
      slots: {
        title: t("demo.questionnaire.control.fileTitle"),
        control: {
          contract: "file-upload",
          signature: "FileUpload",
          options: { name: "cv", accept: ".pdf,.doc,.docx" },
          slots: {
            label: t("demo.questionnaire.control.fileLabel"),
            dropzoneLabel: t("demo.questionnaire.control.fileDropzone"),
            triggerLabel: t("demo.questionnaire.control.fileTrigger"),
          },
        },
      },
    },
  ],
});

/* The same journey as `questionnaireStepsTree`, drawn as bars: one per question, read at a glance. */
export const questionnaireSegmentsTree = (t: Translate): UsageTree =>
  questionnaire(t, { progress: "segments" });

/* The rail beside the question instead of above it, which is what a longer journey wants. */
export const questionnaireRailTree = (t: Translate): UsageTree =>
  questionnaire(t, { progress: "steps", progressOrientation: "vertical" });

export const questionnaireBranchingTree = (t: Translate): UsageTree => ({
  contract: "questionnaire",
  signature: "Questionnaire",
  options: {
    progress: "steps",
    previousLabel: t("demo.questionnaire.previous"),
    nextLabel: t("demo.questionnaire.next"),
    skipLabel: t("demo.questionnaire.skip"),
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
    /*
     * THE SPINE THE BRANCH HANGS OFF. Both branches above are gated, so with the gate unanswered the
     * form used to have exactly ONE enabled question: it opened saying "Question 1 of 1", drew a
     * single lonely circle where the step rail should be, and offered Submit on the first screen. A
     * branching example that looks like a one-question form on arrival teaches nothing about
     * branching.
     *
     * A closing question every path reaches fixes all three at once and is what a real gated flow
     * looks like anyway. The form opens at 2 of 2, and answering the gate INSERTS the branch in the
     * middle: the rail grows to three and its middle step is `Channels` or `Reason` depending on the
     * answer, which is the thing worth seeing.
     */
    {
      contract: "questionnaire",
      signature: "QuestionnaireItem",
      options: {
        name: "email",
        required: true,
        text: true,
        textLabel: t("demo.questionnaire.branch.closingLabel"),
        textPlaceholder: t("demo.questionnaire.branch.closingPlaceholder"),
        stepLabel: t("demo.questionnaire.branch.closingStep"),
      },
      slots: { title: t("demo.questionnaire.branch.closingTitle") },
    },
  ],
});
