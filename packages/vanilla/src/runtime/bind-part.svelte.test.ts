import { flushSync, mount, unmount } from "svelte";
import { describe, expect, it } from "vitest";
import type { BindPartsOptions, PartBinding } from "./bind-part.svelte.js";
import Fixture from "./bind-part.test.svelte";

/*
 * These tests exist to pin the four facts `bindParts` states as invariants, because each of them is
 * today a comment in whichever enhancer last got bitten by it: one effect per enhancer, attributes
 * before events, a part is never half-bound, and teardown is total.
 *
 * The half-bound one is the reason the module exists at all. `NumberField.svelte` shipped with a
 * five-part guard on its patch and a three-part guard on its wiring, so incomplete markup got live
 * listeners and no attributes. Written as an entry per part, that state cannot be expressed - and this
 * is the test that says so out loud rather than trusting the shape.
 */

function render(bindings: readonly PartBinding[], options?: BindPartsOptions) {
  const target = document.createElement("div");
  document.body.append(target);
  const app = mount(Fixture, { target, props: { bindings, options } });
  flushSync();
  return {
    destroy() {
      void unmount(app);
      target.remove();
    },
  };
}

const el = (tag = "button") => document.createElement(tag) as HTMLElement;

describe("bindParts", () => {
  it("patches a part's attributes onto its node", () => {
    const trigger = el();
    const app = render([
      { part: "trigger", node: () => trigger, props: () => ({ "data-part": "trigger" }) },
    ]);

    expect(trigger.getAttribute("data-part")).toBe("trigger");
    app.destroy();
  });

  it("stays silent when a part is absent from the markup", () => {
    const present = el();
    const app = render([
      { part: "root", node: () => present, props: () => ({ "data-part": "root" }) },
      { part: "missing", node: () => null, props: () => ({ "data-part": "missing" }) },
    ]);

    expect(present.getAttribute("data-part")).toBe("root");
    app.destroy();
  });

  it("never leaves a part half-bound: no attributes means no listeners either", () => {
    /*
     * The `NumberField` defect, stated as a property. A part whose node is absent must not acquire
     * listeners through some other path, because a live listener over an unpatched node is a machine
     * that runs and writes nothing back.
     */
    let fired = 0;
    let node: HTMLElement | null = null;

    const app = render([
      {
        part: "trigger",
        node: () => node,
        events: true,
        props: () => ({ "data-part": "trigger", onclick: () => (fired += 1) }),
      },
    ]);

    // The part was absent at mount, so nothing was patched and nothing was wired.
    node = el();
    node.dispatchEvent(new Event("click"));
    expect(fired).toBe(0);
    expect(node.hasAttribute("data-part")).toBe(false);

    app.destroy();
  });

  it("wires events on a part that is present, and re-reads the handler on every firing", () => {
    const trigger = el();
    let clicks = 0;

    const app = render([
      {
        part: "trigger",
        node: () => trigger,
        events: true,
        props: () => ({ onclick: () => (clicks += 1) }),
      },
    ]);

    trigger.dispatchEvent(new Event("click"));
    trigger.dispatchEvent(new Event("click"));

    expect(clicks).toBe(2);
    app.destroy();
  });

  it("wires a node once, however many times the effect runs", () => {
    const trigger = el();
    let clicks = 0;

    const app = render([
      {
        part: "trigger",
        node: () => trigger,
        events: true,
        props: () => ({ onclick: () => (clicks += 1) }),
      },
    ]);

    flushSync();
    flushSync();
    trigger.dispatchEvent(new Event("click"));

    // Two listeners on one node would count this click twice.
    expect(clicks).toBe(1);
    app.destroy();
  });

  it("releases every listener it wired when the enhancer is destroyed", () => {
    const trigger = el();
    let clicks = 0;

    const app = render([
      {
        part: "trigger",
        node: () => trigger,
        events: true,
        props: () => ({ onclick: () => (clicks += 1) }),
      },
    ]);

    app.destroy();
    trigger.dispatchEvent(new Event("click"));

    expect(clicks).toBe(0);
  });

  it("skips a part for this round when its props come back null, without unbinding it", () => {
    const row = el();
    let give = true;
    let clicks = 0;

    const app = render([
      {
        part: "item",
        node: () => row,
        events: true,
        props: () =>
          give ? { "data-part": "item", onclick: () => (clicks += 1) } : null,
      },
    ]);

    expect(row.getAttribute("data-part")).toBe("item");

    give = false;
    flushSync();

    row.dispatchEvent(new Event("click"));
    expect(clicks).toBe(1);

    app.destroy();
  });

  it("guarantees the classes a part declares, without touching the ones the author wrote", () => {
    const trigger = el();
    trigger.className = "sk-tabs__trigger";

    const app = render([
      {
        part: "trigger",
        node: () => trigger,
        classes: ["sk-interactive"],
        props: () => ({}),
      },
    ]);

    expect(trigger.classList.contains("sk-tabs__trigger")).toBe(true);
    expect(trigger.classList.contains("sk-interactive")).toBe(true);
    app.destroy();
  });

  it("runs `then` after every part has been patched", () => {
    const trigger = el();
    const content = el("div");
    let seen: string | null = null;

    const app = render(
      [
        { part: "trigger", node: () => trigger, props: () => ({ "data-part": "trigger" }) },
        { part: "content", node: () => content, props: () => ({ id: "panel-1" }) },
      ],
      {
        // Tabs' aria-controls correction in miniature: reads one part, writes another.
        then: () => {
          seen = content.getAttribute("id");
          if (seen) trigger.setAttribute("aria-controls", seen);
        },
      },
    );

    expect(seen).toBe("panel-1");
    expect(trigger.getAttribute("aria-controls")).toBe("panel-1");
    app.destroy();
  });

  it("writes style once under the `once` policy", () => {
    const track = el("div");

    const app = render([
      {
        part: "track",
        node: () => track,
        style: "once",
        props: () => ({ style: { "scroll-snap-type": "x mandatory" } }),
      },
    ]);

    expect(track.style.getPropertyValue("scroll-snap-type")).toBe("x mandatory");

    // What the machine does mid-drag; a re-patch must not undo it.
    track.style.setProperty("scroll-snap-type", "none");
    flushSync();

    expect(track.style.getPropertyValue("scroll-snap-type")).toBe("none");
    app.destroy();
  });
});
