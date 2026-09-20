/*
 * QUESTIONNAIRE, a form asked one question at a time.
 *
 * WHAT THIS FILE OWNS IS THE STATE, and nothing reads it back out of the page. Which question is
 * active, what has been answered, what was skipped and which questions have already been attempted
 * all live in one plain value, and every change to it is an EVENT run through `transitionQuestionnaire`,
 * a pure function. A binding never asks the DOM "is anything checked in here?": the controls this
 * composes (TileRadioGroup, TileCheckbox, Input) are CONTROLLED by this state, and report changes back
 * as events. So the answer to "what does the questionnaire hold" is always `store.getState()`, in a
 * test, in React and in Vanilla alike, and the same event sequence always produces the same state.
 *
 * WHAT A TRANSITION CANNOT DO IS TOUCH THE PAGE. Moving focus and submitting the form are things only a
 * binding can do, so a transition returns them as EFFECTS, plain data (`focus-item`, `focus-invalid`,
 * `request-submit`…), and the binding carries them out. That keeps the rule "the state machine is pure"
 * without pretending focus is state: focus is the one fact that genuinely lives in the DOM.
 *
 * WHY NOT A ZAG MACHINE, when every other stateful component here borrows one (ADR-0010). Zag has no
 * questionnaire, and writing one on `@zag-js/core` would add a dependency that this repo's release
 * quarantine refuses to resolve. The cut ADR-0010 actually asks for is "one machine, two adapters", and
 * this is that: one machine, here, adapted by `@skryensya/react` and `@skryensya/vanilla`.
 *
 * THE KEYBOARD follows shadcn's Questionnaire (decided with the product owner): Enter and Mod+Enter
 * advance, ArrowUp/ArrowDown move between a question's answers, ArrowLeft/ArrowRight between questions,
 * and optional letter or number shortcuts pick a choice. `resolveQuestionnaireKey` decides WHAT a key
 * means from plain data; the binding decides what the target element is.
 */

import type { ComponentContract, OptionValue } from "./contract.js";

/* ── definitions ──────────────────────────────────────────────────────────── */

export type QuestionnaireShortcutMode = "none" | "letters" | "numbers";
export type QuestionnaireProgressMode = "text" | "bar" | "steps" | "segments";
export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";

export type QuestionnaireChoiceDefinition = {
  readonly value: string;
  readonly disabled?: boolean;
};

/** Show this question only when another item's answer matches (branching). */
export type QuestionnaireShowWhen = {
  readonly item: string;
  /** Visible when the referenced answer includes any of these values (choices or trimmed text). */
  readonly any?: readonly string[];
  /** Visible when every value is selected on a multiple-choice parent. */
  readonly all?: readonly string[];
  /** Visible when none of these values are selected (parent must be answered). */
  readonly none?: readonly string[];
};

/**
 * One question, as data. `choices` and `text` may coexist ("pick one, or write your own"). `multiple`
 * turns the choices into checkboxes. `likert` renders choices on a Likert scale instead of tiles.
 */
export type QuestionnaireItemDefinition = {
  readonly name: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly multiple?: boolean;
  readonly likert?: boolean;
  readonly choices?: readonly QuestionnaireChoiceDefinition[];
  /** Whether the question takes free text, alone or beside its choices. */
  readonly text?: boolean;
  /** Whether the question answers through a control slotted by the author, which owns itself. */
  readonly control?: boolean;
  readonly showWhen?: QuestionnaireShowWhen;
};

function splitShowWhenValues(raw?: string | null): readonly string[] | undefined {
  const values = raw
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return values?.length ? values : undefined;
}

/** Parse branching attrs from markup (`data-show-when-*`, comma-separated lists). */
export function parseQuestionnaireShowWhen(
  item?: string | null,
  anyRaw?: string | null,
  allRaw?: string | null,
  noneRaw?: string | null,
): QuestionnaireShowWhen | undefined {
  const ref = item?.trim();
  if (!ref) return undefined;
  const any = splitShowWhenValues(anyRaw);
  const all = splitShowWhenValues(allRaw);
  const none = splitShowWhenValues(noneRaw);
  if (!any?.length && !all?.length && !none?.length) return undefined;
  return {
    item: ref,
    ...(any?.length ? { any } : {}),
    ...(all?.length ? { all } : {}),
    ...(none?.length ? { none } : {}),
  };
}

/** Selected choice values plus free text when present, for branching comparisons. */
export function questionnaireAnswerValues(answer: QuestionnaireAnswer): readonly string[] {
  const values = [...answer.choices];
  const text = answer.text.trim();
  if (text) values.push(text);
  return values;
}

/*
 * THE VALUES OF A SLOTTED CONTROL, READ FROM ITS NATIVE FORM STATE.
 *
 * A `control` slot takes a control this questionnaire has never heard of, so there is no option to
 * read and no event of its own to listen for. What there IS, in every one of them, is a native form
 * control: measured across the kit, `Select` ends in a `<select>`, `FileUpload` and `NumberField` and
 * `Combobox` and `DatePicker` each end in an `<input>`, and the selection family is native to begin
 * with. That is the one interface all of them share, and it is the platform's, not an invention here.
 *
 * SO THE QUESTIONNAIRE OBSERVES RATHER THAN OWNS. For its own controls the state is authoritative and
 * nothing is read back from the DOM, which is the claim the rest of this file exists to keep. A
 * slotted control is not its own: it owns itself, reports through the `input` / `change` every form
 * control fires, and what is read here is recorded INTO the state exactly like a tile's own event is.
 * The direction is unchanged; only the shape of the report is native instead of a `sk:` CustomEvent.
 *
 * A file input answers with the names of its files. The files themselves travel with the form, which
 * is where they were always going; what the questionnaire needs is whether the question is answered
 * and something for `showWhen` to match on, and a name is both.
 */
export function questionnaireControlValues(root: ParentNode): string[] {
  const values: string[] = [];
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("input, select, textarea"))) {
    if ("disabled" in el && (el as HTMLInputElement).disabled) continue;
    if (el instanceof HTMLSelectElement) {
      for (const option of Array.from(el.selectedOptions)) if (option.value) values.push(option.value);
      continue;
    }
    if (el instanceof HTMLTextAreaElement) {
      const text = el.value.trim();
      if (text) values.push(text);
      continue;
    }
    if (!(el instanceof HTMLInputElement)) continue;
    if (el.type === "radio" || el.type === "checkbox") {
      if (el.checked && el.value) values.push(el.value);
      continue;
    }
    if (el.type === "file") {
      for (const file of Array.from(el.files ?? [])) values.push(file.name);
      continue;
    }
    const text = el.value.trim();
    if (text) values.push(text);
  }
  return values;
}

/** Whether `showWhen` is satisfied by the current answers (pure; no item lookup). */
export function questionnaireShowWhenMatches(
  state: Pick<QuestionnaireState, "answers" | "skipped">,
  showWhen: QuestionnaireShowWhen,
): boolean {
  if (state.skipped.includes(showWhen.item)) return false;
  const answer = questionnaireAnswer(state as QuestionnaireState, showWhen.item);
  if (!hasQuestionnaireAnswer(answer)) return false;
  const selected = new Set(questionnaireAnswerValues(answer));
  if (showWhen.all?.length) return showWhen.all.every((value) => selected.has(value));
  if (showWhen.none?.length) return showWhen.none.every((value) => !selected.has(value));
  if (showWhen.any?.length) return showWhen.any.some((value) => selected.has(value));
  return true;
}

export type QuestionnaireAnswer = {
  readonly choices: readonly string[];
  readonly text: string;
};

export type QuestionnaireState = {
  readonly items: readonly QuestionnaireItemDefinition[];
  /** The active question's name, or `null` while there is no enabled question at all. */
  readonly active: string | null;
  readonly answers: Readonly<Record<string, QuestionnaireAnswer>>;
  readonly skipped: readonly string[];
  /** Questions a reader tried to leave or submit. Only these show their error. */
  readonly attempted: readonly string[];
};

