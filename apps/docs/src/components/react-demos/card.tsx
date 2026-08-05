/*
 * Live React demos for /componentes/card and /en/components/card.
 *
 * Card is not a real component: every export here composes Box / Tile / Grid / Stack / Inline with
 * the content pieces, and each one renders a GRID OF THREE so the reader sees a card next to its
 * siblings: a card that only looks right alone is a card whose height, media and footer were never
 * tested. The ladder runs simple → complex, and the copy comes from `examples/card-data` so the
 * live island and the source shown beside it cannot drift apart.
 *
 * `lang` is the only prop any of these take, because an Astro island can only receive serializable
 * props and a copy dictionary keyed by locale is the smallest thing that crosses that boundary.
 */
import { Badge } from "@skryensya/react/badge";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { ImageFrame } from "@skryensya/react/image-frame";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import { Stat } from "@skryensya/react/stat";
import { TileButton } from "@skryensya/react/tile-button";
import { TileCheckbox } from "@skryensya/react/tile-checkbox";
import { TileLink } from "@skryensya/react/tile-link";
import { Heading, Link, Text } from "@skryensya/react/typography";
import type { ReactNode } from "react";
import { cardCopy, type CardLang } from "../../examples/card-data";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn(import.meta.url);

type DemoProps = { lang?: CardLang };

const stop = (event: { preventDefault: () => void }) => event.preventDefault();

/* Every example is the same grid: three lanes on desktop, collapsing on its own. Sharing it keeps
 * each demo below about the CARD and not about the collection around it. */
function CardGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Grid aria-label={label} columns={3} gap="md">
      {children}
    </Grid>
  );
}

/* 1 ─ The floor: a surface, a title, a paragraph. Box, because nothing here is interactive. */
export const CardBasicDemo = framed(function CardBasicDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.basic}>
      {c.basic.map((card) => (
        <Box as="article" border="subtle" key={card.title} padding="lg" surface="surface">
          <Stack gap="xs">
            <Heading as="h3" flush size="h4">
              {card.title}
            </Heading>
            <Text tone="secondary">{card.body}</Text>
          </Stack>
        </Box>
      ))}
    </CardGrid>
  );
});

/* 2 ─ Same Box, now with status and date above the title. Badge and Text carry the hierarchy. */
export const CardMetaDemo = framed(function CardMetaDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.meta}>
      {c.meta.map((card) => (
        <Box as="article" border="subtle" key={card.title} padding="lg" surface="surface">
          <Stack gap="sm">
            <Inline gap="sm">
              <Badge tone={card.tone}>{card.badge}</Badge>
              <Text as="span" size="caption" tone="tertiary">
                {card.date}
              </Text>
            </Inline>
            <Stack gap="xs">
              <Heading as="h3" flush size="h4">
                {card.title}
              </Heading>
              <Text tone="secondary">{card.body}</Text>
            </Stack>
          </Stack>
        </Box>
      ))}
    </CardGrid>
  );
});

/* 3 ─ Accent, softly: Box's own hooks rewritten to the accent-subtle surface. Still Box, still
 * read-only, still normal text tokens. */
export const CardAccentSoftDemo = framed(function CardAccentSoftDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.accentSoft}>
      {c.accentSoft.map((card) => (
        <Box as="article" className="sk-card-accent sk-card-accent-soft" key={card.title} padding="lg">
          <span aria-hidden="true" className="sk-card-accent__icon">
            <Icon name={card.icon} />
          </span>
          <Stack gap="xs">
            <span className="sk-card-eyebrow">{card.eyebrow}</span>
            <Heading as="h3" flush size="h4">
              {card.title}
            </Heading>
            <Text tone="secondary">{card.body}</Text>
          </Stack>
          <span className="sk-card-accent__cta">
            {card.cta} <Icon name="arrow-right" size="sm" />
          </span>
        </Box>
      ))}
    </CardGrid>
  );
});

/* 4 ─ Accent, solid: the action fill, so the text comes from the on-accent token instead of the
 * text ramp. The contrast partner changes, so the token has to change with it. */
export const CardAccentSolidDemo = framed(function CardAccentSolidDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.accentSolid}>
      {c.accentSolid.map((card) => (
        <Box as="article" className="sk-card-accent sk-card-accent-solid" key={card.title} padding="lg">
          <span aria-hidden="true" className="sk-card-accent__icon">
            <Icon name={card.icon} />
          </span>
          <Stack gap="xs">
            <span className="sk-card-eyebrow">{card.eyebrow}</span>
            <Heading as="h3" flush size="h4">
              {card.title}
            </Heading>
            <Text>{card.body}</Text>
          </Stack>
          <span className="sk-card-accent__cta">
            {card.cta} <Icon name="arrow-right" size="sm" />
          </span>
        </Box>
      ))}
    </CardGrid>
  );
});

/* 5 ─ Stat supplies the metric, Box supplies the card. Stat never grows a `card` variant. */
export const CardStatDemo = framed(function CardStatDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.stat}>
      {c.stat.map((card) => (
        <Box as="article" border="subtle" key={card.label} padding="lg" surface="surface">
          <Stat
            change={
              <>
                <Icon name={card.trend === "up" ? "arrow-up" : "arrow-down"} size="sm" /> {card.change}
              </>
            }
            label={card.label}
            trend={card.trend}
            value={card.value}
          />
        </Box>
      ))}
    </CardGrid>
  );
});

/* 6 ─ First interactive rung. The whole surface goes to ONE destination, so the root is the anchor
 * itself: no stretched-link CSS, no `onClick` on a div. */
