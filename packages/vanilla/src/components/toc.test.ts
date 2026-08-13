import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectToc, mountToc } from "./toc.js";

/*
 * Two browser facts the enhancer stands on and jsdom ships neither in a useful form: the media query
 * that decides disclosure-vs-rail, and the observer behind the scroll-spy. The test owns both, so it
 * can say "this heading entered the band" without a layout.
 */
type ObserverHandle = {
  callback: IntersectionObserverCallback;
  disconnected: boolean;
};

let observers: ObserverHandle[] = [];
let railMatches = false;
const listeners = new Set<() => void>();
const originalObserver = globalThis.IntersectionObserver;

class IntersectionObserverStub {
  private handle: ObserverHandle;
  constructor(callback: IntersectionObserverCallback) {
    this.handle = { callback, disconnected: false };
    observers.push(this.handle);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    this.handle.disconnected = true;
  }
  takeRecords() {
    return [];
  }
}

function intersect(entries: Array<{ id: string; isIntersecting: boolean }>) {
  const observer = observers.at(-1);
  if (!observer) throw new Error("no IntersectionObserver was created");
  observer.callback(
    entries.map(
      (entry) =>
        ({
          target: document.getElementById(entry.id)!,
          isIntersecting: entry.isIntersecting,
        }) as unknown as IntersectionObserverEntry,
    ),
    {} as IntersectionObserver,
  );
}

function markup(hrefs: readonly string[]): HTMLElement {
  document.body.innerHTML = `
    <aside class="sk-toc" data-sk-toc data-sk-toc-rail>
      <details class="sk-toc__inner" data-sk-toc-disclosure>
        <summary class="sk-toc__summary sk-interactive"><h2 class="sk-toc__title">En esta página</h2></summary>
        <nav aria-label="En esta página">
          <ul class="sk-toc__list">
            ${hrefs
              .map(
                (href) =>
                  `<li class="sk-toc__item" data-level="h2"><a class="sk-toc__link" href="#${href}">${href}</a></li>`,
              )
              .join("")}
          </ul>
        </nav>
      </details>
    </aside>
    ${hrefs.map((href) => `<h2 id="${href}">${href}</h2>`).join("")}`;
  return document.querySelector<HTMLElement>("[data-sk-toc]")!;
}

const linkTo = (href: string) => document.querySelector<HTMLAnchorElement>(`a[href="#${href}"]`)!;

beforeEach(() => {
  observers = [];
  listeners.clear();
  railMatches = false;
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    get matches() {
      return railMatches;
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }));
});

afterEach(() => {
  globalThis.IntersectionObserver = originalObserver;
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

function setRail(matches: boolean) {
  railMatches = matches;
  for (const listener of listeners) listener();
}

describe("Toc Vanilla contracts", () => {
  it("mounts once per authored root", () => {
    markup(["instalacion", "uso"]);
    expect(mountToc(document)).toBe(1);
    // The lifecycle markers make a second pass a no-op, the way every enhancer's do.
    expect(mountToc(document)).toBe(0);
  });

  it("opens as an inert rail where there is room, and closes below it", () => {
    const root = markup(["instalacion", "uso"]);
    connectToc(root);
    const details = root.querySelector("details")!;
    const summary = root.querySelector("summary")!;

    expect(details.open).toBe(false);
    expect(summary.tabIndex).toBe(0);

    setRail(true);

    // Open AND inert: as a rail the summary is a caption, not a control, so it leaves the tab order.
    expect(details.open).toBe(true);
    expect(summary.tabIndex).toBe(-1);

    setRail(false);
    expect(details.open).toBe(false);
    expect(summary.tabIndex).toBe(0);
  });

  it("keeps a plain authored Toc as a native disclosure", () => {
    const root = markup(["instalacion", "uso"]);
    root.removeAttribute("data-sk-toc-rail");
    connectToc(root);
    const details = root.querySelector("details")!;
    const summary = root.querySelector("summary")!;

    setRail(true);

    expect(details.open).toBe(false);
    expect(summary.tabIndex).toBe(0);
  });

  it("marks the first heading in the band, not every one on screen", () => {
    const root = markup(["instalacion", "uso", "api"]);
    connectToc(root);

    intersect([
      { id: "uso", isIntersecting: true },
      { id: "api", isIntersecting: true },
    ]);

    // Document order decides: marking both would light up half the list on a short page.
    expect(linkTo("uso").getAttribute("aria-current")).toBe("true");
    expect(linkTo("api").hasAttribute("aria-current")).toBe(false);
  });

  it("keeps the last answer when the band is empty", () => {
    const root = markup(["instalacion", "uso"]);
    connectToc(root);

    intersect([{ id: "uso", isIntersecting: true }]);
    intersect([{ id: "uso", isIntersecting: false }]);

    // Between sections is not nowhere.
    expect(linkTo("uso").getAttribute("aria-current")).toBe("true");
  });

  it("moves the mark from one section to the next", () => {
    const root = markup(["instalacion", "uso"]);
    connectToc(root);

    intersect([{ id: "instalacion", isIntersecting: true }]);
    expect(linkTo("instalacion").getAttribute("aria-current")).toBe("true");

    intersect([
      { id: "instalacion", isIntersecting: false },
      { id: "uso", isIntersecting: true },
    ]);
    expect(linkTo("uso").getAttribute("aria-current")).toBe("true");
    expect(linkTo("instalacion").hasAttribute("aria-current")).toBe(false);
  });

  it("does not spy on a single destination", () => {
    const root = markup(["instalacion"]);
    connectToc(root);
    expect(observers).toHaveLength(0);
  });

  it("does not spy when the links point at headings that are not there", () => {
    const root = markup(["instalacion", "uso"]);
    for (const id of ["instalacion", "uso"]) document.getElementById(id)!.remove();
    connectToc(root);
    expect(observers).toHaveLength(0);
  });

  it("drops both listeners on cleanup", () => {
    const root = markup(["instalacion", "uso"]);
    const dispose = connectToc(root);

    dispose();

    expect(observers.at(-1)?.disconnected).toBe(true);
    expect(listeners.size).toBe(0);
  });
});
