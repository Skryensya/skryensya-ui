import { describe, expect, it, vi } from "vitest";
import {
  createQuestionnaireState,
  createQuestionnaireStore,
  formatQuestionnaireLabel,
  isQuestionnaireItemInvalid,
  questionnaireAnswerStep,
  questionnaireChoiceForKey,
  questionnaireItemStatus,
  questionnaireNavigation,
  questionnaireProgress,
  questionnaireShortcuts,
  questionnaireValues,
  resolveQuestionnaireKey,
  transitionQuestionnaire,
  type QuestionnaireEvent,
  type QuestionnaireItemDefinition,
  type QuestionnaireState,
} from "./questionnaire.js";

const ITEMS: readonly QuestionnaireItemDefinition[] = [
  {
    name: "direction",
    required: true,
    text: true,
    choices: [{ value: "delegation" }, { value: "questions" }, { value: "both" }],
  },
  { name: "channels", multiple: true, choices: [{ value: "email" }, { value: "sms", disabled: true }, { value: "push" }] },
  { name: "hidden", disabled: true, choices: [{ value: "x" }] },
  { name: "notes", text: true },
];

const start = (overrides: Partial<Parameters<typeof createQuestionnaireState>[0]> = {}) =>
  createQuestionnaireState({ items: ITEMS, ...overrides });

/** Runs events in order and returns the final state plus every effect, flattened. */
function run(state: QuestionnaireState, events: readonly QuestionnaireEvent[]) {
  const effects = [];
  for (const event of events) {
    const result = transitionQuestionnaire(state, event);
    state = result.state;
    effects.push(...result.effects);
  }
  return { state, effects };
}

describe("createQuestionnaireState", () => {
  it("starts on the first enabled question with nothing answered", () => {
    const state = start();
    expect(state.active).toBe("direction");
    expect(state.answers).toEqual({});
  });

  it("honours defaultItem, but never a disabled one", () => {
    expect(start({ defaultItem: "notes" }).active).toBe("notes");
    expect(start({ defaultItem: "hidden" }).active).toBe("direction");
    expect(start({ defaultItem: "missing" }).active).toBe("direction");
  });

  it("keeps only default answers the question can hold", () => {
    const state = start({
      defaultAnswers: {
        direction: { choices: ["both", "questions", "nope"], text: "ignored?" },
        channels: { choices: ["push", "email", "push"] },
      },
    });
    expect(state.answers.direction).toEqual({ choices: ["both"], text: "ignored?" });
    expect(state.answers.channels).toEqual({ choices: ["push", "email"], text: "" });
  });
});

describe("answers", () => {
  it("single choice: selecting replaces the choice and clears the free text", () => {
    const { state } = run(start(), [
      { type: "text", name: "direction", text: "my own" },
      { type: "select", name: "direction", value: "questions", selected: true },
    ]);
    expect(state.answers.direction).toEqual({ choices: ["questions"], text: "" });
  });

  it("single choice: typing an answer clears the choice", () => {
    const { state } = run(start(), [
      { type: "choose", name: "direction", value: "both" },
      { type: "text", name: "direction", text: "something else" },
    ]);
    expect(state.answers.direction).toEqual({ choices: [], text: "something else" });
  });

  it("multiple choice keeps the definition's order and ignores disabled choices", () => {
    const { state } = run(start(), [
      { type: "select", name: "channels", value: "push", selected: true },
      { type: "select", name: "channels", value: "sms", selected: true },
      { type: "select", name: "channels", value: "email", selected: true },
    ]);
    expect(state.answers.channels?.choices).toEqual(["email", "push"]);
  });

  it("deselecting the last choice removes the answer entirely", () => {
    const { state } = run(start(), [
      { type: "select", name: "channels", value: "push", selected: true },
      { type: "select", name: "channels", value: "push", selected: false },
    ]);
    expect(state.answers.channels).toBeUndefined();
    expect(questionnaireItemStatus(state, "channels")).toBe("unanswered");
  });

  it("does not change state for unknown, disabled or text-less targets", () => {
    const state = start();
    expect(transitionQuestionnaire(state, { type: "select", name: "hidden", value: "x", selected: true }).state).toBe(state);
    expect(transitionQuestionnaire(state, { type: "text", name: "channels", text: "hi" }).state).toBe(state);
    expect(transitionQuestionnaire(state, { type: "choose", name: "direction", value: "nope" }).state).toBe(state);
  });

  it("whitespace alone is not an answer", () => {
    const { state } = run(start(), [{ type: "text", name: "notes", text: "   " }]);
    expect(questionnaireItemStatus(state, "notes")).toBe("unanswered");
  });
});

