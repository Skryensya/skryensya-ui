import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./tooltip.js";

describe("Tooltip", () => {
  it("describes the trigger rather than naming it", async () => {
    const ui = render(
      <Tooltip content="Elimina y no se puede deshacer" openDelay={0}>
        <button aria-label="Eliminar" type="button" />
      </Tooltip>,
    );

    const trigger = ui.getByLabelText("Eliminar").parentElement as HTMLElement;
    expect(trigger.getAttribute("aria-describedby")).toBeNull();

    fireEvent.pointerMove(trigger, { pointerType: "mouse" });

    // The name still comes from the control's own aria-label; the tooltip only adds a description.
    const tip = await ui.findByRole("tooltip");
    expect(tip.textContent).toBe("Elimina y no se puede deshacer");
    await waitFor(() => expect(trigger.getAttribute("aria-describedby")).toBe(tip.id));
    expect(ui.getByLabelText("Eliminar")).toBeTruthy();
  });

  it("stays closed while disabled", () => {
    const ui = render(
      <Tooltip content="No debería verse" disabled openDelay={0}>
        <button aria-label="Eliminar" type="button" />
      </Tooltip>,
    );

    fireEvent.pointerMove(ui.getByLabelText("Eliminar").parentElement as HTMLElement, {
      pointerType: "mouse",
    });

    expect(ui.queryByRole("tooltip")).toBeNull();
  });
});
