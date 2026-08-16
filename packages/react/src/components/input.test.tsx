import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./form-field.js";
import { Input, Textarea } from "./input.js";

/* Queries are scoped to each render's own container: this suite renders more than one control, and
 * the default queries are bound to document.body. */
const controlIn = (result: ReturnType<typeof render>) => within(result.container);

describe("Input contract", () => {
  it("stays a valid control outside a FormField", () => {
    const ui = render(<Input aria-label="Search" name="q" />);
    const input = controlIn(ui).getByRole("textbox", { name: "Search" }) as HTMLInputElement;

    expect(input.id).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("gives a textarea the same appearance contract as an input", () => {
    const ui = render(
      <FormField label="Notes">
        <Textarea name="notes" />
      </FormField>,
    );

    expect(controlIn(ui).getByRole("textbox", { name: "Notes" }).className).toContain("sk-input");
  });

  /* `size` is already a native attribute of `<input>`, which is why the option is renamed rather
   * than passed through: the two would silently mean different things. */
  it("writes the control height to data-size, leaving the native size attribute alone", () => {
    const ui = render(<Input aria-label="Search" controlSize="sm" name="q" />);
    const input = controlIn(ui).getByRole("textbox", { name: "Search" });

    expect(input.getAttribute("data-size")).toBe("sm");
    expect(input.getAttribute("size")).toBeNull();
  });
});
