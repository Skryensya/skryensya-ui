import { fireEvent } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { mountCheckboxGroup } from "./checkbox-group.js";

const item = (value: string, extra = "") =>
  `<label class="sk-checkbox"><input class="sk-checkbox__input" data-sk-checkbox-group-item name="permissions" value="${value}" ${extra} type="checkbox"><span class="sk-checkbox__label">${value}</span></label>`;

function markup(items: string, groupAttrs = ""): string {
  return `<div class="sk-checkbox-group" data-sk-checkbox-group role="group" ${groupAttrs}>
    <label class="sk-checkbox"><input class="sk-checkbox__input" data-sk-checkbox-group-all type="checkbox"><span class="sk-checkbox__label">Todos</span></label>
    <div class="sk-checkbox-group__items">${items}</div>
  </div>`;
}

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  expect(mountCheckboxGroup(document)).toBe(
    document.querySelectorAll("[data-sk-checkbox-group]").length,
  );
  return document.querySelector<HTMLElement>("[data-sk-checkbox-group]")!;
}

const all = (root: HTMLElement) => root.querySelector<HTMLInputElement>("[data-sk-checkbox-group-all]")!;
const items = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLInputElement>("[data-sk-checkbox-group-item]"));

describe("CheckboxGroup contracts", () => {
  it("derives the parent's three states from its children on mount and on every change", () => {
    const root = mount(markup(item("read", "checked") + item("write") + item("admin")));

    // Some, not all: the parent shows the weaker claim, and shows it before anyone clicks.
    expect(all(root).checked).toBe(false);
    expect(all(root).indeterminate).toBe(true);

    const [read, write, admin] = items(root);
    fireEvent.click(write!);
    fireEvent.click(admin!);
    expect(all(root).checked).toBe(true);
    expect(all(root).indeterminate).toBe(false);

    fireEvent.click(read!);
    expect(all(root).checked).toBe(false);
    expect(all(root).indeterminate).toBe(true);
  });

  it("checks and unchecks every child from the parent, and reports what changed", () => {
    const root = mount(markup(item("read", "checked") + item("write")));
    const handler = vi.fn();
    root.addEventListener("sk:checkboxgroupvaluechange", handler);

    // From "some", the first click resolves upward: the browser clears `indeterminate` on
    // interaction, so a partially-checked parent becomes checked rather than cycling to a third state.
    fireEvent.click(all(root));
    expect(items(root).map((input) => input.checked)).toEqual([true, true]);
    expect(handler).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: { checked: true, value: ["read", "write"] } }),
    );

    fireEvent.click(all(root));
    expect(items(root).map((input) => input.checked)).toEqual([false, false]);
    expect(handler).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: { checked: false, value: [] } }),
    );
  });

  it("leaves a disabled child alone and does not let it hold the parent back from 'all'", () => {
    const root = mount(markup(item("read") + item("admin", "disabled")));

    fireEvent.click(items(root)[0]!);

    expect(items(root)[1]!.checked).toBe(false);
    // Every child anyone can actually reach is checked, so the parent says so.
    expect(all(root).checked).toBe(true);
    expect(all(root).indeterminate).toBe(false);
  });

  it("counts only its own children, never a nested group's", () => {
    const nested = markup(item("deploy") + item("rollback"), 'data-nested="true"');
    const root = mount(markup(item("read", "checked") + `<div>${nested}</div>`));

    const outerItems = items(root).filter(
      (input) => input.closest("[data-sk-checkbox-group]") === root,
    );
    expect(outerItems).toHaveLength(1);

    // Checking everything in the nested group must not make the OUTER parent read "all": the outer
    // group has one child of its own and it is already checked, so it was "all" to begin with.
    expect(all(root).checked).toBe(true);

    const inner = root.querySelector<HTMLElement>('[data-nested="true"]')!;
    fireEvent.click(items(inner)[0]!);
    expect(all(inner).indeterminate).toBe(true);
    expect(all(root).checked).toBe(true);
    expect(all(root).indeterminate).toBe(false);
  });

  it("wires aria-controls on the parent to every child's id, generating one where none was authored", () => {
    const root = mount(markup(item("read", 'id="perm-read"') + item("write") + item("admin")));
    const [read, write, admin] = items(root);

    // An authored id survives untouched. Something else on the page may already point at it.
    expect(read!.id).toBe("perm-read");
    // The other two had none, so the enhancer generated one rather than leaving them unreferenced.
    expect(write!.id).not.toBe("");
    expect(admin!.id).not.toBe("");
    expect(write!.id).not.toBe(admin!.id);

    expect(all(root).getAttribute("aria-controls")).toBe(
      [read!.id, write!.id, admin!.id].join(" "),
    );
  });

  it("keeps each group's aria-controls to its own children, never a nested group's", () => {
    const nested = markup(item("deploy") + item("rollback"), 'data-nested="true"');
    const root = mount(markup(item("read") + `<div>${nested}</div>`));
    const inner = root.querySelector<HTMLElement>('[data-nested="true"]')!;

    const outerControls = all(root).getAttribute("aria-controls")!.split(" ");
    const innerControls = all(inner).getAttribute("aria-controls")!.split(" ");

    expect(outerControls).toHaveLength(1);
    expect(innerControls).toHaveLength(2);
    // No id the outer group names is also named by the inner one, or vice versa.
    expect(outerControls.some((id) => innerControls.includes(id))).toBe(false);
  });

  it("re-derives the parent after a form reset, which restores the children silently", async () => {
    document.body.innerHTML = `<form>${markup(item("read", "checked") + item("write"))}</form>`;
    const form = document.querySelector("form")!;
    expect(mountCheckboxGroup(document)).toBe(1);
    const root = form.querySelector<HTMLElement>("[data-sk-checkbox-group]")!;

    fireEvent.click(items(root)[1]!);
    expect(all(root).checked).toBe(true);

    form.reset();
    // Reset fires before it moves the inputs, so the enhancer defers; the assertion has to as well.
    await Promise.resolve();

    expect(items(root).map((input) => input.checked)).toEqual([true, false]);
    expect(all(root).checked).toBe(false);
    expect(all(root).indeterminate).toBe(true);
  });
});