export const CardLinkDemo = framed(function CardLinkDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.link}>
      {c.link.map((card) => (
        <TileLink href="#" key={card.title} onClick={stop} padding="lg">
          <span className="sk-card-link-head">
            <span aria-hidden="true" className="sk-card-link-icon">
              <Icon name={card.icon} />
            </span>
            <span aria-hidden="true" className="sk-card-link-chevron">
              <Icon name="chevron-right" size="sm" />
            </span>
          </span>
          <span className="sk-tile__content">
            <span className="sk-tile__title">{card.title}</span>
            <span className="sk-tile__description">{card.body}</span>
          </span>
        </TileLink>
      ))}
    </CardGrid>
  );
});

/* 7 ─ Same geometry, different platform element: this one DOES something, so it is a button. */
export const CardActionDemo = framed(function CardActionDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.action}>
      {c.action.map((card) => (
        <TileButton key={card.title} padding="lg" type="button">
          <span className="sk-card-link-head">
            <span aria-hidden="true" className="sk-card-link-icon">
              <Icon name={card.icon} />
            </span>
          </span>
          <span className="sk-tile__content">
            <span className="sk-tile__title">{card.title}</span>
            <span className="sk-tile__description">{card.body}</span>
          </span>
        </TileButton>
      ))}
    </CardGrid>
  );
});

/* 8 ─ And a preference is a checkbox: same surface again, but the state is the platform's. */
export const CardSelectDemo = framed(function CardSelectDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.select}>
      {c.select.map((card) => (
        <TileCheckbox defaultChecked={card.checked} key={card.title} padding="lg">
          <span className="sk-tile__content">
            <span className="sk-tile__title">{card.title}</span>
            <span className="sk-tile__description">{card.body}</span>
          </span>
        </TileCheckbox>
      ))}
    </CardGrid>
  );
});

/* 9 ─ Media enters. The frame goes flush to the edge because the Box already clips; the body gets
 * its inset back from a consumer class, since Box's padding would have inset the photo too. */
export const CardMediaDemo = framed(function CardMediaDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.media}>
      {c.media.map((card) => (
        <Box as="article" border="subtle" className="sk-card-media" key={card.title} surface="surface">
          <ImageFrame alt={card.alt} aspect="16/9" radius="none" src={card.src} />
          <div className="sk-card-body">
            <Badge tone="accent">{card.badge}</Badge>
            <Heading as="h3" flush size="h4">
              {card.title}
            </Heading>
            <Text tone="secondary">{card.body}</Text>
          </div>
        </Box>
      ))}
    </CardGrid>
  );
});

/* 10 ─ The wash: caption over photo. The gradient sizes itself to the TYPE it protects, not to a
 * percentage of the image, which is why the caption is the box and the gradient fills it. */
export const CardGradientDemo = framed(function CardGradientDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.gradient}>
      {c.gradient.map((card) => (
        <Box as="article" className="sk-card-gradient" key={card.title} surface="surface">
          <ImageFrame aspect="3/4" radius="none">
            <img alt={card.alt} className="sk-image-frame__media" src={card.src} />
            <div className="sk-media-caption" data-edge="bottom">
              <div aria-hidden="true" className="sk-media-gradient" data-strength={card.strength} />
              <span className="sk-card-eyebrow">{card.eyebrow}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          </ImageFrame>
        </Box>
      ))}
    </CardGrid>
  );
});

/* 11 ─ Media + wash + navigation, all three at once: a TileLink at padding none so the photo reaches
 * the edge, and the title still names the link. */
export const CardMediaLinkDemo = framed(function CardMediaLinkDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.mediaLink}>
      {c.mediaLink.map((card) => (
        <TileLink href="#" key={card.title} onClick={stop} padding="none">
          <ImageFrame alt={card.alt} aspect="16/9" as="span" radius="none">
            <img alt={card.alt} className="sk-image-frame__media" src={card.src} />
            <span className="sk-media-caption" data-edge="bottom">
              <span aria-hidden="true" className="sk-media-gradient" data-strength="lg" />
              <span className="sk-card-eyebrow">{card.eyebrow}</span>
            </span>
          </ImageFrame>
          <span className="sk-card-body">
            <span className="sk-tile__title">{card.title}</span>
            <span className="sk-tile__description">{card.body}</span>
            <Inline as="span" gap="xs">
              {c.cta.read} <Icon name="arrow-right" size="sm" />
            </Inline>
          </span>
        </TileLink>
      ))}
    </CardGrid>
  );
});

/* 12 ─ The top of the ladder, and the one that proves the rule: two INDEPENDENT decisions live
 * here, so the root cannot be a Tile. A link and a button inside an anchor would be invalid HTML. */
export const CardProductDemo = framed(function CardProductDemo({ lang = "es" }: DemoProps) {
  const c = cardCopy[lang];
  return (
    <CardGrid label={c.labels.product}>
      {c.product.map((card) => (
        <Box as="article" border="subtle" className="sk-card-plan" key={card.title} padding="lg" surface="surface">
          <Stack gap="md">
            <Stack gap="xs">
              <Badge tone={card.tone}>{card.badge}</Badge>
              <Heading as="h3" flush size="h4">
                {card.title}
              </Heading>
              <Text tone="secondary">{card.body}</Text>
            </Stack>
            <div className="sk-card-price">
              <span className="sk-card-price__value">{card.price}</span>
              <span className="sk-card-price__period">{card.period}</span>
            </div>
            <Inline gap="sm" justify="between">
              <Link href="#" onClick={stop}>
                {c.cta.details}
              </Link>
              <Button type="button" variant="primary">
                {c.cta.add}
              </Button>
            </Inline>
          </Stack>
        </Box>
      ))}
    </CardGrid>
  );
});
