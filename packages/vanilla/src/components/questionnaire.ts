import {
  createQuestionnaireStore,
  formatQuestionnaireLabel,
  isQuestionnaireItemInvalid,
  isQuestionnaireItemVisible,
  parseQuestionnaireShowWhen,
  questionnaireAnswer,
  questionnaireAnswerStep,
  questionnaireAttrs,
  questionnaireControlValues,
  questionnaireDefaultLabels,
  questionnaireEvents,
  questionnaireNavigation,
  questionnaireParts,
  questionnaireProgress,
  questionnaireStepsWindow,
  questionnaireShortcuts,
  resolveQuestionnaireKey,
  type QuestionnaireEffect,
  type QuestionnaireEvent,
  type QuestionnaireItemDefinition,
  type QuestionnaireKeyTarget,
  type QuestionnaireShortcutMode,
  type QuestionnaireState,
} from "@skryensya/core/questionnaire";
import { progressParts } from "@skryensya/core/progress";
import { stepsParts } from "@skryensya/core/steps";
import { tileCommands, tileEvents } from "@skryensya/core/tile";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * QUESTIONNAIRE (Vanilla). One direction for data, the same as React:
 *
 *   control event ──▶ store.dispatch ──▶ state ──▶ render(state) ──▶ DOM + commands to the controls
 *
 * The authored markup is read ONCE, at mount, for configuration: which questions exist, their names,
 * whether they are required, their choices. That is how every Vanilla enhancer receives its props.
 * After that nothing is read back to decide what the questionnaire holds: a radio's `checked`, an
 * input's `value` or a fieldset's `hidden` are outputs of `render`, never inputs to the state. The
 * reused controls keep their own enhancers (TileRadioGroup, TileCheckbox); they report changes through
 * `tileEvents`, and receive the state's value through `tileCommands`.
 */

type ChoiceView = {
  value: string;
  disabled: boolean;
  /** The TileCheckbox root, which is what a command is addressed to. `null` for a radio choice. */
  element: HTMLElement | null;
  input: HTMLInputElement | null;
  /** The Kbd the shortcut key is written into. */
  shortcut: HTMLElement | null;
};

type ItemView = {
  definition: QuestionnaireItemDefinition;
  fieldset: HTMLFieldSetElement;
  title: string;
  stepLabel: string;
  radioGroup: HTMLElement | null;
  /** The Likert scale's own root, when the question is one. Native radios, no machine. */
  scale: HTMLElement | null;
  choices: ChoiceView[];
  textInput: HTMLInputElement | HTMLTextAreaElement | null;
  /** The box holding a control this enhancer does not know; listened on, never written to. */
  control: HTMLElement | null;
  description: HTMLElement | null;
  error: HTMLElement;
  /** What the authored markup starts with, read once so the state and the controls begin in step. */
  defaultAnswer: { choices: string[]; text: string };
};

const TEXT_TYPES = new Set(["text", "email", "search", "tel", "url", "password", "number", "date", "time", "datetime-local", "month", "week"]);

let idCount = 0;
const ensureId = (element: HTMLElement, prefix: string) => {
  if (!element.id) element.id = `${prefix}-${(idCount += 1)}`;
  return element.id;
};

function isTextEntry(element: Element): boolean {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true;
  if (element instanceof HTMLInputElement) return TEXT_TYPES.has(element.type);
  return element instanceof HTMLElement && element.isContentEditable;
}

function answerControls(fieldset: HTMLFieldSetElement): HTMLInputElement[] {
  return Array.from(fieldset.querySelectorAll<HTMLInputElement>("input")).filter(
    (input) => !input.disabled && (input.type === "radio" || input.type === "checkbox" || TEXT_TYPES.has(input.type)),
  );
}

/** Present means true, the way `TileCheckbox` itself reads it; an explicit `"false"` means false. */
function defaultChecked(element: HTMLElement | null): boolean {
  const raw = element?.getAttribute("data-default-checked");
  return raw !== null && raw !== undefined && raw !== "false";
}

