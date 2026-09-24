import { lightboxAttrs, lightboxParts, type LightboxImage } from "@skryensya/core/lightbox";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, useEffect, useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Lightbox,
  LightboxProvider,
  useLightbox,
  useLightboxState,
  type LightboxHandle,
} from "./lightbox.js";

/*
 * The React half of Lightbox. The behaviour is the shared controller's, so what is proved here is
 * what a React consumer sees: every way in (a thumbnail, the handle, the provider, props) runs the
 * same lifecycle, and every way out restores it. jsdom has no layout and loads no images, so a load
 * or an error is fired by hand, and the modality `showModal()` gives a real browser (the inert page)
 * is asserted as "showModal was the call", then verified live in the docs.
 */

const gallery: LightboxImage[] = [
  { src: "/a.jpg", alt: "Lake at dawn", title: "Dawn", description: "Mist over the water.", credit: "Ana" },
  { src: "/b.jpg", alt: "Pine forest" },
  { src: "/c.jpg", alt: "Snowy peak", thumbnailSrc: "/c-thumb.jpg", width: 1600, height: 900 },
];

const dialog = () => document.querySelector<HTMLDialogElement>(`.${lightboxParts.root}`)!;
const image = () => document.querySelector<HTMLImageElement>(`.${lightboxParts.image}`)!;
const button = (name: string) => screen.getByRole("button", { name, hidden: true });
/* A `hidden` control has no computed name, so the ones that come and go are found by their action. */
const action = (name: string) => document.querySelector<HTMLButtonElement>(`[${lightboxAttrs.action}="${name}"]`)!;
const key = (name: string, init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(document.activeElement ?? document.body, { key: name, ...init });

let showModal: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
});
afterEach(() => {
  showModal.mockRestore();
  vi.useRealTimers();
});

function Imperative({ onReady }: { onReady: (handle: LightboxHandle) => void }) {
  const ref = useRef<LightboxHandle>(null);
  useEffect(() => {
    if (ref.current) onReady(ref.current);
  }, [onReady]);
  return <Lightbox ref={ref} />;
}

function withHandle(): LightboxHandle {
  let handle: LightboxHandle | null = null;
  render(<Imperative onReady={(h) => (handle = h)} />);
  return handle!;
}

describe("Lightbox: opening", () => {
  it("opens from a thumbnail click at that thumbnail's position in its gallery", () => {
    render(
      <>
        {gallery.map((item) => (
          <Lightbox.Trigger key={item.src} opens="photos" src={item.src}>
            <img alt={item.alt} src={`${item.src}?thumb`} />
          </Lightbox.Trigger>
        ))}
        <Lightbox id="photos" />
      </>,
    );
    fireEvent.click(screen.getByRole("img", { name: "Pine forest" }));
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(dialog().open).toBe(true);
    expect(image().getAttribute("src")).toBe("/b.jpg");
    expect(image().alt).toBe("Pine forest");
    expect(dialog().querySelector(`.${lightboxParts.counter}`)!.textContent).toBe("2 / 3");
  });

  it("leaves a modified click to the link itself, for a new tab", () => {
    render(
      <>
        <Lightbox.Trigger opens="photos" src="/a.jpg">
          <img alt="Lake" src="/a-thumb.jpg" />
        </Lightbox.Trigger>
        <Lightbox id="photos" />
      </>,
    );
    fireEvent.click(screen.getByRole("img", { name: "Lake" }), { metaKey: true });
    expect(dialog().open).toBe(false);
  });

  it("opens programmatically on a single image, with no trigger anywhere on the page", () => {
    const handle = withHandle();
    act(() => handle.open({ images: [{ src: "/solo.jpg", alt: "A single photo" }] }));
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(image().getAttribute("src")).toBe("/solo.jpg");
    expect(handle.getState()).toMatchObject({ open: true, index: 0, count: 1 });
  });

  it("opens programmatically on a gallery at a given index", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery, index: 2 }));
    expect(image().getAttribute("src")).toBe("/c.jpg");
    expect(handle.getState().index).toBe(2);
  });

  it("clamps an out-of-range or negative starting index instead of failing", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery, index: 99 }));
    expect(handle.getState().index).toBe(2);
    act(() => handle.close());
    act(() => handle.open({ images: gallery, index: -4 }));
    expect(handle.getState().index).toBe(0);
  });

  it("does nothing for an empty gallery", () => {
    const handle = withHandle();
    act(() => handle.open({ images: [] }));
    expect(showModal).not.toHaveBeenCalled();
    expect(handle.getState().open).toBe(false);
  });

  it("replaces what is showing when opened again while open, without a second modal", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery, index: 0 }));
    act(() => handle.open({ images: [{ src: "/other.jpg", alt: "Other" }] }));
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(image().getAttribute("src")).toBe("/other.jpg");
    expect(document.querySelectorAll(`.${lightboxParts.root}[open]`)).toHaveLength(1);
  });
});

