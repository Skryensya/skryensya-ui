import { render, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Field, Input, Textarea } from "./input.js";

/* Queries are scoped to each render's own container: this suite renders more than one field, and
 * the default queries are bound to document.body. */
const fieldIn = (result: ReturnType<typeof render>) => within(result.container);

describe("Field and Input contracts", () => {
  it("wires the label, hint and error to the control it wraps", () => {
    const ui = render(
      <Field error="Enter a work address." hint="We only use this for receipts." label="Email">
        <Input name="email" />
      </Field>,
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
      <Field label="Email">
        <Input name="email" />
      </Field>,
    );
    expect(fieldIn(valid).getByRole("textbox").getAttribute("aria-invalid")).toBeNull();

    const invalid = render(
      <Field error="Required." label="Email">
        <Input name="email" />
      </Field>,
    );
    expect(fieldIn(invalid).getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
  });

  it("passes required and disabled down to the native control", () => {
    const ui = render(
      <Field disabled label="Email" required>
        <Input name="email" />
      </Field>,
    );

    const input = fieldIn(ui).getByRole("textbox", { name: /Email/ }) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
  });

  it("stays a valid control outside a Field", () => {
    const ui = render(<Input aria-label="Search" name="q" />);
    const input = fieldIn(ui).getByRole("textbox", { name: "Search" }) as HTMLInputElement;

    expect(input.id).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("gives a textarea the same appearance contract as an input", () => {
    const ui = render(
      <Field label="Notes">
        <Textarea name="notes" />
      </Field>,
    );

    expect(fieldIn(ui).getByRole("textbox", { name: "Notes" }).className).toContain("sk-input");
  });

  it("passes axe on a field with a hint and an error", async () => {
    const ui = render(
      <Field error="Enter a work address." hint="We only use this for receipts." label="Email" required>
        <Input name="email" />
      </Field>,
    );

    const result = await axe.run(ui.container);
    expect(result.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toHaveLength(0);
  });
});
