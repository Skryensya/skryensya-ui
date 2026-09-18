import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Questionnaire, QuestionnaireItem, type QuestionnaireProps } from "./questionnaire.js";

function Survey(props: Partial<QuestionnaireProps>) {
  return (
    <Questionnaire aria-label="Survey" {...props}>
      <QuestionnaireItem
        choices={[
          { value: "delegation", label: "Delegation" },
          { value: "questions", label: "Question prompts", description: "Ask before acting" },
        ]}
        description="Choose a direction or write your own."
        name="direction"
        required
        text
        textLabel="Another answer"
        title="What should we prototype next?"
      />
      <QuestionnaireItem
        choices={[
          { value: "email", label: "Email" },
          { value: "sms", label: "SMS", disabled: true },
          { value: "push", label: "Push" },
        ]}
        multiple
        name="channels"
        title="Where should we reach you?"
      />
      <QuestionnaireItem name="notes" text textLabel="Notes" title="Anything else?" />
    </Questionnaire>
  );
}

const fieldset = (ui: ReturnType<typeof render>, title: string) =>
  ui.getByText(title, { selector: "legend" }).closest("fieldset") as HTMLFieldSetElement;

/* The questions all keep their box (one grid row, so the height never changes); `data-active` is
   which one is showing, and `inert` is what the hidden ones carry. */
const shown = (question: HTMLFieldSetElement) => question.hasAttribute("data-active");

