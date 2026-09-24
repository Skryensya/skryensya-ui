import { describe, expect, it } from "vitest";
import {
  LIGHTBOX_FIT_VIEW,
  LIGHTBOX_MAX_ZOOM,
  LIGHTBOX_PAN_STEP,
  LIGHTBOX_ZOOM_CEILING,
  LIGHTBOX_ZOOM_STEP,
  formatLightboxCounter,
  lightboxClampView,
  lightboxKeyAction,
  lightboxPinchView,
  lightboxPreloadIndices,
  lightboxReindex,
  lightboxStep,
  lightboxSwipeVerdict,
  lightboxTransform,
  lightboxZoomTo,
  normalizeLightboxIndex,
  sanitizeLightboxMaxZoom,
  type LightboxImage,
} from "./lightbox.js";

/*
 * The arithmetic, with no DOM: which index comes next, what a zoomed photo may do, what a released
 * finger meant, what a key does. The controller that calls these is proved in both bindings' suites.
 */

const img = (src: string): LightboxImage => ({ src, alt: src });

describe("normalizeLightboxIndex", () => {
  it("clamps an out-of-range, negative or fractional index into the gallery", () => {
    expect(normalizeLightboxIndex(40, 12)).toBe(11);
    expect(normalizeLightboxIndex(-3, 12)).toBe(0);
    expect(normalizeLightboxIndex(2.9, 12)).toBe(2);
  });

  it("reads a missing or non-finite index as the first image", () => {
    expect(normalizeLightboxIndex(undefined, 5)).toBe(0);
    expect(normalizeLightboxIndex(Number.NaN, 5)).toBe(0);
    expect(normalizeLightboxIndex(Number.POSITIVE_INFINITY, 5)).toBe(0);
  });

  it("is -1 for an empty gallery, whatever was asked", () => {
    expect(normalizeLightboxIndex(0, 0)).toBe(-1);
    expect(normalizeLightboxIndex(3, 0)).toBe(-1);
  });
});

describe("lightboxStep", () => {
  it("moves one image either way inside the gallery", () => {
    expect(lightboxStep(2, 1, 5, false)).toBe(3);
    expect(lightboxStep(2, -1, 5, false)).toBe(1);
  });

  it("stops at the ends when the gallery does not loop", () => {
    expect(lightboxStep(4, 1, 5, false)).toBeNull();
    expect(lightboxStep(0, -1, 5, false)).toBeNull();
  });

  it("wraps at the ends when the gallery loops", () => {
    expect(lightboxStep(4, 1, 5, true)).toBe(0);
    expect(lightboxStep(0, -1, 5, true)).toBe(4);
  });

  it("goes nowhere in a gallery of one, even when it loops", () => {
    expect(lightboxStep(0, 1, 1, true)).toBeNull();
    expect(lightboxStep(0, -1, 1, false)).toBeNull();
  });

  it("wraps a two-image gallery onto the other image, not onto itself", () => {
    expect(lightboxStep(1, 1, 2, true)).toBe(0);
    expect(lightboxStep(0, -1, 2, true)).toBe(1);
  });
});

describe("lightboxPreloadIndices", () => {
  it("fetches the next and the previous image only, never the current one", () => {
    expect(lightboxPreloadIndices(5, 400, false)).toEqual([6, 4]);
  });

  it("fetches one neighbour at an end of a gallery that does not loop", () => {
    expect(lightboxPreloadIndices(0, 10, false)).toEqual([1]);
    expect(lightboxPreloadIndices(9, 10, false)).toEqual([8]);
  });

  it("fetches across the seam of a looping gallery, and each image once", () => {
    expect(lightboxPreloadIndices(0, 10, true)).toEqual([1, 9]);
    expect(lightboxPreloadIndices(0, 2, true)).toEqual([1]);
  });

  it("fetches nothing for a single image", () => {
    expect(lightboxPreloadIndices(0, 1, true)).toEqual([]);
  });
});

describe("lightboxReindex", () => {
  const before = [img("a"), img("b"), img("c")];

  it("keeps the reader on the same photo when the list around it changes", () => {
    expect(lightboxReindex(before[1]!, 1, [img("z"), img("a"), img("b")])).toBe(2);
  });

  it("stays at the same position, clamped, when the current photo was removed", () => {
    expect(lightboxReindex(before[2]!, 2, [img("a"), img("b")])).toBe(1);
    expect(lightboxReindex(before[1]!, 1, [img("a"), img("c")])).toBe(1);
  });

  it("has nowhere to be in an empty list", () => {
    expect(lightboxReindex(before[0]!, 0, [])).toBe(-1);
  });
});

