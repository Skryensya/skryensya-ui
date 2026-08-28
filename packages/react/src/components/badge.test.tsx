import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, BadgeDot, BadgeHolder } from "./badge.js";

describe("Badge", () => {
  it("renders its accessible label and forwards semantic attributes", () => {
    const ui = render(<Badge aria-label="3 unread messages" size="sm" tone="accent">3</Badge>);
    const badge = ui.getByLabelText("3 unread messages");

    expect(badge.tagName).toBe("SPAN");
    expect(badge.textContent).toBe("3");
    expect(badge.getAttribute("data-tone")).toBe("accent");
    expect(badge.getAttribute("data-size")).toBe("sm");
  });

  it("anchors an accessible status dot without adding visible content", () => {
    const ui = render(
      <BadgeHolder>
        <button type="button">Settings</button>
        <BadgeDot label="Unread updates" pulse tone="danger" />
      </BadgeHolder>,
    );

    const dot = ui.getByRole("status", { name: "Unread updates" });
    expect(dot.hasAttribute("data-dot")).toBe(true);
    expect(dot.hasAttribute("data-pulse")).toBe(true);
    expect(dot.getAttribute("data-tone")).toBe("danger");
    expect(dot.parentElement?.classList).toContain("sk-badge-holder");
  });
});
