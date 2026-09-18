import { fireEvent, getByText } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountQuestionnaire } from "./questionnaire.js";
import { mountTileCheckbox } from "./tile-checkbox.js";
import { mountTileRadioGroup } from "./tile-radio-group.js";

/* The markup the contract emits (trimmed of whitespace), so the test drives what a page really ships. */
const choice = (value: string, label: string) =>
  `<label class="sk-tile sk-tile--interactive sk-interactive" data-scope="tile" data-part="item"><input value="${value}" type="radio" data-part="input"><span class="sk-tile__content" data-part="content"><span class="sk-tile__title">${label}</span><kbd class="sk-questionnaire__shortcut sk-kbd" aria-hidden="true" data-tone="neutral"></kbd></span><span class="sk-tile__selection-indicator" aria-hidden="true" data-part="indicator"></span></label>`;
const box = (value: string, label: string, disabled = false) =>
  `<label class="sk-tile sk-tile--interactive sk-interactive" data-sk-tile-checkbox data-name="channels" data-value="${value}"${disabled ? " data-disabled" : ""} data-scope="tile"><input type="checkbox" data-part="input"><span class="sk-tile__content" data-part="content"><span class="sk-tile__title">${label}</span><kbd class="sk-questionnaire__shortcut sk-kbd" aria-hidden="true" data-tone="neutral"></kbd></span><span class="sk-checkbox__control sk-interactive" aria-hidden="true" data-part="indicator"><span class="sk-checkbox__indicator" data-state="checked"></span><span class="sk-checkbox__indicator" data-state="indeterminate"></span></span></label>`;

const markup = (progress = "text", shortcuts = "none") => `
<form class="sk-questionnaire" data-sk-questionnaire data-progress="${progress}" data-shortcuts="${shortcuts}" aria-label="Survey" novalidate>
  <div class="sk-questionnaire__progress" data-sk-questionnaire-progress hidden></div>
  <fieldset class="sk-questionnaire__item" data-sk-questionnaire-item data-required data-text>
    <legend class="sk-questionnaire__title">What should we prototype next?</legend>
    <div class="sk-questionnaire__answers" data-name="direction">
      <div class="sk-questionnaire__choices" data-sk-tile-radio-group data-name="direction" data-scope="tile">${choice("delegation", "Delegation")}${choice("questions", "Question prompts")}</div>
      <div class="sk-questionnaire__text sk-form-field"><label class="sk-form-field__label" for="other">Another answer</label><input class="sk-input" name="direction" type="text" id="other"></div>
    </div>
    <p class="sk-questionnaire__error" data-sk-questionnaire-error hidden></p>
  </fieldset>
  <fieldset class="sk-questionnaire__item" data-sk-questionnaire-item data-multiple data-step-label="Channels">
    <legend class="sk-questionnaire__title">Where should we reach you?</legend>
    <div class="sk-questionnaire__answers" data-name="channels">
      <div class="sk-questionnaire__choices">${box("email", "Email")}${box("sms", "SMS", true)}${box("push", "Push")}</div>
    </div>
    <p class="sk-questionnaire__error" data-sk-questionnaire-error hidden></p>
  </fieldset>
  <fieldset class="sk-questionnaire__item" data-sk-questionnaire-item data-text>
    <legend class="sk-questionnaire__title">Anything else?</legend>
    <div class="sk-questionnaire__answers" data-name="notes">
      <div class="sk-questionnaire__text sk-form-field"><label class="sk-form-field__label" for="notes">Notes</label><input class="sk-input" name="notes" type="text" id="notes"></div>
    </div>
    <p class="sk-questionnaire__error" data-sk-questionnaire-error hidden></p>
  </fieldset>
  <div class="sk-questionnaire__actions">
    <button class="sk-questionnaire__previous sk-button sk-interactive" data-sk-questionnaire-previous type="button" hidden>Previous</button>
    <button class="sk-questionnaire__skip sk-button sk-interactive" data-sk-questionnaire-skip type="button" hidden>Skip</button>
    <button class="sk-questionnaire__next sk-button sk-interactive" data-sk-questionnaire-next type="button" hidden>Next</button>
    <button class="sk-questionnaire__submit sk-button sk-interactive" data-sk-questionnaire-submit type="submit">Submit</button>
  </div>
</form>`;

