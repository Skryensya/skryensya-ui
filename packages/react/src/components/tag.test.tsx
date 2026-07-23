import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./tag.js";

describe("Tag", () => {
  it("carries its tone and label", () => {
    const ui = render(<Tag tone="accent">tokens</Tag>);
    const tag = ui.getByText("tokens").closest(".ds-tag");
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
});
