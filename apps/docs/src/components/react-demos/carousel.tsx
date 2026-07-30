/*
 * Live React demo for /components/carousel's "Card carousel" preview. `Carousel` renders the
 * static structure (a `<section data-sk-carousel>` + `<ul>` track) and already carries the
 * `data-sk-carousel` attribute the vanilla enhancer selects on — the controls (prev/next, dots,
 * keyboard, drag) are the enhancer's job at runtime, so this island boots it itself in a `useEffect`,
 * exactly like the vanilla bootstrap script shown below the stage.
 */
import { useEffect, useRef } from "react";
import { Box } from "@skryensya/react/layout";
import { Carousel, CarouselSlide } from "@skryensya/react/carousel";
import { Heading } from "@skryensya/react/heading";
import { ImageFrame } from "@skryensya/react/image-frame";
import { MediaCaption } from "@skryensya/react/media-gradient";
import { Text } from "@skryensya/react/text";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const demoSrc = "/demos/media-gradient.svg";

const features = [
  {
    eyebrow: "Productivity",
    title: "Search",
    body: "Find any project instantly, with live shortcuts and filters.",
    position: "top",
  },
  {
    eyebrow: "Context",
    title: "Activity",
    body: "Six months of changes in a timeline that does not lose track.",
    position: "center",
  },
  {
    eyebrow: "Analytics",
    title: "Reports",
    body: "Cohorts, scheduled export and metrics that fit on one card.",
    position: "bottom",
  },
  {
    eyebrow: "Collaboration",
    title: "Team",
    body: "Invite, assign roles and share spaces without leaving the flow.",
    position: "left",
  },
] as const;

export const CarouselCardsDemo = framed(function CarouselCardsDemo() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    void (async () => {
      const [{ initComponents }, { mountIcons }, { lucideIcons }] = await Promise.all([
        import("@skryensya/vanilla/auto"),
        import("@skryensya/vanilla/icon"),
        import("@skryensya/icons-lucide"),
      ]);
      mountIcons(document, lucideIcons);
      await initComponents();
    })();
  }, []);

  return (
    <Carousel aria-label="What's new" style={{ "--sk-carousel-slide-size": "min(85%, 22rem)" } as React.CSSProperties}>
      {features.map((f) => (
        <CarouselSlide key={f.title}>
          <Box as="article" className="carousel-card" surface="surface" border="subtle" padding="none">
            <ImageFrame aspect="16/9" radius="top" position={f.position}>
              <img className="sk-image-frame__media" src={demoSrc} alt="" />
              <MediaCaption edge="bottom" strength="md">
                <Heading as="h3" size="h4" flush>
                  {f.title}
                </Heading>
              </MediaCaption>
            </ImageFrame>
            <div className="carousel-card__body">
              <Text data-role="eyebrow">{f.eyebrow}</Text>
              <Text tone="secondary" size="sm">
                {f.body}
              </Text>
            </div>
          </Box>
        </CarouselSlide>
      ))}
    </Carousel>
  );
});