/* Every question keeps its box (one grid row, so the height never changes); `data-active` is which
   one is showing, and the hidden ones carry `inert`. */
const shown = (question: HTMLFieldSetElement) => question.hasAttribute("data-active");

function mount(progress?: string, shortcuts?: string) {
  document.body.innerHTML = markup(progress, shortcuts);
  mountTileRadioGroup(document);
  mountTileCheckbox(document);
  expect(mountQuestionnaire(document)).toBe(1);
  flushSync();
  const form = document.querySelector("form")!;
  const fieldset = (title: string) => getByText(form, title, { selector: "legend" }).closest("fieldset") as HTMLFieldSetElement;
  const button = (label: string) => getByText(form, label, { selector: "button" }) as HTMLButtonElement;
  return { form, fieldset, button };
}

describe("Questionnaire (Vanilla)", () => {
  it("turns the long form into one question at a time", () => {
    const { form, fieldset, button } = mount();
    expect(shown(fieldset("What should we prototype next?"))).toBe(true);
    expect(shown(fieldset("Where should we reach you?"))).toBe(false);
    expect(fieldset("Where should we reach you?").hasAttribute("inert")).toBe(true);
    expect(form.querySelector<HTMLElement>(".sk-questionnaire__progress")!.hidden).toBe(false);
    expect(form.querySelector(".sk-questionnaire__position")!.textContent).toBe("Question 1 of 3");
    expect(button("Previous").hidden).toBe(true);
    expect(button("Skip").hidden).toBe(true);
    expect(button("Next").hidden).toBe(false);
    expect(button("Submit").hidden).toBe(true);
  });

  it("refuses an unanswered required question and shows the error as an alert", () => {
    const { form, fieldset, button } = mount();
    fireEvent.click(button("Next"));
    const first = fieldset("What should we prototype next?");
    const error = first.querySelector<HTMLElement>(".sk-questionnaire__error")!;
    expect(shown(first)).toBe(true);
    expect(error.textContent).toBe("Choose an answer to continue.");
    expect(error.getAttribute("role")).toBe("alert");
    expect(error.textContent).toBe("Choose an answer to continue.");
    expect(first.getAttribute("aria-describedby")).toContain(error.id);
    expect(document.activeElement).toBe(form.querySelector('input[value="delegation"]'));
  });

  it("follows the tile's own change event, moves on and focuses the next question", () => {
    const { form, fieldset, button } = mount();
    const itemChange = vi.fn();
    form.addEventListener("sk:questionnaireitemchange", itemChange);
    fireEvent.click(form.querySelector('input[value="questions"]')!);
    flushSync();
    fireEvent.click(button("Next"));
    const second = fieldset("Where should we reach you?");
    expect(shown(second)).toBe(true);
    expect(document.activeElement).toBe(second);
    expect(itemChange).toHaveBeenCalledWith(expect.objectContaining({ detail: { item: "channels" } }));
  });

  it("typing a free answer clears the radio through the tile command", () => {
    const { form } = mount();
    const radio = form.querySelector<HTMLInputElement>('input[value="delegation"]')!;
    fireEvent.click(radio);
    flushSync();
    expect(radio.checked).toBe(true);
    const other = form.querySelector<HTMLInputElement>("#other")!;
    other.value = "my own";
    fireEvent.input(other);
    flushSync();
    expect(radio.checked).toBe(false);
    expect(other.value).toBe("my own");
  });

  it("skip keeps an answer out of the submission; the last skip does not submit", () => {
    const { form, fieldset, button } = mount();
    const submitted = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener("submit", submitted);
    const values = vi.fn();
    form.addEventListener("sk:questionnairesubmit", values);

    fireEvent.click(form.querySelector('input[value="delegation"]')!);
    flushSync();
    fireEvent.click(button("Next"));
    fireEvent.click(form.querySelector('[data-value="email"] input')!);
    flushSync();
    fireEvent.click(button("Skip"));
    expect(shown(fieldset("Anything else?"))).toBe(true);
    fireEvent.click(button("Skip"));
    expect(submitted).not.toHaveBeenCalled();

    fireEvent.click(button("Submit"));
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ detail: { values: { direction: "delegation" } } }));
  });

  it("a submit with an invalid earlier question goes back to it", () => {
    const { form, fieldset } = mount();
    const submitted = vi.fn();
    form.addEventListener("submit", (event) => {
      if (!event.defaultPrevented) submitted();
      event.preventDefault();
    });
    form.requestSubmit();
    expect(shown(fieldset("What should we prototype next?"))).toBe(true);
    expect(submitted).not.toHaveBeenCalled();
  });

  it("keyboard: a letter picks, Mod+Enter advances, ArrowLeft goes back", () => {
    const { form, fieldset } = mount("text", "letters");
    const first = fieldset("What should we prototype next?");
    fireEvent.keyDown(first, { key: "b" });
    flushSync();
    expect(form.querySelector<HTMLInputElement>('input[value="questions"]')!.checked).toBe(true);
    fireEvent.keyDown(form, { key: "Enter", metaKey: true });
    const second = fieldset("Where should we reach you?");
    expect(shown(second)).toBe(true);
    fireEvent.keyDown(second, { key: "ArrowLeft" });
    expect(shown(first)).toBe(true);
  });

  it("starts from the authored defaults, so the state and the tiles never disagree", () => {
    document.body.innerHTML = markup()
      .replace('data-sk-tile-radio-group data-name="direction"', 'data-sk-tile-radio-group data-name="direction" data-default-value="delegation"')
      .replace('data-value="push"', 'data-value="push" data-default-checked');
    mountTileRadioGroup(document);
    mountTileCheckbox(document);
    expect(mountQuestionnaire(document)).toBe(1);
    flushSync();
    const form = document.querySelector("form")!;
    expect(form.querySelector<HTMLInputElement>('input[value="delegation"]')!.checked).toBe(true);

    // The first question counts as answered, so Next leaves it without an error.
    fireEvent.click(getByText(form, "Next", { selector: "button" }));
    expect(form.querySelector<HTMLElement>(".sk-questionnaire__error")!.textContent).toBe("");
    const values = vi.fn();
    form.addEventListener("sk:questionnairesubmit", values);
    form.addEventListener("submit", (event) => event.preventDefault());
    fireEvent.click(getByText(form, "Skip", { selector: "button" }));
    fireEvent.click(getByText(form, "Skip", { selector: "button" }));
    fireEvent.click(getByText(form, "Submit", { selector: "button" }));
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ detail: { values: { direction: "delegation" } } }));
  });

  it("a Likert question is native radios in a Box, driven by the browser", () => {
    const point = (value: string) =>
      `<label class="sk-radio"><input class="sk-radio__input" name="clarity" value="${value}" type="radio"><span class="sk-radio__control" aria-hidden="true"><span class="sk-radio__indicator"></span></span><span class="sk-radio__label">${value}</span></label>`;
    document.body.innerHTML = `
<form class="sk-questionnaire" data-sk-questionnaire data-progress="text" data-shortcuts="none" aria-label="Scale" novalidate>
  <div class="sk-questionnaire__progress" data-sk-questionnaire-progress hidden></div>
  <fieldset class="sk-questionnaire__item" data-sk-questionnaire-item data-required data-likert>
    <legend class="sk-questionnaire__title">The questions are clear</legend>
    <div class="sk-questionnaire__answers" data-name="clarity">
      <div class="sk-questionnaire__choices sk-box" data-likert data-border="subtle" data-padding="sm" data-surface="none">
        <div class="sk-questionnaire__scale sk-radio-group" role="radiogroup" data-orientation="horizontal" aria-orientation="horizontal">${point("1")}${point("2")}${point("3")}${point("4")}</div>
        <div class="sk-questionnaire__anchors"><span class="sk-questionnaire__anchor">Low</span><span class="sk-questionnaire__anchor">High</span></div>
      </div>
    </div>
    <p class="sk-questionnaire__error" data-sk-questionnaire-error hidden></p>
  </fieldset>
  <div class="sk-questionnaire__actions">
    <button class="sk-questionnaire__submit sk-button sk-interactive" data-sk-questionnaire-submit type="submit">Submit</button>
  </div>
</form>`;
    expect(mountQuestionnaire(document)).toBe(1);
    flushSync();
    const form = document.querySelector("form")!;
    const radios = [...form.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios).toHaveLength(4);
    // No tile anywhere: the scale is the radio group's own markup inside a Box.
    expect(form.querySelector(".sk-tile")).toBeNull();
    expect(form.querySelector(".sk-questionnaire__choices")!.classList.contains("sk-box")).toBe(true);

    const values = vi.fn();
    form.addEventListener("sk:questionnairesubmit", values);
    form.addEventListener("submit", (event) => event.preventDefault());
    radios[2]!.checked = true;
    fireEvent.change(radios[2]!);
    fireEvent.click(getByText(form, "Submit", { selector: "button" }));
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ detail: { values: { clarity: "3" } } }));
  });

  it("writes each choice's shortcut key and announces it, skipping the disabled one", () => {
    const { form } = mount("text", "letters");
    const keys = [...form.querySelectorAll(".sk-questionnaire__shortcut")].map((key) => key.textContent);
    expect(keys.slice(0, 2)).toEqual(["A", "B"]);
    expect(form.querySelector('input[value="delegation"]')!.getAttribute("aria-keyshortcuts")).toBe("A");
    // The disabled SMS choice takes no key: Push keeps the "B" the keyboard resolves to.
    const boxes = [...form.querySelectorAll("[data-sk-tile-checkbox]")];
    expect(boxes.map((b) => b.querySelector(".sk-questionnaire__shortcut")?.textContent)).toEqual(["A", "", "B"]);
    expect(boxes[2]!.querySelector("input")!.getAttribute("aria-keyshortcuts")).toBe("B");
  });

  it("draws no key at all when shortcuts are off", () => {
    const { form } = mount();
    const keys = [...form.querySelectorAll(".sk-questionnaire__shortcut")].map((key) => key.textContent);
    expect(keys.every((key) => key === "")).toBe(true);
    expect(form.querySelector("[aria-keyshortcuts]")).toBeNull();
  });

  it("bar progress fills with settled questions; steps progress marks the current one", () => {
    const { form, button } = mount("bar");
    const bar = form.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    const other = form.querySelector<HTMLInputElement>("#other")!;
    other.value = "x";
    fireEvent.input(other);
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe("3");
    fireEvent.click(button("Next"));

    const steps = mount("steps").form.querySelector('ol[role="list"]')!;
    const items = steps.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[0]!.getAttribute("aria-current")).toBe("step");
    expect(items[1]!.textContent).toContain("Channels");
  });

  it("honours data-default-item when mounting", () => {
    document.body.innerHTML = markup().replace(
      'data-sk-questionnaire data-progress="text"',
      'data-sk-questionnaire data-progress="text" data-default-item="notes"',
    );
    mountTileRadioGroup(document);
    mountTileCheckbox(document);
    expect(mountQuestionnaire(document)).toBe(1);
    flushSync();
    const form = document.querySelector("form")!;
    const fieldset = (title: string) => getByText(form, title, { selector: "legend" }).closest("fieldset") as HTMLFieldSetElement;
    expect(shown(fieldset("Anything else?"))).toBe(true);
    expect(shown(fieldset("What should we prototype next?"))).toBe(false);
  });
});
