import type { UsageTree } from "@skryensya/core/usage-tree";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./tabs.js";
import { renderTree } from "../render-tree.js";

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
    const root = ui.container.querySelector(".sk-tabs");
    expect(root?.getAttribute("data-activation-mode")).toBe("automatic");
    expect(root?.getAttribute("data-value")).toBe("activity");
    expect(panelId).not.toBeNull();

    const panel = document.getElementById(panelId!);
    expect(panel?.getAttribute("role")).toBe("tabpanel");
    expect(panel?.getAttribute("aria-labelledby")).toBe(activity.id);
    expect(panel?.textContent).toBe("Activity panel");

    // WAI-ARIA Tabs: "Each element with role tab has the property aria-controls referring to
    // its associated tabpanel element" — Zag itself only writes this on the SELECTED trigger
    // (confirmed reading tabs.connect.js), so an UNSELECTED one is corrected here too.
    const overview = ui.getByRole("tab", { name: "Overview" });
    const overviewPanelId = overview.getAttribute("aria-controls");
    expect(overviewPanelId).not.toBeNull();
    expect(document.getElementById(overviewPanelId!)?.textContent).toBe("Overview panel");
  });

  it("mirrors selection on the root data attribute", async () => {
    const ui = render(<Tabs defaultValue="overview" id="account-tabs" items={items} />);
    fireEvent.click(ui.getByRole("tab", { name: "Activity" }));

    await waitFor(() =>
      expect(ui.container.querySelector(".sk-tabs")?.getAttribute("data-value")).toBe(
        "activity",
      ),
    );
  });

  it("maps tree defaults to the uncontrolled Tabs API", async () => {
    const tree: UsageTree = {
      contract: "tabs",
      signature: "Tabs",
      options: {
        activationMode: "manual",
        orientation: "vertical",
        value: "overview",
      },
      attrs: { "aria-label": "Account" },
      slots: {
        items: [
          {
            options: { value: "overview" },
            slots: { label: "Overview", children: "Overview panel" },
          },
          {
            options: { value: "activity" },
            slots: { label: "Activity", children: "Activity panel" },
          },
        ],
      },
    };
    const ui = render(<>{renderTree(tree)}</>);
    const root = ui.container.querySelector(".sk-tabs");

    expect(root?.getAttribute("data-activation-mode")).toBe("manual");
    expect(root?.getAttribute("data-orientation")).toBe("vertical");
    expect(root?.getAttribute("data-value")).toBe("overview");

    fireEvent.click(ui.getByRole("tab", { name: "Activity" }));
    await waitFor(() => expect(root?.getAttribute("data-value")).toBe("activity"));
  });

  it("moves roving focus with ArrowRight without changing manual selection", async () => {
    const ui = render(
      <Tabs
        activationMode="manual"
        defaultValue="overview"
        id="account-tabs"
        items={items}
      />,
    );
    const overview = ui.getByRole("tab", { name: "Overview" });
    const activity = ui.getByRole("tab", { name: "Activity" });

    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });

    await waitFor(() => expect(document.activeElement).toBe(activity));
    expect(overview.getAttribute("aria-selected")).toBe("true");
    expect(activity.getAttribute("aria-selected")).toBe("false");
    expect(ui.getByRole("tabpanel", { name: "Overview" }).textContent).toBe("Overview panel");
    expect(ui.container.querySelector(".sk-tabs")?.getAttribute("data-activation-mode")).toBe(
      "manual",
    );
  });
});