describe("Lightbox: closing", () => {
  it("closes from the close button", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.click(button("Close"));
    expect(dialog().open).toBe(false);
  });

  it("closes on Escape", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    key("Escape");
    expect(dialog().open).toBe(false);
  });

  it("closes on a click on the dark around the image", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.click(dialog().querySelector(`.${lightboxParts.stage}`)!);
    expect(dialog().open).toBe(false);
  });

  it("does not close on a click on the image, the caption or a control", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.click(image());
    fireEvent.click(dialog().querySelector(`.${lightboxParts.title}`)!);
    fireEvent.click(button("Next image"));
    expect(dialog().open).toBe(true);
  });

  it("keeps the backdrop inert to clicks when closeOnBackdropClick is off", () => {
    let handle: LightboxHandle | null = null;
    function Host() {
      const ref = useRef<LightboxHandle>(null);
      useEffect(() => void (handle = ref.current), []);
      return <Lightbox closeOnBackdropClick={false} ref={ref} />;
    }
    render(<Host />);
    act(() => handle!.open({ images: gallery }));
    fireEvent.click(dialog().querySelector(`.${lightboxParts.stage}`)!);
    expect(dialog().open).toBe(true);
  });

  it("closes programmatically, and a second close is a no-op", () => {
    const onOpenChange = vi.fn();
    let handle: LightboxHandle | null = null;
    function Host() {
      const ref = useRef<LightboxHandle>(null);
      useEffect(() => void (handle = ref.current), []);
      return <Lightbox onOpenChange={onOpenChange} ref={ref} />;
    }
    render(<Host />);
    act(() => handle!.open({ images: gallery }));
    act(() => handle!.close());
    act(() => handle!.close());
    expect(dialog().open).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("releases the image and resets the view on close", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.load(image());
    act(() => handle.zoomIn());
    act(() => handle.close());
    expect(image().hasAttribute("src")).toBe(false);
    expect(image().style.transform).toBe("");
    expect(dialog().hasAttribute(lightboxAttrs.zoomed)).toBe(false);
  });

  it("survives repeated opening and closing with one listener set", () => {
    const handle = withHandle();
    const add = vi.spyOn(document, "addEventListener");
    for (let i = 0; i < 5; i += 1) {
      act(() => handle.open({ images: gallery, index: 1 }));
      act(() => handle.close());
    }
    const keydowns = add.mock.calls.filter(([type]) => type === "keydown").length;
    add.mockRestore();
    // One keydown listener per session, each removed on close: open once more and count one.
    const remove = vi.spyOn(document, "removeEventListener");
    act(() => handle.open({ images: gallery }));
    act(() => handle.close());
    expect(keydowns).toBe(5);
    expect(remove.mock.calls.filter(([type]) => type === "keydown")).toHaveLength(1);
    remove.mockRestore();
  });
});

