import { fireEvent, within } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { mountOtpInput } from "./otp-input.js";

/*
 * The vanilla half of OtpInput. Every assertion here has a twin in
 * `packages/react/src/components/otp-input.test.tsx`: the two bindings drive the SAME
 * `@zag-js/pin-input` machine, so a suite that checked only one would let the pair drift where the
 * contract promises it cannot. The markup is what `emitMarkup` produces for the canonical tree.
 *
 * Same settle rule the React suite documents: the machine needs a real focus transition before it
 * accepts a change/paste/keystroke, and its own commit lands a frame or two later.
 */
const settle = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0))));

/* `fireEvent.focusIn`, never `fireEvent.focus`: `@zag-js/svelte`'s own `normalizeProps` remaps
   `onFocus`/`onBlur` to native `focusin`/`focusout`, unlike `@zag-js/react`'s `onFocus`/`focus`. A
   plain `fireEvent.focus` never reaches the machine here, which reads as focus silently doing
   nothing rather than an error. */

function mount(options: { count?: number; defaultValue?: string; mask?: boolean; type?: string } = {}): HTMLElement {
  const count = options.count ?? 6;
  const defaultValueAttr = options.defaultValue !== undefined ? ` data-default-value="${options.defaultValue}"` : "";
  const maskAttr = options.mask ? " data-mask" : "";
  const typeAttr = options.type ? ` data-type="${options.type}"` : "";
  const segments = Array.from(
    { length: count },
    () => `<input class="sk-otp-input__segment sk-interactive" data-sk-otp-input-segment type="text" autocomplete="off">`,
  ).join("");

  document.body.innerHTML = `<div class="sk-otp-input" data-sk-otp-input data-name="code"${defaultValueAttr}${maskAttr}${typeAttr} data-item-label="Code {index} of {count}">
    <label class="sk-otp-input__label" data-sk-otp-input-label>Code</label>
    <div class="sk-otp-input__control" data-sk-otp-input-control>${segments}</div>
    <input class="sk-otp-input__hidden" data-sk-otp-input-hidden data-name="code" type="text" aria-hidden="true" tabindex="-1">
  </div>`;

  return document.body.firstElementChild as HTMLElement;
}

const segmentsOf = (root: HTMLElement) =>
  within(root).getAllByRole("textbox") as HTMLInputElement[];

const type = async (input: HTMLInputElement, char: string) => {
  fireEvent.focusIn(input);
  await settle();
  fireEvent.input(input, { target: { value: char }, inputType: "insertText" });
  await settle();
};

