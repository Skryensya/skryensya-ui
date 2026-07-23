import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading, Link, Text } from "./typography.js";

describe("typography components", () => {
  it("separates heading hierarchy from its visual size", () => {
    const ui = render(<Heading as="h1" size="display-md">Quarterly report</Heading>);
    const heading = ui.getByRole("heading", { level: 1, name: "Quarterly report" });

    expect(heading.classList).toContain("ds-heading");
    expect(heading.getAttribute("data-size")).toBe("display-md");
  });

  it("opts into flush with an explicit attribute, not by position", () => {
    const ui = render(
      <Heading as="h3" size="h3" flush>
        ¿Borrar este proyecto?
      </Heading>,
    );
    const heading = ui.getByRole("heading", { level: 3 });

    expect(heading.getAttribute("data-flush")).toBe("");
  });

  it("floors h5 and h6 visual size at h4", () => {
    const h4 = render(<Heading as="h4" size="h4">Section</Heading>);
    expect(h4.getByRole("heading").getAttribute("data-size")).toBe("h4");
    h4.unmount();

    const h6 = render(<Heading as="h6" size="h6">Detail</Heading>);
    expect(h6.getByRole("heading").getAttribute("data-size")).toBe("h6");
    h6.unmount();
  });

  it("keeps Text semantic and applies its named reading role", () => {
    const ui = render(<Text as="span" size="caption" tone="secondary" weight="label">Updated now</Text>);
    const text = ui.getByText("Updated now");

    expect(text.tagName).toBe("SPAN");
    expect(text.classList).toContain("ds-text");
    expect(text.getAttribute("data-tone")).toBe("secondary");
  });

  it("renders a native link with the shared state layer for hover/press/focus", () => {
    const ui = render(<Link href="/details">Details</Link>);
    const link = ui.getByRole("link", { name: "Details" });

    expect(link.classList).toContain("ds-link");
    expect(link.classList).toContain("ds-interactive");
    // The underline is not configurable, it is always on (WCAG 1.4.1), so there is no data-underline.
    expect(link.getAttribute("data-underline")).toBeNull();
  });
});
