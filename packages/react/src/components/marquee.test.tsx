import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderTree } from "../render-tree.js";
import { AutoplayMarquee, Marquee } from "./marquee.js";

describe("Marquee", () => {
  let reducedMotion = false;
  let onPreferenceChange: (() => void) | undefined;
  let onResize: Array<() => void> = [];

  beforeEach(() => {
    reducedMotion = false;
    onPreferenceChange = undefined;
    onResize = [];
    window.matchMedia = vi.fn().mockImplementation((media: string) => ({
      media,
      get matches() {
        return reducedMotion;
      },
      addEventListener(_type: string, listener: () => void) {
        onPreferenceChange = listener;
      },
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    // jsdom lays nothing out, so a re-measure has to be asked for by hand once the sizes are stubbed.
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: () => void) {
        onResize.push(callback);
      }
      observe() {}
      disconnect() {}
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("renders one semantic run, one hidden visual copy, and waits for Play", () => {
    const ui = render(
      <Marquee playLabel="Play motion" pauseLabel="Pause motion">
        <span>Alpha</span><span>Beta</span>
      </Marquee>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-marquee")!;
    const copies = root.querySelectorAll(".sk-marquee__content");
    const button = ui.getByRole("button", { name: "Play motion" });

    expect(copies).toHaveLength(2);
    expect(copies[0].hasAttribute("aria-hidden")).toBe(false);
    expect(copies[1].getAttribute("aria-hidden")).toBe("true");
    expect(root.dataset.state).toBe("paused");

    fireEvent.click(button);
    expect(root.dataset.state).toBe("playing");
    expect(ui.getByRole("button", { name: "Pause motion" })).toBe(button);
  });

  it("supports vertical travel and derives duration from the content height", () => {
    const ui = render(
      <AutoplayMarquee direction="up" playLabel="Play motion" pauseLabel="Pause motion">
        <span>Alpha</span>
      </AutoplayMarquee>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-marquee")!;
    const content = root.querySelector<HTMLElement>(".sk-marquee__content")!;
    Object.defineProperty(content, "scrollHeight", { configurable: true, value: 480 });

    window.dispatchEvent(new Event("resize"));

    expect(root.dataset.direction).toBe("up");
  });

  it("fills a short run up to its viewport so the loop leaves no hole", () => {
    const ui = render(
      <AutoplayMarquee speed="normal" playLabel="Play motion" pauseLabel="Pause motion">
        <span>Alpha</span><span>Beta</span><span>Gamma</span><span>Delta</span>
      </AutoplayMarquee>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-marquee")!;
    const viewport = root.querySelector<HTMLElement>(".sk-marquee__viewport")!;
    const content = root.querySelector<HTMLElement>(".sk-marquee__content")!;

    // 480px of content across four items, inside a 600px window: 30px per gap closes the hole.
    Object.defineProperty(content, "scrollWidth", { configurable: true, value: 480 });
    Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 600 });
    act(() => onResize.forEach((measure) => measure()));

    expect(root.style.getPropertyValue("--sk-marquee-gap-fill")).toBe("30px");

    // A window the authored run already covers leaves the gaps exactly as authored.
    Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 320 });
    act(() => onResize.forEach((measure) => measure()));

    expect(root.style.getPropertyValue("--sk-marquee-gap-fill")).toBe("0px");
  });

  it("puts the Play/Pause control in a real Button and fades its own edges by default", () => {
    const ui = render(
      <Marquee playLabel="Play motion" pauseLabel="Pause motion">
        <span>Alpha</span>
      </Marquee>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-marquee")!;
    const button = ui.getByRole("button", { name: "Play motion" });

    // Button's, not a lookalike's: the state layer, the focus ring and the touch target come with it.
    expect(button.classList.contains("sk-button")).toBe(true);
    expect(button.classList.contains("sk-interactive")).toBe(true);
    expect(button.dataset.variant).toBe("translucent");
    expect(button.hasAttribute("data-icon-only")).toBe(true);
    // The glyph is an element because both of a `.sk-button`'s pseudos are already spoken for.
    expect(button.querySelector(".sk-marquee__glyph")).toBeTruthy();
    // The fade is the viewport's own, so no wrapper can wash the control out with it.
    expect(root.dataset.fade).toBe("edges");
  });

  it("ships no control unless asked, and then never starts paused", () => {
    const ui = render(
      <AutoplayMarquee playLabel="Play motion" pauseLabel="Pause motion">
        <span>Alpha</span>
      </AutoplayMarquee>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-marquee")!;

    // An ambient strip is not a media player: no button, and nothing to press means nothing paused.
    expect(root.querySelector(".sk-marquee__toggle")).toBeNull();
    expect(ui.queryByRole("button")).toBeNull();
    expect(root.dataset.state).toBe("playing");
    expect(root.hasAttribute("data-control")).toBe(false);
  });

  it("starts autoplay with a pressed Pause control", () => {
    const ui = render(
      <AutoplayMarquee control direction="right" speed="fast" playLabel="Play motion" pauseLabel="Pause motion">
        Alpha Beta
      </AutoplayMarquee>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-marquee")!;
    const button = ui.getByRole("button", { name: "Pause motion" });

    expect(root.dataset.start).toBe("auto");
    expect(root.dataset.state).toBe("playing");
    expect(root.dataset.direction).toBe("right");
    expect(root.dataset.speed).toBe("fast");
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("stops autoplay when the live reduced-motion preference turns on", () => {
    const ui = render(
      <AutoplayMarquee control playLabel="Play motion" pauseLabel="Pause motion">
        Alpha Beta
      </AutoplayMarquee>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-marquee")!;

    reducedMotion = true;
    act(() => onPreferenceChange?.());
    expect(root.dataset.state).toBe("paused");
    expect(ui.getByRole("button", { name: "Play motion" })).toBeTruthy();
  });

  it("renders marquee contract trees, including FadeEdge composition", () => {
    const tree = {
      contract: "fade-edge",
      signature: "FadeEdge",
      options: { direction: "to-left", size: "4rem" },
      children: {
        contract: "fade-edge",
        signature: "FadeEdge",
        options: { direction: "to-right", size: "4rem" },
        children: {
          contract: "marquee",
          signature: "Marquee.autoplay",
          options: { direction: "right", speed: "normal", control: true },
          slots: {
            playLabel: "Play motion",
            pauseLabel: "Pause motion",
            children: "NORTHSTAR",
          },
        },
      },
    } as const;

    const ui = render(renderTree(tree));

    expect(ui.getByRole("button", { name: "Pause motion" })).toBeTruthy();
    expect(ui.container.querySelectorAll(".sk-fade-edge")).toHaveLength(2);
    expect(ui.container.querySelector(".sk-marquee")?.getAttribute("data-start")).toBe("auto");
  });
});