/** Configuration, read once. */
function readItem(fieldset: HTMLFieldSetElement): ItemView | null {
  const answers = fieldset.querySelector<HTMLElement>(`.${questionnaireParts.answers}`);
  const name = answers?.dataset.name;
  if (!name) return null;
  const title = fieldset.querySelector(`.${questionnaireParts.title}`)?.textContent?.trim() ?? name;
  const multiple = fieldset.hasAttribute("data-multiple");
  const likert = fieldset.hasAttribute("data-likert");
  const radioGroup = fieldset.querySelector<HTMLElement>("[data-sk-tile-radio-group]");
  /* A Likert scale is NATIVE radios in a Box: the browser owns the selection, so there is no machine
     to command and no tile event to hear. Everything below asks `radioGroup` whether there is one. */
  const scale = fieldset.querySelector<HTMLElement>(`.${questionnaireParts.scale}`);

  const choices: ChoiceView[] = multiple
    ? Array.from(fieldset.querySelectorAll<HTMLElement>("[data-sk-tile-checkbox]")).map((element) => ({
        value: element.dataset.value ?? "",
        disabled: element.hasAttribute("data-disabled"),
        element,
        input: element.querySelector<HTMLInputElement>('input[type="checkbox"]'),
        shortcut: element.querySelector<HTMLElement>(`.${questionnaireParts.shortcut}`),
      }))
    : Array.from((radioGroup ?? scale)?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []).map((input) => ({
          value: input.value,
        disabled: input.hasAttribute("disabled"),
        element: null,
        input,
        shortcut: input.closest("label")?.querySelector<HTMLElement>(`.${questionnaireParts.shortcut}`) ?? null,
      }));

  let error = fieldset.querySelector<HTMLElement>(`[${questionnaireAttrs.error}]`);
  if (!error) {
    error = document.createElement("p");
    error.className = questionnaireParts.error;
    error.setAttribute(questionnaireAttrs.error, "");
    error.hidden = true;
    fieldset.append(error);
  }

  /*
   * THE AUTHORED DEFAULTS ARE THE STATE'S, not the tiles' alone. A hand-written `data-default-value`
   * or `data-default-checked` paints a chosen tile, and a store that did not know about it would call
   * the question unanswered: two answers to one question, which is the drift this enhancer exists to
   * avoid. Read here as configuration, at mount, and never again.
   */
  const defaultAnswer = {
    choices: multiple
      ? choices.filter((choice) => defaultChecked(choice.element)).map((choice) => choice.value)
      : [radioGroup?.dataset.defaultValue].filter((value): value is string => !!value),
    text:
      fieldset
        .querySelector<HTMLInputElement | HTMLTextAreaElement>(`.${questionnaireParts.text} :is(input, textarea)`)
        ?.getAttribute("value") ?? "",
  };

  return {
    definition: {
      name,
      required: fieldset.hasAttribute("data-required"),
      disabled: fieldset.hasAttribute("disabled"),
      multiple,
      likert,
      text: fieldset.hasAttribute("data-text"),
      control: Boolean(fieldset.querySelector(`.${questionnaireParts.control}`)),
      choices: choices.map(({ value, disabled }) => ({ value, disabled })),
      showWhen: parseQuestionnaireShowWhen(
        fieldset.dataset.showWhenItem,
        fieldset.getAttribute("data-show-when-any"),
        fieldset.getAttribute("data-show-when-all"),
        fieldset.getAttribute("data-show-when-none"),
      ),
    },
    fieldset,
    title,
    stepLabel: fieldset.dataset.stepLabel ?? title,
    radioGroup,
    scale,
    choices,
    textInput: fieldset.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `.${questionnaireParts.text} :is(input, textarea)`,
    ),
    control: fieldset.querySelector<HTMLElement>(`.${questionnaireParts.control}`),
    description: fieldset.querySelector<HTMLElement>(`.${questionnaireParts.description}`),
    error,
    defaultAnswer,
  };
}

