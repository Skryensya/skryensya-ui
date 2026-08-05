import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Callout } from "./callout.js";

describe("Callout", () => {
  it("announces danger assertively and everything else politely", () => {
    const plain = render(<Callout>Heads up</Callout>);
    expect(plain.getByRole("status").getAttribute("data-tone")).toBe("neutral");
    expect(plain.getByRole("status").getAttribute("aria-live")).toBe("polite");
    plain.unmount();

    const info = render(<Callout tone="info">Heads up</Callout>);
    expect(info.getByRole("status").getAttribute("aria-live")).toBe("polite");
    info.unmount();

    const danger = render(<Callout tone="danger">Broke</Callout>);
    expect(danger.getByRole("alert").getAttribute("aria-live")).toBe("assertive");
    danger.unmount();
  });

  /*
   * Purely informational: no dismiss exists anywhere in the binding to test for, unlike Toast.
   */
  it("renders no dismiss control, ever", () => {
    const ui = render(<Callout title="Saved" tone="success">Done</Callout>);
    expect(ui.container.querySelector(".sk-callout__dismiss")).toBeNull();
    expect(ui.getByRole("status").hasAttribute("data-dismissible")).toBe(false);
  });

  it("renders an icon and optional actions through explicit parts", () => {
    const ui = render(
      <Callout actions={<a href="/billing">Review plan</a>} icon="!" title="Plan expires" tone="warning">
        Renew before Friday.
      </Callout>,
    );

    const callout = ui.getByRole("status");
    expect(callout.querySelector(".sk-callout__icon")).not.toBeNull();
    expect(callout.querySelector(".sk-callout__actions")?.textContent).toContain("Review plan");
  });
});