describe("navigation", () => {
  it("next validates a required question, marks it attempted and asks for focus on the error", () => {
    const { state, effects } = run(start(), [{ type: "next" }]);
    expect(state.active).toBe("direction");
    expect(isQuestionnaireItemInvalid(state, "direction")).toBe(true);
    expect(effects).toEqual([{ type: "focus-invalid", name: "direction" }]);
  });

  it("an error is only shown after an attempt, and clears once answered", () => {
    let state = start();
    expect(isQuestionnaireItemInvalid(state, "direction")).toBe(false);
    state = run(state, [{ type: "next" }]).state;
    expect(isQuestionnaireItemInvalid(state, "direction")).toBe(true);
    state = run(state, [{ type: "choose", name: "direction", value: "both" }]).state;
    expect(isQuestionnaireItemInvalid(state, "direction")).toBe(false);
  });

  it("moves past an answered question and skips disabled ones", () => {
    const { state, effects } = run(start(), [
      { type: "choose", name: "direction", value: "both" },
      { type: "next" },
      { type: "next" },
    ]);
    expect(state.active).toBe("notes");
    expect(effects).toEqual([
      { type: "item-change", name: "channels" },
      { type: "focus-item", name: "channels" },
      { type: "item-change", name: "notes" },
      { type: "focus-item", name: "notes" },
    ]);
  });

  it("previous goes back without validating, and does nothing on the first question", () => {
    const moved = run(start({ defaultItem: "channels" }), [{ type: "previous" }]);
    expect(moved.state.active).toBe("direction");
    const first = start();
    expect(transitionQuestionnaire(first, { type: "previous" }).state).toBe(first);
  });

  it("next does nothing on the last question; advance asks the binding to submit", () => {
    const last = run(start({ defaultItem: "notes" }), [{ type: "text", name: "notes", text: "done" }]).state;
    expect(transitionQuestionnaire(last, { type: "next" }).effects).toEqual([]);
    expect(transitionQuestionnaire(last, { type: "advance" }).effects).toEqual([{ type: "request-submit" }]);
  });

  it("goTo moves to any enabled question", () => {
    expect(run(start(), [{ type: "goTo", name: "notes" }]).state.active).toBe("notes");
    const state = start();
    expect(transitionQuestionnaire(state, { type: "goTo", name: "hidden" }).state).toBe(state);
  });

  it("reports position and what the buttons may do", () => {
    const state = start({ defaultItem: "channels" });
    expect(questionnaireNavigation(state)).toEqual({
      current: 2,
      total: 3,
      first: false,
      last: false,
      canPrevious: true,
      canNext: true,
      canSkip: true,
      canSubmit: false,
    });
    expect(questionnaireNavigation(start()).canSkip).toBe(false);
    expect(questionnaireNavigation(start({ defaultItem: "notes" })).canSubmit).toBe(true);
  });
});

