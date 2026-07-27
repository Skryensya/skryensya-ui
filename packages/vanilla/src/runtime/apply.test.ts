import { describe, expect, it } from "vitest";
import { applyZagProps } from "./apply";

describe("applyZagProps", () => {
  it("deja intacto un atributo autorado que las props traen en undefined", () => {
    // El caso real: `getTriggerProps` de Zag tooltip devuelve `"data-value": undefined` cuando no se
    // le pasa un `value`, y el trigger es además la opción de un Segmented que autoró su `data-value`.
    const node = document.createElement("button");
    node.setAttribute("data-value", "mobile");

    applyZagProps(node, { "data-value": undefined, "data-part": "trigger" });

    expect(node.getAttribute("data-value")).toBe("mobile");
    expect(node.getAttribute("data-part")).toBe("trigger");
  });

  it("sí quita un atributo que las props traen en false", () => {
    const node = document.createElement("button");
    node.setAttribute("data-current", "");

    applyZagProps(node, { "data-current": false });

    expect(node.hasAttribute("data-current")).toBe(false);
  });

  it("quita lo que este runtime escribió antes y ahora llega en undefined", () => {
    const node = document.createElement("button");

    applyZagProps(node, { "aria-describedby": "tip-1" });
    expect(node.getAttribute("aria-describedby")).toBe("tip-1");

    applyZagProps(node, { "aria-describedby": undefined });
    expect(node.hasAttribute("aria-describedby")).toBe(false);
  });
});
