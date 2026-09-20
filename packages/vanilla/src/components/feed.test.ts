import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { feedArticles, feedExitTarget } from "@skryensya/core/feed-dom";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountFeed } from "./feed.js";

/*
 * THE FEED'S OPT-IN KEYBOARD MODEL, and the DOM helpers under it.
 *
 * `feed-dom.ts` lives in core but core's runner is Node with no DOM (see its vitest config), so
 * the ownership filter and the exit-target search are exercised HERE, against the same functions
 * both bindings call. The key math itself is `packages/core/src/feed.test.ts`.
 */
function markup({ keyboard = true }: { keyboard?: boolean } = {}) {
  document.body.innerHTML = `<button type="button" id="before">Antes</button>
  <div class="sk-feed" data-sk-feed role="feed" aria-label="Actividad" ${keyboard ? 'data-keyboard="true"' : ""}>
    <article class="sk-feed__article" role="article" id="a1" aria-posinset="1" aria-setsize="3">
      <div class="sk-feed__article-label" id="a1-label">Ana</div>
      <div>Publicó una foto. <button type="button" id="a1-reply">Responder</button></div>
    </article>
    <article class="sk-feed__article" role="article" id="a2" aria-posinset="2" aria-setsize="3">
      <div class="sk-feed__article-label" id="a2-label">Beto</div>
      <div>Comentó.</div>
    </article>
    <article class="sk-feed__article" role="article" id="a3" aria-posinset="3" aria-setsize="3">
      <div class="sk-feed__article-label" id="a3-label">Carla</div>
      <div>Cerró un ticket.</div>
    </article>
  </div>
  <button type="button" id="after">Después</button>`;
  const root = document.querySelector<HTMLElement>("[data-sk-feed]")!;
  expect(mountFeed(document)).toBe(1);
  return root;
}

const byId = (id: string) => document.getElementById(id)!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-feed]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("Feed vanilla enhancer", () => {
  it("puts every article in the Tab sequence when the option is on", () => {
    markup();
    // tabindex="0" on each, not a roving 0/-1: WAI's own example, and a feed is read, not operated.
    for (const id of ["a1", "a2", "a3"]) expect(byId(id).getAttribute("tabindex")).toBe("0");
  });

  it("wires nothing at all without data-keyboard, so the option is really opt-in", () => {
    const root = markup({ keyboard: false });
    for (const id of ["a1", "a2", "a3"]) expect(byId(id).hasAttribute("tabindex")).toBe(false);
    /* No tabindex means the article is not focusable AT ALL, so focus never even reaches it:
       `activeElement` stays on the body. That is the stronger statement, and the one an assertion
       about the article keeping focus would have quietly missed. */
    byId("a1").focus();
    expect(document.activeElement).toBe(document.body);
    fireEvent.keyDown(root, { key: "PageDown" });
    expect(document.activeElement).toBe(document.body);
  });

  it("Page Down and Page Up step between articles", () => {
    const root = markup();
    byId("a1").focus();
    fireEvent.keyDown(root, { key: "PageDown" });
    expect(document.activeElement).toBe(byId("a2"));
    fireEvent.keyDown(root, { key: "PageDown" });
    expect(document.activeElement).toBe(byId("a3"));
    fireEvent.keyDown(root, { key: "PageUp" });
    expect(document.activeElement).toBe(byId("a2"));
  });

  it("steps from a control INSIDE an article, not just from the article itself", () => {
    const root = markup();
    byId("a1-reply").focus();
    fireEvent.keyDown(root, { key: "PageDown" });
    expect(document.activeElement).toBe(byId("a2"));
  });

  it("does not consume Page Down on the last article, so the page still scrolls", () => {
    const root = markup();
    byId("a3").focus();
    const event = new KeyboardEvent("keydown", { key: "PageDown", bubbles: true, cancelable: true });
    root.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(byId("a3"));
  });

  it("Ctrl+Home and Ctrl+End leave the feed entirely", () => {
    const root = markup();
    byId("a2").focus();
    fireEvent.keyDown(root, { key: "End", ctrlKey: true });
    expect(document.activeElement).toBe(byId("after"));

    byId("a2").focus();
    fireEvent.keyDown(root, { key: "Home", ctrlKey: true });
    expect(document.activeElement).toBe(byId("before"));
  });

  it("gives articles appended later their tabindex, without focus ever re-entering the feed", async () => {
    const root = markup();
    const fresh = document.createElement("article");
    fresh.id = "a4";
    fresh.setAttribute("role", "article");
    fresh.className = "sk-feed__article";
    root.append(fresh);
    // MutationObserver callbacks are a microtask, so one await is the whole wait.
    await Promise.resolve();
    expect(byId("a4").getAttribute("tabindex")).toBe("0");

    byId("a3").focus();
    fireEvent.keyDown(root, { key: "PageDown" });
    expect(document.activeElement).toBe(byId("a4"));
  });

  it("hands the articles back on teardown, leaving the markup as authored", () => {
    const root = markup();
    destroyMount(root);
    for (const id of ["a1", "a2", "a3"]) expect(byId(id).hasAttribute("tabindex")).toBe(false);
    byId("a1").focus();
    expect(document.activeElement).toBe(document.body);
    fireEvent.keyDown(root, { key: "PageDown" });
    expect(document.activeElement).toBe(document.body);
  });
});

