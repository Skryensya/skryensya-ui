import { describe, expect, it, vi } from "vitest";
import {
  mountComponentPreview,
  resetSharedComponentPreviewBinding,
  resetSharedComponentPreviewScreen,
} from "./component-preview.js";

function markup(id: string): string {
  return `
    <div data-sk-component-preview data-test-id="${id}">
      <div data-sk-component-preview-binding-tabs data-value="vanilla">
        <button data-sk-component-preview-binding-option data-value="vanilla" type="button">Vanilla</button>
        <button data-sk-component-preview-binding-option data-value="react" type="button">React</button>
      </div>
      <div data-sk-component-preview-binding="vanilla">
        <div data-sk-component-preview-source-tabs data-value="html"></div>
        <div data-sk-component-preview-source="html">HTML</div>
        <div data-sk-component-preview-source="js" hidden>JS</div>
      </div>
      <div data-sk-component-preview-binding="react" hidden>React</div>
    </div>
  `;
}

function changeValue(target: Element, value: string): void {
  target.dispatchEvent(new CustomEvent("sk-value-change", { detail: { value }, bubbles: true }));
}

/** jsdom ships no PointerEvent: a MouseEvent carrying the two fields the resizer reads. */
function pointerEvent(type: string, clientY: number): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientY });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: "mouse" });
  return event;
}

function resetBindingState(): void {
  resetSharedComponentPreviewBinding();
  resetSharedComponentPreviewScreen();
  document.documentElement.removeAttribute("data-sk-component-preview-pref");
  document.documentElement.removeAttribute("data-sk-component-preview-screen-pref");
}

