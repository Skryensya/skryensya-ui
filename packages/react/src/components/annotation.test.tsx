import { annotationParts } from "@skryensya/core/annotation";
import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Annotated } from "./annotation.js";

/*
 * The React half of the same contract `connectAnnotated` realizes, held to the same assertions: the
 * geometry is Core's and is proved there, so what is proved here is the wiring around it plus the one
 * hazard React has and the enhancer does not, which is a measuring effect that sets state and
 * therefore schedules the render that would measure again.
 *
 * jsdom lays nothing out, so every box is stated. Same reasoning as the Vanilla suite: measured
 * numbers would make the assertions unrepeatable, and a stated rectangle is exactly what pins the one
 * thing that has to hold, that every box arrives in the frame's own coordinates.
 */

type Rect = { x: number; y: number; width: number; height: number };

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

const specimen = (
  <>
    <p className="part-a">a</p>
    <p className="part-b">b</p>
  </>
);

/* The same geometry the Vanilla suite states, so an assertion can be compared across the two files:
   frame at (0,0) 600x300, subject at (200,0) 400x300, parts at y=100 and y=200, labels 140x20. */
const layOut = (container: HTMLElement): void => {
  const root = container.querySelector<HTMLElement>(`.${annotationParts.root}`)!;
  const subject = container.querySelector<HTMLElement>(`.${annotationParts.subject}`)!;
  withBox(root, { x: 0, y: 0, width: 600, height: 300 });
  withBox(subject, { x: 200, y: 0, width: 400, height: 300 });
  withBox(subject.querySelector(".part-a")!, { x: 200, y: 100, width: 400, height: 60 });
  withBox(subject.querySelector(".part-b")!, { x: 200, y: 200, width: 400, height: 60 });
  for (const label of container.querySelectorAll(`.${annotationParts.label}`)) {
    withBox(label, { x: 0, y: 0, width: 140, height: 20 });
  }
};

const labelsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(`.${annotationParts.label}`));
const overlayOf = (container: HTMLElement) =>
  container.querySelector<SVGSVGElement>(`.${annotationParts.leaders}`)!;

