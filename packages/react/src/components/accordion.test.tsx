import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./accordion.js";

const items = (
  <>
    <Accordion.Item value="runtime"><Accordion.Trigger>Runtime</Accordion.Trigger><Accordion.Content>Node 22</Accordion.Content></Accordion.Item>
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
    expect(item?.classList).toContain("sk-tile--expandable");
    expect(item?.classList).toContain("sk-tile--interactive");


    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });
});
