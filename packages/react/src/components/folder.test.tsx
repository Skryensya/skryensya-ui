import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultFolderGeometry, folderClipPath, folderPath } from "@skryensya/core/folder";
import { Folder, FolderLink, FolderPreview, FolderStack } from "./folder.js";

/*
 * jsdom has no layout: every `getBoundingClientRect()` is zeroes, and a folder measured from zeroes
 * correctly draws nothing. So the boxes are stated per test and what is checked is what the binding
 * writes from them - the same split `folder.test.ts` takes on the Vanilla side, and for the same
 * reason: the MEASURING is the browser's (exercised for real in `packages/ai-gates`, which renders
 * both bindings and compares the resulting `d`), while the ANATOMY and the drawing are this file's.
 */

/**
 * The folder's leading inset, which is also where its tab starts. Real CSS in a real browser; a
 * literal here, because jsdom lays nothing out and the point is the arithmetic on top of it.
 */
const INSET = 24;

/* The tab is as tall as its label plus its own padding, and the binding MEASURES that rather than
 * reading `--sk-folder-tab-height` - which is only the tab's minimum. So the fold lands wherever the
 * tab really ends, and these tests state that height the same way they state the two widths. */
const TAB_HEIGHT = 62;

/**
 * Sizes every folder box before React's layout effect runs, by class rather than by node.
 *
 * `offsetWidth`/`offsetLeft`, not `getBoundingClientRect()`, because that is what the binding reads:
 * the rect is the TRANSFORMED box and would measure a folder inside any scaled ancestor wrong. jsdom
 * defines these as prototype getters returning 0, so they are re-defined here rather than spied on.
 */
function stubLayout({ width = 600, height = 320, tabWidth = 180, tabHeight = TAB_HEIGHT } = {}) {
  const size = (element: Element, property: "offsetWidth" | "offsetHeight" | "offsetLeft") => {
    const tab = element.classList.contains("sk-folder__tab");
    const folder = element.classList.contains("sk-folder");
    if (property === "offsetLeft") return tab ? INSET : 0;
    if (property === "offsetWidth") return tab ? tabWidth : folder ? width : 0;
    return tab ? tabHeight : folder ? height : 0;
  };
  for (const property of ["offsetWidth", "offsetHeight", "offsetLeft"] as const) {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, property);
    Object.defineProperty(HTMLElement.prototype, property, {
      configurable: true,
      get(this: Element) {
        return size(this, property);
      },
    });
    restore.push(() => original && Object.defineProperty(HTMLElement.prototype, property, original));
  }
}

const restore: (() => void)[] = [];

const expectedPath = (width: number, height: number, tabWidth: number) =>
  folderPath({
    ...defaultFolderGeometry,
    tabHeight: TAB_HEIGHT,
    width,
    height,
    tabEnd: INSET + tabWidth,
  });

afterEach(() => {
  while (restore.length) restore.pop()!();
  vi.restoreAllMocks();
});