describe("skip", () => {
  it("is refused on a required question", () => {
    const state = start();
    expect(transitionQuestionnaire(state, { type: "skip" }).state).toBe(state);
  });

  it("settles an optional question without erasing its answer, and moves on", () => {
    const { state } = run(start({ defaultItem: "channels" }), [
      { type: "select", name: "channels", value: "email", selected: true },
      { type: "skip" },
    ]);
    expect(state.active).toBe("notes");
    expect(questionnaireItemStatus(state, "channels")).toBe("skipped");
    expect(state.answers.channels?.choices).toEqual(["email"]);
  });

  it("on the last question it stays put instead of submitting", () => {
    const { state, effects } = run(start({ defaultItem: "notes" }), [{ type: "skip" }]);
    expect(state.active).toBe("notes");
    expect(effects).toEqual([{ type: "focus-item", name: "notes" }]);
  });

  it("answering a skipped question takes the skip back", () => {
    const { state } = run(start({ defaultItem: "notes" }), [
      { type: "skip" },
      { type: "text", name: "notes", text: "changed my mind" },
    ]);
    expect(questionnaireItemStatus(state, "notes")).toBe("answered");
  });
});

describe("submit", () => {
  it("jumps back to the first invalid question and focuses its answer", () => {
    const { state, effects } = run(start({ defaultItem: "notes" }), [{ type: "submit" }]);
    expect(state.active).toBe("direction");
    expect(effects).toEqual([
      { type: "item-change", name: "direction" },
      { type: "focus-invalid", name: "direction" },
    ]);
  });

  it("lets a valid questionnaire through with its values, leaving out skipped questions", () => {
    const { effects } = run(start(), [
      { type: "text", name: "direction", text: "my own" },
      { type: "select", name: "channels", value: "email", selected: true },
      { type: "goTo", name: "channels" },
      { type: "skip" },
      { type: "submit" },
    ]);
    expect(effects.at(-1)).toEqual({ type: "submitted", values: { direction: "my own" } });
  });
});

describe("values", () => {
  it("single submits its choice or its text; multiple submits choices and text together", () => {
    const items: QuestionnaireItemDefinition[] = [
      { name: "a", choices: [{ value: "x" }], text: true },
      { name: "b", multiple: true, text: true, choices: [{ value: "y" }] },
    ];
    const { state } = run(createQuestionnaireState({ items }), [
      { type: "choose", name: "a", value: "x" },
      { type: "select", name: "b", value: "y", selected: true },
      { type: "text", name: "b", text: " other " },
    ]);
    expect(questionnaireValues(state)).toEqual({ a: "x", b: ["y", "other"] });
  });
});

describe("items", () => {
  it("keeps answers for questions that survive and moves off a question that went away", () => {
    const answered = run(start({ defaultItem: "notes" }), [{ type: "choose", name: "direction", value: "both" }]).state;
    const { state, effects } = transitionQuestionnaire(answered, {
      type: "items",
      items: ITEMS.filter((item) => item.name !== "notes"),
    });
    expect(state.answers.direction?.choices).toEqual(["both"]);
    expect(state.active).toBe("direction");
    expect(effects).toEqual([{ type: "item-change", name: "direction" }]);
  });
});

