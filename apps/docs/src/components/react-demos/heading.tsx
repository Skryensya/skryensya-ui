/*
 * Live React demo for the authored Heading flush stage. The other Heading demos are tree-driven;
 * flush stays an island because it wraps dialog chrome no signature emits.
 */
import { Heading } from "@skryensya/react/heading";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame — see `framed.tsx`. */
const framed = framedIn(import.meta.url);

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