describe("Folder (React)", () => {
  it("renders the tab, the content and a decorative silhouette behind them", () => {
    stubLayout();
    const ui = render(
      <Folder label={<h3>Radio</h3>}>
        <p>Una radio personal.</p>
      </Folder>,
    );

    const root = ui.container.querySelector(".sk-folder")!;
    expect(ui.getByRole("heading", { name: "Radio" }).closest(".sk-folder__tab")).not.toBeNull();
    expect(ui.getByText("Una radio personal.").closest(".sk-folder__content")).not.toBeNull();

    // The shape is the folder's BACK: it is never content, and never named.
    const shape = root.querySelector(".sk-folder__shape")!;
    expect(shape.getAttribute("aria-hidden")).toBe("true");
    expect(shape.getAttribute("focusable")).toBe("false");
    expect(shape.getAttribute("preserveAspectRatio")).toBe("none");
  });

  it("draws the silhouette from the folder's own box and its tab's width", () => {
    stubLayout({ width: 600, height: 320, tabWidth: 180 });
    const ui = render(<Folder label="Radio">Body</Folder>);

    expect(ui.container.querySelector(".sk-folder__shape")!.getAttribute("viewBox")).toBe("0 0 600 320");
    // The identical string `@skryensya/core/folder` produces, which is what makes this binding and
    // the Vanilla one one component rather than two drawings that resemble each other.
    expect(ui.container.querySelector(".sk-folder__shape-path")!.getAttribute("d")).toBe(
      expectedPath(600, 320, 180),
    );
  });

  /* The stylesheet keeps the shape hidden until this lands, so an unmeasured folder reads as text
   * rather than as an empty box where a folder is about to be. */
  it("marks the root ready only once a real path has been written", () => {
    stubLayout({ width: 0, height: 0 });
    const unmeasured = render(<Folder label="Radio">Body</Folder>);
    expect(unmeasured.container.querySelector(".sk-folder")!.hasAttribute("data-sk-folder-ready")).toBe(false);
    expect(unmeasured.container.querySelector(".sk-folder__shape-path")!.hasAttribute("d")).toBe(false);

    while (restore.length) restore.pop()!();
    stubLayout();
    const measured = render(<Folder label="Radio">Body</Folder>);
    expect(measured.container.querySelector(".sk-folder")!.hasAttribute("data-sk-folder-ready")).toBe(true);
  });

  /* Optional, decorative, and out of the pointer's way: the fan shows what the folder already says
   * in words, so it is `aria-hidden`, and it must never intercept a click meant for the folder in
   * front of it (the stylesheet's `pointer-events: none`). */
  it("fans previews into an aria-hidden layer, and renders none without the slot", () => {
    stubLayout();
    const withPreviews = render(
      <Folder
        label="Radio"
        previews={
          <>
            <FolderPreview>
              <img alt="" src="a.png" />
            </FolderPreview>
            <FolderPreview>
              <img alt="" src="b.png" />
            </FolderPreview>
          </>
        }
      >
        Body
      </Folder>,
    );
    const layer = withPreviews.container.querySelector(".sk-folder__previews")!;
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    // Each preview gets the folder's OWN box: a slotted picture clips itself, so the mat and the
    // shadow that tell one from the next have nowhere else to land.
    expect([...layer.children].map((c) => c.className)).toEqual(["sk-folder__preview", "sk-folder__preview"]);

    const plain = render(<Folder label="Radio">Body</Folder>);
    expect(plain.container.querySelector(".sk-folder__previews")).toBeNull();
  });

  /* The shared state layer is a rectangle; on a folder it showed as a grey slab above the fold until
   * it was clipped to this. Written from the same `d` as the path, so they cannot disagree. */
  it("publishes the silhouette as a clip for the state layer to follow", () => {
    stubLayout();
    const ui = render(<Folder label="Radio">Body</Folder>);
    const root = ui.container.querySelector<HTMLElement>(".sk-folder")!;
    const d = ui.container.querySelector(".sk-folder__shape-path")!.getAttribute("d")!;
    expect(root.style.getPropertyValue("--sk-folder-clip")).toBe(folderClipPath(d));
  });

  /*
   * The one way a folder reveals without a pointer or a keyboard, and the reason it exists: touch
   * has neither, so before this the fan rendered at `opacity: 0` on every phone, forever.
   */
  it("writes active as the attribute the stylesheet reads, and omits it when off", () => {
    stubLayout();
    const on = render(
      <Folder active label="Radio">
        Body
      </Folder>,
    );
    expect(on.container.querySelector(".sk-folder")!.getAttribute("data-active")).toBe("");

    const off = render(<Folder label="Radio">Body</Folder>);
    expect(off.container.querySelector(".sk-folder")!.hasAttribute("data-active")).toBe(false);
  });

  /* A folder is never painted at rest, and there is no option to make it so - so there is no
   * attribute for one either. What used to be `data-reveal` is now simply what a folder is. */
  it("writes no reveal attribute, because a folder is never visible at rest", () => {
    stubLayout();
    const ui = render(<Folder label="Radio">Body</Folder>);
    const root = ui.container.querySelector(".sk-folder")!;
    expect(root.hasAttribute("data-reveal")).toBe(false);
    // Folders come in one colour too: there is no per-instance tone to write.
    expect(root.hasAttribute("data-tone")).toBe(false);
  });

  /* An RTL folder's tab belongs at the right-hand edge. Read off the computed direction rather than
   * taken as a prop: the document already says this, and a prop is something that can contradict it. */
  it("mirrors the silhouette inside an RTL subtree", () => {
    stubLayout();
    const ui = render(
      <div dir="rtl">
        <Folder label="راديو">Body</Folder>
      </div>,
    );
    expect(ui.container.querySelector(".sk-folder__shape-path")!.getAttribute("d")).toBe(
      folderPath({
        ...defaultFolderGeometry,
        tabHeight: TAB_HEIGHT,
        width: 600,
        height: 320,
        // Laid out from the right: the tab's distance from the INLINE-start edge is what is left of
        // the folder to the left of it, which for these numbers is the same 204.
        tabEnd: 600 - INSET,
        mirror: true,
      }),
    );
  });
});

describe("FolderLink (React)", () => {
  /*
   * The whole surface is the link, which is also what gives `reveal="interaction"` a keyboard: the
   * root takes focus itself, so `:focus-within` fires with nothing else inside focusable.
   */
  it("is a real anchor carrying the folder's own anatomy", () => {
    stubLayout();
    const ui = render(
      <FolderLink href="/proyectos/radio" label={<h3>Radio</h3>}>
        <p>Una radio personal.</p>
      </FolderLink>,
    );
    const link = ui.getByRole("link", { name: /Radio/ });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/proyectos/radio");
    expect(link.classList.contains("sk-folder")).toBe(true);
    // Hover/press colour comes from the shared state-layer pattern, never from this component.
    expect(link.classList.contains("sk-interactive")).toBe(true);
    expect(link.querySelector(".sk-folder__shape-path")!.getAttribute("d")).toBe(expectedPath(600, 320, 180));
  });
});

describe("FolderStack (React)", () => {
  it("holds folders directly, with no wrapper element between them", () => {
    stubLayout();
    const ui = render(
      <FolderStack>
        <Folder label="Radio">Body</Folder>
        <Folder label="Printer">Body</Folder>
      </FolderStack>,
    );
    const stack = ui.container.querySelector(".sk-folder-stack")!;
    // The overlap is one CSS rule between siblings; an `<li>` in between would exist only to be
    // the thing that rule selects.
    expect([...stack.children].map((child) => child.className)).toEqual(["sk-folder", "sk-folder"]);
  });

  it("passes an overlap through as the custom property the stylesheet reads", () => {
    stubLayout();
    const ui = render(
      <FolderStack overlap="180px">
        <Folder label="Radio">Body</Folder>
      </FolderStack>,
    );
    const stack = ui.container.querySelector<HTMLElement>(".sk-folder-stack")!;
    expect(stack.style.getPropertyValue("--sk-folder-stack-overlap")).toBe("180px");
  });
});
