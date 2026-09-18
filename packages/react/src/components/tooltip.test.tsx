import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tooltip } from "./tooltip.js";

describe("Tooltip", () => {
  it("describes the trigger rather than naming it", async () => {
    const ui = render(
      <Tooltip content="Elimina y no se puede deshacer" openDelay={0}>
        <button aria-label="Delete" type="button" />
      </Tooltip>,
    );

    const trigger = ui.getByLabelText("Delete").parentElement as HTMLElement;
    expect(trigger.getAttribute("aria-describedby")).toBeNull();

    fireEvent.pointerMove(trigger, { pointerType: "mouse" });

    // The name still comes from the control's own aria-label; the tooltip only adds a description.
    const tip = await ui.findByRole("tooltip");
    expect(tip.textContent).toBe("Elimina y no se puede deshacer");
    await waitFor(() => expect(trigger.getAttribute("aria-describedby")).toBe(tip.id));
    expect(ui.getByLabelText("Delete")).toBeTruthy();
  });

  it("stays closed while disabled", () => {
    const ui = render(
      <Tooltip content="No debería verse" disabled openDelay={0}>
        <button aria-label="Delete" type="button" />
      </Tooltip>,
    );

    fireEvent.pointerMove(ui.getByLabelText("Delete").parentElement as HTMLElement, {
      pointerType: "mouse",
    });

    expect(ui.queryByRole("tooltip")).toBeNull();
  });

  it("dispatches sk:tooltipopenchange on the root when open state changes", async () => {
    const onOpenChange = vi.fn();
    const ui = render(
      <Tooltip content="Pista" openDelay={0} onOpenChange={onOpenChange}>
        <button aria-label="Ayuda" type="button" />
      </Tooltip>,
    );
    const root = ui.container.querySelector(".sk-tooltip")!;
    expect(root.hasAttribute("data-sk-anchor")).toBe(true);
    const seen: boolean[] = [];
    root.addEventListener("sk:tooltipopenchange", ((event: CustomEvent<{ open: boolean }>) => {
      seen.push(event.detail.open);
    }) as EventListener);

    fireEvent.pointerMove(ui.getByLabelText("Ayuda").parentElement as HTMLElement, {
      pointerType: "mouse",
    });
    await ui.findByRole("tooltip");
    await waitFor(() => expect(seen).toContain(true));
    expect(onOpenChange).toHaveBeenCalled();
  });
});
