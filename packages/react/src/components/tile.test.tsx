import { render, fireEvent, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  tileSharedAccessibilityContract,
  tileSharedStateContract,
  type TileSharedAccessibilityBehavior,
  type TileSharedStateBehavior,
} from "@skryensya/core/tile-contracts";
import { ExpandableTile, TileButton, TileCheckbox, TileLink, TileRadioGroup, TileSwitch } from "./tile.js";

describe("Tile React contracts", () => {
  const stateAssertions = {
    checkbox: async () => {
      const ui = render(<TileCheckbox defaultChecked={false}>Alerts</TileCheckbox>);
      const input = ui.getByRole("checkbox") as HTMLInputElement;
      const root = input.closest<HTMLElement>("[data-scope=tile]");
      expect(root?.querySelector(".sk-checkbox__control")?.classList.contains("sk-interactive")).toBe(true);
      expect(root?.querySelectorAll(".sk-checkbox__indicator .sk-icon")).toHaveLength(2);
      expect(root?.querySelector(".sk-tile__selection-indicator")).toBeNull();
      expect(root?.dataset.state).toBe(tileSharedStateContract.checkbox.initial.dataState);
      expect(input.checked).toBe(tileSharedStateContract.checkbox.initial.checked);

      fireEvent.click(input);
      await waitFor(() => {
        expect(root?.dataset.state).toBe(tileSharedStateContract.checkbox.changed.dataState);
        expect(input.checked).toBe(tileSharedStateContract.checkbox.changed.checked);
      });
    },
    switch: async () => {
      const ui = render(<TileSwitch defaultChecked={false}>Auto-deploy</TileSwitch>);
      const input = ui.getByRole("switch") as HTMLInputElement;
      const root = input.closest<HTMLElement>("[data-scope=tile]");
      expect(root?.querySelector(".sk-switch__control")).not.toBeNull();
      expect(root?.querySelector(".sk-checkbox__control")).toBeNull();
      expect(root?.dataset.state).toBe(tileSharedStateContract.switch.initial.dataState);
      expect(input.checked).toBe(tileSharedStateContract.switch.initial.checked);

      fireEvent.click(input);
      await waitFor(() => {
        expect(root?.dataset.state).toBe(tileSharedStateContract.switch.changed.dataState);
        expect(input.checked).toBe(tileSharedStateContract.switch.changed.checked);
      });
    },
    radioGroup: async () => {
      const ui = render(
        <TileRadioGroup name="plan" defaultValue="basic" items={[{ value: "basic", children: "Basic" }, { value: "pro", children: "Pro" }]} />,
      );
      const basic = ui.getByRole("radio", { name: "Basic" }) as HTMLInputElement;
      const pro = ui.getByRole("radio", { name: "Pro" }) as HTMLInputElement;
      const basicItem = basic.closest<HTMLElement>("[data-part=item]");
      const proItem = pro.closest<HTMLElement>("[data-part=item]");
      expect(basic.value).toBe(tileSharedStateContract.radioGroup.initial.selectedValue);
      expect(basicItem?.dataset.state).toBe(tileSharedStateContract.radioGroup.initial.selectedState);
      expect(proItem?.dataset.state).toBe(tileSharedStateContract.radioGroup.initial.unselectedState);

      fireEvent.click(pro);
      await waitFor(() => {
        expect(pro.value).toBe(tileSharedStateContract.radioGroup.changed.selectedValue);
        expect(proItem?.dataset.state).toBe(tileSharedStateContract.radioGroup.changed.selectedState);
        expect(basicItem?.dataset.state).toBe(tileSharedStateContract.radioGroup.changed.unselectedState);
      });
    },
    expandable: async () => {
      const ui = render(
        <ExpandableTile defaultOpen={false}>
          <ExpandableTile.Trigger>Summary</ExpandableTile.Trigger>
          <ExpandableTile.Content>Details</ExpandableTile.Content>
        </ExpandableTile>,
      );
      const trigger = ui.getByRole("button", { name: "Summary" });
      const content = ui.getByText("Details");
      const root = trigger.closest<HTMLElement>("[data-scope=tile]");
      expect(root?.dataset.state).toBe(tileSharedStateContract.expandable.initial.dataState);
      expect(trigger.getAttribute("aria-expanded")).toBe(tileSharedStateContract.expandable.initial.expanded);
      expect(content.hidden).toBe(tileSharedStateContract.expandable.initial.contentHidden);

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(root?.dataset.state).toBe(tileSharedStateContract.expandable.changed.dataState);
        expect(trigger.getAttribute("aria-expanded")).toBe(tileSharedStateContract.expandable.changed.expanded);
        expect(content.hidden).toBe(tileSharedStateContract.expandable.changed.contentHidden);
      });
    },
  } satisfies Record<TileSharedStateBehavior, () => void | Promise<void>>;

  const accessibilityAssertions = {
    link: () => {
      const ui = render(<TileLink href="/details">Details</TileLink>);
      expect(ui.getByRole(tileSharedAccessibilityContract.link.role)).toBeInstanceOf(HTMLAnchorElement);
    },
    button: () => {
      const ui = render(<TileButton disabled>Run</TileButton>);
      const button = ui.getByRole(tileSharedAccessibilityContract.button.role) as HTMLButtonElement;
      expect(button.disabled).toBe(tileSharedAccessibilityContract.button.disabled);
    },
    checkbox: () => {
      const ui = render(<form><TileCheckbox name="alerts" value="email">Alerts</TileCheckbox></form>);
      const input = ui.getByRole(tileSharedAccessibilityContract.checkbox.role) as HTMLInputElement;
      expect(input.form !== null).toBe(tileSharedAccessibilityContract.checkbox.formAssociated);
    },
    switch: () => {
      const ui = render(<form><TileSwitch name="auto-deploy" value="on">Auto-deploy</TileSwitch></form>);
      const input = ui.getByRole(tileSharedAccessibilityContract.switch.role) as HTMLInputElement;
      expect(input.form !== null).toBe(tileSharedAccessibilityContract.switch.formAssociated);
    },
    radioGroup: () => {
      const ui = render(<form><TileRadioGroup name="plan" items={[{ value: "basic", children: "Basic" }]} /></form>);
      const group = ui.getByRole(tileSharedAccessibilityContract.radioGroup.role);
      expect(group.getAttribute("aria-orientation")).toBe(tileSharedAccessibilityContract.radioGroup.orientation);
      expect((ui.getByRole("radio") as HTMLInputElement).form !== null).toBe(tileSharedAccessibilityContract.radioGroup.formAssociated);
    },
    expandable: () => {
      const ui = render(
        <ExpandableTile defaultOpen={false}>
          <ExpandableTile.Trigger>Summary</ExpandableTile.Trigger>
          <ExpandableTile.Content>Details</ExpandableTile.Content>
        </ExpandableTile>,
      );
      const trigger = ui.getByRole(tileSharedAccessibilityContract.expandable.triggerRole);
      expect(trigger.getAttribute("aria-expanded")).toBe(tileSharedAccessibilityContract.expandable.expanded);
      expect(ui.getByText("Details").hidden).toBe(tileSharedAccessibilityContract.expandable.contentHidden);
    },
  } satisfies Record<TileSharedAccessibilityBehavior, () => void>;

  for (const [behavior, assertBehavior] of Object.entries(stateAssertions)) {
    it(`satisfies the core shared ${behavior} state contract`, assertBehavior);
  }

  for (const [behavior, assertBehavior] of Object.entries(accessibilityAssertions)) {
    it(`satisfies the core shared ${behavior} accessibility contract`, assertBehavior);
  }

  it("renders every React Tile root with an explicit interactive or disclosure variant", () => {
    const ui = render(
      <>
        <TileLink href="/details">Link</TileLink>
        <TileButton>Button</TileButton>
        <TileCheckbox>Checkbox</TileCheckbox>
        <TileSwitch>Switch</TileSwitch>
        <TileRadioGroup items={[{ value: "basic", children: "Basic" }]} name="plan" />
        <ExpandableTile><ExpandableTile.Trigger>Composition summary</ExpandableTile.Trigger><ExpandableTile.Content>Details</ExpandableTile.Content></ExpandableTile>
      </>,
    );

    const roots = [...ui.container.querySelectorAll<HTMLElement>(".sk-tile")];
    expect(roots).not.toHaveLength(0);
    expect(roots.every((root) => root.classList.contains("sk-tile--interactive") || root.classList.contains("sk-tile--expandable"))).toBe(true);
  });

  it("emits requested Tile padding while leaving the default inset implicit", () => {
    const ui = render(
      <>
        <TileLink href="/details" padding="none">Link</TileLink>
        <TileButton padding="xs">Button</TileButton>
        <TileCheckbox padding="sm">Checkbox</TileCheckbox>
        <TileRadioGroup padding="lg" items={[{ value: "basic", children: "Basic" }]} name="plan" />
        <ExpandableTile padding="xl"><ExpandableTile.Trigger>Summary</ExpandableTile.Trigger></ExpandableTile>
        <TileButton>Default</TileButton>
      </>,
    );

    expect(ui.getByRole("link").dataset.padding).toBe("none");
    expect(ui.getByRole("button", { name: "Button" }).dataset.padding).toBe("xs");
    expect(ui.getByRole("checkbox").closest<HTMLElement>(".sk-tile")?.dataset.padding).toBe("sm");
    expect(ui.getByRole("radio").closest<HTMLElement>(".sk-tile")?.dataset.padding).toBe("lg");
    expect(ui.getByText("Summary").closest<HTMLElement>(".sk-tile")?.dataset.padding).toBe("xl");
    expect(ui.getByRole("button", { name: "Default" }).dataset.padding).toBeUndefined();
  });

  it("supports uncontrolled checkbox changes", async () => {
    const onCheck = vi.fn();
    const ui = render(<TileCheckbox defaultChecked={false} onCheck={onCheck}>Alerts</TileCheckbox>);
    fireEvent.click(ui.getByText("Alerts"));
    await waitFor(() => expect(onCheck).toHaveBeenCalledWith({ checked: true }));
  });

  it("supports radio group value changes", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <TileRadioGroup
        name="plan"
        onValueChange={onValueChange}
        items={[{ value: "basic", children: "Basic" }, { value: "pro", children: "Pro" }]}
      />,
    );
    fireEvent.click(ui.getByRole("radio", { name: "Pro" }));
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith({ value: "pro" }));
  });

  it("supports ExpandableTile callbacks", async () => {
    const onOpenChange = vi.fn();
    const ui = render(
      <ExpandableTile defaultOpen={false} onOpenChange={onOpenChange}>
        <ExpandableTile.Trigger>Summary</ExpandableTile.Trigger>
        <ExpandableTile.Content>Details</ExpandableTile.Content>
      </ExpandableTile>,
    );
    fireEvent.click(ui.getByRole("button", { name: "Summary" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith({ open: true }));
  });

  it("puts the disclosure state layer on the Tile surface, not its trigger", () => {
    const ui = render(
      <ExpandableTile>
        <ExpandableTile.Trigger>Summary</ExpandableTile.Trigger>
        <ExpandableTile.Content>Details</ExpandableTile.Content>
      </ExpandableTile>,
    );
    const trigger = ui.getByRole("button", { name: "Summary" });
    const root = trigger.closest<HTMLElement>(".sk-tile");

    expect(root?.classList.contains("sk-interactive")).toBe(true);
    expect(trigger.classList.contains("sk-interactive")).toBe(false);
  });

  it("SSR hydrates without mounting Vanilla", () => {
    const html = renderToString(
      <ExpandableTile defaultOpen={false}>
        <ExpandableTile.Trigger>Summary</ExpandableTile.Trigger>
        <ExpandableTile.Content>Details</ExpandableTile.Content>
      </ExpandableTile>,
    );
    const container = document.createElement("div");
    container.innerHTML = html;
    expect(() => hydrateRoot(container, (
      <ExpandableTile defaultOpen={false}>
        <ExpandableTile.Trigger>Summary</ExpandableTile.Trigger>
        <ExpandableTile.Content>Details</ExpandableTile.Content>
      </ExpandableTile>
    ))).not.toThrow();
  });

  it("passes axe on the default button tile", async () => {
    const ui = render(<TileButton>Run deployment</TileButton>);
    const result = await axe.run(ui.container);
    expect(result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical")).toHaveLength(0);
  });
});