export type QuestionnaireEvent =
  | { readonly type: "items"; readonly items: readonly QuestionnaireItemDefinition[] }
  | { readonly type: "select"; readonly name: string; readonly value: string; readonly selected: boolean }
  /** Replaces a single-choice question's selection outright (`null` clears it). */
  | { readonly type: "choose"; readonly name: string; readonly value: string | null }
  | { readonly type: "text"; readonly name: string; readonly text: string }
  /*
   * A slotted control reported its native form state. The values are whatever
   * `questionnaireControlValues` read off it, so a multi-select or a multi-file input answers with
   * several, and the question is answered when there is at least one.
   */
  | { readonly type: "control"; readonly name: string; readonly values: readonly string[] }
  | { readonly type: "next" }
  | { readonly type: "previous" }
  | { readonly type: "skip" }
  /** Next, or submit when the active question is the last one. What Enter and Mod+Enter do. */
  | { readonly type: "advance" }
  | { readonly type: "submit" }
  | { readonly type: "goTo"; readonly name: string }
  | { readonly type: "reset" };

export type QuestionnaireEffect =
  | { readonly type: "focus-item"; readonly name: string }
  | { readonly type: "focus-invalid"; readonly name: string }
  | { readonly type: "item-change"; readonly name: string }
  /** The binding should submit its form (`requestSubmit`), which comes back here as `submit`. */
  | { readonly type: "request-submit" }
  /** Every question is valid: let the submission through, with these answers. */
  | { readonly type: "submitted"; readonly values: Readonly<Record<string, string | readonly string[]>> };

export type QuestionnaireTransition = {
  readonly state: QuestionnaireState;
  readonly effects: readonly QuestionnaireEffect[];
};

export type QuestionnaireInit = {
  readonly items: readonly QuestionnaireItemDefinition[];
  /** The question to start on. Falls back to the first enabled one. */
  readonly defaultItem?: string;
  readonly defaultAnswers?: Readonly<Record<string, Partial<QuestionnaireAnswer>>>;
};

const EMPTY_ANSWER: QuestionnaireAnswer = { choices: [], text: "" };

/* ── reading the state ────────────────────────────────────────────────────── */

export function enabledQuestionnaireItems(state: Pick<QuestionnaireState, "items">): readonly QuestionnaireItemDefinition[] {
  return state.items.filter((item) => !item.disabled);
}

export function isQuestionnaireItemVisible(
  state: Pick<QuestionnaireState, "answers" | "skipped">,
  item: QuestionnaireItemDefinition,
): boolean {
  if (item.disabled) return false;
  const showWhen = item.showWhen;
  if (!showWhen) return true;
  return questionnaireShowWhenMatches(state, showWhen);
}

/** Enabled questions that are visible in the current branch (navigation, progress, submit). */
export function flowQuestionnaireItems(state: QuestionnaireState): readonly QuestionnaireItemDefinition[] {
  return state.items.filter((item) => isQuestionnaireItemVisible(state, item));
}

function findItem(state: Pick<QuestionnaireState, "items">, name: string): QuestionnaireItemDefinition | undefined {
  return state.items.find((item) => item.name === name);
}

export function questionnaireAnswer(state: QuestionnaireState, name: string): QuestionnaireAnswer {
  return state.answers[name] ?? EMPTY_ANSWER;
}

export function hasQuestionnaireAnswer(answer: QuestionnaireAnswer): boolean {
  return answer.choices.length > 0 || answer.text.trim().length > 0;
}

export function questionnaireItemStatus(state: QuestionnaireState, name: string): QuestionnaireItemStatus {
  if (state.skipped.includes(name)) return "skipped";
  return hasQuestionnaireAnswer(questionnaireAnswer(state, name)) ? "answered" : "unanswered";
}

/**
 * Whether a question may be left. A disabled question is not asked; a skipped one is settled (only an
 * optional question can be skipped); otherwise it needs an answer when required.
 */
export function isQuestionnaireItemValid(state: QuestionnaireState, name: string): boolean {
  const item = findItem(state, name);
  if (!item || item.disabled || !isQuestionnaireItemVisible(state, item)) return true;
  const status = questionnaireItemStatus(state, name);
  if (status === "skipped") return !item.required;
  return status === "answered" || !item.required;
}

/** Invalid AND already attempted: the only case a binding paints an error for. */
export function isQuestionnaireItemInvalid(state: QuestionnaireState, name: string): boolean {
  return state.attempted.includes(name) && !isQuestionnaireItemValid(state, name);
}

export type QuestionnaireNavigation = {
  /** 1-based position of the active question among enabled ones; 0 when there is none. */
  readonly current: number;
  readonly total: number;
  readonly first: boolean;
  readonly last: boolean;
  readonly canPrevious: boolean;
  readonly canNext: boolean;
  readonly canSkip: boolean;
  readonly canSubmit: boolean;
};

export function questionnaireNavigation(state: QuestionnaireState): QuestionnaireNavigation {
  const enabled = flowQuestionnaireItems(state);
  const index = enabled.findIndex((item) => item.name === state.active);
  const total = enabled.length;
  const first = total > 0 && index === 0;
  const last = total > 0 && index === total - 1;
  const active = index >= 0 ? enabled[index] : undefined;
  return {
    current: index + 1,
    total,
    first,
    last,
    canPrevious: total > 1 && index > 0,
    canNext: total > 1 && index >= 0 && !last,
    canSkip: !!active && !active.required,
    canSubmit: last,
  };
}

export type QuestionnaireStepStatus = "complete" | "current" | "upcoming";

export type QuestionnaireProgress = {
  readonly current: number;
  readonly total: number;
  /** Enabled questions that are answered or skipped: what the bar fills with. */
  readonly settled: number;
  readonly steps: readonly { readonly name: string; readonly status: QuestionnaireStepStatus }[];
};

export function questionnaireProgress(state: QuestionnaireState): QuestionnaireProgress {
  const enabled = flowQuestionnaireItems(state);
  const { current, total } = questionnaireNavigation(state);
  let settled = 0;
  const steps = enabled.map((item) => {
    const status = questionnaireItemStatus(state, item.name);
    if (status !== "unanswered") settled += 1;
    const step: QuestionnaireStepStatus =
      item.name === state.active ? "current" : status === "unanswered" ? "upcoming" : "complete";
    return { name: item.name, status: step };
  });
  return { current, total, settled, steps };
}

/**
 * The three nearby stages a compact questionnaire rail shows.
 *
 * The full position remains in the textual progress label; this window keeps a long path legible
 * without shrinking every marker and label into an unreadable column. At an edge, the window uses
 * the available steps; in the middle, it keeps the current step centred.
 */
export function questionnaireStepsWindow(state: QuestionnaireState, size = 3) {
  const steps = questionnaireProgress(state).steps;
  const visible = Math.max(1, Math.floor(size));
  if (steps.length <= visible) {
    return { steps: steps.map((step, index) => ({ ...step, index })), hasBefore: false, hasAfter: false };
  }

  const current = Math.max(steps.findIndex((step) => step.status === "current"), 0);
  const start = Math.min(Math.max(current - Math.floor(visible / 2), 0), steps.length - visible);
  const end = start + visible;
  return {
    steps: steps.slice(start, end).map((step, index) => ({ ...step, index: start + index })),
    hasBefore: start > 0,
    hasAfter: end < steps.length,
  };
}

/**
 * What the form submits: one entry per answered, enabled, not-skipped question. A single-choice
 * question submits its choice (or its text when it has no choice); a multiple one submits every choice
 * plus its text when there is any.
 */
export function questionnaireValues(state: QuestionnaireState): Readonly<Record<string, string | readonly string[]>> {
  const values: Record<string, string | readonly string[]> = {};
  for (const item of flowQuestionnaireItems(state)) {
    if (questionnaireItemStatus(state, item.name) !== "answered") continue;
    const answer = questionnaireAnswer(state, item.name);
    const text = answer.text.trim();
    if (item.multiple) {
      values[item.name] = text ? [...answer.choices, text] : [...answer.choices];
    } else {
      values[item.name] = answer.choices[0] ?? text;
    }
  }
  return values;
}

