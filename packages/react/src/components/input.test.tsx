import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./form-field.js";
import { Input, NativeInput, Textarea } from "./input.js";

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

  /*
   * "Native" names the CONTROL, never the appearance: a plain `<input type="time">`/`type="color"`
   * still gets the shared field border/height/radius/focus-ring, the same class `Input` carries.
   * Without it the control fell back to raw browser chrome next to every other styled field.
   */
  it("gives NativeInput the same appearance contract as Input, whatever its type", () => {
    const ui = render(<NativeInput aria-label="Salida" name="inicio" type="time" />);
    const input = controlIn(ui).getByLabelText("Salida") as HTMLInputElement;

    expect(input.className).toContain("sk-input");
    expect(input.type).toBe("time");
  });

  it("keeps an author-supplied className alongside NativeInput's own", () => {
    const ui = render(<NativeInput aria-label="Salida" className="custom" name="inicio" type="time" />);
    const input = controlIn(ui).getByLabelText("Salida") as HTMLInputElement;

    expect(input.className.split(" ")).toEqual(expect.arrayContaining(["sk-input", "custom"]));
  });
});
