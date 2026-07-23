import { fireEvent } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { mountSegmented } from "./segmented.js";

const markup = `<div class="ds-segmented" data-ds-segmented data-value="day" aria-label="Range">
  <span class="ds-segmented__indicator" aria-hidden="true"></span>
  <button class="ds-segmented__option" data-ds-segmented-option data-value="day">Day</button>
  <button class="ds-segmented__option" data-ds-segmented-option data-value="week">Week</button>
  <button class="ds-segmented__option" data-ds-segmented-option data-value="month" disabled>Month</button>
</div>`;

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected segmented root.");
  return root;
}

describe("SegmentedControl Vanilla contracts", () => {
  it("patches the authored parts into one roving radiogroup", () => {
    const root = mount(markup);

    expect(mountSegmented(document)).toBe(1);
    expect(mountSegmented(document)).toBe(0);

    const day = root.querySelector('[data-value="day"]');
    const week = root.querySelector('[data-value="week"]');
    const month = root.querySelector('[data-value="month"]');

    expect(root.getAttribute("role")).toBe("radiogroup");
    expect(day?.getAttribute("aria-checked")).toBe("true");
    expect(day?.getAttribute("tabindex")).toBe("0");
    expect(week?.getAttribute("aria-checked")).toBe("false");
    expect(week?.getAttribute("tabindex")).toBe("-1");
    expect(month?.getAttribute("aria-disabled")).toBe("true");
  });

  it("selects on click and arrow navigation, skipping disabled options", () => {
    const root = mount(markup);
    const handler = vi.fn();
    root.addEventListener("ds-value-change", handler);
    mountSegmented(root);

    const day = root.querySelector<HTMLButtonElement>('[data-value="day"]');
    const week = root.querySelector<HTMLButtonElement>('[data-value="week"]');
    if (!day || !week) throw new Error("Expected segmented option parts.");

    fireEvent.click(week);
    expect(root.getAttribute("data-value")).toBe("week");
    expect(week.getAttribute("aria-checked")).toBe("true");

    week.focus();
    fireEvent.keyDown(week, { key: "ArrowRight" });
    expect(document.activeElement).toBe(day);
    expect(root.getAttribute("data-value")).toBe("day");
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenLastCalledWith(expect.objectContaining({ detail: { value: "day" } }));
  });
});
