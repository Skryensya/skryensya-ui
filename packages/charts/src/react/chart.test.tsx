import { chartParts } from "@skryensya/core/chart";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { chartAreaPath, chartLinePath } from "../geometry.js";
import { Chart } from "./chart.js";

const points = [
  { label: "Dec", value: 10 },
  { label: "Jan", value: 20 },
  { label: "Feb", value: 5 },
];

describe("geometry", () => {
  it("spreads a series across the unit box and inverts it, so the biggest value is highest", () => {
    // Max is 20, so Jan sits at y=0 (the top) and Feb, a quarter of it, at y=75.
    expect(chartLinePath(points)).toBe("M0 50 L50 0 L100 75");
  });

  it("puts a single point in the middle rather than at the left edge", () => {
    expect(chartLinePath([{ label: "solo", value: 4 }])).toBe("M50 0");
  });

  it("closes an area down to the baseline and back, without drawing the sides", () => {
    // The line, then down to the baseline at the LAST x, back along it, and closed. No vertical
    // edge is stroked because the fill and the line are separate paths.
    expect(chartAreaPath(points)).toBe("M0 50 L50 0 L100 75 L100 100 L0 100 Z");
  });

  it("draws nothing for an empty series instead of a stray dot", () => {
    expect(chartLinePath([])).toBe("");
    expect(chartAreaPath([])).toBe("");
  });

  it("survives a series of zeros rather than dividing by nothing", () => {
    expect(chartLinePath([{ label: "a", value: 0 }, { label: "b", value: 0 }])).toBe("M0 100 L100 100");
  });
});

describe("Chart renderer", () => {
  it("paints no overlay for bars: they never need this package", () => {
    const ui = render(<Chart kind="bar" label="Aportes por mes" points={points} />);
    const root = ui.container.querySelector(`.${chartParts.root}`);

    expect(root?.querySelector("svg")).toBeNull();
    // Without an overlay the fallback bars stay the picture, so the flag CSS reads is absent.
    expect(root?.hasAttribute("data-rendered")).toBe(false);
  });

  it("paints a line into the overlay and flags the chart as rendered", () => {
    const ui = render(<Chart kind="line" label="Visitas por mes" points={points} />);
    const root = ui.container.querySelector(`.${chartParts.root}`);

    expect(root?.getAttribute("data-rendered")).toBe("");
    expect(root?.querySelector(`.${chartParts.overlayLine}`)?.getAttribute("d")).toBe(chartLinePath(points));
    // A line has no fill: the area path is what fills, and this kind has none.
    expect(root?.querySelector(`.${chartParts.overlayArea}`)).toBeNull();
  });

  it("paints an area as TWO paths, so the fill is closed and the stroke is not", () => {
    const ui = render(<Chart kind="area" label="Consumo por hora" points={points} />);
    const root = ui.container.querySelector(`.${chartParts.root}`);

    expect(root?.querySelector(`.${chartParts.overlayArea}`)?.getAttribute("d")).toBe(chartAreaPath(points));
    expect(root?.querySelector(`.${chartParts.overlayLine}`)?.getAttribute("d")).toBe(chartLinePath(points));
  });

  it("keeps the series as a real list of text, which is the accessible rendering", () => {
    const ui = render(<Chart kind="area" label="Consumo por hora" points={points} />);

    // The overlay is decorative; these strings are the data, and they are here whatever the kind.
    expect(ui.getByRole("list")).toBeTruthy();
    expect(ui.getByText("Dec")).toBeTruthy();
    expect(ui.getByText("Jan")).toBeTruthy();
    expect(ui.getAllByRole("listitem")).toHaveLength(3);
  });

  it("hides the overlay from assistive tech, so the series is never read twice", () => {
    const ui = render(<Chart kind="line" label="Visitas por mes" points={points} />);

    expect(ui.container.querySelector(`.${chartParts.overlay}`)?.getAttribute("aria-hidden")).toBe("true");
  });

  it("stretches a unit box instead of measuring the plot", () => {
    const ui = render(<Chart kind="line" label="Visitas por mes" points={points} />);
    const svg = ui.container.querySelector("svg");

    expect(svg?.getAttribute("viewBox")).toBe("0 0 100 100");
    expect(svg?.getAttribute("preserveAspectRatio")).toBe("none");
  });

  it("renders nothing rather than an empty path when there is no data", () => {
    const ui = render(<Chart kind="line" label="Sin datos" points={[]} />);

    expect(ui.container.querySelector("svg")).toBeNull();
  });
});
