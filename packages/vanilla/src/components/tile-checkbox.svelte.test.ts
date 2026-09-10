import { fireEvent, getByRole } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountTileCheckbox } from "./tile-checkbox.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild as HTMLElement;
  expect(mountTileCheckbox(document)).toBe(1);
  return root.matches("[data-sk-tile-checkbox]") ? root : root.querySelector<HTMLElement>("[data-sk-tile-checkbox]")!;
}

describe("TileCheckbox (@zag-js/checkbox) contracts", () => {
  it("toggles checked state and root data-state on click, emitting sk:checkedchange", () => {
    const root = mount(
      `<label class="sk-tile sk-tile--interactive" data-sk-tile-checkbox data-part="root"><input type="checkbox" data-part="input" /><span class="sk-tile__content" data-part="content">Alerts</span><span data-part="indicator" aria-hidden="true"></span></label>`,
    );
    const handler = vi.fn();
    root.addEventListener("sk:checkedchange", handler);
    const input = getByRole(root, "checkbox") as HTMLInputElement;

    expect(root.dataset.state).toBe("unchecked");
    expect(input.checked).toBe(false);

    fireEvent.click(input);
    flushSync();

    expect(input.checked).toBe(true);
    expect(root.dataset.state).toBe("checked");
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { checked: true } }));
  });

  it("is form-associated and honours its default-checked", () => {
    const form = document.createElement("form");
    form.innerHTML = `<label class="sk-tile sk-tile--interactive" data-sk-tile-checkbox data-part="root" data-name="alerts" data-value="email" data-default-checked="true"><input type="checkbox" data-part="input" /><span data-part="content">Email</span><span data-part="indicator"></span></label>`;
    document.body.innerHTML = "";
    document.body.appendChild(form);
    expect(mountTileCheckbox(document)).toBe(1);
    const root = form.querySelector<HTMLElement>("[data-sk-tile-checkbox]")!;
    const input = getByRole(root, "checkbox") as HTMLInputElement;

    // form-association: the input takes part in the form (name/value), as in React
    expect(input.form).toBe(form);
    expect(input.name).toBe("alerts");
    // default-checked: it starts checked and data-state reflects it
    expect(input.checked).toBe(true);
    expect(root.dataset.state).toBe("checked");
  });

  /*
   * Regression: the compiler serializes a boolean option as a BARE attribute, so a tree-authored
   * tile carries `data-default-checked` with no value. This used to accept only the literal string
   * "true" and fell through to `undefined`, so the Card page's selection example rendered every
   * tile unchecked in Vanilla while the React binding beside it rendered the first one checked.
   */
  it("treats a valueless data-default-checked as checked, the way the emitter writes it", () => {
    document.body.innerHTML = `<label class="sk-tile sk-tile--interactive" data-sk-tile-checkbox data-part="root" data-name="prefs" data-value="pref-1" data-default-checked><input type="checkbox" data-part="input" /><span data-part="content">Weekly</span><span data-part="indicator"></span></label>`;
    expect(mountTileCheckbox(document)).toBe(1);
    const root = document.querySelector<HTMLElement>("[data-sk-tile-checkbox]")!;

    expect((getByRole(root, "checkbox") as HTMLInputElement).checked).toBe(true);
    expect(root.dataset.state).toBe("checked");
  });

  /** The other half of the same contract: an explicit "false" still means unchecked. */
  it("leaves an explicit data-default-checked=\"false\" unchecked", () => {
    document.body.innerHTML = `<label class="sk-tile sk-tile--interactive" data-sk-tile-checkbox data-part="root" data-name="prefs" data-value="pref-2" data-default-checked="false"><input type="checkbox" data-part="input" /><span data-part="content">Mentions</span><span data-part="indicator"></span></label>`;
    expect(mountTileCheckbox(document)).toBe(1);
    const root = document.querySelector<HTMLElement>("[data-sk-tile-checkbox]")!;

    expect((getByRole(root, "checkbox") as HTMLInputElement).checked).toBe(false);
    expect(root.dataset.state).toBe("unchecked");
  });
});
