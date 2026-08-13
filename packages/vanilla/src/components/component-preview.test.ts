import { describe, expect, it, vi } from "vitest";
import {
  mountComponentPreview,
  resetSharedComponentPreviewBinding,
  resetSharedComponentPreviewScreen,
} from "./component-preview.js";
import { mountSegmented } from "./segmented.js";

/** Both mounts, in production order: ComponentPreview corrects `data-value` before Segmented reads it. */
function mountAll(): number {
  const previews = mountComponentPreview(document);
  mountSegmented(document);
  return previews;
}

function segmentedOption(value: string, dataAttr: string, label = value): string {
  return `<button class="sk-segmented__option" data-sk-segmented-option ${dataAttr} data-value="${value}" type="button">${label}</button>`;
}

function markup(id: string): string {
  return `
    <div data-sk-component-preview data-test-id="${id}">
      <div class="sk-segmented" data-sk-segmented data-sk-component-preview-binding-tabs data-value="vanilla" role="radiogroup">
        <span class="sk-segmented__indicator" aria-hidden="true"></span>
        ${segmentedOption("vanilla", "data-sk-component-preview-binding-option", "Vanilla")}
        ${segmentedOption("react", "data-sk-component-preview-binding-option", "React")}
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

    expect(mountAll()).toBe(1);
    expect(mountComponentPreview(document)).toBe(0);
    expect(vanilla.hidden).toBe(false);
    expect(react.hidden).toBe(true);
    expect(html.hidden).toBe(false);
    expect(js.hidden).toBe(true);
    expect(vanillaOption.getAttribute("aria-checked")).toBe("true");
    expect(reactOption.getAttribute("aria-checked")).toBe("false");

    changeValue(sourceTabs, "js");
    expect(html.hidden).toBe(true);
    expect(js.hidden).toBe(false);

    reactOption.click();
    expect(vanilla.hidden).toBe(true);
    expect(react.hidden).toBe(false);
    expect(vanillaOption.getAttribute("aria-checked")).toBe("false");
    expect(reactOption.getAttribute("aria-checked")).toBe("true");
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
    expect(mountAll()).toBe(2);

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

    // the OTHER preview's own Segmented follows too, so the two controls never disagree
    const tabsB = roots[1]?.querySelector<HTMLElement>("[data-sk-component-preview-binding-tabs]");
    expect(tabsB?.getAttribute("data-value")).toBe("react");
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
          <div class="sk-segmented" data-sk-segmented data-sk-component-preview-screen-tabs data-value="free" role="radiogroup">
            <span class="sk-segmented__indicator" aria-hidden="true"></span>
            ${segmentedOption("free", "data-sk-component-preview-screen-option", "Free")}
            ${segmentedOption("tablet", "data-sk-component-preview-screen-option", "Tablet")}
            ${segmentedOption("mobile", "data-sk-component-preview-screen-option", "Mobile")}
          </div>
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
      const tabs = root?.querySelector<HTMLElement>("[data-sk-component-preview-screen-tabs]");
      const freeOption = root?.querySelector<HTMLElement>(
        '[data-sk-component-preview-screen-option][data-value="free"]',
      );
      const tabletOption = root?.querySelector<HTMLElement>(
        '[data-sk-component-preview-screen-option][data-value="tablet"]',
      );
      const mobileOption = root?.querySelector<HTMLElement>(
        '[data-sk-component-preview-screen-option][data-value="mobile"]',
      );
      const stage = root?.querySelector<HTMLIFrameElement>(".sk-component-preview__stage");
      if (!root || !tabs || !freeOption || !tabletOption || !mobileOption || !stage) {
        throw new Error("Invalid test markup.");
      }
      return { root, tabs, freeOption, tabletOption, mobileOption, stage };
    }

    it("selects a preset directly on click, marking the stage and clearing it for free", () => {
      resetBindingState();
      screenMarkup();
      const { tabs, freeOption, tabletOption, mobileOption, stage } = parts();

      expect(mountAll()).toBe(1);
      // `free` is the absence of the attribute, so every fit/reserve/scroll rule stays untouched.
      expect(stage.hasAttribute("data-sk-component-preview-screen")).toBe(false);

      tabletOption.click();
      expect(tabs.getAttribute("data-value")).toBe("tablet");
      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("tablet");
      expect(tabletOption.getAttribute("aria-checked")).toBe("true");
      expect(freeOption.getAttribute("aria-checked")).toBe("false");

      mobileOption.click();
      expect(tabs.getAttribute("data-value")).toBe("mobile");
      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("mobile");
      expect(mobileOption.getAttribute("aria-checked")).toBe("true");
      expect(tabletOption.getAttribute("aria-checked")).toBe("false");

      freeOption.click();
      expect(tabs.getAttribute("data-value")).toBe("free");
      expect(stage.hasAttribute("data-sk-component-preview-screen")).toBe(false);
      expect(freeOption.getAttribute("aria-checked")).toBe("true");
      expect(mobileOption.getAttribute("aria-checked")).toBe("false");
    });

    it("takes the height back from a reader drag, inline style included", () => {
      // Two owners of one height is the bug: an inline height outranks the preset's rule, so a
      // stale drag would silently win over the device height and the stage would not be a device.
      resetBindingState();
      screenMarkup('data-sk-component-preview-resized style="height: 320px"');
      const { tabletOption, stage } = parts();
      mountAll();

      tabletOption.click();

      expect(stage.style.height).toBe("");
      expect(stage.hasAttribute("data-sk-component-preview-resized")).toBe(false);
      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("tablet");
    });

    it("honours a preset authored as the initial value", () => {
      resetBindingState();
      document.body.innerHTML = `
        <div data-sk-component-preview>
          <div class="sk-segmented" data-sk-segmented data-sk-component-preview-screen-tabs data-value="tablet" role="radiogroup">
            <span class="sk-segmented__indicator" aria-hidden="true"></span>
            ${segmentedOption("free", "data-sk-component-preview-screen-option")}
            ${segmentedOption("tablet", "data-sk-component-preview-screen-option")}
            ${segmentedOption("mobile", "data-sk-component-preview-screen-option")}
          </div>
          <iframe class="sk-component-preview__stage" srcdoc="<!doctype html><body>one</body>"></iframe>
        </div>
      `;
      const { stage, tabs } = parts();

      mountAll();
      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("tablet");
      expect(tabs.querySelector('[data-value="tablet"]')?.getAttribute("aria-checked")).toBe("true");
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
      const mobileOptionB = roots[1].querySelector<HTMLElement>(
        '[data-sk-component-preview-screen-option][data-value="mobile"]',
      )!;

      expect(mountAll()).toBe(2);

      // clicking the SECOND preview's button moves the first one too
      mobileOptionB.click();
      expect(stages.map((s) => s.getAttribute("data-sk-component-preview-screen"))).toEqual([
        "mobile",
        "mobile",
      ]);
      // and the other preview's own Segmented follows, so the two controls never disagree
      const tabsA = roots[0].querySelector<HTMLElement>("[data-sk-component-preview-screen-tabs]")!;
      expect(tabsA.getAttribute("data-value")).toBe("mobile");

      const freeOptionB = roots[1].querySelector<HTMLElement>(
        '[data-sk-component-preview-screen-option][data-value="free"]',
      )!;
      freeOptionB.click();
      expect(stages.every((s) => !s.hasAttribute("data-sk-component-preview-screen"))).toBe(true);
    });

    it("records the shared preset on the document element, free as an absence", () => {
      resetBindingState();
      screenMarkup();
      const { tabletOption, freeOption } = parts();
      mountAll();
      const pref = () => document.documentElement.getAttribute("data-sk-component-preview-screen-pref");

      expect(pref()).toBeNull();

      tabletOption.click();
      expect(pref()).toBe("tablet");

      freeOption.click();
      expect(pref()).toBeNull();
    });

    it("adopts a preset the document already carries, which is what FOUC writes", () => {
      resetBindingState();
      document.documentElement.setAttribute("data-sk-component-preview-screen-pref", "mobile");
      screenMarkup();
      const { tabs, mobileOption, stage } = parts();

      mountAll();

      expect(stage.getAttribute("data-sk-component-preview-screen")).toBe("mobile");
      expect(tabs.getAttribute("data-value")).toBe("mobile");
      expect(mobileOption.getAttribute("aria-checked")).toBe("true");
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
