import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LabelledSeparator, Separator } from "./separator.js";

describe("Separator", () => {
  it("renders a native hr that announces as a separator", () => {
    const ui = render(<Separator />);
    const rule = ui.getByRole("separator");
    expect(rule.tagName).toBe("HR");
    expect(rule.className).toContain("sk-separator");
    expect(rule.getAttribute("data-orientation")).toBe("horizontal");
    expect(rule.getAttribute("data-tone")).toBe("default");
    expect(rule.getAttribute("data-spacing")).toBe("md");
  });

  it("keeps the styled and the announced orientation in step", () => {
    // One option behind both spellings, which is why they cannot disagree.
    const ui = render(<Separator orientation="vertical" />);
    const rule = ui.getByRole("separator");
    expect(rule.getAttribute("data-orientation")).toBe("vertical");
    expect(rule.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("leaves the accessibility tree when it is decorative", () => {
    const ui = render(<Separator decorative />);
    expect(ui.queryByRole("separator")).toBeNull();
    const rule = ui.container.querySelector("hr");
    expect(rule?.getAttribute("role")).toBe("presentation");
    expect(rule?.getAttribute("data-decorative")).toBe("");
  });

  it("writes no decorative attribute when it means something", () => {
    const ui = render(<Separator />);
    expect(ui.getByRole("separator").hasAttribute("data-decorative")).toBe(false);
    expect(ui.getByRole("separator").hasAttribute("role")).toBe(false);
  });

  it("takes a tone and a spacing", () => {
    const ui = render(<Separator spacing="none" tone="subtle" />);
    const rule = ui.getByRole("separator");
    expect(rule.getAttribute("data-tone")).toBe("subtle");
    expect(rule.getAttribute("data-spacing")).toBe("none");
  });
});

describe("LabelledSeparator", () => {
  it("names the separator from its visible label", () => {
    // `separator` is not a name-from-content role: without the wiring a screen reader reaches it
    // and says "separator", which is the word the label was written to replace.
    const ui = render(<LabelledSeparator>or</LabelledSeparator>);
    const separator = ui.getByRole("separator", { name: "or" });
    expect(separator.tagName).toBe("DIV");

    const label = ui.getByText("or");
    expect(label.className).toContain("sk-separator__label");
    expect(separator.getAttribute("aria-labelledby")).toBe(label.id);
    expect(label.id).not.toBe("");
  });

  it("hides the two rules, which repeat nothing the label does not say", () => {
    const ui = render(<LabelledSeparator>or</LabelledSeparator>);
    const rules = ui.container.querySelectorAll(".sk-separator__rule");
    expect(rules).toHaveLength(2);
    for (const rule of rules) expect(rule.getAttribute("aria-hidden")).toBe("true");
  });

  it("gives every instance its own label id", () => {
    const ui = render(
      <>
        <LabelledSeparator>or</LabelledSeparator>
        <LabelledSeparator>or</LabelledSeparator>
      </>,
    );
    const [first, second] = ui.getAllByRole("separator");
    expect(first?.getAttribute("aria-labelledby")).not.toBe(second?.getAttribute("aria-labelledby"));
  });
});
