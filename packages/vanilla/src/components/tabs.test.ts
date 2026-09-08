import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountTabs } from "./tabs.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  return root;
}

const markup = `<section class="sk-tabs" data-sk-tabs id="preferences" data-value="general">
  <div class="sk-tabs__list" data-sk-tabs-list>
    <button class="sk-tabs__trigger" data-sk-tabs-trigger data-value="general">General</button>
    <button class="sk-tabs__trigger" data-sk-tabs-trigger data-value="security">Security</button>
  </div>
  <section class="sk-tabs__content" data-sk-tabs-content data-value="general">General panel</section>
  <section class="sk-tabs__content" data-sk-tabs-content data-value="security">Security panel</section>
</section>`;

describe("Tabs Vanilla contracts", () => {
  it("links authored tabs and panels with ARIA attributes", () => {
    const root = mount(markup);

    expect(mountTabs(document)).toBe(1);
    // A second direct mount does not remount this authored root.
    expect(mountTabs(document)).toBe(0);

    const general = root.querySelector('[data-sk-tabs-trigger][data-value="general"]') as HTMLButtonElement;
    const security = root.querySelector('[data-sk-tabs-trigger][data-value="security"]') as HTMLButtonElement;
    const generalPanel = root.querySelector('[data-sk-tabs-content][data-value="general"]') as HTMLElement;
    const securityPanel = root.querySelector('[data-sk-tabs-content][data-value="security"]') as HTMLElement;

    expect(general.getAttribute("role")).toBe("tab");
    expect(general.getAttribute("aria-selected")).toBe("true");
    expect(general.getAttribute("aria-controls")).toBe(generalPanel.id);
    expect(generalPanel.getAttribute("aria-labelledby")).toBe(general.id);
    expect(security.getAttribute("aria-selected")).toBe("false");
    expect(securityPanel.hidden).toBe(true);
    // WAI-ARIA Tabs: "Each element with role tab has the property aria-controls referring to
    // its associated tabpanel element". Zag itself only writes this on the SELECTED trigger
    // (confirmed reading tabs.connect.js), so the UNSELECTED one is corrected here, not just
    // inherited from the machine.
    expect(security.getAttribute("aria-controls")).toBe(securityPanel.id);
  });

  it("selects a tab on click, toggling panels and emitting the value", () => {
    const root = mount(markup);
    const handler = vi.fn();
    root.addEventListener("sk-value-change", handler);
    mountTabs(root);
    const security = root.querySelector('[data-sk-tabs-trigger][data-value="security"]') as HTMLButtonElement;
    const generalPanel = root.querySelector('[data-sk-tabs-content][data-value="general"]') as HTMLElement;
    const securityPanel = root.querySelector('[data-sk-tabs-content][data-value="security"]') as HTMLElement;

    fireEvent.click(security);
    flushSync();

    expect(root.getAttribute("data-value")).toBe("security");
    expect(security.getAttribute("aria-selected")).toBe("true");
    expect(generalPanel.hidden).toBe(true);
    expect(securityPanel.hidden).toBe(false);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "security" } }));
  });

  it("moves focus across triggers with ArrowRight (roving tabindex)", async () => {
    const root = mount(markup);
    mountTabs(root);
    const general = root.querySelector('[data-sk-tabs-trigger][data-value="general"]') as HTMLButtonElement;
    const security = root.querySelector('[data-sk-tabs-trigger][data-value="security"]') as HTMLButtonElement;

    general.focus();
    fireEvent.keyDown(general, { key: "ArrowRight" });
    // Zag moves focus inside a `raf`; `vi.waitFor` lets the frame run before asserting.
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(security);
    });
  });
});
