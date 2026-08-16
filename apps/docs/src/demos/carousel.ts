import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The four page demos share the same Carousel contract. Authored options cover both former gaps:
 * `slideSize` writes the root custom property, `autoplayDelay` preserves the exact timer, and
 * `mounted: false` deliberately leaves the zero-JS baseline to native scroll controls.
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
  /** Adds a real, focusable "Read more" link inside the card — see `carouselFocusableTree` below. */
  href?: string,
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
              href
                ? {
                    contract: "typography",
                    signature: "Link",
                    options: { href },
                    children: t("demo.carousel.readMore"),
                  }
                : undefined,
            ].filter((node): node is Exclude<typeof node, undefined> => node !== undefined),
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

/** A narrower multi-up track advancing every 3.5 seconds. */
export const carouselAutoplayTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { autoplayDelay: 3500, slideSize: "min(65%, 22rem)" },
  attrs: { "aria-label": t("demo.carousel.label") },
  children: features.map(([feature, position]) => featureSlide(t, feature, position)),
});

/*
 * Every card is ALSO its own destination: WAI-ARIA's Carousel pattern says focus anywhere inside
 * the carousel pauses rotation, "including the next and previous slide elements" — that phrasing
 * is easy to read as "only the chrome", so this demo is the case that proves it also covers a
 * slide's OWN content. Tab into "Leer más" on any card and the rotation stops; Tab or Shift+Tab
 * back out and it resumes (unless the mouse happens to be hovering too).
 */
export const carouselFocusableTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { autoplayDelay: 3500, slideSize: "min(65%, 22rem)" },
  attrs: { "aria-label": t("demo.carousel.focusLabel") },
  children: features.map(([feature, position]) =>
    featureSlide(t, feature, position, `#${feature}`),
  ),
});

/*
 * The people track. Names are written here rather than translated (a name reads the same in every
 * language) while the roles beside them are words and come from the dictionary, keyed by POSITION
 * so renaming a person never touches a key. The initials are the names' own, which is why they are
 * written beside them instead of derived: two words do not always give two letters.
 */
const people = [
  ["first", "Ada Lovelace", "AL"],
  ["second", "Grace Hopper", "GH"],
  ["third", "Radia Perlman", "RP"],
  ["fourth", "Barbara McClintock", "BM"],
  ["fifth", "Karen Spärck Jones", "KS"],
] as const;

function personSlide(
  t: Translate,
  [position, name, initials]: (typeof people)[number],
): UsageTree {
  return {
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "lg" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { size: "lg", name },
            children: initials,
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Text",
                options: { weight: "label" },
                children: name,
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "sm", tone: "secondary" },
                children: t(`demo.carousel.person.${position}.role` as never),
              },
            ],
          },
        ],
      },
    },
  };
}

/**
 * The bare track: `controls: "none"` turns off BOTH layers, the enhancer's buttons and dots and the
 * native pseudo-elements, and what is left is still a scroller with snap.
 *
 * It runs at the default slide size instead of the narrower one its hand-written version set inline,
 * because that width is the knob no tree can reach (see the header). Nothing of the lesson goes with
 * it (the peek, the drag and the snap are all still there), which is exactly why this demo converts
 * and its multi-up neighbour does not.
 */
export const carouselBareTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { controls: "none" },
  attrs: { "aria-label": t("demo.carousel.team.label") },
  children: people.map((person) => personSlide(t, person)),
});

/** Same scroll-snap markup with the enhancer intentionally absent. */
export const carouselNativeTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: false },
  attrs: { "aria-label": t("demo.carousel.nativeLabel") },
  children: features.slice(0, 3).map(([feature, position]) => ({
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: {
        src: demoSrc,
        alt: "",
        aspect: "16/9",
        position,
      },
      slots: {
        caption: {
          contract: "media-gradient",
          signature: "MediaCaption",
          children: {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", weight: "label" },
            children: t(`demo.carousel.${feature}.title` as never),
          },
        },
      },
    },
  })),
});
