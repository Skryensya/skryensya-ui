import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, RadioGroup, Switch } from "./selection.js";

describe("selection controls", () => {
  it("keeps Checkbox native while exposing indeterminate state", () => {
    const onCheckedChange = vi.fn();
    const ui = render(<Checkbox defaultChecked="indeterminate" onCheckedChange={onCheckedChange}>Archive</Checkbox>);
    const checkbox = ui.getByRole("checkbox", { name: "Archive" }) as HTMLInputElement;

    expect(checkbox.indeterminate).toBe(true);
    expect(ui.container.querySelector(".sk-checkbox__control")?.classList.contains("sk-interactive")).toBe(true);
    expect(ui.container.querySelector(".sk-checkbox")?.classList.contains("sk-interactive")).toBe(false);
    expect(ui.container.querySelectorAll(".sk-checkbox__indicator .sk-icon")).toHaveLength(2);
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith({ checked: true });
  });

  it("accepts the contract's boolean spelling for an uncontrolled indeterminate checkbox", () => {
    const ui = render(<Checkbox defaultIndeterminate>Archive</Checkbox>);
    const checkbox = ui.getByRole("checkbox", { name: "Archive" }) as HTMLInputElement;

    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox.checked).toBe(false);
  });

  it("lets the browser own uncontrolled RadioGroup selection and reports it", () => {
    const onValueChange = vi.fn();
    const ui = render(
      <RadioGroup defaultValue="pro" items={[{ value: "basic", label: "Basic" }, { value: "pro", label: "Pro" }]} name="plan" onValueChange={onValueChange} />,
    );
    const pro = ui.getByRole("radio", { name: "Pro" }) as HTMLInputElement;
    const basic = ui.getByRole("radio", { name: "Basic" }) as HTMLInputElement;

    expect(pro.checked).toBe(true);
    fireEvent.click(basic);
    expect(onValueChange).toHaveBeenCalledWith({ value: "basic" });
    expect(basic.checked).toBe(true);
  });

  it("renders Switch as a native checkbox with switch semantics", () => {
    const onCheckedChange = vi.fn();
    const ui = render(<Switch defaultChecked onCheckedChange={onCheckedChange}>Deploy automatically</Switch>);
    const control = ui.getByRole("switch", { name: "Deploy automatically" }) as HTMLInputElement;

    expect(control.checked).toBe(true);
    fireEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith({ checked: false });
  });
});
