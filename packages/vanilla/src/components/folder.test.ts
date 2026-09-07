import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultFolderGeometry, folderClipPath, folderPath } from "@skryensya/core/folder";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountFolder } from "./folder.js";

/*
 * jsdom has no layout: every `getBoundingClientRect()` is zeroes, and a folder measured from zeroes
 * correctly draws nothing at all. So each test states the two boxes the enhancer would have
 * measured in a browser and checks what it writes from them. That is the honest shape of this
 * suite - the MEASURING belongs to the browser (and is exercised for real in `packages/ai-gates`,
 * which renders both bindings and compares the resulting `d`), while what is testable here is the
 * enhancer's own contract: which nodes it finds, what it writes on them, and when it gives up.
 */

const stubBox = (element: Element, { width = 0, height = 0, left = 0 } = {}) => {
  for (const [property, value] of [
    ["offsetWidth", width],
    ["offsetHeight", height],
    ["offsetLeft", left],
  ] as const) {
    Object.defineProperty(element, property, { configurable: true, value });
  }
};

/** The folder's leading inset, which is also where its tab starts. Real CSS in a real browser; a
 *  literal here, because jsdom lays nothing out and the point is the arithmetic on top of it. */
const INSET = 24;

/* The tab is as tall as its label plus its own padding, and the binding MEASURES that rather than
 * reading `--sk-folder-tab-height` - which is only the tab's minimum. So the fold lands wherever the
 * tab really ends, and these tests state that height the same way they state the two widths. */
const TAB_HEIGHT = 62;

function markup({ width = 600, height = 320, tabWidth = 180 } = {}) {
  document.body.innerHTML = `<div class="sk-folder" data-sk-folder data-tone="accent" data-reveal="interaction">
    <svg class="sk-folder__shape" data-sk-folder-shape aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <path class="sk-folder__shape-path" data-sk-folder-path></path>
    </svg>
    <div class="sk-folder__tab" data-sk-folder-tab><h3>Radio</h3></div>
    <div class="sk-folder__content"><p>Una radio personal.</p></div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-folder]")!;
  stubBox(root, { width, height });
  stubBox(document.querySelector("[data-sk-folder-tab]")!, { width: tabWidth, height: TAB_HEIGHT, left: INSET });
  return root;
}

const shape = () => document.querySelector("[data-sk-folder-shape]")!;
const path = () => document.querySelector("[data-sk-folder-path]")!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-folder]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("Folder vanilla enhancer", () => {
  it("draws the silhouette from the folder's own box and its tab's width", () => {
    const root = markup({ width: 600, height: 320, tabWidth: 180 });
    expect(mountFolder(document)).toBe(1);

    expect(shape().getAttribute("viewBox")).toBe("0 0 600 320");
    // The same string `@skryensya/core/folder` produces from those numbers, which is the whole point:
    // the geometry has ONE implementation and both bindings are adapters to it.
    expect(path().getAttribute("d")).toBe(
      folderPath({
        ...defaultFolderGeometry,
        tabHeight: TAB_HEIGHT,
        width: 600,
        height: 320,
        tabEnd: INSET + 180,
      }),
    );
  });

  /* The stylesheet keeps the shape hidden until this lands, so an unmeasured folder is text rather
   * than an empty box where a folder is about to be. */
  it("marks the root ready only once a real path has been written", () => {
    const root = markup();
    expect(root.hasAttribute("data-sk-folder-ready")).toBe(false);
    expect(mountFolder(document)).toBe(1);
    expect(root.hasAttribute("data-sk-folder-ready")).toBe(true);
  });

  it("draws nothing, and stays unready, for a folder with no measurable box", () => {
    const root = markup({ width: 0, height: 0 });
    expect(mountFolder(document)).toBe(1);
    expect(path().hasAttribute("d")).toBe(false);
    expect(root.hasAttribute("data-sk-folder-ready")).toBe(false);
  });

  it("re-measures when either box changes, and observes both", () => {
    const observed: Element[] = [];
    class Observer {
      constructor(private readonly callback: () => void) {
        redraw = () => this.callback();
      }
      observe(element: Element) {
        observed.push(element);
      }
      unobserve() {}
      disconnect() {}
    }
    let redraw = () => {};
    vi.stubGlobal("ResizeObserver", Observer as unknown as typeof ResizeObserver);

    const root = markup({ width: 600, height: 320, tabWidth: 180 });
    expect(mountFolder(document)).toBe(1);
    // The root AND the tab: the tab's width moves on a webfont swap that leaves the root's box
    // untouched, which a root-only observer would never hear about.
    expect(observed).toEqual([root, document.querySelector("[data-sk-folder-tab]")]);

    const before = path().getAttribute("d");
    stubBox(document.querySelector("[data-sk-folder-tab]")!, { width: 320, height: TAB_HEIGHT, left: INSET });
    redraw();
    expect(path().getAttribute("d")).not.toBe(before);
  });

  /* The shared state layer is a rectangle; on a folder it showed as a grey slab above the fold
   * until it was clipped to this. Written from the same `d` as the path, so they cannot disagree. */
  it("publishes the silhouette as a clip for the state layer to follow", () => {
    const root = markup({ width: 600, height: 320, tabWidth: 180 });
    expect(mountFolder(document)).toBe(1);
    expect(root.style.getPropertyValue("--sk-folder-clip")).toBe(
      folderClipPath(path().getAttribute("d")!),
    );
  });

  it("refuses a root missing the nodes it has to draw into", () => {
    document.body.innerHTML = `<div class="sk-folder" data-sk-folder><div class="sk-folder__content">Sin silueta</div></div>`;
    expect(() => mountFolder(document)).toThrow(/data-sk-folder-shape/);
  });

  it("mounts once per root and leaves an already-enhanced folder alone", () => {
    markup();
    expect(mountFolder(document)).toBe(1);
    expect(mountFolder(document)).toBe(0);
  });
});
