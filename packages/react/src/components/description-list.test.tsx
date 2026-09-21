import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionItem, DescriptionList } from "./description-list.js";

describe("DescriptionList", () => {
  it("renders a native dl whose pairs are grouped", () => {
    // The <div> is HTML's own grouping element inside <dl>, not a wrapper invented here: it is what
    // makes a row addressable by a divider or a two-column layout.
    const ui = render(
      <DescriptionList>
        <DescriptionItem term="Order">#4821</DescriptionItem>
        <DescriptionItem term="Placed">10 March 2026</DescriptionItem>
      </DescriptionList>,
    );

    const list = ui.container.querySelector("dl");
    expect(list?.className).toContain("sk-description-list");

    const groups = list?.querySelectorAll(".sk-description-list__group") ?? [];
    expect(groups).toHaveLength(2);
    expect(groups[0]?.tagName).toBe("DIV");
    expect(groups[0]?.querySelector("dt")?.textContent).toBe("Order");
    expect(groups[0]?.querySelector("dd")?.textContent).toBe("#4821");
  });

  it("defaults to the stacked layout and takes columns", () => {
    const stacked = render(
      <DescriptionList>
        <DescriptionItem term="Order">#4821</DescriptionItem>
      </DescriptionList>,
    );
    expect(stacked.container.querySelector("dl")?.getAttribute("data-layout")).toBe("stacked");

    const columns = render(
      <DescriptionList layout="columns">
        <DescriptionItem term="Order">#4821</DescriptionItem>
      </DescriptionList>,
    );
    expect(columns.container.querySelector("dl")?.getAttribute("data-layout")).toBe("columns");
  });

  it("writes dividers as a presence attribute, and nothing when off", () => {
    const off = render(
      <DescriptionList>
        <DescriptionItem term="Order">#4821</DescriptionItem>
      </DescriptionList>,
    );
    expect(off.container.querySelector("dl")?.hasAttribute("data-dividers")).toBe(false);

    const on = render(
      <DescriptionList dividers>
        <DescriptionItem term="Order">#4821</DescriptionItem>
      </DescriptionList>,
    );
    expect(on.container.querySelector("dl")?.getAttribute("data-dividers")).toBe("");
  });

  it("writes no density attribute until one is asked for", () => {
    const plain = render(
      <DescriptionList>
        <DescriptionItem term="Order">#4821</DescriptionItem>
      </DescriptionList>,
    );
    expect(plain.container.querySelector("dl")?.hasAttribute("data-density")).toBe(false);

    const compact = render(
      <DescriptionList density="compact">
        <DescriptionItem term="Order">#4821</DescriptionItem>
      </DescriptionList>,
    );
    expect(compact.container.querySelector("dl")?.getAttribute("data-density")).toBe("compact");
  });

  it("takes markup in the value and plain text in the name", () => {
    // The value is where a Tag, a link or a date lands; the name is text, because a name that
    // needed markup is a heading and this is not a section.
    const ui = render(
      <DescriptionList>
        <DescriptionItem term="Tracking">
          <a href="https://example.org/t/4821">4821</a>
        </DescriptionItem>
      </DescriptionList>,
    );
    expect(ui.container.querySelector("dd a")?.getAttribute("href")).toBe("https://example.org/t/4821");
  });

  it("keeps the consumer's className beside each part class", () => {
    const ui = render(
      <DescriptionList className="mine">
        <DescriptionItem className="row" term="Order">
          #4821
        </DescriptionItem>
      </DescriptionList>,
    );
    expect(ui.container.querySelector("dl")?.className).toBe("sk-description-list mine");
    expect(ui.container.querySelector("dl > div")?.className).toBe("sk-description-list__group row");
  });
});
