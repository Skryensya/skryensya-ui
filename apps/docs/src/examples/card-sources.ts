/*
 * THE SOURCE SHOWN BESIDE EACH CARD EXAMPLE, built from the same data the live demo renders.
 *
 * Written as builders rather than as hand-kept string literals for one reason: there are eleven
 * examples, each is a grid of THREE cards, and each exists in two locales and two bindings. Kept by
 * hand that is ninety-six blocks of markup to keep in agreement with a live island, and docs whose
 * source block disagrees with the demo beside it are worse than docs with no source block.
 *
 * The HTML spells the three cards out, because HTML has no loop and a reader copying one card wants
 * to see the card. The React source maps over a `cards` array, because that IS what a consumer would
 * write and what the demo does.
 */
import type { CardCopy } from "./card-data";

export type CardSource = { html: string; react: string };

/** The Vanilla enhancer's checkbox indicator, identical in every selection tile. */
const indicators = `<span
        class="sk-checkbox__indicator"
        data-state="checked"
      ><span data-sk-icon="check" data-sk-icon-size="sm"></span></span>
      <span
        class="sk-checkbox__indicator"
        data-state="indeterminate"
      ><span data-sk-icon="remove" data-sk-icon-size="sm"></span></span>`;

/** Wrap three cards in the collection every example shares. */
function grid(label: string, cards: string[]) {
  return `<section class="sk-grid" data-columns="3" data-gap="md" aria-label="${label}">
${cards.join("\n")}
</section>`;
}

/** Serialize a data array back into the `const cards = [...]` header the React source opens with. */
function reactData(rows: Array<Record<string, unknown>>) {
  const body = rows
    .map((row) => {
      const fields = Object.entries(row)
        .map(([key, value]) => `${key}: ${typeof value === "string" ? JSON.stringify(value) : value}`)
        .join(", ");
      return `  { ${fields} },`;
    })
    .join("\n");
  return `const cards = [\n${body}\n];`;
}

