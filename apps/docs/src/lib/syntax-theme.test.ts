import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SYNTAX_ROLES, codeTokenTransformer, syntaxRoleClass, syntaxRoleColors } from "./syntax-theme";

const siteCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "styles", "site.css"),
  "utf8",
);

/*
 * The token colours live in two places by necessity: this module builds the Shiki theme, and
 * `site.css` carries the eight classes the transformer points at (a stylesheet cannot import a TS
 * palette). That is exactly the shape that drifts, so it is the shape a test has to hold together.
 */
describe("syntax token classes", () => {
  it("has a rule in site.css for every role, with the colours the theme resolves", () => {
    for (const role of SYNTAX_ROLES) {
      const rule = new RegExp(`\\.${syntaxRoleClass(role)}\\s*\\{([^}]*)\\}`).exec(siteCss);
      expect(rule, `site.css has no .${syntaxRoleClass(role)} rule`).not.toBeNull();
      const body = rule![1];
      expect(body).toContain(`--shiki-light: ${syntaxRoleColors[role].light};`);
      expect(body).toContain(`--shiki-dark: ${syntaxRoleColors[role].dark};`);
    }
  });
});

/** The transformer is what makes the classes reach the markup at all. */
describe("codeTokenTransformer", () => {
  const spanFor = (style: string) => {
    const node = { type: "element", tagName: "span", properties: { style } };
    codeTokenTransformer.span(node);
    return node.properties as Record<string, unknown>;
  };

  it("swaps a role's inline pair for its class", () => {
    const { light, dark } = syntaxRoleColors.string;
    const props = spanFor(`--shiki-light:${light};--shiki-dark:${dark}`);

    expect(props.class).toBe("tk-string");
    expect(props.style).toBeUndefined();
  });

  /*
   * Two roles share the blue override, so the lookup has to be deterministic or the class name
   * depends on map insertion order. `keyword` is declared first and wins.
   */
  it("names a shared colour after the role declared first", () => {
    const { light, dark } = syntaxRoleColors.keyword;
    expect(syntaxRoleColors.definition.light).toBe(light);
    expect(spanFor(`--shiki-light:${light};--shiki-dark:${dark}`).class).toBe("tk-keyword");
  });

  /*
   * Shiki paints an unscoped token with its own built-in grey, which belongs to no palette here.
   * Dropping the style lets `code-preview.css`'s `--color-text-primary` fallback fire instead.
   */
  it("drops a colour that belongs to no role rather than shipping it", () => {
    const props = spanFor("--shiki-light:#333333;--shiki-dark:#BBBBBB");

    expect(props.style).toBeUndefined();
    expect(props.class).toBeUndefined();
  });

  it("leaves a span with no colour alone", () => {
    const node = { type: "element", tagName: "span", properties: { class: "line" } };
    codeTokenTransformer.span(node);

    expect(node.properties).toEqual({ class: "line" });
  });
});
