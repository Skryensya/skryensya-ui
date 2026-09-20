import { formFieldParts } from "@skryensya/core/form-field";
import { inputEvents } from "@skryensya/core/input";
import {
  inputFormatMessage,
  shouldShowInputError,
  validateInputFormat,
  type InputFormat,
} from "@skryensya/core/input-format";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * INPUT FORMAT, the DOM shell around `@skryensya/core/input-format`'s pure decisions.
 *
 * The enhancer owns only what touches the platform: when the reader has left the field, handing the
 * message to the browser's own constraint API, and putting the sentence into the FormField's error
 * box. "Is this RUT real" and "is the message allowed to show yet" are both Core's, and both
 * bindings ask the same two functions rather than each deciding for itself.
 *
 * Only `input[data-format]` roots are enhanced. A plain text field has no state here, which is why
 * `runtime/registry.ts` gates the whole module behind that attribute: a page of ordinary inputs
 * downloads none of this. The element qualifier is not tidiness: `chart` writes a `data-format` of
 * its own, and a bare attribute selector would claim its roots too.
 *
 * NO SVELTE, unlike the stateful enhancers beside it (decision 10). There is no internal tree to
 * render: the control already exists in the markup and the error box is one element the FIELD owns,
 * in a place the field's own stylesheet already styles. Mounting a component to write one `<div>`
 * would put a second renderer in charge of a subtree that authored HTML and React both write by
 * hand, which is exactly where the two bindings would start to differ.
 */

type Cleanup = () => void;

/** Adds or removes one token without disturbing the others the field's wiring already put there. */
function setDescribedBy(control: HTMLElement, id: string, present: boolean): void {
  const tokens = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
  const without = tokens.filter((token) => token !== id);
  const next = present ? [...without, id] : without;
  if (next.length === 0) control.removeAttribute("aria-describedby");
  else control.setAttribute("aria-describedby", next.join(" "));
}

export function connectInput(control: HTMLElement): Cleanup {
  if (!(control instanceof HTMLInputElement)) return () => {};

  const format = control.getAttribute("data-format") as InputFormat | null;
  if (!format) return () => {};

  const field = control.closest<HTMLElement>(`.${formFieldParts.root}`);

  /*
   * AN ERROR THE AUTHOR ALREADY WROTE IS FINAL, the same rule the React binding states on its own
   * `error` prop. Whoever composed the field knew something a check digit cannot ("that RUT is
   * already registered"), and a validator quietly replacing their sentence would be the control
   * overruling the page. Captured once at mount: an error that appears later is this enhancer's own.
   */
  const authoredError = field?.querySelector(`.${formFieldParts.error}`) ?? null;

  /* React derives the same id from the control's own (`${controlId}-error`), so both bindings point
     `aria-describedby` at the same string for the same field. */
  const errorId = `${control.id}-error`;
  let shown: HTMLElement | null = null;

  const clear = (): void => {
    if (!shown) return;
    shown.remove();
    shown = null;
    setDescribedBy(control, errorId, false);
    control.removeAttribute("aria-invalid");
  };

  const show = (message: string): void => {
    if (!field) return;
    if (!shown) {
      shown = document.createElement("div");
      shown.className = formFieldParts.error;
      shown.id = errorId;
      /* `role="alert"` only on a message the machine wrote, never on one that was on the page from
         the start: announcing something already present the moment the page loaded is noise. The
         React binding makes the same distinction, for the same reason. */
      shown.setAttribute("role", "alert");
      /* Last in the field, which is where the contract's own template puts the error. */
      field.append(shown);
      setDescribedBy(control, errorId, true);
    }
    if (shown.textContent !== message) shown.textContent = message;
    control.setAttribute("aria-invalid", "true");
  };

  let touched = false;

  const validate = (notify: boolean): void => {
    /* Read per pass, not captured at mount: a consumer switching the field's country (a locale
       picker beside it) should change the verdict without remounting the enhancer. */
    const country = control.getAttribute("data-country") ?? undefined;
    const result = validateInputFormat(format, control.value, { country });
    const message = result.ok
      ? ""
      : (control.getAttribute("data-error-label") ?? inputFormatMessage(format, result.reason));

    /*
     * THE PLATFORM ENFORCES IT. `setCustomValidity` is what makes a real `<form>` refuse to submit,
     * makes `:invalid` match and makes `reportValidity()` focus this field. Set on every pass,
     * including before the reader has touched anything: the value is invalid then too, and whether
     * the FORM knows is a different question from whether the READER has been told yet.
     */
    control.setCustomValidity(message);

    if (!authoredError) {
      if (shouldShowInputError(touched, result)) show(message);
      else clear();
    }

    if (!notify) return;
    control.dispatchEvent(
      new CustomEvent(inputEvents.validate, {
        bubbles: true,
        detail: result.ok ? { ok: true, normalized: result.normalized } : { ok: false, reason: result.reason },
      }),
    );
  };

  const onInput = (): void => validate(true);
  const onFocusOut = (): void => {
    touched = true;
    validate(true);
  };

  control.addEventListener("input", onInput);
  /* `focusout`, not `blur`: blur does not bubble, and a control inside a field that is itself moved
     or re-parented keeps hearing this one. It is also what React's own `onBlur` listens to. */
  control.addEventListener("focusout", onFocusOut);

  /* The sync-only pass: a field arriving pre-filled with a broken RUT is already unsubmittable,
     without announcing a result nobody asked for. */
  validate(false);

  return () => {
    control.removeEventListener("input", onInput);
    control.removeEventListener("focusout", onFocusOut);
    control.setCustomValidity("");
    clear();
  };
}

export const mountInput = createConnectMount({
  key: "input",
  rootSelector: "input[data-format]",
  connect: connectInput,
});
