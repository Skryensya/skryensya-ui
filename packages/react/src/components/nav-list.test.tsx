import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavList, NavListGroup, NavListLink } from "./nav-list.js";

describe("NavList", () => {
  it("renders a named navigation landmark with a labelled list of links", () => {
    const ui = render(
      <NavList aria-label="Primary navigation" orientation="horizontal">
        <NavListGroup label="Workspace">
          <NavListLink current href="/dashboard" icon={<span aria-hidden="true">⌂</span>} trailing={<span>3</span>}>
            Dashboard
          </NavListLink>
        </NavListGroup>
      </NavList>,
    );

    const navigation = ui.getByRole("navigation", { name: "Primary navigation" });
    expect(navigation.getAttribute("data-orientation")).toBe("horizontal");

    const list = ui.getByRole("list", { name: "Workspace" });
    const link = ui.getByRole("link", { name: /Dashboard/ });
    expect(list.contains(link)).toBe(true);
    expect(link.getAttribute("href")).toBe("/dashboard");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("does not invent menu semantics for destination links", () => {
    const ui = render(
      <NavList aria-label="Primary navigation">
        <NavListGroup>
          <NavListLink href="/settings">Settings</NavListLink>
        </NavListGroup>
      </NavList>,
    );

    expect(ui.queryByRole("menu")).toBeNull();
    expect(ui.getByRole("link", { name: "Settings" }).getAttribute("aria-current")).toBeNull();
  });
});
