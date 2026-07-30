/*
 * Live React demo for the authored Grid multicol stage. Grid basic is tree-driven; multicol stays
 * an island because `data-multicol` is not a declared option.
 */
import { Box, Grid } from "@skryensya/react/layout";
import { Text } from "@skryensya/react/typography";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

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
