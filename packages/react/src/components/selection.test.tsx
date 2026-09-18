import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, CheckboxGroup, Radio, RadioGroup, Switch } from "./selection.js";

const permissions = [
  { value: "read", label: "Read", defaultChecked: true },
  { value: "write", label: "Write" },
  { value: "admin", label: "Admin" },
];

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

  it("seeds CheckboxGroup from the items' own defaults and derives the parent's three states", () => {
    const ui = render(<CheckboxGroup items={permissions} label="Permissions" name="permissions" />);
    const parent = ui.getByRole("checkbox", { name: "Permissions" }) as HTMLInputElement;

    // Some, not all, and said before anyone clicks: `defaultChecked` on an entry is what starts it.
    expect(parent.checked).toBe(false);
    expect(parent.indeterminate).toBe(true);

    fireEvent.click(ui.getByRole("checkbox", { name: "Write" }));
    fireEvent.click(ui.getByRole("checkbox", { name: "Admin" }));
    expect(parent.checked).toBe(true);
    expect(parent.indeterminate).toBe(false);
  });

  it("checks and unchecks every child from the parent, reporting values in the items' order", () => {
    const onValueChange = vi.fn();
    const onDom = vi.fn();
    const ui = render(
      <CheckboxGroup items={permissions} label="Permissions" name="permissions" onValueChange={onValueChange} />,
    );
    const root = ui.container.querySelector(".sk-checkbox-group")!;
    root.addEventListener("sk:checkboxgroupvaluechange", onDom);
    const parent = ui.getByRole("checkbox", { name: "Permissions" }) as HTMLInputElement;

    fireEvent.click(parent);
    expect(onValueChange).toHaveBeenLastCalledWith({ checked: true, value: ["read", "write", "admin"] });
    expect(onDom).toHaveBeenCalled();
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      checked: true,
      value: ["read", "write", "admin"],
    });

    fireEvent.click(parent);
    expect(onValueChange).toHaveBeenLastCalledWith({ checked: false, value: [] });
    expect((ui.getByRole("checkbox", { name: "Read" }) as HTMLInputElement).checked).toBe(false);
  });

  it("keeps a disabled CheckboxGroup child out of the parent's reading and out of its reach", () => {
    const ui = render(
      <CheckboxGroup
        items={[{ value: "read", label: "Read" }, { value: "admin", label: "Admin", disabled: true }]}
        label="Permissions"
        name="permissions"
      />,
    );
    const parent = ui.getByRole("checkbox", { name: "Permissions" }) as HTMLInputElement;

    fireEvent.click(parent);

    expect((ui.getByRole("checkbox", { name: "Read" }) as HTMLInputElement).checked).toBe(true);
    expect((ui.getByRole("checkbox", { name: "Admin" }) as HTMLInputElement).checked).toBe(false);
    // Every child anyone can reach is checked, so the parent says "all" rather than "some".
    expect(parent.checked).toBe(true);
    expect(parent.indeterminate).toBe(false);
  });

  it("lets a controlled CheckboxGroup refuse a change until the caller supplies the next value", () => {
    const onValueChange = vi.fn();
    const ui = render(
      <CheckboxGroup
        items={permissions}
        label="Permissions"
        name="permissions"
        onValueChange={onValueChange}
        value={["read"]}
      />,
    );

    fireEvent.click(ui.getByRole("checkbox", { name: "Write" }));

    expect(onValueChange).toHaveBeenCalledWith({ checked: "indeterminate", value: ["read", "write"] });
    expect((ui.getByRole("checkbox", { name: "Write" }) as HTMLInputElement).checked).toBe(false);
  });

  it("names the CheckboxGroup by the parent's own label", () => {
    const ui = render(<CheckboxGroup items={permissions} label="Permissions" name="permissions" />);

    expect(ui.getByRole("group", { name: "Permissions" })).toBeTruthy();
  });

  it("wires the parent's aria-controls to every child's own generated id", () => {
    const ui = render(<CheckboxGroup items={permissions} label="Permissions" name="permissions" />);
    const parent = ui.getByRole("checkbox", { name: "Permissions" }) as HTMLInputElement;
    const [read, write, admin] = permissions.map(
      (item) => ui.getByRole("checkbox", { name: item.label }) as HTMLInputElement,
    );

    expect(read!.id).not.toBe("");
    expect(new Set([read!.id, write!.id, admin!.id]).size).toBe(3);
    expect(parent.getAttribute("aria-controls")).toBe([read!.id, write!.id, admin!.id].join(" "));
  });

  it("lets the browser own uncontrolled RadioGroup selection and reports it", () => {
    const onValueChange = vi.fn();
    const ui = render(
      <RadioGroup
        defaultValue="pro"
        items={[{ value: "basic", label: "Basic" }, { value: "pro", label: "Pro" }]}
        label="Plan"
        name="plan"
        onValueChange={onValueChange}
      />,
    );
    const pro = ui.getByRole("radio", { name: "Pro" }) as HTMLInputElement;
    const basic = ui.getByRole("radio", { name: "Basic" }) as HTMLInputElement;

    expect(ui.getByRole("radiogroup", { name: "Plan" })).toBeTruthy();
    expect(pro.checked).toBe(true);
    fireEvent.click(basic);
    expect(onValueChange).toHaveBeenCalledWith({ value: "basic" });
    expect(basic.checked).toBe(true);
  });

  it("disables every radio when the group is disabled", () => {
    const ui = render(
      <RadioGroup
        disabled
        items={[{ value: "basic", label: "Basic" }, { value: "pro", label: "Pro", disabled: true }]}
        label="Plan"
        name="plan"
      />,
    );
    expect((ui.getByRole("radio", { name: "Basic" }) as HTMLInputElement).disabled).toBe(true);
    expect((ui.getByRole("radio", { name: "Pro" }) as HTMLInputElement).disabled).toBe(true);
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

describe("Radio (one on its own)", () => {
  it("is a radio whose group is its name, and takes a label only when given one", () => {
    const ui = render(
      <table>
        <tbody>
          <tr>
            <td><Radio aria-label="Easy to use: 1" name="easy" value="1" /></td>
            <td><Radio aria-label="Easy to use: 2" name="easy" value="2" /></td>
            <td><Radio name="fast" value="1">Fast</Radio></td>
          </tr>
        </tbody>
      </table>,
    );
    const [one, two, fast] = ui.getAllByRole("radio") as HTMLInputElement[];
    expect(one.name).toBe("easy");
    // No label element when none was given: in a matrix the row and column headers name the cell.
    expect(one.closest("label")!.querySelector(".sk-radio__label")).toBeNull();
    expect(fast.closest("label")!.querySelector(".sk-radio__label")!.textContent).toBe("Fast");

    // One answer per row, which is the browser's own doing: same name, one group.
    fireEvent.click(one);
    fireEvent.click(two);
    expect(one.checked).toBe(false);
    expect(two.checked).toBe(true);
    fireEvent.click(fast);
    expect(two.checked).toBe(true);
  });
});
