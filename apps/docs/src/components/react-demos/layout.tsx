/*
 * Live React demos for /components/box, /grid, /inline, /stack, /wrapper. Each export is a
 * self-contained island (no function props crossing the Astro boundary), mounted directly
 * from the page with a bare `<XyzDemo client:load />`.
 */
import { Button } from "@skryensya/react/button";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import { Heading, Link, Text } from "@skryensya/react/typography";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const BoxBasicDemo = framed(function BoxBasicDemo() {
  return (
    <Box as="section" surface="raised" border="subtle" padding="lg">
      <h2>Summary</h2>
      <p>The content preserves the semantics of the chosen element.</p>
      <button type="button" onClick={() => {}}>
        Administrar
      </button>
    </Box>
  );
});

export const GridBasicDemo = framed(function GridBasicDemo() {
  return (
    <Grid as="section" columns={3} gap="md" aria-label="Recent projects">
      <article>Atlas Project</article>
      <article>Breeze Project</article>
      <article>Cauce Project</article>
    </Grid>
  );
});

export const GridMulticolDemo = framed(function GridMulticolDemo() {
  const notes = [
    { id: "atlas", title: "Atlas", body: "One line." },
    {
      id: "brisa",
      title: "Brisa",
      body: "This note is longer: it occupies several lines and that is why its card is taller than the other two.",
    },
    { id: "cauce", title: "Cauce", body: "Two lines of content here." },
    { id: "delta", title: "Delta", body: "Corta." },
    {
      id: "eco",
      title: "Eco",
      body: "Another card with enough text so that its height differs and the packaging in lanes is noticeable.",
    },
    { id: "faro", title: "Faro", body: "Media." },
    { id: "gala", title: "Gala", body: "Brief summary, with another rhythm." },
    {
      id: "humo",
      title: "Humo",
      body: "An additional note for occupying the fourth lane on a wide screen.",
    },
  ];

  return (
    <Grid as="section" columns={4} gap="md" data-multicol aria-label="Notas">
      {notes.map((note) => (
        <Box key={note.id} surface="surface" border="subtle" padding="md">
          <strong>{note.title}</strong>
          <Text size="sm" tone="secondary">
            {note.body}
          </Text>
        </Box>
      ))}
    </Grid>
  );
});

export const InlineActionBarDemo = framed(function InlineActionBarDemo() {
  return (
    <Box as="section" aria-labelledby="project-title" border="subtle" padding="lg" surface="raised">
      <Inline gap="md" justify="between">
        <Stack gap="none">
          <Heading as="h2" id="project-title" size="h4">
            Proyecto Atlas
          </Heading>
          <Text size="sm" tone="secondary">
            3 unpublished changes
          </Text>
        </Stack>

        <Inline gap="sm" wrap={false}>
          <Button variant="ghost" onClick={() => {}}>
            Vista previa
          </Button>
          <Button variant="primary" onClick={() => {}}>
            Publicar
          </Button>
        </Inline>
      </Inline>
    </Box>
  );
});

export const StackBasicDemo = framed(function StackBasicDemo() {
  return (
    <Stack as="section" gap="md" align="start" aria-labelledby="summary-title">
      <Heading as="h2" size="h2" id="summary-title">
        Summary
      </Heading>
      <p>The request is ready for review.</p>
      <Link href="/en/components/stack">See details</Link>
    </Stack>
  );
});

export const PrimitivesOverviewDemo = framed(function PrimitivesOverviewDemo() {
  return (
    <div className="sk-stack" data-gap="lg">
      <Box as="section" surface="raised" border="subtle" padding="lg">
        <Stack gap="md">
          <Heading as="h2" size="sm">
            Summary
          </Heading>
          <Text tone="secondary">A block with spacing, surface and hierarchy.</Text>
          <Inline gap="sm" align="baseline">
            <Link href="/en/components/primitives">See details</Link>
            <Text as="span" size="caption">
              Updated today
            </Text>
          </Inline>
        </Stack>
      </Box>

      <Grid columns={3} gap="md">
        <Box surface="surface" border="subtle" padding="md">
          Uno
        </Box>
        <Box surface="surface" border="subtle" padding="md">
          Dos
        </Box>
        <Box surface="surface" border="subtle" padding="md">
          Tres
        </Box>
      </Grid>
    </div>
  );
});

/* Wrapper's showcase is a to-scale diagram, not a live component (see wrapper.astro): no demo here. */
