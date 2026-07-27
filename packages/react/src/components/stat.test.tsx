import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Stat } from "./stat.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Stat", () => {
  it("colors the change by trend, not by sign", () => {
    const ui = render(<Stat change="▼ 2.3%" label="Churn" trend="up" value="0.9%" />);
    expect(ui.getByText("▼ 2.3%").getAttribute("data-trend")).toBe("up");
    expect(ui.getByText("Churn")).toBeTruthy();
    expect(ui.getByText("0.9%")).toBeTruthy();
  });

  it("omits the change element when no change is given", () => {
    const ui = render(<Stat label="Users" value="3,914" />);
    expect(ui.container.querySelector(".sk-stat__change")).toBeNull();
  });

  it("leaves non-numeric values static even when animate is set", () => {
    const ui = render(<Stat animate label="Ingresos" value="48.200 €" />);
    expect(ui.getByText("48.200 €")).toBeTruthy();
  });

  it("counts a numeric value up when animate is on", () => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private readonly cb: IntersectionObserverCallback) {}
        observe() {
          this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
        }
        disconnect() {}
        unobserve() {}
        takeRecords() {
          return [];
        }
        root = null;
        rootMargin = "";
        thresholds = [];
      },
    );
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }));

    const ui = render(
      <Stat
        animate
        format={(n) => `${n} €`}
        label="Ingresos"
        value={48200}
      />,
    );
    expect(ui.container.querySelector(".sk-stat__value-sizer")?.textContent).toBe("48200 €");
    expect(ui.container.querySelector(".sk-stat__value-tick")?.textContent).toBe("48200 €");
  });

  it("accepts animate options without requiring a click path", () => {
    const ui = render(<Stat animate={{ from: 10, whenVisible: false, duration: 0 }} label="N" value={20} />);
    expect(ui.container.querySelector(".sk-stat__value-sizer")?.textContent).toBe("20");
    expect(ui.container.querySelector(".sk-stat__value-tick")?.textContent).toBe("20");
  });

  it("reserves the final value width while counting", () => {
    const ui = render(
      <Stat animate={{ from: 0, whenVisible: false, duration: 0 }} format={(n) => `${n} €`} label="X" value={1000} />,
    );
    expect(ui.container.querySelector(".sk-stat__value-sizer")?.textContent).toBe("1000 €");
    expect(ui.container.querySelector(".sk-stat__value-tick")?.textContent).toBe("1000 €");
  });
});