describe("Lightbox: navigation", () => {
  it("goes to the next and previous image from the buttons", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.click(button("Next image"));
    expect(image().getAttribute("src")).toBe("/b.jpg");
    fireEvent.click(button("Previous image"));
    expect(image().getAttribute("src")).toBe("/a.jpg");
  });

  it("goes to the neighbours with ArrowRight and ArrowLeft", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    key("ArrowRight");
    expect(handle.getState().index).toBe(1);
    key("ArrowLeft");
    expect(handle.getState().index).toBe(0);
    key("End");
    expect(handle.getState().index).toBe(2);
    key("Home");
    expect(handle.getState().index).toBe(0);
  });

  it("navigates programmatically, and ignores an index that does not exist", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    act(() => handle.next());
    act(() => handle.goTo(2));
    expect(handle.getState().index).toBe(2);
    act(() => handle.goTo(7));
    act(() => handle.goTo(-1));
    act(() => handle.goTo(1.5));
    expect(handle.getState().index).toBe(2);
    act(() => handle.previous());
    expect(handle.getState().index).toBe(1);
  });

  it("stops at the ends without loop, and says so with aria-disabled while staying focusable", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    expect(button("Previous image").getAttribute("aria-disabled")).toBe("true");
    act(() => handle.previous());
    expect(handle.getState().index).toBe(0);
    act(() => handle.goTo(2));
    const next = button("Next image");
    next.focus();
    fireEvent.click(next);
    expect(handle.getState().index).toBe(2);
    expect(next.getAttribute("aria-disabled")).toBe("true");
    expect(next.hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(next);
  });

  it("wraps at the ends with loop", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery, index: 2, loop: true }));
    act(() => handle.next());
    expect(handle.getState().index).toBe(0);
    act(() => handle.previous());
    expect(handle.getState().index).toBe(2);
    expect(button("Next image").hasAttribute("aria-disabled")).toBe(false);
  });

  it("hides the navigation and the counter for a single image, and next/previous do nothing", () => {
    const handle = withHandle();
    act(() => handle.open({ images: [gallery[0]!] }));
    expect(action("next").hidden).toBe(true);
    expect(action("previous").hidden).toBe(true);
    expect((dialog().querySelector(`.${lightboxParts.counter}`) as HTMLElement).hidden).toBe(true);
    act(() => handle.next());
    act(() => handle.previous());
    expect(handle.getState().index).toBe(0);
  });

  it("keeps the reader on the same photo when the gallery changes while open, and closes when it empties", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery, index: 1 }));
    act(() => handle.setImages([{ src: "/new.jpg", alt: "New" }, ...gallery]));
    expect(handle.getState().index).toBe(2);
    expect(image().getAttribute("src")).toBe("/b.jpg");
    act(() => handle.setImages(gallery.filter((item) => item.src !== "/b.jpg")));
    expect(handle.getState().index).toBe(1);
    expect(image().getAttribute("src")).toBe("/c.jpg");
    act(() => handle.setImages([]));
    expect(dialog().open).toBe(false);
  });

  it("reports index changes, including the one it opened on", () => {
    const onIndexChange = vi.fn();
    let handle: LightboxHandle | null = null;
    function Host() {
      const ref = useRef<LightboxHandle>(null);
      useEffect(() => void (handle = ref.current), []);
      return <Lightbox onIndexChange={onIndexChange} ref={ref} />;
    }
    render(<Host />);
    act(() => handle!.open({ images: gallery, index: 1 }));
    act(() => handle!.next());
    expect(onIndexChange.mock.calls.map(([index]) => index)).toEqual([1, 2]);
  });
});