describe("branching", () => {
  const branchItems: QuestionnaireItemDefinition[] = [
    { name: "path", choices: [{ value: "yes" }, { value: "no" }] },
    { name: "detail", choices: [{ value: "a" }], showWhen: { item: "path", any: ["yes"] } },
    { name: "reason", choices: [{ value: "later" }], showWhen: { item: "path", none: ["yes"] } },
  ];

  it("auto-advances into the yes branch", () => {
    let state = createQuestionnaireState({ items: branchItems });
    ({ state } = transitionQuestionnaire(state, { type: "choose", name: "path", value: "yes" }));
    expect(questionnaireNavigation(state).total).toBe(2);
    expect(state.active).toBe("detail");
  });

  it("auto-advances into the no branch", () => {
    let state = createQuestionnaireState({ items: branchItems });
    ({ state } = transitionQuestionnaire(state, { type: "choose", name: "path", value: "no" }));
    expect(questionnaireNavigation(state).total).toBe(2);
    expect(state.active).toBe("reason");
  });

  it("moves off a branch that closed when the gate answer changes", () => {
    let state = createQuestionnaireState({ items: branchItems });
    ({ state } = transitionQuestionnaire(state, { type: "choose", name: "path", value: "no" }));
    ({ state } = transitionQuestionnaire(state, { type: "choose", name: "path", value: "yes" }));
    expect(state.active).toBe("detail");
    expect(state.answers.reason).toBeUndefined();
  });

  it("requires all selected values for showWhen.all", () => {
    const items: QuestionnaireItemDefinition[] = [
      { name: "channels", multiple: true, choices: [{ value: "email" }, { value: "push" }] },
      { name: "digest", choices: [{ value: "daily" }], showWhen: { item: "channels", all: ["email", "push"] } },
    ];
    let state = createQuestionnaireState({ items });
    ({ state } = transitionQuestionnaire(state, { type: "select", name: "channels", value: "email", selected: true }));
    expect(questionnaireNavigation(state).total).toBe(1);
    ({ state } = transitionQuestionnaire(state, { type: "select", name: "channels", value: "push", selected: true }));
    expect(questionnaireNavigation(state).total).toBe(2);
  });

  it("drops answers on hidden branches when the gate answer changes", () => {
    let state = createQuestionnaireState({ items: branchItems });
    ({ state } = transitionQuestionnaire(state, { type: "choose", name: "path", value: "yes" }));
    ({ state } = transitionQuestionnaire(state, { type: "choose", name: "detail", value: "a" }));
    ({ state } = transitionQuestionnaire(state, { type: "choose", name: "path", value: "no" }));
    expect(state.answers.detail).toBeUndefined();
    expect(state.active).toBe("reason");
  });
});

describe("reset", () => {
  it("clears everything and returns to the first question", () => {
    const { state } = run(start(), [{ type: "choose", name: "direction", value: "both" }, { type: "next" }, { type: "reset" }]);
    expect(state).toEqual({ items: ITEMS, active: "direction", answers: {}, skipped: [], attempted: [] });
  });
});

describe("progress", () => {
  it("counts answered and skipped questions and marks the steps", () => {
    const { state } = run(start(), [
      { type: "choose", name: "direction", value: "both" },
      { type: "next" },
      { type: "skip" },
    ]);
    expect(questionnaireProgress(state)).toEqual({
      current: 3,
      total: 3,
      settled: 2,
      steps: [
        { name: "direction", status: "complete" },
        { name: "channels", status: "complete" },
        { name: "notes", status: "current" },
      ],
    });
  });

  it("formats the position label", () => {
    expect(formatQuestionnaireLabel("Question {current} of {total}", { current: 2, total: 5 })).toBe("Question 2 of 5");
    expect(formatQuestionnaireLabel("{missing}", {})).toBe("{missing}");
  });
});

describe("shortcuts", () => {
  it("assigns keys to enabled choices only, in order", () => {
    expect([...questionnaireShortcuts(ITEMS[1], "letters")]).toEqual([
      ["email", "A"],
      ["push", "B"],
    ]);
    expect([...questionnaireShortcuts(ITEMS[0], "numbers")].map(([, key]) => key)).toEqual(["1", "2", "3"]);
    expect(questionnaireShortcuts(ITEMS[0], "none").size).toBe(0);
  });

  it("matches letters in either case", () => {
    const state = start();
    expect(questionnaireChoiceForKey(state, "b", "letters")).toBe("questions");
    expect(questionnaireChoiceForKey(state, "3", "numbers")).toBe("both");
    expect(questionnaireChoiceForKey(state, "z", "letters")).toBeNull();
  });
});

