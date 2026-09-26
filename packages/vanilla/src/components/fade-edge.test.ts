import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountFadeEdge } from "./fade-edge.js";

/* jsdom lays nothing out, so every scroll dimension is whatever the test says it is. */
function scroller(attrs: string, metrics: { scrollHeight: number; clientHeight: number }) {
  document.body.innerHTML = `<div class="sk-fade-edge" data-sk-fade-edge ${attrs}><p>Contenido</p></div>`;
  const root = document.body.firstElementChild as HTMLElement;
  Object.defineProperty(root, "scrollHeight", { configurable: true, value: metrics.scrollHeight });
  Object.defineProperty(root, "clientHeight", { configurable: true, value: metrics.clientHeight });
  return root;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("mountFadeEdge", () => {
  it("leaves a plain FadeEdge alone: without data-scroll-aware it is paint only", () => {
    scroller('data-direction="to-bottom"', { scrollHeight: 100, clientHeight: 100 });
    expect(mountFadeEdge()).toBe(0);
  });

  it("marks content that fits as already at its edge", () => {
    const root = scroller('data-direction="to-bottom" data-scroll-aware', { scrollHeight: 100, clientHeight: 100 });
    mountFadeEdge();
    expect(root.hasAttribute("data-at-edge")).toBe(true);
  });

  it("keeps the fade while there is more, and retires it once the scroll reaches the edge", () => {
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const root = scroller('data-direction="to-bottom" data-scroll-aware', { scrollHeight: 300, clientHeight: 100 });
    mountFadeEdge();
    expect(root.hasAttribute("data-at-edge")).toBe(false);

    root.scrollTop = 200;
    root.dispatchEvent(new Event("scroll"));
    expect(root.hasAttribute("data-at-edge")).toBe(true);
  });

  it("removes the attribute on destroy, so the fade paints again unwatched", () => {
    const root = scroller('data-direction="to-bottom" data-scroll-aware', { scrollHeight: 100, clientHeight: 100 });
    mountFadeEdge();
    destroyMount(root);
    expect(root.hasAttribute("data-at-edge")).toBe(false);
  });
});
