import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { accordionEvents } from "@skryensya/core/accordion";
import { Accordion } from "./accordion.js";

const items = (
  <>
    <Accordion.Item value="runtime"><Accordion.Trigger>Runtime</Accordion.Trigger><Accordion.Content>Node 24</Accordion.Content></Accordion.Item>
    <Accordion.Item value="rollout"><Accordion.Trigger>Rollout</Accordion.Trigger><Accordion.Content>10%, then 100%</Accordion.Content></Accordion.Item>
  </>
);

describe("Accordion React contracts", () => {
  it("keeps exactly one item open in single mode", async () => {
    const onValueChange = vi.fn();
    const ui = render(<Accordion defaultValue="runtime" onValueChange={onValueChange}>{items}</Accordion>);
    const runtime = ui.getByRole("button", { name: "Runtime" });
    const rollout = ui.getByRole("button", { name: "Rollout" });

    fireEvent.click(rollout);

    await waitFor(() => {
      expect(runtime.getAttribute("aria-expanded")).toBe("false");
      expect(rollout.getAttribute("aria-expanded")).toBe("true");
      expect(onValueChange).toHaveBeenCalledWith({ value: "rollout" });
    });
  });

  it("allows independent open items in multiple mode", async () => {
    const ui = render(<Accordion type="multiple" defaultValue={["runtime"]}>{items}</Accordion>);
    const runtime = ui.getByRole("button", { name: "Runtime" });
    const rollout = ui.getByRole("button", { name: "Rollout" });

    fireEvent.click(rollout);

    await waitFor(() => {
      expect(runtime.getAttribute("aria-expanded")).toBe("true");
      expect(rollout.getAttribute("aria-expanded")).toBe("true");
    });
  });

  it("renders and closes a single Accordion item", async () => {
    const ui = render(
      <Accordion defaultValue="details">
        <Accordion.Item value="details"><Accordion.Trigger>Details</Accordion.Trigger><Accordion.Content>More detail</Accordion.Content></Accordion.Item>
      </Accordion>,
    );
    const trigger = ui.getByRole("button", { name: "Details" });
    const root = ui.container.firstElementChild;
    const item = trigger.closest(".sk-tile");

    expect(root?.classList).toContain("sk-accordion");
    expect(root?.hasAttribute("data-sk-accordion")).toBe(true);
    expect(item?.classList).toContain("sk-tile--expandable");
    // The state layer lives on the trigger, not the section: hovering the revealed content must
    // not tint it too.
    expect(item?.classList).not.toContain("sk-tile--interactive");
    expect(trigger.classList).toContain("sk-interactive");


    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("wraps each trigger in a heading so it is reachable by heading navigation", () => {
    const ui = render(
      <Accordion defaultValue="runtime">
        <Accordion.Item value="runtime">
          <Accordion.Trigger>Runtime</Accordion.Trigger>
          <Accordion.Content>Node 24</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="rollout">
          <Accordion.Trigger headingLevel={4}>Rollout</Accordion.Trigger>
          <Accordion.Content>10%, then 100%</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    const trigger = ui.getByRole("button", { name: "Runtime" });
    const heading = ui.getByRole("heading", { name: "Runtime" });
    // Defaults to 3, the level the same sections use rendered as `<details>` elsewhere in the docs.
    expect(heading.getAttribute("aria-level")).toBe("3");
    expect(heading.classList).toContain("sk-accordion__trigger-heading");
    // The heading wraps the button; it does not replace it, and the button keeps its own role.
    expect(heading.contains(trigger)).toBe(true);

    expect(ui.getByRole("heading", { name: "Rollout" }).getAttribute("aria-level")).toBe("4");
  });

  it("honours a controlled value without inventing local open state", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <Accordion value="runtime" onValueChange={onValueChange}>
        {items}
      </Accordion>,
    );
    const rollout = ui.getByRole("button", { name: "Rollout" });
    expect(ui.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(rollout);
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith({ value: "rollout" });
    });
    // Still controlled by the prop: without a re-render from the parent, Runtime stays open.
    expect(ui.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");
    expect(rollout.getAttribute("aria-expanded")).toBe("false");
  });

  it("seeds open state from item defaultOpen when the root has no defaultValue", async () => {
    const ui = render(
      <Accordion>
        <Accordion.Item value="runtime">
          <Accordion.Trigger>Runtime</Accordion.Trigger>
          <Accordion.Content>Node 24</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item defaultOpen value="rollout">
          <Accordion.Trigger>Rollout</Accordion.Trigger>
          <Accordion.Content>10%</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    await waitFor(() => {
      expect(ui.getByRole("button", { name: "Rollout" }).getAttribute("aria-expanded")).toBe("true");
    });
    expect(ui.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("lets root defaultValue win over item defaultOpen", async () => {
    const ui = render(
      <Accordion defaultValue="runtime">
        <Accordion.Item value="runtime">
          <Accordion.Trigger>Runtime</Accordion.Trigger>
          <Accordion.Content>Node 24</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item defaultOpen value="rollout">
          <Accordion.Trigger>Rollout</Accordion.Trigger>
          <Accordion.Content>10%</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(ui.getByRole("button", { name: "Runtime" }).getAttribute("aria-expanded")).toBe("true");
    expect(ui.getByRole("button", { name: "Rollout" }).getAttribute("aria-expanded")).toBe("false");
  });

  it("clamps headingLevel to the 1..6 range aria-level means", () => {
    const ui = render(
      <Accordion>
        <Accordion.Item value="low">
          <Accordion.Trigger headingLevel={0}>Low</Accordion.Trigger>
          <Accordion.Content>a</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="high">
          <Accordion.Trigger headingLevel={9}>High</Accordion.Trigger>
          <Accordion.Content>b</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    );

    expect(ui.getByRole("heading", { name: "Low" }).getAttribute("aria-level")).toBe("1");
    expect(ui.getByRole("heading", { name: "High" }).getAttribute("aria-level")).toBe("6");
  });

  it("dispatches the contract valueChange event on the root", async () => {
    const onEvent = vi.fn();
    const ui = render(<Accordion defaultValue="runtime">{items}</Accordion>);
    ui.container.firstElementChild?.addEventListener(accordionEvents.valueChange, onEvent);

    fireEvent.click(ui.getByRole("button", { name: "Rollout" }));
    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledOnce();
      expect(onEvent.mock.calls[0]![0]).toMatchObject({
        type: accordionEvents.valueChange,
        detail: { value: "rollout" },
      });
    });
  });
});
