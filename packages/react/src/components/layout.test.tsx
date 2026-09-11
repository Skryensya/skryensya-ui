import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Box, Footer, Grid, Hero, Inline, LayoutGrid, Main, Stack, Wrapper } from "./layout.js";

describe("layout primitives", () => {
  it("keeps semantic ownership with the caller while applying Box defaults", () => {
    const ui = render(
      <Box as="section" aria-label="Summary" border="subtle" padding="lg" surface="raised">
        Summary
      </Box>,
    );

    const box = ui.getByRole("region", { name: "Summary" });
    expect(box.classList).toContain("sk-box");
    expect(box.getAttribute("data-surface")).toBe("raised");
    expect(box.getAttribute("data-border")).toBe("subtle");
    expect(box.getAttribute("data-padding")).toBe("lg");
  });

  it("renders Stack, Inline and Grid as the documented layout contracts", () => {
    const ui = render(
      <>
        <Stack as="ul" align="stretch" gap="lg"><li>One</li></Stack>
        <Inline align="baseline" blockStart="auto" equal gap="sm" justify="between" wrap={false}>Inline</Inline>
        <Grid columns={3} gap="xs" multicol>Grid</Grid>
      </>,
    );

    expect(ui.container.querySelector("ul.sk-stack")?.getAttribute("data-gap")).toBe("lg");
    expect(ui.container.querySelector(".sk-inline")?.getAttribute("data-wrap")).toBe("false");
    expect(ui.container.querySelector(".sk-inline")?.getAttribute("data-justify")).toBe("between");
    expect(ui.container.querySelector(".sk-inline")?.hasAttribute("data-equal")).toBe(true);
    expect(ui.container.querySelector(".sk-grid")?.getAttribute("data-columns")).toBe("3");
    expect(ui.container.querySelector(".sk-grid")?.hasAttribute("data-multicol")).toBe(true);
  });

  it("omits data-block-start when Inline's space above is the default none", () => {
    const ui = render(<Inline>Inline</Inline>);

    expect(ui.container.querySelector(".sk-inline")?.hasAttribute("data-block-start")).toBe(false);
  });

  it("switches Grid into responsive rows and lets a child request a wider span", () => {
    const ui = render(
      <Grid columns={3} gap="sm" responsive>
        <div data-span="2">Featured</div>
        <div>Plain</div>
      </Grid>,
    );

    const grid = ui.container.querySelector(".sk-grid");
    expect(grid?.hasAttribute("data-responsive")).toBe(true);
    expect(grid?.hasAttribute("data-multicol")).toBe(false);
    expect(grid?.querySelector("[data-span='2']")?.textContent).toBe("Featured");
  });

  it("renders LayoutGrid while leaving width on its semantic children", () => {
    const ui = render(
      <LayoutGrid as="main" className="document">
        <p data-width="narrow">Summary</p>
        <section data-width="full-width">Hero</section>
        <nav data-width="rail-start">Index</nav>
        <aside data-width="rail">Toc</aside>
      </LayoutGrid>,
    );

    const grid = ui.container.querySelector("main.sk-layout-grid.document");
    expect(grid).not.toBeNull();
    expect(grid?.querySelector("p")?.getAttribute("data-width")).toBe("narrow");
    expect(grid?.querySelector("section")?.getAttribute("data-width")).toBe("full-width");
    expect(grid?.querySelector("nav")?.getAttribute("data-width")).toBe("rail-start");
    expect(grid?.querySelector("aside")?.getAttribute("data-width")).toBe("rail");
  });

  it("renders Main as an empty application landmark", () => {
    const ui = render(<Main aria-label="Workspace" />);

    expect(ui.getByRole("main", { name: "Workspace" }).childElementCount).toBe(0);
  });

  it("renders Wrapper as a page column on the size scale", () => {
    const ui = render(
      <Wrapper as="main" size="lg">
        Document
      </Wrapper>,
    );

    const wrapper = ui.container.querySelector("main.sk-wrapper");
    expect(wrapper?.getAttribute("data-size")).toBe("lg");
  });

  it("renders Footer as a contentinfo landmark with its documented defaults", () => {
    const ui = render(<Footer aria-label="Site footer">Footer content</Footer>);

    const footer = ui.getByRole("contentinfo", { name: "Site footer" });
    expect(footer.classList).toContain("sk-footer");
    expect(footer.getAttribute("data-padding")).toBe("lg");
    expect(footer.getAttribute("data-surface")).toBe("sunken");
    expect(footer.getAttribute("data-divider")).toBe("");
  });

  it("lets Footer opt out of the divider, change padding/surface, and drop the landmark via `as`", () => {
    const ui = render(
      <Footer as="div" divider={false} padding="sm" surface="raised" data-testid="nested-footer">
        Nested footer
      </Footer>,
    );

    const footer = ui.getByTestId("nested-footer");
    expect(footer.tagName).toBe("DIV");
    expect(footer.getAttribute("data-divider")).toBe("false");
    expect(footer.getAttribute("data-padding")).toBe("sm");
    expect(footer.getAttribute("data-surface")).toBe("raised");
  });

  it("renders Hero as a plain div with its documented defaults", () => {
    const ui = render(<Hero data-testid="hero">Opening pitch</Hero>);

    const hero = ui.getByTestId("hero");
    expect(hero.tagName).toBe("DIV");
    expect(hero.classList).toContain("sk-hero");
    expect(hero.getAttribute("data-align")).toBe("start");
    expect(hero.getAttribute("data-padding")).toBe("xl");
    expect(hero.getAttribute("data-surface")).toBe("surface");
  });

  it("lets Hero change align/padding/surface and render as a different element via `as`", () => {
    const ui = render(
      <Hero as="section" align="center" padding="lg" surface="sunken" aria-label="Pitch">
        Opening pitch
      </Hero>,
    );

    const hero = ui.getByRole("region", { name: "Pitch" });
    expect(hero.tagName).toBe("SECTION");
    expect(hero.getAttribute("data-align")).toBe("center");
    expect(hero.getAttribute("data-padding")).toBe("lg");
    expect(hero.getAttribute("data-surface")).toBe("sunken");
  });
});
