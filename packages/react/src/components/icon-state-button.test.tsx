import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconStateButton } from "./icon-state-button.js";
import type { IconStateFace } from "@skryensya/core/icon-state-button";

const faces: readonly IconStateFace[] = [
  { name: "light", icon: "check" },
  { name: "dark", icon: "close" },
];

describe("IconStateButton (React)", () => {
  it("stacks every face as an icon and marks the current one active", () => {
    const ui = render(<IconStateButton faces={faces} current="dark" />);
    const button = ui.getByRole("button");
    const icons = button.querySelectorAll("[data-face]");

    expect(icons).toHaveLength(2);
    expect(icons[0]!.getAttribute("data-face")).toBe("light");
    expect(icons[0]!.hasAttribute("data-active")).toBe(false);
    expect(icons[1]!.getAttribute("data-face")).toBe("dark");
    expect(icons[1]!.getAttribute("data-active")).toBe("");
  });

  it("writes data-current on the button itself", () => {
    const ui = render(<IconStateButton faces={faces} current="light" />);
    expect(ui.getByRole("button").getAttribute("data-current")).toBe("light");
  });

  it("marks no face active when current is absent", () => {
    const ui = render(<IconStateButton faces={faces} />);
    const button = ui.getByRole("button");
    expect(button.hasAttribute("data-current")).toBe(false);
    for (const icon of button.querySelectorAll("[data-face]")) {
      expect(icon.hasAttribute("data-active")).toBe(false);
    }
  });

  it("forwards a click handler, same as any other button", () => {
    const onClick = vi.fn();
    const ui = render(<IconStateButton faces={faces} current="light" onClick={onClick} />);
    fireEvent.click(ui.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });
});
