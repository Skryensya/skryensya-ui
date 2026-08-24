import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectToc, mountToc } from "./toc.js";

/*
 * One browser fact the enhancer stands on that jsdom does not ship in a useful form: the observer
 * behind the scroll-spy. The test owns it, so it can say "this heading entered the band" without a
 * layout. The `matchMedia` stub this file used to carry alongside it is gone with the breakpoint
 * switch it existed for. The index is always open now, so there is no media query in the enhancer.
 */
type ObserverHandle = {
  callback: IntersectionObserverCallback;
  disconnected: boolean;
};

let observers: ObserverHandle[] = [];
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
    <aside class="sk-toc" data-sk-toc>
      <nav class="sk-toc__nav" aria-label="En esta página">
        <h2 class="sk-toc__title">En esta página</h2>
        <ul class="sk-toc__list" role="list">
          ${hrefs
            .map(
              (href) =>
                `<li class="sk-toc__item" data-level="h2"><a class="sk-toc__link" href="#${href}">${href}</a></li>`,
            )
            .join("")}
        </ul>
      </nav>
    </aside>
    ${hrefs.map((href) => `<h2 id="${href}">${href}</h2>`).join("")}`;
  return document.querySelector<HTMLElement>("[data-sk-toc]")!;
}

const linkTo = (href: string) => document.querySelector<HTMLAnchorElement>(`a[href="#${href}"]`)!;

beforeEach(() => {
  observers = [];
  globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  globalThis.IntersectionObserver = originalObserver;
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("Toc Vanilla contracts", () => {
  it("mounts once per authored root", () => {
    markup(["instalacion", "uso"]);
    expect(mountToc(document)).toBe(1);
    // The lifecycle markers make a second pass a no-op, the way every enhancer's do.
    expect(mountToc(document)).toBe(0);
  });

  /* The shape is the guarantee now: there is no second form to switch into, so what this pins is
   * that nothing here opens, closes or hides the list. The index is readable the moment it renders,
   * before any enhancer runs. */
  it("ships one always-open shape, with nothing to disclose", () => {
    const root = markup(["instalacion", "uso"]);
    connectToc(root);

    expect(root.querySelector("details")).toBeNull();
    expect(root.querySelector("summary")).toBeNull();
    expect(root.querySelectorAll(".sk-toc__link")).toHaveLength(2);
  });

  it("marks the first heading in the band, not every one on screen", () => {
    const root = markup(["instalacion", "uso", "api"]);
    connectToc(root);

    intersect([
      { id: "uso", isIntersecting: true },
      { id: "api", isIntersecting: true },
    ]);

    // Document order decides: marking both would light up half the list on a short page.
    expect(linkTo("uso").getAttribute("aria-current")).toBe("location");
    expect(linkTo("api").hasAttribute("aria-current")).toBe(false);
  });

  it("keeps the last answer when the band is empty", () => {
    const root = markup(["instalacion", "uso"]);
    connectToc(root);

    intersect([{ id: "uso", isIntersecting: true }]);
    intersect([{ id: "uso", isIntersecting: false }]);

    // Between sections is not nowhere.
    expect(linkTo("uso").getAttribute("aria-current")).toBe("location");
  });

  it("moves the mark from one section to the next", () => {
    const root = markup(["instalacion", "uso"]);
    connectToc(root);

    intersect([{ id: "instalacion", isIntersecting: true }]);
    expect(linkTo("instalacion").getAttribute("aria-current")).toBe("location");

    intersect([
      { id: "instalacion", isIntersecting: false },
      { id: "uso", isIntersecting: true },
    ]);
    expect(linkTo("uso").getAttribute("aria-current")).toBe("location");
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

  it("disconnects the observer on cleanup", () => {
    const root = markup(["instalacion", "uso"]);
    const dispose = connectToc(root);

    dispose();

    expect(observers.at(-1)?.disconnected).toBe(true);
  });
});
