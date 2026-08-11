import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toc } from "./toc.js";

/*
 * Two browser APIs the component leans on and jsdom has neither, so the test owns them: the media
 * query that decides disclosure-vs-rail, and the observer behind the scroll-spy. Holding the
 * observer's callback is the point: it is the only way to say "this heading entered the band".
 */
type ObserverHandle = {
  callback: IntersectionObserverCallback;
  observed: Element[];
  disconnected: boolean;
};

let observers: ObserverHandle[] = [];
let railMatches = false;
const listeners = new Set<() => void>();

class IntersectionObserverStub {
  private handle: ObserverHandle;
  constructor(callback: IntersectionObserverCallback) {
    this.handle = { callback, observed: [], disconnected: false };
    observers.push(this.handle);
  }
  observe(element: Element) {
    this.handle.observed.push(element);
  }
  unobserve() {}
  disconnect() {
    this.handle.disconnected = true;
  }
  takeRecords() {
    return [];
  }
}

/** Feed the spy the intersection state it would get from a real scroll. */
function intersect(entries: Array<{ id: string; isIntersecting: boolean }>) {
  const observer = observers.at(-1);
  if (!observer) throw new Error("no IntersectionObserver was created");
  act(() => {
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
  });
}

function setRail(matches: boolean) {
  railMatches = matches;
  act(() => {
    for (const listener of listeners) listener();
  });
}

const items = [
  { children: "Instalación", href: "#instalacion" },
  { children: "Uso", href: "#uso", level: "h3" as const },
];

beforeEach(() => {
  observers = [];
  listeners.clear();
  railMatches = false;
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    get matches() {
      return railMatches;
    },
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }));

  for (const item of items) {
    const heading = document.createElement("h2");
    heading.id = item.href.slice(1);
    heading.textContent = String(item.children);
    document.body.append(heading);
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
  for (const item of items) document.getElementById(item.href.slice(1))?.remove();
});

describe("Toc", () => {
  it("names the nav after the caption and levels each item", () => {
    const ui = render(<Toc items={items} title="En esta página" />);

    const nav = ui.getByRole("navigation", { name: "En esta página" });
    expect(nav.classList.contains("sk-toc__nav")).toBe(true);
    expect(ui.getByRole("heading", { name: "En esta página" }).classList).toContain("sk-toc__title");

    const levels = Array.from(ui.container.querySelectorAll(".sk-toc__item")).map((item) =>
      item.getAttribute("data-level"),
    );
    // An item without a level is an h2: the common case does not have to say so.
    expect(levels).toEqual(["h2", "h3"]);
    expect(ui.getByRole("link", { name: "Instalación" }).getAttribute("href")).toBe("#instalacion");
  });

  it("seeds aria-current from the composition before the spy reports", () => {
    const ui = render(
      <Toc items={[items[0], { ...items[1], current: true }]} title="En esta página" />,
    );

    expect(ui.getByRole("link", { name: "Uso" }).getAttribute("aria-current")).toBe("true");
    expect(ui.getByRole("link", { name: "Instalación" }).hasAttribute("aria-current")).toBe(false);
  });

  it("moves aria-current as headings enter the band", () => {
    const ui = render(<Toc items={items} title="En esta página" />);

    intersect([{ id: "instalacion", isIntersecting: true }]);
    expect(ui.getByRole("link", { name: "Instalación" }).getAttribute("aria-current")).toBe("true");

    intersect([
      { id: "instalacion", isIntersecting: false },
      { id: "uso", isIntersecting: true },
    ]);
    expect(ui.getByRole("link", { name: "Uso" }).getAttribute("aria-current")).toBe("true");
    expect(ui.getByRole("link", { name: "Instalación" }).hasAttribute("aria-current")).toBe(false);
  });

  it("keeps the last answer when nothing is in the band", () => {
    const ui = render(<Toc items={items} title="En esta página" />);

    intersect([{ id: "uso", isIntersecting: true }]);
    // Between sections is not nowhere, so the reader's place does not blink out.
    intersect([{ id: "uso", isIntersecting: false }]);

    expect(ui.getByRole("link", { name: "Uso" }).getAttribute("aria-current")).toBe("true");
  });

  it("does not spy on a single-entry index", () => {
    render(<Toc items={[items[0]]} title="En esta página" />);
    // One link cannot say where the reader is, so no observer is created at all.
    expect(observers).toHaveLength(0);
  });

  it("opens as a rail and takes the summary out of the tab order where there is room", () => {
    const ui = render(<Toc items={items} title="En esta página" />);
    const details = ui.container.querySelector("details")!;
    const summary = ui.container.querySelector("summary")!;

    // Narrow: a real disclosure, closed, and its own tab stop.
    expect(details.open).toBe(false);
    expect(summary.tabIndex).toBe(0);

    setRail(true);

    expect(details.open).toBe(true);
    expect(summary.tabIndex).toBe(-1);
  });

  it("disconnects the spy on unmount", () => {
    const ui = render(<Toc items={items} title="En esta página" />);
    ui.unmount();
    expect(observers.at(-1)?.disconnected).toBe(true);
  });

  it("renders an item icon as decoration beside its label", () => {
    const ui = render(
      <Toc
        items={[{ ...items[0], icon: <svg data-icon="hash" /> }, items[1]]}
        title="En esta página"
      />,
    );

    const link = ui.getByRole("link", { name: "Instalación" });
    expect(link.querySelector(".sk-toc__icon svg")?.getAttribute("data-icon")).toBe("hash");
    expect(link.querySelector(".sk-toc__label")?.textContent).toBe("Instalación");
  });
});
