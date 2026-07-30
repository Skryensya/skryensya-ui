import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The card carousel converts. Autoplay, control-less, and native-CSS variants stay authored: their
 * uncontrolled `data-*` options and pseudo-elements are the lesson.
 *
 * The old card put a heading over a raw image inside ImageFrame. Its contract deliberately requires
 * exactly one of `src` or authored children, so the reachable composition uses `src` and keeps the
 * card copy in a Box + Stack body instead. The carousel's default CSS slide size still provides the
 * multi-card peek without an untyped inline `style` attr crossing into React.
 */

const demoSrc = "/demos/media-gradient.svg";

const features = [
  ["productivity", "top"],
  ["context", "center"],
  ["analytics", "bottom"],
  ["collaboration", "left"],
] as const;

type Feature = (typeof features)[number][0];
type Position = (typeof features)[number][1];

function featureSlide(
  t: Translate,
  feature: Feature,
  position: Position,
): UsageTree {
  return {
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "none" },
      children: [
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: {
            src: demoSrc,
            alt: "",
            aspect: "16/9",
            radius: "top",
            position,
          },
        },
        {
          contract: "box",
          signature: "Box",
          options: { padding: "md" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Text",
                options: { size: "caption", tone: "tertiary", weight: "label" },
                children: t(`demo.carousel.${feature}.eyebrow` as never),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "lg", weight: "label" },
                children: t(`demo.carousel.${feature}.title` as never),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "sm", tone: "secondary" },
                children: t(`demo.carousel.${feature}.body` as never),
              },
            ],
          },
        },
      ],
    },
  };
}

/** Four feature cards over the same scroll-snap track; controls remain enhancer-owned. */
export const carouselCardsTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  attrs: { "aria-label": t("demo.carousel.label") },
  children: features.map(([feature, position]) =>
    featureSlide(t, feature, position),
  ),
});
