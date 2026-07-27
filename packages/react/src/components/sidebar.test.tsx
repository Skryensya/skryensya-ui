import { fireEvent, render, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { NavList, NavListGroup, NavListLink } from "./nav-list.js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  type SidebarProps,
} from "./sidebar.js";

/* Queries are scoped to each render's own container: this suite renders more than one sidebar, and
 * the default queries are bound to document.body. */
function renderSidebar(props: Omit<SidebarProps, "children"> = {}) {
  const result = render(
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarTrigger label="Contraer navegación" icon={<span aria-hidden="true">☰</span>} />
      </SidebarHeader>
      <SidebarContent>
        <NavList aria-label="Main">
          <NavListGroup label="Workspace">
            <NavListLink current href="/" trailing="3">
              Home
            </NavListLink>
            <NavListLink href="/reports">Reports</NavListLink>
          </NavListGroup>
        </NavList>
      </SidebarContent>
      <SidebarFooter>v0.3.0</SidebarFooter>
    </Sidebar>,
  );

  const screen = within(result.container);

  return {
    ...result,
    screen,
    trigger: () => screen.getByRole("button", { name: "Contraer navegación" }),
    state: () => result.container.querySelector(".sk-sidebar")?.getAttribute("data-state"),
  };
}

describe("Sidebar React contracts", () => {
  it("collapses uncontrolled and reports the change", () => {
    const onCollapsedChange = vi.fn();
    const ui = renderSidebar({ onCollapsedChange });

    expect(ui.state()).toBe("expanded");
    fireEvent.click(ui.trigger());

    expect(onCollapsedChange).toHaveBeenCalledWith({ collapsed: true });
    expect(ui.state()).toBe("collapsed");
  });

  it("lets a controlled caller own the state", () => {
    const ui = renderSidebar({ collapsed: false });
    fireEvent.click(ui.trigger());

    expect(ui.state()).toBe("expanded");
  });

  it("points the trigger at the content it controls", () => {
    const ui = renderSidebar();

    expect(ui.trigger().getAttribute("aria-expanded")).toBe("true");
    expect(ui.trigger().getAttribute("aria-controls")).toBe(
      ui.container.querySelector(".sk-sidebar__content")?.id,
    );

    fireEvent.click(ui.trigger());
    expect(ui.trigger().getAttribute("aria-expanded")).toBe("false");
  });

  it("names the icon-only trigger without painting the label", () => {
    const ui = renderSidebar();

    // The trigger is one control wide: its name has to reach a screen reader without taking space.
    expect(ui.trigger().textContent).toBe("☰");
    expect(ui.trigger().getAttribute("aria-label")).toBe("Contraer navegación");
  });

  it("keeps the links reachable and named once collapsed", () => {
    const ui = renderSidebar({ defaultCollapsed: true });

    // Collapsing narrows; it never unmounts. A rail of icons still needs its names.
    expect(ui.screen.getByRole("link", { name: /Home/ }).getAttribute("aria-current")).toBe("page");
    expect(ui.screen.getByRole("link", { name: "Reports" })).toBeTruthy();
  });

  it("hosts the nav list without owning it", () => {
    const ui = renderSidebar();

    // The list is a guest: nothing inside it carries a sidebar class (decision 17).
    const list = ui.container.querySelector(".sk-nav-list");
    expect(list).toBeTruthy();
    expect(list?.querySelector('[class*="sk-sidebar__"]')).toBeNull();
  });

  it("passes axe expanded and collapsed", async () => {
    for (const defaultCollapsed of [false, true]) {
      const ui = renderSidebar({ defaultCollapsed });
      const result = await axe.run(ui.container);
      expect(result.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toHaveLength(0);
      ui.unmount();
    }
  });
});
