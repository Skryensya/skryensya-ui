import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Code, Heading, Link, Output, Text } from "./typography.js";

describe("typography components", () => {
  it("separates heading hierarchy from its visual size", () => {
    const ui = render(<Heading as="h1" size="display-md">Quarterly report</Heading>);
    const heading = ui.getByRole("heading", { level: 1, name: "Quarterly report" });

    expect(heading.classList).toContain("sk-heading");
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
    expect(text.classList).toContain("sk-text");
    expect(text.getAttribute("data-tone")).toBe("secondary");
  });

  it("renders a native link with the shared state layer for hover/press/focus", () => {
    const ui = render(<Link href="/details">Details</Link>);
    const link = ui.getByRole("link", { name: "Details" });

    expect(link.classList).toContain("sk-link");
    expect(link.classList).toContain("sk-interactive");
    // The underline is not configurable, it is always on (WCAG 1.4.1), so there is no data-underline.
    expect(link.getAttribute("data-underline")).toBeNull();
  });

  it("writes a title-block role only when one is asked for", () => {
    const ui = render(
      <>
        <Text textRole="eyebrow">Integración</Text>
        <Text textRole="subtitle">Copia el CSS</Text>
        <Text>Plain</Text>
      </>,
    );

    expect(ui.getByText("Integración").getAttribute("data-role")).toBe("eyebrow");
    expect(ui.getByText("Copia el CSS").getAttribute("data-role")).toBe("subtitle");
    expect(ui.getByText("Plain").hasAttribute("data-role")).toBe(false);
  });

  it("ties an Output to the inputs it is calculated from", () => {
    const ui = render(<Output htmlFor="qty price">42</Output>);

    expect(ui.getByText("42").getAttribute("for")).toBe("qty price");
  });

  it("renders inline code with its part class", () => {
    const ui = render(<Code>/status</Code>);

    expect(ui.getByText("/status").tagName).toBe("CODE");
    expect(ui.getByText("/status").classList).toContain("sk-code");
  });
});
