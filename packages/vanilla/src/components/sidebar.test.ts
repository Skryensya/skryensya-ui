import { fireEvent, getByRole } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { connectSidebar, mountSidebar } from "./sidebar.js";

function mount(html: string) {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  return root;
}

const markup = `<aside class="ds-sidebar" data-ds-sidebar>
  <div class="ds-sidebar__header">
    <button type="button" class="ds-sidebar__trigger" data-ds-sidebar-trigger aria-label="Collapse"></button>
  </div>
  <div class="ds-sidebar__content" data-ds-sidebar-content>
    <nav class="ds-nav-list">
      <ul class="ds-nav-list__list"><li class="ds-nav-list__item"><a class="ds-nav-list__link" href="/">Home</a></li></ul>
    </nav>
  </div>
</aside>`;

describe("Sidebar Vanilla contracts", () => {
  it("writes collapsed state, emits the change, and cleanup removes listeners", () => {
    const root = mount(markup);
    const handler = vi.fn();
    root.addEventListener("ds-collapsed-change", handler);
    const cleanup = connectSidebar(root);

    expect(root.dataset.state).toBe("expanded");
    fireEvent.click(getByRole(root, "button"));

    expect(root.dataset.state).toBe("collapsed");
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail: { collapsed: true } }));

    cleanup();
    fireEvent.click(getByRole(root, "button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("points the trigger at the content it controls", () => {
    const root = mount(markup);
    connectSidebar(root, { id: "main" });
    const trigger = getByRole(root, "button");

    expect(trigger.getAttribute("aria-controls")).toBe("main-content");
    expect(root.querySelector(".ds-sidebar__content")?.id).toBe("main-content");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("lets a controlled caller refuse the collapse", () => {
    const root = mount(markup);
    connectSidebar(root, { collapsed: false });

    fireEvent.click(getByRole(root, "button"));
    expect(root.dataset.state).toBe("expanded");
  });

  it("mounts from authored data attributes, and mounting twice is idempotent", () => {
    document.body.innerHTML = markup.replace("data-ds-sidebar>", "data-ds-sidebar data-default-collapsed>");

    expect(mountSidebar(document)).toBe(1);
    expect(mountSidebar(document)).toBe(0);
    expect(document.querySelector(".ds-sidebar")?.getAttribute("data-state")).toBe("collapsed");
  });
});
