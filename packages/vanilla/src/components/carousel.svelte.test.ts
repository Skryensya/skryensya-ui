import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { mountCarousel } from "./carousel.js";

/*
 * jsdom has no layout: every rect is zero, so the machine measures a single snap point and the
 * carousel is correctly a one-pager. `layout()` fakes just enough geometry — a viewport narrower than
 * the content, and one rect per slide — for `getScrollSnapPositions` to find real, clamped positions.
 * That is deliberately the interesting case: the last slide's start edge sits PAST the maximum scroll
 * offset, so its snap point clamps onto the previous one and four slides make three pages. The old
 * hand-rolled enhancer drew four dots there, and the fourth could never light up.
 */
function layout(root: HTMLElement, { slideSize = 400, viewport = 900 } = {}) {
  const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;
  const slides = Array.from(root.querySelectorAll<HTMLElement>(".sk-carousel__slide"));
  const gap = 20;
  const content = slides.length * slideSize + (slides.length - 1) * gap;

  const define = (el: HTMLElement, props: Record<string, number>) => {
    for (const [key, value] of Object.entries(props)) {
      Object.defineProperty(el, key, { configurable: true, get: () => value });
    }
  };

  define(track, { offsetWidth: viewport, clientWidth: viewport, scrollWidth: content, offsetHeight: 200 });
  let scrollLeft = 0;
  Object.defineProperty(track, "scrollLeft", {
    configurable: true,
    get: () => scrollLeft,
    set: (value: number) => {
      scrollLeft = value;
    },
  });
  track.getBoundingClientRect = () => new DOMRect(0, 0, viewport, 200);
  track.scrollTo = vi.fn((options: ScrollToOptions) => {
    scrollLeft = Number(options?.left ?? scrollLeft);
  }) as unknown as typeof track.scrollTo;

  slides.forEach((slide, index) => {
    const left = index * (slideSize + gap) - scrollLeft;
    define(slide, { offsetWidth: slideSize, offsetLeft: index * (slideSize + gap) });
    slide.getBoundingClientRect = () => new DOMRect(index * (slideSize + gap) - track.scrollLeft, 0, slideSize, 200);
  });

  return { track, slides };
}

const markup = (count: number, attrs = "") => `<section
  class="sk-carousel"
  data-sk-carousel
  ${attrs}
  aria-label="Novedades"
  style="--sk-carousel-slide-size: min(85%, 26rem)"
>
  <div class="sk-carousel__track">
    ${Array.from({ length: count }, (_, i) => `<div class="sk-carousel__slide">Slide ${i + 1}</div>`).join("")}
  </div>
</section>`;

function mount(count: number, attrs = ""): HTMLElement {
  document.body.innerHTML = markup(count, attrs);
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  layout(root);
  return root;
}

const dots = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>(".sk-carousel__dot"));
const buttons = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>(".sk-carousel__button"));