describe("Annotated", () => {
  let fire: (() => void) | null = null;
  let passes = 0;

  beforeEach(() => {
    fire = null;
    passes = 0;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          fire = () => {
            passes += 1;
            callback();
          };
        }
        observe() {}
        unobserve() {}
        disconnect() {
          fire = null;
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the specimen, one label each, and an overlay to draw into", () => {
    const { container } = render(
      <Annotated
        annotations={[{ for: ".part-a", children: "part a" }]}
        label="Anatomy"
        subject={specimen}
      />,
    );

    const root = container.querySelector(`.${annotationParts.root}`)!;
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe("Anatomy");
    expect(container.querySelector(".part-a")).not.toBeNull();
    expect(labelsOf(container)).toHaveLength(1);
    expect(overlayOf(container).getAttribute("aria-hidden")).toBe("true");
  });

  it("leaves the frame unnamed rather than adding an anonymous group", () => {
    const { container } = render(
      <Annotated annotations={[{ for: ".part-a", children: "a" }]} subject={specimen} />,
    );
    expect(container.querySelector(`.${annotationParts.root}`)!.hasAttribute("role")).toBe(false);
  });

  it("makes the specimen inert by default, and never the labels with it", async () => {
    const { container } = render(
      <Annotated
        annotations={[{ for: "button", children: "trigger" }]}
        label="Anatomy"
        subject={
          <>
            <button type="button">open</button>
            <a href="/c">crumb</a>
          </>
        }
      />,
    );
    const subject = container.querySelector(`.${annotationParts.subject}`)!;
    const button = subject.querySelector("button")!;
    const link = subject.querySelector("a")!;
    expect(subject.hasAttribute("inert")).toBe(true);
    expect(button.getAttribute("tabindex")).toBe("-1");
    expect(link.getAttribute("tabindex")).toBe("-1");
    expect(labelsOf(container)[0]!.closest("[inert]")).toBeNull();
    expect(labelsOf(container)[0]!.tabIndex).toBe(0);

    button.setAttribute("tabindex", "0");
    link.setAttribute("tabindex", "0");
    await vi.waitFor(() => {
      expect(button.getAttribute("tabindex")).toBe("-1");
      expect(link.getAttribute("tabindex")).toBe("-1");
    });
  });

  it("leaves the specimen live when inert is refused", () => {
    const { container } = render(
      <Annotated
        annotations={[{ for: "button", children: "trigger" }]}
        inert={false}
        subject={<button type="button">open</button>}
      />,
    );
    expect(container.querySelector(`.${annotationParts.subject}`)!.hasAttribute("inert")).toBe(false);
    expect(container.querySelector("button")!.tabIndex).not.toBe(-1);
  });

  it("writes a label's mobile alignment hook only when requested", () => {
    const { container } = render(
      <Annotated
        annotations={[
          { for: ".part-a", children: "start" },
          { for: ".part-b", mobileAlign: "end", children: "end" },
        ]}
        subject={specimen}
      />,
    );

    expect(labelsOf(container)[0]!.hasAttribute("data-mobile-align")).toBe(false);
    expect(labelsOf(container)[1]!.getAttribute("data-mobile-align")).toBe("end");
  });

  it("lifts each label level with the part it names", () => {
    const { container } = render(
      <Annotated
        annotations={[
          { for: ".part-a", children: "part a" },
          { for: ".part-b", children: "part b" },
        ]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => fire!());

    // part-a's middle is y=130, so a 20px label sits at 120; part-b's is 230, so 220.
    expect(labelsOf(container)[0]!.style.translate).toBe("0px 120px");
    expect(labelsOf(container)[1]!.style.translate).toBe("0px 220px");
  });

  it("keeps stacked mobile labels in their flow positions", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { container } = render(
      <Annotated
        annotations={[
          { for: ".part-a", children: "part a" },
          { for: ".part-b", children: "part b" },
        ]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => fire!());

    expect(labelsOf(container)[0]!.style.translate).toBe("0px 0px");
    expect(labelsOf(container)[1]!.style.translate).toBe("0px 0px");
    expect(overlayOf(container).querySelector("path")!.getAttribute("d")).toContain("L 208 10 L 208 102");
  });

  it("draws the same marks the enhancer draws, in the same shape", () => {
    const { container } = render(
      <Annotated annotations={[{ for: ".part-a", children: "part a" }]} subject={specimen} />,
    );
    layOut(container);
    act(() => fire!());

    const overlay = overlayOf(container);
    expect([...overlay.children].map((child) => child.tagName)).toEqual(["g"]);
    const [path, ring] = [...overlay.children[0]!.children];
    expect(path!.getAttribute("d")).toBe("M 140 130 L 202 130");
    expect(ring!.getAttribute("x")).toBe("202");
    expect(ring!.getAttribute("width")).toBe("396");
  });

  it("keeps one mark per label even when a label has nothing to point at", () => {
    // The reveal pairs a label with its mark by index; a shorter list would light up the wrong ring
    // for every label after the gap.
    const { container } = render(
      <Annotated
        annotations={[
          { for: ".nothing-here", children: "orphan" },
          { for: ".part-a", children: "part a" },
        ]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => fire!());

    const overlay = overlayOf(container);
    expect(overlay.childElementCount).toBe(2);
    expect(overlay.children[0]!.childElementCount).toBe(0);
    expect(overlay.children[1]!.children[0]!.getAttribute("d")).not.toBe("");
  });

  it("names every match when the label asks for all of them", () => {
    const { container } = render(
      <Annotated
        annotations={[{ for: "p", match: "all", children: "every part" }]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => fire!());

    const group = overlayOf(container).children[0]!;
    expect([...group.children].map((child) => child.tagName)).toEqual([
      "path",
      "rect",
      "path",
      "rect",
    ]);
    /* The two leaders leave the label's edge at DIFFERENT points: all of them from one pixel is a
       starburst, not a fan. Both still leave the same edge, which is what makes it one gesture. */
    const starts = [group.children[0]!, group.children[2]!].map(
      (p) => p.getAttribute("d")!.split(" L ")[0],
    );
    expect(new Set(starts).size).toBe(2);
  });

  it("ignores selector matches in an aria-hidden measurement copy", () => {
    const { container } = render(
      <Annotated
        annotations={[{ for: "p", match: "all", children: "every visible part" }]}
        subject={
          <>
            <p>visible a</p>
            <p>visible b</p>
            <ol aria-hidden="true">
              <li>
                <p>shadow a</p>
              </li>
              <li>
                <p>shadow b</p>
              </li>
            </ol>
          </>
        }
      />,
    );
    const root = container.querySelector<HTMLElement>(`.${annotationParts.root}`)!;
    const subject = container.querySelector<HTMLElement>(`.${annotationParts.subject}`)!;
    withBox(root, { x: 0, y: 0, width: 600, height: 300 });
    withBox(subject, { x: 200, y: 0, width: 400, height: 300 });
    for (const [index, target] of subject.querySelectorAll("p").entries()) {
      withBox(target, { x: 200 + index * 20, y: 100, width: 20, height: 20 });
    }
    withBox(labelsOf(container)[0]!, { x: 0, y: 0, width: 140, height: 20 });
    act(() => fire!());

    expect(overlayOf(container).children[0]!.childElementCount).toBe(4);
  });

  it("names a target that is itself aria-hidden", () => {
    const { container } = render(
      <Annotated
        annotations={[{ for: ".separator", children: "separator" }]}
        subject={<span aria-hidden="true" className="separator">/</span>}
      />,
    );
    const root = container.querySelector<HTMLElement>(`.${annotationParts.root}`)!;
    const subject = container.querySelector<HTMLElement>(`.${annotationParts.subject}`)!;
    withBox(root, { x: 0, y: 0, width: 600, height: 300 });
    withBox(subject, { x: 200, y: 0, width: 400, height: 300 });
    withBox(subject.querySelector(".separator")!, { x: 300, y: 100, width: 12, height: 20 });
    withBox(labelsOf(container)[0]!, { x: 0, y: 0, width: 140, height: 20 });
    act(() => fire!());

    expect(overlayOf(container).children[0]!.childElementCount).toBe(2);
  });

  it("draws a leader when a target appears after the first measurement", async () => {
    const { container } = render(
      <Annotated annotations={[{ for: ".collapse-trigger", children: "collapsed ancestors" }]} subject={null} />,
    );
    const root = container.querySelector<HTMLElement>(`.${annotationParts.root}`)!;
    const subject = container.querySelector<HTMLElement>(`.${annotationParts.subject}`)!;
    withBox(root, { x: 0, y: 0, width: 600, height: 300 });
    withBox(subject, { x: 200, y: 0, width: 400, height: 300 });
    withBox(labelsOf(container)[0]!, { x: 0, y: 0, width: 140, height: 20 });
    act(() => fire!());
    expect(overlayOf(container).children[0]!.childElementCount).toBe(0);

    const trigger = document.createElement("button");
    trigger.className = "collapse-trigger";
    subject.append(trigger);
    withBox(trigger, { x: 300, y: 100, width: 40, height: 20 });
    await act(async () => {
      await Promise.resolve();
    });

    expect(overlayOf(container).children[0]!.childElementCount).toBe(2);
  });

  it("still takes only the first match by default", () => {
    const { container } = render(
      <Annotated annotations={[{ for: "p", children: "one part" }]} subject={specimen} />,
    );
    layOut(container);
    act(() => fire!());
    expect(overlayOf(container).children[0]!.childElementCount).toBe(2);
  });

  it("reveals one mark at a time, pairing it with the label being read", () => {
    const { container } = render(
      <Annotated
        annotations={[
          { for: ".part-a", children: "part a" },
          { for: ".part-b", children: "part b" },
        ]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => fire!());

    const [first, second] = labelsOf(container);
    const marks = () => [...overlayOf(container).children];

    fireEvent.pointerEnter(first!);
    expect(marks()[0]!.hasAttribute("data-sk-active")).toBe(true);
    expect(marks()[1]!.hasAttribute("data-sk-active")).toBe(false);

    // Moving to the next label hands the reveal over rather than lighting up both.
    fireEvent.pointerEnter(second!);
    expect(marks()[0]!.hasAttribute("data-sk-active")).toBe(false);
    expect(marks()[1]!.hasAttribute("data-sk-active")).toBe(true);

    fireEvent.pointerLeave(second!);
    expect(marks().some((mark) => mark.hasAttribute("data-sk-active"))).toBe(false);
  });

  it("reveals the paired label and mark when its target is hovered", () => {
    const { container } = render(
      <Annotated
        annotations={[
          { for: ".part-a", children: "part a" },
          { for: ".part-b", children: "part b" },
        ]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => fire!());

    const root = container.querySelector(`.${annotationParts.root}`)!;
    const partB = container.querySelector(".part-b")!.getBoundingClientRect();
    fireEvent.pointerMove(root, {
      clientX: partB.x + partB.width / 2,
      clientY: partB.y + partB.height / 2,
    });
    expect(labelsOf(container)[1]!.hasAttribute("data-sk-active")).toBe(true);
    expect(overlayOf(container).children[1]!.hasAttribute("data-sk-active")).toBe(true);

    fireEvent.pointerMove(root, { clientX: 0, clientY: 0 });
    expect(overlayOf(container).children[1]!.hasAttribute("data-sk-active")).toBe(false);
  });

  it("reveals on focus too, so the marks are reachable without a pointer", () => {
    const { container } = render(
      <Annotated annotations={[{ for: ".part-a", children: "part a" }]} subject={specimen} />,
    );
    layOut(container);
    act(() => fire!());

    const label = labelsOf(container)[0]!;
    expect(label.getAttribute("tabindex")).toBe("0");
    fireEvent.focus(label);
    expect(overlayOf(container).children[0]!.hasAttribute("data-sk-active")).toBe(true);
  });

  it("writes back which gutter the label actually landed in", () => {
    const { container } = render(
      <Annotated
        annotations={[{ for: ".part-a", children: "part a", side: "inline-end" }]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => fire!());

    const label = labelsOf(container)[0]!;
    // The request survives as authored; the outcome is a separate attribute, and they disagree here.
    expect(label.getAttribute("data-side")).toBe("inline-end");
    expect(label.getAttribute("data-sk-side")).toBe("inline-start");
  });

  it("costs one bad selector its own leader and nothing else", () => {
    const { container } = render(
      <Annotated
        annotations={[
          { for: ":::not a selector", children: "broken" },
          { for: ".part-a", children: "part a" },
        ]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => fire!());

    expect(overlayOf(container).childElementCount).toBe(2);
    expect(labelsOf(container)[0]!.style.translate).toBe("0px 0px");
    expect(labelsOf(container)[1]!.style.translate).toBe("0px 120px");
  });

  it("settles instead of spinning: a pass that decides nothing new renders nothing new", () => {
    const { container } = render(
      <Annotated annotations={[{ for: ".part-a", children: "part a" }]} subject={specimen} />,
    );
    layOut(container);
    act(() => fire!());
    const after = passes;

    /* A re-render from the state this just set would re-run the effect and measure again; if that
       ever set state unconditionally, the two would ping-pong forever. The observer firing exactly
       as often as the test fired it is what says the loop closed. */
    expect(passes).toBe(after);
    expect(labelsOf(container)[0]!.style.translate).toBe("0px 120px");
  });

  it("reconstructs the flow box from the offset it painted, so a second pass does not compound", () => {
    const { container } = render(
      <Annotated annotations={[{ for: ".part-a", children: "part a" }]} subject={specimen} />,
    );
    layOut(container);
    act(() => fire!());

    // What a real browser reports once the translate is painted.
    withBox(labelsOf(container)[0]!, { x: 0, y: 120, width: 140, height: 20 });
    act(() => fire!());
    expect(labelsOf(container)[0]!.style.translate).toBe("0px 120px");
  });

  it("survives a second pass that runs before the first one has committed", () => {
    /*
     * THE RACE THE SYMMETRY GATE CAUGHT, as a test. `document.fonts.ready` resolves in the window
     * between a measuring pass setting state and React committing the translate to the element, so
     * the second pass runs against a DOM that has not moved yet. A binding that remembered the
     * offset in a ref would subtract one the layout does not have and land hundreds of pixels away;
     * reading it off the element cannot, because the element is what the browser laid out.
     *
     * Both passes inside ONE `act`, which is precisely what "before the commit" means here.
     */
    const { container } = render(
      <Annotated
        annotations={[
          { for: ".part-a", children: "part a", side: "block-start" },
          { for: ".part-b", children: "part b" },
        ]}
        subject={specimen}
      />,
    );
    layOut(container);
    act(() => {
      fire!();
      fire!();
    });

    // The same answer a single settled pass gives: part-b's middle is y=230, so its label sits at 220.
    expect(labelsOf(container)[1]!.style.translate).toBe("0px 220px");
  });

  it("picks up a part that only gets its box after the first pass", () => {
    // Exactly the accordion chevron's story: measured at 0x0, so no mark; grown, so a mark.
    const { container } = render(
      <Annotated annotations={[{ for: ".part-a", children: "part a" }]} subject={specimen} />,
    );
    layOut(container);
    withBox(container.querySelector(".part-a")!, { x: 0, y: 0, width: 0, height: 0 });
    act(() => fire!());
    expect(overlayOf(container).children[0]!.childElementCount).toBe(0);

    withBox(container.querySelector(".part-a")!, { x: 200, y: 100, width: 400, height: 60 });
    act(() => fire!());
    expect(overlayOf(container).children[0]!.childElementCount).toBe(2);
  });

  it("stops measuring once unmounted", () => {
    const { container, unmount } = render(
      <Annotated annotations={[{ for: ".part-a", children: "part a" }]} subject={specimen} />,
    );
    layOut(container);
    unmount();
    expect(fire).toBeNull();
  });
});
