import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./progress.js";

describe("Progress", () => {
  it("exposes the value on the progressbar role and paints the matching fill", () => {
    const ui = render(<Progress label="Upload" max={200} value={50} />);
    const bar = ui.getByRole("progressbar", { name: "Upload" });
    expect(bar.getAttribute("aria-valuenow")).toBe("50");
    expect(bar.getAttribute("aria-valuemax")).toBe("200");
    expect(bar.getAttribute("style")).toContain("--ds-progress-fill: 25%");
  });

  it("clamps an out-of-range value so the paint and aria-valuenow agree", () => {
    const ui = render(<Progress label="Over" max={100} value={140} />);
    const bar = ui.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(bar.getAttribute("style")).toContain("--ds-progress-fill: 100%");
  });
});
