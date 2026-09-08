import { fireEvent, getByRole } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountTileSwitch } from "./tile-switch.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild as HTMLElement;
  expect(mountTileSwitch(document)).toBe(1);
  return root.matches("[data-sk-tile-switch]") ? root : root.querySelector<HTMLElement>("[data-sk-tile-switch]")!;
}

describe("TileSwitch (@zag-js/checkbox) contracts", () => {
  it("toggles checked state and root data-state on click, emitting sk:checkedchange", () => {
    const root = mount(
      `<label class="sk-tile sk-tile--interactive" data-sk-tile-switch data-part="root"><input type="checkbox" data-part="input" /><span class="sk-tile__content" data-part="content">Auto-deploy</span><span data-part="indicator" aria-hidden="true"></span></label>`,
    );
    const handler = vi.fn();
    root.addEventListener("sk:checkedchange", handler);
    const input = getByRole(root, "switch") as HTMLInputElement;

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
    form.innerHTML = `<label class="sk-tile sk-tile--interactive" data-sk-tile-switch data-part="root" data-name="deploy" data-value="auto" data-default-checked="true"><input type="checkbox" data-part="input" /><span data-part="content">Auto-deploy</span><span data-part="indicator"></span></label>`;
    document.body.innerHTML = "";
    document.body.appendChild(form);
    expect(mountTileSwitch(document)).toBe(1);
    const root = form.querySelector<HTMLElement>("[data-sk-tile-switch]")!;
    const input = getByRole(root, "switch") as HTMLInputElement;

    // form-association: the input takes part in the form (name/value), as in React
    expect(input.form).toBe(form);
    expect(input.name).toBe("deploy");
    // default-checked: it starts checked and data-state reflects it
    expect(input.checked).toBe(true);
    expect(root.dataset.state).toBe("checked");
    // a switch is never a third state: the role is what tells it apart from TileCheckbox, not a flag of its own
    expect(input.getAttribute("role")).toBe("switch");
  });
});