describe("ComponentPreview opt-in enhancer", () => {
  it("switches binding and nested Vanilla source panels idempotently", () => {
    resetBindingState();
    document.body.innerHTML = markup("one");
    const root = document.querySelector<HTMLElement>("[data-sk-component-preview]");
    const sourceTabs = root?.querySelector<HTMLElement>("[data-sk-component-preview-source-tabs]");
    const vanillaOption = root?.querySelector<HTMLElement>(
      '[data-sk-component-preview-binding-option][data-value="vanilla"]',
    );
    const reactOption = root?.querySelector<HTMLElement>(
      '[data-sk-component-preview-binding-option][data-value="react"]',
    );
    const vanilla = root?.querySelector<HTMLElement>('[data-sk-component-preview-binding="vanilla"]');
    const react = root?.querySelector<HTMLElement>('[data-sk-component-preview-binding="react"]');
    const html = root?.querySelector<HTMLElement>('[data-sk-component-preview-source="html"]');
    const js = root?.querySelector<HTMLElement>('[data-sk-component-preview-source="js"]');
    if (!root || !sourceTabs || !vanillaOption || !reactOption || !vanilla || !react || !html || !js) {
      throw new Error("Invalid test markup.");
    }

    expect(mountComponentPreview(document)).toBe(1);
    expect(mountComponentPreview(document)).toBe(0);
    expect(vanilla.hidden).toBe(false);
    expect(react.hidden).toBe(true);
    expect(html.hidden).toBe(false);
    expect(js.hidden).toBe(true);
    expect(vanillaOption.getAttribute("aria-pressed")).toBe("true");
    expect(reactOption.getAttribute("aria-pressed")).toBe("false");

    changeValue(sourceTabs, "js");
    expect(html.hidden).toBe(true);
    expect(js.hidden).toBe(false);

    reactOption.click();
    expect(vanilla.hidden).toBe(true);
    expect(react.hidden).toBe(false);
    expect(vanillaOption.getAttribute("aria-pressed")).toBe("false");
    expect(reactOption.getAttribute("aria-pressed")).toBe("true");
    expect(document.documentElement.getAttribute("data-sk-component-preview-pref")).toBe("react");

    vanillaOption.click();
    expect(vanilla.hidden).toBe(false);
    expect(react.hidden).toBe(true);
    expect(js.hidden).toBe(false);
  });

  it("shares Vanilla | React across every preview on the page", () => {
    resetBindingState();
    document.body.innerHTML = `${markup("a")}${markup("b")}`;
    const roots = [...document.querySelectorAll<HTMLElement>("[data-sk-component-preview]")];
    expect(mountComponentPreview(document)).toBe(2);

    const reactOptionA = roots[0]?.querySelector<HTMLElement>(
      '[data-sk-component-preview-binding-option][data-value="react"]',
    );
    const vanillaB = roots[1]?.querySelector<HTMLElement>(
      '[data-sk-component-preview-binding="vanilla"]',
    );
    const reactB = roots[1]?.querySelector<HTMLElement>(
      '[data-sk-component-preview-binding="react"]',
    );
    if (!reactOptionA || !vanillaB || !reactB) throw new Error("Invalid test markup.");

    reactOptionA.click();
    expect(vanillaB.hidden).toBe(true);
    expect(reactB.hidden).toBe(false);
    expect(document.documentElement.getAttribute("data-sk-component-preview-pref")).toBe("react");
  });

  it("hands the stage height to the reader on drag and back to the content on double click", () => {
    resetBindingState();
    document.body.innerHTML = `
      <div data-sk-component-preview>
        <iframe class="sk-component-preview__stage" srcdoc="<!doctype html><body>one</body>"></iframe>
        <div data-sk-component-preview-resizer role="separator" tabindex="0"></div>
      </div>
    `;
    const root = document.querySelector<HTMLElement>("[data-sk-component-preview]");
    const stage = root?.querySelector<HTMLIFrameElement>(".sk-component-preview__stage");
    const resizer = root?.querySelector<HTMLElement>("[data-sk-component-preview-resizer]");
    if (!root || !stage || !resizer) throw new Error("Invalid test markup.");

    // jsdom lays nothing out, so the stage has to be told what it measures.
    vi.spyOn(stage, "getBoundingClientRect").mockReturnValue({ height: 200 } as DOMRect);
    expect(mountComponentPreview(document)).toBe(1);

    resizer.dispatchEvent(pointerEvent("pointerdown", 100));
    expect(root.hasAttribute("data-sk-component-preview-resizing")).toBe(true);

    resizer.dispatchEvent(pointerEvent("pointermove", 180));
    expect(stage.style.height).toBe("280px");
    expect(stage.hasAttribute("data-sk-component-preview-resized")).toBe(true);
    expect(resizer.getAttribute("aria-valuenow")).toBe("280");

    // Below the floor the stage stops shrinking; the frame scrolls instead of vanishing.
    resizer.dispatchEvent(pointerEvent("pointermove", -900));
    expect(stage.style.height).toBe("64px");

    resizer.dispatchEvent(pointerEvent("pointerup", -900));
    expect(root.hasAttribute("data-sk-component-preview-resizing")).toBe(false);

    resizer.dispatchEvent(pointerEvent("pointermove", 400));
    expect(stage.style.height).toBe("64px");

    resizer.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(stage.style.height).toBe("");
    expect(stage.hasAttribute("data-sk-component-preview-resized")).toBe(false);
    expect(resizer.hasAttribute("aria-valuenow")).toBe(false);

    resizer.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(stage.style.height).toBe("216px");
  });

  it("keeps a reader-set height across a stage reload", () => {
    resetBindingState();
    document.body.innerHTML = `
      <div data-sk-component-preview>
        <button data-sk-component-preview-reload type="button">Reload</button>
        <iframe
          class="sk-component-preview__stage"
          srcdoc="<!doctype html><body>one</body>"
          data-sk-component-preview-resized
          style="height: 320px"
        ></iframe>
      </div>
    `;
    const root = document.querySelector<HTMLElement>("[data-sk-component-preview]");
    const reload = root?.querySelector<HTMLButtonElement>("[data-sk-component-preview-reload]");
    const stage = root?.querySelector<HTMLIFrameElement>(".sk-component-preview__stage");
    if (!root || !reload || !stage) throw new Error("Invalid test markup.");

    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(() => 1);
    expect(mountComponentPreview(document)).toBe(1);
    reload.click();

    expect(stage.style.height).toBe("320px");
  });

  it("reloads the srcdoc stage from the authored document", () => {
    resetBindingState();
    document.body.innerHTML = `
      <div data-sk-component-preview>
        <button data-sk-component-preview-reload type="button">Reload</button>
        <iframe
          class="sk-component-preview__stage"
          srcdoc="<!doctype html><body>one</body>"
          data-sk-component-preview-frame-ready
        ></iframe>
      </div>
    `;
    const root = document.querySelector<HTMLElement>("[data-sk-component-preview]");
    const reload = root?.querySelector<HTMLButtonElement>("[data-sk-component-preview-reload]");
    const stage = root?.querySelector<HTMLIFrameElement>(".sk-component-preview__stage");
    if (!root || !reload || !stage) throw new Error("Invalid test markup.");

    const frames: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });

    expect(mountComponentPreview(document)).toBe(1);
    reload.click();

    expect(stage.hasAttribute("data-sk-component-preview-frame-ready")).toBe(false);
    expect(stage.getAttribute("aria-busy")).toBe("true");
    expect(stage.srcdoc).toBe("");

    frames.shift()?.(0);
    expect(stage.srcdoc).toContain("<body>one</body>");
  });

  describe("screen presets", () => {
    function screenMarkupFor(id = "one", extraStageAttrs = ""): string {
      return `
        <div data-sk-component-preview data-test-id="${id}">
          <button
            data-sk-component-preview-screen-tabs
            data-value="free"
            type="button"
            data-sk-component-preview-screen-label-free="Free"
            data-sk-component-preview-screen-label-tablet="Tablet"
            data-sk-component-preview-screen-label-mobile="Mobile"
          ></button>
          <iframe
            class="sk-component-preview__stage"
            srcdoc="<!doctype html><body>one</body>"
            ${extraStageAttrs}
          ></iframe>
        </div>
      `;
    }

    function screenMarkup(extraStageAttrs = ""): void {
      document.body.innerHTML = screenMarkupFor("one", extraStageAttrs);
    }

    function parts() {
      const root = document.querySelector<HTMLElement>("[data-sk-component-preview]");
      const toggle = root?.querySelector<HTMLElement>("[data-sk-component-preview-screen-tabs]");
      const stage = root?.querySelector<HTMLIFrameElement>(".sk-component-preview__stage");
      if (!root || !toggle || !stage) throw new Error("Invalid test markup.");
      return { root, toggle, stage };
    }

    it("cycles free → tablet → mobile → free on click, marking the stage and clearing it for free", () => {
      resetBindingState();
      screenMarkup();
      const { toggle, stage } = parts();

      expect(mountComponentPreview(document)).toBe(1);
      // `free` is the absence of the attribute, so every fit/reserve/scroll rule stays untouched.
      expect(stage.hasAttribute("data-sk-component-preview-screen")).toBe(false);

      toggle.click();
      expect(toggle.getAttribute("data-value")).toBe("tablet");
      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("tablet");

      toggle.click();
      expect(toggle.getAttribute("data-value")).toBe("mobile");
      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("mobile");

      toggle.click();
      expect(toggle.getAttribute("data-value")).toBe("free");
      expect(stage.hasAttribute("data-sk-component-preview-screen")).toBe(false);
    });

    it("paints the toggle's accessible name from its per-instance label attributes", () => {
      resetBindingState();
      screenMarkup();
      const { toggle } = parts();
      mountComponentPreview(document);

      expect(toggle.getAttribute("aria-label")).toBe("Free");
      toggle.click();
      expect(toggle.getAttribute("aria-label")).toBe("Tablet");
      toggle.click();
      expect(toggle.getAttribute("aria-label")).toBe("Mobile");
    });

    it("takes the height back from a reader drag, inline style included", () => {
      // Two owners of one height is the bug: an inline height outranks the preset's rule, so a
      // stale drag would silently win over the device height and the stage would not be a device.
      resetBindingState();
      screenMarkup('data-sk-component-preview-resized style="height: 320px"');
      const { toggle, stage } = parts();
      mountComponentPreview(document);

      toggle.click();

      expect(stage.style.height).toBe("");
      expect(stage.hasAttribute("data-sk-component-preview-resized")).toBe(false);
      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("tablet");
    });

    it("honours a preset authored as the initial value", () => {
      resetBindingState();
      document.body.innerHTML = `
        <div data-sk-component-preview>
          <button data-sk-component-preview-screen-tabs data-value="tablet" type="button"></button>
          <iframe class="sk-component-preview__stage" srcdoc="<!doctype html><body>one</body>"></iframe>
        </div>
      `;
      const { stage } = parts();

      mountComponentPreview(document);
      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("tablet");
    });

    it("mounts a preview that offers no presets", () => {
      resetBindingState();
      document.body.innerHTML = `
        <div data-sk-component-preview>
          <iframe class="sk-component-preview__stage" srcdoc="<!doctype html><body>one</body>"></iframe>
        </div>
      `;
      expect(mountComponentPreview(document)).toBe(1);
    });

    it("shares one preset across every preview on the page", () => {
      resetBindingState();
      document.body.innerHTML = `${screenMarkupFor("a")}${screenMarkupFor("b")}`;
      const roots = [...document.querySelectorAll<HTMLElement>("[data-sk-component-preview]")];
      const stages = roots.map((r) => r.querySelector<HTMLElement>(".sk-component-preview__stage")!);
      const toggleB = roots[1].querySelector<HTMLElement>("[data-sk-component-preview-screen-tabs]")!;

      expect(mountComponentPreview(document)).toBe(2);

      // clicking the SECOND preview's toggle moves the first one too
      toggleB.click();
      toggleB.click();
      expect(stages.map((s) => s.getAttribute("data-sk-component-preview-screen"))).toEqual([
        "mobile",
        "mobile",
      ]);
      // and the other preview's own toggle follows, so the two controls never disagree
      const toggleA = roots[0].querySelector<HTMLElement>("[data-sk-component-preview-screen-tabs]")!;
      expect(toggleA.getAttribute("data-value")).toBe("mobile");

      toggleB.click();
      expect(stages.every((s) => !s.hasAttribute("data-sk-component-preview-screen"))).toBe(true);
    });

    it("records the shared preset on the document element, free as an absence", () => {
      resetBindingState();
      screenMarkup();
      const { toggle } = parts();
      mountComponentPreview(document);
      const pref = () => document.documentElement.getAttribute("data-sk-component-preview-screen-pref");

      expect(pref()).toBeNull();

      toggle.click();
      expect(pref()).toBe("tablet");

      toggle.click();
      toggle.click();
      expect(pref()).toBeNull();
    });

    it("adopts a preset the document already carries, which is what FOUC writes", () => {
      resetBindingState();
      document.documentElement.setAttribute("data-sk-component-preview-screen-pref", "mobile");
      screenMarkup();
      const { toggle, stage } = parts();

      mountComponentPreview(document);

      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("mobile");
      expect(toggle.getAttribute("data-value")).toBe("mobile");
    });

    it("applies the shared preset to a preview that has no toggle of its own", () => {
      resetBindingState();
      document.documentElement.setAttribute("data-sk-component-preview-screen-pref", "tablet");
      document.body.innerHTML = `
        <div data-sk-component-preview>
          <iframe class="sk-component-preview__stage" srcdoc="<!doctype html><body>one</body>"></iframe>
        </div>
      `;
      const stage = document.querySelector<HTMLElement>(".sk-component-preview__stage")!;

      mountComponentPreview(document);

      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("tablet");
    });
  });
});