describe("Carousel Vanilla contracts", () => {
  it("names the region and every slide for assistive tech", () => {
    const root = mount(4);

    expect(mountCarousel(document)).toBe(1);
    // A second direct mount does not remount this authored root.
    expect(mountCarousel(document)).toBe(0);

    expect(root.getAttribute("role")).toBe("region");
    expect(root.getAttribute("aria-roledescription")).toBe("carousel");

    const slides = Array.from(root.querySelectorAll(".sk-carousel__slide"));
    expect(slides.map((slide) => slide.getAttribute("aria-roledescription"))).toEqual(Array(4).fill("slide"));
    expect(slides[0].getAttribute("aria-label")).toBe("1 de 4");
    expect(slides[3].getAttribute("aria-label")).toBe("4 de 4");
  });

  it("keeps the authored inline styling hooks when the machine patches its own styles in", () => {
    const root = mount(4);
    mountCarousel(root);

    // The machine writes `--slides-per-page` and friends onto the root; the author's slide-size knob
    // is on the same style attribute and has to survive that.
    expect(root.style.getPropertyValue("--sk-carousel-slide-size")).toBe("min(85%, 26rem)");
  });

  it("draws one dot per MEASURED page, not one per slide", () => {
    const root = mount(4);
    mountCarousel(root);
    flushSync();

    // 4 slides of 400 + 3 gaps of 20 = 1660 of content in a 900 viewport: max scroll is 760, so the
    // third slide (starts at 840) and the fourth (1260) BOTH clamp to 760 — one reachable position,
    // one page. Four slides, three dots.
    expect(dots(root)).toHaveLength(3);
    expect(dots(root)[0].getAttribute("aria-current")).toBe("true");
  });

  it("disables the ends and moves a page at a time", () => {
    const root = mount(4);
    mountCarousel(root);
    flushSync();

    const [prev, next] = buttons(root);
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    fireEvent.click(next);
    flushSync();
    expect(dots(root)[1].getAttribute("aria-current")).toBe("true");
    expect(prev.disabled).toBe(false);

    fireEvent.click(next);
    flushSync();
    expect(dots(root)[2].getAttribute("aria-current")).toBe("true");
    expect(next.disabled).toBe(true);
  });

  it("snaps to a dot and reports the page on the change event", () => {
    const root = mount(4);
    const handler = vi.fn();
    root.addEventListener("sk-carousel-change", handler);
    mountCarousel(root);
    flushSync();

    fireEvent.click(dots(root)[2]);
    flushSync();

    expect(dots(root)[2].getAttribute("aria-current")).toBe("true");
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({ index: 2, count: 3 });
  });

  it("accepts sk-carousel-goto as the snap command", () => {
    const root = mount(4);
    mountCarousel(root);
    flushSync();

    root.dispatchEvent(new CustomEvent("sk-carousel-goto", { detail: { index: 1 } }));
    flushSync();

    expect(dots(root)[1].getAttribute("aria-current")).toBe("true");
  });

  it("gives an autoplaying carousel a pause control, and none to a carousel that does not move on its own", () => {
    const still = mount(4);
    mountCarousel(still);
    flushSync();
    expect(still.querySelector(".sk-carousel__autoplay")).toBeNull();

    const root = mount(4, "data-autoplay");
    mountCarousel(root);
    flushSync();

    const toggle = root.querySelector<HTMLButtonElement>(".sk-carousel__autoplay")!;
    expect(toggle.getAttribute("data-pressed")).toBe("");
    expect(toggle.getAttribute("aria-label")).toBe("Pausar la rotación");

    fireEvent.click(toggle);
    flushSync();

    expect(toggle.getAttribute("data-pressed")).toBeNull();
    expect(toggle.getAttribute("aria-label")).toBe("Reanudar la rotación");
  });

  /*
   * WCAG 2.2.2 / WAI-ARIA Carousel: hover and keyboard focus must pause an autoplaying carousel, and
   * resume it on leave/blur — but never override an EXPLICIT stop the user made via the trigger. Zag
   * 1.42.0 implements neither by itself (confirmed by reading its source directly): this file's own
   * `$effect` + root listeners are what actually deliver it.
   */
  it("pauses autoplay on hover and resumes it when the mouse leaves", () => {
    const root = mount(4, "data-autoplay");
    mountCarousel(root);
    flushSync();

    // `aria-live` on the track is Zag's own, driven purely by whether it is ACTUALLY rotating
    // ("off" while it moves on its own, so mid-rotation DOM changes are not announced; "polite"
    // once paused, so an intentional navigation still gets read out) — unlike `data-pressed`, hover
    // and focus DO move it, since neither reflects a promise made to the user.
    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;
    const toggle = root.querySelector<HTMLButtonElement>(".sk-carousel__autoplay")!;
    expect(track.getAttribute("aria-live")).toBe("off");

    fireEvent.mouseEnter(root);
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("polite");
    // The button still promises "Pausar": the user never asked for anything, hover is temporary.
    expect(toggle.getAttribute("data-pressed")).toBe("");

    fireEvent.mouseLeave(root);
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("off");
  });

  it("pauses autoplay on keyboard focus and resumes it on blur", () => {
    const root = mount(4, "data-autoplay");
    mountCarousel(root);
    flushSync();

    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;
    const [next] = buttons(root);

    fireEvent.focusIn(next);
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("polite");

    fireEvent.focusOut(next, { relatedTarget: document.body });
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("off");
  });

  it("does not resume on mouse leave while focus is still inside", () => {
    const root = mount(4, "data-autoplay");
    mountCarousel(root);
    flushSync();

    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;
    const [next] = buttons(root);

    fireEvent.mouseEnter(root);
    fireEvent.focusIn(next);
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("polite");

    fireEvent.mouseLeave(root);
    flushSync();
    // Still focused: must stay paused.
    expect(track.getAttribute("aria-live")).toBe("polite");

    fireEvent.focusOut(next, { relatedTarget: document.body });
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("off");
  });

  it("never lets hover or focus override an explicit stop from the trigger", () => {
    const root = mount(4, "data-autoplay");
    mountCarousel(root);
    flushSync();

    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;
    const toggle = root.querySelector<HTMLButtonElement>(".sk-carousel__autoplay")!;

    fireEvent.click(toggle);
    flushSync();
    expect(toggle.getAttribute("data-pressed")).toBeNull();
    expect(track.getAttribute("aria-live")).toBe("polite");

    fireEvent.mouseEnter(root);
    flushSync();
    fireEvent.mouseLeave(root);
    flushSync();
    // Hovering and leaving must not resume a carousel the user explicitly stopped.
    expect(toggle.getAttribute("data-pressed")).toBeNull();
    expect(track.getAttribute("aria-live")).toBe("polite");
  });

  it("cancels a pending hover-resume when the user explicitly stops mid-hover", () => {
    const root = mount(4, "data-autoplay");
    mountCarousel(root);
    flushSync();

    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;
    const toggle = root.querySelector<HTMLButtonElement>(".sk-carousel__autoplay")!;

    fireEvent.mouseEnter(root);
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("polite");

    // The user clicks stop WHILE still hovering.
    fireEvent.click(toggle);
    flushSync();
    expect(toggle.getAttribute("data-pressed")).toBeNull();

    fireEvent.mouseLeave(root);
    flushSync();
    // Must stay stopped: the explicit click, not the hover, is what the user asked for last.
    expect(toggle.getAttribute("data-pressed")).toBeNull();
    expect(track.getAttribute("aria-live")).toBe("polite");
  });

  it("pauses on focus landing INSIDE a slide's own content, not only on the prev/next chrome", () => {
    // A real case the other focus test does not cover: a card slide with its own link. `focusin`
    // bubbles from ANY descendant to the root listener, so this should need no code of its own —
    // this test is here to prove that, not to add behaviour.
    document.body.innerHTML = `<section class="sk-carousel" data-sk-carousel data-autoplay aria-label="Novedades">
      <div class="sk-carousel__track">
        <div class="sk-carousel__slide"><a href="/uno">Leer más — Uno</a></div>
        <div class="sk-carousel__slide"><a href="/dos">Leer más — Dos</a></div>
        <div class="sk-carousel__slide"><a href="/tres">Leer más — Tres</a></div>
        <div class="sk-carousel__slide"><a href="/cuatro">Leer más — Cuatro</a></div>
      </div>
    </section>`;
    const root = document.body.firstElementChild as HTMLElement;
    layout(root);
    mountCarousel(root);
    flushSync();

    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;
    const slideLink = root.querySelector<HTMLAnchorElement>(".sk-carousel__slide a")!;
    expect(track.getAttribute("aria-live")).toBe("off");

    fireEvent.focusIn(slideLink);
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("polite");

    fireEvent.focusOut(slideLink, { relatedTarget: document.body });
    flushSync();
    expect(track.getAttribute("aria-live")).toBe("off");
  });

  it("draws no controls at all when asked for none, and still snaps per slide", async () => {
    const root = mount(4, 'data-controls="none"');
    mountCarousel(root);
    flushSync();

    expect(root.querySelector(".sk-carousel__controls")).toBeNull();
    expect(dots(root)).toHaveLength(0);
    expect(buttons(root)).toHaveLength(0);

    // The point of the variant: the track is still a snap scroller, so every slide is a stop.
    const slides = Array.from(root.querySelectorAll<HTMLElement>(".sk-carousel__slide"));
    expect(slides.map((s) => s.style.scrollSnapAlign)).toEqual(Array(4).fill("start"));

    // And it is still driveable programmatically: controls were the chrome, not the behaviour.
    // Zag defers the scroll into a microtask, so the assertion waits rather than reading too early.
    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;
    root.dispatchEvent(new CustomEvent("sk-carousel-goto", { detail: { index: 1 } }));
    flushSync();
    await vi.waitFor(() => expect(track.scrollTo).toHaveBeenCalled());
  });

  it("drags with a mouse by default, because a vertical wheel scrolls the page and not the track", () => {
    const root = mount(4);
    mountCarousel(root);
    flushSync();
    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;

    fireEvent.mouseDown(track, { button: 0 });
    flushSync();
    expect(track.getAttribute("data-dragging")).toBe("");

    /*
     * The machine turns snapping OFF for the duration of the drag so it can move the track by hand,
     * and that write has to SURVIVE the re-render the drag itself causes. It did not: the effect
     * re-applied Zag's declarative style on every state change and put `x mandatory` back in the
     * same frame, so the browser re-snapped on every pixel dragged and a 10px mouse move jumped a
     * whole slide. Styles are written once now; this asserts the machine keeps the last word.
     */
    expect(track.style.scrollSnapType).toBe("none");
  });

  it("opts out of mouse drag with data-mouse-drag=off, for slides whose text is selectable", () => {
    const root = mount(4, 'data-mouse-drag="off"');
    mountCarousel(root);
    flushSync();
    const track = root.querySelector<HTMLElement>(".sk-carousel__track")!;

    fireEvent.mouseDown(track, { button: 0 });
    flushSync();
    expect(track.getAttribute("data-dragging")).toBeNull();
  });

  it("draws no controls for a single slide: that is a track, not a carousel", () => {
    const root = mount(1);
    mountCarousel(root);
    flushSync();

    expect(root.querySelector(".sk-carousel__controls")).toBeNull();
  });
});
