import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The photos are generated, not stock: six small JPEGs under `public/demos/lightbox/`, each with a
 * 480px thumbnail beside it. They are chosen to be the lightbox's edge cases rather than to be pretty:
 * a 3:2 landscape, a portrait, a 3:1 panorama, a 1:2.5 tower, a near-white snowfield (where a white
 * icon with no surface of its own would vanish) and a 240px image the viewer must NOT enlarge.
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
};

const photos = (t: Translate): readonly Photo[] => [
  {
    file: "dawn-lake",
    width: 1800,
    height: 1200,
    alt: t("lightbox.demo.dawnAlt"),
    title: t("lightbox.demo.dawnTitle"),
    description: t("lightbox.demo.dawnDescription"),
    credit: t("lightbox.demo.credit"),
  },
  {
    file: "forest",
    width: 1200,
    height: 1600,
    alt: t("lightbox.demo.forestAlt"),
    title: t("lightbox.demo.forestTitle"),
    credit: t("lightbox.demo.credit"),
  },
  {
    file: "panorama",
    width: 2700,
    height: 900,
    alt: t("lightbox.demo.panoramaAlt"),
    title: t("lightbox.demo.panoramaTitle"),
    description: t("lightbox.demo.panoramaDescription"),
  },
  {
    file: "lighthouse",
    width: 800,
    height: 2000,
    alt: t("lightbox.demo.lighthouseAlt"),
    title: t("lightbox.demo.lighthouseTitle"),
  },
  {
    file: "snowfield",
    width: 1600,
    height: 1000,
    alt: t("lightbox.demo.snowAlt"),
    description: t("lightbox.demo.snowDescription"),
  },
  {
    file: "tiny",
    width: 240,
    height: 160,
    alt: t("lightbox.demo.tinyAlt"),
    description: t("lightbox.demo.tinyDescription"),
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

const trigger = (opens: string, photo: Photo, aspect: "1/1" | "3/2" = "1/1"): UsageTree => ({
  contract: "lightbox",
  signature: "Lightbox.Trigger",
  options: {
    opens,
    triggerSrc: `${DIR}/${photo.file}.jpg`,
    triggerWidth: photo.width,
    triggerHeight: photo.height,
    ...(photo.title ? { triggerTitle: photo.title } : {}),
    ...(photo.description ? { triggerDescription: photo.description } : {}),
    ...(photo.credit ? { triggerCredit: photo.credit } : {}),
  },
  slots: {
    /* The thumbnail's alt names the link, and the lightbox reuses it for the full image. */
    children: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect, radius: "control", src: `${DIR}/${photo.file}-thumb.jpg`, alt: photo.alt },
    },
  },
});

/*
 * A GALLERY IS THE TRIGGERS. Six thumbnails naming one lightbox's id, in page order; clicking one
 * opens the lightbox at that position. No script: the controller listens for them itself.
 */
export const lightboxGalleryTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "layout",
      signature: "Grid",
      options: { columns: "3", gap: "sm" },
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
      trigger("demo-lightbox-single", photo, "3/2"),
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
        signature: "Grid",
        options: { columns: "3", gap: "sm" },
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
                      options: { aspect: "1/1", radius: "control", src: `${DIR}/snowfield-thumb.jpg`, alt: photo.alt },
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

/* Grid + ImageFrame are the thumbnails' own; the lightbox's sheet brings button + loader. */
export const lightboxDemoCss = `.sk-lightbox__trigger {
  inline-size: 100%;
}`;
