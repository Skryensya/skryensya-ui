import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Two of the page's four demos. The card carousel and the control-less one convert; multi-up +
 * autoplay and the zero-JS baseline do not, and each names a different hole.
 *
 * The old card put a heading over a raw image inside ImageFrame. Its contract deliberately requires
 * exactly one of `src` or authored children, so the reachable composition uses `src` and keeps the
 * card copy in a Box + Stack body instead. The carousel's default CSS slide size still provides the
 * multi-card peek without an untyped inline `style` attr crossing into React.
 *
 * What stays authored, and why:
 *
 *   - MULTI-UP + AUTOPLAY. `--sk-carousel-slide-size` is, in the stylesheet's own words, the ONE
 *     size knob, and it is declared on `.sk-carousel` itself — a declaration on the element beats
 *     anything an ancestor could inherit down, so only an inline `style` moves it. A tree has no
 *     way to write one: there is no such option on `Carousel`, and `attrs` reach the host verbatim,
 *     which in React means a `style` STRING where React demands an object. Multi-up IS that knob.
 *     The same demo also shows `data-autoplay="3500"`, and `autoplay` is declared `boolean`
 *     (`trueValue: ""`): the validator rejects `autoplay: 3500`, so only the 4000 ms default is
 *     expressible. Two holes, either one enough.
 *   - ZERO-JS (NATIVE CSS). Its whole point is the SAME markup WITHOUT `data-sk-carousel`, so the
 *     enhancer never touches it and `::scroll-button` / `::scroll-marker` draw the controls. The
 *     emitter writes `signature.mount` on every host unconditionally — a tree cannot spell
 *     "unmounted". Its slides are otherwise reachable now, caption and all, since ImageFrame grew a
 *     `caption` slot that lets `src` and MediaCaption coexist.
 *
 * Not a blocker, though the census counted them: `sk-carousel__controls`, `__button`, `__dots`,
 * `__dot` and `__autoplay` are parts no template paints — because the ENHANCER paints them at
 * runtime, in both bindings. No demo on this page writes them by hand, so nothing here needs them.
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

/*
 * The people track. Names are written here rather than translated — a name reads the same in every
 * language — while the roles beside them are words and come from the dictionary, keyed by POSITION
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
 * it — the peek, the drag and the snap are all still there — which is exactly why this demo converts
 * and its multi-up neighbour does not.
 */
export const carouselBareTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { controls: "none" },
  attrs: { "aria-label": t("demo.carousel.team.label") },
  children: people.map((person) => personSlide(t, person)),
});
