import { fireEvent, getByRole } from "@testing-library/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SIDEBAR_WIDTH_PROPERTY, sidebarWidthPreference } from "@skryensya/core/sidebar";
import { getPreference, resetStorageForTests, setPreference } from "../storage.js";
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

/*
 * The width itself is the stylesheet's: jsdom has no layout, so `clamp()` resolves to nothing and
 * every measurement here is zero. What these cover is the part this module actually owns, which is
 * everything around the number: which property gets written, when the drag state is on the root,
 * what reaches storage, and what a reset forgets.
 */
const resizableMarkup = `<aside class="sk-sidebar" data-sk-sidebar>
  <div class="sk-sidebar__content" data-sk-sidebar-content>Proyectos</div>
  <div class="sk-sidebar__resize-handle" data-sk-sidebar-resize role="separator" tabindex="0"
       aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
       aria-label="Cambiar el ancho"></div>
</aside>`;

function pointer(type: string, init: { clientX?: number; button?: number; pointerId?: number } = {}) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, ...init }) as MouseEvent & { pointerId: number };
}

describe("Sidebar resizing", () => {
  beforeEach(() => {
    resetStorageForTests();
    localStorage.clear();
  });

  it("enhances a sidebar that has a handle and no trigger", () => {
    const root = mount(resizableMarkup);
    expect(() => connectSidebar(root)).not.toThrow();
    expect(root.dataset.state).toBe("expanded");
  });

  it("still refuses a sidebar with neither control", () => {
    const root = mount(`<aside class="sk-sidebar" data-sk-sidebar><div class="sk-sidebar__content">x</div></aside>`);
    expect(() => connectSidebar(root)).toThrow(/trigger.*resize/i);
  });

  /** A press, then whatever moves the caller asks for, then the release. Returns the handle. */
  function gesture(root: HTMLElement, xs: number[], { release = true } = {}) {
    const handle = root.querySelector<HTMLElement>("[data-sk-sidebar-resize]")!;
    handle.setPointerCapture = vi.fn();
    handle.hasPointerCapture = vi.fn(() => true);
    handle.releasePointerCapture = vi.fn();

    const send = (type: string, clientX: number, extra = {}) => {
      const event = pointer(type, { clientX, ...extra });
      event.pointerId = 1;
      handle.dispatchEvent(event);
    };

    send("pointerdown", xs[0], { button: 0 });
    for (const x of xs.slice(1)) send("pointermove", x);
    if (release) send("pointerup", xs[xs.length - 1]);
    return handle;
  }

  it("writes the width property while dragging, and only while dragging", () => {
    const root = mount(resizableMarkup);
    connectSidebar(root);

    gesture(root, [200, 260], { release: false });
    expect(root.hasAttribute("data-resizing")).toBe(true);
    // Measured from where the threshold was crossed, so the width never jumps by the slop.
    expect(root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("0px");

    gesture(root, [200, 260, 300], { release: false });
    expect(root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("40px");

    gesture(root, [200, 260, 300]);
    expect(root.hasAttribute("data-resizing")).toBe(false);
  });

  it("a press that never travels is not a resize", () => {
    const root = mount(resizableMarkup);
    const handler = vi.fn();
    root.addEventListener("sk-resize-change", handler);
    connectSidebar(root, { storageKey: "docs" });

    // Down and up on the same pixel: a click on the panel edge.
    gesture(root, [200]);
    expect(root.hasAttribute("data-resizing")).toBe(false);
    expect(root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("");
    expect(handler).not.toHaveBeenCalled();
    // Nothing reached storage either: a stray click must not freeze today's width into the browser.
    expect(getPreference(sidebarWidthPreference("docs"))).toBe(null);

    // A hand that shifts by less than the threshold is still a click.
    gesture(root, [200, 203]);
    expect(root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("");
    expect(handler).not.toHaveBeenCalled();
  });

  it("moves with the arrow keys and announces the change", () => {
    const root = mount(resizableMarkup);
    const handler = vi.fn();
    root.addEventListener("sk-resize-change", handler);
    connectSidebar(root);
    const handle = root.querySelector<HTMLElement>("[data-sk-sidebar-resize]")!;

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("16px");
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("64px");
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("remembers the width under its storage key, and forgets it on reset", () => {
    const root = mount(resizableMarkup);
    connectSidebar(root, { storageKey: "docs" });
    const handle = root.querySelector<HTMLElement>("[data-sk-sidebar-resize]")!;

    fireEvent.keyDown(handle, { key: "End" });
    // jsdom has no layout, so what is stored is a real 0: what matters here is that a key WAS written.
    expect(getPreference(sidebarWidthPreference("docs"))).toBe(0);

    fireEvent.dblClick(handle);
    expect(root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("");
    expect(getPreference(sidebarWidthPreference("docs"))).toBe(null);
  });

  it("flushes the restored width before the mount measurement re-enables the transition", async () => {
    const root = mount(resizableMarkup);
    const reads: Array<{ prop: string; resizing: boolean }> = [];
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      if (this === root) {
        reads.push({
          prop: this.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY),
          resizing: this.hasAttribute("data-resizing"),
        });
      }
      return original.call(this);
    };

    try {
      connectSidebar(root);
      // The initial bounds probe is deferred one frame past mount (measured: run inline, its own
      // forced reflow leaked into whatever ELSE was also mounting that task, as a real painted
      // shift of a sibling column; see the git history of this file). One real animation frame
      // is what stands between "mounted" and "probed" now.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original;
    }

    expect(reads.some((s) => s.prop === "0px" && s.resizing)).toBe(true);
    const afterCeiling = reads.slice(reads.findIndex((s) => s.prop === "100000px") + 1);
    // The ceiling is the last forced layout. Without a flush at the restored value while
    // `data-resizing` is still on, that ceiling becomes the width transition's FROM and the
    // rail animates back. A CLS of everything to its right (docs shell).
    expect(afterCeiling.some((s) => s.prop === "" && s.resizing)).toBe(true);
    expect(root.hasAttribute("data-resizing")).toBe(false);
  });

  it("restores a stored width on mount, and leaves an unkeyed sidebar alone", () => {
    setPreference(sidebarWidthPreference("docs"), 260);

    const keyed = mount(resizableMarkup);
    connectSidebar(keyed, { storageKey: "docs" });
    expect(keyed.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("260px");

    const anonymous = mount(resizableMarkup);
    connectSidebar(anonymous);
    expect(anonymous.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("");
  });

  it("refuses a stored width that is not one", () => {
    setPreference(sidebarWidthPreference("docs"), -1 as number);

    const root = mount(resizableMarkup);
    connectSidebar(root, { storageKey: "docs" });
    expect(root.style.getPropertyValue(SIDEBAR_WIDTH_PROPERTY)).toBe("");
  });

  it("reads the storage key off the markup when it mounts itself", () => {
    document.body.innerHTML = resizableMarkup.replace("data-sk-sidebar>", 'data-sk-sidebar data-storage-key="rail">');
    expect(mountSidebar(document)).toBe(1);

    const handle = document.querySelector<HTMLElement>("[data-sk-sidebar-resize]")!;
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(getPreference(sidebarWidthPreference("rail"))).toBe(0);
  });
});
