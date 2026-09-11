import { annotationParts } from "@skryensya/core/annotation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectAnnotated, mountAnnotated } from "./annotation.js";

/*
 * The geometry is proved in `packages/core/src/annotation.test.ts`, against numbers. What is proved
 * here is everything BETWEEN the DOM and those numbers, which is where a diagram actually breaks:
 * which element a selector finds, which coordinate space a rectangle arrives in, and whether a
 * second pass over an unchanged frame rewrites the whole overlay.
 *
 * jsdom lays nothing out, so every box here is stated rather than measured. That is not a weaker
 * test: a real browser's numbers would make the assertions unrepeatable, and the one thing this file
 * has to get right (that the label's box, the target's box and the path all share ONE origin) is
 * exactly what stated rectangles can pin.
 */

type Rect = { x: number; y: number; width: number; height: number };

/** Gives one element a box, in the page's own coordinates, for as long as the test wants it. */
const withBox = (element: Element, rect: Rect): void => {
  element.getBoundingClientRect = () =>
    ({
      x: rect.x,
      y: rect.y,
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
      toJSON: () => rect,
    }) as DOMRect;
};

type Annotation = { for: string; side?: string; text: string; match?: string };

const frame = (annotations: readonly Annotation[]): HTMLElement => {
  const root = document.createElement("div");
  root.className = annotationParts.root;
  root.setAttribute("data-sk-annotated", "");
  root.innerHTML = `
    <div class="${annotationParts.subject}"><p class="part-a">a</p><p class="part-b">b</p></div>
    ${annotations
      .map(
        (annotation) =>
          `<span class="${annotationParts.label}" data-for="${annotation.for}" data-side="${
            annotation.side ?? "inline-start"
          }"${annotation.match ? ` data-match="${annotation.match}"` : ""}>${annotation.text}</span>`,
      )
      .join("")}
    <svg class="${annotationParts.leaders}" aria-hidden="true" focusable="false"></svg>
  `;
  document.body.append(root);
  return root;
};

const labelsOf = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(`:scope > .${annotationParts.label}`));
const overlayOf = (root: HTMLElement) =>
  root.querySelector<SVGSVGElement>(`.${annotationParts.leaders}`)!;

/*
 * One geometry every test below shares, so an assertion can be read without re-deriving it.
 *
 *   the frame  at (0, 0),  600 x 300
 *   the subject at (200, 0), 400 x 300
 *   part-a     at (200, 100), 400 x 60   (middle y = 130)
 *   part-b     at (200, 200), 400 x 60   (middle y = 230)
 *   each label 140 x 20, resting at the top of the gutter, (0, 0)
 */
const layOut = (root: HTMLElement): void => {
  withBox(root, { x: 0, y: 0, width: 600, height: 300 });
  const subject = root.querySelector(`.${annotationParts.subject}`)!;
  withBox(subject, { x: 200, y: 0, width: 400, height: 300 });
  withBox(subject.querySelector(".part-a")!, { x: 200, y: 100, width: 400, height: 60 });
  withBox(subject.querySelector(".part-b")!, { x: 200, y: 200, width: 400, height: 60 });
  for (const label of labelsOf(root)) withBox(label, { x: 0, y: 0, width: 140, height: 20 });
};

describe("connectAnnotated", () => {
  let observed: Element[] = [];
  let fire: (() => void) | null = null;

  beforeEach(() => {
    observed = [];
    fire = null;
    /* The setup file's stub does nothing at all, and half of this component is what happens on the
       SECOND pass. This one records the callback so a test can be the resize. */
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          fire = callback;
        }
        observe(element: Element) {
          observed.push(element);
        }
        unobserve() {}
        disconnect() {
          fire = null;
        }
      },
    );
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it("makes the specimen a specimen: inert, and nothing inside it a tab stop", async () => {
    const root = frame([{ for: "button", text: "trigger" }]);
    const subject = root.querySelector(`.${annotationParts.subject}`)!;
    subject.innerHTML = `<button type="button">open</button><a href="/c">crumb</a>`;
    withBox(root, { x: 0, y: 0, width: 600, height: 300 });
    withBox(subject, { x: 200, y: 0, width: 400, height: 300 });
    withBox(subject.querySelector("button")!, { x: 200, y: 100, width: 80, height: 32 });
    withBox(subject.querySelector("a")!, { x: 290, y: 100, width: 80, height: 32 });
    for (const label of labelsOf(root)) withBox(label, { x: 0, y: 0, width: 140, height: 20 });
    connectAnnotated(root);

    const button = subject.querySelector("button")!;
    const link = subject.querySelector("a")!;
    expect(subject.hasAttribute("inert")).toBe(true);
    expect(button.getAttribute("tabindex")).toBe("-1");
    expect(link.getAttribute("tabindex")).toBe("-1");
    expect(labelsOf(root)[0]!.closest("[inert]")).toBeNull();

    /* Zag restamps tabindex="0" on the accordion trigger after this frame. The watcher writes -1 back. */
    button.setAttribute("tabindex", "0");
    link.setAttribute("tabindex", "0");
    await vi.waitFor(() => {
      expect(button.getAttribute("tabindex")).toBe("-1");
      expect(link.getAttribute("tabindex")).toBe("-1");
    });
  });

  it("lifts each label level with the part it names", () => {
    const root = frame([{ for: ".part-a", text: "part a" }, { for: ".part-b", text: "part b" }]);
    layOut(root);
    connectAnnotated(root);

    const [first, second] = labelsOf(root);
    // part-a's middle is y=130, so a 20px label sits at 120; part-b's is 230, so 220.
    expect(first!.style.translate).toBe("0px 120px");
    expect(second!.style.translate).toBe("0px 220px");
  });

  it("keeps stacked mobile labels in their flow positions", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const root = frame([{ for: ".part-a", text: "part a" }, { for: ".part-b", text: "part b" }]);
    layOut(root);
    connectAnnotated(root);

    const [first, second] = labelsOf(root);
    expect(first!.style.translate).toBe("0px 0px");
    expect(second!.style.translate).toBe("0px 0px");
    expect(overlayOf(root).querySelector("path")!.getAttribute("d")).toContain("L 208 10 L 208 102");
  });

  it("draws one mark per label, each a leader and a ring, in the labels' own order", () => {
    const root = frame([{ for: ".part-a", text: "part a" }, { for: ".part-b", text: "part b" }]);
    layOut(root);
    connectAnnotated(root);

    const overlay = overlayOf(root);
    expect(overlay.childElementCount).toBe(2);
    expect([...overlay.children].map((child) => child.tagName)).toEqual(["g", "g"]);
    const [path, ring] = [...overlay.children[0]!.children];
    /* Level with its target, so one straight segment, running right up to the ring's facing edge
       (the part starts at 200, the ring 2px inside it at 202). */
    expect(path!.getAttribute("d")).toBe("M 140 130 L 202 130");
    // The ring outlines the whole part: its box pulled in by 2 on every side.
    expect(ring!.getAttribute("x")).toBe("202");
    expect(ring!.getAttribute("y")).toBe("102");
    expect(ring!.getAttribute("width")).toBe("396");
    expect(ring!.getAttribute("height")).toBe("56");
  });

  it("keeps one mark per label even when a label has nothing to point at", () => {
    /*
     * The reveal pairs a label with its mark BY INDEX, so a shorter list of marks would light up the
     * wrong ring for every label after the gap. The placeholder is an empty group: it renders
     * nothing and keeps the two lists the same length.
     */
    const root = frame([{ for: ".nothing-here", text: "orphan" }, { for: ".part-a", text: "part a" }]);
    layOut(root);
    connectAnnotated(root);

    const overlay = overlayOf(root);
    expect(overlay.childElementCount).toBe(2);
    expect(overlay.children[0]!.childElementCount).toBe(0);
    expect(overlay.children[1]!.children[0]!.getAttribute("d")).not.toBe("");
  });

  it("names every match when the label asks for all of them", () => {
    // `.part` matches both; one label, one bubble, two leaders and two rings inside one group.
    const root = frame([{ for: "p", match: "all", text: "every part" }]);
    layOut(root);
    connectAnnotated(root);

    const group = overlayOf(root).children[0]!;
    expect(group.childElementCount).toBe(4);
    expect([...group.children].map((child) => child.tagName)).toEqual(["path", "rect", "path", "rect"]);
    /* The two leaders leave the label's edge at DIFFERENT points: all of them from one pixel is a
       starburst, not a fan. Both still leave the same edge, which is what makes it one gesture. */
    const starts = [group.children[0]!, group.children[2]!].map(
      (p) => p.getAttribute("d")!.split(" L ")[0],
    );
    expect(new Set(starts).size).toBe(2);
  });

  it("ignores selector matches in an aria-hidden measurement copy", () => {
    const root = frame([{ for: "p", match: "all", text: "every visible part" }]);
    const subject = root.querySelector<HTMLElement>(`.${annotationParts.subject}`)!;
    subject.insertAdjacentHTML(
      "beforeend",
      '<ol aria-hidden="true"><li><p>shadow a</p></li><li><p>shadow b</p></li></ol>',
    );
    layOut(root);
    for (const [index, target] of subject.querySelectorAll("p").entries()) {
      withBox(target, { x: 200 + index * 20, y: 100, width: 20, height: 20 });
    }
    connectAnnotated(root);

    expect(overlayOf(root).children[0]!.childElementCount).toBe(4);
  });

  it("names a target that is itself aria-hidden", () => {
    const root = frame([{ for: ".separator", text: "separator" }]);
    const subject = root.querySelector<HTMLElement>(`.${annotationParts.subject}`)!;
    subject.insertAdjacentHTML("beforeend", '<span class="separator" aria-hidden="true">/</span>');
    layOut(root);
    withBox(subject.querySelector(".separator")!, { x: 300, y: 100, width: 12, height: 20 });
    connectAnnotated(root);

    expect(overlayOf(root).children[0]!.childElementCount).toBe(2);
  });

  it("draws a leader when a target appears after the first measurement", async () => {
    const root = frame([{ for: ".collapse-trigger", text: "collapsed ancestors" }]);
    layOut(root);
    connectAnnotated(root);
    expect(overlayOf(root).children[0]!.childElementCount).toBe(0);

    const subject = root.querySelector<HTMLElement>(`.${annotationParts.subject}`)!;
    const trigger = document.createElement("button");
    trigger.className = "collapse-trigger";
    subject.append(trigger);
    withBox(trigger, { x: 300, y: 100, width: 40, height: 20 });
    await Promise.resolve();

    expect(overlayOf(root).children[0]!.childElementCount).toBe(2);
  });

  it("still takes only the first match by default", () => {
    const root = frame([{ for: "p", text: "one part" }]);
    layOut(root);
    connectAnnotated(root);
    expect(overlayOf(root).children[0]!.childElementCount).toBe(2);
  });

  it("reveals one mark at a time, pairing it with the label being read", () => {
    const root = frame([{ for: ".part-a", text: "part a" }, { for: ".part-b", text: "part b" }]);
    layOut(root);
    connectAnnotated(root);

    const [first, second] = labelsOf(root);
    const marks = [...overlayOf(root).children];

    first!.dispatchEvent(new Event("pointerenter"));
    expect(marks[0]!.hasAttribute("data-sk-active")).toBe(true);
    expect(marks[1]!.hasAttribute("data-sk-active")).toBe(false);

    // Moving to the next label hands the reveal over rather than lighting up both.
    second!.dispatchEvent(new Event("pointerenter"));
    expect(marks[0]!.hasAttribute("data-sk-active")).toBe(false);
    expect(marks[1]!.hasAttribute("data-sk-active")).toBe(true);

    second!.dispatchEvent(new Event("pointerleave"));
    expect(marks.some((mark) => mark.hasAttribute("data-sk-active"))).toBe(false);
  });

  it("reveals the paired label and mark when its target is hovered", () => {
    const root = frame([{ for: ".part-a", text: "part a" }, { for: ".part-b", text: "part b" }]);
    layOut(root);
    connectAnnotated(root);

    /* Specimen is inert: targets never get pointerenter. The frame hit-tests their boxes instead. */
    const partB = root.querySelector(".part-b")!.getBoundingClientRect();
    root.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: partB.x + partB.width / 2,
        clientY: partB.y + partB.height / 2,
        bubbles: true,
      }),
    );
    expect(labelsOf(root)[1]!.hasAttribute("data-sk-active")).toBe(true);
    expect(overlayOf(root).children[1]!.hasAttribute("data-sk-active")).toBe(true);

    root.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 0, clientY: 0, bubbles: true }),
    );
    expect(overlayOf(root).children[1]!.hasAttribute("data-sk-active")).toBe(false);
  });

  it("reveals on focus too, so the marks are reachable without a pointer", () => {
    const root = frame([{ for: ".part-a", text: "part a" }]);
    layOut(root);
    connectAnnotated(root);

    labelsOf(root)[0]!.dispatchEvent(new Event("focusin", { bubbles: true }));
    expect(overlayOf(root).children[0]!.hasAttribute("data-sk-active")).toBe(true);
  });

  it("writes back which gutter the label actually landed in", () => {
    const root = frame([{ for: ".part-a", side: "inline-end", text: "part a" }]);
    layOut(root);
    // Authored `inline-end`, but laid out clear of the subject's start edge: the boxes win.
    connectAnnotated(root);
    expect(labelsOf(root)[0]!.getAttribute("data-sk-side")).toBe("inline-start");
  });

  it("costs one bad selector its own leader and nothing else", () => {
    const root = frame([
      { for: ":::not a selector", text: "broken" },
      { for: ".part-a", text: "part a" },
    ]);
    layOut(root);
    connectAnnotated(root);

    expect(labelsOf(root)[0]!.style.translate).toBe("0px 0px");
    expect(labelsOf(root)[1]!.style.translate).toBe("0px 120px");
  });

  it("finds a target only inside the subject, never elsewhere on the page", () => {
    const decoy = document.createElement("p");
    decoy.className = "part-a";
    document.body.append(decoy);
    withBox(decoy, { x: 5000, y: 5000, width: 10, height: 10 });

    const root = frame([{ for: ".part-a", text: "part a" }]);
    layOut(root);
    connectAnnotated(root);

    // The decoy is 5000px away: if it had been found, the leader would say so.
    expect(overlayOf(root).children[0]!.children[0]!.getAttribute("d")).toBe("M 140 130 L 202 130");
  });

  it("re-measures when the frame resizes, and follows the part that moved", () => {
    const root = frame([{ for: ".part-a", text: "part a" }]);
    layOut(root);
    connectAnnotated(root);
    expect(labelsOf(root)[0]!.style.translate).toBe("0px 120px");

    // The part moves up, and the label reports the box the browser would now give it: its flow
    // position plus the 120px it was already translated by.
    withBox(root.querySelector(".part-a")!, { x: 200, y: 40, width: 400, height: 60 });
    withBox(labelsOf(root)[0]!, { x: 0, y: 120, width: 140, height: 20 });
    fire!();
    expect(labelsOf(root)[0]!.style.translate).toBe("0px 60px");
  });

  it("reconstructs the flow box from the offset it wrote, so a second pass does not compound", () => {
    const root = frame([{ for: ".part-a", text: "part a" }]);
    layOut(root);
    connectAnnotated(root);

    // A real browser reports the TRANSLATED box on the next read. Simulating that is the whole
    // point: a pass that took it at face value would move the label another 120px every time.
    withBox(labelsOf(root)[0]!, { x: 0, y: 120, width: 140, height: 20 });
    fire!();
    expect(labelsOf(root)[0]!.style.translate).toBe("0px 120px");
  });

  it("writes nothing at all when a pass decides the same thing twice", () => {
    const root = frame([{ for: ".part-a", text: "part a" }]);
    layOut(root);
    connectAnnotated(root);

    const path = overlayOf(root).children[0]!;
    const setAttribute = vi.spyOn(path, "setAttribute");
    withBox(labelsOf(root)[0]!, { x: 0, y: 120, width: 140, height: 20 });
    fire!();
    expect(setAttribute).not.toHaveBeenCalled();
  });

  it("watches the frame, the specimen, every label AND every part it names", () => {
    /*
     * The targets are the half that was missing, and it cost a real defect: an accordion's chevron
     * is an empty icon placeholder when the enhancers run and a 40px `<svg>` one frame later, inside
     * a grid cell that was already that wide. Nothing about the SUBJECT changes, so without watching
     * the part itself the chevron keeps its 0x0 box forever and its label never gets a leader.
     */
    const root = frame([{ for: ".part-a", text: "a" }, { for: ".part-b", text: "b" }]);
    layOut(root);
    connectAnnotated(root);

    expect(observed).toContain(root);
    expect(observed).toContain(root.querySelector(`.${annotationParts.subject}`));
    for (const label of labelsOf(root)) expect(observed).toContain(label);
    expect(observed).toContain(root.querySelector(".part-a"));
    expect(observed).toContain(root.querySelector(".part-b"));
  });

  it("picks up a part that only gets its box after the first pass", () => {
    // Exactly the chevron's story: measured at 0x0, so no mark; grown, so a mark.
    const root = frame([{ for: ".part-a", text: "part a" }]);
    layOut(root);
    withBox(root.querySelector(".part-a")!, { x: 0, y: 0, width: 0, height: 0 });
    connectAnnotated(root);
    expect(overlayOf(root).children[0]!.childElementCount).toBe(0);

    withBox(root.querySelector(".part-a")!, { x: 200, y: 100, width: 400, height: 60 });
    fire!();
    expect(overlayOf(root).children[0]!.childElementCount).toBe(2);
  });

  it("stops measuring once cleaned up", () => {
    const root = frame([{ for: ".part-a", text: "part a" }]);
    layOut(root);
    const off = connectAnnotated(root);
    off();

    expect(fire).toBeNull();
    expect(labelsOf(root)[0]!.style.translate).toBe("0px 120px");
    const part = root.querySelector(".part-a")!.getBoundingClientRect();
    root.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: part.x + part.width / 2,
        clientY: part.y + part.height / 2,
        bubbles: true,
      }),
    );
    expect(overlayOf(root).children[0]!.hasAttribute("data-sk-active")).toBe(false);
  });

  it("does nothing, rather than throwing, on a frame that lost a part", () => {
    const root = document.createElement("div");
    root.setAttribute("data-sk-annotated", "");
    root.innerHTML = `<span class="${annotationParts.label}" data-for=".x">x</span>`;
    document.body.append(root);
    expect(() => connectAnnotated(root)()).not.toThrow();
  });

  it("mounts once per authored root", () => {
    const root = frame([{ for: ".part-a", text: "part a" }]);
    layOut(root);
    expect(mountAnnotated(document)).toBe(1);
    expect(mountAnnotated(document)).toBe(0);
    expect(root.getAttribute("data-sk-ready")).toBe("true");
  });
});
