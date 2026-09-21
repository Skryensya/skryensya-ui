import { fireEvent, render, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "./otp-input.js";

/*
 * `@zag-js/pin-input` requires a real state transition (idle → focused) before it accepts a
 * change, paste or keystroke: `fireEvent.focus` alone is not enough, and its own commit lands a
 * frame or two later. `raf + raf + setTimeout(0)` is the same settle this repo's own memory
 * documents for other Zag machines (`menu-test-suite-dismissable-timing`), confirmed here by
 * probing the machine directly rather than assumed.
 */
const settle = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0))));

const inside = (result: ReturnType<typeof render>) => within(result.container);

const type = async (input: HTMLInputElement, char: string) => {
  fireEvent.focus(input);
  await settle();
  fireEvent.input(input, { target: { value: char }, inputType: "insertText" });
  await settle();
};

describe("OtpInput", () => {
  it("renders one segment per count, each with its own accessible name", () => {
    const ui = render(<OtpInput count={4} label="Code" name="code" />);
    const segments = inside(ui).getAllByRole("textbox");

    expect(segments).toHaveLength(4);
    expect(segments.map((segment) => segment.getAttribute("aria-label"))).toEqual([
      "Code 1 of 4",
      "Code 2 of 4",
      "Code 3 of 4",
      "Code 4 of 4",
    ]);
  });

  it("uses six segments when count is not given", () => {
    const ui = render(<OtpInput label="Code" name="code" />);
    expect(inside(ui).getAllByRole("textbox")).toHaveLength(6);
  });

  it("advances focus as each segment fills, and reports every change", async () => {
    const onChange = vi.fn();
    const ui = render(<OtpInput count={3} label="Code" name="code" onValueChange={onChange} />);
    const segments = inside(ui).getAllByRole("textbox") as HTMLInputElement[];

    await type(segments[0], "1");
    expect(document.activeElement).toBe(segments[1]);
    expect(onChange).toHaveBeenLastCalledWith({ value: "1" });

    await type(segments[1], "2");
    expect(document.activeElement).toBe(segments[2]);
    expect(onChange).toHaveBeenLastCalledWith({ value: "12" });
  });

  it("fires valueComplete once, exactly when the last segment fills, and writes the hidden input", async () => {
    const onComplete = vi.fn();
    const onEvent = vi.fn();
    const ui = render(<OtpInput count={4} label="Code" name="code" onValueComplete={onComplete} />);
    ui.container.addEventListener("sk:otpinputvaluecomplete", onEvent);
    const segments = inside(ui).getAllByRole("textbox") as HTMLInputElement[];

    for (const [index, char] of ["1", "2", "3"].entries()) await type(segments[index], char);
    expect(onComplete).not.toHaveBeenCalled();

    await type(segments[3], "4");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ value: "1234" });
    expect(onEvent.mock.lastCall?.[0].detail).toEqual({ value: "1234" });

    const hidden = ui.container.querySelector<HTMLInputElement>('input[name="code"]');
    expect(hidden?.value).toBe("1234");
  });

  it("spreads a pasted code across every segment at once", async () => {
    const onComplete = vi.fn();
    const ui = render(<OtpInput count={4} label="Code" name="code" onValueComplete={onComplete} />);
    const segments = inside(ui).getAllByRole("textbox") as HTMLInputElement[];

    fireEvent.focus(segments[0]);
    await settle();
    fireEvent.paste(segments[0], { clipboardData: { getData: () => "9876" } });
    await settle();

    expect(segments.map((segment) => segment.value)).toEqual(["9", "8", "7", "6"]);
    expect(onComplete).toHaveBeenCalledWith({ value: "9876" });
  });

  it("clears the focused segment on backspace", async () => {
    const ui = render(<OtpInput count={4} label="Code" name="code" />);
    const segments = inside(ui).getAllByRole("textbox") as HTMLInputElement[];

    fireEvent.focus(segments[0]);
    await settle();
    fireEvent.paste(segments[0], { clipboardData: { getData: () => "9876" } });
    await settle();

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Backspace" });
    await settle();
    expect(segments.map((segment) => segment.value).join("")).toBe("876");
  });

  it("starts pre-filled from defaultValue", () => {
    const ui = render(<OtpInput count={4} defaultValue="1234" label="Code" name="code" />);
    const segments = inside(ui).getAllByRole("textbox") as HTMLInputElement[];
    expect(segments.map((segment) => segment.value)).toEqual(["1", "2", "3", "4"]);
  });

  it("masks each segment like a password field", () => {
    /* Not getAllByRole: a password input carries no implicit ARIA role, so the query itself is
       the thing under test here. */
    const ui = render(<OtpInput count={4} label="Code" mask name="code" />);
    const segments = ui.container.querySelectorAll<HTMLInputElement>("input[data-index]");
    expect(segments).toHaveLength(4);
    for (const segment of segments) expect(segment.type).toBe("password");
  });

  it("sets autocomplete=one-time-code by default, for SMS autofill", () => {
    const ui = render(<OtpInput count={4} label="Code" name="code" />);
    for (const segment of inside(ui).getAllByRole("textbox") as HTMLInputElement[]) {
      expect(segment.autocomplete).toBe("one-time-code");
    }
  });

  it("turns autocomplete off when otp is disabled", () => {
    const ui = render(<OtpInput count={4} label="Code" name="code" otp={false} />);
    for (const segment of inside(ui).getAllByRole("textbox") as HTMLInputElement[]) {
      expect(segment.autocomplete).toBe("off");
    }
  });

  it("reports a pasted value that does not match the numeric type", async () => {
    const onInvalid = vi.fn();
    const onEvent = vi.fn();
    const ui = render(<OtpInput count={4} label="Code" name="code" onValueInvalid={onInvalid} />);
    ui.container.addEventListener("sk:otpinputinvalid", onEvent);
    const segments = inside(ui).getAllByRole("textbox") as HTMLInputElement[];

    fireEvent.focus(segments[0]);
    await settle();
    fireEvent.paste(segments[0], { clipboardData: { getData: () => "abcd" } });
    await settle();

    expect(onInvalid).toHaveBeenCalledWith({ char: "abcd", index: 0 });
    expect(onEvent.mock.lastCall?.[0].detail).toEqual({ char: "abcd", index: 0 });
    /* Rejected, not partially accepted: nothing landed in any segment. */
    expect(segments.every((segment) => segment.value === "")).toBe(true);
  });

  it("has no accessibility violations", async () => {
    const ui = render(<OtpInput count={6} hint="Sent to your phone" label="Verification code" name="code" />);
    const results = await axe.run(ui.container);
    expect(results.violations).toEqual([]);
  });
});
