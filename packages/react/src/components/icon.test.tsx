import { stableIconNames, type IconData, type IconSet } from "@skryensya/core/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import { materialIcons } from "@skryensya/icons-material";
import { phosphorIcons } from "@skryensya/icons-phosphor";
import { render, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Icon, IconSetProvider } from "./icon.js";

/* The real sets, not fixtures. A stub here would let the shipped geometry rot, and these three are
 * the whole portability claim: the same call sites, three drawings. */
const sets: [string, IconSet][] = [
  ["lucide", lucideIcons],
  ["phosphor", phosphorIcons],
  ["material", materialIcons],
];

const set = lucideIcons;

/* Geometry from OUTSIDE the set: the one thing that is opt-in. */
const project: IconData = {
  viewBox: "0 0 24 24",
  attrs: { fill: "none", stroke: "currentColor", "stroke-width": "2" },
  body: `<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />`,
};

function renderIcon(ui: React.ReactNode) {
  const result = render(<IconSetProvider set={set}>{ui}</IconSetProvider>);
  return { ...result, svg: () => result.container.querySelector("svg")! };
}

describe("Icon React contracts", () => {
  it("resolves a stable name against the bound set", () => {
    const { svg } = renderIcon(<Icon name="chevron-down" />);

    expect(svg().getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg().innerHTML).toContain("path");
  });

  it("renders project geometry without any binding", () => {
    const { container } = render(<Icon data={project} />);

    expect(container.querySelector("svg")!.innerHTML).toContain("M12 3l2.2 5.8");
  });

  it("falls back to the default set (Phosphor) with no provider bound", () => {
    // ADR-19 revisited: a stable name renders zero-config against the default set, the way
    // brands/default.scss ships in core. Opting out is still explicit, install another set and
    // wrap the tree in <IconSetProvider set={…} />.
    const { container } = render(<Icon name="close" />);
    const svg = container.querySelector("svg")!;

    // viewBox is exact (an attribute); the body is asserted by a distinctive substring because jsdom
    // re-serializes the self-closing <path/> into <path></path>, the same way the data= test does.
    expect(svg.getAttribute("viewBox")).toBe(phosphorIcons.close.viewBox);
    expect(svg.innerHTML).toContain("M205.66,194.34a8,8,0,0,1-11.32,11.32");
  });

  it("is decorative without a label, and content with one", () => {
    const decorative = renderIcon(<Icon name="check" />);
    expect(decorative.svg().getAttribute("aria-hidden")).toBe("true");
    expect(decorative.svg().getAttribute("role")).toBeNull();
    decorative.unmount();

    const meaningful = renderIcon(<Icon name="warning" label="Advertencia" />);
    expect(meaningful.svg().getAttribute("role")).toBe("img");
    expect(meaningful.svg().getAttribute("aria-label")).toBe("Advertencia");
    expect(meaningful.svg().getAttribute("aria-hidden")).toBeNull();
  });

  it("never makes the svg a tab stop", () => {
    const { svg } = renderIcon(<Icon name="menu" label="Menú" />);

    expect(svg().getAttribute("focusable")).toBe("false");
  });

  it("carries the set's own fill and stroke, so an outline set stays outline", () => {
    // The whole reason IconData has `attrs`: a CSS `fill: currentColor` would beat a presentation
    // attribute and silently fill every outline set, so the pattern never declares one.
    const { svg } = renderIcon(<Icon name="danger" />);

    expect(svg().getAttribute("fill")).toBe("none");
    expect(svg().getAttribute("stroke")).toBe("currentColor");
  });

  it("writes size as data-size and keeps the class, so one hook does the sizing", () => {
    const { svg } = renderIcon(<Icon name="check" size="lg" className="mine" />);

    expect(svg().getAttribute("data-size")).toBe("lg");
    expect(svg().getAttribute("class")).toBe("sk-icon mine");
  });

  it("defaults to md rather than leaving the size unset", () => {
    const { svg } = renderIcon(<Icon name="check" />);

    expect(svg().getAttribute("data-size")).toBe("md");
  });

  it("lets a set's attrs never override the contract", () => {
    // A set that tries to own accessibility or the viewBox loses: those belong to the binding.
    const hostile = { ...set, check: { ...set.check, attrs: { "aria-hidden": "false", viewBox: "0 0 1 1" } } };
    const { container } = render(
      <IconSetProvider set={hostile}>
        <Icon name="check" label="Listo" />
      </IconSetProvider>,
    );
    const svg = container.querySelector("svg")!;

    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
  });

  it("passes axe decorative inside a labelled control, and standalone with a label", async () => {
    const { container } = render(
      <IconSetProvider set={set}>
        <button type="button">
          <Icon name="check" /> Guardar
        </button>
        <button aria-label="Cerrar diálogo" type="button">
          <Icon name="close" />
        </button>
        <Icon name="warning" label="Advertencia" />
      </IconSetProvider>,
    );

    const result = await axe.run(container);
    expect(result.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toHaveLength(0);
  });

  it("keeps an icon-only button named by the button, not the svg", async () => {
    const { container } = render(
      <IconSetProvider set={set}>
        <button aria-label="Cerrar diálogo" type="button">
          <Icon name="close" />
        </button>
      </IconSetProvider>,
    );

    expect(within(container).getByRole("button", { name: "Cerrar diálogo" })).toBeTruthy();
  });
});

describe.each(sets)("the %s set", (_name, iconSet) => {
  it("covers every stable role with real geometry", () => {
    // `satisfies IconSet` proves completeness at compile time; this proves none of it is a stub and
    // that a library rename didn't silently leave a hole.
    for (const role of stableIconNames) {
      expect(iconSet[role].body.length, role).toBeGreaterThan(0);
      expect(iconSet[role].viewBox, role).toMatch(/^-?[\d.]+ -?[\d.]+ -?[\d.]+ -?[\d.]+$/);
    }
  });

  it("renders every role through the same call site, whatever the drawing", () => {
    // The portability claim, executed: one vocabulary, three libraries, no call site moves.
    for (const role of stableIconNames) {
      const { container, unmount } = render(
        <IconSetProvider set={iconSet}>
          <Icon name={role} />
        </IconSetProvider>,
      );
      const svg = container.querySelector("svg")!;
      expect(svg.getAttribute("viewBox"), role).toBe(iconSet[role].viewBox);
      expect(svg.innerHTML.length, role).toBeGreaterThan(0);
      unmount();
    }
  });

  it("never lets the browser's default black win over the container's color", () => {
    // An icon has no color of its own: it inherits currentColor. A set whose root declares neither
    // fill nor stroke would paint black, invisible in dark mode. Material's raw assets do exactly
    // that, which is why its generator declares fill explicitly.
    for (const role of stableIconNames) {
      const attrs = iconSet[role].attrs ?? {};
      const paints = [attrs.fill, attrs.stroke].filter(Boolean);
      expect(paints.some((p) => p === "currentColor"), `${role}: ${JSON.stringify(attrs)}`).toBe(true);
    }
  });
});
