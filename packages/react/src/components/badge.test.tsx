import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./avatar.js";
import { Badge, BadgeDot, BadgeHolder } from "./badge.js";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

describe("Badge", () => {
  it("renders its accessible label and forwards semantic attributes", () => {
    const ui = render(
      <Badge aria-label="3 unread messages" size="sm" tone="accent">
        3
      </Badge>,
    );
    const badge = ui.getByLabelText("3 unread messages");

    expect(badge.tagName).toBe("SPAN");
    expect(badge.textContent).toBe("3");
    expect(badge.getAttribute("data-tone")).toBe("accent");
    expect(badge.getAttribute("data-size")).toBe("sm");
  });

  it("anchors an accessible status dot without adding visible content", () => {
    const ui = render(
      <BadgeHolder>
        <Button aria-label="Settings" iconOnly variant="ghost">
          <Icon name="settings" />
        </Button>
        <BadgeDot label="Unread updates" pulse tone="danger" />
      </BadgeHolder>,
    );

    const dot = ui.getByRole("status", { name: "Unread updates" });
    expect(dot.hasAttribute("data-dot")).toBe(true);
    expect(dot.hasAttribute("data-pulse")).toBe(true);
    expect(dot.getAttribute("data-tone")).toBe("danger");
    expect(dot.parentElement?.classList).toContain("sk-badge-holder");
  });

  it("anchors a count pill on a control the same way as a dot", () => {
    const ui = render(
      <BadgeHolder>
        <Button aria-label="Menu" iconOnly variant="ghost">
          <Icon name="menu" />
        </Button>
        <Badge size="sm" tone="danger">
          9
        </Badge>
      </BadgeHolder>,
    );

    const pill = ui.getByText("9");
    expect(pill.className).toContain("sk-badge");
    expect(pill.getAttribute("data-size")).toBe("sm");
    expect(pill.parentElement?.classList).toContain("sk-badge-holder");
    expect(ui.getByRole("button", { name: "Menu" })).toBeTruthy();
  });

  it("anchors a presence dot on a photo avatar", () => {
    const ui = render(
      <BadgeHolder>
        <Avatar name="Ana Solís" src="/ana.jpg" />
        <BadgeDot label="Online" tone="success" />
      </BadgeHolder>,
    );

    expect(ui.getByRole("img", { name: "Ana Solís" })).toBeTruthy();
    expect(ui.getByRole("status", { name: "Online" }).parentElement?.classList).toContain(
      "sk-badge-holder",
    );
  });
});
