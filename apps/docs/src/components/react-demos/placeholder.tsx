/*
 * Live React demos for /components/placeholder. Each export is a self-contained island (no
 * function props crossing the Astro boundary), mounted directly from the page with a bare
 * `<XyzDemo client:load />`.
 */
import { useEffect, useState } from "react";
import { Avatar } from "@skryensya/react/avatar";
import { Badge } from "@skryensya/react/badge";
import { Heading } from "@skryensya/react/heading";
import { ImageFrame } from "@skryensya/react/image-frame";
import { Box, Inline, Stack } from "@skryensya/react/layout";
import { Placeholder } from "@skryensya/react/placeholder";
import { Text } from "@skryensya/react/text";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

const mediaSrc = "/demos/media-gradient.svg";

function PublicationPlaceholder() {
  return (
    <Box border="subtle" padding="lg" surface="surface">
      <Stack gap="md">
        <ImageFrame aspect="16/9" border="subtle" radius="control">
          <Placeholder className="sk-image-frame__media placeholder-example__media" shape="block" />
        </ImageFrame>
        <Stack gap="sm">
          <Placeholder className="placeholder-example__line--eyebrow" />
          <Stack gap="xs">
            <Placeholder className="placeholder-example__line--title" />
            <Placeholder className="placeholder-example__line--title-short" />
          </Stack>
          <Stack gap="xs">
            <Placeholder className="placeholder-example__line--body" />
            <Placeholder className="placeholder-example__line--body-short" />
          </Stack>
          <Inline align="center" gap="sm">
            <Placeholder className="placeholder-example__avatar" shape="circle" />
            <Stack className="placeholder-example__byline-copy" gap="xs">
              <Placeholder />
              <Placeholder />
            </Stack>
          </Inline>
        </Stack>
      </Stack>
    </Box>
  );
}

/** Always-pending layout: Box + Stack + ImageFrame + Placeholder, for inspecting the geometry. */
export const PublicationPlaceholderDemo = framed(function PublicationPlaceholderDemo() {
  return (
    <div className="placeholder-example" aria-busy="true">
      <Text as="p" role="status" size="sm" tone="secondary">
        Loading post…
      </Text>
      <PublicationPlaceholder />
    </div>
  );
});

function Publication() {
  return (
    <Box as="article" aria-labelledby="publication-title" border="subtle" padding="lg" surface="surface">
      <Stack gap="md">
        <ImageFrame aspect="16/9" border="subtle" fit="cover" radius="control">
          <img alt="" className="sk-image-frame__media" src={mediaSrc} />
        </ImageFrame>
        <Stack gap="sm">
          <Badge tone="accent">Research</Badge>
          <Stack gap="xs">
            <Heading as="h3" id="publication-title" size="h3">
              When a route stops being linear
            </Heading>
            <Text tone="secondary">
              Twelve interviews show where context is lost and what signs help to recover it.
            </Text>
          </Stack>
          <Inline align="center" gap="sm">
            <Avatar name="Rocio Mora">RM</Avatar>
            <Stack gap="none">
              <Text as="span" size="sm" weight="label">
                Rocio Mora
              </Text>
              <Text as="span" size="caption" tone="tertiary">
                8 min read · updated today
              </Text>
            </Stack>
          </Inline>
        </Stack>
      </Stack>
    </Box>
  );
}

/** Waits 5s, then swaps the placeholder layout for the real content in the same space. */
export const PublicationDemo = framed(function PublicationDemo() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section aria-busy={loading} className="placeholder-example">
      <Text as="p" aria-live="polite" role="status" size="sm" tone="secondary">
        {loading ? "Loading post…" : "Post loaded."}
      </Text>
      <div className="placeholder-example__swap" data-state={loading ? "loading" : "loaded"}>
        <div aria-hidden={!loading} data-placeholder-loading>
          <PublicationPlaceholder />
        </div>
        <div aria-hidden={loading} data-placeholder-content>
          <Publication />
        </div>
      </div>
    </section>
  );
});