describe("Lightbox: zoom", () => {
  it("zooms from the buttons once the image has loaded, and resets", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    expect(button("Zoom in").getAttribute("aria-disabled")).toBe("true");
    fireEvent.load(image());
    fireEvent.click(button("Zoom in"));
    expect(handle.getState().zoom).toBe(1.5);
    expect(dialog().hasAttribute(lightboxAttrs.zoomed)).toBe(true);
    expect(image().style.transform).toContain("scale(1.5)");
    fireEvent.click(button("Reset zoom"));
    expect(handle.getState().zoom).toBe(1);
    expect(button("Zoom out").getAttribute("aria-disabled")).toBe("true");
  });

  it("zooms with + and - and resets with 0 from the keyboard", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.load(image());
    key("+");
    key("+");
    expect(handle.getState().zoom).toBe(2.25);
    key("-");
    expect(handle.getState().zoom).toBe(1.5);
    key("0");
    expect(handle.getState().zoom).toBe(1);
  });

  it("never passes maxZoom", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery, maxZoom: 2 }));
    fireEvent.load(image());
    for (let i = 0; i < 6; i += 1) act(() => handle.zoomIn());
    expect(handle.getState().zoom).toBe(2);
    expect(button("Zoom in").getAttribute("aria-disabled")).toBe("true");
  });

  it("resets the zoom when the image changes", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.load(image());
    act(() => handle.zoomIn());
    act(() => handle.next());
    expect(handle.getState().zoom).toBe(1);
    expect(image().style.transform).toBe("");
  });

  it("pans a zoomed image with the arrows instead of navigating", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.load(image());
    act(() => handle.zoomIn());
    key("ArrowRight");
    expect(handle.getState().index).toBe(0);
  });

  it("hides every zoom control when zoom is off", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery, zoom: false }));
    fireEvent.load(image());
    expect(action("zoom-in").hidden).toBe(true);
    expect(action("zoom-out").hidden).toBe(true);
    expect(action("reset-zoom").hidden).toBe(true);
    key("+");
    expect(handle.getState().zoom).toBe(1);
  });
});

describe("Lightbox: loading, errors and preloading", () => {
  it("marks the stage as loading until the image arrives, with the thumbnail shown meanwhile", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery, index: 2 }));
    const placeholder = document.querySelector<HTMLImageElement>(`.${lightboxParts.placeholder}`)!;
    expect(dialog().getAttribute(lightboxAttrs.status)).toBe("loading");
    expect(placeholder.hidden).toBe(false);
    expect(placeholder.getAttribute("src")).toBe("/c-thumb.jpg");
    expect(image().getAttribute("width")).toBe("1600");
    expect(image().getAttribute("height")).toBe("900");
    fireEvent.load(image());
    expect(dialog().getAttribute(lightboxAttrs.status)).toBe("loaded");
    expect(placeholder.hidden).toBe(true);
  });

  it("shows an error in words, keeps every control working, and reports it", () => {
    const onImageError = vi.fn();
    let handle: LightboxHandle | null = null;
    function Host() {
      const ref = useRef<LightboxHandle>(null);
      useEffect(() => void (handle = ref.current), []);
      return <Lightbox errorLabel="No se pudo cargar." onImageError={onImageError} ref={ref} />;
    }
    render(<Host />);
    act(() => handle!.open({ images: gallery }));
    fireEvent.error(image());
    const error = dialog().querySelector<HTMLElement>(`.${lightboxParts.error}`)!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe("No se pudo cargar.");
    expect(onImageError).toHaveBeenCalledWith(gallery[0], 0);
    expect(dialog().querySelector(`.${lightboxParts.live}`)!.textContent).toContain("No se pudo cargar.");
    fireEvent.click(button("Next image"));
    expect(error.hidden).toBe(true);
    expect(handle!.getState().status).toBe("loading");
  });

  it("ignores a load that arrives for an image the reader already left", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    const first = image();
    act(() => handle.next());
    // The first image's late load cannot mark the second one loaded: its src is no longer current.
    first.setAttribute("src", "/a.jpg");
    first.setAttribute("src", "/b.jpg");
    expect(handle.getState().status).toBe("loading");
  });

  it("preloads only the neighbours, after the current image has settled", () => {
    const created: string[] = [];
    /* A preload is an image that is never put in the page, so every `src` written to a DETACHED
       image is one. (`Image` cannot be subclassed to spy on it: its factory ignores the subclass.) */
    const proto = HTMLImageElement.prototype;
    const real = Object.getOwnPropertyDescriptor(proto, "src")!;
    Object.defineProperty(proto, "src", {
      configurable: true,
      get: real.get,
      set(this: HTMLImageElement, value: string) {
        if (!this.isConnected) created.push(value);
        real.set!.call(this, value);
      },
    });
    try {
      const handle = withHandle();
      const many = Array.from({ length: 200 }, (_, i) => ({ src: `/p${i}.jpg`, alt: `Photo ${i}` }));
      act(() => handle.open({ images: many, index: 50 }));
      expect(created).toEqual([]);
      fireEvent.load(image());
      expect(created).toEqual(["/p51.jpg", "/p49.jpg"]);
      // Back and forth over the same neighbours never asks for one twice.
      act(() => handle.next());
      fireEvent.load(image());
      act(() => handle.previous());
      fireEvent.load(image());
      expect(created.filter((src) => src === "/p51.jpg")).toHaveLength(1);
    } finally {
      Object.defineProperty(proto, "src", real);
    }
  });
});