describe("OtpInput enhancer", () => {
  it("enhances an authored root, once", () => {
    const root = mount();
    expect(mountOtpInput(root)).toBe(1);
    expect(mountOtpInput(root)).toBe(0);
  });

  it("gives each segment the accessible name its own itemLabel pattern produces", () => {
    const root = mount({ count: 4 });
    mountOtpInput(root);
    expect(segmentsOf(root).map((segment) => segment.getAttribute("aria-label"))).toEqual([
      "Code 1 of 4",
      "Code 2 of 4",
      "Code 3 of 4",
      "Code 4 of 4",
    ]);
  });

  it("advances focus as each segment fills, and reports every change", async () => {
    const root = mount({ count: 3 });
    mountOtpInput(root);
    const onEvent = vi.fn();
    document.body.addEventListener("sk:otpinputvaluechange", onEvent);
    const segments = segmentsOf(root);

    await type(segments[0], "1");
    expect(document.activeElement).toBe(segments[1]);
    expect(onEvent.mock.lastCall?.[0].detail).toEqual({ value: "1" });
  });

  it("fires valueComplete once, exactly when the last segment fills, and writes the hidden input", async () => {
    const root = mount({ count: 4 });
    mountOtpInput(root);
    const onComplete = vi.fn();
    document.body.addEventListener("sk:otpinputvaluecomplete", onComplete);
    const segments = segmentsOf(root);

    for (const [index, char] of ["1", "2", "3"].entries()) await type(segments[index], char);
    expect(onComplete).not.toHaveBeenCalled();

    await type(segments[3], "4");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.lastCall?.[0].detail).toEqual({ value: "1234" });

    const hidden = root.querySelector<HTMLInputElement>("[data-sk-otp-input-hidden]");
    expect(hidden?.value).toBe("1234");
  });

  it("spreads a pasted code across every segment at once", async () => {
    const root = mount({ count: 4 });
    mountOtpInput(root);
    const onComplete = vi.fn();
    document.body.addEventListener("sk:otpinputvaluecomplete", onComplete);
    const segments = segmentsOf(root);

    fireEvent.focusIn(segments[0]);
    await settle();
    fireEvent.paste(segments[0], { clipboardData: { getData: () => "9876" } });
    await settle();

    expect(segments.map((segment) => segment.value)).toEqual(["9", "8", "7", "6"]);
    expect(onComplete.mock.lastCall?.[0].detail).toEqual({ value: "9876" });
  });

  it("clears the focused segment on backspace", async () => {
    const root = mount({ count: 4 });
    mountOtpInput(root);
    const segments = segmentsOf(root);

    fireEvent.focusIn(segments[0]);
    await settle();
    fireEvent.paste(segments[0], { clipboardData: { getData: () => "9876" } });
    await settle();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Backspace" });
    await settle();
    expect(segments.map((segment) => segment.value).join("")).toBe("876");
  });

  it("starts pre-filled from data-default-value", () => {
    const root = mount({ count: 4, defaultValue: "1234" });
    mountOtpInput(root);
    expect(segmentsOf(root).map((segment) => segment.value)).toEqual(["1", "2", "3", "4"]);
  });

  it("masks each segment like a password field", () => {
    const root = mount({ count: 4, mask: true });
    mountOtpInput(root);
    const segments = root.querySelectorAll<HTMLInputElement>("[data-sk-otp-input-segment]");
    expect(segments).toHaveLength(4);
    for (const segment of segments) expect(segment.type).toBe("password");
  });

  it("sets autocomplete=one-time-code by default, for SMS autofill", () => {
    const root = mount({ count: 4 });
    mountOtpInput(root);
    for (const segment of segmentsOf(root)) expect(segment.autocomplete).toBe("one-time-code");
  });

  it("turns autocomplete off when data-otp is explicitly false", () => {
    document.body.innerHTML = `<div class="sk-otp-input" data-sk-otp-input data-otp="false" data-name="code">
      <label class="sk-otp-input__label" data-sk-otp-input-label>Code</label>
      <div class="sk-otp-input__control" data-sk-otp-input-control>${Array.from({ length: 4 }, () => `<input class="sk-otp-input__segment sk-interactive" data-sk-otp-input-segment type="text" autocomplete="off">`).join("")}</div>
      <input class="sk-otp-input__hidden" data-sk-otp-input-hidden data-name="code" type="text" aria-hidden="true" tabindex="-1">
    </div>`;
    const root = document.body.firstElementChild as HTMLElement;
    mountOtpInput(root);
    for (const segment of segmentsOf(root)) expect(segment.autocomplete).toBe("off");
  });

  it("reports a pasted value that does not match the numeric type", async () => {
    const root = mount({ count: 4 });
    mountOtpInput(root);
    const onInvalid = vi.fn();
    document.body.addEventListener("sk:otpinputinvalid", onInvalid);
    const segments = segmentsOf(root);

    fireEvent.focusIn(segments[0]);
    await settle();
    fireEvent.paste(segments[0], { clipboardData: { getData: () => "abcd" } });
    await settle();

    expect(onInvalid.mock.lastCall?.[0].detail).toEqual({ char: "abcd", index: 0 });
    expect(segments.every((segment) => segment.value === "")).toBe(true);
  });

  it("leaves an incomplete root's attributes untouched, the all-or-nothing rule", () => {
    /*
     * The mount COUNT still reports 1: the Svelte instance attaches to the matched root regardless
     * (the same accounting `NumberField`/`Rating`'s own comment describes). What "all or nothing"
     * promises is that with no label, no segments and no hidden input, NOTHING gets patched: the
     * control never gains Zag's own `data-scope`/`data-part` markers.
     */
    document.body.innerHTML = `<div class="sk-otp-input" data-sk-otp-input>
      <div class="sk-otp-input__control" data-sk-otp-input-control></div>
    </div>`;
    const root = document.body.firstElementChild as HTMLElement;
    const control = root.querySelector("[data-sk-otp-input-control]");

    expect(mountOtpInput(root)).toBe(1);
    expect(root.hasAttribute("data-scope")).toBe(false);
    expect(control?.hasAttribute("data-part")).toBe(false);
  });
});
