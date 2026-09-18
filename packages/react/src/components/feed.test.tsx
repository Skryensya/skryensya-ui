import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Feed, FeedArticle } from "./feed.js";

describe("Feed React contracts", () => {
  it("sets role=feed, names it, and writes aria-busy true and false", () => {
    const busy = render(
      <Feed busy label="Actividad reciente">
        <FeedArticle label="Ana. Hace 2 min" posInset={1} setSize={2}>
          Publicó una foto.
        </FeedArticle>
      </Feed>,
    );
    expect(busy.getByRole("feed", { name: "Actividad reciente" }).getAttribute("aria-busy")).toBe(
      "true",
    );
    busy.unmount();

    const idle = render(
      <Feed label="Actividad reciente">
        <FeedArticle label="Ana. Hace 2 min" posInset={1} setSize={1}>
          Publicó una foto.
        </FeedArticle>
      </Feed>,
    );
    // Tri-state ARIA: idle is "false", never omitted (matches contract falseValue + emit).
    expect(idle.getByRole("feed").getAttribute("aria-busy")).toBe("false");
  });

  it("each article gets role=article with aria-posinset/aria-setsize and a real labelled name", () => {
    const ui = render(
      <Feed label="Actividad reciente">
        <FeedArticle label="Ana. Hace 2 min" posInset={1} setSize={2}>
          Publicó una foto.
        </FeedArticle>
        <FeedArticle label="Beto. Hace 5 min" posInset={2} setSize={2}>
          Comentó.
        </FeedArticle>
      </Feed>,
    );
    const articles = ui.getAllByRole("article");
    expect(articles).toHaveLength(2);
    expect(articles[0]!.getAttribute("aria-posinset")).toBe("1");
    expect(articles[0]!.getAttribute("aria-setsize")).toBe("2");
    const labelId = articles[0]!.getAttribute("aria-labelledby");
    expect(labelId).not.toBeNull();
    expect(document.getElementById(labelId!)?.textContent).toBe("Ana. Hace 2 min");
    expect(articles[1]!.getAttribute("aria-posinset")).toBe("2");
  });

  it("allows setSize=-1 for an undetermined total, per WAI's own allowance", () => {
    const ui = render(
      <Feed label="Actividad reciente">
        <FeedArticle label="Ana" posInset={1} setSize={-1}>
          Publicó.
        </FeedArticle>
      </Feed>,
    );
    expect(ui.getByRole("article").getAttribute("aria-setsize")).toBe("-1");
  });
});
