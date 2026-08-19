import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Box, Grid, Inline, LayoutGrid, Main, Stack, Wrapper } from "./layout.js";

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
        <Inline align="baseline" equal gap="sm" justify="between" wrap={false}>Inline</Inline>
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

  it("renders LayoutGrid while leaving width on its semantic children", () => {
    const ui = render(
      <LayoutGrid as="main" className="document">
        <p data-width="narrow">Summary</p>
        <section data-width="full-width">Hero</section>
      </LayoutGrid>,
    );

    const grid = ui.container.querySelector("main.sk-layout-grid.document");
    expect(grid).not.toBeNull();
    expect(grid?.querySelector("p")?.getAttribute("data-width")).toBe("narrow");
    expect(grid?.querySelector("section")?.getAttribute("data-width")).toBe("full-width");
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
});
