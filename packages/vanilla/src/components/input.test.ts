import { fireEvent } from "@testing-library/dom";
import { registerInputFormat } from "@skryensya/core/input-format";
import { describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime.js";
import { mountInput } from "./input.js";

/*
 * The vanilla half of `format`. Every assertion here has a twin in
 * `packages/react/src/components/input.test.tsx`, deliberately: the two bindings are supposed to
 * reach the same DOM from the same authored intent, and a suite that checked only one of them would
 * let the pair drift in exactly the place this contract promises they cannot.
 */
function mountField(options: { format: string; errorLabel?: string; error?: string; country?: string } = { format: "rut" }): {
  field: HTMLElement;
  control: HTMLInputElement;
} {
  const errorLabel = options.errorLabel ? ` data-error-label="${options.errorLabel}"` : "";
  const country = options.country ? ` data-country="${options.country}"` : "";
  const authored = options.error
    ? `<div class="sk-form-field__error" id="rut-error">${options.error}</div>`
    : "";
  const describedBy = options.error ? ' aria-describedby="rut-error" aria-invalid="true"' : "";

  document.body.innerHTML = `<div class="sk-form-field">
    <label class="sk-form-field__label" for="rut">RUT</label>
    <input class="sk-input" data-format="${options.format}" id="rut" name="rut"${country}${errorLabel}${describedBy}>
    ${authored}
  </div>`;

  const field = document.body.firstElementChild as HTMLElement;
  const control = field.querySelector("input") as HTMLInputElement;
  return { field, control };
}

const type = (control: HTMLInputElement, value: string): void => {
  control.value = value;
  fireEvent.input(control);
};

const errorIn = (field: HTMLElement) => field.querySelector(".sk-form-field__error");

describe("Input format enhancer", () => {
  it("enhances a field that declares a format, once", () => {
    const { field, control } = mountField();
    expect(mountInput(field)).toBe(1);
    expect(mountInput(field)).toBe(0);
    expect(control.getAttribute("data-sk-ready")).toBe("true");
  });

  it("leaves a field with no format alone", () => {
    document.body.innerHTML = `<div class="sk-form-field">
      <input class="sk-input" id="plain" name="plain">
    </div>`;
    expect(mountInput(document.body.firstElementChild as HTMLElement)).toBe(0);
  });

  it("says nothing while the value is still being typed", () => {
    const { field, control } = mountField();
    mountInput(field);

    type(control, "12.345.6");

    expect(errorIn(field)).toBeNull();
    expect(control.getAttribute("aria-invalid")).toBeNull();
  });

  it("writes the message itself once the reader leaves the field", () => {
    const { field, control } = mountField();
    mountInput(field);

    type(control, "12.345.678-4");
    fireEvent.focusOut(control);

    const error = errorIn(field) as HTMLElement;
    expect(error).not.toBeNull();
    expect(error.textContent).toBe("That check digit does not match the number before it.");
    expect(error.className).toBe("sk-form-field__error");
    /* Both halves of what React's own test asserts: the announcement role, and the id the field's
       wiring points at. The id is derived from the control's, so the two bindings agree on it. */
    expect(error.getAttribute("role")).toBe("alert");
    expect(error.id).toBe("rut-error");
    expect(control.getAttribute("aria-describedby")).toBe("rut-error");
    expect(control.getAttribute("aria-invalid")).toBe("true");
    /* Last in the field, which is where the contract's template puts it. */
    expect(field.lastElementChild).toBe(error);
  });

  it("clears the message live once the value becomes valid", () => {
    const { field, control } = mountField();
    mountInput(field);

    type(control, "12.345.678-4");
    fireEvent.focusOut(control);
    expect(errorIn(field)).not.toBeNull();

    type(control, "12.345.678-5");

    expect(errorIn(field)).toBeNull();
    expect(control.getAttribute("aria-invalid")).toBeNull();
    expect(control.getAttribute("aria-describedby")).toBeNull();
  });

  it("blocks the form through the platform's own constraint, before any blur", () => {
    const { field, control } = mountField();
    mountInput(field);

    type(control, "12.345.678-4");

    expect(errorIn(field)).toBeNull();
    expect(control.checkValidity()).toBe(false);
    expect(control.validationMessage).toBe("That check digit does not match the number before it.");

    type(control, "12.345.678-5");
    expect(control.checkValidity()).toBe(true);
  });

  it("never fails an empty field, which is required's question and not a format's", () => {
    const { field, control } = mountField();
    mountInput(field);

    fireEvent.focusOut(control);

    expect(errorIn(field)).toBeNull();
    expect(control.checkValidity()).toBe(true);
  });

  it("uses data-error-label in place of the generated sentence", () => {
    const { field, control } = mountField({ format: "rut", errorLabel: "Check the RUT on your carnet." });
    mountInput(field);

    type(control, "12.345.678-4");
    fireEvent.focusOut(control);

    expect(errorIn(field)?.textContent).toBe("Check the RUT on your carnet.");
    expect(control.validationMessage).toBe("Check the RUT on your carnet.");
  });

  it("lets an authored error win over the one it would have written", () => {
    const { field, control } = mountField({ format: "rut", error: "That RUT is already registered." });
    mountInput(field);

    type(control, "12.345.678-4");
    fireEvent.focusOut(control);

    /* One box, and it is the author's. The constraint is still set, so the form still refuses. */
    expect(field.querySelectorAll(".sk-form-field__error")).toHaveLength(1);
    expect(errorIn(field)?.textContent).toBe("That RUT is already registered.");
    expect(control.checkValidity()).toBe(false);
  });

  it("dispatches sk:inputvalidate with the same detail React sends", () => {
    const { field, control } = mountField({ format: "url" });
    mountInput(field);
    const heard = vi.fn();
    field.addEventListener("sk:inputvalidate", heard);

    type(control, "javascript:alert(1)");
    expect(heard.mock.lastCall?.[0].detail).toEqual({ ok: false, reason: "protocol" });

    type(control, "example.com");
    expect(heard.mock.lastCall?.[0].detail).toEqual({ ok: true, normalized: "https://example.com/" });
  });

  /*
   * The twin of React's own `country` test, and a stand-in validator for the same reason: this
   * package must not depend on `@skryensya/phone`, so what is proven here is that `data-country`
   * reaches whatever implements the format, read fresh on each pass.
   */
  it("hands the field's country to whatever implements the format, re-read every pass", () => {
    const seen: (string | undefined)[] = [];
    registerInputFormat("phone", {
      validate: (_value, context) => {
        seen.push(context.country);
        return { ok: false, reason: "unknown-prefix" };
      },
    });

    const { field, control } = mountField({ format: "phone", country: "CL" });
    mountInput(field);

    type(control, "923456789");
    /* Switched by something else on the page, with no remount. */
    control.setAttribute("data-country", "AR");
    type(control, "923456789");

    expect(seen.slice(-2)).toEqual(["CL", "AR"]);
  });

  it("hands the field back untouched when the enhancer is destroyed", () => {
    const { field, control } = mountField();
    mountInput(field);

    type(control, "12.345.678-4");
    fireEvent.focusOut(control);
    expect(errorIn(field)).not.toBeNull();

    destroyMount(control);

    expect(errorIn(field)).toBeNull();
    expect(control.getAttribute("aria-invalid")).toBeNull();
    /* The constraint is released too: a destroyed enhancer must not leave a form it no longer
       watches permanently unsubmittable. */
    expect(control.checkValidity()).toBe(true);
  });
});
