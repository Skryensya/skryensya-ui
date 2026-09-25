import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Real photos from Unsplash, fetched once through picsum.photos (the docs' default image source) and
 * kept under `public/demos/lightbox/` so the demos and the gates work offline, each with a square
 * 400px thumbnail beside it, drawn at a fixed 200×200 (2x for dense screens), and a `-small` copy at
 * the photo's OWN proportions (480px on the long side) that the lightbox shows blurred while the full
 * one loads: the square is a crop, and a crop is never a placeholder.
 *
 * EVERY PHOTO AT ITS OWN RATIO, never cut to one: a photo cropped to a shape it was not taken in
 * reads as broken the moment the lightbox shows it whole. So the portrait is a photo taken upright,
 * not a landscape cut down to one, and the landscapes are 3:2. Still covered: landscape, portrait, a
 * bright snowfield (where a white icon with no surface of its own would vanish) and a 240px image
 * the viewer must NOT enlarge.
 */
const DIR = "/demos/lightbox";

type Photo = {
  readonly file: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly title?: string;
  readonly description?: string;
  readonly credit?: string;
  /** Has a `-small.jpg`: every photo larger than one. The 240px puppy is its own placeholder. */
  readonly small?: boolean;
};

const photos = (t: Translate): readonly Photo[] => [
  {
    file: "fjord",
    small: true,
    width: 1800,
    height: 1200,
    alt: t("lightbox.demo.dawnAlt"),
    title: t("lightbox.demo.dawnTitle"),
    description: t("lightbox.demo.dawnDescription"),
    credit: "Alexey Topolyanskiy · Unsplash",
  },
  {
    file: "street",
    small: true,
    width: 1200,
    height: 1600,
    alt: t("lightbox.demo.forestAlt"),
    title: t("lightbox.demo.forestTitle"),
    credit: "Nicholas Swanson · Unsplash",
  },
  {
    file: "coast",
    small: true,
    width: 1800,
    height: 1200,
    alt: t("lightbox.demo.panoramaAlt"),
    title: t("lightbox.demo.panoramaTitle"),
    description: t("lightbox.demo.panoramaDescription"),
    credit: "Paul Jarvis · Unsplash",
  },
  {
    file: "waterfall",
    small: true,
    width: 1800,
    height: 1201,
    alt: t("lightbox.demo.lighthouseAlt"),
    title: t("lightbox.demo.lighthouseTitle"),
    credit: "Andrew Coelho · Unsplash",
  },
  {
    file: "snow-camp",
    small: true,
    width: 1800,
    height: 1200,
    alt: t("lightbox.demo.snowAlt"),
    description: t("lightbox.demo.snowDescription"),
    credit: "Wolfgang Lutz · Unsplash",
  },
  {
    file: "puppy",
    width: 240,
    height: 144,
    alt: t("lightbox.demo.tinyAlt"),
    description: t("lightbox.demo.tinyDescription"),
    credit: "André Spieker · Unsplash",
  },
];

const labels = (t: Translate) => ({
  label: t("lightbox.demo.label"),
  closeLabel: t("lightbox.closeLabel"),
  previousLabel: t("lightbox.previousLabel"),
  nextLabel: t("lightbox.nextLabel"),
  zoomInLabel: t("lightbox.zoomInLabel"),
  zoomOutLabel: t("lightbox.zoomOutLabel"),
  resetZoomLabel: t("lightbox.resetZoomLabel"),
  errorLabel: t("lightbox.errorLabel"),
  counterLabel: t("lightbox.counterLabel"),
});

const trigger = (opens: string, photo: Photo): UsageTree => ({
  contract: "lightbox",
  signature: "Lightbox.Trigger",
  options: {
    opens,
    triggerSrc: `${DIR}/${photo.file}.jpg`,
    triggerWidth: photo.width,
    triggerHeight: photo.height,
    ...(photo.small ? { triggerThumbnail: `${DIR}/${photo.file}-small.jpg` } : {}),
    ...(photo.title ? { triggerTitle: photo.title } : {}),
    ...(photo.description ? { triggerDescription: photo.description } : {}),
    ...(photo.credit ? { triggerCredit: photo.credit } : {}),
  },
  slots: {
    /* The thumbnail's alt names the link, and the lightbox reuses it for the full image. */
    children: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "1/1", radius: "control", src: `${DIR}/${photo.file}-thumb.jpg`, alt: photo.alt },
    },
  },
});

/*
 * A GALLERY IS THE TRIGGERS. Six thumbnails naming one lightbox's id, in page order; clicking one
 * opens the lightbox at that position. No script: the controller listens for them itself. A
 * wrapping row of fixed 200px thumbnails, not a grid: a thumbnail that grows with the stage is a
 * second copy of the photo, and the lightbox is where it gets big.
 */
export const lightboxGalleryTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm" },
      attrs: { role: "list", "aria-label": t("lightbox.demo.galleryLabel") },
      children: photos(t).map((photo) => ({
        contract: "layout",
        signature: "Stack",
        attrs: { role: "listitem" },
        children: [trigger("demo-lightbox-gallery", photo)],
      })),
    },
    {
      contract: "lightbox",
      signature: "Lightbox",
      options: { lightboxId: "demo-lightbox-gallery", ...labels(t) },
    },
  ],
});

/* One photo: no counter, no arrows, nothing a single image does not need. */
export const lightboxSingleTree = (t: Translate): UsageTree => {
  const photo = photos(t)[2]!;
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      trigger("demo-lightbox-single", photo),
      {
        contract: "lightbox",
        signature: "Lightbox",
        options: { lightboxId: "demo-lightbox-single", ...labels(t) },
      },
    ],
  };
};

/* Loop on, and a broken image in the middle: navigation carries on straight through the error. */
export const lightboxLoopTree = (t: Translate): UsageTree => {
  const [dawn, forest] = photos(t);
  const broken: Photo = {
    file: "missing",
    width: 1600,
    height: 1000,
    alt: t("lightbox.demo.brokenAlt"),
    title: t("lightbox.demo.brokenTitle"),
  };
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm" },
        children: [dawn!, broken, forest!].map((photo) => ({
          contract: "layout",
          signature: "Stack",
          children: [
            photo.file === "missing"
              ? {
                  ...trigger("demo-lightbox-loop", photo),
                  slots: {
                    children: {
                      contract: "image-frame",
                      signature: "ImageFrame",
                      options: { aspect: "1/1", radius: "control", src: `${DIR}/snow-camp-thumb.jpg`, alt: photo.alt },
                    },
                  },
                }
              : trigger("demo-lightbox-loop", photo),
          ],
        })),
      },
      {
        contract: "lightbox",
        signature: "Lightbox",
        options: { lightboxId: "demo-lightbox-loop", loop: true, ...labels(t) },
      },
    ],
  };
};

/* ImageFrame is the thumbnail's own; the lightbox's sheet brings button + loader. */
export const lightboxDemoCss = `.sk-lightbox__trigger {
  inline-size: 200px;
}`;
