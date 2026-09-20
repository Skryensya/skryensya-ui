import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
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

/*
 * THE OPT-IN KEYBOARD MODEL. The key math and the DOM reading are core's and are tested there and
 * in `@skryensya/vanilla`; what belongs here is that this binding WIRES them, and wires them the
 * same way the enhancer does. The cases are deliberately the mirror of
 * `packages/vanilla/src/components/feed.test.ts`, because "the two bindings agree" is the promise.
 */
describe("Feed React keyboard model", () => {
  const stream = (keyboard: boolean) =>
    render(
      <div>
        <button type="button">Antes</button>
        <Feed keyboard={keyboard} label="Actividad reciente">
          <FeedArticle label="Ana" posInset={1} setSize={3}>
            Publicó una foto. <button type="button">Responder</button>
          </FeedArticle>
          <FeedArticle label="Beto" posInset={2} setSize={3}>
            Comentó.
          </FeedArticle>
          <FeedArticle label="Carla" posInset={3} setSize={3}>
            Cerró un ticket.
          </FeedArticle>
        </Feed>
        <button type="button">Después</button>
      </div>,
    );

  it("puts every article in the Tab sequence, and writes data-keyboard, only when asked", () => {
    const on = stream(true);
    expect(on.getByRole("feed").getAttribute("data-keyboard")).toBe("true");
    for (const article of on.getAllByRole("article")) {
      expect(article.getAttribute("tabindex")).toBe("0");
    }
    on.unmount();

    const off = stream(false);
    // Absent, not "false": the attribute is missing exactly when the default applies, which is
    // what lets authored markup and React agree without either restating the default.
    expect(off.getByRole("feed").hasAttribute("data-keyboard")).toBe(false);
    for (const article of off.getAllByRole("article")) {
      expect(article.hasAttribute("tabindex")).toBe(false);
    }
  });

  it("Page Down and Page Up step between articles, including from a control inside one", () => {
    const ui = stream(true);
    const [first, second, third] = ui.getAllByRole("article");
    const feed = ui.getByRole("feed");

    first!.focus();
    fireEvent.keyDown(feed, { key: "PageDown" });
    expect(document.activeElement).toBe(second);
    fireEvent.keyDown(feed, { key: "PageDown" });
    expect(document.activeElement).toBe(third);
    fireEvent.keyDown(feed, { key: "PageUp" });
    expect(document.activeElement).toBe(second);

    ui.getByRole("button", { name: "Responder" }).focus();
    fireEvent.keyDown(feed, { key: "PageDown" });
    expect(document.activeElement).toBe(second);
  });

  it("does not consume Page Down on the last article, so the page still scrolls", () => {
    const ui = stream(true);
    const articles = ui.getAllByRole("article");
    articles.at(-1)!.focus();
    const event = new KeyboardEvent("keydown", { key: "PageDown", bubbles: true, cancelable: true });
    ui.getByRole("feed").dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(articles.at(-1));
  });

  it("Ctrl+Home and Ctrl+End leave the feed, which is what the pattern asks for", () => {
    const ui = stream(true);
    const feed = ui.getByRole("feed");
    const second = ui.getAllByRole("article")[1]!;

    second.focus();
    fireEvent.keyDown(feed, { key: "End", ctrlKey: true });
    expect(document.activeElement).toBe(ui.getByRole("button", { name: "Después" }));

    second.focus();
    fireEvent.keyDown(feed, { key: "Home", ctrlKey: true });
    expect(document.activeElement).toBe(ui.getByRole("button", { name: "Antes" }));
  });

  it("gives articles rendered later their tabindex, with no prop saying the list changed", () => {
    function Growing() {
      const [count, setCount] = useState(1);
      return (
        <>
          <button onClick={() => setCount(count + 1)} type="button">
            Cargar más
          </button>
          <Feed keyboard label="Actividad reciente">
            {Array.from({ length: count }, (_, index) => (
              <FeedArticle key={index} label={`Autor ${index}`} posInset={index + 1} setSize={-1}>
                Publicó.
              </FeedArticle>
            ))}
          </Feed>
        </>
      );
    }
    const ui = render(<Growing />);
    expect(ui.getAllByRole("article")).toHaveLength(1);
    fireEvent.click(ui.getByRole("button", { name: "Cargar más" }));
    const articles = ui.getAllByRole("article");
    expect(articles).toHaveLength(2);
    for (const article of articles) expect(article.getAttribute("tabindex")).toBe("0");
  });
});
