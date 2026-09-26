import { tabbables, trapModalDialogs } from "@skryensya/core/focus-trap";
import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { initComponents } from "../runtime/registry.js";

/*
 * The modal Tab wrap (`@skryensya/core/focus-trap`, decision 24), proved here because core's own
 * suite runs in Node with no DOM. jsdom has no top layer; the floor's `showModal` shim is what makes
 * `:modal` answer, and nothing here depends on layout.
 */

const releases: Array<() => void> = [];
const hold = () => releases.push(trapModalDialogs(document));

afterEach(() => {
  while (releases.length) releases.pop()!();
  for (const dialog of Array.from(document.querySelectorAll("dialog"))) if (dialog.open) dialog.close();
  document.body.innerHTML = "";
});

function setup(inner = `<button id="first">First</button><input id="middle"><button id="last">Last</button>`) {
  document.body.innerHTML = `<button id="outside">Outside</button><dialog id="box">${inner}</dialog>`;
  return document.getElementById("box") as HTMLDialogElement;
}

const byId = (id: string) => document.getElementById(id) as HTMLElement;
const tab = (from: Element, shiftKey = false) => fireEvent.keyDown(from, { key: "Tab", shiftKey });

describe("tabbables", () => {
  it("lists the stops in document order and skips what Tab never lands on", () => {
    document.body.innerHTML = `
      <div id="scope">
        <button id="a">a</button>
        <button disabled>disabled</button>
        <button tabindex="-1">opted out</button>
        <input type="hidden">
        <span hidden><button>hidden</button></span>
        <div style="display: none"><a href="#">not displayed</a></div>
        <div inert><button>inert</button></div>
        <a>no href</a>
        <div tabindex="0" id="b">b</div>
        <a href="#" id="c">c</a>
      </div>`;
    expect(tabbables(byId("scope")).map((element) => element.id)).toEqual(["a", "b", "c"]);
  });

  it("counts a named radio group as one stop: the checked radio, else the first", () => {
    document.body.innerHTML = `
      <div id="scope">
        <input type="radio" name="size" id="s"><input type="radio" name="size" id="m" checked>
        <input type="radio" name="tone" id="x"><input type="radio" name="tone" id="y">
      </div>`;
    expect(tabbables(byId("scope")).map((element) => element.id)).toEqual(["m", "x"]);
  });

  it("includes the scope itself only when asked and only when it is a stop", () => {
    document.body.innerHTML = `<button id="scope"><span>label</span></button>`;
    expect(tabbables(byId("scope"))).toEqual([]);
    expect(tabbables(byId("scope"), { includeScope: true })).toEqual([byId("scope")]);
  });
});

describe("the modal Tab wrap", () => {
  it("wraps last to first and first to last inside a modal dialog", () => {
    hold();
    setup().showModal();
    byId("last").focus();
    tab(byId("last"));
    expect(document.activeElement).toBe(byId("first"));
    tab(byId("first"), true);
    expect(document.activeElement).toBe(byId("last"));
  });

  it("leaves the middle of the order to the browser", () => {
    hold();
    setup().showModal();
    byId("middle").focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    byId("middle").dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(byId("middle"));
  });

  it("re-enters from <body> at the end Tab was heading for", () => {
    hold();
    setup().showModal();
    tab(document.body);
    expect(document.activeElement).toBe(byId("first"));
    (document.activeElement as HTMLElement).blur();
    tab(document.body, true);
    expect(document.activeElement).toBe(byId("last"));
  });

  it("swallows Tab in a modal with nothing to focus rather than let it leave", () => {
    hold();
    setup(`<p>Nothing to press.</p>`).showModal();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    document.body.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("does nothing for a dialog opened non-modally", () => {
    hold();
    setup().show();
    byId("last").focus();
    tab(byId("last"));
    expect(document.activeElement).toBe(byId("last"));
  });

  it("wraps inside the innermost modal when one opened another", () => {
    hold();
    document.body.innerHTML = `
      <dialog id="outer"><button id="o1">o1</button>
        <dialog id="inner"><button id="i1">i1</button><button id="i2">i2</button></dialog>
      </dialog>`;
    (byId("outer") as HTMLDialogElement).showModal();
    (byId("inner") as HTMLDialogElement).showModal();
    byId("i2").focus();
    tab(byId("i2"));
    expect(document.activeElement).toBe(byId("i1"));
  });

  it("stands aside when a widget inside has already handled Tab", () => {
    hold();
    setup().showModal();
    byId("last").addEventListener("keydown", (event) => event.preventDefault());
    byId("last").focus();
    tab(byId("last"));
    expect(document.activeElement).toBe(byId("last"));
  });

  it("ignores Ctrl+Tab, which belongs to the browser", () => {
    hold();
    setup().showModal();
    byId("last").focus();
    fireEvent.keyDown(byId("last"), { key: "Tab", ctrlKey: true });
    expect(document.activeElement).toBe(byId("last"));
  });

  it("keeps one listener for many holders and removes it with the last", () => {
    const first = trapModalDialogs(document);
    const second = trapModalDialogs(document);
    setup().showModal();
    first();
    first(); // releasing twice is a no-op, not a second release
    byId("last").focus();
    tab(byId("last"));
    expect(document.activeElement).toBe(byId("first"));
    second();
    byId("last").focus();
    tab(byId("last"));
    expect(document.activeElement).toBe(byId("last"));
  });

  it("is installed by initComponents for any page with a dialog in it", async () => {
    const dialog = setup();
    expect(await initComponents(document.body)).toBeGreaterThan(0);
    dialog.showModal();
    byId("last").focus();
    tab(byId("last"));
    expect(document.activeElement).toBe(byId("first"));
  });
});
