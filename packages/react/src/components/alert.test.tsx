import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./alert.js";

describe("Alert", () => {
  it("announces danger assertively and everything else politely", () => {
    const plain = render(<Alert>Heads up</Alert>);
    expect(plain.getByRole("status").getAttribute("data-tone")).toBe("neutral");
    expect(plain.getByRole("status").getAttribute("aria-live")).toBe("polite");
    plain.unmount();

    const info = render(<Alert tone="info">Heads up</Alert>);
    expect(info.getByRole("status").getAttribute("aria-live")).toBe("polite");
    info.unmount();

    const danger = render(<Alert tone="danger">Broke</Alert>);
    expect(danger.getByRole("alert").getAttribute("aria-live")).toBe("assertive");
    danger.unmount();
  });

  it("renders a dismiss control only when onDismiss is given", () => {
    const onDismiss = vi.fn();
    const ui = render(<Alert onDismiss={onDismiss} title="Saved" tone="success">Done</Alert>);
    fireEvent.click(ui.getByLabelText("Dismiss alert"));
    expect(onDismiss).toHaveBeenCalledOnce();

    const plain = render(<Alert>No button</Alert>);
    expect(plain.container.querySelector(".sk-alert__dismiss")).toBeNull();
  });

  /*
   * Whether the control EXISTS is the contract's, what it does is the binding's — the split Tag and
   * Toast make, and the reason a composition written as data can say "dismissible" at all: a handler
   * is not something data can carry.
   */
  it("draws the dismiss from `dismissible` alone, under the name it is given", () => {
    const ui = render(
      <Alert dismissible dismissLabel="Cerrar alerta" title="Mantenimiento">
        Solo lectura
      </Alert>,
    );

    const alert = ui.getByRole("status");
    expect(alert.getAttribute("data-dismissible")).toBe("");
    expect(alert.querySelector(".sk-alert__dismiss")).not.toBeNull();
    expect(ui.getByLabelText("Cerrar alerta")).not.toBeNull();
  });

  it("renders presentations and optional actions through explicit parts", () => {
    const ui = render(
      <Alert actions={<a href="/billing">Review plan</a>} icon="!" presentation="accent" title="Plan expires" tone="warning">
        Renew before Friday.
      </Alert>,
    );

    const alert = ui.getByRole("status");
    expect(alert.getAttribute("data-presentation")).toBe("accent");
    expect(alert.querySelector(".sk-alert__icon")).not.toBeNull();
    expect(alert.querySelector(".sk-alert__actions")?.textContent).toContain("Review plan");
  });
});
