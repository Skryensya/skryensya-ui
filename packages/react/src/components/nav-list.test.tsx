import { fireEvent, render } from "@testing-library/react";
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

  it("collapsible: renders a button with aria-expanded/aria-controls, open by default", () => {
    const ui = render(
      <NavList aria-label="Primary navigation">
        <NavListGroup collapsible label="Settings">
          <NavListLink href="/general">General</NavListLink>
        </NavListGroup>
      </NavList>,
    );
    const trigger = ui.getByRole("button", { name: "Settings" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const listId = trigger.getAttribute("aria-controls");
    expect(listId).not.toBeNull();
    const list = document.getElementById(listId!)!;
    expect(list.hidden).toBe(false);
    expect(list.contains(ui.getByRole("link", { name: "General" }))).toBe(true);
  });

  it("collapsible: toggles aria-expanded and the list's hidden state on click", () => {
    const ui = render(
      <NavList aria-label="Primary navigation">
        <NavListGroup collapsible label="Settings">
          <NavListLink href="/general">General</NavListLink>
        </NavListGroup>
      </NavList>,
    );
    const trigger = ui.getByRole("button", { name: "Settings" });
    const list = document.getElementById(trigger.getAttribute("aria-controls")!)!;

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(list.hidden).toBe(true);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(list.hidden).toBe(false);
  });

  it("collapsible: Escape closes the open dropdown from anywhere inside it and returns focus to the trigger", () => {
    const ui = render(
      <NavList aria-label="Primary navigation">
        <NavListGroup collapsible label="Settings">
          <NavListLink href="/general">General</NavListLink>
        </NavListGroup>
      </NavList>,
    );
    const trigger = ui.getByRole("button", { name: "Settings" });
    const link = ui.getByRole("link", { name: "General" });
    link.focus();
    fireEvent.keyDown(link, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(trigger.getAttribute("aria-controls")!)!.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it("collapsible: honors defaultOpen=false", () => {
    const ui = render(
      <NavList aria-label="Primary navigation">
        <NavListGroup collapsible defaultOpen={false} label="Settings">
          <NavListLink href="/general">General</NavListLink>
        </NavListGroup>
      </NavList>,
    );
    const trigger = ui.getByRole("button", { name: "Settings" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(trigger.getAttribute("aria-controls")!)!.hidden).toBe(true);
  });
});