export function cardSources(c: CardCopy): Record<string, CardSource> {
  return {
    /* ── 1. Plain content, the actual floor ────────────────────────────────────────────── */
    plainMedia: {
      html: grid(
        c.labels.plainMedia,
        c.plainMedia.map(
          (card) => `  <article class="sk-stack" data-gap="sm">
    <div class="sk-image-frame" data-aspect="16/9" data-fit="cover">
      <img class="sk-image-frame__media" src="${card.src}" alt="${card.alt}" />
    </div>
    <div class="sk-stack" data-gap="xs">
      <h3 class="sk-heading" data-size="h4" data-flush>${card.title}</h3>
      <p class="sk-text" data-tone="secondary">${card.body}</p>
    </div>
  </article>`,
        ),
      ),
      react: `import { ImageFrame } from "@skryensya/react/image-frame";
import { Grid, Stack } from "@skryensya/react/layout";
import { Heading, Text } from "@skryensya/react/typography";

/* No sk-box anywhere: Stack itself is the root, on an <article>. There is no surface, no border
 * and no padding to ask for. ImageFrame keeps its OWN default radius instead of one "none" that
 * relied on a surface clipping it: drop this into a Box later and the frame's radius is the one
 * to zero out, not the one to add. */

${reactData(c.plainMedia)}

function Example() {
  return (
    <Grid aria-label="${c.labels.plainMedia}" columns={3} gap="md">
      {cards.map((card) => (
        <Stack as="article" gap="sm" key={card.title}>
          <ImageFrame alt={card.alt} aspect="16/9" src={card.src} />
          <Stack gap="xs">
            <Heading as="h3" flush size="h4">{card.title}</Heading>
            <Text tone="secondary">{card.body}</Text>
          </Stack>
        </Stack>
      ))}
    </Grid>
  );
}`,
    },

    /* ── 2. Box, one step up: adds a surface ───────────────────────────────────────────── */
    basic: {
      html: grid(
        c.labels.basic,
        c.basic.map(
          (card) => `  <article class="sk-box" data-surface="surface" data-border="subtle" data-padding="lg">
    <div class="sk-stack" data-gap="xs">
      <h3 class="sk-heading" data-size="h4" data-flush>${card.title}</h3>
      <p class="sk-text" data-tone="secondary">${card.body}</p>
    </div>
  </article>`,
        ),
      ),
      react: `import { Box, Grid, Stack } from "@skryensya/react/layout";
import { Heading, Text } from "@skryensya/react/typography";

${reactData(c.basic)}

function Example() {
  return (
    <Grid aria-label="${c.labels.basic}" columns={3} gap="md">
      {cards.map((card) => (
        <Box as="article" border="subtle" key={card.title} padding="lg" surface="surface">
          <Stack gap="xs">
            <Heading as="h3" flush size="h4">{card.title}</Heading>
            <Text tone="secondary">{card.body}</Text>
          </Stack>
        </Box>
      ))}
    </Grid>
  );
}`,
    },

    /* ── 3. Box + status and date ──────────────────────────────────────────────────────── */
    meta: {
      html: grid(
        c.labels.meta,
        c.meta.map(
          (card) => `  <article class="sk-box" data-surface="surface" data-border="subtle" data-padding="lg">
    <div class="sk-stack" data-gap="sm">
      <div class="sk-inline" data-gap="sm">
        <span class="sk-badge" data-tone="${card.tone}">${card.badge}</span>
        <span class="sk-text" data-size="caption" data-tone="tertiary">${card.date}</span>
      </div>
      <div class="sk-stack" data-gap="xs">
        <h3 class="sk-heading" data-size="h4" data-flush>${card.title}</h3>
        <p class="sk-text" data-tone="secondary">${card.body}</p>
      </div>
    </div>
  </article>`,
        ),
      ),
      react: `import { Badge } from "@skryensya/react/badge";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import { Heading, Text } from "@skryensya/react/typography";

${reactData(c.meta)}

function Example() {
  return (
    <Grid aria-label="${c.labels.meta}" columns={3} gap="md">
      {cards.map((card) => (
        <Box as="article" border="subtle" key={card.title} padding="lg" surface="surface">
          <Stack gap="sm">
            <Inline gap="sm">
              <Badge tone={card.tone}>{card.badge}</Badge>
              <Text as="span" size="caption" tone="tertiary">{card.date}</Text>
            </Inline>
            <Stack gap="xs">
              <Heading as="h3" flush size="h4">{card.title}</Heading>
              <Text tone="secondary">{card.body}</Text>
            </Stack>
          </Stack>
        </Box>
      ))}
    </Grid>
  );
}`,
    },

    /* ── 4. Box + Stat ─────────────────────────────────────────────────────────────────── */
    stat: {
      html: grid(
        c.labels.stat,
        c.stat.map(
          (card) => `  <article class="sk-box" data-surface="surface" data-border="subtle" data-padding="lg">
    <div class="sk-stat">
      <span class="sk-stat__label">${card.label}</span>
      <span class="sk-stat__value">${card.value}</span>
      <span class="sk-stat__change" data-trend="${card.trend}">
        <span data-sk-icon="arrow-${card.trend}" data-sk-icon-size="sm"></span> ${card.change}
      </span>
    </div>
  </article>`,
        ),
      ),
      react: `import { Icon } from "@skryensya/react/icon";
import { Box, Grid } from "@skryensya/react/layout";
import { Stat } from "@skryensya/react/stat";

${reactData(c.stat)}

function Example() {
  return (
    <Grid aria-label="${c.labels.stat}" columns={3} gap="md">
      {cards.map((card) => (
        <Box as="article" border="subtle" key={card.label} padding="lg" surface="surface">
          <Stat
            change={<><Icon name={\`arrow-\${card.trend}\`} size="sm" /> {card.change}</>}
            label={card.label}
            trend={card.trend}
            value={card.value}
          />
        </Box>
      ))}
    </Grid>
  );
}`,
    },

    /* ── 5. TileLink ───────────────────────────────────────────────────────────────────── */
    link: {
      html: grid(
        c.labels.link,
        c.link.map(
          (card) => `  <a class="sk-tile sk-tile--interactive sk-interactive" data-padding="lg" href="#">
    <span class="sk-card-link-head">
      <span class="sk-card-link-icon" aria-hidden="true">
        <span data-sk-icon="${card.icon}"></span>
      </span>
      <span class="sk-card-link-chevron" aria-hidden="true">
        <span data-sk-icon="chevron-right" data-sk-icon-size="sm"></span>
      </span>
    </span>
    <span class="sk-tile__content">
      <span class="sk-tile__title">${card.title}</span>
      <span class="sk-tile__description">${card.body}</span>
    </span>
  </a>`,
        ),
      ),
      react: `import { Icon } from "@skryensya/react/icon";
import { Grid } from "@skryensya/react/layout";
import { TileLink } from "@skryensya/react/tile-link";

${reactData(c.link)}

function Example() {
  return (
    <Grid aria-label="${c.labels.link}" columns={3} gap="md">
      {cards.map((card) => (
        <TileLink href={card.href} key={card.title} padding="lg">
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
    </Grid>
  );
}`,
    },

    /* ── 6. TileButton ─────────────────────────────────────────────────────────────────── */
    action: {
      html: grid(
        c.labels.action,
        c.action.map(
          (card) => `  <button class="sk-tile sk-tile--interactive sk-interactive" data-padding="lg" type="button">
    <span class="sk-card-link-head">
      <span class="sk-card-link-icon" aria-hidden="true">
        <span data-sk-icon="${card.icon}"></span>
      </span>
    </span>
    <span class="sk-tile__content">
      <span class="sk-tile__title">${card.title}</span>
      <span class="sk-tile__description">${card.body}</span>
    </span>
  </button>`,
        ),
      ),
      react: `import { Icon } from "@skryensya/react/icon";
import { Grid } from "@skryensya/react/layout";
import { TileButton } from "@skryensya/react/tile-button";

${reactData(c.action)}

function Example() {
  return (
    <Grid aria-label="${c.labels.action}" columns={3} gap="md">
      {cards.map((card) => (
        <TileButton key={card.title} onClick={card.onSelect} padding="lg">
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
    </Grid>
  );
}`,
    },

    /* ── 7. TileCheckbox ───────────────────────────────────────────────────────────────── */
    select: {
      html: grid(
        c.labels.select,
        c.select.map(
          (card, index) => `  <label
    class="sk-tile sk-tile--interactive sk-interactive"
    data-padding="lg"
    data-sk-tile-checkbox
    data-scope="tile"
    data-part="root"
    data-name="prefs"
    data-value="pref-${index + 1}"
    data-default-checked="${card.checked}"
  >
    <input type="checkbox" data-part="input" />
    <span class="sk-tile__content" data-part="content">
      <span class="sk-tile__title">${card.title}</span>
      <span class="sk-tile__description">${card.body}</span>
    </span>
    <span class="sk-checkbox__control sk-interactive" data-part="indicator" aria-hidden="true">
      ${indicators}
    </span>
  </label>`,
        ),
      ),
      react: `import { Grid } from "@skryensya/react/layout";
import { TileCheckbox } from "@skryensya/react/tile-checkbox";

${reactData(c.select)}

function Example() {
  return (
    <Grid aria-label="${c.labels.select}" columns={3} gap="md">
      {cards.map((card) => (
        <TileCheckbox defaultChecked={card.checked} key={card.title} name="prefs" padding="lg" value={card.title}>
          <span className="sk-tile__content">
            <span className="sk-tile__title">{card.title}</span>
            <span className="sk-tile__description">{card.body}</span>
          </span>
        </TileCheckbox>
      ))}
    </Grid>
  );
}`,
    },

    /* ── 8. Box + ImageFrame ───────────────────────────────────────────────────────────── */
    media: {
      html: grid(
        c.labels.media,
        c.media.map(
          (card) => `  <article class="sk-box sk-card-media" data-surface="surface" data-border="subtle">
    <div class="sk-image-frame" data-aspect="16/9" data-radius="none" data-fit="cover">
      <img class="sk-image-frame__media" src="${card.src}" alt="${card.alt}" />
    </div>
    <div class="sk-card-body">
      <span class="sk-badge" data-tone="accent">${card.badge}</span>
      <h3 class="sk-heading" data-size="h4" data-flush>${card.title}</h3>
      <p class="sk-text" data-tone="secondary">${card.body}</p>
    </div>
  </article>`,
        ),
      ),
      react: `import { Badge } from "@skryensya/react/badge";
import { ImageFrame } from "@skryensya/react/image-frame";
import { Box, Grid } from "@skryensya/react/layout";
import { Heading, Text } from "@skryensya/react/typography";

/* The Box carries NO padding: its overflow already clips, so an ImageFrame at radius "none"
 * fills the top edge and inherits the corner. The text block gets its inset back from
 * .sk-card-body { padding: var(--space-inset-lg) }: padding on the root would inset the photo. */

${reactData(c.media)}

function Example() {
  return (
    <Grid aria-label="${c.labels.media}" columns={3} gap="md">
      {cards.map((card) => (
        <Box as="article" border="subtle" className="sk-card-media" key={card.title} surface="surface">
          <ImageFrame alt={card.alt} aspect="16/9" radius="none" src={card.src} />
          <div className="sk-card-body">
            <Badge tone="accent">{card.badge}</Badge>
            <Heading as="h3" flush size="h4">{card.title}</Heading>
            <Text tone="secondary">{card.body}</Text>
          </div>
        </Box>
      ))}
    </Grid>
  );
}`,
    },

    /* ── 9. Media + gradient wash ──────────────────────────────────────────────────────── */
    gradient: {
      html: grid(
        c.labels.gradient,
        c.gradient.map(
          (card) => `  <article class="sk-box sk-card-gradient" data-surface="surface">
    <div class="sk-image-frame" data-aspect="3/4" data-radius="none" data-fit="cover">
      <img class="sk-image-frame__media" src="${card.src}" alt="${card.alt}" />
      <div class="sk-media-caption" data-edge="bottom">
        <div class="sk-media-gradient" data-strength="${card.strength}" aria-hidden="true"></div>
        <span class="sk-card-eyebrow">${card.eyebrow}</span>
        <h3>${card.title}</h3>
        <p>${card.body}</p>
      </div>
    </div>
  </article>`,
        ),
      ),
      react: `import { ImageFrame } from "@skryensya/react/image-frame";
import { Box, Grid } from "@skryensya/react/layout";

/* The wash sizes itself to the CAPTION, not to a percentage of the photo: the caption is the box
 * and the gradient absolutely fills it, fading away from its edge. Strength is opacity and tint,
 * never how much of the image is covered. */

${reactData(c.gradient)}

function Example() {
  return (
    <Grid aria-label="${c.labels.gradient}" columns={3} gap="md">
      {cards.map((card) => (
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
    </Grid>
  );
}`,
    },

    /* ── 10. Media + gradient + navigation ─────────────────────────────────────────────── */
    mediaLink: {
      html: grid(
        c.labels.mediaLink,
        c.mediaLink.map(
          (card) => `  <a class="sk-tile sk-tile--interactive sk-interactive" data-padding="none" href="#">
    <span class="sk-image-frame" data-aspect="16/9" data-radius="none" data-fit="cover">
      <img class="sk-image-frame__media" src="${card.src}" alt="${card.alt}" />
      <span class="sk-media-caption" data-edge="bottom">
        <span class="sk-media-gradient" data-strength="lg" aria-hidden="true"></span>
        <span class="sk-card-eyebrow">${card.eyebrow}</span>
      </span>
    </span>
    <span class="sk-card-body">
      <span class="sk-tile__title">${card.title}</span>
      <span class="sk-tile__description">${card.body}</span>
      <span class="sk-inline" data-gap="xs">
        ${c.cta.read}
        <span data-sk-icon="arrow-right" data-sk-icon-size="sm"></span>
      </span>
    </span>
  </a>`,
        ),
      ),
      react: `import { Icon } from "@skryensya/react/icon";
import { ImageFrame } from "@skryensya/react/image-frame";
import { Grid, Inline } from "@skryensya/react/layout";
import { TileLink } from "@skryensya/react/tile-link";

/* Interactive AND media AND wash. Padding "none" so the photo reaches the edge; every element
 * inside the anchor is a span, because an <a> may not contain block-level interactive content,
 * and the title is what names the link, so there is no second link inside. */

${reactData(c.mediaLink)}

function Example() {
  return (
    <Grid aria-label="${c.labels.mediaLink}" columns={3} gap="md">
      {cards.map((card) => (
        <TileLink href={card.href} key={card.title} padding="none">
          <ImageFrame aspect="16/9" as="span" radius="none">
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
              ${c.cta.read} <Icon name="arrow-right" size="sm" />
            </Inline>
          </span>
        </TileLink>
      ))}
    </Grid>
  );
}`,
    },

    /* ── 11. Box with two independent controls ─────────────────────────────────────────── */
    product: {
      html: grid(
        c.labels.product,
        c.product.map(
          (card) => `  <article class="sk-box sk-card-plan" data-surface="surface" data-border="subtle" data-padding="lg">
    <div class="sk-stack" data-gap="md">
      <div class="sk-stack" data-gap="xs">
        <span class="sk-badge" data-tone="${card.tone}">${card.badge}</span>
        <h3 class="sk-heading" data-size="h4" data-flush>${card.title}</h3>
        <p class="sk-text" data-tone="secondary">${card.body}</p>
      </div>
      <p class="sk-card-price">
        <span class="sk-card-price__value">${card.price}</span>
        <span class="sk-card-price__period">${card.period}</span>
      </p>
      <div class="sk-inline" data-gap="sm" data-justify="between">
        <a class="sk-link" href="#">${c.cta.details}</a>
        <button class="sk-button sk-interactive" data-variant="accent" type="button">
          ${c.cta.add}
        </button>
      </div>
    </div>
  </article>`,
        ),
      ),
      react: `import { Badge } from "@skryensya/react/badge";
import { Button } from "@skryensya/react/button";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import { Heading, Link, Text } from "@skryensya/react/typography";

/* TWO independent decisions live in this card (see details, and add), so the root cannot be a
 * Tile: a link and a button nested inside an anchor is invalid HTML, and a whole-surface click
 * could only ever mean one of the two. This is the case Box exists for. */

${reactData(c.product)}

function Example() {
  return (
    <Grid aria-label="${c.labels.product}" columns={3} gap="md">
      {cards.map((card) => (
        <Box as="article" border="subtle" className="sk-card-plan" key={card.title} padding="lg" surface="surface">
          <Stack gap="md">
            <Stack gap="xs">
              <Badge tone={card.tone}>{card.badge}</Badge>
              <Heading as="h3" flush size="h4">{card.title}</Heading>
              <Text tone="secondary">{card.body}</Text>
            </Stack>
            <p className="sk-card-price">
              <span className="sk-card-price__value">{card.price}</span>
              <span className="sk-card-price__period">{card.period}</span>
            </p>
            <Inline gap="sm" justify="between">
              <Link href={card.href}>${c.cta.details}</Link>
              <Button onClick={card.onAdd} variant="accent">${c.cta.add}</Button>
            </Inline>
          </Stack>
        </Box>
      ))}
    </Grid>
  );
}`,
    },
  };
}