describe("Lightbox: metadata", () => {
  it("fills title, description and credit, and draws no caption for an image without any", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    const caption = dialog().querySelector<HTMLElement>(`.${lightboxParts.caption}`)!;
    expect(caption.hidden).toBe(false);
    expect(caption.textContent).toContain("Dawn");
    expect(caption.textContent).toContain("Mist over the water.");
    expect(caption.textContent).toContain("Ana");
    act(() => handle.next());
    expect(caption.hidden).toBe(true);
  });

  it("uses the author's alt verbatim, including an empty one, and never a filename", () => {
    const handle = withHandle();
    act(() => handle.open({ images: [{ src: "/IMG_2041.jpg", alt: "" }] }));
    expect(image().getAttribute("alt")).toBe("");
  });
});

describe("Lightbox: accessibility", () => {
  it("is a modal dialog with a name, and every control has one too", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    const node = screen.getByRole("dialog", { name: "Image viewer" });
    expect(node.tagName).toBe("DIALOG");
    expect(showModal).toHaveBeenCalled();
    expect(node.getAttribute("role")).toBeNull();
    for (const name of ["Close", "Previous image", "Next image", "Zoom in", "Zoom out", "Reset zoom"]) {
      expect(button(name).tagName).toBe("BUTTON");
    }
  });

  it("takes a localized name for the dialog and each control", () => {
    render(<Lightbox closeLabel="Cerrar visor" label="Visor de imágenes" nextLabel="Imagen siguiente" />);
    expect(dialog().getAttribute("aria-label")).toBe("Visor de imágenes");
    expect(action("close").getAttribute("aria-label")).toBe("Cerrar visor");
    expect(action("next").getAttribute("aria-label")).toBe("Imagen siguiente");
  });

  it("moves focus to Close on open", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    expect(document.activeElement).toBe(button("Close"));
  });

  it("wraps Tab and Shift+Tab inside the dialog", () => {
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    fireEvent.load(image());
    act(() => handle.zoomIn());
    const next = button("Next image");
    next.focus();
    key("Tab");
    expect(document.activeElement).toBe(button("Zoom out"));
    key("Tab", { shiftKey: true });
    expect(document.activeElement).toBe(next);
  });

  it("returns focus to the thumbnail that opened it", () => {
    render(
      <>
        <Lightbox.Trigger opens="photos" src="/a.jpg">
          <img alt="Lake" src="/a-thumb.jpg" />
        </Lightbox.Trigger>
        <Lightbox id="photos" />
      </>,
    );
    const trigger = screen.getByRole("link", { name: "Lake" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(button("Close"));
    key("Escape");
    expect(document.activeElement).toBe(trigger);
  });

  it("returns focus to the button that opened it programmatically", () => {
    function Host() {
      const ref = useRef<LightboxHandle>(null);
      return (
        <>
          <button onClick={() => ref.current?.open({ images: gallery })} type="button">
            View photos
          </button>
          <Lightbox ref={ref} />
        </>
      );
    }
    render(<Host />);
    const opener = screen.getByRole("button", { name: "View photos" });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(button("Close"));
    expect(document.activeElement).toBe(opener);
  });

  it("never focuses a trigger that was removed; falls back to the current photo's thumbnail", () => {
    function Host() {
      const [first, setFirst] = useState(true);
      return (
        <>
          {first ? (
            <Lightbox.Trigger onKeyDown={() => setFirst(false)} opens="photos" src="/a.jpg">
              <img alt="Lake" src="/a-t.jpg" />
            </Lightbox.Trigger>
          ) : null}
          <Lightbox.Trigger opens="photos" src="/b.jpg">
            <img alt="Forest" src="/b-t.jpg" />
          </Lightbox.Trigger>
          <button onClick={() => setFirst(false)} type="button">
            remove
          </button>
          <Lightbox id="photos" />
        </>
      );
    }
    render(<Host />);
    const lake = screen.getByRole("link", { name: "Lake" });
    lake.focus();
    fireEvent.click(lake);
    act(() => screen.getByRole("button", { name: "remove", hidden: true }).click());
    expect(lake.isConnected).toBe(false);
    // The gallery is now [Forest]; the reader was on index 0 of the old one.
    key("Escape");
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Forest" }));
  });

  it("uses fallbackFocus when opened with no trigger and nothing focused", () => {
    function Host() {
      const ref = useRef<LightboxHandle>(null);
      const fallback = useRef<HTMLHeadingElement>(null);
      useEffect(() => ref.current?.open({ images: gallery }), []);
      return (
        <>
          <h1 ref={fallback} tabIndex={-1}>
            Gallery
          </h1>
          <Lightbox fallbackFocus={() => fallback.current} ref={ref} />
        </>
      );
    }
    render(<Host />);
    key("Escape");
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "Gallery" }));
  });

  it("announces the position politely once navigation settles, not per keypress", () => {
    vi.useFakeTimers();
    const handle = withHandle();
    act(() => handle.open({ images: gallery }));
    const live = dialog().querySelector(`.${lightboxParts.live}`)!;
    expect(live.getAttribute("aria-live")).toBe("polite");
    expect(live.getAttribute("role")).toBeNull();
    key("ArrowRight");
    key("ArrowRight");
    expect(live.textContent).toBe("Image 1 of 3. Dawn");
    act(() => vi.advanceTimersByTime(400));
    expect(live.textContent).toBe("Image 3 of 3. Snowy peak");
  });

  it("works with the keyboard alone: open from a trigger with Enter, navigate, zoom, close", () => {
    render(
      <>
        {gallery.map((item) => (
          <Lightbox.Trigger key={item.src} opens="photos" src={item.src}>
            <img alt={item.alt} src={`${item.src}?t`} />
          </Lightbox.Trigger>
        ))}
        <Lightbox id="photos" />
      </>,
    );
    const trigger = screen.getByRole("link", { name: "Lake at dawn" });
    trigger.focus();
    // A link activated with Enter dispatches a click; that is what the delegated listener hears.
    fireEvent.click(trigger, { detail: 0 });
    key("ArrowRight");
    fireEvent.load(image());
    key("+");
    key("0");
    key("Escape");
    expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});

