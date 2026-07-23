import { fireEvent, getByRole } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountExpandableTile } from "./expandable-tile.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild as HTMLElement;
  expect(mountExpandableTile(document)).toBe(1);
  return root;
}

const markup = `<section class="ds-tile ds-tile--expandable" data-ds-expandable-tile data-part="root">
  <button type="button" data-part="trigger">Summary</button>
  <div data-part="content">Details</div>
</section>`;

describe("ExpandableTile (collapsible) contracts", () => {
  it("links trigger and content, closed by default", () => {
    const root = mount(markup);
    const trigger = getByRole(root, "button", { name: "Summary" });
    const content = root.querySelector<HTMLElement>("[data-part=content]")!;

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(content.hidden).toBe(true);
    expect(root.getAttribute("data-scope")).toBe("tile");
  });

  it("opens on click, toggling state and emitting ds:openchange", () => {
    const root = mount(markup);
    const handler = vi.fn();
    root.addEventListener("ds:openchange", handler);
    const trigger = getByRole(root, "button", { name: "Summary" });
    const content = root.querySelector<HTMLElement>("[data-part=content]")!;

    fireEvent.click(trigger);
    flushSync();

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.hidden).toBe(false);
    expect(root.dataset.state).toBe("open");
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { open: true } }));
  });
});
