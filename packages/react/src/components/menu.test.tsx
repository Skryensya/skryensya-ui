import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Menu } from "./menu.js";
import type { MenuItem } from "@skryensya/core/menu";

const items: MenuItem[] = [
  { value: "new", label: "New file" },
  { value: "delete", label: "Delete", disabled: true },
  { value: "wrap", label: "Word wrap", kind: "checkbox" },
  { value: "left", label: "Left", kind: "radio", group: "align" },
  { value: "right", label: "Right", kind: "radio", group: "align" },
  {
    value: "share",
    label: "Share",
    children: [{ value: "email", label: "Email" }],
  },
  { value: "docs", label: "Documentation", href: "/docs" },
];

/*
 * `@zag-js/dismissable`'s Escape/outside-press wiring attaches its document-level listeners behind
 * `defer: true` — a real `requestAnimationFrame` — and the outside-press path stacks a SECOND
 * deferred layer on top (`@zag-js/interact-outside`'s own `defer` wrapper, then a `setTimeout(0)`
 * before the actual `document.addEventListener` call). Firing the dismiss event once, before that
 * chain settles, can land on a listener that doesn't exist yet — and nothing is left afterwards to
 * retry it, so a fixed delay before firing is a guess about frame count that flakes under load.
 * RE-FIRING the event on every `waitFor` poll instead means the assertion only ever passes on an
 * attempt where a real listener was present, immune to how many frames the chain actually took.
 */
async function fireUntil(fire: () => void, assert: () => void): Promise<void> {
  await waitFor(() => {
    fire();
    assert();
  });
}

describe("Menu (React)", () => {
  it("wires ARIA on mount and stays closed", () => {
    const ui = render(<Menu items={items} label="File actions" trigger="Actions" />);
    const trigger = ui.getByRole("button", { name: "Actions" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens on trigger click and closes on Escape, returning focus to the trigger", async () => {
    const ui = render(<Menu items={items} label="File actions" trigger="Actions" />);
    const trigger = ui.getByRole("button", { name: "Actions" });

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    const menu = await ui.findByRole("menu");

    await fireUntil(
      () => fireEvent.keyDown(menu, { key: "Escape" }),
      () => expect(trigger.getAttribute("aria-expanded")).toBe("false"),
    );
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("closes on an outside pointer press", async () => {
    const ui = render(<Menu items={items} label="File actions" trigger="Actions" />);
    const trigger = ui.getByRole("button", { name: "Actions" });

    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    await fireUntil(
      () => fireEvent.pointerDown(document.body, { clientX: 5, clientY: 5 }),
      () => expect(trigger.getAttribute("aria-expanded")).toBe("false"),
    );
  });

  it("selecting a plain item calls onSelect with its value and closes the menu", async () => {
    const onSelect = vi.fn();
    const ui = render(
      <Menu items={items} label="File actions" onSelect={onSelect} trigger="Actions" />,
    );
    const trigger = ui.getByRole("button", { name: "Actions" });
    fireEvent.click(trigger);

    fireEvent.click(await ui.findByRole("menuitem", { name: "New file" }));

    await waitFor(() => expect(onSelect).toHaveBeenCalledWith({ value: "new" }));
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });

  it("never calls onSelect for a disabled item, and the menu stays open", async () => {
    const onSelect = vi.fn();
    const ui = render(
      <Menu items={items} label="File actions" onSelect={onSelect} trigger="Actions" />,
    );
    fireEvent.click(ui.getByRole("button", { name: "Actions" }));

    const disabledItem = await ui.findByRole("menuitem", { name: "Delete" });
    expect(disabledItem.getAttribute("data-disabled")).not.toBeNull();
    fireEvent.click(disabledItem);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("toggles a checkbox item and calls onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    const ui = render(
      <Menu items={items} label="File actions" onCheckedChange={onCheckedChange} trigger="Actions" />,
    );
    fireEvent.click(ui.getByRole("button", { name: "Actions" }));

    const wrap = await ui.findByRole("menuitemcheckbox", { name: "Word wrap" });
    expect(wrap.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(wrap);

    await waitFor(() => expect(wrap.getAttribute("aria-checked")).toBe("true"));
    expect(onCheckedChange).toHaveBeenCalledWith({ value: "wrap", checked: true });
  });

  it("keeps a radio group mutually exclusive within the same group", async () => {
    const ui = render(<Menu items={items} label="File actions" trigger="Actions" />);
    const trigger = ui.getByRole("button", { name: "Actions" });
    fireEvent.click(trigger);

    const left = await ui.findByRole("menuitemradio", { name: "Left" });
    fireEvent.click(left);
    // Choosing a radio option closes the menu, same as a plain command — reopen for the second
    // pick. Once closed, `[data-sk-menu-content]` goes `hidden` and role queries stop seeing
    // anything inside it, so `left`/`right` are captured element references, not re-queried by role.
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    const right = await ui.findByRole("menuitemradio", { name: "Right" });
    fireEvent.click(right);

    await waitFor(() => expect(right.getAttribute("aria-checked")).toBe("true"));
    expect(left.getAttribute("aria-checked")).toBe("false");
  });

  it("renders an href entry as a real anchor", async () => {
    const ui = render(<Menu items={items} label="File actions" trigger="Actions" />);
    fireEvent.click(ui.getByRole("button", { name: "Actions" }));

    const link = await ui.findByRole("menuitem", { name: "Documentation" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
  });

  it("ArrowDown moves the highlight through the item list, skipping the disabled one", async () => {
    const ui = render(<Menu items={items} label="File actions" trigger="Actions" />);
    fireEvent.click(ui.getByRole("button", { name: "Actions" }));
    const menu = await ui.findByRole("menu");
    await waitFor(() => expect(document.activeElement).toBe(menu));

    fireEvent.keyDown(menu, { key: "ArrowDown" });
    await waitFor(() =>
      expect(ui.getByRole("menuitem", { name: "New file" }).getAttribute("data-highlighted")).toBe(
        "",
      ),
    );

    // "delete" is disabled; ArrowDown skips straight past it to "wrap".
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    await waitFor(() =>
      expect(
        ui.getByRole("menuitemcheckbox", { name: "Word wrap" }).getAttribute("data-highlighted"),
      ).toBe(""),
    );
    expect(ui.getByRole("menuitem", { name: "New file" }).hasAttribute("data-highlighted")).toBe(
      false,
    );
    expect(
      ui.getByRole("menuitem", { name: "Delete" }).hasAttribute("data-highlighted"),
    ).toBe(false);
  });

  it("selecting a submenu item closes the whole tree, parent included", async () => {
    const onSelect = vi.fn();
    const ui = render(
      <Menu items={items} label="File actions" onSelect={onSelect} trigger="Actions" />,
    );
    const trigger = ui.getByRole("button", { name: "Actions" });
    fireEvent.click(trigger);

    const shareTrigger = await ui.findByRole("menuitem", { name: "Share" });
    fireEvent.click(shareTrigger);
    const emailItem = await ui.findByRole("menuitem", { name: "Email" });

    fireEvent.click(emailItem);

    await waitFor(() => expect(onSelect).toHaveBeenCalledWith({ value: "email" }));
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  });
});