/** Fills `{current}` and `{total}` in a label such as "Question {current} of {total}". */
export function formatQuestionnaireLabel(template: string, values: Readonly<Record<string, number | string>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/* ── shortcuts ────────────────────────────────────────────────────────────── */

export function questionnaireShortcutKeys(mode: QuestionnaireShortcutMode): readonly string[] {
  if (mode === "letters") return Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
  if (mode === "numbers") return Array.from({ length: 9 }, (_, index) => String(index + 1));
  return [];
}

/** Choice value → its shortcut. Disabled choices get none and do not use one up. */
export function questionnaireShortcuts(
  item: QuestionnaireItemDefinition | undefined,
  mode: QuestionnaireShortcutMode,
): ReadonlyMap<string, string> {
  const keys = questionnaireShortcutKeys(mode);
  const map = new Map<string, string>();
  let next = 0;
  for (const choice of item?.choices ?? []) {
    if (choice.disabled) continue;
    const key = keys[next];
    if (!key) break;
    map.set(choice.value, key);
    next += 1;
  }
  return map;
}

/** The choice a pressed key picks in the active question, or `null`. Letters match either case. */
export function questionnaireChoiceForKey(
  state: QuestionnaireState,
  key: string,
  mode: QuestionnaireShortcutMode,
): string | null {
  if (mode === "none" || !state.active) return null;
  const wanted = mode === "letters" ? key.toUpperCase() : key;
  if (wanted.length !== 1) return null;
  for (const [value, shortcut] of questionnaireShortcuts(findItem(state, state.active), mode)) {
    if (shortcut === wanted) return value;
  }
  return null;
}

/* ── keyboard ─────────────────────────────────────────────────────────────── */

export type QuestionnaireKeyInput = {
  readonly key: string;
  readonly metaKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly altKey?: boolean;
  readonly shiftKey?: boolean;
  readonly repeat?: boolean;
  /** IME composition in progress (`isComposing`, or the legacy keyCode 229). */
  readonly composing?: boolean;
};

/** What the key's target is, as far as the keyboard model cares. The binding classifies the element. */
export type QuestionnaireKeyTarget =
  /** A radio or checkbox answer. */
  | { readonly kind: "choice"; readonly radio: boolean; readonly checked: boolean }
  /** A free-text answer. `filled` when it holds non-blank text. */
  | { readonly kind: "text"; readonly filled: boolean }
  /** Any other text-entry control inside the form that is not an answer. */
  | { readonly kind: "field" }
  /** Anything else: the question itself, a button, the form. */
  | { readonly kind: "other" };

export type QuestionnaireKeyAction =
  /** Handled by the questionnaire, but nothing to run (e.g. a repeat, or Enter on an empty answer). */
  | { readonly type: "prevent" }
  | { readonly type: "dispatch"; readonly event: QuestionnaireEvent }
  | { readonly type: "move-answer"; readonly direction: "next" | "previous" }
  | { readonly type: "pick"; readonly value: string };

/**
 * What a keydown means, or `null` to leave it to the browser.
 *
 *   Mod+Enter            advance (validate; next or submit), from anywhere in the form
 *   Enter on an answer   advance when that answer is chosen/filled; never an implicit submit
 *   ArrowUp / ArrowDown  move between the active question's answers (the binding decides whether
 *                        there is somewhere to go, and leaves radio-to-radio to the browser)
 *   ArrowLeft            previous question, unless the target edits text or is a radio
 *   ArrowRight           next question once the active one is answered or skipped, same exclusions
 *   A…Z / 1…9            pick a choice, when shortcuts are on and the target does not edit text
 */
export function resolveQuestionnaireKey(
  input: QuestionnaireKeyInput,
  target: QuestionnaireKeyTarget,
  state: QuestionnaireState,
  shortcuts: QuestionnaireShortcutMode,
): QuestionnaireKeyAction | null {
  if (input.composing || !state.active) return null;
  const mod = !!(input.metaKey || input.ctrlKey);

  if (input.key === "Enter" && mod && !input.altKey && !input.shiftKey) {
    return input.repeat ? { type: "prevent" } : { type: "dispatch", event: { type: "advance" } };
  }
  if (mod || input.altKey) return null;

  const editsText = target.kind === "text" || target.kind === "field";

  if (input.key === "ArrowUp" || input.key === "ArrowDown") {
    if (target.kind === "field") return null;
    // A filled text answer keeps its arrows for the caret.
    if (target.kind === "text" && target.filled) return null;
    return { type: "move-answer", direction: input.key === "ArrowDown" ? "next" : "previous" };
  }

  if (input.key === "ArrowLeft" || input.key === "ArrowRight") {
    if (editsText || (target.kind === "choice" && target.radio)) return null;
    if (input.repeat) return { type: "prevent" };
    if (input.key === "ArrowLeft") return { type: "dispatch", event: { type: "previous" } };
    return questionnaireItemStatus(state, state.active) === "unanswered"
      ? { type: "prevent" }
      : { type: "dispatch", event: { type: "next" } };
  }

  if (input.key === "Enter") {
    if (target.kind === "choice") {
      return target.checked && !input.repeat ? { type: "dispatch", event: { type: "advance" } } : { type: "prevent" };
    }
    if (target.kind === "text") {
      return target.filled && !input.repeat ? { type: "dispatch", event: { type: "advance" } } : { type: "prevent" };
    }
    return null;
  }

  if (shortcuts === "none" || editsText || input.shiftKey) return null;
  const value = questionnaireChoiceForKey(state, input.key, shortcuts);
  if (value === null) return null;
  return input.repeat ? { type: "prevent" } : { type: "pick", value };
}

/**
 * Where ArrowUp/ArrowDown lands among `count` answers, from `index` (-1 when focus is not on an
 * answer). Wraps. `null` when there is nowhere to go.
 */
export function questionnaireAnswerStep(index: number, count: number, direction: "next" | "previous"): number | null {
  if (count === 0) return null;
  if (index < 0) return direction === "next" ? 0 : count - 1;
  const target = (index + (direction === "next" ? 1 : -1) + count) % count;
  return target === index ? null : target;
}

/* ── the machine ──────────────────────────────────────────────────────────── */

function firstFlowName(state: QuestionnaireState, preferred?: string | null): string | null {
  const flow = flowQuestionnaireItems(state);
  const preferredItem = preferred ? flow.find((item) => item.name === preferred) : undefined;
  if (preferredItem) return preferredItem.name;
  return flow[0]?.name ?? null;
}

function nextVisibleActive(state: QuestionnaireState, previous: string | null): string | null {
  const flow = flowQuestionnaireItems(state);
  if (!flow.length) return null;
  if (previous && flow.some((item) => item.name === previous)) return previous;
  const order = state.items.map((item) => item.name);
  const prevIndex = previous ? order.indexOf(previous) : -1;
  for (let index = prevIndex + 1; index < order.length; index += 1) {
    const name = order[index];
    if (flow.some((item) => item.name === name)) return name ?? null;
  }
  for (let index = 0; index <= prevIndex; index += 1) {
    const name = order[index];
    if (flow.some((item) => item.name === name)) return name ?? null;
  }
  return flow[0]?.name ?? null;
}

function pruneQuestionnaireState(state: QuestionnaireState): QuestionnaireState {
  const visible = new Set(flowQuestionnaireItems(state).map((item) => item.name));
  let answersChanged = false;
  const answers: Record<string, QuestionnaireAnswer> = {};
  for (const [name, answer] of Object.entries(state.answers)) {
    if (visible.has(name)) answers[name] = answer;
    else answersChanged = true;
  }
  const skipped = state.skipped.filter((name) => visible.has(name));
  const attempted = state.attempted.filter((name) => visible.has(name));
  const skippedChanged = skipped.length !== state.skipped.length;
  const attemptedChanged = attempted.length !== state.attempted.length;
  const interim: QuestionnaireState = { ...state, answers, skipped, attempted };
  const active =
    state.active && visible.has(state.active) ? state.active : nextVisibleActive(interim, state.active);
  const activeChanged = active !== state.active;
  if (!answersChanged && !skippedChanged && !attemptedChanged && !activeChanged) return state;
  return { ...interim, active };
}

function withBranching(state: QuestionnaireState): QuestionnaireState {
  return pruneQuestionnaireState(state);
}

function shouldAutoFollowUp(item: QuestionnaireItemDefinition | undefined, answer: QuestionnaireAnswer): boolean {
  if (!item || item.multiple) return false;
  if (answer.choices.length === 1) return true;
  return !!(item.text && !item.choices?.length && answer.text.trim().length > 0);
}

/** First newly visible follow-up gated by `gateName`, in survey order. */
export function questionnaireNewlyUnlockedFollowUp(
  before: QuestionnaireState,
  after: QuestionnaireState,
  gateName: string,
): string | null {
  const beforeVisible = new Set(flowQuestionnaireItems(before).map((item) => item.name));
  for (const item of after.items) {
    if (item.showWhen?.item !== gateName) continue;
    if (beforeVisible.has(item.name)) continue;
    if (!isQuestionnaireItemVisible(after, item)) continue;
    if (questionnaireItemStatus(after, item.name) !== "unanswered") continue;
    return item.name;
  }
  return null;
}

function normalizeAnswer(item: QuestionnaireItemDefinition, answer: Partial<QuestionnaireAnswer> | undefined): QuestionnaireAnswer {
  const allowed = new Set((item.choices ?? []).map((choice) => choice.value));
  const choices = (answer?.choices ?? []).filter((value) => allowed.has(value));
  return {
    choices: item.multiple ? [...new Set(choices)] : choices.slice(0, 1),
    text: item.text ? (answer?.text ?? "") : "",
  };
}

export function createQuestionnaireState(init: QuestionnaireInit): QuestionnaireState {
  const answers: Record<string, QuestionnaireAnswer> = {};
  for (const item of init.items) {
    const answer = normalizeAnswer(item, init.defaultAnswers?.[item.name]);
    if (hasQuestionnaireAnswer(answer)) answers[item.name] = answer;
  }
  const base: QuestionnaireState = {
    items: init.items,
    active: null,
    answers,
    skipped: [],
    attempted: [],
  };
  return { ...base, active: firstFlowName(base, init.defaultItem) };
}

const without = (list: readonly string[], name: string) => (list.includes(name) ? list.filter((entry) => entry !== name) : list);
const withName = (list: readonly string[], name: string) => (list.includes(name) ? list : [...list, name]);

function setAnswer(state: QuestionnaireState, name: string, answer: QuestionnaireAnswer): QuestionnaireState {
  const answers = { ...state.answers };
  if (hasQuestionnaireAnswer(answer)) answers[name] = answer;
  else delete answers[name];
  // Answering a skipped question takes the skip back: the reader changed their mind.
  const skipped = hasQuestionnaireAnswer(answer) ? without(state.skipped, name) : state.skipped;
  return { ...state, answers, skipped };
}

function moveTo(state: QuestionnaireState, name: string, focus: "focus-item" | "focus-invalid"): QuestionnaireTransition {
  if (state.active === name) return { state, effects: [{ type: focus, name }] };
  return { state: { ...state, active: name }, effects: [{ type: "item-change", name }, { type: focus, name }] };
}

const unchanged = (state: QuestionnaireState): QuestionnaireTransition => ({ state, effects: [] });

function afterAnswer(state: QuestionnaireState, name: string, answer: QuestionnaireAnswer): QuestionnaireTransition {
  const previousActive = state.active;
  const item = findItem(state, name);
  const answered = setAnswer(state, name, answer);
  const next = withBranching(answered);
  if (next === state) return unchanged(state);

  let followUp: string | null = null;
  if (shouldAutoFollowUp(item, answer)) {
    followUp = questionnaireNewlyUnlockedFollowUp(state, next, name);
  }
  if (!followUp && previousActive) {
    const previousItem = findItem(next, previousActive);
    if (previousItem && !isQuestionnaireItemVisible(next, previousItem)) {
      followUp = questionnaireNewlyUnlockedFollowUp(state, next, name);
    }
  }

  if (followUp) return moveTo(next, followUp, "focus-item");

  const effects: QuestionnaireEffect[] = [];
  if (next.active !== previousActive && next.active) effects.push({ type: "item-change", name: next.active });
  return { state: next, effects };
}

/** The one place state changes. Pure: same state and event, same result, no DOM. */
export function transitionQuestionnaire(state: QuestionnaireState, event: QuestionnaireEvent): QuestionnaireTransition {
  switch (event.type) {
    case "items": {
      const answers: Record<string, QuestionnaireAnswer> = {};
      for (const item of event.items) {
        const previous = state.answers[item.name];
        if (!previous) continue;
        const answer = normalizeAnswer(item, previous);
        if (hasQuestionnaireAnswer(answer)) answers[item.name] = answer;
      }
      const names = new Set(event.items.map((item) => item.name));
      const nextBase: QuestionnaireState = {
        items: event.items,
        active: state.active,
        answers,
        skipped: state.skipped.filter((name) => names.has(name)),
        attempted: state.attempted.filter((name) => names.has(name)),
      };
      const next = withBranching({ ...nextBase, active: firstFlowName(nextBase, state.active) });
      const active = next.active;
      return { state: next, effects: active !== state.active && active ? [{ type: "item-change", name: active }] : [] };
    }

    case "select":
    case "choose": {
      const item = findItem(state, event.name);
      if (!item || item.disabled) return unchanged(state);
      const choice = event.value === null ? undefined : item.choices?.find((entry) => entry.value === event.value);
      if (event.value !== null && (!choice || choice.disabled)) return unchanged(state);
      const current = questionnaireAnswer(state, item.name);
      let answer: QuestionnaireAnswer;
      if (event.type === "choose" || !item.multiple) {
        const selected = event.type === "choose" ? event.value !== null : event.selected;
        const value = event.value as string;
        // Single choice: a choice and the free text are alternatives, so picking one clears the other.
        answer = selected
          ? { choices: [value], text: "" }
          : { choices: current.choices.filter((entry) => entry !== value), text: current.text };
        if (event.type === "choose" && event.value === null) answer = { choices: [], text: current.text };
      } else {
        const choices = event.selected
          ? current.choices.includes(event.value)
            ? current.choices
            : (item.choices ?? []).map((entry) => entry.value).filter((value) => value === event.value || current.choices.includes(value))
          : current.choices.filter((entry) => entry !== event.value);
        answer = { choices, text: current.text };
      }
      return afterAnswer(state, item.name, answer);
    }

    case "text": {
      const item = findItem(state, event.name);
      if (!item || item.disabled || !item.text || item.likert) return unchanged(state);
      const current = questionnaireAnswer(state, item.name);
      const clearsChoice = !item.multiple && event.text.trim().length > 0;
      return afterAnswer(state, item.name, { choices: clearsChoice ? [] : current.choices, text: event.text });
    }

    case "control": {
      const item = findItem(state, event.name);
      if (!item || item.disabled || !item.control) return unchanged(state);
      /* The control owns itself, so its report REPLACES what was there rather than merging into it:
         a file removed or a selection cleared has to be able to empty the answer. */
      return afterAnswer(state, item.name, { choices: [...event.values], text: "" });
    }

    case "previous": {
      const enabled = flowQuestionnaireItems(state);
      const index = enabled.findIndex((item) => item.name === state.active);
      if (index <= 0) return unchanged(state);
      return moveTo(state, enabled[index - 1].name, "focus-item");
    }

    case "next":
    case "advance": {
      const active = state.active;
      if (!active) return unchanged(state);
      const enabled = flowQuestionnaireItems(state);
      const index = enabled.findIndex((item) => item.name === active);
      const last = index === enabled.length - 1;
      if (event.type === "next" && last) return unchanged(state);
      const attempted = { ...state, attempted: withName(state.attempted, active) };
      if (!isQuestionnaireItemValid(attempted, active)) {
        return { state: attempted, effects: [{ type: "focus-invalid", name: active }] };
      }
      if (last) return { state: attempted, effects: [{ type: "request-submit" }] };
      return moveTo(attempted, enabled[index + 1].name, "focus-item");
    }

    case "skip": {
      const active = state.active;
      const item = active ? findItem(state, active) : undefined;
      if (!active || !item || item.required) return unchanged(state);
      const skipped: QuestionnaireState = {
        ...state,
        skipped: withName(state.skipped, active),
        attempted: without(state.attempted, active),
      };
      const enabled = flowQuestionnaireItems(state);
      const index = enabled.findIndex((entry) => entry.name === active);
      // The last question stays put: skipping is not submitting, and the Submit button is right there.
      if (index === enabled.length - 1) return { state: skipped, effects: [{ type: "focus-item", name: active }] };
      return moveTo(skipped, enabled[index + 1].name, "focus-item");
    }

    case "submit": {
      const enabled = flowQuestionnaireItems(state);
      const attempted = { ...state, attempted: enabled.reduce((list, item) => withName(list, item.name), state.attempted) };
      const invalid = enabled.find((item) => !isQuestionnaireItemValid(attempted, item.name));
      if (invalid) return moveTo(attempted, invalid.name, "focus-invalid");
      return { state: attempted, effects: [{ type: "submitted", values: questionnaireValues(attempted) }] };
    }

    case "goTo": {
      const item = findItem(state, event.name);
      if (!item || !isQuestionnaireItemVisible(state, item)) return unchanged(state);
      return moveTo(state, item.name, "focus-item");
    }

    case "reset": {
      const active = firstFlowName(state);
      const next: QuestionnaireState = { items: state.items, active, answers: {}, skipped: [], attempted: [] };
      return { state: next, effects: active && active !== state.active ? [{ type: "item-change", name: active }] : [] };
    }
  }
}

/* ── the store both bindings adapt ────────────────────────────────────────── */

export type QuestionnaireStore = {
  getState: () => QuestionnaireState;
  /** Runs one event. Returns its effects so the caller can carry them out. */
  dispatch: (event: QuestionnaireEvent) => readonly QuestionnaireEffect[];
  subscribe: (listener: (state: QuestionnaireState) => void) => () => void;
};

/**
 * The machine with memory: a state, a dispatch and subscribers. Listeners hear only real changes
 * (a transition that returns the same state object notifies nobody), which is what lets React's
 * `useSyncExternalStore` and a Svelte `$state` mirror it without render loops.
 */
export function createQuestionnaireStore(init: QuestionnaireInit): QuestionnaireStore {
  let state = createQuestionnaireState(init);
  const listeners = new Set<(state: QuestionnaireState) => void>();
  return {
    getState: () => state,
    dispatch(event) {
      const result = transitionQuestionnaire(state, event);
      if (result.state !== state) {
        state = result.state;
        for (const listener of listeners) listener(state);
      }
      return result.effects;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/* ── the contract ─────────────────────────────────────────────────────────── */


export const questionnaireParts = {
  root: "sk-questionnaire",
  progress: "sk-questionnaire__progress",
  position: "sk-questionnaire__position",
  item: "sk-questionnaire__item",
  title: "sk-questionnaire__title",
  description: "sk-questionnaire__description",
  answers: "sk-questionnaire__answers",
  choices: "sk-questionnaire__choices",
  text: "sk-questionnaire__text",
  control: "sk-questionnaire__control",
  scale: "sk-questionnaire__scale",
  anchors: "sk-questionnaire__anchors",
  anchor: "sk-questionnaire__anchor",
  error: "sk-questionnaire__error",
  shortcut: "sk-questionnaire__shortcut",
  actions: "sk-questionnaire__actions",
  previous: "sk-questionnaire__previous",
  skip: "sk-questionnaire__skip",
  next: "sk-questionnaire__next",
  submit: "sk-questionnaire__submit",
} as const;

export type QuestionnairePart = keyof typeof questionnaireParts;

/** Mount points and the configuration a binding reads once, at mount. Never runtime state. */
export const questionnaireAttrs = {
  root: "data-sk-questionnaire",
  item: "data-sk-questionnaire-item",
  progress: "data-sk-questionnaire-progress",
  error: "data-sk-questionnaire-error",
  previous: "data-sk-questionnaire-previous",
  skip: "data-sk-questionnaire-skip",
  next: "data-sk-questionnaire-next",
  submit: "data-sk-questionnaire-submit",
} as const;

export const questionnaireEvents = {
  /** Detail: `{ item: string }`, the question that became active. */
  itemChange: "sk:questionnaireitemchange",
  /** Detail: `{ values: Record<string, string | string[]> }`, dispatched before a valid submit proceeds. */
  submit: "sk:questionnairesubmit",
} as const;

/**
 * The kit's English defaults. A locale passes its own through the options below; `{current}` and
 * `{total}` are filled by `formatQuestionnaireLabel`.
 */
export const questionnaireDefaultLabels = {
  previousLabel: "Previous",
  nextLabel: "Next",
  skipLabel: "Skip",
  submitLabel: "Submit",
  positionLabel: "Question {current} of {total}",
  progressLabel: "Questionnaire progress",
  errorLabel: "Choose an answer to continue.",
  skippableErrorLabel: "Choose an answer or skip this question.",
} as const;

/*
 * Every Button here is the kit's Button, spelled the way React's `Button` renders it, at `sm`: a
 * questionnaire is a column of large tiles, and `md` chrome under them read as a second, louder form.
 * The same restraint the tiles and the text field below take.
 */
const buttonAttrs = (variant: "solid" | "soft" | "ghost") =>
  ({ "data-size": "sm", "data-tone": "neutral", "data-variant": variant }) as const;

/*
 * THE CONTRACT, and what it deliberately does not redraw.
 *
 * A question's choices are TileRadioGroup (one answer) or TileCheckbox (several), its free text is
 * FormField + Input, its buttons are Button, its progress is Progress or Steps. This contract adds
 * the arrangement, the fieldset/legend a question needs, and the machine above. Its stylesheet is
 * layout and the shortcut hint, nothing a reused piece already paints.
 *
 * WITHOUT SCRIPT the emitted markup is a plain long form: every question visible, the step buttons
 * hidden, Submit in place. A binding turns it into one question at a time.
 */
export const questionnaireContract = {
  id: "questionnaire",
  category: "forms",
  css: "@skryensya/core/components/questionnaire.css",
  parts: questionnaireParts,
  hooks: [
    /* Own sheet. */
    "--sk-questionnaire-gap",
    "--sk-questionnaire-head-gap",
    "--sk-questionnaire-item-gap",
    "--sk-questionnaire-measure",
    "--sk-questionnaire-rail",
    "--sk-questionnaire-shortcut-fg",
    "--sk-questionnaire-shortcut-gap",
    "--sk-questionnaire-shortcut-gutter",
    /*
     * From hookSheets below. Multiple-choice tiles reuse checkbox controls (`also`); progress bar
     * and Steps are binding-filled (not in the emitted tree), so sheetsForTree cannot discover them
     * from `also` alone. Published hooks only (same shape as Breadcrumb + menu/anchored).
     */
    "--sk-checkbox-group-gap",
    "--sk-checkbox-group-indent",
    "--sk-progress-color",
    "--sk-progress-fill",
    "--sk-steps-connector-size",
    "--sk-steps-item-padding",
    "--sk-steps-marker-size",
    "--sk-steps-segment-size",
  ],
  /*
   * Checkbox classes are multi-owned (selection + tile), so `also` alone leaves them unplaced.
   * Progress/Steps markup is runtime-composed by both bindings when `progress` is bar/steps.
   */
  hookSheets: [
    "@skryensya/core/components/checkbox.css",
    "@skryensya/core/components/progress.css",
    "@skryensya/core/components/steps.css",
  ],
  /*
   * `position` is drawn by the binding, not by the template. The progress band is emitted as an
   * empty host and the enhancer fills it (`document.createElement("p")` + `questionnaireParts
   * .position`), because what goes in it is the reader's place in a run the machine owns, which
   * nothing authored can know. The contract still owns the class name and its CSS, so it says so
   * here rather than leaving "the binding fills the body" to be discovered by diffing an emit
   * against this file. Same shape as Calendar's grid cells and Carousel's controls.
   */
  systemOwned: ["position"],

  /*
   * ── THE A11Y THIS SIGNATURE OWES AT RUNTIME, AND WHY IT IS NOT IN `wiring` ────────────────
   *
   * Both bindings do all of this, identically, and it is deliberately NOT declared below:
   *
   *   fieldset  aria-invalid="true"           while the question is invalid
   *   fieldset  aria-describedby              description + position + error, the last only while invalid
   *   error     role="alert"                  while invalid, so the message is announced when it lands
   *
   * `wiring` is resolved at EMIT time: `present()` reads the authored tree, so a rule can only ask
   * "did the author supply this slot or option". FormField declares exactly these two attributes
   * (`aria-describedby` referencing `error`, `aria-invalid` with `whenGiven: "error"`) and is right
   * to, because there `error` IS an authored slot, filled by whoever composed the field.
   *
   * Here it is not. There is no error slot and there never should be: the message is the machine's,
   * written from `errorLabel` / `skippableErrorLabel` the moment a question is left unanswered, and
   * "is this question invalid" is state no tree can carry. A `whenGiven: "error"` would resolve
   * false at emit and describe nothing, and an unconditional reference would point every question at
   * a blank line it is not describing.
   *
   * SO IT IS GATED INSTEAD OF DECLARED, which is the stronger of the two anyway: a declaration says
   * what is owed, a gate fails when it is not paid. `ai-gates/src/questionnaire-invalid.spec.ts`
   * drives both bindings into the failing question and asserts all three, and compares the two
   * sides against each other. G2 would have caught a divergence for free, except it compares the
   * stage as mounted and nothing on it ever drives a questionnaire into failing, which is how three
   * relationships both bindings implement went unlooked-at.
   */
  a11y: [
    {
      when: { likert: true },
      requiresOneOf: ["likertMinLabel", "likertMaxLabel"],
      because:
        "A scale renders its points as bare numbers, so nothing on the page or in the accessibility " +
        "tree says what 1 and 5 mean. Naming the ends is what turns a row of radios into a question " +
        "with a direction; the anchors are read as part of the group, not as decoration.",
      signatures: ["QuestionnaireItem"],
    },
  ],

  events: questionnaireEvents,
  eventDetails: {
    itemChange: { detail: { item: "string" } },
    submit: { detail: { values: "Record<string, string | string[]>" } },
  },

  options: {
    progress: {
      type: "enum",
      /*
       * `segments` is the steps rail drawn as one bar per question instead of a numbered disc: the
       * same sequence and the same statuses, read at a glance rather than studied. It is Steps own
       * `appearance`, not a fourth thing this component draws.
       */
      values: ["text", "bar", "steps", "segments"],
      default: "text",
      attr: "data-progress",
      machineInput: true,
    },
    /*
     * WHERE THE RAIL GOES. Horizontal sits above the question and is the default; vertical puts it
     * beside, which is what a long journey needs: eight stages across a reading measure give each
     * one nothing, and the same eight down a column give each one a line.
     *
     * Only `steps` and `segments` have a rail to orient; the other two ignore it.
     */
    progressOrientation: {
      type: "enum",
      values: ["horizontal", "vertical"],
      default: "horizontal",
      attr: "data-progress-orientation",
      machineInput: true,
    },
    shortcuts: {
      type: "enum",
      values: ["none", "letters", "numbers"],
      default: "none",
      attr: "data-shortcuts",
      machineInput: true,
    },
    /**
     * Which question starts active. Absent: the first enabled one. Live `item` / goTo stay
     * binding-only (Accordion/Tabs pattern).
     */
    defaultItem: { type: "string", attr: "data-default-item", machineInput: true },
    previousLabel: { type: "string", default: questionnaireDefaultLabels.previousLabel },
    nextLabel: { type: "string", default: questionnaireDefaultLabels.nextLabel },
    skipLabel: { type: "string", default: questionnaireDefaultLabels.skipLabel },
    submitLabel: { type: "string", default: questionnaireDefaultLabels.submitLabel },
    positionLabel: {
      type: "string",
      default: questionnaireDefaultLabels.positionLabel,
      attr: "data-position-label",
      machineInput: true,
    },
    progressLabel: {
      type: "string",
      default: questionnaireDefaultLabels.progressLabel,
      attr: "data-progress-label",
      machineInput: true,
    },
    errorLabel: {
      type: "string",
      default: questionnaireDefaultLabels.errorLabel,
      attr: "data-error-label",
      machineInput: true,
    },
    skippableErrorLabel: {
      type: "string",
      default: questionnaireDefaultLabels.skippableErrorLabel,
      attr: "data-skippable-error-label",
      machineInput: true,
    },

    /** The question's identity: the key of its answer in the submitted values. */
    name: { type: "string", attr: "data-name", machineInput: true },
    required: { type: "boolean", default: false, attr: "data-required", trueValue: "", machineInput: true },
    multiple: { type: "boolean", default: false, attr: "data-multiple", trueValue: "", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
    /** Free text, alone or beside the choices ("or write your own"). Its label is required with it. */
    text: { type: "boolean", default: false, attr: "data-text", trueValue: "", machineInput: true },
    textLabel: { type: "string" },
    textPlaceholder: { type: "string", attr: "placeholder" },
    /*
     * THE KIND OF TYPED ANSWER, written straight onto the control as its `type`. Every value here is
     * the same element with a different keyboard, a different on-screen control and the browser's own
     * validation: `email` and `url` are checked before submit, `tel` brings the phone keypad, `number`
     * brings steppers and a numeric pad, `date` brings the platform's date picker, including on the
     * phone where that is a native wheel and not a popover this form would have to own.
     *
     * NOT a swap to NumberField or DatePicker, which the kit also has. Those exist for a form that
     * wants the styled, machine-driven version of the control; a questionnaire asks one short
     * question at a time and the native one is smaller, faster and already accessible. Reach for
     * those by composing them yourself when the question needs what they add.
     */
    textType: {
      type: "enum",
      values: ["text", "email", "tel", "url", "number", "date"],
      default: "text",
      attr: "type",
    },
    /*
     * ROWS, AND THE REASON THE ANSWER IS A TEXTAREA AT ALL. `whenGiven` tests whether an option was
     * supplied, never what it equals, so "is this multiline" cannot be a value of `textType`: it is
     * this option's presence. That turns out to be the better shape anyway, because a long answer
     * needs a HEIGHT and the author is the only one who knows how long an answer they are inviting.
     * Two lines asks for a sentence, eight asks for a story.
     */
    textLines: { type: "number", min: 2, max: 20, integer: true, attr: "rows" },
    /* The numeric bounds, straight through to the control. Meaningless on any other `textType`, and
     * the browser ignores them there. */
    textMin: { type: "number", attr: "min" },
    textMax: { type: "number", attr: "max" },
    textStep: { type: "number", attr: "step" },
    /** Short name for the question in Steps progress. Falls back to the title. */
    stepLabel: { type: "string", attr: "data-step-label", machineInput: true },
    /** Render choices as a Likert scale instead of tiles. */
    likert: { type: "boolean", default: false, attr: "data-likert", trueValue: "", machineInput: true },
    likertMinLabel: { type: "string", attr: "data-likert-min" },
    likertMaxLabel: { type: "string", attr: "data-likert-max" },
    /** Branching: show when `showWhenItem` includes any of these values (comma-separated in markup). */
    showWhenItem: { type: "string", attr: "data-show-when-item", machineInput: true },
    showWhenAny: { type: "string", attr: "data-show-when-any", machineInput: true },
    showWhenAll: { type: "string", attr: "data-show-when-all", machineInput: true },
    showWhenNone: { type: "string", attr: "data-show-when-none", machineInput: true },
  },

  signatures: {
    Questionnaire: {
      intent: ["questionnaire", "survey", "one-question-at-a-time", "onboarding-questions", "multi-step-form"],
      host: { element: "form" },
      options: [
        "progress",
        "progressOrientation",
        "shortcuts",
        "defaultItem",
        "previousLabel",
        "nextLabel",
        "skipLabel",
        "submitLabel",
        "positionLabel",
        "progressLabel",
        "errorLabel",
        "skippableErrorLabel",
      ],
      slots: {
        children: {
          accepts: "signature",
          required: true,
          ordered: true,
          of: ["QuestionnaireItem"],
          uniqueChildOption: "name",
        },
      },
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"] },
        { of: "progress", systemOwned: true, sheets: ["@skryensya/core/components/progress.css"] },
        { of: "steps", systemOwned: true, sheets: ["@skryensya/core/components/steps.css"] },
      ],
      forward: ["id", "name", "aria-*"],
      mount: questionnaireAttrs.root,
      template: {
        element: "form",
        part: "root",
        host: true,
        attrs: { novalidate: "" },
        children: [
          /* Filled by the binding from state: position text, and a Progress bar or Steps under it. */
          { element: "div", part: "progress", mount: questionnaireAttrs.progress, attrs: { hidden: "" } },
          { slot: "children" },
          {
            element: "div",
            part: "actions",
            children: [
              {
                element: "button",
                part: "previous",
                also: ["sk-button", "sk-interactive"],
                mount: questionnaireAttrs.previous,
                attrs: { type: "button", hidden: "", ...buttonAttrs("soft") },
                textFromOption: "previousLabel",
              },
              {
                element: "button",
                part: "skip",
                also: ["sk-button", "sk-interactive"],
                mount: questionnaireAttrs.skip,
                attrs: { type: "button", hidden: "", ...buttonAttrs("ghost") },
                textFromOption: "skipLabel",
              },
              {
                element: "button",
                part: "next",
                also: ["sk-button", "sk-interactive"],
                mount: questionnaireAttrs.next,
                attrs: { type: "button", hidden: "", ...buttonAttrs("solid") },
                textFromOption: "nextLabel",
              },
              {
                element: "button",
                part: "submit",
                also: ["sk-button", "sk-interactive"],
                mount: questionnaireAttrs.submit,
                attrs: { type: "submit", ...buttonAttrs("solid") },
                textFromOption: "submitLabel",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/questionnaire", name: "Questionnaire" },
    },

    QuestionnaireItem: {
      intent: [
        "question",
        "survey-question",
        "single-choice-question",
        "multiple-choice-question",
        "free-text-question",
        "likert-question",
        "branching-question",
      ],
      host: { element: "fieldset" },
      options: [
        "name",
        "required",
        "multiple",
        "disabled",
        "text",
        "textLabel",
        "textPlaceholder",
        "textType",
        "textLines",
        "textMin",
        "textMax",
        "textStep",
        "stepLabel",
        "likert",
        "likertMinLabel",
        "likertMaxLabel",
        "showWhenItem",
        "showWhenAny",
        "showWhenAll",
        "showWhenNone",
      ],
      requires: ["name"],
      /* A question has to ASK something: tiles, a typed field, or a control the author slotted. */
      atLeastOneOf: [["choices", "text", "control"]],
      /*
       * Free text without a label is an unnamed input; multiple without choices is an empty
       * checkbox list. Choices alone (single) or text alone remain valid; both may coexist.
       */
      implies: {
        text: ["textLabel"],
        /* Every one of these shapes the typed answer, and there is no typed answer without `text`. */
        textType: ["text"],
        textLines: ["text"],
        textMin: ["text"],
        textMax: ["text"],
        textStep: ["text"],
        multiple: ["choices"],
        likert: ["choices"],
        showWhenAny: ["showWhenItem"],
        showWhenAll: ["showWhenItem"],
        showWhenNone: ["showWhenItem"],
      },
      compose: [
        { of: "tile", sheets: ["@skryensya/core/components/tile.css", "@skryensya/core/components/checkbox.css"] },
        /* The Likert scale is a radio group in a Box: both are composed, both bring their sheet. */
        { of: "radio-group", sheets: ["@skryensya/core/components/radio-group.css"] },
        { of: "layout", sheets: ["@skryensya/core/patterns/layout.css"] },
        { of: "form-field", sheets: ["@skryensya/core/components/form-field.css", "@skryensya/core/components/input.css"] },
        { of: "kbd", sheets: ["@skryensya/core/components/kbd.css"] },
        { of: "icon", systemOwned: true },
      ],
      parents: ["Questionnaire"],
      slots: {
        /** The question. Rendered as the fieldset's `<legend>`, so it names every answer inside. */
        title: { accepts: "text", required: true },
        description: { accepts: "text" },
        /*
         * A CONTROL THIS CONTRACT DOES NOT KNOW. Every other answer shape here is one the
         * questionnaire owns outright: it writes the tiles, it writes the input, it decides what they
         * hold. This slot is the opposite, and it exists because the alternative was an option per
         * control - one for a file upload, one for a long list, one for a date with a calendar - each
         * one mirroring another component's anatomy into this file and drifting the day that
         * component moved.
         *
         * Slot a `FileUpload`, a `Select` for a list too long to be tiles, a `NumberField`, whatever
         * the question needs. The control owns its own state, its own keyboard and its own
         * accessibility; the questionnaire keeps what it is actually for - one question at a time,
         * progress, required, branching - and learns the answer from the control's native form state
         * (`questionnaireControlValues`), which is the one interface all of them share.
         *
         * The author owes it a name: `showWhen` matches on values, and a control with nothing to
         * report answers nothing.
         */
        control: { accepts: "node" },
        choices: {
          accepts: "items",
          item: {
            options: {
              value: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
            },
            slots: {
              label: { accepts: "text", required: true },
              description: { accepts: "text" },
            },
            key: "value",
          },
        },
      },
      wiring: [
        { on: "textLabel", attr: "for", references: ["text"] },
        { on: "item", attr: "aria-describedby", references: ["description"] },
      ],
      mount: questionnaireAttrs.item,
      template: {
        element: "fieldset",
        part: "item",
        host: true,
        name: "item",
        children: [
          { element: "legend", part: "title", slot: "title" },
          { element: "p", part: "description", name: "description", whenGiven: "description", slot: "description" },
          {
            element: "div",
            part: "answers",
            /* The question's name, read once by the Vanilla binding; the controls below carry it too. */
            options: ["name"],
            children: [
              /* ONE ANSWER: the kit's TileRadioGroup, markup for its own enhancer to mount. */
              /*
               * THE SCALE: NATIVE RADIOS IN A BOX, and nothing else. A Likert point is a radio with a
               * number under it, so it is spelled as one (`radio-group.css`'s own face) inside a Box
               * (`layout.css`), not as a stack of tiles: a tile is a surface you press, and five of
               * them across a page read as five cards rather than one scale. The Box is the control's
               * frame, the anchors below name its ends, and the browser drives the radios.
               */
              {
                element: "div",
                part: "choices",
                also: ["sk-box"],
                whenGiven: "likert",
                attrs: {
                  "data-likert": "",
                  "data-border": "subtle",
                  "data-padding": "sm",
                  "data-surface": "none",
                },
                children: [
                  {
                    element: "div",
                    part: "scale",
                    also: ["sk-radio-group"],
                    attrs: {
                      role: "radiogroup",
                      /*
                       * VERTICAL, and no `data-spread`. The scale used to be a row of equal columns
                       * with the ends named underneath; it is a list now, one point per line, read
                       * top to bottom. `spread` only means something across a row, so it goes with it.
                       */
                      "data-orientation": "vertical",
                      "aria-orientation": "vertical",
                    },
                    children: [
                      {
                        element: "label",
                        also: ["sk-radio"],
                        repeat: "choices",
                        children: [
                          {
                            element: "input",
                            also: ["sk-radio__input"],
                            attrs: { type: "radio" },
                            options: ["name"],
                            optionAttrs: { name: "name" },
                            itemOptions: ["value", "disabled"],
                            itemOptionAttrs: { value: "value" },
                          },
                          {
                            element: "span",
                            also: ["sk-radio__control"],
                            attrs: { "aria-hidden": "true" },
                            children: [{ element: "span", also: ["sk-radio__indicator"] }],
                          },
                          { element: "span", also: ["sk-radio__label"], itemSlot: "label" },
                        ],
                      },
                    ],
                  },
                  {
                    element: "div",
                    part: "anchors",
                    whenGiven: ["likertMinLabel", "likertMaxLabel"],
                    children: [
                      {
                        element: "span",
                        part: "anchor",
                        name: "likertMinLabel",
                        textFromOption: "likertMinLabel",
                        whenGiven: "likertMinLabel",
                      },
                      {
                        element: "span",
                        part: "anchor",
                        name: "likertMaxLabel",
                        textFromOption: "likertMaxLabel",
                        whenGiven: "likertMaxLabel",
                      },
                    ],
                  },
                ],
              },
              {
                element: "div",
                part: "choices",
                whenGiven: "choices",
                whenMissing: ["multiple", "likert"],
                mount: "data-sk-tile-radio-group",
                options: ["name"],
                attrs: { "data-scope": "tile" },
                children: [
                  {
                    element: "label",
                    also: ["sk-tile", "sk-tile--interactive", "sk-interactive"],
                    /*
                     * `md`, NOT `sm`. A choice is a row, but Tile also floors every interactive
                     * surface at `--size-control-lg` (48px) and pins its content to the top: at `sm`
                     * a one-line option did not fill that floor, so its label sat high in a box with
                     * 23px of dead space under it while a two-line option filled the same box. `md`
                     * is the inset that makes a single line fill its own minimum, and the column of
                     * options reads level whatever each label is worth.
                     */
                    attrs: { "data-scope": "tile", "data-part": "item", "data-padding": "md" },
                    repeat: "choices",
                    children: [
                      {
                        element: "input",
                        attrs: { type: "radio", "data-part": "input" },
                        itemOptions: ["value", "disabled"],
                        itemOptionAttrs: { value: "value" },
                      },
                      {
                        element: "span",
                        also: ["sk-tile__content"],
                        attrs: { "data-part": "content" },
                        children: [
                          { element: "span", also: ["sk-tile__title"], itemSlot: "label" },
                          { element: "span", also: ["sk-tile__description"], whenItemSlotGiven: "description", itemSlot: "description" },
                        ],
                      },
                      /* The shortcut is a tile sibling: it is positioned in the left gutter, never read as answer content. */
                      { element: "kbd", part: "shortcut", also: ["sk-kbd"], attrs: { "aria-hidden": "true", "data-tone": "neutral" } },
                      {
                        element: "span",
                        also: ["sk-tile__selection-indicator"],
                        attrs: { "aria-hidden": "true", "data-part": "indicator" },
                      },
                    ],
                  },
                ],
              },
              /* SEVERAL ANSWERS: one TileCheckbox per choice, all under the question's name. */
              {
                element: "div",
                part: "choices",
                whenGiven: "multiple",
                children: [
                  {
                    element: "label",
                    also: ["sk-tile", "sk-tile--interactive", "sk-interactive"],
                    mount: "data-sk-tile-checkbox",
                    options: ["name"],
                    /* Same inset as the single-answer tile above, and for the same reason. */
                    attrs: { "data-scope": "tile", "data-padding": "md" },
                    repeat: "choices",
                    itemOptions: ["value", "disabled"],
                    itemOptionAttrs: { disabled: "data-disabled" },
                    children: [
                      { element: "input", attrs: { type: "checkbox", "data-part": "input" } },
                      {
                        element: "span",
                        also: ["sk-tile__content"],
                        attrs: { "data-part": "content" },
                        children: [
                          { element: "span", also: ["sk-tile__title"], itemSlot: "label" },
                          { element: "span", also: ["sk-tile__description"], whenItemSlotGiven: "description", itemSlot: "description" },
                        ],
                      },
                      /* The shortcut is a tile sibling: it is positioned in the left gutter, never read as answer content. */
                      { element: "kbd", part: "shortcut", also: ["sk-kbd"], attrs: { "aria-hidden": "true", "data-tone": "neutral" } },
                      /* Both states, exactly as `TileCheckbox`'s own template writes them: React renders
                         the real component, so a single-state indicator here would be a divergence
                         between the two bindings rather than a smaller checkbox. */
                      {
                        element: "span",
                        also: ["sk-checkbox__control", "sk-interactive"],
                        attrs: { "aria-hidden": "true", "data-part": "indicator" },
                        children: [
                          {
                            element: "span",
                            also: ["sk-checkbox__indicator"],
                            attrs: { "data-state": "checked" },
                            children: [{ element: "span", attrs: { "data-sk-icon": "check", "data-sk-icon-size": "sm" } }],
                          },
                          {
                            element: "span",
                            also: ["sk-checkbox__indicator"],
                            attrs: { "data-state": "indeterminate" },
                            children: [{ element: "span", attrs: { "data-sk-icon": "remove", "data-sk-icon-size": "sm" } }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              /*
               * THE SLOTTED CONTROL, wrapped in a part of our own and nothing else. No `also`, no
               * mount attribute, no attributes forwarded onto whatever the author put here: this box
               * exists to be findable and to be listened on, and everything below it belongs to the
               * control. The enhancer reads its native form state through the bubbling `input` /
               * `change` every form control fires.
               */
              {
                element: "div",
                part: "control",
                whenGiven: "control",
                slot: "control",
              },
              /*
               * A TYPED ANSWER: FormField + one control. Which control is decided by presence, not by
               * a value, because that is the only question `whenGiven` can answer: `textLines` given
               * means a `<textarea>` that tall, absent means an `<input>` of whatever `textType` says.
               * The two are mutually exclusive by construction (each carries the other's condition
               * inverted), so exactly one is ever emitted and both write the same `answer.text`.
               */
              {
                element: "div",
                part: "text",
                also: ["sk-form-field"],
                whenGiven: "text",
                children: [
                  { element: "label", also: ["sk-form-field__label"], name: "textLabel", textFromOption: "textLabel" },
                  {
                    element: "input",
                    also: ["sk-input"],
                    name: "text",
                    whenMissing: "textLines",
                    options: ["name", "textPlaceholder", "textType", "textMin", "textMax", "textStep"],
                    optionAttrs: { name: "name" },
                    attrs: { "data-size": "sm" },
                  },
                  {
                    element: "textarea",
                    also: ["sk-input", "sk-input--textarea"],
                    name: "text",
                    whenGiven: "textLines",
                    options: ["name", "textPlaceholder", "textLines"],
                    optionAttrs: { name: "name" },
                    attrs: { "data-size": "sm" },
                  },
                ],
              },
            ],
          },
          { element: "p", part: "error", mount: questionnaireAttrs.error, attrs: { hidden: "" } },
        ],
      },
      react: { from: "@skryensya/react/questionnaire", name: "QuestionnaireItem" },
    },
  },
} as const satisfies ComponentContract;

/*
 * The typed answer's kind, DERIVED from the option rather than written out beside it: the contract
 * is the only place those values exist, and G1 fails a second copy of them anywhere else.
 */
export type QuestionnaireTextType = OptionValue<typeof questionnaireContract.options.textType>;

/** Where the progress rail sits, derived from the option for the same reason as above. */
export type QuestionnaireProgressOrientation = OptionValue<
  typeof questionnaireContract.options.progressOrientation
>;
