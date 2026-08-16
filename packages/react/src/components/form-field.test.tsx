import { render, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { FormField } from "./form-field.js";
import { Input, Textarea } from "./input.js";

/* Queries are scoped to each render's own container: this suite renders more than one field, and
 * the default queries are bound to document.body. */
const fieldIn = (result: ReturnType<typeof render>) => within(result.container);

describe("FormField contract", () => {
  it("wires the label, hint and error to the control it wraps", () => {
    const ui = render(
      <FormField error="Enter a work address." hint="We only use this for receipts." label="Email">
        <Input name="email" />
      </FormField>,
    );

    const input = fieldIn(ui).getByRole("textbox", { name: /Email/ });
    const describedBy = input.getAttribute("aria-describedby")?.split(" ") ?? [];

    expect(describedBy).toHaveLength(2);
    expect(describedBy.map((id) => ui.container.querySelector(`#${CSS.escape(id)}`)?.textContent)).toEqual([
      "We only use this for receipts.",
      "Enter a work address.",
    ]);
  });

  it("treats the error message as what makes the field invalid", () => {
    const valid = render(
      <FormField label="Email">
        <Input name="email" />
      </FormField>,
    );
    expect(fieldIn(valid).getByRole("textbox").getAttribute("aria-invalid")).toBeNull();

    const invalid = render(
      <FormField error="Required." label="Email">
        <Input name="email" />
      </FormField>,
    );
    expect(fieldIn(invalid).getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
  });

  it("passes required and disabled down to the native control", () => {
    const ui = render(
      <FormField disabled label="Email" required>
        <Input name="email" />
      </FormField>,
    );

    const input = fieldIn(ui).getByRole("textbox", { name: /Email/ }) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
  });

  /* The reason the contract is not named after Input: the wiring never asks what it wrapped, so a
   * different control in the same slot has to come out wired the same way. */
  it("wires a textarea exactly as it wires an input", () => {
    const ui = render(
      <FormField hint="As much detail as you can." label="Notes">
        <Textarea name="notes" />
      </FormField>,
    );

    const textarea = fieldIn(ui).getByRole("textbox", { name: /Notes/ });
    const describedBy = textarea.getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(ui.container.querySelector(`#${CSS.escape(describedBy!)}`)?.textContent).toBe(
      "As much detail as you can.",
    );
  });

  it("passes axe on a field with a hint and an error", async () => {
    const ui = render(
      <FormField error="Enter a work address." hint="We only use this for receipts." label="Email" required>
        <Input name="email" />
      </FormField>,
    );

    const result = await axe.run(ui.container);
    expect(result.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toHaveLength(0);
  });
});