describe("formatLightboxCounter", () => {
  it("fills the template 1-based, in any language", () => {
    expect(formatLightboxCounter("Image {index} of {count}", 2, 12)).toBe("Image 3 of 12");
    expect(formatLightboxCounter("Imagen {index} de {count}", 0, 1)).toBe("Imagen 1 de 1");
  });
});

describe("sanitizeLightboxMaxZoom", () => {
  it("replaces a non-number with the default and holds the rest between fit and the ceiling", () => {
    expect(sanitizeLightboxMaxZoom(undefined)).toBe(LIGHTBOX_MAX_ZOOM);
    expect(sanitizeLightboxMaxZoom(Number.NaN)).toBe(LIGHTBOX_MAX_ZOOM);
    expect(sanitizeLightboxMaxZoom(Number.POSITIVE_INFINITY)).toBe(LIGHTBOX_MAX_ZOOM);
    expect(sanitizeLightboxMaxZoom(0)).toBe(1);
    expect(sanitizeLightboxMaxZoom(500)).toBe(LIGHTBOX_ZOOM_CEILING);
    expect(sanitizeLightboxMaxZoom(3)).toBe(3);
  });
});

describe("lightboxClampView", () => {
  const fitted = { width: 400, height: 300 };
  const stage = { width: 400, height: 600 };

  it("lets a zoomed image slide only until its edge meets the stage's edge", () => {
    // 2x: drawn 800 wide in a 400 stage, so 200px of slack each way.
    expect(lightboxClampView({ x: 1000, y: 0, scale: 2 }, fitted, stage).x).toBe(200);
    expect(lightboxClampView({ x: -1000, y: 0, scale: 2 }, fitted, stage).x).toBe(-200);
  });

  it("keeps centred any axis the zoomed image still does not fill", () => {
    // 2x: drawn 600 tall in a 600 stage: nothing to reveal, so no vertical movement at all.
    expect(lightboxClampView({ x: 0, y: 150, scale: 2 }, fitted, stage).y).toBe(0);
  });

  it("allows no movement at all at fit", () => {
    expect(lightboxClampView({ x: 30, y: -30, scale: 1 }, fitted, stage)).toEqual({ x: 0, y: 0, scale: 1 });
  });
});

describe("lightboxZoomTo", () => {
  const fitted = { width: 400, height: 400 };
  const stage = { width: 400, height: 400 };

  it("zooms around the centre when no anchor is given", () => {
    expect(lightboxZoomTo(LIGHTBOX_FIT_VIEW, 2, { x: 0, y: 0 }, fitted, stage)).toEqual({ x: 0, y: 0, scale: 2 });
  });

  it("keeps the point under the pointer where it was", () => {
    // Anchored 100px right of centre: that content point must still be drawn at +100 after 2x.
    const view = lightboxZoomTo(LIGHTBOX_FIT_VIEW, 2, { x: 100, y: 0 }, fitted, stage);
    expect(view.x + 100 * view.scale).toBe(100);
  });

  it("never goes past the configured maximum or below fit", () => {
    expect(lightboxZoomTo(LIGHTBOX_FIT_VIEW, 99, { x: 0, y: 0 }, fitted, stage, 3).scale).toBe(3);
    expect(lightboxZoomTo({ x: 50, y: 50, scale: 2 }, 0.1, { x: 0, y: 0 }, fitted, stage)).toEqual(LIGHTBOX_FIT_VIEW);
  });

  it("lands centred when it zooms back out to fit, wherever the anchor was", () => {
    const zoomed = lightboxZoomTo(LIGHTBOX_FIT_VIEW, 3, { x: 150, y: -150 }, fitted, stage);
    expect(lightboxZoomTo(zoomed, 1, { x: -150, y: 150 }, fitted, stage)).toEqual(LIGHTBOX_FIT_VIEW);
  });
});

describe("lightboxPinchView", () => {
  const fitted = { width: 400, height: 400 };
  const stage = { width: 400, height: 400 };

  it("follows the distance between the fingers", () => {
    const view = lightboxPinchView(
      LIGHTBOX_FIT_VIEW,
      [{ x: -50, y: 0 }, { x: 50, y: 0 }],
      [{ x: -100, y: 0 }, { x: 100, y: 0 }],
      fitted,
      stage,
    );
    expect(view.scale).toBe(2);
  });

  it("snaps back to fit when the fingers close past it", () => {
    const view = lightboxPinchView(
      { x: 40, y: 0, scale: 2 },
      [{ x: -100, y: 0 }, { x: 100, y: 0 }],
      [{ x: -10, y: 0 }, { x: 10, y: 0 }],
      fitted,
      stage,
    );
    expect(view).toEqual(LIGHTBOX_FIT_VIEW);
  });
});

