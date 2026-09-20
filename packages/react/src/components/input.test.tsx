import { fireEvent, render, within } from "@testing-library/react";
import { registerInputFormat } from "@skryensya/core/input-format";
import { describe, expect, it, vi } from "vitest";
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

  it("inherits FormField wiring the same way Input does", () => {
    const ui = render(
      <FormField label="Salida" hint="Hora local." error="Falta.">
        <NativeInput name="inicio" type="time" />
      </FormField>,
    );
    const input = controlIn(ui).getByLabelText("Salida") as HTMLInputElement;

    expect(input.id).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toMatch(/hint/);
    expect(input.getAttribute("aria-describedby")).toMatch(/error/);
  });

  it("writes controlSize on NativeInput as data-size", () => {
    const ui = render(<NativeInput aria-label="Salida" controlSize="sm" name="inicio" type="time" />);
    expect(controlIn(ui).getByLabelText("Salida").getAttribute("data-size")).toBe("sm");
  });
});

/*
 * The FORMAT half of the contract. What is being proven here is not that a regular expression runs:
 * it is the seam between a pure decision in Core, the message a reader sees, and the platform's own
 * submit gate. The arithmetic itself is `@skryensya/core/input-format`'s own suite.
 */
describe("Input format validation", () => {
  const typeInto = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });

  it("says nothing while the value is still being typed", () => {
    const ui = render(
      <FormField label="RUT">
        <Input format="rut" name="rut" />
      </FormField>,
    );
    const input = controlIn(ui).getByRole("textbox", { name: /RUT/ });

    typeInto(input, "12.345.6");

    expect(controlIn(ui).queryByRole("alert")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });

  it("writes the message itself once the reader leaves the field", () => {
    const ui = render(
      <FormField label="RUT">
        <Input format="rut" name="rut" />
      </FormField>,
    );
    const input = controlIn(ui).getByRole("textbox", { name: /RUT/ });

    typeInto(input, "12.345.678-4");
    fireEvent.blur(input);

    const error = controlIn(ui).getByRole("alert");
    expect(error.textContent).toBe("That check digit does not match the number before it.");
    expect(error.className).toBe("sk-form-field__error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    /* The field's own wiring carries it, exactly as an authored error would be carried. */
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
  });

  it("clears the message live once the value becomes valid", () => {
    const ui = render(
      <FormField label="RUT">
        <Input format="rut" name="rut" />
      </FormField>,
    );
    const input = controlIn(ui).getByRole("textbox", { name: /RUT/ });

    typeInto(input, "12.345.678-4");
    fireEvent.blur(input);
    expect(controlIn(ui).queryByRole("alert")).not.toBeNull();

    /* No second blur: once shown, the message tracks the value, so fixing it is what clears it. */
    typeInto(input, "12.345.678-5");
    expect(controlIn(ui).queryByRole("alert")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });

  it("blocks the form through the platform's own constraint, before any blur", () => {
    const ui = render(
      <FormField label="RUT">
        <Input format="rut" name="rut" />
      </FormField>,
    );
    const input = controlIn(ui).getByRole("textbox", { name: /RUT/ }) as HTMLInputElement;

    typeInto(input, "12.345.678-4");

    /* Nothing is shown yet, and the value is already unsubmittable: the two are separate decisions. */
    expect(controlIn(ui).queryByRole("alert")).toBeNull();
    expect(input.checkValidity()).toBe(false);
    expect(input.validationMessage).toBe("That check digit does not match the number before it.");

    typeInto(input, "12.345.678-5");
    expect(input.checkValidity()).toBe(true);
    expect(input.validationMessage).toBe("");
  });

  it("never fails an empty field, which is required's question and not a format's", () => {
    const ui = render(
      <FormField label="RUT">
        <Input format="rut" name="rut" />
      </FormField>,
    );
    const input = controlIn(ui).getByRole("textbox", { name: /RUT/ }) as HTMLInputElement;

    fireEvent.blur(input);

    expect(controlIn(ui).queryByRole("alert")).toBeNull();
    expect(input.checkValidity()).toBe(true);
  });

  it("uses errorLabel in place of the generated sentence", () => {
    const ui = render(
      <FormField label="RUT">
        <Input errorLabel="Check the RUT on your carnet." format="rut" name="rut" />
      </FormField>,
    );
    const input = controlIn(ui).getByRole("textbox", { name: /RUT/ }) as HTMLInputElement;

    typeInto(input, "12.345.678-4");
    fireEvent.blur(input);

    expect(controlIn(ui).getByRole("alert").textContent).toBe("Check the RUT on your carnet.");
    expect(input.validationMessage).toBe("Check the RUT on your carnet.");
  });

  it("lets an authored error win over the one the control reported", () => {
    const ui = render(
      <FormField error="That RUT is already registered." label="RUT">
        <Input format="rut" name="rut" />
      </FormField>,
    );
    const input = controlIn(ui).getByRole("textbox", { name: /RUT/ });

    typeInto(input, "12.345.678-4");
    fireEvent.blur(input);

    /* One error box, and it is the author's: they know something the check digit does not. */
    expect(ui.container.querySelectorAll(".sk-form-field__error")).toHaveLength(1);
    expect(ui.container.querySelector(".sk-form-field__error")?.textContent).toBe(
      "That RUT is already registered.",
    );
  });

  it("reports the result through onValidate and the DOM event alike", () => {
    const onValidate = vi.fn();
    const onEvent = vi.fn();
    const ui = render(
      <FormField label="Website">
        <Input format="url" name="site" onValidate={onValidate} />
      </FormField>,
    );
    const input = controlIn(ui).getByRole("textbox", { name: /Website/ });
    input.addEventListener("sk:inputvalidate", onEvent);

    typeInto(input, "javascript:alert(1)");
    expect(onValidate).toHaveBeenLastCalledWith({ ok: false, reason: "protocol" });
    expect(onEvent.mock.lastCall?.[0].detail).toEqual({ ok: false, reason: "protocol" });

    typeInto(input, "example.com");
    expect(onValidate).toHaveBeenLastCalledWith({ ok: true, normalized: "https://example.com/" });
    expect(onEvent.mock.lastCall?.[0].detail).toEqual({ ok: true, normalized: "https://example.com/" });
  });

  /*
   * `country` reaches the validator, proven WITHOUT depending on `@skryensya/phone`. This package
   * must stay free of that optional dependency, so the test registers a stand-in through the same
   * seam the real one uses: what is under test here is the binding's wiring, not a numbering plan.
   */
  it("hands the field's country to whatever implements the format", () => {
    const seen: (string | undefined)[] = [];
    registerInputFormat("phone", {
      validate: (value, context) => {
        seen.push(context.country);
        return { ok: false, reason: "unknown-prefix" };
      },
    });

    const ui = render(<Input aria-label="Phone" country="CL" format="phone" name="phone" />);
    const input = controlIn(ui).getByRole("textbox", { name: "Phone" });

    typeInto(input, "923456789");

    expect(seen).toContain("CL");
    expect(input.getAttribute("data-country")).toBe("CL");
  });

  it("still paints a control that has no FormField to print the message in", () => {
    const ui = render(<Input aria-label="Website" format="url" name="site" />);
    const input = controlIn(ui).getByRole("textbox", { name: "Website" }) as HTMLInputElement;

    typeInto(input, "javascript:alert(1)");
    fireEvent.blur(input);

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.validationMessage).toBe("Only http and https addresses can be opened.");
  });

  it("writes the format to the attribute the enhancer reads", () => {
    const ui = render(<Input aria-label="RUT" format="rut" name="rut" />);
    expect(controlIn(ui).getByRole("textbox").getAttribute("data-format")).toBe("rut");
  });
});
