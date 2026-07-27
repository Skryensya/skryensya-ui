import { fireEvent, getByRole } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { connectSidebar, mountSidebar } from "./sidebar.js";

function mount(html: string) {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  return root;
}

const markup = `<aside class="sk-sidebar" data-sk-sidebar>
  <div class="sk-sidebar__header">
    <button type="button" class="sk-sidebar__trigger" data-sk-sidebar-trigger aria-label="Collapse"></button>
  </div>
  <div class="sk-sidebar__content" data-sk-sidebar-content>
    <nav class="sk-nav-list">
      <ul class="sk-nav-list__list"><li class="sk-nav-list__item"><a class="sk-nav-list__link" href="/">Home</a></li></ul>
    </nav>
  </div>
</aside>`;

describe("Sidebar Vanilla contracts", () => {
  it("writes collapsed state, emits the change, and cleanup removes listeners", () => {
    const root = mount(markup);
    const handler = vi.fn();
    root.addEventListener("sk-collapsed-change", handler);
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
    expect(root.querySelector(".sk-sidebar__content")?.id).toBe("main-content");
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
    document.body.innerHTML = markup.replace("data-sk-sidebar>", "data-sk-sidebar data-default-collapsed>");

    expect(mountSidebar(document)).toBe(1);
    expect(mountSidebar(document)).toBe(0);
    expect(document.querySelector(".sk-sidebar")?.getAttribute("data-state")).toBe("collapsed");
  });
});
