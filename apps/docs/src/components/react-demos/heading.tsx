/*
 * Live React demos for /components/heading. Each export is a self-contained island (no function
 * props crossing the Astro boundary), mounted directly from the page with a bare
 * `<HeadingDisplayDemo client:load />`.
 */
import { Heading } from "@skryensya/react/heading";
import { Text } from "@skryensya/react/text";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const HeadingDisplayDemo = framed(function HeadingDisplayDemo() {
  return (
    <div className="sk-stack" data-gap="xs">
      <Heading size="display-lg">The platform is ready</Heading>
      <Heading size="display-md">The platform is ready</Heading>
      <Heading size="display-sm">The platform is ready</Heading>
    </div>
  );
});

export const HeadingDocumentDemo = framed(function HeadingDocumentDemo() {
  return (
    <div className="sk-stack" data-gap="xs">
      <Heading size="h1">The platform is ready</Heading>
      <Heading size="h2">The platform is ready</Heading>
      <Heading size="h3">The platform is ready</Heading>
      <Heading size="h4">The platform is ready</Heading>
    </div>
  );
});

export const HeadingPageTitleDemo = framed(function HeadingPageTitleDemo() {
  return (
    <header className="sk-stack" data-gap="sm">
      <Text as="span" size="caption" tone="tertiary" weight="label">
        OPERACIONES · MAYO 2026
      </Text>
      <Heading as="h1" size="display-md">
        The platform is ready for the next deployment
      </Heading>
      <Text size="lg" tone="secondary">
        A page title communicates the result before the person read the details.
      </Text>
    </header>
  );
});

export const HeadingOutlineDemo = framed(function HeadingOutlineDemo() {
  return (
    <section className="sk-stack" data-gap="lg">
      <Heading as="h2" size="h2">
        Deployment status
      </Heading>
      <section className="sk-stack" data-gap="sm">
        <Heading as="h3" size="h3">
          Regiones listas
        </Heading>
        <Text size="sm" tone="secondary">
          Frankfurt and São Paulo already receive traffic.
        </Text>
      </section>
      <section className="sk-stack" data-gap="sm">
        <Heading as="h3" size="h3">
          Next verification
        </Heading>
        <Text size="sm" tone="secondary">
          Check latency after traffic change.
        </Text>
      </section>
    </section>
  );
});

export const HeadingCompactDemo = framed(function HeadingCompactDemo() {
  return (
    <section className="sk-stack" data-gap="xs">
      <Heading as="h2" size="h4">
        Storage usage
      </Heading>
      <Text size="sm" tone="secondary">
        The semantic level is still h2 although the panel needs the visual floor (h4).
      </Text>
    </section>
  );
});

export const HeadingFlushDemo = framed(function HeadingFlushDemo() {
  return (
    <header
      className="sk-dialog__header"
      style={{
        maxInlineSize: "24rem",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <Heading as="h3" size="h3" flush className="sk-dialog__title">
        Delete this project?
      </Heading>
    </header>
  );
});
