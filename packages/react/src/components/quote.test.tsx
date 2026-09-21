import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Quote } from "./quote.js";

describe("Quote", () => {
  it("renders a figure whose blockquote holds only the quoted words", () => {
    // HTML's own rule, and the reason the root is a figure: the attribution is not quoted material,
    // so it must not sit inside the blockquote.
    const ui = render(
      <Quote attribution="Ursula K. Le Guin">We will not be free if we do not imagine freedom.</Quote>,
    );

    const figure = ui.container.querySelector("figure");
    expect(figure?.className).toContain("sk-quote");

    const blockquote = ui.container.querySelector("blockquote");
    expect(blockquote?.className).toContain("sk-quote__body");
    expect(blockquote?.textContent).toBe("We will not be free if we do not imagine freedom.");
    expect(blockquote?.querySelector("figcaption")).toBeNull();

    expect(figure?.querySelector("figcaption")?.textContent).toBe("Ursula K. Le Guin");
  });

  it("puts the work in a cite element and the person outside it", () => {
    // The split the contract exists to enforce: <cite> is the title of a work, never a name.
    const ui = render(
      <Quote attribution="Ursula K. Le Guin," source="A Non-Euclidean View of California">
        We will not be free if we do not imagine freedom.
      </Quote>,
    );

    const cite = ui.container.querySelector("cite");
    expect(cite?.className).toContain("sk-quote__source");
    expect(cite?.textContent).toBe("A Non-Euclidean View of California");
    expect(cite?.textContent).not.toContain("Le Guin");
  });

  it("omits the caption when there is neither a person nor a work", () => {
    const ui = render(<Quote>An unattributed passage.</Quote>);
    expect(ui.container.querySelector("figcaption")).toBeNull();
  });

  it("renders the caption when only the work is given", () => {
    // A work quoted anonymously is still a work worth naming.
    const ui = render(<Quote source="The Dispossessed">An unattributed passage.</Quote>);
    const caption = ui.container.querySelector("figcaption");
    expect(caption?.textContent).toBe("The Dispossessed");
  });

  it("writes cite as provenance on the blockquote and renders nothing for it", () => {
    const ui = render(
      <Quote cite="https://example.org/talk" attribution="Someone">
        Quoted from a page.
      </Quote>,
    );

    const blockquote = ui.container.querySelector("blockquote");
    expect(blockquote?.getAttribute("cite")).toBe("https://example.org/talk");
    // No browser renders it, and neither does this component.
    expect(ui.container.textContent).not.toContain("https://example.org/talk");
  });

  it("defaults to the block variant and takes pull", () => {
    const block = render(<Quote>Inside the text.</Quote>);
    expect(block.container.querySelector("figure")?.getAttribute("data-variant")).toBe("block");

    const pull = render(<Quote variant="pull">Lifted out of it.</Quote>);
    expect(pull.container.querySelector("figure")?.getAttribute("data-variant")).toBe("pull");
  });

  it("keeps the consumer's className beside the part class", () => {
    const ui = render(<Quote className="mine">Words.</Quote>);
    expect(ui.container.querySelector("figure")?.className).toBe("sk-quote mine");
  });
});