describe("lightboxTransform", () => {
  it("writes nothing at fit, so the stylesheet's own transition state is untouched", () => {
    expect(lightboxTransform(LIGHTBOX_FIT_VIEW)).toBe("");
    expect(lightboxTransform({ x: 10, y: -5, scale: 2 })).toBe("translate(10px, -5px) scale(2)");
  });
});

describe("lightboxSwipeVerdict", () => {
  it("reads a long drag to the left as next and to the right as previous", () => {
    expect(lightboxSwipeVerdict(-120, 10, 400)).toBe("next");
    expect(lightboxSwipeVerdict(120, -10, 400)).toBe("previous");
  });

  it("mirrors the horizontal verdict in a right-to-left page", () => {
    expect(lightboxSwipeVerdict(-120, 0, 400, { rtl: true })).toBe("previous");
    expect(lightboxSwipeVerdict(120, 0, 400, { rtl: true })).toBe("next");
  });

  it("counts a short, fast flick as a swipe", () => {
    expect(lightboxSwipeVerdict(-30, 0, 40)).toBe("next");
  });

  it("ignores a short, slow drag and a diagonal smear", () => {
    expect(lightboxSwipeVerdict(-30, 0, 600)).toBeNull();
    expect(lightboxSwipeVerdict(-90, 80, 200)).toBeNull();
  });

  it("closes on a decisive drag downward, never upward", () => {
    expect(lightboxSwipeVerdict(5, 140, 300)).toBe("close");
    expect(lightboxSwipeVerdict(5, -140, 300)).toBeNull();
    expect(lightboxSwipeVerdict(5, 140, 300, { closeOnSwipeDown: false })).toBeNull();
  });
});

describe("lightboxKeyAction", () => {
  const atFit = { zoomed: false, zoomEnabled: true };
  const zoomedIn = { zoomed: true, zoomEnabled: true };

  it("closes on Escape, zoomed or not", () => {
    expect(lightboxKeyAction({ key: "Escape" }, atFit)).toEqual({ kind: "close" });
    expect(lightboxKeyAction({ key: "Escape" }, zoomedIn)).toEqual({ kind: "close" });
  });

  it("navigates with Left and Right at fit, mirrored in RTL", () => {
    expect(lightboxKeyAction({ key: "ArrowRight" }, atFit)).toEqual({ kind: "step", delta: 1 });
    expect(lightboxKeyAction({ key: "ArrowLeft" }, atFit)).toEqual({ kind: "step", delta: -1 });
    expect(lightboxKeyAction({ key: "ArrowRight" }, { ...atFit, rtl: true })).toEqual({ kind: "step", delta: -1 });
  });

  it("pans with every arrow once zoomed, instead of leaving the photo", () => {
    expect(lightboxKeyAction({ key: "ArrowRight" }, zoomedIn)).toEqual({ kind: "pan", dx: -LIGHTBOX_PAN_STEP, dy: 0 });
    expect(lightboxKeyAction({ key: "ArrowUp" }, zoomedIn)).toEqual({ kind: "pan", dx: 0, dy: LIGHTBOX_PAN_STEP });
    expect(lightboxKeyAction({ key: "ArrowUp" }, atFit)).toBeNull();
  });

  it("zooms with + and - and resets with 0, only where zoom is enabled", () => {
    expect(lightboxKeyAction({ key: "+" }, atFit)).toEqual({ kind: "zoom", by: LIGHTBOX_ZOOM_STEP });
    expect(lightboxKeyAction({ key: "-" }, atFit)).toEqual({ kind: "zoom", by: 1 / LIGHTBOX_ZOOM_STEP });
    expect(lightboxKeyAction({ key: "0" }, zoomedIn)).toEqual({ kind: "reset" });
    expect(lightboxKeyAction({ key: "+" }, { zoomed: false, zoomEnabled: false })).toBeNull();
  });

  it("jumps to the first and last image with Home and End", () => {
    expect(lightboxKeyAction({ key: "Home" }, atFit)).toEqual({ kind: "edge", to: "first" });
    expect(lightboxKeyAction({ key: "End" }, atFit)).toEqual({ kind: "edge", to: "last" });
  });

  it("leaves browser chords, Tab, Enter and Space alone", () => {
    expect(lightboxKeyAction({ key: "+", ctrlKey: true }, atFit)).toBeNull();
    expect(lightboxKeyAction({ key: "ArrowRight", metaKey: true }, atFit)).toBeNull();
    expect(lightboxKeyAction({ key: "Tab" }, atFit)).toBeNull();
    expect(lightboxKeyAction({ key: "Enter" }, atFit)).toBeNull();
    expect(lightboxKeyAction({ key: " " }, atFit)).toBeNull();
  });
});
