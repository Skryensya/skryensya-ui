import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./tabs.js";

const items = [
  { value: "overview", label: "Overview", children: "Overview panel" },
  { value: "activity", label: "Activity", children: "Activity panel" },
  { value: "settings", label: "Settings", children: "Settings panel" },
] as const;

describe("Tabs", () => {
  it("connects the selected tab with its labelled panel", () => {
    const ui = render(<Tabs defaultValue="activity" id="account-tabs" items={items} />);
    const activity = ui.getByRole("tab", { name: "Activity" });
    const panelId = activity.getAttribute("aria-controls");

    expect(activity.getAttribute("aria-selected")).toBe("true");
    expect(panelId).not.toBeNull();

    const panel = document.getElementById(panelId!);
    expect(panel?.getAttribute("role")).toBe("tabpanel");
    expect(panel?.getAttribute("aria-labelledby")).toBe(activity.id);
    expect(panel?.textContent).toBe("Activity panel");
  });

  it("moves roving focus with ArrowRight without changing manual selection", async () => {
    const ui = render(<Tabs defaultValue="overview" id="account-tabs" items={items} />);
    const overview = ui.getByRole("tab", { name: "Overview" });
    const activity = ui.getByRole("tab", { name: "Activity" });

    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });

    await waitFor(() => expect(document.activeElement).toBe(activity));
    expect(overview.getAttribute("aria-selected")).toBe("true");
    expect(activity.getAttribute("aria-selected")).toBe("false");
    expect(ui.getByRole("tabpanel", { name: "Overview" }).textContent).toBe("Overview panel");
  });
});
