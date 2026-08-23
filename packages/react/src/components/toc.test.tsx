import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toc } from "./toc.js";

/*
 * One browser API the component leans on that jsdom does not have, so the test owns it: the observer
 * behind the scroll-spy. Holding its callback is the point — it is the only way to say "this heading
 * entered the band". The `matchMedia` stub that used to sit beside it is gone with the disclosure-vs-
 * rail switch it existed for; the index ships one always-open shape now.
 */
type ObserverHandle = {
  callback: IntersectionObserverCallback;
  observed: Element[];
  disconnected: boolean;
};

let observers: ObserverHandle[] = [];

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

const items = [
  { children: "Instalación", href: "#instalacion" },
  { children: "Uso", href: "#uso", level: "h3" as const },
];

beforeEach(() => {
  observers = [];
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

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

    expect(ui.getByRole("link", { name: "Uso" }).getAttribute("aria-current")).toBe("location");
    expect(ui.getByRole("link", { name: "Instalación" }).hasAttribute("aria-current")).toBe(false);
  });

  it("moves aria-current as headings enter the band", () => {
    const ui = render(<Toc items={items} title="En esta página" />);

    intersect([{ id: "instalacion", isIntersecting: true }]);
    expect(ui.getByRole("link", { name: "Instalación" }).getAttribute("aria-current")).toBe("location");

    intersect([
      { id: "instalacion", isIntersecting: false },
      { id: "uso", isIntersecting: true },
    ]);
    expect(ui.getByRole("link", { name: "Uso" }).getAttribute("aria-current")).toBe("location");
    expect(ui.getByRole("link", { name: "Instalación" }).hasAttribute("aria-current")).toBe(false);
  });

  it("keeps the last answer when nothing is in the band", () => {
    const ui = render(<Toc items={items} title="En esta página" />);

    intersect([{ id: "uso", isIntersecting: true }]);
    // Between sections is not nowhere, so the reader's place does not blink out.
    intersect([{ id: "uso", isIntersecting: false }]);

    expect(ui.getByRole("link", { name: "Uso" }).getAttribute("aria-current")).toBe("location");
  });

  it("does not spy on a single-entry index", () => {
    render(<Toc items={[items[0]]} title="En esta página" />);
    // One link cannot say where the reader is, so no observer is created at all.
    expect(observers).toHaveLength(0);
  });

  /* The mirror of the Vanilla binding's own shape test: both halves of the contract have to agree
   * that there is nothing to open, or the two bindings drift back into the two shapes this change
   * collapsed. */
  it("ships one always-open shape, with nothing to disclose", () => {
    const ui = render(<Toc items={items} title="En esta página" />);

    expect(ui.container.querySelector("details")).toBeNull();
    expect(ui.container.querySelector("summary")).toBeNull();
    expect(ui.getAllByRole("link")).toHaveLength(2);
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
