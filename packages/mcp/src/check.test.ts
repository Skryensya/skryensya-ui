import { describe, expect, it } from "vitest";
import { checkUsage } from "./check.js";
import type { ComponentSchema } from "./catalog.js";

const buttonSchema: ComponentSchema = {
  id: "button",
  surfaces: {
    Button: { use: "action", element: "button" },
    ButtonLink: { use: "navigation", element: "a", requires: ["href"], forbids: ["disabled"] },
  },
  props: {
    variant: ["neutral", "primary", "danger", "ghost"],
    size: ["md", "sm", "lg"],
  },
};

describe("checkUsage", () => {
  it("passes a valid usage with no problems", () => {
    expect(checkUsage(buttonSchema, "Button", { variant: "primary" })).toEqual([]);
  });

  it("flags an unknown surface and lists the real ones", () => {
    const problems = checkUsage(buttonSchema, "Nope", {});
    expect(problems).toHaveLength(1);
    expect(problems[0]?.rule).toBe("unknown-surface");
    expect(problems[0]?.msg).toContain("Button");
    expect(problems[0]?.msg).toContain("ButtonLink");
  });

  it("flags a missing required prop", () => {
    const problems = checkUsage(buttonSchema, "ButtonLink", {});
    expect(problems).toContainEqual({
      rule: "missing-required",
      msg: 'ButtonLink requires "href", not present in the given props.',
    });
  });

  it("flags a forbidden prop that is present", () => {
    const problems = checkUsage(buttonSchema, "ButtonLink", { href: "/docs", disabled: true });
    expect(problems).toContainEqual({
      rule: "forbidden-present",
      msg: 'ButtonLink forbids "disabled", but it is present in the given props.',
    });
  });

  it("flags a value outside the declared enum", () => {
    const problems = checkUsage(buttonSchema, "Button", { variant: "warning" });
    expect(problems).toContainEqual({
      rule: "invalid-value",
      msg: 'Button.variant="warning" is not one of ["neutral","primary","danger","ghost"].',
    });
  });

  it("ignores props the schema never declared as an enum (event handlers, aria-*, …)", () => {
    expect(checkUsage(buttonSchema, "Button", { onClick: () => {}, "aria-label": "Save" })).toEqual([]);
  });

  it("lets a surface-level prop enum override the shared one", () => {
    const schema: ComponentSchema = {
      id: "typography",
      surfaces: {
        Heading: { use: "title", element: "h2", props: { size: ["h1", "h2", "h3"] } },
      },
      props: { size: ["caption", "sm", "body", "lg"] },
    };
    expect(checkUsage(schema, "Heading", { size: "h2" })).toEqual([]);
    expect(checkUsage(schema, "Heading", { size: "caption" })).toContainEqual({
      rule: "invalid-value",
      msg: 'Heading.size="caption" is not one of ["h1","h2","h3"].',
    });
  });
});