describe("Lightbox: declarative and app-wide", () => {
  it("opens, navigates and closes from props, and reports the reader's changes back", () => {
    function Host() {
      const [open, setOpen] = useState(false);
      const [index, setIndex] = useState(1);
      return (
        <>
          <button onClick={() => setOpen(true)} type="button">
            open
          </button>
          <button onClick={() => setIndex(2)} type="button">
            third
          </button>
          <output data-testid="state">{`${open}:${index}`}</output>
          <Lightbox images={gallery} index={index} onIndexChange={setIndex} onOpenChange={setOpen} open={open} />
        </>
      );
    }
    render(<Host />);
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    expect(image().getAttribute("src")).toBe("/b.jpg");
    act(() => screen.getByRole("button", { name: "third", hidden: true }).click());
    expect(image().getAttribute("src")).toBe("/c.jpg");
    key("ArrowLeft");
    expect(screen.getByTestId("state").textContent).toBe("true:1");
    key("Escape");
    expect(screen.getByTestId("state").textContent).toBe("false:1");
    expect(dialog().open).toBe(false);
  });

  it("gives every consumer below a provider the same single lightbox", () => {
    function Opener({ label, index }: { label: string; index: number }) {
      const lightbox = useLightbox();
      return (
        <button onClick={() => lightbox.open({ images: gallery, index })} type="button">
          {label}
        </button>
      );
    }
    function Status() {
      const state = useLightboxState();
      return <output data-testid="status">{state.open ? `open ${state.index}` : "closed"}</output>;
    }
    render(
      <LightboxProvider label="Galería">
        <Opener index={0} label="one" />
        <Opener index={2} label="two" />
        <Status />
      </LightboxProvider>,
    );
    expect(document.querySelectorAll(`.${lightboxParts.root}`)).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "two" }));
    expect(screen.getByTestId("status").textContent).toBe("open 2");
    key("Escape");
    expect(screen.getByTestId("status").textContent).toBe("closed");
  });

  it("keeps an open() issued before the provider's dialog has mounted", () => {
    function OpensOnMount() {
      const lightbox = useLightbox();
      useEffect(() => lightbox.open({ images: gallery, index: 1 }), [lightbox]);
      return null;
    }
    render(
      <LightboxProvider>
        <OpensOnMount />
      </LightboxProvider>,
    );
    expect(dialog().open).toBe(true);
    expect(image().getAttribute("src")).toBe("/b.jpg");
  });

  it("refuses useLightbox() outside a provider, loudly", () => {
    function Orphan() {
      useLightbox();
      return null;
    }
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/LightboxProvider/);
    error.mockRestore();
  });

  it("cleans up on unmount while open, even mid-load, and leaves nothing behind", () => {
    const remove = vi.spyOn(document, "removeEventListener");
    let handle: LightboxHandle | null = null;
    function Host() {
      const ref = useRef<LightboxHandle>(null);
      useEffect(() => void (handle = ref.current), []);
      return <Lightbox ref={ref} />;
    }
    const { unmount } = render(<Host />);
    act(() => handle!.open({ images: gallery }));
    expect(dialog().getAttribute(lightboxAttrs.status)).toBe("loading");
    unmount();
    expect(remove.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(["keydown", "click"]));
    expect(handle!.getState().open).toBe(false);
    act(() => handle!.open({ images: gallery }));
    expect(handle!.getState().open).toBe(false);
    remove.mockRestore();
  });

  it("connects once under StrictMode, with one pair of images in the stage", () => {
    render(
      <StrictMode>
        <Lightbox />
      </StrictMode>,
    );
    expect(document.querySelectorAll(`.${lightboxParts.image}`)).toHaveLength(1);
    expect(document.querySelectorAll(`.${lightboxParts.placeholder}`)).toHaveLength(1);
  });

  it("renders a closed dialog with no images on the server's first pass", () => {
    const { container } = render(<Lightbox />);
    const node = container.querySelector("dialog")!;
    expect(node.open).toBe(false);
    expect(node.getAttribute("aria-label")).toBe("Image viewer");
  });
});