describe("Questionnaire (React)", () => {
  it("shows one question at a time, with its position and only the buttons that apply", () => {
    const ui = render(<Survey />);
    expect(shown(fieldset(ui, "What should we prototype next?"))).toBe(true);
    expect(shown(fieldset(ui, "Where should we reach you?"))).toBe(false);
    expect(fieldset(ui, "Where should we reach you?").hasAttribute("inert")).toBe(true);
    expect(ui.getByText("Question 1 of 3")).toBeTruthy();
    // A hidden button has no accessible name, so it is found by its text.
    const button = (name: string) => ui.getByText(name, { selector: "button" }) as HTMLButtonElement;
    expect(button("Previous").hidden).toBe(true);
    expect(button("Skip").hidden).toBe(true);
    expect(button("Next").hidden).toBe(false);
    expect(button("Submit").hidden).toBe(true);
  });

  it("marks itself mounted so the Vanilla enhancer never wires a second questionnaire over it", () => {
    const ui = render(<Survey />);
    const form = ui.getByRole("form", { name: "Survey" });
    expect(form.hasAttribute("data-sk-questionnaire")).toBe(true);
    expect(form.getAttribute("data-sk-ready")).toBe("true");
  });

  it("refuses to leave an unanswered required question and says why", async () => {
    const ui = render(<Survey />);
    fireEvent.click(ui.getByRole("button", { name: "Next" }));
    const first = fieldset(ui, "What should we prototype next?");
    await waitFor(() => expect(ui.getByRole("alert").textContent).toBe("Choose an answer to continue."));
    expect(shown(first)).toBe(true);
    expect(first.getAttribute("aria-invalid")).toBe("true");
    expect(first.getAttribute("aria-describedby")).toContain(ui.getByRole("alert").id);
  });

  it("moves on once answered, focuses the next question and announces the change", async () => {
    const onItemChange = vi.fn();
    const ui = render(<Survey onItemChange={onItemChange} />);
    fireEvent.click(ui.getByRole("radio", { name: /Question prompts/ }));
    await waitFor(() => expect((ui.getByRole("radio", { name: /Question prompts/ }) as HTMLInputElement).checked).toBe(true));
    fireEvent.click(ui.getByRole("button", { name: "Next" }));

    const second = fieldset(ui, "Where should we reach you?");
    await waitFor(() => expect(shown(second)).toBe(true));
    expect(document.activeElement).toBe(second);
    expect(onItemChange).toHaveBeenCalledWith({ item: "channels" });
    expect(ui.getByText("Question 2 of 3")).toBeTruthy();
  });

  it("typing a free answer clears a single choice", async () => {
    const ui = render(<Survey />);
    const radio = ui.getByRole("radio", { name: /Delegation/ }) as HTMLInputElement;
    fireEvent.click(radio);
    await waitFor(() => expect(radio.checked).toBe(true));
    fireEvent.change(ui.getByLabelText("Another answer"), { target: { value: "my own" } });
    await waitFor(() => expect(radio.checked).toBe(false));
    expect((ui.getByLabelText("Another answer") as HTMLInputElement).value).toBe("my own");
  });

  it("skips an optional question without submitting, and submits the answers that count", async () => {
    const onValuesSubmit = vi.fn();
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const ui = render(<Survey defaultAnswers={{ direction: { choices: ["delegation"] } }} onSubmit={onSubmit} onValuesSubmit={onValuesSubmit} />);

    fireEvent.click(ui.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(shown(fieldset(ui, "Where should we reach you?"))).toBe(true));
    const email = ui.getByRole("checkbox", { name: /Email/ }) as HTMLInputElement;
    fireEvent.click(email);
    await waitFor(() => expect(email.checked).toBe(true));
    // Skipping keeps the answer but leaves it out of what is submitted.
    fireEvent.click(ui.getByRole("button", { name: "Skip" }));
    await waitFor(() => expect(shown(fieldset(ui, "Anything else?"))).toBe(true));

    fireEvent.click(ui.getByRole("button", { name: "Skip" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(shown(fieldset(ui, "Anything else?"))).toBe(true);

    fireEvent.click(ui.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onValuesSubmit).toHaveBeenCalledWith({ values: { direction: "delegation" } }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("a submit with an invalid earlier question goes back to it instead", async () => {
    const onSubmit = vi.fn();
    const ui = render(<Survey defaultItem="notes" onSubmit={onSubmit} />);
    fireEvent.click(ui.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(shown(fieldset(ui, "What should we prototype next?"))).toBe(true));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(ui.getByRole("alert")).toBeTruthy();
  });

  it("keyboard: letter shortcuts pick, Mod+Enter advances, ArrowLeft goes back", async () => {
    const ui = render(<Survey shortcuts="letters" />);
    const form = ui.getByRole("form", { name: "Survey" });
    const first = fieldset(ui, "What should we prototype next?");

    fireEvent.keyDown(first, { key: "b" });
    await waitFor(() => expect((ui.getByRole("radio", { name: /Question prompts/ }) as HTMLInputElement).checked).toBe(true));

    fireEvent.keyDown(form, { key: "Enter", ctrlKey: true });
    const second = fieldset(ui, "Where should we reach you?");
    await waitFor(() => expect(shown(second)).toBe(true));

    fireEvent.keyDown(second, { key: "ArrowLeft" });
    await waitFor(() => expect(shown(first)).toBe(true));
  });

  it("draws each choice's shortcut key and announces it, from the same map the keyboard uses", () => {
    const ui = render(<Survey shortcuts="letters" />);
    const first = fieldset(ui, "What should we prototype next?");
    expect([...first.querySelectorAll(".sk-questionnaire__shortcut")].map((key) => key.textContent)).toEqual(["A", "B"]);
    expect(ui.getByRole("radio", { name: /Delegation/ }).getAttribute("aria-keyshortcuts")).toBe("A");
    // A disabled choice takes no key, so the one after it keeps the key that works.
    const second = fieldset(ui, "Where should we reach you?");
    expect([...second.querySelectorAll(".sk-questionnaire__shortcut")].map((key) => key.textContent)).toEqual(["A", "", "B"]);
  });

  it("numbers stop at the ninth choice, so no key is drawn that nothing answers to", () => {
    const choices = Array.from({ length: 11 }, (_, index) => ({ value: `c${index}`, label: `Choice ${index}` }));
    const ui = render(
      <Questionnaire aria-label="Long" shortcuts="numbers">
        <QuestionnaireItem choices={choices} name="long" title="Pick one" />
      </Questionnaire>,
    );
    const keys = [...ui.container.querySelectorAll(".sk-questionnaire__shortcut")].map((key) => key.textContent);
    expect(keys.slice(0, 9)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    expect(keys.slice(9)).toEqual(["", ""]);
  });

  it("a Likert question is the same radio group, laid out as a scale", async () => {
    const ui = render(
      <Questionnaire aria-label="Scale">
        <QuestionnaireItem
          choices={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
          likert
          likertMaxLabel="Strongly agree"
          likertMinLabel="Strongly disagree"
          name="clarity"
          required
          title="The questions are clear"
        />
      </Questionnaire>,
    );
    // Radios, not a second control: no Likert markup, and the scale is the choices container itself.
    expect(ui.getAllByRole("radio")).toHaveLength(5);
    expect(ui.container.querySelector("[class*='sk-likert']")).toBeNull();
    const choices = ui.container.querySelector(".sk-questionnaire__choices")!;
    expect(choices.hasAttribute("data-likert")).toBe(true);
    expect([...ui.container.querySelectorAll(".sk-questionnaire__anchor")].map((a) => a.textContent)).toEqual([
      "Strongly disagree",
      "Strongly agree",
    ]);

    const three = ui.getByRole("radio", { name: "3" }) as HTMLInputElement;
    fireEvent.click(three);
    await waitFor(() => expect(three.checked).toBe(true));
    // One answer at a time, like any other single choice.
    fireEvent.click(ui.getByRole("radio", { name: "5" }));
    await waitFor(() => expect(three.checked).toBe(false));
  });

  it("bar progress fills with settled questions; steps progress lists each question", async () => {
    const bar = render(<Survey defaultAnswers={{ direction: { text: "x" } }} progress="bar" />);
    const progressbar = bar.getByRole("progressbar");
    expect(progressbar.getAttribute("aria-valuenow")).toBe("1");
    expect(progressbar.getAttribute("aria-valuemax")).toBe("3");
    bar.unmount();

    const steps = render(<Survey progress="steps" />);
    const list = steps.getByRole("list", { name: "Questionnaire progress" });
    expect(list.querySelectorAll("li")).toHaveLength(3);
    expect(list.querySelector("[aria-current=step]")?.textContent).toContain("What should we prototype next?");
  });

  it("dispatches sk:questionnaireitemchange on the form", async () => {
    const ui = render(<Survey defaultAnswers={{ direction: { text: "x" } }} />);
    const listener = vi.fn();
    ui.getByRole("form", { name: "Survey" }).addEventListener("sk:questionnaireitemchange", listener);
    fireEvent.click(ui.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(listener).toHaveBeenCalled());
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({ item: "channels" });
  });

  it("stamps the mount attrs the vanilla enhancer scans for", () => {
    const ui = render(<Survey defaultItem="channels" />);
    const form = ui.getByRole("form", { name: "Survey" });
    expect(form.getAttribute("data-sk-questionnaire")).toBe("");
    expect(form.getAttribute("data-default-item")).toBe("channels");
    expect(ui.container.querySelector("[data-sk-questionnaire-progress]")).toBeTruthy();
    expect(ui.container.querySelectorAll("[data-sk-questionnaire-item]")).toHaveLength(3);
    expect(ui.container.querySelector("[data-sk-questionnaire-previous]")).toBeTruthy();
    expect(ui.container.querySelector("[data-sk-questionnaire-skip]")).toBeTruthy();
    expect(ui.container.querySelector("[data-sk-questionnaire-next]")).toBeTruthy();
    expect(ui.container.querySelector("[data-sk-questionnaire-submit]")).toBeTruthy();
    expect(ui.container.querySelector("[data-sk-questionnaire-error]")).toBeTruthy();
  });

  it("dispatches sk:questionnairesubmit before a valid submit proceeds", async () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const ui = render(<Survey defaultAnswers={{ direction: { choices: ["delegation"] } }} defaultItem="notes" onSubmit={onSubmit} />);
    const listener = vi.fn();
    ui.getByRole("form", { name: "Survey" }).addEventListener("sk:questionnairesubmit", listener);
    fireEvent.click(ui.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(listener).toHaveBeenCalled());
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({ values: { direction: "delegation" } });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