describe("feed-dom, the half both bindings share", () => {
  it("a nested Feed keeps its own articles: ownership is the nearest feed above", () => {
    document.body.innerHTML = `<div id="outer" role="feed" aria-label="Fuera">
      <article role="article" id="o1"></article>
      <div id="inner" role="feed" aria-label="Dentro">
        <article role="article" id="i1"></article>
      </div>
    </div>`;
    const outer = byId("outer");
    const inner = byId("inner");
    // A bare descendant query would have lent `i1` to the outer feed and made both count wrong.
    expect(feedArticles(outer).map((a) => a.id)).toEqual(["o1"]);
    expect(feedArticles(inner).map((a) => a.id)).toEqual(["i1"]);
  });

  it("finds articles through a wrapper element, which a bare child selector would miss", () => {
    document.body.innerHTML = `<div id="feed" role="feed" aria-label="F">
      <div class="column"><article role="article" id="w1"></article></div>
    </div>`;
    expect(feedArticles(byId("feed")).map((a) => a.id)).toEqual(["w1"]);
  });

  it("the exit target is the NEAREST focusable on that side, not the document's first", () => {
    document.body.innerHTML = `<button id="far">Lejos</button><button id="near">Cerca</button>
      <div id="feed" role="feed" aria-label="F"><article role="article" id="x"><button id="inside">No</button></article></div>
      <button id="next">Siguiente</button><button id="last">Último</button>`;
    const feed = byId("feed");
    expect(feedExitTarget(feed, "before")?.id).toBe("near");
    expect(feedExitTarget(feed, "after")?.id).toBe("next");
  });

  it("skips hidden and inert candidates, and never lands back inside the feed", () => {
    document.body.innerHTML = `<button id="ok">Sí</button><button id="off" hidden>No</button>
      <div id="feed" role="feed" aria-label="F"><article role="article" id="x"><button id="inside">No</button></article></div>
      <div inert><button id="inert-one">No</button></div><button id="real">Sí</button>`;
    const feed = byId("feed");
    expect(feedExitTarget(feed, "before")?.id).toBe("ok");
    expect(feedExitTarget(feed, "after")?.id).toBe("real");
  });

  it("returns nothing when that side of the document has no focusable element", () => {
    document.body.innerHTML = `<div id="feed" role="feed" aria-label="F"><article role="article" id="x"></article></div>`;
    expect(feedExitTarget(byId("feed"), "before")).toBeUndefined();
    expect(feedExitTarget(byId("feed"), "after")).toBeUndefined();
  });
});
