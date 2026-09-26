import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PasswordInput } from "./password-input.js";

/*
 * Zag's toggle listens to `pointerdown` only, and `isLeftClick` needs `button: 0` explicitly: jsdom's
 * synthetic PointerEvent leaves it undefined. A keyboard press arrives as a `click` with `detail: 0`.
 */
const pointerPress = (trigger: HTMLElement) => fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
const keyboardPress = (trigger: HTMLElement) => fireEvent.click(trigger, { detail: 0 });

const field = (ui: ReturnType<typeof render>) => ui.getByLabelText("Password") as HTMLInputElement;

describe("PasswordInput (React)", () => {
  it("starts hidden, names the toggle for what it will do, and asks for a saved password", () => {
    const ui = render(<PasswordInput label="Password" />);
    expect(field(ui).type).toBe("password");
    expect(field(ui).autocomplete).toBe("current-password");
    const trigger = ui.getByRole("button", { name: "Show password" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("reveals and hides again from a pointer, renaming the toggle each time", async () => {
    const onVisibilityChange = vi.fn();
    const ui = render(<PasswordInput label="Password" onVisibilityChange={onVisibilityChange} />);
    pointerPress(ui.getByRole("button", { name: "Show password" }));
    await waitFor(() => expect(field(ui).type).toBe("text"));
    expect(onVisibilityChange).toHaveBeenLastCalledWith({ visible: true });

    pointerPress(ui.getByRole("button", { name: "Hide password" }));
    await waitFor(() => expect(field(ui).type).toBe("password"));
  });

  /* The part that is ours: Zag's toggle is unreachable and inert from the keyboard. */
  it("is a tab stop and toggles from the keyboard", async () => {
    const ui = render(<PasswordInput label="Password" />);
    const trigger = ui.getByRole("button", { name: "Show password" });
    expect(trigger.tabIndex).toBe(0);
    keyboardPress(trigger);
    await waitFor(() => expect(field(ui).type).toBe("text"));
  });

  it("does not count a pointer click twice: pointerdown toggles, the click after it does not", async () => {
    const ui = render(<PasswordInput label="Password" />);
    const trigger = ui.getByRole("button", { name: "Show password" });
    pointerPress(trigger);
    fireEvent.click(trigger, { detail: 1 });
    await waitFor(() => expect(field(ui).type).toBe("text"));
  });

  it("offers to generate a password for a new one, and can opt out of password managers", () => {
    const ui = render(<PasswordInput autoComplete="new-password" ignorePasswordManagers label="Password" />);
    expect(field(ui).autocomplete).toBe("new-password");
    expect(field(ui).getAttribute("data-1p-ignore")).toBe("");
  });

  it("dispatches sk:passwordinputvisibilitychange on the root for DOM parity with vanilla", async () => {
    const onDom = vi.fn();
    const ui = render(<PasswordInput label="Password" />);
    ui.container.querySelector("[data-sk-password-input]")!.addEventListener("sk:passwordinputvisibilitychange", onDom);
    pointerPress(ui.getByRole("button", { name: "Show password" }));
    await waitFor(() => expect(onDom).toHaveBeenCalled());
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({ visible: true });
  });

  it("stamps data-invalid, describes the hint, and will not reveal a disabled field", () => {
    const ui = render(<PasswordInput disabled hint="At least 12 characters" invalid label="Password" />);
    const root = ui.container.querySelector("[data-sk-password-input]")!;
    expect(root.hasAttribute("data-invalid")).toBe(true);
    expect(field(ui).getAttribute("aria-invalid")).toBe("true");
    expect(field(ui).getAttribute("aria-describedby")).toContain(ui.getByText("At least 12 characters").id);
    keyboardPress(ui.getByRole("button", { name: "Show password" }));
    expect(field(ui).type).toBe("password");
  });
});
