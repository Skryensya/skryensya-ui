import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Box, Grid, Inline, Stack, Wrapper } from "./layout.js";

describe("layout primitives", () => {
  it("keeps semantic ownership with the caller while applying Box defaults", () => {
    const ui = render(
      <Box as="section" aria-label="Summary" border="subtle" padding="lg" surface="raised">
        Summary
      </Box>,
    );

    const box = ui.getByRole("region", { name: "Summary" });
    expect(box.classList).toContain("ds-box");
    expect(box.getAttribute("data-surface")).toBe("raised");
    expect(box.getAttribute("data-border")).toBe("subtle");
    expect(box.getAttribute("data-padding")).toBe("lg");
  });

  it("renders Stack, Inline and Grid as the documented layout contracts", () => {
    const ui = render(
      <>
        <Stack as="ul" align="stretch" gap="lg"><li>One</li></Stack>
        <Inline align="baseline" gap="sm" wrap={false}>Inline</Inline>
        <Grid columns={3} gap="xs" data-multicol="">Grid</Grid>
      </>,
    );

    expect(ui.container.querySelector("ul.ds-stack")?.getAttribute("data-gap")).toBe("lg");
    expect(ui.container.querySelector(".ds-inline")?.getAttribute("data-wrap")).toBe("false");
    expect(ui.container.querySelector(".ds-grid")?.getAttribute("data-columns")).toBe("3");
    expect(ui.container.querySelector(".ds-grid")?.hasAttribute("data-multicol")).toBe(true);
  });

  it("renders Wrapper as a page column named by use", () => {
    const ui = render(
      <Wrapper as="main" size="shell">
        Document
      </Wrapper>,
    );

    const wrapper = ui.container.querySelector("main.ds-wrapper");
    expect(wrapper?.getAttribute("data-size")).toBe("shell");
  });
});