const labelOf = (root: HTMLElement, attr: string, fallback: string) => root.getAttribute(attr) ?? fallback;

function connect(root: HTMLElement): () => void {
  if (!(root instanceof HTMLFormElement)) return () => {};
  const form = root;
  const owns = (element: Element) => element.closest(`[${questionnaireAttrs.root}]`) === form;

  const views = Array.from(form.querySelectorAll<HTMLFieldSetElement>(`[${questionnaireAttrs.item}]`))
    .filter(owns)
    .map(readItem)
    .filter((view): view is ItemView => view !== null);
  const byName = new Map(views.map((view) => [view.definition.name, view]));

  const shortcuts = (form.dataset.shortcuts ?? "none") as QuestionnaireShortcutMode;
  const progressMode = form.dataset.progress ?? "text";
  const railOrientation = form.dataset.progressOrientation === "vertical" ? "vertical" : "horizontal";
  const labels = {
    position: labelOf(form, "data-position-label", questionnaireDefaultLabels.positionLabel),
    progress: labelOf(form, "data-progress-label", questionnaireDefaultLabels.progressLabel),
    error: labelOf(form, "data-error-label", questionnaireDefaultLabels.errorLabel),
    skippableError: labelOf(form, "data-skippable-error-label", questionnaireDefaultLabels.skippableErrorLabel),
  };

  const store = createQuestionnaireStore({
    items: views.map((view) => view.definition),
    defaultItem: form.dataset.defaultItem,
    defaultAnswers: Object.fromEntries(views.map((view) => [view.definition.name, view.defaultAnswer])),
  });

  /* ── the progress region, built once from configuration ── */
  const progress = form.querySelector<HTMLElement>(`[${questionnaireAttrs.progress}]`);
  const position = document.createElement("p");
  position.className = questionnaireParts.position;
  ensureId(position, "sk-questionnaire-position");
  let bar: HTMLElement | null = null;
  let steps: HTMLOListElement | null = null;
  if (progress) {
    progress.replaceChildren(position);
    if (progressMode === "bar") {
      bar = document.createElement("div");
      bar.className = progressParts.root;
      bar.setAttribute("role", "progressbar");
      bar.setAttribute("aria-label", labels.progress);
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("data-tone", "accent");
      const fill = document.createElement("div");
      fill.className = progressParts.bar;
      bar.append(fill);
      progress.append(bar);
    } else if (progressMode === "steps" || progressMode === "segments") {
      /* Both modes ARE the rail; they differ only in how Steps draws a stage, which is its own
         `appearance`. The orientation is the author's and applies to either. */
      steps = document.createElement("ol");
      steps.className = stepsParts.root;
      steps.setAttribute("role", "list");
      steps.setAttribute("data-orientation", railOrientation);
      if (progressMode === "segments") steps.setAttribute("data-appearance", "segments");
      steps.setAttribute("aria-label", labels.progress);
      progress.append(steps);
    }
    progress.hidden = false;
  }

  const button = (attr: string) => form.querySelector<HTMLButtonElement>(`[${attr}]`);
  const buttons = {
    previous: button(questionnaireAttrs.previous),
    skip: button(questionnaireAttrs.skip),
    next: button(questionnaireAttrs.next),
    submit: button(questionnaireAttrs.submit),
  };

  /* ── state → DOM ── */
  function render(state: QuestionnaireState) {
    const navigation = questionnaireNavigation(state);
    const summary = questionnaireProgress(state);

    for (const view of views) {
      const { name } = view.definition;
      const visible = isQuestionnaireItemVisible(state, view.definition);
      view.fieldset.hidden = !visible;
      if (!visible) continue;
      const active = !view.definition.disabled && state.active === name;
      const invalid = isQuestionnaireItemInvalid(state, name);
      const answer = questionnaireAnswer(state, name);

      /*
       * No `hidden` here: the questions share one grid row so the box keeps its height, and a
       * `display: none` question would collapse it. `questionnaire.css` hides the inactive ones with
       * `visibility` (out of the tab order and out of the a11y tree); `inert` is the belt to that brace.
       * The attribute is removed rather than left alone, in case the markup arrived with it.
       */
      view.fieldset.hidden = false;
      view.fieldset.toggleAttribute("inert", !active);
      view.fieldset.toggleAttribute("data-active", active);
      view.fieldset.tabIndex = -1;
      if (invalid) view.fieldset.setAttribute("aria-invalid", "true");
      else view.fieldset.removeAttribute("aria-invalid");

      // The error's line is reserved (questionnaire.css); only its text comes and goes.
      view.error.hidden = false;
      view.error.textContent = invalid ? (view.definition.required ? labels.error : labels.skippableError) : "";
      if (invalid) view.error.setAttribute("role", "alert");
      else view.error.removeAttribute("role");

      const describedBy = [
        view.description ? ensureId(view.description, "sk-questionnaire-description") : null,
        active ? position.id : null,
        invalid ? ensureId(view.error, "sk-questionnaire-error") : null,
      ].filter(Boolean);
      if (describedBy.length) view.fieldset.setAttribute("aria-describedby", describedBy.join(" "));
      else view.fieldset.removeAttribute("aria-describedby");

      /*
       * The shortcut key, from core's own map: the same one the keyboard resolves against, so the key
       * drawn is the key that works, and `numbers` mode stops at the ninth choice instead of drawing a
       * tenth nothing answers to.
       */
      const shortcutByValue = questionnaireShortcuts(view.definition, shortcuts);
      for (const choice of view.choices) {
        const shortcut = shortcutByValue.get(choice.value) ?? "";
        if (choice.shortcut) choice.shortcut.textContent = shortcut;
        if (choice.input) {
          if (shortcut) choice.input.setAttribute("aria-keyshortcuts", shortcut);
          else choice.input.removeAttribute("aria-keyshortcuts");
        }
      }

      // The controls follow the state: a tile group takes a command, a native radio takes its own
      // `checked`, which is a property and not an attribute (a reset would otherwise bring the old one back).
      if (view.radioGroup) {
        view.radioGroup.dispatchEvent(
          new CustomEvent(tileCommands.setValue, { detail: { value: answer.choices[0] ?? null } }),
        );
      } else if (view.scale) {
        for (const choice of view.choices) {
          if (choice.input) choice.input.checked = answer.choices.includes(choice.value);
        }
      }
      for (const choice of view.choices) {
        choice.element?.dispatchEvent(
          new CustomEvent(tileCommands.setChecked, { detail: { checked: answer.choices.includes(choice.value) } }),
        );
      }
      if (view.textInput && view.textInput.value !== answer.text) view.textInput.value = answer.text;
    }

    if (buttons.previous) buttons.previous.hidden = !navigation.canPrevious;
    if (buttons.skip) buttons.skip.hidden = !navigation.canSkip;
    if (buttons.next) buttons.next.hidden = !navigation.canNext;
    if (buttons.submit) buttons.submit.hidden = !navigation.canSubmit;

    position.textContent = formatQuestionnaireLabel(labels.position, { current: summary.current, total: summary.total });
    if (bar) {
      const max = Math.max(summary.total, 1);
      bar.setAttribute("aria-valuemax", String(max));
      bar.setAttribute("aria-valuenow", String(summary.settled));
      bar.style.setProperty("--sk-progress-fill", `${(summary.settled / max) * 100}%`);
    }
    if (steps) {
      const window = questionnaireStepsWindow(state);
      steps.toggleAttribute("data-window-before", window.hasBefore);
      steps.toggleAttribute("data-window-after", window.hasAfter);
      steps.replaceChildren(
        ...window.steps.map((step) => {
          const item = document.createElement("li");
          item.className = stepsParts.item;
          item.dataset.status = step.status;
          if (step.status === "current") item.setAttribute("aria-current", "step");

          const marker = document.createElement("span");
          marker.className = stepsParts.marker;
          marker.textContent = step.status === "complete" ? "✓" : String(step.index + 1);

          const text = document.createElement("span");
          const label = document.createElement("span");
          label.className = stepsParts.label;
          label.textContent = views.find((view) => view.definition.name === step.name)?.stepLabel ?? step.name;
          text.append(label);
          item.append(marker, text);
          return item;
        }),
      );
    }
  }

  function run(effects: readonly QuestionnaireEffect[]) {
    for (const effect of effects) {
      if (effect.type === "item-change") {
        form.dispatchEvent(new CustomEvent(questionnaireEvents.itemChange, { bubbles: true, detail: { item: effect.name } }));
      } else if (effect.type === "focus-item") {
        byName.get(effect.name)?.fieldset.focus();
      } else if (effect.type === "focus-invalid") {
        const view = byName.get(effect.name);
        if (view) (answerControls(view.fieldset)[0] ?? view.fieldset).focus();
      } else if (effect.type === "request-submit") {
        form.requestSubmit();
      }
    }
  }

  // Rendering is synchronous, so effects run on the DOM this event produced.
  const send = (event: QuestionnaireEvent) => run(store.dispatch(event));
  const unsubscribe = store.subscribe(render);
  render(store.getState());

  /* ── DOM events → store ── */
  const viewOf = (element: Element) => {
    const fieldset = element.closest<HTMLFieldSetElement>(`[${questionnaireAttrs.item}]`);
    return views.find((view) => view.fieldset === fieldset);
  };

  const onValueChange = (event: Event) => {
    const target = event.target as Element;
    const view = viewOf(target);
    if (!view || target !== view.radioGroup) return;
    send({ type: "choose", name: view.definition.name, value: (event as CustomEvent<{ value: string | null }>).detail.value });
  };

  const onCheckedChange = (event: Event) => {
    const target = event.target as HTMLElement;
    const view = viewOf(target);
    const choice = view?.choices.find((entry) => entry.element === target);
    if (!view || !choice) return;
    const checked = (event as CustomEvent<{ checked: boolean | "indeterminate" }>).detail.checked === true;
    send({ type: "select", name: view.definition.name, value: choice.value, selected: checked });
  };

  /*
   * A SLOTTED CONTROL REPORTS THROUGH THE PLATFORM. There is no machine to ask and no `sk:` event to
   * name, so what is listened for is the `input` / `change` every native form control fires, and the
   * whole slot is re-read on each one rather than the single element that fired: a control can move
   * more than one of its own inputs in a single interaction (a file upload replacing its list, a
   * multi-select) and the answer is the slot's state, not that element's.
   */
  const reportControl = (target: EventTarget | null): boolean => {
    if (!(target instanceof Element)) return false;
    const view = viewOf(target);
    if (!view?.control || !view.control.contains(target)) return false;
    send({
      type: "control",
      name: view.definition.name,
      values: questionnaireControlValues(view.control),
    });
    return true;
  };

  const onChange = (event: Event) => {
    const target = event.target;
    if (reportControl(target)) return;
    if (!(target instanceof HTMLInputElement) || target.type !== "radio" || !target.checked) return;
    const view = viewOf(target);
    // Only the scale's own radios: a tile group reports through its machine's event instead.
    if (!view || !view.scale || !view.scale.contains(target)) return;
    send({ type: "choose", name: view.definition.name, value: target.value });
  };

  const onInput = (event: Event) => {
    const target = event.target;
    if (reportControl(target)) return;
    if (!(target instanceof HTMLInputElement)) return;
    const view = viewOf(target);
    if (!view) return;
    if (view.textInput !== target) return;
    send({ type: "text", name: view.definition.name, text: target.value });
  };

  const onClick = (event: MouseEvent) => {
    const target = (event.target as Element).closest("button");
    if (!target || !owns(target)) return;
    if (target === buttons.previous) send({ type: "previous" });
    else if (target === buttons.skip) send({ type: "skip" });
    else if (target === buttons.next) send({ type: "next" });
  };

  const onSubmit = (event: SubmitEvent) => {
    const effects = store.dispatch({ type: "submit" });
    const submitted = effects.find((effect) => effect.type === "submitted");
    if (!submitted) {
      event.preventDefault();
      run(effects);
      return;
    }
    form.dispatchEvent(new CustomEvent(questionnaireEvents.submit, { bubbles: true, detail: { values: submitted.values } }));
  };

  const onReset = () => send({ type: "reset" });

  const keyTarget = (element: Element, state: QuestionnaireState): QuestionnaireKeyTarget => {
    const view = state.active ? byName.get(state.active) : undefined;
    if (view && element instanceof HTMLInputElement && view.fieldset.contains(element)) {
      const answer = questionnaireAnswer(state, view.definition.name);
      if (element.type === "radio" || element.type === "checkbox") {
        return { kind: "choice", radio: element.type === "radio", checked: answer.choices.includes(element.value) };
      }
      if (element === view.textInput) return { kind: "text", filled: answer.text.trim().length > 0 };
    }
    return isTextEntry(element) ? { kind: "field" } : { kind: "other" };
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const state = store.getState();
    const target = keyTarget(event.target, state);
    const action = resolveQuestionnaireKey(
      {
        key: event.key,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        repeat: event.repeat,
        composing: event.isComposing || event.keyCode === 229,
      },
      target,
      state,
      shortcuts,
    );
    if (!action) return;
    const view = state.active ? byName.get(state.active) : undefined;

    if (action.type === "move-answer") {
      if (!view) return;
      const controls = answerControls(view.fieldset);
      const next = questionnaireAnswerStep(controls.indexOf(event.target as HTMLInputElement), controls.length, action.direction);
      if (next === null) return;
      const destination = controls[next]!;
      if (target.kind === "choice" && target.radio && destination.type === "radio") return;
      event.preventDefault();
      destination.focus();
      if (destination.type === "radio") send({ type: "choose", name: view.definition.name, value: destination.value });
      return;
    }

    event.preventDefault();
    if (action.type === "dispatch") send(action.event);
    else if (action.type === "pick" && view) {
      const { name, multiple } = view.definition;
      const selected = questionnaireAnswer(state, name).choices.includes(action.value);
      send(multiple ? { type: "select", name, value: action.value, selected: !selected } : { type: "choose", name, value: action.value });
      answerControls(view.fieldset)
        .find((input) => (input.type === "radio" || input.type === "checkbox") && input.value === action.value)
        ?.focus();
    }
  };

  form.addEventListener(tileEvents.valueChange, onValueChange);
  form.addEventListener(tileEvents.checkedChange, onCheckedChange);
  form.addEventListener("input", onInput);
  form.addEventListener("change", onChange);
  form.addEventListener("click", onClick);
  form.addEventListener("submit", onSubmit);
  form.addEventListener("reset", onReset);
  form.addEventListener("keydown", onKeyDown);

  return () => {
    unsubscribe();
    form.removeEventListener(tileEvents.valueChange, onValueChange);
    form.removeEventListener(tileEvents.checkedChange, onCheckedChange);
    form.removeEventListener("input", onInput);
    form.removeEventListener("change", onChange);
    form.removeEventListener("click", onClick);
    form.removeEventListener("submit", onSubmit);
    form.removeEventListener("reset", onReset);
    form.removeEventListener("keydown", onKeyDown);
  };
}

export const mountQuestionnaire = createConnectMount({
  key: "questionnaire",
  rootSelector: `[${questionnaireAttrs.root}]`,
  connect,
});
