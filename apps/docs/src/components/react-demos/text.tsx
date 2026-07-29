/*
 * Live React demos for /components/text.
 */
import { Heading } from "@skryensya/react/heading";
import { Text } from "@skryensya/react/text";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

export const TextTitleDemo = framed(function TextTitleDemo() {
  return (
    <header className="sk-stack" data-gap="none">
      <Text data-role="eyebrow">Integration</Text>
      <Heading as="h2" size="h3">
        Export settings
      </Heading>
      <Text data-role="subtitle">Copy the derived CSS and paste it once into your project.</Text>
    </header>
  );
});

export const TextReadingDemo = framed(function TextReadingDemo() {
  return (
    <article className="sk-stack" data-gap="sm">
      <Text as="span" data-role="eyebrow">
        Update · 5 minutes ago
      </Text>
      <Text>The deployment ended without interruptions for the people who were already using the product.</Text>
      <Text size="sm" tone="secondary">
        Version 2.18.4 is now available in Frankfurt and São Paulo.
      </Text>
    </article>
  );
});

export const TextInlineDemo = framed(function TextInlineDemo() {
  return (
    <Text>
      The <strong>Pro</strong> plan includes five active environments and preserves the reading flow within the
      same paragraph.
    </Text>
  );
});

export const TextFeedbackDemo = framed(function TextFeedbackDemo() {
  return (
    <Text role="alert" size="sm" tone="danger">
      The change could not be saved. Check the connection and try again.
    </Text>
  );
});
