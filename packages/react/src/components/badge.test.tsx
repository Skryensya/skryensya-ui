import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge.js";

describe("Badge", () => {
  it("renders its accessible label and forwards semantic attributes", () => {
    const ui = render(<Badge aria-label="3 unread messages" tone="accent">3</Badge>);
    const badge = ui.getByLabelText("3 unread messages");

    expect(badge.tagName).toBe("SPAN");
    expect(badge.textContent).toBe("3");
    expect(badge.getAttribute("data-tone")).toBe("accent");
  });
});
