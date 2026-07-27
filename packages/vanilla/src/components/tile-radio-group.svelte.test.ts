import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountTileRadioGroup } from "./tile-radio-group.js";

const markup = `<div data-sk-tile-radio-group data-part="root" data-name="plan" data-default-value="basic">
  <label class="sk-tile sk-tile--interactive" data-part="item"><input type="radio" value="basic" /><span data-part="content">Basic</span><span data-part="indicator"></span></label>
  <label class="sk-tile sk-tile--interactive" data-part="item"><input type="radio" value="pro" /><span data-part="content">Pro</span><span data-part="indicator"></span></label>
</div>`;

function mount(): HTMLElement {
  document.body.innerHTML = markup;
  expect(mountTileRadioGroup(document)).toBe(1);
  return document.body.firstElementChild as HTMLElement;
}

describe("TileRadioGroup (@zag-js/radio-group) contracts", () => {
  it("is a radiogroup, honours the default, and keeps values mutually exclusive + emits", () => {
    const root = mount();
    const handler = vi.fn();
    root.addEventListener("sk:valuechange", handler);
    const radios = root.querySelectorAll<HTMLInputElement>('input[type="radio"]');

    expect(root.getAttribute("role")).toBe("radiogroup");
    expect(radios[0].checked).toBe(true); // default: basic
    expect(radios[1].checked).toBe(false);

    fireEvent.click(radios[1]);
    flushSync();

    expect(radios[0].checked).toBe(false);
    expect(radios[1].checked).toBe(true);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "pro" } }));
  });

  it("marks the selected item's data-state", () => {
    const root = mount();
    const items = root.querySelectorAll<HTMLElement>("[data-part=item]");
    expect(items[0].dataset.state).toBe("checked");
    expect(items[1].dataset.state).toBe("unchecked");
  });
});