describe("resolveQuestionnaireKey", () => {
  const other = { kind: "other" } as const;
  const radio = (checked: boolean) => ({ kind: "choice", radio: true, checked }) as const;
  const checkbox = (checked: boolean) => ({ kind: "choice", radio: false, checked }) as const;
  const answered = run(start(), [{ type: "choose", name: "direction", value: "both" }]).state;

  it("Mod+Enter advances from anywhere, but not on repeat", () => {
    expect(resolveQuestionnaireKey({ key: "Enter", metaKey: true }, { kind: "field" }, start(), "none")).toEqual({
      type: "dispatch",
      event: { type: "advance" },
    });
    expect(resolveQuestionnaireKey({ key: "Enter", ctrlKey: true, repeat: true }, other, start(), "none")).toEqual({
      type: "prevent",
    });
  });

  it("Enter on an answer advances only when it is chosen or filled", () => {
    expect(resolveQuestionnaireKey({ key: "Enter" }, radio(true), answered, "none")).toEqual({
      type: "dispatch",
      event: { type: "advance" },
    });
    expect(resolveQuestionnaireKey({ key: "Enter" }, radio(false), start(), "none")).toEqual({ type: "prevent" });
    expect(resolveQuestionnaireKey({ key: "Enter" }, { kind: "text", filled: false }, start(), "none")).toEqual({
      type: "prevent",
    });
    expect(resolveQuestionnaireKey({ key: "Enter" }, other, start(), "none")).toBeNull();
  });

  it("ArrowUp/Down move between answers, except inside a filled text answer or another field", () => {
    expect(resolveQuestionnaireKey({ key: "ArrowDown" }, radio(false), start(), "none")).toEqual({
      type: "move-answer",
      direction: "next",
    });
    expect(resolveQuestionnaireKey({ key: "ArrowUp" }, { kind: "text", filled: true }, start(), "none")).toBeNull();
    expect(resolveQuestionnaireKey({ key: "ArrowUp" }, { kind: "field" }, start(), "none")).toBeNull();
  });

  it("ArrowLeft/Right change question, but leave radios and text alone", () => {
    expect(resolveQuestionnaireKey({ key: "ArrowLeft" }, checkbox(false), start(), "none")).toEqual({
      type: "dispatch",
      event: { type: "previous" },
    });
    expect(resolveQuestionnaireKey({ key: "ArrowRight" }, radio(true), answered, "none")).toBeNull();
    expect(resolveQuestionnaireKey({ key: "ArrowRight" }, { kind: "text", filled: false }, start(), "none")).toBeNull();
  });

  it("ArrowRight waits for an answer", () => {
    expect(resolveQuestionnaireKey({ key: "ArrowRight" }, other, start(), "none")).toEqual({ type: "prevent" });
    expect(resolveQuestionnaireKey({ key: "ArrowRight" }, other, answered, "none")).toEqual({
      type: "dispatch",
      event: { type: "next" },
    });
  });

  it("shortcuts pick a choice, never while typing, never with modifiers, never during composition", () => {
    expect(resolveQuestionnaireKey({ key: "c" }, other, start(), "letters")).toEqual({ type: "pick", value: "both" });
    expect(resolveQuestionnaireKey({ key: "c" }, { kind: "text", filled: false }, start(), "letters")).toBeNull();
    expect(resolveQuestionnaireKey({ key: "c", altKey: true }, other, start(), "letters")).toBeNull();
    expect(resolveQuestionnaireKey({ key: "c", composing: true }, other, start(), "letters")).toBeNull();
    expect(resolveQuestionnaireKey({ key: "c" }, other, start(), "none")).toBeNull();
  });
});

describe("questionnaireAnswerStep", () => {
  it("wraps, enters from outside, and reports nowhere to go", () => {
    expect(questionnaireAnswerStep(2, 3, "next")).toBe(0);
    expect(questionnaireAnswerStep(0, 3, "previous")).toBe(2);
    expect(questionnaireAnswerStep(-1, 3, "previous")).toBe(2);
    expect(questionnaireAnswerStep(0, 1, "next")).toBeNull();
    expect(questionnaireAnswerStep(-1, 0, "next")).toBeNull();
  });
});

describe("createQuestionnaireStore", () => {
  it("notifies only on real changes and returns each event's effects", () => {
    const store = createQuestionnaireStore({ items: ITEMS });
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.dispatch({ type: "previous" })).toEqual([]);
    expect(listener).not.toHaveBeenCalled();
    store.dispatch({ type: "choose", name: "direction", value: "both" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.dispatch({ type: "next" })).toEqual([
      { type: "item-change", name: "channels" },
      { type: "focus-item", name: "channels" },
    ]);
    expect(store.getState().active).toBe("channels");
  });
});
