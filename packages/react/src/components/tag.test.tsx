import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./tag.js";

describe("Tag", () => {
  it("carries its tone and label", () => {
    const ui = render(<Tag tone="accent">tokens</Tag>);
    const tag = ui.getByText("tokens").closest(".sk-tag");
    expect(tag?.getAttribute("data-tone")).toBe("accent");
  });

  it("exposes a named remove control only when onRemove is given", () => {
    const onRemove = vi.fn();
    const ui = render(<Tag onRemove={onRemove} removeLabel="Remove tokens">tokens</Tag>);
    fireEvent.click(ui.getByLabelText("Remove tokens"));
    expect(onRemove).toHaveBeenCalledOnce();

    const plain = render(<Tag>tokens</Tag>);
    expect(plain.container.querySelector("button")).toBeNull();
  });

  it("removes with a real small icon-only button, not a lookalike", () => {
    const ui = render(<Tag onRemove={() => {}} removeLabel="Remove tokens">tokens</Tag>);
    const remove = ui.getByLabelText("Remove tokens");
    // The whole point of the composition: hover/press/focus and the 44px hit area are the button's.
    expect(remove.className).toContain("sk-button");
    expect(remove.className).toContain("sk-interactive");
    expect(remove.getAttribute("data-size")).toBe("sm");
    expect(remove.getAttribute("data-variant")).toBe("ghost");
    expect(remove.hasAttribute("data-icon-only")).toBe(true);
    expect(remove.querySelector("svg")).not.toBeNull();
  });
});
