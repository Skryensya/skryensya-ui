import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Steps } from "./steps.js";

const steps = [{ label: "Brand" }, { label: "Ramps" }, { label: "Contrast" }, { label: "Export" }];

describe("Steps", () => {
  it("derives complete / current / upcoming from the current index", () => {
    const ui = render(<Steps current={1} steps={steps} />);
    const items = ui.getAllByRole("listitem");

    expect(items[0].getAttribute("data-status")).toBe("complete");
    expect(items[1].getAttribute("data-status")).toBe("current");
    expect(items[1].getAttribute("aria-current")).toBe("step");
    expect(items[2].getAttribute("data-status")).toBe("upcoming");
  });

  it("lets a step override its status explicitly", () => {
    const ui = render(<Steps current={0} steps={[{ label: "Done", status: "complete" }, { label: "Now" }]} />);
    expect(ui.getAllByRole("listitem")[0].getAttribute("data-status")).toBe("complete");
  });
});
